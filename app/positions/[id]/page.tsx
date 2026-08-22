import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CandidateStatusBadge } from "@/components/candidates/candidate-status-badge";
import prisma from "@/lib/db/prisma";
import { getRankedCandidates } from "@/lib/ai-evaluation/ranking";
import { ArrowLeft, Briefcase, Users, DollarSign, Calendar, Trophy, Award } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getPosition(id: string) {
  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          candidates: true,
        },
      },
    },
  });

  return position;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 80) return "text-blue-600 dark:text-blue-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default async function PositionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const position = await getPosition(id);

  if (!position) {
    notFound();
  }

  // Get ranked candidates
  const { evaluated, notEvaluated } = await getRankedCandidates(id);

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null) return "Not specified";
    return `${currency || "KWD"} ${amount.toLocaleString()}`;
  };

  const formatExperience = (years: number | null) => {
    if (years === null) return "Not specified";
    return `${years} ${years === 1 ? "year" : "years"}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/positions">
              <ArrowLeft className="h-4 w-4" />
              Back to Positions
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{position.title}</h1>
              {position.department && (
                <p className="text-lg text-muted-foreground mt-2">{position.department}</p>
              )}
            </div>
            <Badge variant={position.status === "OPEN" ? "default" : "secondary"} className="text-sm">
              {position.status}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{position.vacancies}</p>
                    <p className="text-sm text-muted-foreground">
                      {position.vacancies === 1 ? "Vacancy" : "Vacancies"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{position._count.candidates}</p>
                    <p className="text-sm text-muted-foreground">
                      {position._count.candidates === 1 ? "Candidate" : "Candidates"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(position.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Seniority Level</label>
                  <p className="mt-1">{position.seniorityLevel || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="mt-1">{position.department || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {position.jobDescription || "Not specified"}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mandatory Requirements</label>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {position.mandatoryRequirements || "Not specified"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Requirements</label>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {position.preferredRequirements || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Experience</label>
                  <p className="mt-1">{formatExperience(position.minimumExperience)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Experience</label>
                  <p className="mt-1">{formatExperience(position.preferredExperience)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Salary</label>
                  <p className="mt-1">
                    {formatCurrency(position.salaryMin ? Number(position.salaryMin) : null, position.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Maximum Salary</label>
                  <p className="mt-1">
                    {formatCurrency(position.salaryMax ? Number(position.salaryMax) : null, position.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <p className="mt-1">{position.currency || "KWD"}</p>
                </div>
              </div>
              {position.salaryMin && position.salaryMax && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Salary Range</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(Number(position.salaryMin), position.currency)} -{" "}
                    {formatCurrency(Number(position.salaryMax), position.currency)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidates Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidates ({position._count.candidates})
                </CardTitle>
                {evaluated.length > 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/rankings/${id}`}>
                      <Trophy className="h-4 w-4 mr-2" />
                      View Full Rankings
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {position._count.candidates === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No candidates registered for this position yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Evaluated Candidates with Rankings */}
                  {evaluated.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Ranked Candidates ({evaluated.length})
                      </h3>
                      <div className="space-y-2">
                        {evaluated.slice(0, 5).map((candidate) => (
                          <Link
                            key={candidate.id}
                            href={`/candidates/${candidate.id}`}
                            className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              {candidate.ranking && (
                                <div className="flex items-center gap-2">
                                  {candidate.ranking.rank <= 3 && (
                                    <Trophy
                                      className={`h-5 w-5 ${
                                        candidate.ranking.rank === 1
                                          ? "text-amber-500"
                                          : candidate.ranking.rank === 2
                                          ? "text-gray-400"
                                          : "text-amber-700"
                                      }`}
                                    />
                                  )}
                                  <span className="font-bold text-lg">#{candidate.ranking.rank}</span>
                                </div>
                              )}

                              <Avatar>
                                {candidate.photo?.fileUrl ? (
                                  <AvatarImage src={candidate.photo.fileUrl} alt={candidate.fullName} />
                                ) : null}
                                <AvatarFallback>
                                  {candidate.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                  <div className="font-medium">{candidate.fullName}</div>
                                  <div className="text-xs text-muted-foreground">{candidate.candidateCode}</div>
                                </div>

                                <div className="flex items-center">
                                  <div>
                                    <div className="text-xs text-muted-foreground">AI Score</div>
                                    <div className={`text-xl font-bold ${getScoreColor(candidate.evaluation.overallScore)}`}>
                                      {candidate.evaluation.overallScore}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center">
                                  {candidate.totalExperience !== null && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Exp:</span> {candidate.totalExperience}y
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center">
                                  {candidate.expectedSalary !== null && (
                                    <div className="text-sm">
                                      {candidate.salaryCurrency} {Number(candidate.expectedSalary).toLocaleString()}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-end">
                                  <CandidateStatusBadge status={candidate.status} />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {evaluated.length > 5 && (
                        <div className="text-center mt-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/rankings/${id}`}>
                              View all {evaluated.length} ranked candidates
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Not Evaluated Candidates */}
                  {notEvaluated.length > 0 && (
                    <div>
                      {evaluated.length > 0 && <Separator />}
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                        Not Yet Evaluated ({notEvaluated.length})
                      </h3>
                      <div className="space-y-2">
                        {notEvaluated.slice(0, 3).map((candidate) => (
                          <Link
                            key={candidate.id}
                            href={`/candidates/${candidate.id}`}
                            className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10">
                                {candidate.photo?.fileUrl ? (
                                  <AvatarImage src={candidate.photo.fileUrl} alt={candidate.fullName} />
                                ) : null}
                                <AvatarFallback>
                                  {candidate.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="font-medium">{candidate.fullName}</div>
                                  <div className="text-xs text-muted-foreground">{candidate.candidateCode}</div>
                                </div>

                                <div>
                                  {candidate.currentJobTitle && (
                                    <div className="text-sm text-muted-foreground">{candidate.currentJobTitle}</div>
                                  )}
                                </div>

                                <div className="flex items-center justify-end">
                                  <CandidateStatusBadge status={candidate.status} />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {notEvaluated.length > 3 && (
                        <div className="text-sm text-muted-foreground mt-2 text-center">
                          +{notEvaluated.length - 3} more candidates not evaluated
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
