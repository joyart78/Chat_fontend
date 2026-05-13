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
  const nativeWsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryFnRef = useRef<() => void>(() => {});
  const connectionTypeRef = useRef<"socketio" | "websocket" | null>(null);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const connectNativeWebSocket = useCallback(() => {
    clearRetryTimeout();

    if (nativeWsRef.current) {
      nativeWsRef.current.close();
      nativeWsRef.current = null;
    }

    dispatch(setConnectionStatus("connecting"));

    const wsUrl = url.replace("http", "ws");
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      dispatch(setConnectionStatus("connected"));
      retryCountRef.current = 0;

      if (accessToken) {
        ws.send(JSON.stringify({ type: "auth", token: accessToken }));
      }
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
      nativeWsRef.current = null;

      if (retryCountRef.current < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCountRef.current);
        retryCountRef.current += 1;

        retryTimeoutRef.current = setTimeout(() => {
          retryFnRef.current();
        }, delay);
      }
    };

    nativeWsRef.current = ws;
  }, [url, accessToken, dispatch, baseDelay, maxRetries, clearRetryTimeout]);

  const connect = useCallback(() => {
    clearRetryTimeout();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (nativeWsRef.current) {
      nativeWsRef.current.close();
      nativeWsRef.current = null;
    }

    dispatch(setConnectionStatus("connecting"));

    const socket = io(url, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000,
    });

    socketRef.current = socket;
    connectionTypeRef.current = "socketio";

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
        console.error("Failed to parse Socket.IO message");
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);

      if (connectionTypeRef.current === "socketio") {
        connectionTypeRef.current = null;
        connectNativeWebSocket();
      } else {
        dispatch(setConnectionStatus("error"));
      }
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
  }, [url, accessToken, dispatch, baseDelay, maxRetries, clearRetryTimeout, connectNativeWebSocket]);

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
      if (nativeWsRef.current) {
        nativeWsRef.current.close();
        nativeWsRef.current = null;
      }
    };
  }, [connect, clearRetryTimeout]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message", { content });
      return true;
    }
    if (nativeWsRef.current?.readyState === WebSocket.OPEN) {
      nativeWsRef.current.send(JSON.stringify({ content }));
      return true;
    }
    return false;
  }, []);

  return { sendMessage };
}