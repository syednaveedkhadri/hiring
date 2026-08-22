import { z } from "zod";

/**
 * Normalizes text fields extracted from CVs
 * Handles common AI extraction issues like extra whitespace, surrounding punctuation, etc.
 */
function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;

  // Trim and remove common surrounding punctuation
  let cleaned = value.trim();
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, ""); // Remove quotes
  cleaned = cleaned.replace(/^[,;.]+|[,;.]+$/g, ""); // Remove punctuation
  cleaned = cleaned.trim();

  // Convert empty string to null
  if (cleaned === "" || cleaned.length === 0) return null;

  return cleaned;
}

/**
 * Safe email field - normalizes and catches invalid emails
 * Returns null if email is invalid instead of failing validation
 */
const safeEmail = z.preprocess(
  normalizeText,
  z.union([
    z.string().email(),
    z.string().transform(() => null), // Invalid email -> null
  ]).nullable().optional()
).catch(null);

/**
 * Safe optional text field with normalization
 */
const safeOptionalText = z.preprocess(
  normalizeText,
  z.string().nullable().optional()
);

// Skill extracted from CV
export const SkillSchema = z.object({
  name: z.string(),
  yearsExperience: z.number().nullable().optional(),
});

// Employment history entry
export const EmploymentSchema = z.object({
  company: z.string(),
  jobTitle: z.string(),
  startDate: safeOptionalText,
  endDate: safeOptionalText,
  currentlyWorking: z.boolean().default(false),
  description: safeOptionalText,
});

// Education entry
export const EducationSchema = z.object({
  qualification: z.string(),
  institution: safeOptionalText,
  specialization: safeOptionalText,
  startYear: z.number().nullable().optional(),
  endYear: z.number().nullable().optional(),
});

// Certification entry
export const CertificationSchema = z.object({
  name: z.string(),
  issuingOrganization: safeOptionalText,
  issueDate: safeOptionalText,
  expiryDate: safeOptionalText,
});

// Language entry
export const LanguageSchema = z.object({
  language: z.string(),
  proficiency: safeOptionalText,
});

// Project entry
export const ProjectSchema = z.object({
  name: z.string(),
  description: safeOptionalText,
  technologies: z.array(z.string()).optional(),
  role: safeOptionalText,
});

// Achievement entry
export const AchievementSchema = z.object({
  title: z.string(),
  description: safeOptionalText,
});

// Complete structured CV data schema
export const StructuredCVDataSchema = z.object({
  fullName: safeOptionalText,
  email: safeEmail,
  phone: safeOptionalText,
  location: safeOptionalText,
  currentCompany: safeOptionalText,
  currentJobTitle: safeOptionalText,
  totalExperienceYears: z.number().nullable().optional(),
  skills: z.array(SkillSchema).default([]),
  employment: z.array(EmploymentSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),
});

export type StructuredCVData = z.infer<typeof StructuredCVDataSchema>;
export type CVSkill = z.infer<typeof SkillSchema>;
export type CVEmployment = z.infer<typeof EmploymentSchema>;
export type CVEducation = z.infer<typeof EducationSchema>;
export type CVCertification = z.infer<typeof CertificationSchema>;
export type CVLanguage = z.infer<typeof LanguageSchema>;
export type CVProject = z.infer<typeof ProjectSchema>;
export type CVAchievement = z.infer<typeof AchievementSchema>;
