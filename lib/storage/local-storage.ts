import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PHOTOS_DIR = path.join(UPLOAD_DIR, "photos");

async function ensureUploadDirectories() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(PHOTOS_DIR)) {
    await mkdir(PHOTOS_DIR, { recursive: true });
  }
}

export async function savePhoto(file: File): Promise<string> {
  await ensureUploadDirectories();

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit.");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomId = randomBytes(8).toString("hex");
  const extension = path.extname(file.name);
  const filename = `${timestamp}-${randomId}${extension}`;
  const filepath = path.join(PHOTOS_DIR, filename);

  // Convert file to buffer and save
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Return the public URL path
  return `/uploads/photos/${filename}`;
}

// This function signature is designed to be easily replaceable with S3 storage
// When migrating to S3, you would:
// 1. Install @aws-sdk/client-s3
// 2. Replace the implementation with S3 upload logic
// 3. Return the S3 URL instead of local path
// The function signature and usage throughout the app remain the same
export const uploadPhoto = savePhoto;
