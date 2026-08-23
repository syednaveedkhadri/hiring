import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  // Get total positions
  const totalPositions = await prisma.position.count();

  // Get total candidates
  const totalCandidates = await prisma.candidate.count();

  // Get evaluated candidates (those with AI evaluations)
  const evaluatedCandidates = await prisma.candidate.count({
    where: {
      aiEvaluations: {
        some: {},
      },
    },
  });

  // Get candidates by status
  const statusCounts = await prisma.candidate.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusMap = statusCounts.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  // Top candidates by position (ranked with AI scores)
  const topCandidates = await prisma.candidateRanking.findMany({
    where: {
      rank: {
        lte: 3, // Top 3 per position
      },
    },
    include: {
      candidate: {
        include: {
          position: true,
        },
      },
      evaluation: true,
    },
    orderBy: [
      { positionId: "asc" },
      { rank: "asc" },
    ],
    take: 15,
  });

  // Candidates not yet evaluated
  const notEvaluatedCandidates = await prisma.candidate.findMany({
    where: {
      aiEvaluations: {
        none: {},
      },
    },
    include: {
      position: true,
      interviews: {
        where: {
          status: "COMPLETED",
        },
        orderBy: {
          interviewDate: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  // Recent interviews
  const recentInterviews = await prisma.interview.findMany({
    where: {
      status: "COMPLETED",
    },
    include: {
      candidate: {
        include: {
          position: true,
        },
      },
      scores: true,
    },
    orderBy: {
      interviewDate: "desc",
    },
    take: 10,
  });

  // Position hiring progress
  const positions = await prisma.position.findMany({
    include: {
      candidates: {
        include: {
          aiEvaluations: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const positionProgress = positions.map((position) => {
    const totalCandidates = position.candidates.length;
    const evaluatedCount = position.candidates.filter(
      (c) => c.aiEvaluations.length > 0
    ).length;
    const shortlistedCount = position.candidates.filter(
      (c) => c.status === "SHORTLISTED"
    ).length;
    const selectedCount = position.candidates.filter(
      (c) => c.status === "SELECTED"
    ).length;

    return {
      id: position.id,
      title: position.title,
      vacancies: position.vacancies,
      totalCandidates,
      evaluatedCount,
      shortlistedCount,
      selectedCount,
    };
  });

  return {
    totalPositions,
    totalCandidates,
    evaluatedCandidates,
    statusMap,
    topCandidates,
    notEvaluatedCandidates,
    recentInterviews,
    positionProgress,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "SELECTED":
        return "default";
      case "SHORTLISTED":
        return "secondary";
      case "REJECTED":
        return "destructive";
      case "INTERVIEWED":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hiring Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of positions, candidates, and hiring progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Positions
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPositions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Candidates
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalCandidates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Evaluated Candidates
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.evaluatedCandidates}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.totalCandidates > 0
                  ? `${Math.round((data.evaluatedCandidates / data.totalCandidates) * 100)}% of total`
                  : "No candidates yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Shortlisted
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.statusMap["SHORTLISTED"] || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Candidates by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                "NEW",
                "SCREENING",
                "INTERVIEWED",
                "SHORTLISTED",
                "SELECTED",
                "REJECTED",
                "ON_HOLD",
              ].map((status) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">
                    {data.statusMap[status] || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">{status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Candidates by Position */}
          <Card>
            <CardHeader>
              <CardTitle>Top Candidates by Position</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No ranked candidates yet. Evaluate candidates to see rankings.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.topCandidates.map((ranking) => (
                    <Link
                      key={ranking.id}
                      href={`/candidates/${ranking.candidateId}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {ranking.candidate.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {ranking.candidate.position.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline">Rank #{ranking.rank}</Badge>
                          <Badge variant={statusBadgeVariant(ranking.evaluation.recommendation)}>
                            {ranking.evaluation.overallScore.toFixed(0)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {ranking.evaluation.recommendation.replace(/_/g, " ")}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidates Not Yet Evaluated */}
          <Card>
            <CardHeader>
              <CardTitle>Candidates Not Yet Evaluated</CardTitle>
            </CardHeader>
            <CardContent>
              {data.notEvaluatedCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All candidates have been evaluated.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.notEvaluatedCandidates.map((candidate) => (
                    <Link
                      key={candidate.id}
                      href={`/candidates/${candidate.id}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {candidate.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {candidate.position.title}
                          </div>
                        </div>
                        <Badge variant={statusBadgeVariant(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </div>
                      {candidate.interviews.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Last interview:{" "}
                          {new Date(
                            candidate.interviews[0].interviewDate
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Interviews */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No interviews conducted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentInterviews.map((interview) => {
                  const avgScore =
                    interview.scores.length > 0
                      ? interview.scores.reduce((sum, s) => sum + s.score, 0) /
                        interview.scores.length
                      : 0;

                  return (
                    <Link
                      key={interview.id}
                      href={`/candidates/${interview.candidateId}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {interview.candidate.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {interview.candidate.position.title} •{" "}
                            {interview.interviewType}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {interview.scores.length > 0 && (
                            <Badge variant="outline">
                              {avgScore.toFixed(1)}/10
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              interview.interviewDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Position Hiring Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Position Hiring Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {data.positionProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No positions created yet.
              </p>
            ) : (
              <div className="space-y-4">
                {data.positionProgress.map((position) => (
                  <div
                    key={position.id}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-medium">{position.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {position.vacancies} {position.vacancies === 1 ? "vacancy" : "vacancies"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Candidates</div>
                        <div className="font-medium text-lg">
                          {position.totalCandidates}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Evaluated</div>
                        <div className="font-medium text-lg">
                          {position.evaluatedCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Shortlisted</div>
                        <div className="font-medium text-lg">
                          {position.shortlistedCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Selected</div>
                        <div className="font-medium text-lg">
                          {position.selectedCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
