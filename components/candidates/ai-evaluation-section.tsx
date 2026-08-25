"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { evaluateCandidate } from "@/app/candidates/[id]/evaluation-actions";
import { useRouter } from "next/navigation";

type AIEvaluationData = {
  id: string;
  overallScore: number;
  confidence: string;
  recommendation: string;
  jobRequirementScore: number | null;
  experienceScore: number | null;
  skillsScore: number | null;
  technicalScore: number | null;
  interviewScore: number | null;
  practicalScore: number | null;
  salaryFitScore: number | null;
  availabilityScore: number | null;
  educationScore: number | null;
  certificationScore: number | null;
  strengths: Array<{ title: string; evidence: string | null }>;
  weaknesses: Array<{ title: string; evidence: string | null }>;
  requirementGaps: Array<{ requirement: string; status: string; evidence: string | null }>;
  missingInformation: string[];
  summary: string;
  createdAt: Date;
  rankings?: Array<{
    rank: number;
    totalCount: number;
  }>;
};

type AIEvaluationSectionProps = {
  candidateId: string;
  evaluation: AIEvaluationData | null;
};

const RECOMMENDATION_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  EXCELLENT_MATCH: { label: "Excellent Match", variant: "default", color: "text-green-600 dark:text-green-400" },
  STRONG_MATCH: { label: "Strong Match", variant: "default", color: "text-green-600 dark:text-green-400" },
  GOOD_MATCH: { label: "Good Match", variant: "secondary", color: "text-blue-600 dark:text-blue-400" },
  POSSIBLE_MATCH: { label: "Possible Match", variant: "outline", color: "text-amber-600 dark:text-amber-400" },
  WEAK_MATCH: { label: "Weak Match", variant: "destructive", color: "text-red-600 dark:text-red-400" },
  INSUFFICIENT_INFORMATION: { label: "Insufficient Information", variant: "outline", color: "text-gray-600 dark:text-gray-400" },
};

const CONFIDENCE_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  HIGH: { label: "High Confidence", variant: "default" },
  MEDIUM: { label: "Medium Confidence", variant: "secondary" },
  LOW: { label: "Low Confidence", variant: "outline" },
};

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 80) return "text-blue-600 dark:text-blue-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function AIEvaluationSection({ candidateId, evaluation }: AIEvaluationSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = () => {
    setError(null);

    startTransition(async () => {
      try {
        await evaluateCandidate(candidateId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to evaluate candidate");
      }
    });
  };

  const categoryScores = evaluation ? [
    { label: "Job Requirements", score: evaluation.jobRequirementScore },
    { label: "Experience", score: evaluation.experienceScore },
    { label: "Skills", score: evaluation.skillsScore },
    { label: "Technical", score: evaluation.technicalScore },
    { label: "Interview", score: evaluation.interviewScore },
    { label: "Practical", score: evaluation.practicalScore },
    { label: "Salary Fit", score: evaluation.salaryFitScore },
    { label: "Availability", score: evaluation.availabilityScore },
    { label: "Education", score: evaluation.educationScore },
    { label: "Certifications", score: evaluation.certificationScore },
  ].filter(item => item.score !== null) : [];

  const latestRanking = evaluation?.rankings?.[0];

  return (
    <Card className="bg-gradient-to-br from-card via-card to-indigo-50/20 dark:to-indigo-950/10 border-indigo-200/30 dark:border-indigo-800/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">AI Evaluation</span>
          </CardTitle>
          <Button
            size="sm"
            onClick={handleEvaluate}
            disabled={isPending}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {evaluation ? "Re-evaluate" : "Evaluate with AI"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
            {error}
          </div>
        )}

        {!evaluation ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Not evaluated yet</p>
            <p className="text-xs mt-2">Click &quot;Evaluate with AI&quot; to get intelligent candidate assessment</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score and Rank */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30 shadow-lg">
                <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-2 uppercase tracking-wider">AI Score</div>
                <div className={`text-5xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                  {evaluation.overallScore}
                </div>
                <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-2">out of 100</div>
              </div>

              {latestRanking && (
                <div className={`text-center p-6 rounded-xl border shadow-lg ${
                  latestRanking.rank === 1
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-300/50 dark:border-amber-700/30"
                    : latestRanking.rank === 2
                    ? "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 border-slate-300/50 dark:border-slate-700/30"
                    : latestRanking.rank === 3
                    ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-300/50 dark:border-orange-700/30"
                    : "bg-gradient-to-br from-muted to-muted/50 border-border/50"
                }`}>
                  <div className={`text-xs font-semibold mb-2 uppercase tracking-wider ${
                    latestRanking.rank === 1
                      ? "text-amber-700 dark:text-amber-300"
                      : latestRanking.rank === 2
                      ? "text-slate-700 dark:text-slate-300"
                      : latestRanking.rank === 3
                      ? "text-orange-700 dark:text-orange-300"
                      : "text-muted-foreground"
                  }`}>Ranking</div>
                  <div className={`text-5xl font-bold ${
                    latestRanking.rank === 1
                      ? "text-amber-600 dark:text-amber-400"
                      : latestRanking.rank === 2
                      ? "text-slate-600 dark:text-slate-400"
                      : latestRanking.rank === 3
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-foreground"
                  }`}>
                    #{latestRanking.rank}
                  </div>
                  <div className={`text-xs mt-2 ${
                    latestRanking.rank <= 3
                      ? latestRanking.rank === 1
                        ? "text-amber-600/70 dark:text-amber-400/70"
                        : latestRanking.rank === 2
                        ? "text-slate-600/70 dark:text-slate-400/70"
                        : "text-orange-600/70 dark:text-orange-400/70"
                      : "text-muted-foreground"
                  }`}>
                    of {latestRanking.totalCount} evaluated
                  </div>
                </div>
              )}

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/30 shadow-lg">
                <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mb-2 uppercase tracking-wider">Recommendation</div>
                <Badge
                  variant={RECOMMENDATION_CONFIG[evaluation.recommendation]?.variant || "outline"}
                  className="mt-2 text-xs px-3 py-1"
                >
                  {RECOMMENDATION_CONFIG[evaluation.recommendation]?.label || evaluation.recommendation}
                </Badge>
                <div className="mt-3">
                  <Badge variant={CONFIDENCE_CONFIG[evaluation.confidence]?.variant || "outline"} className="text-xs">
                    {CONFIDENCE_CONFIG[evaluation.confidence]?.label || evaluation.confidence}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Category Scores */}
            {categoryScores.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Category Scores</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryScores.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-xs">{item.label}</span>
                      <span className={`text-sm font-bold ${getScoreColor(item.score!)}`}>
                        {item.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {evaluation.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {evaluation.strengths.map((strength, idx) => (
                    <div key={idx} className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{strength.title}</div>
                          {strength.evidence && (
                            <div className="text-xs text-muted-foreground mt-1">{strength.evidence}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses */}
            {evaluation.weaknesses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <TrendingDown className="h-4 w-4" />
                  Weaknesses
                </h4>
                <div className="space-y-2">
                  {evaluation.weaknesses.map((weakness, idx) => (
                    <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{weakness.title}</div>
                          {weakness.evidence && (
                            <div className="text-xs text-muted-foreground mt-1">{weakness.evidence}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirement Gaps */}
            {evaluation.requirementGaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Requirement Gaps</h4>
                <div className="space-y-2">
                  {evaluation.requirementGaps.map((gap, idx) => (
                    <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span>{gap.requirement}</span>
                        <Badge variant="outline" className="text-xs">
                          {gap.status}
                        </Badge>
                      </div>
                      {gap.evidence && (
                        <div className="text-xs text-muted-foreground mt-1">{gap.evidence}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Information */}
            {evaluation.missingInformation.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Missing Information</h4>
                <div className="space-y-1">
                  {evaluation.missingInformation.map((info, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                      {info}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div>
              <h4 className="text-sm font-semibold mb-2">AI Summary</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {evaluation.summary}
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              Evaluated {new Date(evaluation.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
