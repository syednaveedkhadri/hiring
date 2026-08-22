"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { buildCandidateEvaluationInput } from "@/lib/ai-evaluation/input-builder";
import { getCandidateEvaluationProvider } from "@/lib/ai-evaluation/provider";
import { recalculatePositionRankings } from "@/lib/ai-evaluation/ranking";

/**
 * Evaluate a candidate with AI
 */
export async function evaluateCandidate(candidateId: string) {
  try {
    // Get candidate with position
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        position: true,
      },
    });

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Verify position has sufficient information
    if (!candidate.position.jobDescription && !candidate.position.mandatoryRequirements) {
      throw new Error(
        "Position must have job description or requirements to perform evaluation"
      );
    }

    // Build evaluation input
    const input = await buildCandidateEvaluationInput(candidateId);

    if (!input) {
      throw new Error("Failed to build candidate evaluation input");
    }

    // Get AI provider
    const provider = getCandidateEvaluationProvider();

    // Evaluate candidate
    const result = await provider.evaluateCandidate(input);

    // Create snapshots for audit
    const positionSnapshot = {
      title: input.position.title,
      department: input.position.department,
      jobDescription: input.position.jobDescription,
      mandatoryRequirements: input.position.mandatoryRequirements,
      preferredRequirements: input.position.preferredRequirements,
      minimumExperience: input.position.minimumExperience,
      preferredExperience: input.position.preferredExperience,
      salaryMin: input.position.salaryMin,
      salaryMax: input.position.salaryMax,
      currency: input.position.currency,
    };

    const candidateSnapshot = {
      fullName: input.candidate.fullName,
      currentJobTitle: input.candidate.currentJobTitle,
      currentCompany: input.candidate.currentCompany,
      totalExperience: input.candidate.totalExperience,
      relevantExperience: input.candidate.relevantExperience,
      currentSalary: input.candidate.currentSalary,
      expectedSalary: input.candidate.expectedSalary,
      salaryCurrency: input.candidate.salaryCurrency,
      noticePeriod: input.candidate.noticePeriod,
      joiningAvailability: input.candidate.joiningAvailability,
      skills: input.skills,
      education: input.education,
      certifications: input.certifications,
      employment: input.employment,
      languages: input.languages,
      interviewCount: input.interviews.length,
    };

    // Store evaluation
    const evaluation = await prisma.aIEvaluation.create({
      data: {
        candidateId,
        positionId: candidate.positionId,
        overallScore: result.overallScore,
        confidence: result.confidence,
        recommendation: result.recommendation,
        jobRequirementScore: result.scores.jobRequirements,
        experienceScore: result.scores.experience,
        skillsScore: result.scores.skills,
        technicalScore: result.scores.technical,
        interviewScore: result.scores.interview,
        practicalScore: result.scores.practical,
        salaryFitScore: result.scores.salaryFit,
        availabilityScore: result.scores.availability,
        educationScore: result.scores.education,
        certificationScore: result.scores.certifications,
        strengths: result.strengths as Prisma.InputJsonValue,
        weaknesses: result.weaknesses as Prisma.InputJsonValue,
        requirementGaps: result.requirementGaps as Prisma.InputJsonValue,
        missingInformation: result.missingInformation as Prisma.InputJsonValue,
        summary: result.summary,
        model: provider.getModel(),
        promptVersion: provider.getPromptVersion(),
        positionSnapshot: positionSnapshot as Prisma.InputJsonValue,
        candidateSnapshot: candidateSnapshot as Prisma.InputJsonValue,
      },
    });

    // Recalculate rankings for this position
    await recalculatePositionRankings(candidate.positionId);

    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath(`/positions/${candidate.positionId}`);
    revalidatePath("/rankings");
    revalidatePath(`/rankings/${candidate.positionId}`);

    return {
      success: true,
      evaluationId: evaluation.id,
      score: evaluation.overallScore,
      recommendation: evaluation.recommendation,
    };
  } catch (error) {
    console.error("Error evaluating candidate:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to evaluate candidate"
    );
  }
}

/**
 * Get latest evaluation for a candidate
 */
export async function getLatestEvaluation(candidateId: string) {
  const evaluation = await prisma.aIEvaluation.findFirst({
    where: { candidateId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      rankings: {
        orderBy: {
          recordedAt: "desc",
        },
        take: 1,
      },
    },
  });

  return evaluation;
}

/**
 * Get evaluation history for a candidate
 */
export async function getEvaluationHistory(candidateId: string) {
  const evaluations = await prisma.aIEvaluation.findMany({
    where: { candidateId },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return evaluations;
}
