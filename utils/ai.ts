import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
  // Truncate text if it's too long to avoid token limits/latency, 
  // keeping enough context for a few questions.
  const contextText = text.length > 5000 ? text.slice(0, 5000) + "..." : text;

  const prompt = `Generate 3 multiple-choice comprehension questions based on the following text. 
  Return a raw JSON array. Each object in the array should have:
  - "question" (string)
  - "options" (array of 4 strings)
  - "correctAnswerIndex" (number, 0-3)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Text: "${contextText}"\n\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING } 
              },
              correctAnswerIndex: { type: Type.INTEGER }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion[];
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return [];
  }
};
