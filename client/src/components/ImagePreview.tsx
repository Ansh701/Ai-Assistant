import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
  onUse: (extractedText: string) => void;
  isProcessing: boolean;
  extractedText: string;
}

export default function ImagePreview({
  imageUrl,
  isOpen,
  onClose,
  onRetake,
  onUse,
  isProcessing,
  extractedText,
}: ImagePreviewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-40 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={onClose}
          className="text-white p-2"
          aria-label="Go back"
        >
          <i className="ri-arrow-left-line text-xl"></i>
        </button>
        <h3 className="text-white font-medium">Review Image</h3>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-full max-h-full">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg flex items-center">
                <div className="mr-3 w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                <span>Processing text...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {!isProcessing && extractedText && (
          <div className="bg-white dark:bg-slate-800 mb-4 p-3 rounded-lg max-h-32 overflow-y-auto">
            <p className="text-sm font-medium mb-1">Extracted Text:</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {extractedText}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={onRetake}
            className="py-2 px-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
            variant="outline"
          >
            Retake
          </Button>
          <Button
            onClick={() => onUse(extractedText)}
            className="py-2 px-4"
            disabled={isProcessing || !extractedText}
          >
            Use Photo
          </Button>
        </div>
      </div>
    </div>
  );
}
