import { useAppSelector } from "@/app/store";
import { useWebSocket } from "@/entities/chat/api/useWebSocket";
import { MessageInput } from "../MessageInput";
import { MessageList } from "../MessageList";
import styles from "./ChatWindow.module.css";

const WS_URL = "wss://77.91.94.81:8000/chat/ws";

export function ChatWindow() {
  const connectionStatus = useAppSelector(
    (state) => state.chat.connectionStatus,
  );
  const { sendMessage } = useWebSocket({ url: WS_URL });

  return (
    <div className={styles.chatWindow}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chat</h1>
        <div className={styles.status}>
          <span className={`${styles.statusDot} ${styles[connectionStatus]}`} />
          {connectionStatus}
        </div>
      </header>
      <main className={styles.main}>
        <MessageList />
        <MessageInput onSend={sendMessage} />
      </main>
    </div>
  );
}
