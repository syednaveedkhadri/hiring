"use server";

import { uploadCV } from "@/lib/storage/cv-storage";
import { extractTextFromCV } from "@/lib/cv/text-extraction";
import { getCVExtractionProvider } from "@/lib/cv/provider";
import { StructuredCVData } from "@/lib/cv/schemas";

/**
 * Extract structured data from CV file for registration form autofill
 * This does not save to database - only processes and returns data
 */
export async function extractCVForRegistration(formData: FormData): Promise<{
  success: boolean;
  data?: StructuredCVData;
  error?: string;
}> {
  try {
    const file = formData.get("cv") as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload PDF, DOCX, JPG, JPEG, or PNG"
      };
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" };
    }

    // Upload CV to storage (we'll use the same storage, file will be replaced when candidate is created)
    const fileUrl = await uploadCV(file);

    // Get CV extraction provider
    const provider = getCVExtractionProvider();

    // Extract text or use vision
    const extractionResult = await extractTextFromCV(fileUrl, file.type);

    let structuredData: StructuredCVData;

    if (extractionResult.useVision) {
      // Use vision/image extraction
      structuredData = await provider.extractStructuredCVFromImage(fileUrl, file.type);
    } else if (extractionResult.text) {
      // Use text extraction
      structuredData = await provider.extractStructuredCV(extractionResult.text);
    } else {
      return {
        success: false,
        error: "Failed to extract text from CV. Please try a different format."
      };
    }

    return {
      success: true,
      data: structuredData,
    };
  } catch (error) {
    console.error("Error extracting CV for registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract CV data",
    };
  }
}
