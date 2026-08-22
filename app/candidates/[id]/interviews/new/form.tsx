"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { createInterview, updateInterview } from "../actions";

type CandidateInfo = {
  id: string;
  fullName: string;
  candidateCode: string;
  currentJobTitle: string | null;
  position: {
    title: string;
  };
  photo: {
    fileUrl: string;
  } | null;
};

type ExistingInterview = {
  id: string;
  interviewType: string;
  interviewDate: Date;
  interviewerId: string | null;
  interviewLocation: string | null;
  overallNotes: string | null;
  strengths: string | null;
  concerns: string | null;
  scores: Array<{
    id: string;
    category: string;
    score: number;
    notes: string | null;
  }>;
  questions: Array<{
    id: string;
    question: string;
    performance: string | null;
    answer: string | null;
    notes: string | null;
  }>;
};

type InterviewFormProps = {
  candidate: CandidateInfo;
  existingInterview: ExistingInterview | null;
};

const INTERVIEW_TYPES = [
  { value: "HR", label: "HR Interview" },
  { value: "TECHNICAL", label: "Technical Interview" },
  { value: "MANAGERIAL", label: "Managerial Interview" },
  { value: "FINAL", label: "Final Interview" },
  { value: "PRACTICAL", label: "Practical Test" },
  { value: "OTHER", label: "Other" },
];

const DEFAULT_SCORE_CATEGORIES = [
  "Technical Knowledge",
  "Relevant Experience",
  "Problem Solving",
  "Communication",
  "Job Understanding",
  "Practical Ability",
  "Professionalism",
  "Salary Compatibility",
  "Joining Availability",
];

const PERFORMANCE_RATINGS = [
  { value: "POOR", label: "Poor" },
  { value: "FAIR", label: "Fair" },
  { value: "GOOD", label: "Good" },
  { value: "VERY_GOOD", label: "Very Good" },
  { value: "EXCELLENT", label: "Excellent" },
];

type ScoreEntry = {
  category: string;
  score: number | "";
  notes: string;
};

type QuestionEntry = {
  question: string;
  performance: string;
  answer: string;
  notes: string;
};

export function InterviewForm({ candidate, existingInterview }: InterviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [interviewType, setInterviewType] = useState(
    existingInterview?.interviewType || "TECHNICAL"
  );
  const [interviewDate, setInterviewDate] = useState(() => {
    if (existingInterview) {
      const date = new Date(existingInterview.interviewDate);
      return date.toISOString().slice(0, 16);
    }
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [interviewerId, setInterviewerId] = useState(
    existingInterview?.interviewerId || ""
  );
  const [interviewLocation, setInterviewLocation] = useState(
    existingInterview?.interviewLocation || ""
  );
  const [overallNotes, setOverallNotes] = useState(
    existingInterview?.overallNotes || ""
  );
  const [strengths, setStrengths] = useState(existingInterview?.strengths || "");
  const [concerns, setConcerns] = useState(existingInterview?.concerns || "");

  // Scores state
  const [scores, setScores] = useState<ScoreEntry[]>(() => {
    if (existingInterview && existingInterview.scores.length > 0) {
      return existingInterview.scores.map((s) => ({
        category: s.category,
        score: s.score,
        notes: s.notes || "",
      }));
    }
    return DEFAULT_SCORE_CATEGORIES.map((cat) => ({
      category: cat,
      score: "" as const,
      notes: "",
    }));
  });

  // Questions state
  const [questions, setQuestions] = useState<QuestionEntry[]>(() => {
    if (existingInterview && existingInterview.questions.length > 0) {
      return existingInterview.questions.map((q) => ({
        question: q.question,
        performance: q.performance || "",
        answer: q.answer || "",
        notes: q.notes || "",
      }));
    }
    return [{ question: "", performance: "", answer: "", notes: "" }];
  });

  const handleScoreChange = (index: number, field: keyof ScoreEntry, value: string | number) => {
    const newScores = [...scores];
    if (field === "score") {
      newScores[index] = {
        ...newScores[index],
        [field]: value === "" ? "" : Number(value),
      };
    } else {
      newScores[index] = { ...newScores[index], [field]: value };
    }
    setScores(newScores);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", performance: "", answer: "", notes: "" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (
    index: number,
    field: keyof QuestionEntry,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate scores
    const validScores = scores.filter((s) => s.score !== "");
    for (const score of validScores) {
      const scoreValue = typeof score.score === "number" ? score.score : parseInt(String(score.score), 10);
      if (scoreValue < 1 || scoreValue > 10) {
        setError("Scores must be between 1 and 10");
        return;
      }
    }

    const formData = {
      interviewType,
      interviewDate,
      interviewerId: interviewerId.trim() || undefined,
      interviewLocation: interviewLocation.trim() || undefined,
      overallNotes: overallNotes.trim() || undefined,
      strengths: strengths.trim() || undefined,
      concerns: concerns.trim() || undefined,
      scores: validScores.map((s) => ({
        category: s.category,
        score: s.score as number,
        notes: s.notes.trim() || undefined,
      })),
      questions: questions
        .filter((q) => q.question.trim().length > 0)
        .map((q) => ({
          question: q.question.trim(),
          performance: q.performance || undefined,
          answer: q.answer.trim() || undefined,
          notes: q.notes.trim() || undefined,
        })),
    };

    startTransition(async () => {
      try {
        if (existingInterview) {
          await updateInterview(existingInterview.id, candidate.id, formData);
        } else {
          await createInterview(candidate.id, formData);
        }
        router.push(`/candidates/${candidate.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save interview");
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/candidates/${candidate.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Candidate
            </Link>
          </Button>
        </div>

        {/* Candidate Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {candidate.photo?.fileUrl ? (
                  <AvatarImage src={candidate.photo.fileUrl} alt={candidate.fullName} />
                ) : null}
                <AvatarFallback className="text-lg">
                  {candidate.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{candidate.fullName}</h1>
                <p className="text-sm text-muted-foreground">{candidate.candidateCode}</p>
                <p className="text-sm">
                  {candidate.position.title}
                  {candidate.currentJobTitle && ` • ${candidate.currentJobTitle}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {existingInterview ? "Edit Interview" : "New Interview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Interview Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Interview Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interviewType">Interview Type *</Label>
                    <Select value={interviewType} onValueChange={setInterviewType}>
                      <SelectTrigger id="interviewType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVIEW_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="interviewDate">Interview Date & Time *</Label>
                    <Input
                      id="interviewDate"
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="interviewerId">Interviewer Name</Label>
                    <Input
                      id="interviewerId"
                      value={interviewerId}
                      onChange={(e) => setInterviewerId(e.target.value)}
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="interviewLocation">Interview Location</Label>
                    <Input
                      id="interviewLocation"
                      value={interviewLocation}
                      onChange={(e) => setInterviewLocation(e.target.value)}
                      placeholder="e.g., Office, Video Call, Phone"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="overallNotes">General Notes</Label>
                  <Textarea
                    id="overallNotes"
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="Overall interview notes..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Structured Assessment */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Structured Assessment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Score each category from 1-10. Leave blank if not applicable.
                </p>
                <div className="space-y-4">
                  {scores.map((score, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">{score.category}</Label>
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={score.score}
                          onChange={(e) =>
                            handleScoreChange(index, "score", e.target.value)
                          }
                          placeholder="1-10"
                        />
                      </div>
                      <div>
                        <Input
                          value={score.notes}
                          onChange={(e) =>
                            handleScoreChange(index, "notes", e.target.value)
                          }
                          placeholder="Notes (optional)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Interview Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Interview Questions</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <Label className="text-sm font-semibold">
                              Question {index + 1}
                            </Label>
                            {questions.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm">Question</Label>
                            <Textarea
                              value={question.question}
                              onChange={(e) =>
                                handleQuestionChange(index, "question", e.target.value)
                              }
                              placeholder="Enter your question..."
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label className="text-sm">Candidate Performance</Label>
                            <Select
                              value={question.performance}
                              onValueChange={(value) =>
                                handleQuestionChange(index, "performance", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select performance rating..." />
                              </SelectTrigger>
                              <SelectContent>
                                {PERFORMANCE_RATINGS.map((rating) => (
                                  <SelectItem key={rating.value} value={rating.value}>
                                    {rating.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm">Key Answer Notes (optional)</Label>
                            <Textarea
                              value={question.answer}
                              onChange={(e) =>
                                handleQuestionChange(index, "answer", e.target.value)
                              }
                              placeholder="Key points from candidate's answer..."
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label className="text-sm">Interviewer Notes (optional)</Label>
                            <Textarea
                              value={question.notes}
                              onChange={(e) =>
                                handleQuestionChange(index, "notes", e.target.value)
                              }
                              placeholder="Your observations about this answer..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Observations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Observations</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="strengths">Strengths Observed</Label>
                    <Textarea
                      id="strengths"
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="Key strengths noticed during the interview..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="concerns">Concerns</Label>
                    <Textarea
                      id="concerns"
                      value={concerns}
                      onChange={(e) => setConcerns(e.target.value)}
                      placeholder="Any concerns or areas of weakness..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {existingInterview ? "Update Interview" : "Save Interview"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/candidates/${candidate.id}`)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
