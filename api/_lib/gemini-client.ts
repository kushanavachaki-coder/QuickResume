import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function generateContentWithFallback(params: {
  contents: any;
  config: any;
}) {
  const models = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.7-flash"];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Executing query with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      console.log(`Note: model ${model} was busy or unavailable. Trying next fallback option...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All fallback models failed to generate content.");
}
