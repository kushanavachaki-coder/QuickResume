import React from "react";
import { CareerFeedback } from "../types";
import { Award, CheckCircle, Flame, ArrowRight, BookOpen, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

interface FeedbackPanelProps {
  feedback: CareerFeedback;
  isLoading: boolean;
}

export default function FeedbackPanel({ feedback, isLoading }: FeedbackPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-slate-200 rounded-sm w-1/3" />
        <div className="h-20 bg-slate-100 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
          <div className="h-4 bg-slate-200 rounded-sm w-5/6" />
        </div>
      </div>
    );
  }

  // Choose a color and message for the score
  const score = feedback.strengthScore;
  let scoreColor = "text-amber-500 bg-amber-50 border-amber-100";
  let scoreText = "Good Start";
  
  if (score >= 85) {
    scoreColor = "text-emerald-500 bg-emerald-50 border-emerald-100";
    scoreText = "Highly Competitive";
  } else if (score >= 70) {
    scoreColor = "text-indigo-500 bg-indigo-50 border-indigo-100";
    scoreText = "Solid Content";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
    >
      {/* Header with gradient badge */}
      <div className="bg-linear-to-r from-indigo-50 to-purple-50/50 px-6 py-4 border-b border-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-indigo-600" />
              <span>Career & ATS Feedback</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Personalized career suggestions generated directly by Gemini AI based on your details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreColor} flex items-center gap-1.5 shrink-0`}>
              <Flame className="w-3.5 h-3.5" />
              <span>{scoreText} ({score}/100)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* STRENGTHS */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Key Strengths Detected
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {feedback.strengths.map((str, idx) => (
                <div key={idx} className="bg-emerald-50/20 border border-emerald-100/30 rounded-lg p-3 text-xs text-slate-700 font-medium">
                  {str}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUGGESTIONS FOR IMPROVEMENT */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Actionable Tips to Improve
            </h4>
            <div className="space-y-3">
              {feedback.suggestions.map((sug, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-sm">
                      {sug.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {sug.tip}
                  </p>
                  <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-700 not-italic block mb-0.5 text-[10px]">Example Implementation:</span>
                    {sug.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECOMMENDED SKILLS TO LEARN */}
        {feedback.recommendedSkills && feedback.recommendedSkills.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              In-Demand Skills for Your Field
            </h4>
            <p className="text-[11px] text-slate-500">
              Consider researching or adding these skills if you have experience with them to get more interviews:
            </p>
            <div className="flex flex-wrap gap-2">
              {feedback.recommendedSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-50/50 border border-indigo-100/50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-semibold"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Encouraging Note */}
        <div className="text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl p-3 border border-slate-100 italic">
          "The best resumes are iterated. Feel free to jump back to any previous step, add more details, and generate a new set of career suggestions anytime!"
        </div>

      </div>
    </motion.div>
  );
}
