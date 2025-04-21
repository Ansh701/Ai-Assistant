import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
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

  // Listen to messages from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Message;
        newMessages.push({
          ...data,
          id: doc.id,
        });
      });
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  // Function to send text message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: nanoid(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    try {
      // Add user message to Firestore
      await addDoc(collection(db, 'messages'), userMessage);
      
      setIsProcessing(true);
      
      // Call our backend API directly
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to Firestore
      await addDoc(collection(db, 'messages'), {
        id: nanoid(),
        content: data.answer,
        role: 'assistant',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      await addDoc(collection(db, 'messages'), {
        id: nanoid(),
        content: "Sorry, I couldn't generate an answer. Please try again.",
        role: 'assistant',
        timestamp: Date.now(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to send image with OCR text
  const sendImageWithText = async (imageUrl: string, extractedText: string) => {
    const userMessage: Message = {
      id: nanoid(),
      content: extractedText,
      role: 'user',
      timestamp: Date.now(),
      imageUrl,
    };

    try {
      // Add user message with image to Firestore
      await addDoc(collection(db, 'messages'), userMessage);
      
      setIsProcessing(true);
      
      // Call our backend API directly with the image
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
      
      // Add AI response to Firestore
      await addDoc(collection(db, 'messages'), {
        id: nanoid(),
        content: data.answer,
        role: 'assistant',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error sending image message:', error);
      // Add error message to chat
      await addDoc(collection(db, 'messages'), {
        id: nanoid(),
        content: "Sorry, I couldn't analyze this image. Please try again.",
        role: 'assistant',
        timestamp: Date.now(),
      });
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
    
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `images/${nanoid()}`);
      await uploadString(storageRef, previewImage, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Send message with image and text
      await sendImageWithText(downloadUrl, text);
    } catch (error) {
      console.error('Error using extracted text:', error);
    }
  };

  // Clear all messages
  const clearChat = () => {
    // For simplicity, we'll just clear the local state
    // In a real app, you'd want to properly delete messages from Firestore
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
