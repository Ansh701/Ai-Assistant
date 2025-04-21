import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled: boolean;
}

export default function VoiceInput({ onResult, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Initialize the Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && "SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      // Use browser prefixed version if standard isn't available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US"; // Default to English
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Event handlers for speech recognition
  useEffect(() => {
    if (!recognition) return;

    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join("");
      
      if (event.results[0].isFinal) {
        onResult(transcript);
        stopListening();
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      toast({
        title: "Voice Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive",
      });
      stopListening();
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    // Add event listeners
    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    return () => {
      // Remove event listeners
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [recognition, onResult, toast]);

  // Start listening for speech
  const startListening = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: "Error",
        description: "Failed to start voice recognition. Please try again.",
        variant: "destructive",
      });
    }
  }, [recognition, toast]);

  // Stop listening for speech
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return (
    <button
      type="button"
      className={`p-2 transition-colors duration-200 ${
        isListening 
          ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 animate-pulse" 
          : "text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400"
      }`}
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <i className="ri-mic-fill text-xl"></i>
      ) : (
        <i className="ri-mic-line text-xl"></i>
      )}
    </button>
  );
}

// Add type declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}