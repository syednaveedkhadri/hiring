import prisma from "./prisma";

/**
 * Generates the next candidate code in a thread-safe manner
 * Format: CAND-000001, CAND-000002, etc.
 */
export async function generateCandidateCode(): Promise<string> {
  // Use a transaction with upsert to handle the sequence atomically
  const sequence = await prisma.$transaction(async (tx) => {
    // Try to get or create the sequence record
    const current = await tx.candidateSequence.upsert({
      where: { id: "singleton" },
      update: {
        lastNumber: {
          increment: 1,
        },
      },
      create: {
        id: "singleton",
        lastNumber: 1,
      },
    });

    return current.lastNumber;
  });

  // Format the code with leading zeros (6 digits)
  return `CAND-${sequence.toString().padStart(6, "0")}`;
}

/**
 * Candidate status options
 */
export const CANDIDATE_STATUSES = [
  "NEW",
  "SCREENING",
  "INTERVIEWED",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED",
  "ON_HOLD",
] as const;

export type CandidateStatus = typeof CANDIDATE_STATUSES[number];

/**
 * Get status badge variant
 */
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "NEW":
      return "default";
    case "SCREENING":
      return "secondary";
    case "INTERVIEWED":
      return "secondary";
    case "SHORTLISTED":
      return "default";
    case "SELECTED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "ON_HOLD":
      return "outline";
    default:
      return "outline";
  }
}
