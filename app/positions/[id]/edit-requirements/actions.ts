"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";

export type HiringRequirementsFormData = {
  jobDescription?: string;
  mandatoryRequirements?: string;
  preferredRequirements?: string;
  minimumExperience?: number;
  preferredExperience?: number;
  requiredSkills?: string;
  preferredSkills?: string;
  educationRequirements?: string;
  certificationRequirements?: string;
  joiningAvailabilityPreference?: string;
  specialRequirements?: string;
  whatMattersMost?: string;
  majorConcerns?: string;
  aiEvaluationInstructions?: string;
};

/**
 * Check if an error is a Next.js redirect
 */
function isRedirectError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const digest = (error as { digest: unknown }).digest;
    return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
  }
  return false;
}

/**
 * Update hiring requirements for a position
 */
export async function updateHiringRequirements(
  positionId: string,
  data: HiringRequirementsFormData
) {
  try {
    // Validate position exists
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new Error("Position not found");
    }

    // Update position with hiring requirements
    await prisma.position.update({
      where: { id: positionId },
      data: {
        jobDescription: data.jobDescription?.trim() || null,
        mandatoryRequirements: data.mandatoryRequirements?.trim() || null,
        preferredRequirements: data.preferredRequirements?.trim() || null,
        minimumExperience: data.minimumExperience || null,
        preferredExperience: data.preferredExperience || null,
        requiredSkills: data.requiredSkills?.trim() || null,
        preferredSkills: data.preferredSkills?.trim() || null,
        educationRequirements: data.educationRequirements?.trim() || null,
        certificationRequirements: data.certificationRequirements?.trim() || null,
        joiningAvailabilityPreference: data.joiningAvailabilityPreference?.trim() || null,
        specialRequirements: data.specialRequirements?.trim() || null,
        whatMattersMost: data.whatMattersMost?.trim() || null,
        majorConcerns: data.majorConcerns?.trim() || null,
        aiEvaluationInstructions: data.aiEvaluationInstructions?.trim() || null,
      },
    });

    revalidatePath(`/positions/${positionId}`);
    redirect(`/positions/${positionId}`);
  } catch (error) {
    // Let Next.js redirects pass through
    if (isRedirectError(error)) {
      throw error;
    }

    // Handle actual errors
    console.error("Error updating hiring requirements:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update hiring requirements"
    );
  }
}
