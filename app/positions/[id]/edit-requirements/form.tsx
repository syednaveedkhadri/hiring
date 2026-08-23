"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { updateHiringRequirements } from "./actions";
import type { Position } from "@prisma/client";

type EditRequirementsFormProps = {
  position: Position;
};

export function EditRequirementsForm({ position }: EditRequirementsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [jobDescription, setJobDescription] = useState(position.jobDescription || "");
  const [mandatoryRequirements, setMandatoryRequirements] = useState(
    position.mandatoryRequirements || ""
  );
  const [preferredRequirements, setPreferredRequirements] = useState(
    position.preferredRequirements || ""
  );
  const [minimumExperience, setMinimumExperience] = useState(
    position.minimumExperience?.toString() || ""
  );
  const [preferredExperience, setPreferredExperience] = useState(
    position.preferredExperience?.toString() || ""
  );
  const [requiredSkills, setRequiredSkills] = useState(position.requiredSkills || "");
  const [preferredSkills, setPreferredSkills] = useState(position.preferredSkills || "");
  const [educationRequirements, setEducationRequirements] = useState(
    position.educationRequirements || ""
  );
  const [certificationRequirements, setCertificationRequirements] = useState(
    position.certificationRequirements || ""
  );
  const [joiningAvailabilityPreference, setJoiningAvailabilityPreference] = useState(
    position.joiningAvailabilityPreference || ""
  );
  const [specialRequirements, setSpecialRequirements] = useState(
    position.specialRequirements || ""
  );
  const [whatMattersMost, setWhatMattersMost] = useState(position.whatMattersMost || "");
  const [majorConcerns, setMajorConcerns] = useState(position.majorConcerns || "");
  const [aiEvaluationInstructions, setAiEvaluationInstructions] = useState(
    position.aiEvaluationInstructions || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data = {
      jobDescription: jobDescription || undefined,
      mandatoryRequirements: mandatoryRequirements || undefined,
      preferredRequirements: preferredRequirements || undefined,
      minimumExperience: minimumExperience ? parseFloat(minimumExperience) : undefined,
      preferredExperience: preferredExperience ? parseFloat(preferredExperience) : undefined,
      requiredSkills: requiredSkills || undefined,
      preferredSkills: preferredSkills || undefined,
      educationRequirements: educationRequirements || undefined,
      certificationRequirements: certificationRequirements || undefined,
      joiningAvailabilityPreference: joiningAvailabilityPreference || undefined,
      specialRequirements: specialRequirements || undefined,
      whatMattersMost: whatMattersMost || undefined,
      majorConcerns: majorConcerns || undefined,
      aiEvaluationInstructions: aiEvaluationInstructions || undefined,
    };

    startTransition(async () => {
      try {
        await updateHiringRequirements(position.id, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update hiring requirements");
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/positions/${position.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Position
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Edit Hiring Requirements</h1>
          <p className="text-muted-foreground mt-2">{position.title}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Error</p>
                    <p className="text-sm text-destructive/90 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Detailed description of the role, responsibilities, and expectations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Describe the role, key responsibilities, team structure, reporting lines, etc."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                Define what candidates must have vs. what would be nice to have
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mandatoryRequirements">Mandatory Requirements</Label>
                <Textarea
                  id="mandatoryRequirements"
                  value={mandatoryRequirements}
                  onChange={(e) => setMandatoryRequirements(e.target.value)}
                  placeholder="List requirements that are absolutely required (deal-breakers)"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="preferredRequirements">Preferred Requirements</Label>
                <Textarea
                  id="preferredRequirements"
                  value={preferredRequirements}
                  onChange={(e) => setPreferredRequirements(e.target.value)}
                  placeholder="List nice-to-have requirements that give candidates an edge"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Experience Requirements</CardTitle>
              <CardDescription>
                Specify minimum and preferred years of experience
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumExperience">Minimum Experience (years)</Label>
                <Input
                  id="minimumExperience"
                  type="number"
                  step="0.5"
                  min="0"
                  value={minimumExperience}
                  onChange={(e) => setMinimumExperience(e.target.value)}
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <Label htmlFor="preferredExperience">Preferred Experience (years)</Label>
                <Input
                  id="preferredExperience"
                  type="number"
                  step="0.5"
                  min="0"
                  value={preferredExperience}
                  onChange={(e) => setPreferredExperience(e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                List technical and soft skills required and preferred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requiredSkills">Required Skills</Label>
                <Textarea
                  id="requiredSkills"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="List must-have skills (e.g., React, Node.js, TypeScript, etc.)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="preferredSkills">Preferred Skills</Label>
                <Textarea
                  id="preferredSkills"
                  value={preferredSkills}
                  onChange={(e) => setPreferredSkills(e.target.value)}
                  placeholder="List bonus skills that would be valuable"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Education & Certifications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Education & Certifications</CardTitle>
              <CardDescription>
                Specify education and certification requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="educationRequirements">Education Requirements</Label>
                <Textarea
                  id="educationRequirements"
                  value={educationRequirements}
                  onChange={(e) => setEducationRequirements(e.target.value)}
                  placeholder="e.g., Bachelor's in Computer Science required, Master's preferred"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="certificationRequirements">Certification Requirements</Label>
                <Textarea
                  id="certificationRequirements"
                  value={certificationRequirements}
                  onChange={(e) => setCertificationRequirements(e.target.value)}
                  placeholder="e.g., AWS Certified Solutions Architect, PMP, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability & Special Requirements */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Availability & Special Requirements</CardTitle>
              <CardDescription>
                Joining timeline and any special constraints or requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="joiningAvailabilityPreference">
                  Joining/Availability Preference
                </Label>
                <Textarea
                  id="joiningAvailabilityPreference"
                  value={joiningAvailabilityPreference}
                  onChange={(e) => setJoiningAvailabilityPreference(e.target.value)}
                  placeholder="e.g., Must be able to join within 30 days, immediate joiners preferred"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g., Willingness to travel, specific location requirements, security clearance, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Evaluation Guidance */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Evaluation Guidance</CardTitle>
              <CardDescription>
                Give specific instructions to the AI on how to evaluate candidates for this role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatMattersMost">What Matters Most For This Hire</Label>
                <Textarea
                  id="whatMattersMost"
                  value={whatMattersMost}
                  onChange={(e) => setWhatMattersMost(e.target.value)}
                  placeholder="e.g., Strong problem-solving ability is more important than specific tech stack experience. Cultural fit and communication skills are critical."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Help the AI understand your priorities and trade-offs
                </p>
              </div>

              <div>
                <Label htmlFor="majorConcerns">Major Concerns / Disqualifying Gaps</Label>
                <Textarea
                  id="majorConcerns"
                  value={majorConcerns}
                  onChange={(e) => setMajorConcerns(e.target.value)}
                  placeholder="e.g., Lack of experience with distributed systems, poor communication skills, frequent job hopping, unrealistic salary expectations"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  What would make you reject a candidate or have serious concerns?
                </p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="aiEvaluationInstructions">
                  Additional AI Evaluation Instructions
                </Label>
                <Textarea
                  id="aiEvaluationInstructions"
                  value={aiEvaluationInstructions}
                  onChange={(e) => setAiEvaluationInstructions(e.target.value)}
                  placeholder="Any other specific instructions for the AI evaluator about how to assess candidates for this position"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  These instructions will be included in the AI evaluation prompt
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Save Requirements"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/positions/${position.id}`)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
