import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, Award, ChevronRight } from "lucide-react";

type Interview = {
  id: string;
  interviewType: string;
  interviewDate: Date;
  interviewerId: string | null;
  interviewLocation: string | null;
  strengths: string | null;
  concerns: string | null;
  scores: Array<{
    score: number;
  }>;
};

type InterviewsSectionProps = {
  candidateId: string;
  interviews: Interview[];
};

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  HR: "HR",
  TECHNICAL: "Technical",
  MANAGERIAL: "Managerial",
  FINAL: "Final",
  PRACTICAL: "Practical",
  OTHER: "Other",
};

const INTERVIEW_TYPE_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  HR: "outline",
  TECHNICAL: "default",
  MANAGERIAL: "secondary",
  FINAL: "default",
  PRACTICAL: "secondary",
  OTHER: "outline",
};

function calculateAverageScore(scores: Array<{ score: number }>) {
  if (scores.length === 0) return null;
  const sum = scores.reduce((acc, s) => acc + s.score, 0);
  return (sum / scores.length).toFixed(1);
}

export function InterviewsSection({ candidateId, interviews }: InterviewsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Interviews
          </CardTitle>
          <Button size="sm" asChild>
            <Link href={`/candidates/${candidateId}/interviews/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Interview
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {interviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No interviews recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => {
              const averageScore = calculateAverageScore(interview.scores);

              return (
                <Link
                  key={interview.id}
                  href={`/candidates/${candidateId}/interviews/${interview.id}`}
                  className="block"
                >
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            INTERVIEW_TYPE_COLORS[interview.interviewType] || "outline"
                          }
                        >
                          {INTERVIEW_TYPE_LABELS[interview.interviewType] ||
                            interview.interviewType}
                        </Badge>
                        {averageScore && (
                          <Badge variant="outline" className="font-bold">
                            {averageScore}/10
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(interview.interviewDate).toLocaleDateString()} at{" "}
                          {new Date(interview.interviewDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {interview.interviewerId && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{interview.interviewerId}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        {interview.strengths && (
                          <div className="flex items-start gap-1">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Strengths:
                            </span>
                            <span className="text-muted-foreground line-clamp-2">
                              {interview.strengths.substring(0, 50)}
                              {interview.strengths.length > 50 ? "..." : ""}
                            </span>
                          </div>
                        )}

                        {interview.concerns && (
                          <div className="flex items-start gap-1">
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Concerns:
                            </span>
                            <span className="text-muted-foreground line-clamp-2">
                              {interview.concerns.substring(0, 50)}
                              {interview.concerns.length > 50 ? "..." : ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {interview.scores.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {interview.scores.length} score
                          {interview.scores.length !== 1 ? "s" : ""} recorded
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
