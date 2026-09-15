import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Type } from "@google/genai";
import { generateContentWithFallback } from "./_lib/gemini-client.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { resumeData } = req.body;

    const systemInstruction = `
      You are an expert career coach and ATS auditor.
      Analyze the provided resume details and generate encouragement alongside highly actionable suggestions on how the user can make their resume more competitive in the current job market.
      Keep your tone warm, encouraging, and clear (no dense recruiting jargon or overwhelming instructions).
      Provide:
      1. A professional resume strength score from 0 to 100.
      2. 2-3 specific strengths of their current resume content.
      3. 3 actionable, specific improvement tips based on the fields they provided, including an example of how to make each change.
      4. 3-4 recommended industry-specific or soft skills relevant to their role/skills that they should consider adding or developing.
    `;

    const prompt = `
      Analyze this polished resume for the current job market:
      
      Resume Details:
      Summary: ${resumeData.aiGenerated?.summary || ""}
      Skills: ${(resumeData.skills || []).join(", ")}
      Education count: ${(resumeData.education || []).length}
      Experience entries: ${JSON.stringify(resumeData.experiences || [])}
      Projects count: ${(resumeData.projects || []).length}
    `;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengthScore: {
              type: Type.INTEGER,
              description: "A grade from 0 to 100 reflecting the completeness and professional impact of the content."
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 encouraging bullets outlining what is already strong."
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "e.g., 'Impact Metrics', 'Section Gaps', 'Keyword Tuning'" },
                  tip: { type: Type.STRING, description: "A highly clear, encouraging advice statement." },
                  example: { type: Type.STRING, description: "A concrete before/after or add-on example." }
                },
                required: ["category", "tip", "example"]
              }
            },
            recommendedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 standard, high-demand skills matching this candidate's space."
            }
          },
          required: ["strengthScore", "strengths", "suggestions", "recommendedSkills"]
        }
      }
    });

    const resultText = response.text || "{}";
    return res.status(200).json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating career feedback:", error);
    return res.status(500).json({ error: error.message || "Failed to generate career feedback" });
  }
}
