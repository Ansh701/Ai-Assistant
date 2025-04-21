import { createWorker } from 'tesseract.js';

// Function to extract text from image using Tesseract.js
export async function extractTextFromImage(imageSource: string): Promise<string> {
  try {
    // Create and load worker with language
    const worker = await createWorker('eng');
    
    // Recognize text
    const { data: { text } } = await worker.recognize(imageSource);
    
    // Terminate worker
    await worker.terminate();
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from image');
  }
}
