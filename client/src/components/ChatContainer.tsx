import { useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import EmptyState from "./EmptyState";
import TypingIndicator from "./TypingIndicator";
import { Message } from "@/hooks/use-chat";

interface ChatContainerProps {
  messages: Message[];
  isProcessing: boolean;
  isEmpty: boolean;
}

export default function ChatContainer({
  messages,
  isProcessing,
  isEmpty,
}: ChatContainerProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  return (
    <main
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto pt-16 pb-20 px-4 hide-scrollbar"
      id="chat-container"
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 pt-2 pb-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isUser={message.role === "user"}
            />
          ))}
          {isProcessing && <TypingIndicator />}
        </div>
      )}
    </main>
  );
}
