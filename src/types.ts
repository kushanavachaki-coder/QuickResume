export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startEndYear: string;
  gpa?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  dates: string;
  description: string; // One plain-language sentence
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string; // One plain-language sentence
  link?: string;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  education: EducationEntry[];
  experiences: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string[];
  aiGenerated?: {
    summary: string;
    experiences: { id: string; bullets: string[] }[];
    projects: { id: string; bullets: string[] }[];
  };
}

export interface CareerSuggestion {
  category: string;
  tip: string;
  example: string;
}

export interface CareerFeedback {
  strengthScore: number;
  strengths: string[];
  suggestions: CareerSuggestion[];
  recommendedSkills: string[];
}
