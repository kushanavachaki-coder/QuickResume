import React, { useState, useEffect } from "react";
import { ResumeData, CareerFeedback } from "./types";
import FormWizard from "./components/FormWizard";
import ResumeDocument from "./components/ResumeDocument";
import StrengthMeter from "./components/StrengthMeter";
import FeedbackPanel from "./components/FeedbackPanel";
import { Sparkles, Download, RefreshCw, Undo2, Award, CheckCircle2, ChevronRight, HelpCircle, Edit3, Eye } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const INITIAL_RESUME_DATA: ResumeData = {
  personalDetails: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "(312) 555-0143",
    location: "Chicago, IL",
    linkedin: "linkedin.com/in/alexrivera",
    portfolio: "github.com/alexrivera",
  },
  education: [
    {
      id: "edu-1",
      school: "Illinois State University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Communications",
      startEndYear: "2020 - 2024",
      gpa: "3.7/4.0",
    },
  ],
  experiences: [
    {
      id: "exp-1",
      title: "Store Assistant",
      company: "Walgreens",
      dates: "June 2022 - Present",
      description: "I worked at a pharmacy retail shop, handled customer payments, resolved cash register issues, and organized weekly inventory.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Community Food Drive Organizer Website",
      description: "Designed a simple one-page website to coordinate volunteer schedules and track food donations for local shelters.",
      link: "github.com/alexrivera/food-drive",
    },
  ],
  skills: ["Customer Service", "Billing & Payments", "Inventory Management", "Microsoft Excel", "Team Collaboration"],
};

export default function App() {
  // Main State
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem("quickresume_data");
    return saved ? JSON.parse(saved) : INITIAL_RESUME_DATA;
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Mobile tab state: 'edit' or 'preview'
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  
  // Feedback state
  const [feedback, setFeedback] = useState<CareerFeedback | null>(() => {
    const saved = localStorage.getItem("quickresume_feedback");
    return saved ? JSON.parse(saved) : null;
  });
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem("quickresume_data", JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    if (feedback) {
      localStorage.setItem("quickresume_feedback", JSON.stringify(feedback));
    }
  }, [feedback]);

  // Sync state flags on load
  useEffect(() => {
    if (resumeData.aiGenerated) {
      setHasGenerated(true);
    }
  }, [resumeData]);

  // API Trigger: Polishing with Gemini
  const handleGenerateAIResume = async () => {
    setIsGenerating(true);
    setIsFeedbackLoading(true);
    setShowFeedback(false);

    try {
      // 1. Fetch polished bullet points and summary
      const response = await fetch("/api/generate-resume-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalDetails: resumeData.personalDetails,
          education: resumeData.education,
          experiences: resumeData.experiences,
          projects: resumeData.projects,
          skills: resumeData.skills,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to polish resume content");
      }

      const generatedData = await response.json();

      const updatedResume = {
        ...resumeData,
        aiGenerated: {
          summary: generatedData.summary,
          experiences: generatedData.experiences || [],
          projects: generatedData.projects || [],
        },
      };

      setResumeData(updatedResume);
      setHasGenerated(true);
      setActiveMobileTab("preview");

      // 2. Fetch career/ATS feedback automatically based on polished resume
      const feedbackResponse = await fetch("/api/job-market-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: updatedResume }),
      });

      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while generating with AI. Please check your network and try again.");
    } finally {
      setIsGenerating(false);
      setIsFeedbackLoading(false);
    }
  };

  // Compiles and downloads a pristine, high-fidelity PDF using html2canvas and jsPDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById("resume-document-paper");
    if (!element) {
      alert("Resume element not found. Please ensure the live resume tab is selected.");
      return;
    }

    setIsDownloading(true);

    try {
      // Store original styles to ensure pristine capture
      const originalBoxShadow = element.style.boxShadow;
      const originalBorderRadius = element.style.borderRadius;
      const originalBorder = element.style.border;

      // Remove interactive shadows/borders for a clean document look
      element.style.boxShadow = "none";
      element.style.borderRadius = "0px";
      element.style.border = "none";

      const canvas = await html2canvas(element, {
        scale: 2.2, // 2.2x scale for crisp premium text printing
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 850, // lock width during capture for perfect proportions
      });

      // Restore original styles
      element.style.boxShadow = originalBoxShadow;
      element.style.borderRadius = originalBorderRadius;
      element.style.border = originalBorder;

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      // Calculate portrait aspect ratios perfectly matching US Letter/A4 size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter", // "letter" matches standard US Letter (8.5 x 11 in)
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Scale imgData to fit letter page exactly
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      
      const cleanName = resumeData.personalDetails.fullName.trim() || "Resume";
      const fileName = `${cleanName.replace(/\s+/g, "_")}_Resume.pdf`;
      pdf.save(fileName);

      if (feedback) {
        setShowFeedback(true);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("We encountered an issue generating your high-fidelity PDF. If this persists, try opening the app in a new tab.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset the resume to the sample starting profile?")) {
      setResumeData(INITIAL_RESUME_DATA);
      setFeedback(null);
      setHasGenerated(false);
      setShowFeedback(false);
      setActiveStep(0);
      localStorage.removeItem("quickresume_data");
      localStorage.removeItem("quickresume_feedback");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all fields?")) {
      setResumeData({
        personalDetails: { fullName: "", email: "", phone: "", location: "" },
        education: [],
        experiences: [],
        projects: [],
        skills: [],
      });
      setFeedback(null);
      setHasGenerated(false);
      setShowFeedback(false);
      setActiveStep(0);
      localStorage.removeItem("quickresume_data");
      localStorage.removeItem("quickresume_feedback");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex flex-col">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-100 py-3 px-6 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-serif font-black text-lg shadow-sm">
              Q
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">QuickResume</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5 uppercase">AI-Powered Writer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100"
            >
              Reset Sample
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors py-1.5 px-3 rounded-lg hover:bg-red-50/40"
            >
              Clear All
            </button>
            {hasGenerated && (
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE TAB BAR SWITCHER (Only visible on small/medium screens, hidden on lg and in print) */}
      <div className="lg:hidden bg-white border-b border-slate-100 py-2.5 px-4 sticky top-[61px] z-40 print:hidden shadow-2xs">
        <div className="flex bg-slate-100 p-1 rounded-xl max-w-md mx-auto">
          <button
            onClick={() => setActiveMobileTab('edit')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeMobileTab === 'edit'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Fields</span>
          </button>
          <button
            onClick={() => setActiveMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeMobileTab === 'preview'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Resume</span>
            {!hasGenerated && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 md:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 print:p-0 print:m-0 print:w-full print:block">
        
        {/* LEFT COLUMN: WIZARD FORM & METER */}
        <div className={`${activeMobileTab === 'edit' ? 'flex' : 'hidden'} lg:flex lg:col-span-5 space-y-6 flex-col print:hidden`}>
          {/* Step Wizard */}
          <FormWizard
            data={resumeData}
            onChange={setResumeData}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            onGenerate={handleGenerateAIResume}
            isGenerating={isGenerating}
            hasGenerated={hasGenerated}
          />

          {/* Completeness / Strength Meter */}
          <StrengthMeter
            data={resumeData}
            activeStep={activeStep}
            goToStep={setActiveStep}
          />
        </div>

        {/* RIGHT COLUMN: DOCUMENT PREVIEW */}
        <div className={`${activeMobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex lg:col-span-7 space-y-6 flex-col justify-start print:w-full print:p-0 print:m-0`}>
          
          {/* Preview Control Header */}
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Live Resume Preview
            </h3>
            
            {hasGenerated ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Polished!</span>
                </span>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Showing raw input. Step 6 polishes with AI.</span>
              </div>
            )}
          </div>

          {/* Resume Document Wrapper */}
          <div className="w-full flex-1 print:p-0 print:m-0">
            <ResumeDocument data={resumeData} />
          </div>

          {/* PRINT PDF DOWNLOAD FLOW INSTRUCTIONS (only shown if not generated yet) */}
          {hasGenerated && (
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-xs text-slate-500 leading-relaxed space-y-2 print:hidden shadow-2xs">
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-600" />
                <span>How to export your ATS-friendly PDF:</span>
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Click <strong>Download PDF</strong> above to open the print dialog.</li>
                <li>Set the printer Destination to <strong>Save as PDF</strong>.</li>
                <li>Ensure <strong>Background graphics</strong> is unchecked and Margins are set to <strong>Default</strong> or <strong>None</strong>.</li>
                <li>Click Save! You now have a pixel-perfect, selectable one-page resume.</li>
              </ol>
            </div>
          )}

          {/* JOB MARKET FEEDBACK PANEL */}
          {showFeedback && feedback && (
            <FeedbackPanel feedback={feedback} isLoading={isFeedbackLoading} />
          )}

          {/* Let's show the feedback panel on the preview screen in step 6 once generated, even if they haven't printed yet, so they don't miss this amazing feature! */}
          {hasGenerated && activeStep === 5 && !showFeedback && feedback && (
            <div className="space-y-4 pt-4 print:hidden">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-500 animate-bounce" />
                  Live Career Insights
                </h4>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5"
                >
                  <span>Expand Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <FeedbackPanel feedback={feedback} isLoading={isFeedbackLoading} />
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-xs text-slate-400 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 QuickResume. Fast, ATS-safe, AI-generated resumes.</p>
          <p className="text-[11px] text-slate-300">Inspired by Novoresume & Kickresume achievement-focused vocabulary.</p>
        </div>
      </footer>
    </div>
  );
}
