"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";

export type InterviewFormData = {
  interviewType: string;
  interviewDate: string;
  interviewerId?: string;
  interviewLocation?: string;
  overallNotes?: string;
  strengths?: string;
  concerns?: string;
  scores: Array<{
    category: string;
    score: number;
    notes?: string;
  }>;
  questions: Array<{
    question: string;
    performance?: string;
    answer?: string;
    notes?: string;
  }>;
};

/**
 * Create a new interview for a candidate
 */
export async function createInterview(
  candidateId: string,
  data: InterviewFormData
) {
  try {
    // Validate candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Validate interview type
    const validTypes = ["HR", "TECHNICAL", "MANAGERIAL", "FINAL", "PRACTICAL", "OTHER"];
    if (!validTypes.includes(data.interviewType)) {
      throw new Error("Invalid interview type");
    }

    // Validate scores
    for (const score of data.scores) {
      if (score.score < 1 || score.score > 10) {
        throw new Error(`Score must be between 1 and 10 for ${score.category}`);
      }
    }

    // Create interview with related data
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        interviewType: data.interviewType,
        interviewDate: new Date(data.interviewDate),
        interviewerId: data.interviewerId || null,
        interviewLocation: data.interviewLocation || null,
        overallNotes: data.overallNotes || null,
        strengths: data.strengths || null,
        concerns: data.concerns || null,
        status: "COMPLETED",
        scores: {
          create: data.scores.map((score) => ({
            category: score.category,
            score: score.score,
            notes: score.notes || null,
          })),
        },
        questions: {
          create: data.questions
            .filter((q) => q.question.trim().length > 0)
            .map((question) => ({
              question: question.question,
              performance: question.performance || null,
              answer: question.answer || null,
              notes: question.notes || null,
            })),
        },
      },
      include: {
        scores: true,
        questions: true,
      },
    });

    revalidatePath(`/candidates/${candidateId}`);

    return { success: true, interviewId: interview.id };
  } catch (error) {
    console.error("Error creating interview:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create interview"
    );
  }
}

/**
 * Update an existing interview
 */
export async function updateInterview(
  interviewId: string,
  candidateId: string,
  data: InterviewFormData
) {
  try {
    // Validate interview exists
    const existingInterview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        scores: true,
        questions: true,
      },
    });

    if (!existingInterview) {
      throw new Error("Interview not found");
    }

    if (existingInterview.candidateId !== candidateId) {
      throw new Error("Interview does not belong to this candidate");
    }

    // Validate interview type
    const validTypes = ["HR", "TECHNICAL", "MANAGERIAL", "FINAL", "PRACTICAL", "OTHER"];
    if (!validTypes.includes(data.interviewType)) {
      throw new Error("Invalid interview type");
    }

    // Validate scores
    for (const score of data.scores) {
      if (score.score < 1 || score.score > 10) {
        throw new Error(`Score must be between 1 and 10 for ${score.category}`);
      }
    }

    // Update interview in transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing scores and questions
      await tx.interviewScore.deleteMany({
        where: { interviewId },
      });

      await tx.interviewQuestion.deleteMany({
        where: { interviewId },
      });

      // Update interview with new data
      await tx.interview.update({
        where: { id: interviewId },
        data: {
          interviewType: data.interviewType,
          interviewDate: new Date(data.interviewDate),
          interviewerId: data.interviewerId || null,
          interviewLocation: data.interviewLocation || null,
          overallNotes: data.overallNotes || null,
          strengths: data.strengths || null,
          concerns: data.concerns || null,
          scores: {
            create: data.scores.map((score) => ({
              category: score.category,
              score: score.score,
              notes: score.notes || null,
            })),
          },
          questions: {
            create: data.questions
              .filter((q) => q.question.trim().length > 0)
              .map((question) => ({
                question: question.question,
                performance: question.performance || null,
                answer: question.answer || null,
                notes: question.notes || null,
              })),
          },
        },
      });
    });

    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath(`/candidates/${candidateId}/interviews/${interviewId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating interview:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update interview"
    );
  }
}

/**
 * Delete an interview
 */
export async function deleteInterview(interviewId: string, candidateId: string) {
  try {
    // Validate interview exists and belongs to candidate
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.candidateId !== candidateId) {
      throw new Error("Interview does not belong to this candidate");
    }

    // Delete interview (cascade will delete scores and questions)
    await prisma.interview.delete({
      where: { id: interviewId },
    });

    revalidatePath(`/candidates/${candidateId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete interview"
    );
  }
}

/**
 * Get interview details
 */
export async function getInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      candidate: {
        include: {
          position: true,
          photo: true,
        },
      },
      scores: {
        orderBy: {
          category: "asc",
        },
      },
      questions: true,
    },
  });

  return interview;
}
