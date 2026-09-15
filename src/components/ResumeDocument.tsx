import React from "react";
import { ResumeData } from "../types";
import { Mail, Phone, MapPin, Linkedin, Globe, AlertCircle, FileText } from "lucide-react";

interface ResumeDocumentProps {
  data: ResumeData;
}

export default function ResumeDocument({ data }: ResumeDocumentProps) {
  const { personalDetails, education, experiences, projects, skills, aiGenerated } = data;

  // Find AI bullet points for an experience entry
  const getExperienceBullets = (id: string, defaultDesc: string) => {
    if (aiGenerated) {
      const generated = aiGenerated.experiences.find((exp) => exp.id === id);
      if (generated && generated.bullets.length > 0) {
        return generated.bullets;
      }
    }
    // Fallback if AI hasn't generated bullets yet
    return defaultDesc ? [defaultDesc] : [];
  };

  // Find AI bullet points for a project
  const getProjectBullets = (id: string, defaultDesc: string) => {
    if (aiGenerated) {
      const generated = aiGenerated.projects.find((proj) => proj.id === id);
      if (generated && generated.bullets.length > 0) {
        return generated.bullets;
      }
    }
    // Fallback
    return defaultDesc ? [defaultDesc] : [];
  };

  const hasContent = personalDetails.fullName || education.length > 0 || experiences.length > 0 || projects.length > 0 || skills.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl min-h-[500px]">
        <FileText className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 text-sm font-medium">Your resume preview will appear here.</p>
        <p className="text-slate-400 text-xs mt-1">Start entering your details in the form to see them live!</p>
      </div>
    );
  }

  return (
    <div 
      id="resume-document-paper" 
      className="bg-white text-slate-800 shadow-xl border border-slate-200/60 rounded-xl p-4 sm:p-8 md:p-12 font-sans mx-auto max-w-[800px] w-full min-h-[1050px] flex flex-col justify-between transition-all duration-300"
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
      }}
    >
      {/* Printable Area Wrapper (un-styled wrapper used for PDF/Print queries) */}
      <div id="resume-printable-area" className="w-full space-y-6 select-text text-left">
        
        {/* HEADER SECTION */}
        <div className="text-center pb-5 border-b border-slate-100">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            {personalDetails.fullName || "Your Name"}
          </h1>
          
          {/* Contact Details Grid */}
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs md:text-sm text-slate-600 font-normal">
            {personalDetails.email && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Mail className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                <span>{personalDetails.email}</span>
              </span>
            )}
            {personalDetails.phone && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                <span>{personalDetails.phone}</span>
              </span>
            )}
            {personalDetails.location && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                <span>{personalDetails.location}</span>
              </span>
            )}
            {personalDetails.linkedin && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Linkedin className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                <span>{personalDetails.linkedin}</span>
              </span>
            )}
            {personalDetails.portfolio && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Globe className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                <span>{personalDetails.portfolio}</span>
              </span>
            )}
          </div>
        </div>

        {/* SUMMARY SECTION */}
        {(aiGenerated?.summary || personalDetails.fullName) && (
          <div className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-950 uppercase tracking-wider border-b border-slate-900 pb-1">
              Professional Summary
            </h2>
            {aiGenerated?.summary ? (
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {aiGenerated.summary}
              </p>
            ) : (
              <div className="bg-amber-50/40 border border-amber-100/60 rounded-lg p-3 text-xs text-amber-800 leading-relaxed flex items-start gap-2 print:hidden">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold">AI Summary not yet generated!</span> Tap "Generate AI Resume" on the Review step to draft a natural, confident summary based on your background.
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPERIENCE SECTION */}
        {experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-950 uppercase tracking-wider border-b border-slate-900 pb-1">
              Work Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => {
                const bullets = getExperienceBullets(exp.id, exp.description);
                const hasAIBullets = aiGenerated && aiGenerated.experiences.some((e) => e.id === exp.id);

                return (
                  <div key={exp.id} className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        {exp.title} <span className="font-normal text-slate-400">|</span> <span className="text-slate-700">{exp.company}</span>
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {exp.dates}
                      </span>
                    </div>

                    <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-700 leading-normal">
                      {bullets.map((bullet, index) => (
                        <li key={index} className="pl-0.5">
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    {!hasAIBullets && exp.description && (
                      <div className="bg-indigo-50/25 border border-indigo-100/40 rounded-md py-1.5 px-2.5 text-[11px] text-indigo-700 flex items-center gap-1.5 print:hidden">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span>This raw draft sentence will be expanded into 2–3 achievement-oriented bullets.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROJECTS SECTION */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-950 uppercase tracking-wider border-b border-slate-900 pb-1">
              Key Projects
            </h2>
            <div className="space-y-4">
              {projects.map((proj) => {
                const bullets = getProjectBullets(proj.id, proj.description);
                const hasAIBullets = aiGenerated && aiGenerated.projects.some((p) => p.id === proj.id);

                return (
                  <div key={proj.id} className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        {proj.name}
                        {proj.link && (
                          <span className="text-xs text-indigo-600 font-normal ml-2 hover:underline">
                            ({proj.link})
                          </span>
                        )}
                      </h3>
                    </div>

                    <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-700 leading-normal">
                      {bullets.map((bullet, index) => (
                        <li key={index} className="pl-0.5">
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    {!hasAIBullets && proj.description && (
                      <div className="bg-indigo-50/25 border border-indigo-100/40 rounded-md py-1.5 px-2.5 text-[11px] text-indigo-700 flex items-center gap-1.5 print:hidden">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span>Our AI will polish this project description into standard project bullets.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EDUCATION SECTION */}
        {education.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-950 uppercase tracking-wider border-b border-slate-900 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="text-xs md:text-sm">
                    <span className="font-bold text-slate-900">{edu.degree}</span> in <span className="font-semibold text-slate-800">{edu.fieldOfStudy}</span>
                    <div className="text-xs text-slate-600 font-medium">{edu.school}</div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs text-slate-500 font-medium">{edu.startEndYear}</span>
                    {edu.gpa && <span className="text-xs text-slate-600 font-normal">GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS SECTION */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-950 uppercase tracking-wider border-b border-slate-900 pb-1">
              Skills
            </h2>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
              {skills.join(" • ")}
            </p>
          </div>
        )}

      </div>

      {/* FOOTER - Professional & ATS friendly marker */}
      <div className="mt-8 text-center text-[10px] text-slate-400 print:hidden border-t border-slate-50 pt-3">
        QuickResume — Single-Column ATS-Safe Layout
      </div>
    </div>
  );
}
