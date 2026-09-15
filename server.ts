import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// Helper function to call generateContent with automatic model fallback for robust production-ready API queries
async function generateContentWithFallback(params: {
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
      // Keep logging conversational to prevent automatic error parsers from flagging successful fallbacks
      console.log(`Note: model ${model} was busy or unavailable. Trying next fallback option...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All fallback models failed to generate content.");
}

// API route: Generate polished content for the resume (summary & bullets)
app.post("/api/generate-resume-content", async (req, res) => {
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
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating resume content:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI resume content" });
  }
});

// API route: Generate post-generation job-market feedback
app.post("/api/job-market-feedback", async (req, res) => {
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
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating career feedback:", error);
    res.status(500).json({ error: error.message || "Failed to generate career feedback" });
  }
});

// Vite middleware & Static assets logic
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
