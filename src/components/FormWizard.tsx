import React, { useState } from "react";
import { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry } from "../types";
import { Plus, Trash2, ArrowRight, ArrowLeft, Lightbulb, Check, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FormWizardProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  hasGenerated: boolean;
}

const STEPS = [
  { title: "Contact", desc: "How to reach you" },
  { title: "Education", desc: "Where you studied" },
  { title: "Experience", desc: "What you've worked on" },
  { title: "Projects", desc: "What you've built" },
  { title: "Skills", desc: "What you're good at" },
  { title: "Review & AI", desc: "Polish & Download" },
];

export default function FormWizard({
  data,
  onChange,
  activeStep,
  setActiveStep,
  onGenerate,
  isGenerating,
  hasGenerated,
}: FormWizardProps) {
  // Local state for skill tag input
  const [skillInput, setSkillInput] = useState("");

  const updatePersonalDetails = (field: string, value: string) => {
    onChange({
      ...data,
      personalDetails: {
        ...data.personalDetails,
        [field]: value,
      },
    });
  };

  // repeatable Education helpers
  const addEducation = () => {
    const newEdu: EducationEntry = {
      id: crypto.randomUUID(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      startEndYear: "",
      gpa: "",
    };
    onChange({
      ...data,
      education: [...data.education, newEdu],
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      education: data.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  // repeatable Experience helpers
  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      dates: "",
      description: "",
    };
    onChange({
      ...data,
      experiences: [...data.experiences, newExp],
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter((exp) => exp.id !== id),
    });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      experiences: data.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  // repeatable Projects helpers
  const addProject = () => {
    const newProj: ProjectEntry = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      link: "",
    };
    onChange({
      ...data,
      projects: [...data.projects, newProj],
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((proj) => proj.id !== id),
    });
  };

  const updateProject = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      projects: data.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  // Skill chip input helpers
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = skillInput.trim().replace(/,$/, "");
      if (cleaned && !data.skills.includes(cleaned)) {
        onChange({
          ...data,
          skills: [...data.skills, cleaned],
        });
      }
      setSkillInput("");
    }
  };

  const addSkillChip = () => {
    const cleaned = skillInput.trim();
    if (cleaned && !data.skills.includes(cleaned)) {
      onChange({
        ...data,
        skills: [...data.skills, cleaned],
      });
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((s) => s !== skillToRemove),
    });
  };

  const nextStep = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Top Wizard Navigation */}
      <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-4">
          {STEPS.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className="flex items-center gap-2 shrink-0 group focus:outline-hidden"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  activeStep === idx
                    ? "bg-indigo-600 text-white shadow-xs"
                    : idx < activeStep
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
                }`}
              >
                {idx < activeStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="text-left hidden sm:block">
                <p
                  className={`text-xs font-semibold leading-none ${
                    activeStep === idx ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                  {step.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="p-6 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* STEP 1: PERSONAL DETAILS */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-2">
                  <h2 className="text-lg font-bold text-slate-900">Personal Details</h2>
                  <p className="text-xs text-slate-500">
                    Provide your contact info. This is placed right at the top of your resume.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={data.personalDetails.fullName}
                      onChange={(e) => updatePersonalDetails("fullName", e.target.value)}
                      placeholder="e.g. Liam Smith"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={data.personalDetails.email}
                      onChange={(e) => updatePersonalDetails("email", e.target.value)}
                      placeholder="e.g. liam@example.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      value={data.personalDetails.phone}
                      onChange={(e) => updatePersonalDetails("phone", e.target.value)}
                      placeholder="e.g. (555) 019-2834"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Location</label>
                    <input
                      type="text"
                      value={data.personalDetails.location}
                      onChange={(e) => updatePersonalDetails("location", e.target.value)}
                      placeholder="e.g. Chicago, IL"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      LinkedIn Link <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={data.personalDetails.linkedin || ""}
                      onChange={(e) => updatePersonalDetails("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Portfolio / GitHub <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={data.personalDetails.portfolio || ""}
                      onChange={(e) => updatePersonalDetails("portfolio", e.target.value)}
                      placeholder="github.com/username"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EDUCATION */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-2 flex justify-between items-end">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Education</h2>
                    <p className="text-xs text-slate-500">
                      Add details about your degree, high school, or certifications.
                    </p>
                  </div>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add School</span>
                  </button>
                </div>

                {data.education.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200/80">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No education entries added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">Add at least one school or university.</p>
                    <button
                      onClick={addEducation}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add First School
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.education.map((edu, index) => (
                      <div
                        key={edu.id}
                        className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 space-y-4 relative group"
                      >
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                          School #{index + 1}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">School / College Name</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                              placeholder="e.g. State University"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Degree / Certification</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                              placeholder="e.g. Bachelor of Science"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Field of Study</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                              placeholder="e.g. Computer Science"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <label className="text-xs font-semibold text-slate-700">Start & End Year</label>
                              <span className="text-[10px] text-slate-400">e.g. 2021 - 2025</span>
                            </div>
                            <input
                              type="text"
                              value={edu.startEndYear}
                              onChange={(e) => updateEducation(edu.id, "startEndYear", e.target.value)}
                              placeholder="e.g. 2020 - 2024"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">
                              GPA / Percentage <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              value={edu.gpa || ""}
                              onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                              placeholder="e.g. 3.8/4.0"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: EXPERIENCE */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-2 flex justify-between items-end">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
                    <p className="text-xs text-slate-500">
                      Write simple, raw descriptions of what you did. The AI will build bullet points.
                    </p>
                  </div>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                </div>

                {data.experiences.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200/80">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No work experience added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">Optional. Ideal for showcasing past jobs.</p>
                    <button
                      onClick={addExperience}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Experience
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.experiences.map((exp, index) => (
                      <div
                        key={exp.id}
                        className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 space-y-4 relative group"
                      >
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                          Role #{index + 1}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Job Title</label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                              placeholder="e.g. Retail Associate"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Company / Store Name</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                              placeholder="e.g. Target"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Dates (Start - End)</label>
                            <input
                              type="text"
                              value={exp.dates}
                              onChange={(e) => updateExperience(exp.id, "dates", e.target.value)}
                              placeholder="e.g. June 2022 - Present"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                What did you do? <span className="text-[10px] text-slate-400 font-normal">(Just one simple sentence)</span>
                              </label>
                              <div className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                <span>AI will write professional bullets from this!</span>
                              </div>
                            </div>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                              placeholder="e.g. I handled customer payments, solved billing complaints, and kept shelves stocked."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: PROJECTS */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-2 flex justify-between items-end">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Projects</h2>
                    <p className="text-xs text-slate-500">
                      Great substitute for work experience! Show what you've designed or built.
                    </p>
                  </div>
                  <button
                    onClick={addProject}
                    className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {data.projects.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200/80">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No projects added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">Optional but recommended if you lack formal job history.</p>
                    <button
                      onClick={addProject}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.projects.map((proj, index) => (
                      <div
                        key={proj.id}
                        className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 space-y-4 relative group"
                      >
                        <button
                          onClick={() => removeProject(proj.id)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                          Project #{index + 1}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Project Name</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                              placeholder="e.g. Budget Tracking App"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">
                              Project Link <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                              type="url"
                              value={proj.link || ""}
                              onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                              placeholder="e.g. github.com/username/project"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-700">
                              Brief description <span className="text-[10px] text-slate-400 font-normal">(One plain sentence)</span>
                            </label>
                            <textarea
                              value={proj.description}
                              onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                              placeholder="e.g. Built a mobile application using React Native to help college students track their monthly expenses."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: SKILLS */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-2">
                  <h2 className="text-lg font-bold text-slate-900">Skills & Key Keywords</h2>
                  <p className="text-xs text-slate-500">
                    Just enter simple keyword tags (e.g., Excel, customer service, teamwork, Python).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Type a skill and press Enter or comma..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-hidden placeholder:text-slate-300"
                    />
                    <button
                      onClick={addSkillChip}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Skills container */}
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50/55 rounded-xl border border-slate-100 min-h-[100px]">
                    {data.skills.length === 0 ? (
                      <p className="text-xs text-slate-400 italic m-auto">
                        Your skills list is empty. Add a few keywords!
                      </p>
                    ) : (
                      data.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-full px-3 py-1 text-xs font-medium shadow-2xs hover:border-red-200 hover:bg-red-50/20 group transition-all"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-slate-400 group-hover:text-red-500 font-bold transition-colors cursor-pointer"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Suggested skills */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Popular entry-level skills to consider:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Microsoft Excel", "Customer Service", "Time Management", "Project Planning", "Data Entry", "Social Media", "Teamwork", "Problem Solving"].map(
                        (sug) => {
                          const exists = data.skills.includes(sug);
                          return (
                            <button
                              key={sug}
                              onClick={() => {
                                if (!exists) {
                                  onChange({ ...data, skills: [...data.skills, sug] });
                                }
                              }}
                              disabled={exists}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${
                                exists
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              }`}
                            >
                              {exists ? "✓ Added" : `+ ${sug}`}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & GENERATE */}
            {activeStep === 5 && (
              <div className="space-y-5">
                <div className="border-b border-slate-50 pb-2">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                    Review & AI Spark
                  </h2>
                  <p className="text-xs text-slate-500">
                    Let Gemini process your fields, generate beautiful summaries, and expand experience bullet points!
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-linear-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    What AI Will Do Automatically
                  </h3>
                  <ul className="space-y-2 text-xs text-indigo-950/80">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0">•</span>
                      <span>Draft a 2-3 sentence confident professional summary tailored to your education and skills.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0">•</span>
                      <span>Convert each of your short job sentences into polished, high-impact bullet points with metrics.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0">•</span>
                      <span>Structure everything in a beautiful single-column, completely ATS-safe layout.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={onGenerate}
                    disabled={isGenerating || !data.personalDetails.fullName}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white shadow-md bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-hidden disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Polishing with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{hasGenerated ? "Regenerate AI Resume Content" : "Generate AI Resume Content"}</span>
                      </>
                    )}
                  </button>

                  {!data.personalDetails.fullName && (
                    <div className="bg-red-50 border border-red-100 text-red-800 text-xs rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <span>You must add your <strong>Full Name</strong> in the Contact step before generating.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={activeStep === 0}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors py-2 px-3 focus:outline-hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {activeStep < STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-2xs hover:shadow-sm transition-all focus:outline-hidden"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 font-semibold italic">Ready to make it professional!</span>
        )}
      </div>
    </div>
  );
}
