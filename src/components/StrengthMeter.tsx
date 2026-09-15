import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ShieldCheck, Award, Zap } from "lucide-react";
import { ResumeData } from "../types";

interface StrengthMeterProps {
  data: ResumeData;
  activeStep: number;
  goToStep: (step: number) => void;
}

export default function StrengthMeter({ data, activeStep, goToStep }: StrengthMeterProps) {
  // Define indicators
  const mustFixItems = [
    {
      id: "fullName",
      label: "Add your full name",
      done: !!data.personalDetails.fullName.trim(),
      step: 0,
    },
    {
      id: "email",
      label: "Provide an email address",
      done: !!data.personalDetails.email.trim(),
      step: 0,
    },
    {
      id: "phone",
      label: "Provide a contact phone number",
      done: !!data.personalDetails.phone.trim(),
      step: 0,
    },
    {
      id: "location",
      label: "Specify your location (City, State/Country)",
      done: !!data.personalDetails.location.trim(),
      step: 0,
    },
    {
      id: "education",
      label: "Add at least one education entry",
      done: data.education.length > 0,
      step: 1,
    },
  ];

  const recommendedItems = [
    {
      id: "skillsCount",
      label: "Add 3 or more skills (keywords)",
      done: data.skills.length >= 3,
      step: 4,
    },
    {
      id: "experience",
      label: "Add professional or volunteer experience",
      done: data.experiences.length > 0,
      step: 2,
    },
    {
      id: "summary",
      label: "AI Professional Summary generated",
      done: !!data.aiGenerated?.summary,
      step: 5,
    },
    {
      id: "linkedin",
      label: "Link your LinkedIn profile",
      done: !!data.personalDetails.linkedin?.trim(),
      step: 0,
    },
  ];

  const niceToHaveItems = [
    {
      id: "projects",
      label: "Include a project (ideal for standing out!)",
      done: data.projects.length > 0,
      step: 3,
    },
    {
      id: "portfolio",
      label: "Add your Portfolio or GitHub link",
      done: !!data.personalDetails.portfolio?.trim(),
      step: 0,
    },
  ];

  // Calculate scores
  const totalMustFix = mustFixItems.filter(i => i.done).length;
  const totalRecommended = recommendedItems.filter(i => i.done).length;
  const totalNiceToHave = niceToHaveItems.filter(i => i.done).length;

  const mustFixDone = totalMustFix === mustFixItems.length;
  const recommendedDone = totalRecommended === recommendedItems.length;

  // Let's calculate an engaging strength percentage
  // Must fix: 50% of the bar (10% each)
  // Recommended: 35% of the bar (8.75% each)
  // Nice to have: 15% of the bar (7.5% each)
  const strengthPercentage = Math.round(
    (totalMustFix / mustFixItems.length) * 50 +
    (totalRecommended / recommendedItems.length) * 35 +
    (totalNiceToHave / niceToHaveItems.length) * 15
  );

  // Determine status tier and style
  let tierLabel = "Needs Foundation";
  let tierDesc = "Complete the mandatory contact & education details to start building.";
  let tierColor = "from-amber-500 to-orange-500 text-orange-700 bg-orange-50 border-orange-100";
  let tierIcon = <AlertCircle className="w-5 h-5 text-orange-500 animate-pulse" />;

  if (mustFixDone) {
    if (strengthPercentage < 80) {
      tierLabel = "Solid Foundation";
      tierDesc = "Great job! Add skills and generate AI text to stand out to employers.";
      tierColor = "from-blue-500 to-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-100";
      tierIcon = <Zap className="w-5 h-5 text-indigo-500" />;
    } else {
      tierLabel = "Highly Competitive";
      tierDesc = "Excellent! Your resume has rich content and is optimized to pass ATS filters.";
      tierColor = "from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50 border-emerald-100";
      tierIcon = <Award className="w-5 h-5 text-emerald-600 animate-bounce" />;
    }
  }

  return (
    <div id="strength-meter-panel" className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-6">
      {/* Strength bar section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Resume Strength: <span className="font-extrabold text-indigo-600">{strengthPercentage}%</span>
          </h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-100">
            {tierIcon}
            <span>{tierLabel}</span>
          </div>
        </div>

        {/* Outer progress track */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${strengthPercentage}%`,
              backgroundImage: mustFixDone
                ? strengthPercentage >= 80
                  ? "linear-gradient(to right, #10b981, #14b8a6)"
                  : "linear-gradient(to right, #6366f1, #4f46e5)"
                : "linear-gradient(to right, #f59e0b, #ea580c)"
            }}
          />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{tierDesc}</p>
      </div>

      <hr className="border-slate-100" />

      {/* Checklist items segmented by Priority */}
      <div className="space-y-5">
        {/* Must-fix checklist */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Required Actions
          </h4>
          <ul className="space-y-2">
            {mustFixItems.map((item) => (
              <li
                key={item.id}
                onClick={() => goToStep(item.step)}
                className={`group flex items-start gap-2.5 text-xs p-1.5 rounded-md cursor-pointer transition-colors ${
                  item.done
                    ? "hover:bg-slate-50 text-slate-500"
                    : "hover:bg-amber-50/50 text-slate-700"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <span className={item.done ? "line-through text-slate-400" : "font-medium"}>
                  {item.label}
                </span>
                {!item.done && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 ml-auto transition-all" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended list */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Recommended Additions
          </h4>
          <ul className="space-y-2">
            {recommendedItems.map((item) => (
              <li
                key={item.id}
                onClick={() => goToStep(item.step)}
                className={`group flex items-start gap-2.5 text-xs p-1.5 rounded-md cursor-pointer transition-colors ${
                  item.done
                    ? "hover:bg-slate-50 text-slate-500"
                    : "hover:bg-blue-50/30 text-slate-700"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span className={item.done ? "line-through text-slate-400" : "font-medium"}>
                  {item.label}
                </span>
                {!item.done && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 ml-auto transition-all" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Nice to have list */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Nice to Have
          </h4>
          <ul className="space-y-2">
            {niceToHaveItems.map((item) => (
              <li
                key={item.id}
                onClick={() => goToStep(item.step)}
                className={`group flex items-start gap-2.5 text-xs p-1.5 rounded-md cursor-pointer transition-colors ${
                  item.done
                    ? "hover:bg-slate-50 text-slate-500"
                    : "hover:bg-emerald-50/20 text-slate-700"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <span className={item.done ? "line-through text-slate-400" : "font-medium"}>
                  {item.label}
                </span>
                {!item.done && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 ml-auto transition-all" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
