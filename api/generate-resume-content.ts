import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Type } from "@google/genai";
import { generateContentWithFallback } from "./_lib/gemini-client.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Support CORS if needed, and only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { personalDetails, education, experiences, projects, skills } = req.body;

    if (!personalDetails?.fullName) {
      return res.status(400).json({ error: "Missing required personal details: full name is mandatory." });
    }

    const systemInstruction = `
      You are an elite, professional resume writer inspired by top-tier templates like Novoresume and natural, confident, achievement-oriented phrasing from Kickresume.
      Your job is to translate short, rough, plain-language input fields from a user into a polished, high-fidelity resume.
      The user may have zero technical or professional resume-writing background, so they write extremely simple sentences.
      Your goals are:
      1. Write a short, highly professional 2-3 line 'Summary' at the top of the resume. It must be active, confident, and focus on the user's background (education, any experience, and skills). Do not use generic SaaS fluff words like "supercharge" or "empower".
      2. For each experience entry, turn their ONE plain-language sentence describing what they did into 2-3 highly polished, achievement-oriented bullet points using strong active verbs (e.g., "Led", "Designed", "Optimized", "Coordinate", "Maintained"). Make them sound impressive but true to the raw input. Where appropriate, dynamically weave in realistic metrics or outcomes (e.g., "improving customer satisfaction by 15%" or "managing a portfolio of 50+ clients").
      3. For each project entry, turn their simple description into 2-3 clean, action-driven bullet points emphasizing problem-solving and skills utilized.
      4. Avoid columns, tables, graphics, or complex formatting in the generated text. Keep bullet points concise and readable.
    `;

    const prompt = `
      Please polish this user's rough resume inputs into executive-ready resume text.
      
      User's Details:
      Name: ${personalDetails.fullName}
      Target Field / Skills: ${skills ? skills.join(", ") : "Not specified"}
      
      Education Background:
      ${JSON.stringify(education || [])}
      
      Rough Work Experience:
      ${JSON.stringify((experiences || []).map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        description: exp.description // This is the simple plain-language sentence
      })))}
      
      Rough Projects:
      ${JSON.stringify((projects || []).map((proj: any) => ({
        id: proj.id,
        name: proj.name,
        description: proj.description
      })))}
    `;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A short, engaging 2-3 sentence professional summary. Do not use generic buzzwords."
            },
            experiences: {
              type: Type.ARRAY,
              description: "Array of polished experiences matching the IDs.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 2 to 3 action-oriented, impressive bullet points summarizing their work."
                  }
                },
                required: ["id", "bullets"]
              }
            },
            projects: {
              type: Type.ARRAY,
              description: "Array of polished projects matching the IDs.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 2 polished bullet points highlighting what they built and the skills used."
                  }
                },
                required: ["id", "bullets"]
              }
            }
          },
          required: ["summary", "experiences", "projects"]
        }
      }
    });

    const resultText = response.text || "{}";
    return res.status(200).json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating resume content:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI resume content" });
  }
}
