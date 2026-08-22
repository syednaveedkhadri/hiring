"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { StructuredCVData } from "@/lib/cv/schemas";
import { applyParsedCVData } from "@/app/candidates/[id]/cv-actions";

type CandidateData = {
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

type CVReviewDialogProps = {
  candidateId: string;
  parsedData: StructuredCVData;
  currentData: CandidateData;
  onClose: () => void;
  onApplied: () => void;
};

export function CVReviewDialog({
  candidateId,
  parsedData,
  currentData,
  onClose,
  onApplied,
}: CVReviewDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [applyBasicInfo, setApplyBasicInfo] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [selectedEmployment, setSelectedEmployment] = useState<Set<number>>(
    new Set()
  );
  const [selectedEducation, setSelectedEducation] = useState<Set<number>>(
    new Set()
  );
  const [selectedCertifications, setSelectedCertifications] = useState<
    Set<number>
  >(new Set());
  const [selectedLanguages, setSelectedLanguages] = useState<Set<number>>(
    new Set()
  );

  const toggleSkill = (index: number) => {
    const newSet = new Set(selectedSkills);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedSkills(newSet);
  };

  const toggleEmployment = (index: number) => {
    const newSet = new Set(selectedEmployment);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedEmployment(newSet);
  };

  const toggleEducation = (index: number) => {
    const newSet = new Set(selectedEducation);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedEducation(newSet);
  };

  const toggleCertification = (index: number) => {
    const newSet = new Set(selectedCertifications);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedCertifications(newSet);
  };

  const toggleLanguage = (index: number) => {
    const newSet = new Set(selectedLanguages);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedLanguages(newSet);
  };

  const handleApply = () => {
    setError(null);
    startTransition(async () => {
      try {
        await applyParsedCVData(candidateId, {
          basicInfo: applyBasicInfo,
          skills: Array.from(selectedSkills),
          employment: Array.from(selectedEmployment),
          education: Array.from(selectedEducation),
          certifications: Array.from(selectedCertifications),
          languages: Array.from(selectedLanguages),
        });
        onApplied();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to apply data");
      }
    });
  };

  const hasSelections =
    applyBasicInfo ||
    selectedSkills.size > 0 ||
    selectedEmployment.size > 0 ||
    selectedEducation.size > 0 ||
    selectedCertifications.size > 0 ||
    selectedLanguages.size > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Review Extracted CV Data</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select which information to apply to the candidate profile
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyBasicInfo}
                    onChange={(e) => setApplyBasicInfo(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-normal">Apply all</span>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoComparison
                  label="Name"
                  current={currentData.fullName}
                  extracted={parsedData.fullName}
                />
                <InfoComparison
                  label="Email"
                  current={currentData.email}
                  extracted={parsedData.email}
                />
                <InfoComparison
                  label="Phone"
                  current={currentData.phone}
                  extracted={parsedData.phone}
                />
                <InfoComparison
                  label="Location"
                  current={
                    currentData.currentCity
                      ? `${currentData.currentCity}${currentData.currentCountry ? `, ${currentData.currentCountry}` : ""}`
                      : null
                  }
                  extracted={parsedData.location}
                />
                <InfoComparison
                  label="Current Company"
                  current={currentData.currentCompany}
                  extracted={parsedData.currentCompany}
                />
                <InfoComparison
                  label="Current Job Title"
                  current={currentData.currentJobTitle}
                  extracted={parsedData.currentJobTitle}
                />
                <InfoComparison
                  label="Total Experience"
                  current={
                    currentData.totalExperience
                      ? `${currentData.totalExperience} years`
                      : null
                  }
                  extracted={
                    parsedData.totalExperienceYears
                      ? `${parsedData.totalExperienceYears} years`
                      : null
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {parsedData.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills ({parsedData.skills.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedData.skills.map((skill, index) => {
                  const isDuplicate = currentData.skills.some(
                    (s) => s.skill.toLowerCase() === skill.name.toLowerCase()
                  );
                  return (
                    <label
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSkills.has(index)}
                          onChange={() => toggleSkill(index)}
                          disabled={isDuplicate}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium">{skill.name}</div>
                          {skill.yearsExperience && (
                            <div className="text-xs text-muted-foreground">
                              {skill.yearsExperience} years experience
                            </div>
                          )}
                        </div>
                      </div>
                      {isDuplicate && (
                        <Badge variant="outline">Already exists</Badge>
                      )}
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Employment */}
          {parsedData.employment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Employment History ({parsedData.employment.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedData.employment.map((emp, index) => {
                  const isDuplicate = currentData.employment.some(
                    (e) =>
                      e.company.toLowerCase() === emp.company.toLowerCase() &&
                      e.jobTitle.toLowerCase() === emp.jobTitle.toLowerCase()
                  );
                  return (
                    <label
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedEmployment.has(index)}
                          onChange={() => toggleEmployment(index)}
                          disabled={isDuplicate}
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{emp.jobTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {emp.company}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {emp.startDate || "N/A"} -{" "}
                            {emp.currentlyWorking ? "Present" : emp.endDate || "N/A"}
                          </div>
                        </div>
                      </div>
                      {isDuplicate && (
                        <Badge variant="outline">Already exists</Badge>
                      )}
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {parsedData.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Education ({parsedData.education.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedData.education.map((edu, index) => {
                  const isDuplicate = currentData.education.some(
                    (e) =>
                      e.qualification.toLowerCase() ===
                      edu.qualification.toLowerCase()
                  );
                  return (
                    <label
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedEducation.has(index)}
                          onChange={() => toggleEducation(index)}
                          disabled={isDuplicate}
                          className="w-4 h-4 mt-1"
                        />
                        <div>
                          <div className="font-medium">{edu.qualification}</div>
                          {edu.institution && (
                            <div className="text-sm text-muted-foreground">
                              {edu.institution}
                            </div>
                          )}
                          {(edu.startYear || edu.endYear) && (
                            <div className="text-xs text-muted-foreground">
                              {edu.startYear} - {edu.endYear || "Present"}
                            </div>
                          )}
                        </div>
                      </div>
                      {isDuplicate && (
                        <Badge variant="outline">Already exists</Badge>
                      )}
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {parsedData.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Certifications ({parsedData.certifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedData.certifications.map((cert, index) => {
                  const isDuplicate = currentData.certifications.some(
                    (c) => c.name.toLowerCase() === cert.name.toLowerCase()
                  );
                  return (
                    <label
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedCertifications.has(index)}
                          onChange={() => toggleCertification(index)}
                          disabled={isDuplicate}
                          className="w-4 h-4 mt-1"
                        />
                        <div>
                          <div className="font-medium">{cert.name}</div>
                          {cert.issuingOrganization && (
                            <div className="text-sm text-muted-foreground">
                              {cert.issuingOrganization}
                            </div>
                          )}
                        </div>
                      </div>
                      {isDuplicate && (
                        <Badge variant="outline">Already exists</Badge>
                      )}
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {parsedData.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages ({parsedData.languages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedData.languages.map((lang, index) => {
                  const isDuplicate = currentData.languages.some(
                    (l) => l.language.toLowerCase() === lang.language.toLowerCase()
                  );
                  return (
                    <label
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.has(index)}
                          onChange={() => toggleLanguage(index)}
                          disabled={isDuplicate}
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="font-medium">{lang.language}</span>
                          {lang.proficiency && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({lang.proficiency})
                            </span>
                          )}
                        </div>
                      </div>
                      {isDuplicate && (
                        <Badge variant="outline">Already exists</Badge>
                      )}
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t p-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {hasSelections
              ? "Selected items will be added to the candidate profile"
              : "No items selected"}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!hasSelections || isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              {isPending ? "Applying..." : "Apply Selected Data"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoComparison({
  label,
  current,
  extracted,
}: {
  label: string;
  current: string | null;
  extracted: string | null | undefined;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Current:</div>
          <div>{current || <span className="text-muted-foreground">—</span>}</div>
        </div>
        <div className="text-muted-foreground">→</div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Extracted:</div>
          <div className={extracted ? "font-medium" : ""}>
            {extracted || <span className="text-muted-foreground">—</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
