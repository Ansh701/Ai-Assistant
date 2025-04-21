import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoiceInput from "@/components/VoiceInput";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onImageUpload: (file: File) => void;
  onCameraOpen: () => void;
  disabled: boolean;
}

export default function ChatInput({
  onSendMessage,
  onImageUpload,
  onCameraOpen,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto resize the textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
      
      // Reset the input so the same file can be selected again
      e.target.value = "";
    }
  };

  // Handle voice input result
  const handleVoiceResult = (text: string) => {
    setMessage((prev) => {
      const newMessage = prev.trim() ? `${prev} ${text}` : text;
      
      // Update textarea height after setting new message
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      }, 0);
      
      return newMessage;
    });
    
    // Focus the textarea after voice input
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="relative">
          <Textarea
            id="message-input"
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here or use voice input..."
            disabled={disabled}
            className="w-full pr-32 resize-none min-h-[50px] max-h-[120px] bg-slate-100 dark:bg-slate-800"
            rows={1}
          />
          
          <div className="absolute right-2 bottom-2 flex space-x-1">
            <VoiceInput 
              onResult={handleVoiceResult}
              disabled={disabled}
            />
            
            <button
              type="button"
              className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400 transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Upload image"
            >
              <i className="ri-image-add-line text-xl"></i>
            </button>
            
            <button
              type="button"
              className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400 transition-colors duration-200"
              onClick={onCameraOpen}
              disabled={disabled}
              aria-label="Open camera"
            >
              <i className="ri-camera-line text-xl"></i>
            </button>
            
            <button
              type="button"
              className="p-2 text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              aria-label="Send message"
            >
              <i className="ri-send-plane-fill text-xl"></i>
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
