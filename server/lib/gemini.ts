import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generates a response to a homework question using Gemini
 * @param content The text content of the question
 * @param imageBase64 Optional base64-encoded image
 * @returns The generated answer
 */
export async function generateHomeworkAnswer(
  content: string,
  imageBase64?: string
): Promise<string> {
  try {
    // Gemini pro-vision for multimodal inputs, or Gemini pro for text-only
    const modelName = imageBase64 ? 'gemini-pro-vision' : 'gemini-pro';
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Create content parts array
    const parts = [];
    
    // Add text content
    parts.push({ text: content || 'Please help me solve this problem.' });
    
    // Add image if provided
    if (imageBase64) {
      // Process image - Gemini expects base64 without the data:image prefix
      let processedImage = imageBase64;
      if (imageBase64.includes(',')) {
        processedImage = imageBase64.split(',')[1];
      }
      
      parts.push({
        inlineData: {
          data: processedImage,
          mimeType: 'image/jpeg', // Adjust as needed
        },
      });
    }

    // Create prompt
    const promptConfig = {
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
    };

    // Generate content
    const result = await model.generateContent(promptConfig);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error generating answer with Gemini:', error);
    throw error;
  }
}