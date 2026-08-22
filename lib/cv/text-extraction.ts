import path from "path";
import mammoth from "mammoth";
import { PdfReader } from "pdfreader";

/**
 * Extract text from PDF file using pdfreader
 * Server-safe, no canvas or DOM dependencies
 */
async function extractTextFromPDF(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullText = "";
    let rowText: { [key: number]: string } = {};
    let lastY = -1;

    new PdfReader().parseFileItems(filepath, (err, item) => {
      if (err) {
        reject(new Error("Failed to extract text from PDF: " + String(err)));
        return;
      }

      if (!item) {
        // End of file
        const trimmedText = fullText.trim();

        if (!trimmedText || trimmedText.length === 0) {
          reject(new Error(
            "Unable to extract text from this CV. The document may be scanned or image-based."
          ));
          return;
        }

        resolve(trimmedText);
        return;
      }

      if (item.text) {
        // Track text by row (Y position)
        const currentY = item.y || 0;

        // New row
        if (currentY !== lastY && lastY !== -1) {
          // Join accumulated row text and add to full text
          const sortedX = Object.keys(rowText).map(Number).sort((a, b) => a - b);
          fullText += sortedX.map(x => rowText[x]).join(" ") + "\n";
          rowText = {};
        }

        lastY = currentY;
        rowText[item.x || 0] = item.text;
      }
    });
  });
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(filepath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filepath });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error(
        "Unable to extract text from this CV. The document may be empty or contain only images."
      );
    }

    return result.value.trim();
  } catch (error) {
    throw new Error("Failed to extract text from DOCX: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}

/**
 * Result of CV text extraction
 */
export type CVExtractionResult = {
  text: string | null;
  useVision: boolean; // Whether to use vision/image extraction instead
};

/**
 * Check if extracted text is meaningful
 * Returns true if text appears to be actual content (not just metadata)
 */
function hasMinimalText(text: string): boolean {
  if (!text || text.trim().length < 50) {
    return false;
  }

  // Check for common CV indicators
  const lowerText = text.toLowerCase();
  const indicators = [
    'experience',
    'education',
    'skill',
    'work',
    'email',
    'phone',
    'objective',
    'summary',
    'project',
    'qualification',
    'name',
    'address'
  ];

  return indicators.some(indicator => lowerText.includes(indicator));
}

/**
 * Extract text from CV file based on mime type
 * Returns extraction result indicating whether vision extraction should be used
 */
export async function extractTextFromCV(
  fileUrl: string,
  mimeType: string
): Promise<CVExtractionResult> {
  // Convert public URL to filesystem path
  const filepath = path.join(process.cwd(), "public", fileUrl);

  // Image files always use vision extraction
  if (mimeType === "image/jpeg" || mimeType === "image/jpg" || mimeType === "image/png") {
    return {
      text: null,
      useVision: true,
    };
  }

  // Try text extraction for PDF and DOCX
  if (mimeType === "application/pdf") {
    try {
      const text = await extractTextFromPDF(filepath);

      // Check if we got meaningful text
      if (hasMinimalText(text)) {
        return {
          text,
          useVision: false,
        };
      } else {
        // Scanned PDF or insufficient text - use vision
        return {
          text: null,
          useVision: true,
        };
      }
    } catch {
      // PDF text extraction failed - try vision
      return {
        text: null,
        useVision: true,
      };
    }
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const text = await extractTextFromDOCX(filepath);
    return {
      text,
      useVision: false,
    };
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
