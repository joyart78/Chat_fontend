import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
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
  const socketRef = useRef<Socket | null>(null);
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

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    dispatch(setConnectionStatus("connecting"));

    const socket = io(url, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket"],
      reconnection: false,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      dispatch(setConnectionStatus("connected"));
      retryCountRef.current = 0;
    });

    socket.on("message", (data: unknown) => {
      try {
        const parsed = data as {
          id: string;
          content: string;
          sender: "user" | "other";
          timestamp?: number;
        };

        const message: Message = {
          id: parsed.id || crypto.randomUUID(),
          content: parsed.content,
          sender: parsed.sender,
          timestamp: parsed.timestamp || Date.now(),
        };

        dispatch(addMessage(message));
      } catch {
        console.error("Failed to parse WebSocket message");
      }
    });

    socket.on("connect_error", () => {
      dispatch(setConnectionStatus("error"));
    });

    socket.on("disconnect", () => {
      dispatch(setConnectionStatus("disconnected"));

      if (retryCountRef.current < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCountRef.current);
        retryCountRef.current += 1;

        retryTimeoutRef.current = setTimeout(() => {
          retryFnRef.current();
        }, delay);
      }
    });
  }, [url, accessToken, dispatch, baseDelay, maxRetries, clearRetryTimeout]);

  useEffect(() => {
    retryFnRef.current = connect;
  }, [connect]);

  useEffect(() => {
    retryCountRef.current = 0;
    connect();

    return () => {
      clearRetryTimeout();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect, clearRetryTimeout]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message", { content });
      return true;
    }
    return false;
  }, []);

  return { sendMessage };
}