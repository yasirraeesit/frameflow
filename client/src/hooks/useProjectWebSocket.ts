'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_BASE } from '../lib/api';
import { JobProgressEvent } from '@frameflow/shared';

export function useProjectWebSocket(projectId: string) {
  const [lastEvent, setLastEvent] = useState<JobProgressEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const ws = new WebSocket(`${WS_BASE}/ws`);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'subscribe', projectId }));
    };

    ws.onmessage = (messageEvent) => {
      try {
        const data = JSON.parse(messageEvent.data);
        if (data.type !== 'subscribed') {
          setLastEvent(data as JobProgressEvent);
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.warn('WebSocket connection error:', err);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', projectId }));
      }
      ws.close();
    };
  }, [projectId]);

  const send = useCallback((data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, lastEvent, send };
}

