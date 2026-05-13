import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { addMessage, setConnectionStatus } from "../model/slice/chatSlice";
import type { Message } from "../model/types/types.ts";

interface UseWebSocketOptions {
  url: string;
  maxRetries?: number;
  baseDelay?: number;
}

export function useWebSocket({
  url,
  maxRetries = 5,
  baseDelay = 1000,
}: UseWebSocketOptions) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.token.accessToken);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryFnRef = useRef<() => void>(() => {});

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    clearRetryTimeout();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = accessToken
      ? `${url.replace("http", "ws")}?token=${accessToken}`
      : url.replace("http", "ws");

    dispatch(setConnectionStatus("connecting"));

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      dispatch(setConnectionStatus("connected"));
      retryCountRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          id: string;
          content: string;
          sender: "user" | "other";
          timestamp?: number;
        };

        const message: Message = {
          id: data.id || crypto.randomUUID(),
          content: data.content,
          sender: data.sender,
          timestamp: data.timestamp || Date.now(),
        };

        dispatch(addMessage(message));
      } catch {
        console.error("Failed to parse WebSocket message");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      dispatch(setConnectionStatus("error"));
    };

    ws.onclose = () => {
      dispatch(setConnectionStatus("disconnected"));
      wsRef.current = null;

      if (retryCountRef.current < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCountRef.current);
        retryCountRef.current += 1;

        retryTimeoutRef.current = setTimeout(() => {
          retryFnRef.current();
        }, delay);
      }
    };
  }, [url, accessToken, dispatch, baseDelay, maxRetries, clearRetryTimeout]);

  useEffect(() => {
    retryFnRef.current = connect;
  }, [connect]);

  useEffect(() => {
    retryCountRef.current = 0;
    connect();

    return () => {
      clearRetryTimeout();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearRetryTimeout]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
      return true;
    }
    return false;
  }, []);

  return { sendMessage };
}