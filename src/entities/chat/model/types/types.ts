export interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}