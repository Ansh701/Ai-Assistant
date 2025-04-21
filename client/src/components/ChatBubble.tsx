import { Message } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatBubbleProps {
  message: Message;
  isUser: boolean;
}

export default function ChatBubble({ message, isUser }: ChatBubbleProps) {
  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : ""}`}>
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] p-3 rounded-lg shadow",
          isUser
            ? "chat-bubble-user bg-primary text-white rounded-tr-none"
            : "chat-bubble-ai bg-white dark:bg-slate-800 rounded-tl-none"
        )}
      >
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Uploaded content"
              className="w-full h-auto rounded"
            />
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={cn(
            "text-xs mt-1",
            isUser
              ? "text-primary-200 text-right"
              : "text-slate-500 dark:text-slate-400"
          )}
        >
          {format(new Date(message.timestamp), "h:mm a")}
        </div>
      </div>
    </div>
  );
}
