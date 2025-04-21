import { useState } from "react";
import Header from "@/components/Header";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import CameraScanner from "@/components/CameraScanner";
import ImagePreview from "@/components/ImagePreview";
import Footer from "@/components/Footer";
import { useChat } from "@/hooks/use-chat";

export default function Home() {
  const {
    messages,
    isProcessing,
    isCameraOpen,
    isPreviewOpen,
    previewImage,
    extractedText,
    isExtracting,
    sendMessage,
    handleImageUpload,
    handleCameraCapture,
    setIsCameraOpen,
    setIsPreviewOpen,
    useExtractedText,
    clearChat,
  } = useChat();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header onClearChat={clearChat} />
      
      <ChatContainer 
        messages={messages}
        isProcessing={isProcessing}
        isEmpty={messages.length === 0}
      />
      
      <ChatInput
        onSendMessage={sendMessage}
        onImageUpload={handleImageUpload}
        onCameraOpen={() => setIsCameraOpen(true)}
        disabled={isProcessing}
      />
      
      <CameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
      
      <ImagePreview
        imageUrl={previewImage}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onRetake={() => {
          setIsPreviewOpen(false);
          setIsCameraOpen(true);
        }}
        onUse={useExtractedText}
        isProcessing={isExtracting}
        extractedText={extractedText}
      />
      
      <Footer />
    </div>
  );
}
