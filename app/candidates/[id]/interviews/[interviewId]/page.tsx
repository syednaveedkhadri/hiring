import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, MapPin, User, Award } from "lucide-react";
import { getInterview } from "../actions";
import { DeleteInterviewButton } from "./delete-button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string; interviewId: string }>;
};

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  HR: "HR Interview",
  TECHNICAL: "Technical Interview",
  MANAGERIAL: "Managerial Interview",
  FINAL: "Final Interview",
  PRACTICAL: "Practical Test",
  OTHER: "Other",
};

function calculateAverageScore(scores: Array<{ score: number }>) {
  if (scores.length === 0) return null;
  const sum = scores.reduce((acc, s) => acc + s.score, 0);
  return (sum / scores.length).toFixed(1);
}

export default async function InterviewDetailPage({ params }: PageProps) {
  const { id, interviewId } = await params;

  const interview = await getInterview(interviewId);

  if (!interview || interview.candidateId !== id) {
    notFound();
  }

  const averageScore = calculateAverageScore(interview.scores);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/candidates/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Candidate
            </Link>
          </Button>
        </div>

        {/* Candidate Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {interview.candidate.photo?.fileUrl ? (
                    <AvatarImage
                      src={interview.candidate.photo.fileUrl}
                      alt={interview.candidate.fullName}
                    />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {interview.candidate.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{interview.candidate.fullName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {interview.candidate.candidateCode}
                  </p>
                  <p className="text-sm">{interview.candidate.position.title}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link
                    href={`/candidates/${id}/interviews/new?edit=${interviewId}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <DeleteInterviewButton
                  interviewId={interviewId}
                  candidateId={id}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Details */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Interview Type</div>
                    <Badge className="mt-1">
                      {INTERVIEW_TYPE_LABELS[interview.interviewType] ||
                        interview.interviewType}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Interview Date</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(interview.interviewDate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {interview.interviewerId && (
                  <div>
                    <div className="text-xs text-muted-foreground">Interviewer</div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{interview.interviewerId}</span>
                    </div>
                  </div>
                )}

                {interview.interviewLocation && (
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{interview.interviewLocation}</span>
                    </div>
                  </div>
                )}

                {interview.overallNotes && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">General Notes</div>
                    <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">
                      {interview.overallNotes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Structured Scores */}
            {interview.scores.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Structured Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {interview.scores.map((score: { id: string; category: string; score: number; notes: string | null }) => (
                      <div
                        key={score.id}
                        className="flex items-start justify-between p-3 bg-muted/50 rounded"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{score.category}</span>
                            <Badge variant="outline" className="text-lg font-bold">
                              {score.score}/10
                            </Badge>
                          </div>
                          {score.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {score.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Questions */}
            {interview.questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interview.questions.map((question: { id: string; question: string; answer: string | null; notes: string | null }, index: number) => (
                    <div key={question.id} className="pb-4 border-b last:border-0">
                      <div className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </div>
                      {question.answer && (
                        <div className="pl-4 mb-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            Answer:
                          </div>
                          <div className="text-sm bg-muted/50 p-3 rounded whitespace-pre-wrap">
                            {question.answer}
                          </div>
                        </div>
                      )}
                      {question.notes && (
                        <div className="pl-4">
                          <div className="text-xs text-muted-foreground mb-1">
                            Interviewer Notes:
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {question.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Average Score */}
            {averageScore && (
              <Card>
                <CardHeader>
                  <CardTitle>Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">
                      {averageScore}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">out of 10</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Based on {interview.scores.length} score
                      {interview.scores.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths */}
            {interview.strengths && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-400">
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{interview.strengths}</p>
                </CardContent>
              </Card>
            )}

            {/* Concerns */}
            {interview.concerns && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-600 dark:text-amber-400">
                    Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{interview.concerns}</p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div>
                  Created: {new Date(interview.createdAt).toLocaleString()}
                </div>
                <div>
                  Updated: {new Date(interview.updatedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
