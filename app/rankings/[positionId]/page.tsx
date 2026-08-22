import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Award } from "lucide-react";
import prisma from "@/lib/db/prisma";
import { getRankedCandidates } from "@/lib/ai-evaluation/ranking";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ positionId: string }>;
};

async function getPosition(id: string) {
  const position = await prisma.position.findUnique({
    where: { id },
  });

  return position;
}

const RECOMMENDATION_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  EXCELLENT_MATCH: { label: "Excellent", variant: "default" },
  STRONG_MATCH: { label: "Strong", variant: "default" },
  GOOD_MATCH: { label: "Good", variant: "secondary" },
  POSSIBLE_MATCH: { label: "Possible", variant: "outline" },
  WEAK_MATCH: { label: "Weak", variant: "destructive" },
  INSUFFICIENT_INFORMATION: { label: "Insufficient", variant: "outline" },
};

const CONFIDENCE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  HIGH: { label: "High", variant: "default" },
  MEDIUM: { label: "Medium", variant: "secondary" },
  LOW: { label: "Low", variant: "outline" },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  NEW: { label: "New", variant: "outline" },
  SCREENING: { label: "Screening", variant: "secondary" },
  INTERVIEWING: { label: "Interviewing", variant: "default" },
  SHORTLISTED: { label: "Shortlisted", variant: "default" },
  SELECTED: { label: "Selected", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  WITHDRAWN: { label: "Withdrawn", variant: "outline" },
};

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 80) return "text-blue-600 dark:text-blue-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default async function PositionRankingsPage({ params }: PageProps) {
  const { positionId } = await params;

  const position = await getPosition(positionId);

  if (!position) {
    notFound();
  }

  const { evaluated, notEvaluated } = await getRankedCandidates(positionId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/rankings">
              <ArrowLeft className="h-4 w-4" />
              Back to Rankings
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight">{position.title}</h1>
            {position.department && (
              <Badge variant="outline">{position.department}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {evaluated.length} evaluated candidates • {notEvaluated.length} not yet
            evaluated
          </p>
        </div>

        {/* Evaluated Candidates */}
        {evaluated.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Ranked Candidates
            </h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sm">Rank</th>
                        <th className="text-left p-4 font-semibold text-sm">
                          Candidate
                        </th>
                        <th className="text-left p-4 font-semibold text-sm">
                          AI Score
                        </th>
                        <th className="text-left p-4 font-semibold text-sm">
                          Recommendation
                        </th>
                        <th className="text-left p-4 font-semibold text-sm">
                          Confidence
                        </th>
                        <th className="text-left p-4 font-semibold text-sm">
                          Experience
                        </th>
                        <th className="text-left p-4 font-semibold text-sm">
                          Expected Salary
                        </th>
                        <th className="text-left p-4 font-semibold text-sm">
                          Availability
                        </th>
                        <th className="text-left p-4 font-semibold text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluated.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {candidate.ranking && (
                                <>
                                  {candidate.ranking.rank <= 3 && (
                                    <Trophy
                                      className={`h-4 w-4 ${
                                        candidate.ranking.rank === 1
                                          ? "text-amber-500"
                                          : candidate.ranking.rank === 2
                                          ? "text-gray-400"
                                          : "text-amber-700"
                                      }`}
                                    />
                                  )}
                                  <span className="font-bold">
                                    #{candidate.ranking.rank}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Link
                              href={`/candidates/${candidate.id}`}
                              className="flex items-center gap-3 hover:underline"
                            >
                              <Avatar className="w-10 h-10">
                                {candidate.photo?.fileUrl ? (
                                  <AvatarImage
                                    src={candidate.photo.fileUrl}
                                    alt={candidate.fullName}
                                  />
                                ) : null}
                                <AvatarFallback>
                                  {candidate.fullName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {candidate.fullName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {candidate.candidateCode}
                                </div>
                                {candidate.currentJobTitle && (
                                  <div className="text-xs text-muted-foreground">
                                    {candidate.currentJobTitle}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </td>
                          <td className="p-4">
                            <div
                              className={`text-2xl font-bold ${getScoreColor(
                                candidate.evaluation.overallScore
                              )}`}
                            >
                              {candidate.evaluation.overallScore}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                RECOMMENDATION_CONFIG[
                                  candidate.evaluation.recommendation
                                ]?.variant || "outline"
                              }
                            >
                              {RECOMMENDATION_CONFIG[
                                candidate.evaluation.recommendation
                              ]?.label || candidate.evaluation.recommendation}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                CONFIDENCE_CONFIG[candidate.evaluation.confidence]
                                  ?.variant || "outline"
                              }
                              className="text-xs"
                            >
                              {CONFIDENCE_CONFIG[candidate.evaluation.confidence]
                                ?.label || candidate.evaluation.confidence}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {candidate.relevantExperience
                                ? `${candidate.relevantExperience} years`
                                : candidate.totalExperience
                                ? `${candidate.totalExperience} years`
                                : "N/A"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {candidate.expectedSalary
                                ? `${candidate.salaryCurrency} ${Number(
                                    candidate.expectedSalary
                                  ).toLocaleString()}`
                                : "N/A"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {candidate.joiningAvailability || "N/A"}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                STATUS_CONFIG[candidate.status]?.variant ||
                                "outline"
                              }
                            >
                              {STATUS_CONFIG[candidate.status]?.label ||
                                candidate.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Not Evaluated Candidates */}
        {notEvaluated.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
              Not Yet Evaluated ({notEvaluated.length})
            </h2>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {notEvaluated.map((candidate) => (
                    <Link
                      key={candidate.id}
                      href={`/candidates/${candidate.id}`}
                      className="flex items-center gap-3 p-3 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        {candidate.photo?.fileUrl ? (
                          <AvatarImage
                            src={candidate.photo.fileUrl}
                            alt={candidate.fullName}
                          />
                        ) : null}
                        <AvatarFallback>
                          {candidate.fullName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{candidate.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {candidate.candidateCode}
                          {candidate.currentJobTitle &&
                            ` • ${candidate.currentJobTitle}`}
                        </div>
                      </div>
                      <Badge
                        variant={
                          STATUS_CONFIG[candidate.status]?.variant || "outline"
                        }
                      >
                        {STATUS_CONFIG[candidate.status]?.label || candidate.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {evaluated.length === 0 && notEvaluated.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No candidates found for this position</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
