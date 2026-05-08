import { useEffect, useRef, memo } from "react";
import { useAppSelector } from "@/app/store";
import type { Message } from "@/entities/chat/model/types/types.ts";
import styles from "./MessageList.module.css";

interface MessageItemProps {
  message: Message;
}

const MessageItem = memo(function MessageItem({ message }: MessageItemProps) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`${styles.messageWrapper} ${styles[message.sender]}`}>
      <div className={styles.messageBubble}>{message.content}</div>
      <span className={styles.messageTime}>{time}</span>
    </div>
  );
});

export function MessageList() {
  const messages = useAppSelector((state) => state.chat.messages);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className={styles.messageList} ref={listRef}>
      {messages.length === 0 ? (
        <div className={styles.emptyState}>No messages yet</div>
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))
      )}
    </div>
  );
}
