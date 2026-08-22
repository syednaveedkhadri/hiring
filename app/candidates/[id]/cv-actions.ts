"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { uploadCV } from "@/lib/storage/cv-storage";
import { extractTextFromCV } from "@/lib/cv/text-extraction";
import { getCVExtractionProvider } from "@/lib/cv/provider";
import { StructuredCVData } from "@/lib/cv/schemas";

/**
 * Upload CV for a candidate
 */
export async function uploadCandidateCV(candidateId: string, formData: FormData) {
  try {
    const file = formData.get("cv") as File | null;

    if (!file || file.size === 0) {
      throw new Error("No file provided");
    }

    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Upload CV file
    const fileUrl = await uploadCV(file);

    // Delete previous CV if exists
    const existingCV = await prisma.candidateCV.findUnique({
      where: { candidateId },
      include: { document: true },
    });

    if (existingCV) {
      // Delete the old CV record (document will cascade)
      await prisma.candidateCV.delete({
        where: { candidateId },
      });
    }

    // Create document record
    const document = await prisma.candidateDocument.create({
      data: {
        candidateId,
        documentType: "CV",
        fileName: file.name,
        fileUrl,
        mimeType: file.type,
      },
    });

    // Create CV record
    const cv = await prisma.candidateCV.create({
      data: {
        candidateId,
        documentId: document.id,
        extractionStatus: "PENDING",
      },
    });

    revalidatePath(`/candidates/${candidateId}`);

    return { success: true, cvId: cv.id };
  } catch (error) {
    console.error("Error uploading CV:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload CV"
    );
  }
}

/**
 * Extract text from CV
 */
export async function extractCVText(candidateId: string) {
  try {
    const cv = await prisma.candidateCV.findUnique({
      where: { candidateId },
      include: { document: true },
    });

    if (!cv) {
      throw new Error("CV not found");
    }

    // Update status to EXTRACTING
    await prisma.candidateCV.update({
      where: { id: cv.id },
      data: { extractionStatus: "EXTRACTING" },
    });

    try {
      // Extract text (or detect if vision extraction is needed)
      const result = await extractTextFromCV(
        cv.document.fileUrl,
        cv.document.mimeType || ""
      );

      // Update with extracted text (will be null for images/scanned PDFs)
      await prisma.candidateCV.update({
        where: { id: cv.id },
        data: {
          extractedText: result.text,
          extractionStatus: "EXTRACTED",
          extractedAt: new Date(),
          extractionError: null,
        },
      });

      revalidatePath(`/candidates/${candidateId}`);

      return { success: true, text: result.text, useVision: result.useVision };
    } catch (error) {
      // Update with error
      await prisma.candidateCV.update({
        where: { id: cv.id },
        data: {
          extractionStatus: "FAILED",
          extractionError:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      revalidatePath(`/candidates/${candidateId}`);

      throw error;
    }
  } catch (error) {
    console.error("Error extracting CV text:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to extract CV text"
    );
  }
}

/**
 * Parse CV with AI
 */
export async function parseCVWithAI(candidateId: string) {
  try {
    const cv = await prisma.candidateCV.findUnique({
      where: { candidateId },
      include: { document: true },
    });

    if (!cv) {
      throw new Error("CV not found");
    }

    // Get AI provider
    const provider = getCVExtractionProvider();

    let parsedData: StructuredCVData;

    // Check if we need vision extraction or text extraction
    if (!cv.extractedText) {
      // No text extracted - use vision extraction for images/scanned PDFs
      parsedData = await provider.extractStructuredCVFromImage(
        cv.document.fileUrl,
        cv.document.mimeType || ""
      );
    } else {
      // Text extracted - use text-based extraction
      parsedData = await provider.extractStructuredCV(cv.extractedText);
    }

    // Update with parsed data
    await prisma.candidateCV.update({
      where: { id: cv.id },
      data: {
        parsedData: parsedData as Prisma.InputJsonValue, // Prisma Json type
        extractionStatus: "PARSED",
      },
    });

    revalidatePath(`/candidates/${candidateId}`);

    return { success: true, parsedData };
  } catch (error) {
    console.error("Error parsing CV:", error);

    // Update status to failed
    await prisma.candidateCV.update({
      where: { candidateId },
      data: {
        extractionStatus: "FAILED",
        extractionError:
          error instanceof Error ? error.message : "Failed to parse CV",
      },
    });

    revalidatePath(`/candidates/${candidateId}`);

    throw new Error(
      error instanceof Error ? error.message : "Failed to parse CV"
    );
  }
}

/**
 * Apply selected CV data to candidate
 */
export async function applyParsedCVData(
  candidateId: string,
  selectedData: {
    basicInfo?: boolean;
    skills?: number[]; // indices of skills to apply
    employment?: number[];
    education?: number[];
    certifications?: number[];
    languages?: number[];
  }
) {
  try {
    const cv = await prisma.candidateCV.findUnique({
      where: { candidateId },
      include: {
        candidate: {
          include: {
            skills: true,
            employment: true,
            education: true,
            certifications: true,
            languages: true,
          },
        },
      },
    });

    if (!cv || !cv.parsedData) {
      throw new Error("Parsed CV data not found");
    }

    const parsedData = cv.parsedData as StructuredCVData;

    await prisma.$transaction(async (tx) => {
      // Apply basic info
      if (selectedData.basicInfo && parsedData) {
        const updateData: Record<string, string | number> = {};

        if (parsedData.fullName) updateData.fullName = parsedData.fullName;
        if (parsedData.email) updateData.email = parsedData.email;
        if (parsedData.phone) updateData.phone = parsedData.phone;
        if (parsedData.location) {
          // Try to split location into city/country
          const parts = parsedData.location.split(",");
          if (parts.length >= 2) {
            updateData.currentCity = parts[0].trim();
            updateData.currentCountry = parts[parts.length - 1].trim();
          } else {
            updateData.currentCity = parsedData.location;
          }
        }
        if (parsedData.currentCompany)
          updateData.currentCompany = parsedData.currentCompany;
        if (parsedData.currentJobTitle)
          updateData.currentJobTitle = parsedData.currentJobTitle;
        if (parsedData.totalExperienceYears)
          updateData.totalExperience = parsedData.totalExperienceYears;

        if (Object.keys(updateData).length > 0) {
          await tx.candidate.update({
            where: { id: candidateId },
            data: updateData,
          });
        }
      }

      // Apply skills (with duplicate detection)
      if (selectedData.skills && selectedData.skills.length > 0) {
        const skillsToAdd = selectedData.skills.map(
          (index) => parsedData.skills[index]
        );

        for (const skill of skillsToAdd) {
          if (!skill) continue;

          // Check for duplicate (case-insensitive)
          const existing = cv.candidate.skills.find(
            (s) => s.skill.toLowerCase() === skill.name.toLowerCase()
          );

          if (!existing) {
            await tx.candidateSkill.create({
              data: {
                candidateId,
                skill: skill.name,
                yearsExperience: skill.yearsExperience || null,
              },
            });
          }
        }
      }

      // Apply employment (with duplicate detection)
      if (selectedData.employment && selectedData.employment.length > 0) {
        const employmentToAdd = selectedData.employment.map(
          (index) => parsedData.employment[index]
        );

        for (const emp of employmentToAdd) {
          if (!emp) continue;

          // Check for duplicate (same company and job title)
          const existing = cv.candidate.employment.find(
            (e) =>
              e.company.toLowerCase() === emp.company.toLowerCase() &&
              e.jobTitle.toLowerCase() === emp.jobTitle.toLowerCase()
          );

          if (!existing) {
            await tx.candidateEmployment.create({
              data: {
                candidateId,
                company: emp.company,
                jobTitle: emp.jobTitle,
                startDate: emp.startDate ? new Date(emp.startDate) : null,
                endDate: emp.endDate ? new Date(emp.endDate) : null,
                currentlyWorking: emp.currentlyWorking || false,
                description: emp.description || null,
              },
            });
          }
        }
      }

      // Apply education (with duplicate detection)
      if (selectedData.education && selectedData.education.length > 0) {
        const educationToAdd = selectedData.education.map(
          (index) => parsedData.education[index]
        );

        for (const edu of educationToAdd) {
          if (!edu) continue;

          // Check for duplicate (same qualification and institution)
          const existing = cv.candidate.education.find(
            (e) =>
              e.qualification.toLowerCase() === edu.qualification.toLowerCase() &&
              (edu.institution
                ? e.institution?.toLowerCase() === edu.institution.toLowerCase()
                : true)
          );

          if (!existing) {
            await tx.candidateEducation.create({
              data: {
                candidateId,
                qualification: edu.qualification,
                institution: edu.institution || null,
                specialization: edu.specialization || null,
                startYear: edu.startYear || null,
                endYear: edu.endYear || null,
              },
            });
          }
        }
      }

      // Apply certifications (with duplicate detection)
      if (
        selectedData.certifications &&
        selectedData.certifications.length > 0
      ) {
        const certificationsToAdd = selectedData.certifications.map(
          (index) => parsedData.certifications[index]
        );

        for (const cert of certificationsToAdd) {
          if (!cert) continue;

          // Check for duplicate (same name)
          const existing = cv.candidate.certifications.find(
            (c) => c.name.toLowerCase() === cert.name.toLowerCase()
          );

          if (!existing) {
            await tx.candidateCertification.create({
              data: {
                candidateId,
                name: cert.name,
                issuingOrganization: cert.issuingOrganization || null,
                issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
              },
            });
          }
        }
      }

      // Apply languages (with duplicate detection)
      if (selectedData.languages && selectedData.languages.length > 0) {
        const languagesToAdd = selectedData.languages.map(
          (index) => parsedData.languages[index]
        );

        for (const lang of languagesToAdd) {
          if (!lang) continue;

          // Check for duplicate (same language)
          const existing = cv.candidate.languages.find(
            (l) => l.language.toLowerCase() === lang.language.toLowerCase()
          );

          if (!existing) {
            await tx.candidateLanguage.create({
              data: {
                candidateId,
                language: lang.language,
                proficiency: lang.proficiency || null,
              },
            });
          }
        }
      }

      // Update CV status to REVIEWED
      await tx.candidateCV.update({
        where: { id: cv.id },
        data: {
          extractionStatus: "REVIEWED",
        },
      });
    });

    revalidatePath(`/candidates/${candidateId}`);

    return { success: true };
  } catch (error) {
    console.error("Error applying parsed CV data:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to apply CV data"
    );
  }
}

/**
 * Re-run extraction (text + AI parsing)
 */
export async function rerunCVExtraction(candidateId: string) {
  try {
    // First extract text
    await extractCVText(candidateId);

    // Then parse with AI
    await parseCVWithAI(candidateId);

    return { success: true };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to re-run extraction"
    );
  }
}
