import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import generateResumeContentHandler from "./api/generate-resume-content.js";
import jobMarketFeedbackHandler from "./api/job-market-feedback.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route: Generate polished content for the resume (summary & bullets)
app.post("/api/generate-resume-content", generateResumeContentHandler as any);

// API route: Generate post-generation job-market feedback
app.post("/api/job-market-feedback", jobMarketFeedbackHandler as any);

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
