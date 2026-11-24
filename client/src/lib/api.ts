export type ColdStartStatus = 'idle' | 'waking' | 'ready';

type ColdStartListener = (status: ColdStartStatus) => void;
const coldStartListeners = new Set<ColdStartListener>();

let activePendingLongRequests = 0;

export function subscribeColdStart(listener: ColdStartListener): () => void {
  coldStartListeners.add(listener);
  return () => {
    coldStartListeners.delete(listener);
  };
}

function notifyColdStart(status: ColdStartStatus) {
  coldStartListeners.forEach((fn) => {
    try {
      fn(status);
    } catch {
      // ignore listener errors
    }
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function handleSessionExpiry() {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/login') || currentPath.startsWith('/register')) return;

  try {
    localStorage.removeItem('frameflow_token');
    localStorage.removeItem('frameflow_user');
    sessionStorage.clear();
    document.cookie = 'frameflow_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'frameflow_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch {
    // ignore storage access errors
  }

  window.location.assign('/login?reason=session_expired');
}

export interface ApiFetchOptions extends RequestInit {
  skip401Redirect?: boolean;
  maxRetries?: number;
}

/**
 * Enhanced fetch client with:
 * 1. Automatic exponential backoff (up to 2 retries on network timeout / 502 / 503 Render cold start)
 * 2. Non-intrusive 3-second cold start notification event
 * 3. Global 401 session expiry guard & cleanup
 */
export async function apiFetch(input: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { skip401Redirect = false, maxRetries = 2, ...fetchOptions } = options;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const resolvedUrl = input.startsWith('/api') && apiUrl ? `${apiUrl}${input}` : input;

  const defaultHeaders: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('frameflow_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  const finalOptions: RequestInit = {
    credentials: 'include',
    ...fetchOptions,
    headers: mergedHeaders,
  };

  let isColdStartReported = false;
  const coldStartTimer = setTimeout(() => {
    isColdStartReported = true;
    activePendingLongRequests++;
    notifyColdStart('waking');
  }, 3000);

  let attempt = 0;
  let lastError: unknown = null;

  try {
    while (attempt <= maxRetries) {
      try {
        const response = await fetch(resolvedUrl, finalOptions);

        // Check for 502 / 503 (Render container waking up or routing gateway timeout)
        if ((response.status === 502 || response.status === 503) && attempt < maxRetries) {
          attempt++;
          const backoffDelay = attempt === 1 ? 1500 : 3000;
          await delay(backoffDelay);
          continue;
        }

        // Global 401 Session Expiry Guard
        if (response.status === 401 && !skip401Redirect) {
          handleSessionExpiry();
        }

        return response;
      } catch (err: unknown) {
        lastError = err;
        attempt++;
        if (attempt <= maxRetries) {
          const backoffDelay = attempt === 1 ? 1500 : 3000;
          await delay(backoffDelay);
        } else {
          throw err;
        }
      }
    }

    throw lastError || new Error('Network request failed');
  } finally {
    clearTimeout(coldStartTimer);
    if (isColdStartReported) {
      activePendingLongRequests = Math.max(0, activePendingLongRequests - 1);
      if (activePendingLongRequests === 0) {
        notifyColdStart('ready');
        setTimeout(() => {
          if (activePendingLongRequests === 0) {
            notifyColdStart('idle');
          }
        }, 1500);
      }
    }
  }
}
