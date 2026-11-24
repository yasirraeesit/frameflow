export interface StoredUser {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  planTier?: string;
}

/**
 * Returns the currently stored JWT auth token from localStorage if in a browser environment.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('frameflow_token');
  } catch {
    return null;
  }
}

/**
 * Returns the currently stored user profile object from localStorage.
 */
export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('frameflow_user');
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Checks whether an active auth token, demo session, or user payload is present.
 */
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const token = localStorage.getItem('frameflow_token');
    const demo = localStorage.getItem('frameflow_demo_user');
    const user = localStorage.getItem('frameflow_user');
    return Boolean(token || demo === 'true' || user);
  } catch {
    return false;
  }
}

/**
 * Performs a complete and resilient sign out across backend cookies and client storage.
 * 1. Dispatches POST /api/auth/logout to invalidate backend cookies.
 * 2. Purges localStorage, sessionStorage, and accessible client cookies.
 * 3. Enforces a hard navigation to /login to eliminate stale App Router client caches.
 */
export async function signOutUser(): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // 1. Dispatch backend logout request (wrapped in try/catch for fail-safe client clearing)
  try {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Backend logout request failed, proceeding with client cleanup:', err);
    }
  }

  // 2. Clear all stored auth tokens and user keys from localStorage, sessionStorage & cookies
  if (typeof window !== 'undefined') {
    const keysToRemove: readonly string[] = [
      'frameflow_token',
      'frameflow_user',
      'frameflow_demo_user',
      'token',
      'user',
      'auth_token',
    ];

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore potential cross-origin / private browsing storage restrictions
      }
    });

    try {
      sessionStorage.clear();
    } catch {
      // Ignore potential sessionStorage errors
    }

    // Expire non-httpOnly client cookies across root and hostname
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
        }
      }
    } catch {
      // Ignore cookie manipulation errors
    }

    // 3. Hard navigation to reset Next.js client router cache and memory state
    window.location.assign('/login');
  }
}
