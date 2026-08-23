import { z } from "zod";

/**
 * Schema for a single generated interview question
 */
export const GeneratedQuestionSchema = z.object({
  type: z.enum(["TECHNICAL", "TRICKY", "PRACTICAL"]),
  question: z.string().min(10),
  competency: z.string().min(3),
  expectedAnswerGuidance: z.string().min(10),
});

/**
 * Schema for the AI response containing all generated questions
 * Note: We validate for at least 1 question and handle count validation in provider
 */
export const GeneratedQuestionsResponseSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(1),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type GeneratedQuestionsResponse = z.infer<typeof GeneratedQuestionsResponseSchema>;
