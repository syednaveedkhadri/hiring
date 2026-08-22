import { z } from "zod";

/**
 * Evidence item schema
 */
export const EvidenceItemSchema = z.object({
  title: z.string(),
  evidence: z.string().nullable().optional(),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

/**
 * Requirement gap schema
 */
export const RequirementGapSchema = z.object({
  requirement: z.string(),
  status: z.enum(["MISSING", "PARTIAL", "UNKNOWN"]),
  evidence: z.string().nullable().optional(),
});

export type RequirementGap = z.infer<typeof RequirementGapSchema>;

/**
 * Category scores schema
 */
export const CategoryScoresSchema = z.object({
  jobRequirements: z.number().min(0).max(100).nullable().optional(),
  experience: z.number().min(0).max(100).nullable().optional(),
  skills: z.number().min(0).max(100).nullable().optional(),
  technical: z.number().min(0).max(100).nullable().optional(),
  interview: z.number().min(0).max(100).nullable().optional(),
  practical: z.number().min(0).max(100).nullable().optional(),
  salaryFit: z.number().min(0).max(100).nullable().optional(),
  availability: z.number().min(0).max(100).nullable().optional(),
  education: z.number().min(0).max(100).nullable().optional(),
  certifications: z.number().min(0).max(100).nullable().optional(),
});

export type CategoryScores = z.infer<typeof CategoryScoresSchema>;

/**
 * Confidence levels
 */
export const ConfidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

/**
 * Recommendation categories
 */
export const RecommendationSchema = z.enum([
  "EXCELLENT_MATCH",
  "STRONG_MATCH",
  "GOOD_MATCH",
  "POSSIBLE_MATCH",
  "WEAK_MATCH",
  "INSUFFICIENT_INFORMATION",
]);
export type Recommendation = z.infer<typeof RecommendationSchema>;

/**
 * Complete AI evaluation result schema
 */
export const AIEvaluationResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  confidence: ConfidenceSchema,
  recommendation: RecommendationSchema,
  scores: CategoryScoresSchema,
  strengths: z.array(EvidenceItemSchema),
  weaknesses: z.array(EvidenceItemSchema),
  requirementGaps: z.array(RequirementGapSchema),
  missingInformation: z.array(z.string()),
  summary: z.string(),
});

export type AIEvaluationResult = z.infer<typeof AIEvaluationResultSchema>;
