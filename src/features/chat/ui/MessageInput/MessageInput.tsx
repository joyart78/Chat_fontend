import { useState, useCallback, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button/Button";
import styles from "./MessageInput.module.css";

interface MessageInputProps {
  onSend: (message: string) => boolean;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;

      const sent = onSend(trimmed);
      if (sent) {
        setValue("");
      }
    },
    [value, onSend],
  );

  return (
    <form className={styles.inputWrapper} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.inputField}
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed && onSend(trimmed)) {
              setValue("");
            }
          }
        }}
      />
      <Button
        type="submit"
        className={styles.sendButton}
        disabled={!value.trim()}
      >
        Send
      </Button>
    </form>
  );
}