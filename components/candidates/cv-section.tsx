"use client";

import { useState, useTransition, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, RefreshCw, Eye, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { CVReviewDialog } from "./cv-review-dialog";
import { StructuredCVData } from "@/lib/cv/schemas";
import {
  uploadCandidateCV,
  extractCVText,
  parseCVWithAI,
  rerunCVExtraction,
} from "@/app/candidates/[id]/cv-actions";

type CVData = {
  id: string;
  documentId: string;
  extractedText: string | null;
  parsedData: StructuredCVData | null;
  extractionStatus: string;
  extractionError: string | null;
  extractedAt: Date | null;
  createdAt: Date;
  document: {
    fileName: string;
    fileUrl: string;
    mimeType: string | null;
    createdAt: Date;
  };
};

type CandidateData = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  currentCity: string | null;
  currentCountry: string | null;
  currentCompany: string | null;
  currentJobTitle: string | null;
  totalExperience: number | null;
  skills: Array<{ skill: string; yearsExperience: number | null }>;
  employment: Array<{
    company: string;
    jobTitle: string;
    startDate: Date | null;
    currentlyWorking: boolean;
  }>;
  education: Array<{ qualification: string; institution: string | null }>;
  certifications: Array<{ name: string }>;
  languages: Array<{ language: string; proficiency: string | null }>;
};

type CVSectionProps = {
  candidateId: string;
  candidateData: CandidateData;
  cvData: CVData | null;
};

export function CVSection({ candidateId, candidateData, cvData }: CVSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("cv", file);

    startTransition(async () => {
      try {
        await uploadCandidateCV(candidateId, formData);
        setSuccess("CV uploaded successfully. Extracting text...");

        // Auto-extract text
        await extractCVText(candidateId);
        setSuccess("Text extracted. Parsing with AI...");

        // Auto-parse with AI
        await parseCVWithAI(candidateId);
        setSuccess("CV parsed successfully! Review the extracted data.");

        // Reload page to show updated CV
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process CV");
      }
    });
  };

  const handleExtract = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await extractCVText(candidateId);
        setSuccess("Text extracted successfully.");
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to extract text");
      }
    });
  };

  const handleParse = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await parseCVWithAI(candidateId);
        setSuccess("CV parsed successfully!");
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CV");
      }
    });
  };

  const handleRerun = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await rerunCVExtraction(candidateId);
        setSuccess("CV re-extracted and parsed successfully!");
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to re-run extraction");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }
    > = {
      PENDING: { label: "Pending", variant: "outline", icon: Clock },
      EXTRACTING: { label: "Extracting...", variant: "secondary", icon: RefreshCw },
      EXTRACTED: { label: "Extracted", variant: "secondary", icon: CheckCircle },
      PARSING: { label: "Parsing...", variant: "secondary", icon: RefreshCw },
      PARSED: { label: "Parsed", variant: "default", icon: CheckCircle },
      REVIEWED: { label: "Applied", variant: "default", icon: CheckCircle },
      FAILED: { label: "Failed", variant: "destructive", icon: AlertCircle },
    };

    const { label, variant, icon: Icon } = config[status] || config.PENDING;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV / Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {!cvData ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">No CV uploaded</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CV
              </Button>
              <p className="text-xs text-muted-foreground mt-2">PDF, DOCX, JPG, JPEG, or PNG, max 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{cvData.document.fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded {new Date(cvData.document.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(cvData.extractionStatus)}
                  </div>
                </div>
              </div>

              {cvData.extractionError && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                  {cvData.extractionError}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={cvData.document.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    View CV
                  </a>
                </Button>

                {cvData.extractionStatus === "PENDING" && (
                  <Button size="sm" onClick={handleExtract} disabled={isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Extract Text
                  </Button>
                )}

                {cvData.extractionStatus === "EXTRACTED" && (
                  <Button size="sm" onClick={handleParse} disabled={isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Parse with AI
                  </Button>
                )}

                {(cvData.extractionStatus === "PARSED" || cvData.extractionStatus === "REVIEWED") &&
                  cvData.parsedData && (
                    <Button size="sm" onClick={() => setShowReviewDialog(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review Extracted Data
                    </Button>
                  )}

                {cvData.extractionStatus === "FAILED" && (
                  <Button size="sm" onClick={handleRerun} disabled={isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}

                {(cvData.extractionStatus === "EXTRACTED" ||
                  cvData.extractionStatus === "PARSED" ||
                  cvData.extractionStatus === "REVIEWED") && (
                  <Button variant="outline" size="sm" onClick={handleRerun} disabled={isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-run Extraction
                  </Button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace CV
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showReviewDialog && cvData?.parsedData && (
        <CVReviewDialog
          candidateId={candidateId}
          parsedData={cvData.parsedData as StructuredCVData}
          currentData={candidateData}
          onClose={() => setShowReviewDialog(false)}
          onApplied={() => {
            setShowReviewDialog(false);
            setSuccess("Data applied successfully!");
            setTimeout(() => window.location.reload(), 1000);
          }}
        />
      )}
    </>
  );
}
