"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { generateCandidateCode } from "@/lib/db/candidates";
import { uploadPhoto } from "@/lib/storage/local-storage";
import { uploadCV } from "@/lib/storage/cv-storage";

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

type SkillInput = {
  skill: string;
  yearsExperience: number | null;
};

type EducationInput = {
  qualification: string;
  institution: string | null;
  specialization: string | null;
  startYear: number | null;
  endYear: number | null;
};

type CertificationInput = {
  name: string;
  issuingOrganization: string | null;
  issueDate: string | null;
  expiryDate: string | null;
};

type LanguageInput = {
  language: string;
  proficiency: string | null;
};

type EmploymentInput = {
  company: string;
  jobTitle: string;
  startDate: string | null;
  endDate: string | null;
  currentlyWorking: boolean;
  description: string | null;
};

export type CandidateFormData = {
  // Photo
  photo: File | null;

  // Position
  positionId: string;

  // Personal Details
  fullName: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  currentCity: string | null;
  currentCountry: string | null;

  // Professional Details
  currentCompany: string | null;
  currentJobTitle: string | null;
  totalExperience: number | null;
  relevantExperience: number | null;
  currentSalary: number | null;
  expectedSalary: number | null;
  salaryCurrency: string;
  noticePeriod: string | null;
  joiningAvailability: string | null;

  // Related data
  skills: SkillInput[];
  education: EducationInput[];
  certifications: CertificationInput[];
  languages: LanguageInput[];
  employment: EmploymentInput[];
  note: string | null;
};

export async function createCandidate(formData: FormData) {
  try {
    // Extract and validate required fields
    const fullName = formData.get("fullName") as string;
    const positionId = formData.get("positionId") as string;

    if (!fullName || !positionId) {
      throw new Error("Full name and position are required");
    }

    // Validate email if provided
    const email = formData.get("email") as string | null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    // Handle photo upload
    let photoUrl: string | null = null;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadPhoto(photoFile);
    }

    // Handle CV upload
    let cvUrl: string | null = null;
    let cvFile: File | null = null;
    const cvFileInput = formData.get("cv") as File | null;
    if (cvFileInput && cvFileInput.size > 0) {
      cvUrl = await uploadCV(cvFileInput);
      cvFile = cvFileInput;
    }

    // Parse JSON fields
    const skills = JSON.parse(formData.get("skills") as string || "[]");
    const education = JSON.parse(formData.get("education") as string || "[]");
    const certifications = JSON.parse(formData.get("certifications") as string || "[]");
    const languages = JSON.parse(formData.get("languages") as string || "[]");
    const employment = JSON.parse(formData.get("employment") as string || "[]");

    // Generate candidate code
    const candidateCode = await generateCandidateCode();

    // Parse numeric fields
    const totalExperience = formData.get("totalExperience");
    const relevantExperience = formData.get("relevantExperience");
    const currentSalary = formData.get("currentSalary");
    const expectedSalary = formData.get("expectedSalary");

    // Create candidate with all related data in a transaction
    const candidate = await prisma.$transaction(async (tx) => {
      const newCandidate = await tx.candidate.create({
        data: {
          candidateCode,
          fullName,
          positionId,
          phone: formData.get("phone") as string | null,
          whatsapp: formData.get("whatsapp") as string | null,
          email,
          currentCity: formData.get("currentCity") as string | null,
          currentCountry: formData.get("currentCountry") as string | null,
          currentCompany: formData.get("currentCompany") as string | null,
          currentJobTitle: formData.get("currentJobTitle") as string | null,
          totalExperience: totalExperience ? parseFloat(totalExperience as string) : null,
          relevantExperience: relevantExperience ? parseFloat(relevantExperience as string) : null,
          currentSalary: currentSalary ? parseFloat(currentSalary as string) : null,
          expectedSalary: expectedSalary ? parseFloat(expectedSalary as string) : null,
          salaryCurrency: formData.get("salaryCurrency") as string || "INR",
          noticePeriod: formData.get("noticePeriod") as string | null,
          joiningAvailability: formData.get("joiningAvailability") as string | null,
          status: "NEW",
        },
      });

      // Create photo if uploaded
      if (photoUrl) {
        await tx.candidatePhoto.create({
          data: {
            candidateId: newCandidate.id,
            fileUrl: photoUrl,
          },
        });
      }

      // Create skills
      if (skills.length > 0) {
        await tx.candidateSkill.createMany({
          data: skills.map((skill: SkillInput) => ({
            candidateId: newCandidate.id,
            skill: skill.skill,
            yearsExperience: skill.yearsExperience,
          })),
        });
      }

      // Create education
      if (education.length > 0) {
        await tx.candidateEducation.createMany({
          data: education.map((edu: EducationInput) => ({
            candidateId: newCandidate.id,
            qualification: edu.qualification,
            institution: edu.institution,
            specialization: edu.specialization,
            startYear: edu.startYear,
            endYear: edu.endYear,
          })),
        });
      }

      // Create certifications
      if (certifications.length > 0) {
        await tx.candidateCertification.createMany({
          data: certifications.map((cert: CertificationInput) => ({
            candidateId: newCandidate.id,
            name: cert.name,
            issuingOrganization: cert.issuingOrganization,
            issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
          })),
        });
      }

      // Create languages
      if (languages.length > 0) {
        await tx.candidateLanguage.createMany({
          data: languages.map((lang: LanguageInput) => ({
            candidateId: newCandidate.id,
            language: lang.language,
            proficiency: lang.proficiency,
          })),
        });
      }

      // Create employment history
      if (employment.length > 0) {
        await tx.candidateEmployment.createMany({
          data: employment.map((emp: EmploymentInput) => ({
            candidateId: newCandidate.id,
            company: emp.company,
            jobTitle: emp.jobTitle,
            startDate: emp.startDate ? new Date(emp.startDate) : null,
            endDate: emp.endDate ? new Date(emp.endDate) : null,
            currentlyWorking: emp.currentlyWorking,
            description: emp.description,
          })),
        });
      }

      // Create note if provided
      const note = formData.get("note") as string | null;
      if (note && note.trim()) {
        await tx.candidateNote.create({
          data: {
            candidateId: newCandidate.id,
            note: note.trim(),
            createdBy: "System", // TODO: Replace with actual user when auth is implemented
          },
        });
      }

      // Create CV if uploaded
      if (cvUrl && cvFile) {
        const cvDocument = await tx.candidateDocument.create({
          data: {
            candidateId: newCandidate.id,
            documentType: "CV",
            fileName: cvFile.name,
            fileUrl: cvUrl,
            mimeType: cvFile.type,
          },
        });

        await tx.candidateCV.create({
          data: {
            candidateId: newCandidate.id,
            documentId: cvDocument.id,
            extractionStatus: "PENDING",
          },
        });
      }

      return newCandidate;
    });

    // Revalidate relevant pages
    revalidatePath("/candidates");
    revalidatePath(`/positions/${positionId}`);

    // Redirect to candidate profile
    redirect(`/candidates/${candidate.id}`);
  } catch (error) {
    // Let Next.js redirects pass through
    if (isRedirectError(error)) {
      throw error;
    }

    // Handle actual errors
    console.error("Error creating candidate:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to create candidate");
  }
}

/**
 * Valid candidate statuses for manual workflow
 */
const VALID_STATUSES = [
  "NEW",
  "SCREENING",
  "INTERVIEWED",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED",
  "ON_HOLD",
] as const;

type CandidateStatus = typeof VALID_STATUSES[number];

/**
 * Update candidate status (manual workflow only - AI never changes this)
 */
export async function updateCandidateStatus(
  candidateId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate status
    if (!VALID_STATUSES.includes(newStatus as CandidateStatus)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      };
    }

    // Validate candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, positionId: true },
    });

    if (!candidate) {
      return {
        success: false,
        error: "Candidate not found",
      };
    }

    // Update status
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: newStatus },
    });

    // Revalidate relevant pages
    revalidatePath("/");
    revalidatePath("/candidates");
    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath(`/positions/${candidate.positionId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating candidate status:", error);
    return {
      success: false,
      error: "Failed to update candidate status",
    };
  }
}
