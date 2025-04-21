import { useState } from 'react';
import { nanoid } from 'nanoid';
import { extractTextFromImage } from '@/lib/tesseract';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  imageUrl?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Function to send text message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    console.log("Sending message:", content);

    // Create user message
    const userMessage: Message = {
      id: nanoid(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    // Add message to local state
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      console.log("Calling backend API...");
      
      // Call our backend API directly
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      console.log("Parsing response...");
      const data = await response.json();
      console.log("Response data:", data);
      
      // Create AI response message
      const aiMessage: Message = {
        id: nanoid(),
        content: data.answer || "No answer returned from API",
        role: 'assistant',
        timestamp: Date.now(),
      };
      
      // Add AI message to local state
      setMessages(prev => [...prev, aiMessage]);
      console.log("Message sequence completed successfully");
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: nanoid(),
        content: "Sorry, I couldn't generate an answer. Please try again.",
        role: 'assistant',
        timestamp: Date.now(),
      };
      
      // Add error message to local state
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to send image with OCR text
  const sendImageWithText = async (imageUrl: string, extractedText: string) => {
    if (!extractedText.trim()) return;
    
    // Create user message with image
    const userMessage: Message = {
      id: nanoid(),
      content: extractedText,
      role: 'user',
      timestamp: Date.now(),
      imageUrl,
    };

    // Add message to local state
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Call our backend API with the image
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: extractedText,
          imageBase64: imageUrl 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create AI response message
      const aiMessage: Message = {
        id: nanoid(),
        content: data.answer || "No answer returned from API",
        role: 'assistant',
        timestamp: Date.now(),
      };
      
      // Add AI message to local state
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending image message:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: nanoid(),
        content: "Sorry, I couldn't analyze this image. Please try again.",
        role: 'assistant',
        timestamp: Date.now(),
      };
      
      // Add error message to local state
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle uploaded image
  const handleImageUpload = async (file: File) => {
    try {
      // Convert the file to base64 string for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64String = e.target.result.toString();
          setPreviewImage(base64String);
          setIsPreviewOpen(true);
          processOCR(base64String);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };

  // Function to handle camera capture
  const handleCameraCapture = (imageSrc: string) => {
    setPreviewImage(imageSrc);
    setIsCameraOpen(false);
    setIsPreviewOpen(true);
    processOCR(imageSrc);
  };

  // Process OCR on image
  const processOCR = async (imageSource: string) => {
    setIsExtracting(true);
    try {
      const text = await extractTextFromImage(imageSource);
      setExtractedText(text);
    } catch (error) {
      console.error('Error processing OCR:', error);
      setExtractedText("Error extracting text. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Use extracted text from image
  const useExtractedText = async (text: string) => {
    if (!text || !previewImage) return;
    
    setIsPreviewOpen(false);
    // Use previewImage directly for simplicity
    await sendImageWithText(previewImage, text);
  };

  // Clear all messages
  const clearChat = () => {
    setMessages([]);
  };

  return {
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
  };
}
