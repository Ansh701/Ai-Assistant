import OpenAI from "openai";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Function to generate an answer for a homework question
export async function generateHomeworkAnswer(
  question: string,
  imageBase64?: string
): Promise<string> {
  try {
    // Create message array
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful homework assistant that explains concepts clearly and shows step-by-step solutions to help students learn. Answer questions in a friendly, tutoring tone using clear explanations. If a question is about math, provide all intermediate steps. If something is unclear, ask for clarification.",
      },
    ];

    // Add user message with optional image
    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: question || "Please help me solve this problem.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: question,
      });
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Error generating answer:", error);
    throw new Error("Failed to generate answer from OpenAI");
  }
}
