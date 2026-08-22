import prisma from "@/lib/db/prisma";

/**
 * Confidence priority for tie-breaking
 */
const CONFIDENCE_PRIORITY: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Recalculate rankings for a position
 * Should be called after every AI evaluation
 */
export async function recalculatePositionRankings(positionId: string): Promise<void> {
  // Get latest evaluation for each candidate in this position
  const candidates = await prisma.candidate.findMany({
    where: {
      positionId,
    },
    include: {
      aiEvaluations: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  // Filter to only candidates with evaluations
  const evaluatedCandidates = candidates
    .filter((c) => c.aiEvaluations.length > 0)
    .map((c) => ({
      candidateId: c.id,
      evaluation: c.aiEvaluations[0],
    }));

  if (evaluatedCandidates.length === 0) {
    return; // No candidates to rank
  }

  // Sort candidates by ranking criteria
  const sorted = evaluatedCandidates.sort((a, b) => {
    // 1. Overall score DESC
    if (a.evaluation.overallScore !== b.evaluation.overallScore) {
      return b.evaluation.overallScore - a.evaluation.overallScore;
    }

    // 2. Confidence priority (HIGH > MEDIUM > LOW)
    const confA = CONFIDENCE_PRIORITY[a.evaluation.confidence] || 0;
    const confB = CONFIDENCE_PRIORITY[b.evaluation.confidence] || 0;
    if (confA !== confB) {
      return confB - confA;
    }

    // 3. Job requirement score DESC (if available)
    const reqScoreA = a.evaluation.jobRequirementScore || 0;
    const reqScoreB = b.evaluation.jobRequirementScore || 0;
    if (reqScoreA !== reqScoreB) {
      return reqScoreB - reqScoreA;
    }

    // 4. Latest evaluation timestamp (newer first)
    const timeA = new Date(a.evaluation.createdAt).getTime();
    const timeB = new Date(b.evaluation.createdAt).getTime();
    if (timeA !== timeB) {
      return timeB - timeA;
    }

    // 5. Candidate ID as final deterministic tie breaker
    return a.candidateId.localeCompare(b.candidateId);
  });

  // Create ranking records
  const totalCount = sorted.length;
  const rankingData = sorted.map((item, index) => ({
    candidateId: item.candidateId,
    positionId,
    evaluationId: item.evaluation.id,
    rank: index + 1,
    totalCount,
  }));

  // Insert rankings in a transaction
  await prisma.$transaction(
    rankingData.map((data) =>
      prisma.candidateRanking.create({
        data,
      })
    )
  );
}

/**
 * Get latest ranking for a candidate in a position
 */
export async function getLatestRanking(
  candidateId: string,
  positionId: string
): Promise<{ rank: number; totalCount: number } | null> {
  const ranking = await prisma.candidateRanking.findFirst({
    where: {
      candidateId,
      positionId,
    },
    orderBy: {
      recordedAt: "desc",
    },
  });

  if (!ranking) {
    return null;
  }

  return {
    rank: ranking.rank,
    totalCount: ranking.totalCount,
  };
}

/**
 * Get ranking history for a candidate
 */
export async function getRankingHistory(
  candidateId: string,
  positionId: string
): Promise<Array<{ rank: number; totalCount: number; recordedAt: Date }>> {
  const rankings = await prisma.candidateRanking.findMany({
    where: {
      candidateId,
      positionId,
    },
    orderBy: {
      recordedAt: "desc",
    },
    take: 10, // Last 10 rankings
  });

  return rankings.map((r) => ({
    rank: r.rank,
    totalCount: r.totalCount,
    recordedAt: r.recordedAt,
  }));
}

/**
 * Get all ranked candidates for a position
 */
export async function getRankedCandidates(positionId: string) {
  // Get latest evaluation for each candidate
  const candidates = await prisma.candidate.findMany({
    where: {
      positionId,
    },
    include: {
      photo: true,
      aiEvaluations: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      rankings: {
        orderBy: {
          recordedAt: "desc",
        },
        take: 1,
      },
    },
  });

  // Separate evaluated and not evaluated
  const evaluated = candidates
    .filter((c) => c.aiEvaluations.length > 0)
    .map((c) => ({
      id: c.id,
      candidateCode: c.candidateCode,
      fullName: c.fullName,
      currentJobTitle: c.currentJobTitle,
      currentCompany: c.currentCompany,
      totalExperience: c.totalExperience,
      relevantExperience: c.relevantExperience,
      expectedSalary: c.expectedSalary,
      salaryCurrency: c.salaryCurrency,
      joiningAvailability: c.joiningAvailability,
      status: c.status,
      photo: c.photo,
      evaluation: c.aiEvaluations[0],
      ranking: c.rankings[0] || null,
    }));

  const notEvaluated = candidates
    .filter((c) => c.aiEvaluations.length === 0)
    .map((c) => ({
      id: c.id,
      candidateCode: c.candidateCode,
      fullName: c.fullName,
      currentJobTitle: c.currentJobTitle,
      currentCompany: c.currentCompany,
      totalExperience: c.totalExperience,
      relevantExperience: c.relevantExperience,
      expectedSalary: c.expectedSalary,
      salaryCurrency: c.salaryCurrency,
      joiningAvailability: c.joiningAvailability,
      status: c.status,
      photo: c.photo,
    }));

  // Sort evaluated by rank
  evaluated.sort((a, b) => {
    if (a.ranking && b.ranking) {
      return a.ranking.rank - b.ranking.rank;
    }
    return 0;
  });

  return {
    evaluated,
    notEvaluated,
  };
}
