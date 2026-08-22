import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const CVS_DIR = path.join(UPLOAD_DIR, "cvs");

async function ensureUploadDirectories() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(CVS_DIR)) {
    await mkdir(CVS_DIR, { recursive: true });
  }
}

export async function saveCV(file: File): Promise<string> {
  await ensureUploadDirectories();

  // Validate file type
  const validTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only PDF, DOCX, JPG, JPEG, and PNG files are allowed.");
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 10MB limit.");
  }

  // Sanitize and generate unique filename
  const timestamp = Date.now();
  const randomId = randomBytes(8).toString("hex");

  let extension: string;
  if (file.type === "application/pdf") {
    extension = ".pdf";
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    extension = ".docx";
  } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
    extension = ".jpg";
  } else if (file.type === "image/png") {
    extension = ".png";
  } else {
    extension = ".bin";
  }

  const filename = `cv-${timestamp}-${randomId}${extension}`;
  const filepath = path.join(CVS_DIR, filename);

  // Convert file to buffer and save
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Return the public URL path
  return `/uploads/cvs/${filename}`;
}

// This function signature is designed to be easily replaceable with S3 storage
// When migrating to S3, you would:
// 1. Install @aws-sdk/client-s3
// 2. Replace the implementation with S3 upload logic
// 3. Return the S3 URL or generate a signed URL
// The function signature and usage throughout the app remain the same
export const uploadCV = saveCV;
