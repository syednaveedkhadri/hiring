"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Building2,
  FileText,
  RefreshCw
} from "lucide-react";
import { createCandidate } from "../actions";
import { extractCVForRegistration } from "./cv-extract-action";
import { StructuredCVData } from "@/lib/cv/schemas";

type Position = {
  id: string;
  title: string;
  department: string | null;
};

type Skill = {
  id: string;
  skill: string;
  yearsExperience: string;
};

type Education = {
  id: string;
  qualification: string;
  institution: string;
  specialization: string;
  startYear: string;
  endYear: string;
};

type Certification = {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
};

type Language = {
  id: string;
  language: string;
  proficiency: string;
};

type Employment = {
  id: string;
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
};

type NewCandidateFormProps = {
  positions: Position[];
};

export function NewCandidateForm({ positions }: NewCandidateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  const [extractedCVData, setExtractedCVData] = useState<StructuredCVData | null>(null);
  const [manuallyEditedFields, setManuallyEditedFields] = useState<Set<string>>(new Set());

  // Form arrays
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [employment, setEmployment] = useState<Employment[]>([]);

  // Refs for form inputs
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const currentCityRef = useRef<HTMLInputElement>(null);
  const currentCountryRef = useRef<HTMLInputElement>(null);
  const currentCompanyRef = useRef<HTMLInputElement>(null);
  const currentJobTitleRef = useRef<HTMLInputElement>(null);
  const totalExperienceRef = useRef<HTMLInputElement>(null);
  const relevantExperienceRef = useRef<HTMLInputElement>(null);

  // Populate form from extracted CV data
  useEffect(() => {
    if (!extractedCVData) return;

    const data = extractedCVData;

    // Helper to check if field was manually edited
    const shouldPopulate = (fieldName: string) => !manuallyEditedFields.has(fieldName);

    // Populate text fields only (refs don't trigger re-renders)
    if (data.fullName && shouldPopulate("fullName") && fullNameRef.current) {
      fullNameRef.current.value = data.fullName;
    }
    if (data.phone && shouldPopulate("phone") && phoneRef.current) {
      phoneRef.current.value = data.phone;
    }
    if (data.phone && shouldPopulate("whatsapp") && whatsappRef.current && !whatsappRef.current.value) {
      whatsappRef.current.value = data.phone; // Default WhatsApp to phone
    }
    if (data.email && shouldPopulate("email") && emailRef.current) {
      emailRef.current.value = data.email;
    }
    if (data.location && shouldPopulate("currentCity") && currentCityRef.current) {
      // Try to parse location into city/country
      const parts = data.location.split(",").map(p => p.trim());
      if (parts.length > 0) {
        currentCityRef.current.value = parts[0];
      }
      if (parts.length > 1 && currentCountryRef.current && shouldPopulate("currentCountry")) {
        currentCountryRef.current.value = parts[parts.length - 1];
      }
    }
    if (data.currentCompany && shouldPopulate("currentCompany") && currentCompanyRef.current) {
      currentCompanyRef.current.value = data.currentCompany;
    }
    if (data.currentJobTitle && shouldPopulate("currentJobTitle") && currentJobTitleRef.current) {
      currentJobTitleRef.current.value = data.currentJobTitle;
    }
    if (data.totalExperienceYears !== null && data.totalExperienceYears !== undefined && shouldPopulate("totalExperience") && totalExperienceRef.current) {
      totalExperienceRef.current.value = data.totalExperienceYears.toString();
    }
  }, [extractedCVData, manuallyEditedFields]);

  // Mark field as manually edited
  const markAsEdited = (fieldName: string) => {
    setManuallyEditedFields(prev => new Set(prev).add(fieldName));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCVChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please select a PDF, DOCX, JPG, JPEG, or PNG file");
      return;
    }
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("CV file size must be less than 10MB");
      return;
    }

    setError(null);
    setCvFileName(file.name);
    setIsExtractingCV(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const result = await extractCVForRegistration(formData);

      if (result.success && result.data) {
        const data = result.data;
        setExtractedCVData(data);
        setError(null);

        // Populate arrays (only if they're empty - don't overwrite manual entries)
        if (data.skills && data.skills.length > 0 && skills.length === 0) {
          setSkills(data.skills.map((s, i) => ({
            id: `extracted-${i}`,
            skill: s.name,
            yearsExperience: s.yearsExperience?.toString() || "",
          })));
        }

        if (data.education && data.education.length > 0 && education.length === 0) {
          setEducation(data.education.map((e, i) => ({
            id: `extracted-${i}`,
            qualification: e.qualification,
            institution: e.institution || "",
            specialization: e.specialization || "",
            startYear: e.startYear?.toString() || "",
            endYear: e.endYear?.toString() || "",
          })));
        }

        if (data.certifications && data.certifications.length > 0 && certifications.length === 0) {
          setCertifications(data.certifications.map((c, i) => ({
            id: `extracted-${i}`,
            name: c.name,
            issuingOrganization: c.issuingOrganization || "",
            issueDate: c.issueDate || "",
            expiryDate: c.expiryDate || "",
          })));
        }

        if (data.languages && data.languages.length > 0 && languages.length === 0) {
          setLanguages(data.languages.map((l, i) => ({
            id: `extracted-${i}`,
            language: l.language,
            proficiency: l.proficiency || "",
          })));
        }

        if (data.employment && data.employment.length > 0 && employment.length === 0) {
          setEmployment(data.employment.map((e, i) => ({
            id: `extracted-${i}`,
            company: e.company,
            jobTitle: e.jobTitle,
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            currentlyWorking: e.currentlyWorking,
            description: e.description || "",
          })));
        }
      } else {
        setError(result.error || "Failed to extract CV data");
        setExtractedCVData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process CV");
      setExtractedCVData(null);
    } finally {
      setIsExtractingCV(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Add array data as JSON
    formData.set("skills", JSON.stringify(skills.map(s => ({
      skill: s.skill,
      yearsExperience: s.yearsExperience ? parseFloat(s.yearsExperience) : null,
    }))));

    formData.set("education", JSON.stringify(education.map(e => ({
      qualification: e.qualification,
      institution: e.institution || null,
      specialization: e.specialization || null,
      startYear: e.startYear ? parseInt(e.startYear) : null,
      endYear: e.endYear ? parseInt(e.endYear) : null,
    }))));

    formData.set("certifications", JSON.stringify(certifications.map(c => ({
      name: c.name,
      issuingOrganization: c.issuingOrganization || null,
      issueDate: c.issueDate || null,
      expiryDate: c.expiryDate || null,
    }))));

    formData.set("languages", JSON.stringify(languages.map(l => ({
      language: l.language,
      proficiency: l.proficiency || null,
    }))));

    formData.set("employment", JSON.stringify(employment.map(e => ({
      company: e.company,
      jobTitle: e.jobTitle,
      startDate: e.startDate || null,
      endDate: e.endDate || null,
      currentlyWorking: e.currentlyWorking,
      description: e.description || null,
    }))));

    startTransition(async () => {
      try {
        await createCandidate(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create candidate");
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/candidates">
              <ArrowLeft className="h-4 w-4" />
              Back to Candidates
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Add Candidate</h1>
          <p className="text-muted-foreground mt-2">
            Register a new candidate during recruitment interview
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-border relative">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="photo">Upload Photo</Label>
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, or WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CV / Resume Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CV / Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <Label htmlFor="cv">Upload CV / Resume (Optional - autofill form)</Label>
                  <Input
                    id="cv"
                    name="cv"
                    type="file"
                    accept=".pdf,.docx,image/jpeg,image/jpg,image/png"
                    onChange={handleCVChange}
                    disabled={isExtractingCV}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, JPG, JPEG, or PNG. Max 10MB. Form fields will be auto-filled from CV.
                  </p>
                  {isExtractingCV && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Extracting CV data...
                    </p>
                  )}
                  {cvFileName && !isExtractingCV && extractedCVData && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {cvFileName} - Data extracted successfully!
                    </p>
                  )}
                  {cvFileName && !isExtractingCV && !extractedCVData && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {cvFileName} - Review and edit fields below
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="positionId">
                  Position Applied For <span className="text-destructive">*</span>
                </Label>
                <select
                  id="positionId"
                  name="positionId"
                  required
                  className="mt-2 h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select a position...</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title} {position.department ? `- ${position.department}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    ref={fullNameRef}
                    id="fullName"
                    name="fullName"
                    required
                    placeholder="John Doe"
                    className="mt-2"
                    onChange={() => markAsEdited("fullName")}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    ref={phoneRef}
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    className="mt-2"
                    onChange={() => markAsEdited("phone")}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    ref={whatsappRef}
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="+1234567890"
                    className="mt-2"
                    onChange={() => markAsEdited("whatsapp")}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="mt-2"
                    onChange={() => markAsEdited("email")}
                  />
                </div>
                <div>
                  <Label htmlFor="currentCity">Current City</Label>
                  <Input
                    ref={currentCityRef}
                    id="currentCity"
                    name="currentCity"
                    placeholder="Mumbai"
                    className="mt-2"
                    onChange={() => markAsEdited("currentCity")}
                  />
                </div>
                <div>
                  <Label htmlFor="currentCountry">Current Country</Label>
                  <Input
                    ref={currentCountryRef}
                    id="currentCountry"
                    name="currentCountry"
                    placeholder="India"
                    className="mt-2"
                    onChange={() => markAsEdited("currentCountry")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    ref={currentCompanyRef}
                    id="currentCompany"
                    name="currentCompany"
                    placeholder="Acme Corp"
                    className="mt-2"
                    onChange={() => markAsEdited("currentCompany")}
                  />
                </div>
                <div>
                  <Label htmlFor="currentJobTitle">Current Job Title</Label>
                  <Input
                    ref={currentJobTitleRef}
                    id="currentJobTitle"
                    name="currentJobTitle"
                    placeholder="Senior Developer"
                    className="mt-2"
                    onChange={() => markAsEdited("currentJobTitle")}
                  />
                </div>
                <div>
                  <Label htmlFor="totalExperience">Total Experience (Years)</Label>
                  <Input
                    ref={totalExperienceRef}
                    id="totalExperience"
                    name="totalExperience"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="5.5"
                    className="mt-2"
                    onChange={() => markAsEdited("totalExperience")}
                  />
                </div>
                <div>
                  <Label htmlFor="relevantExperience">Relevant Experience (Years)</Label>
                  <Input
                    ref={relevantExperienceRef}
                    id="relevantExperience"
                    name="relevantExperience"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="3.5"
                    className="mt-2"
                    onChange={() => markAsEdited("relevantExperience")}
                  />
                </div>
                <div>
                  <Label htmlFor="currentSalary">Current Salary</Label>
                  <Input
                    id="currentSalary"
                    name="currentSalary"
                    type="number"
                    min="0"
                    placeholder="50000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="expectedSalary">Expected Salary</Label>
                  <Input
                    id="expectedSalary"
                    name="expectedSalary"
                    type="number"
                    min="0"
                    placeholder="60000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryCurrency">Salary Currency</Label>
                  <Input
                    id="salaryCurrency"
                    name="salaryCurrency"
                    defaultValue="INR"
                    placeholder="INR"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="noticePeriod">Notice Period</Label>
                  <Input
                    id="noticePeriod"
                    name="noticePeriod"
                    placeholder="30 days"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="joiningAvailability">Joining Availability</Label>
                  <Input
                    id="joiningAvailability"
                    name="joiningAvailability"
                    placeholder="Immediate / 1 month"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <SkillsSection skills={skills} setSkills={setSkills} />

          {/* Education */}
          <EducationSection education={education} setEducation={setEducation} />

          {/* Certifications */}
          <CertificationsSection certifications={certifications} setCertifications={setCertifications} />

          {/* Languages */}
          <LanguagesSection languages={languages} setLanguages={setLanguages} />

          {/* Employment History */}
          <EmploymentSection employment={employment} setEmployment={setEmployment} />

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Internal Notes
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                These notes are internal and will not be shared with the candidate
              </p>
            </CardHeader>
            <CardContent>
              <Label htmlFor="note">Recruiter Notes</Label>
              <textarea
                id="note"
                name="note"
                className="mt-2 w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Add any internal notes about this candidate..."
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending ? "Creating..." : "Create Candidate"}
            </Button>
            <Button type="button" variant="outline" size="lg" asChild>
              <Link href="/candidates">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component sections

function SkillsSection({ skills, setSkills }: { skills: Skill[]; setSkills: (skills: Skill[]) => void }) {
  const addSkill = () => {
    setSkills([...skills, { id: Date.now().toString(), skill: "", yearsExperience: "" }]);
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(skills.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills
          </CardTitle>
          <Button type="button" size="sm" onClick={addSkill}>
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        ) : (
          skills.map((skill) => (
            <div key={skill.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`skill-${skill.id}`}>Skill Name</Label>
                  <Input
                    id={`skill-${skill.id}`}
                    value={skill.skill}
                    onChange={(e) => updateSkill(skill.id, "skill", e.target.value)}
                    placeholder="JavaScript"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor={`skill-exp-${skill.id}`}>Years of Experience</Label>
                  <Input
                    id={`skill-exp-${skill.id}`}
                    type="number"
                    step="0.5"
                    min="0"
                    value={skill.yearsExperience}
                    onChange={(e) => updateSkill(skill.id, "yearsExperience", e.target.value)}
                    placeholder="3.5"
                    className="mt-2"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSkill(skill.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function EducationSection({ education, setEducation }: { education: Education[]; setEducation: (education: Education[]) => void }) {
  const addEducation = () => {
    setEducation([...education, {
      id: Date.now().toString(),
      qualification: "",
      institution: "",
      specialization: "",
      startYear: "",
      endYear: "",
    }]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
          <Button type="button" size="sm" onClick={addEducation}>
            <Plus className="h-4 w-4" />
            Add Education
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {education.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education records added yet</p>
        ) : (
          education.map((edu) => (
            <div key={edu.id} className="p-4 border border-border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Qualification</Label>
                  <Input
                    value={edu.qualification}
                    onChange={(e) => updateEducation(edu.id, "qualification", e.target.value)}
                    placeholder="Bachelor of Science"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                    placeholder="University Name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Specialization</Label>
                  <Input
                    value={edu.specialization}
                    onChange={(e) => updateEducation(edu.id, "specialization", e.target.value)}
                    placeholder="Computer Science"
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Start Year</Label>
                    <Input
                      type="number"
                      value={edu.startYear}
                      onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)}
                      placeholder="2015"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>End Year</Label>
                    <Input
                      type="number"
                      value={edu.endYear}
                      onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)}
                      placeholder="2019"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CertificationsSection({ certifications, setCertifications }: { certifications: Certification[]; setCertifications: (certifications: Certification[]) => void }) {
  const addCertification = () => {
    setCertifications([...certifications, {
      id: Date.now().toString(),
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expiryDate: "",
    }]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications
          </CardTitle>
          <Button type="button" size="sm" onClick={addCertification}>
            <Plus className="h-4 w-4" />
            Add Certification
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {certifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No certifications added yet</p>
        ) : (
          certifications.map((cert) => (
            <div key={cert.id} className="p-4 border border-border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Certification Name</Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                    placeholder="AWS Certified Developer"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Issuing Organization</Label>
                  <Input
                    value={cert.issuingOrganization}
                    onChange={(e) => updateCertification(cert.id, "issuingOrganization", e.target.value)}
                    placeholder="Amazon Web Services"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={cert.expiryDate}
                    onChange={(e) => updateCertification(cert.id, "expiryDate", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCertification(cert.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function LanguagesSection({ languages, setLanguages }: { languages: Language[]; setLanguages: (languages: Language[]) => void }) {
  const addLanguage = () => {
    setLanguages([...languages, { id: Date.now().toString(), language: "", proficiency: "" }]);
  };

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter(l => l.id !== id));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setLanguages(languages.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages
          </CardTitle>
          <Button type="button" size="sm" onClick={addLanguage}>
            <Plus className="h-4 w-4" />
            Add Language
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {languages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No languages added yet</p>
        ) : (
          languages.map((lang) => (
            <div key={lang.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <Input
                    value={lang.language}
                    onChange={(e) => updateLanguage(lang.id, "language", e.target.value)}
                    placeholder="English"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Proficiency</Label>
                  <Input
                    value={lang.proficiency}
                    onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value)}
                    placeholder="Native / Fluent / Intermediate"
                    className="mt-2"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLanguage(lang.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function EmploymentSection({ employment, setEmployment }: { employment: Employment[]; setEmployment: (employment: Employment[]) => void }) {
  const addEmployment = () => {
    setEmployment([...employment, {
      id: Date.now().toString(),
      company: "",
      jobTitle: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    }]);
  };

  const removeEmployment = (id: string) => {
    setEmployment(employment.filter(e => e.id !== id));
  };

  const updateEmployment = (id: string, field: keyof Employment, value: string | boolean) => {
    setEmployment(employment.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Employment History
          </CardTitle>
          <Button type="button" size="sm" onClick={addEmployment}>
            <Plus className="h-4 w-4" />
            Add Employment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {employment.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employment history added yet</p>
        ) : (
          employment.map((emp) => (
            <div key={emp.id} className="p-4 border border-border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <Input
                    value={emp.company}
                    onChange={(e) => updateEmployment(emp.id, "company", e.target.value)}
                    placeholder="Company Name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Job Title</Label>
                  <Input
                    value={emp.jobTitle}
                    onChange={(e) => updateEmployment(emp.id, "jobTitle", e.target.value)}
                    placeholder="Software Engineer"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={emp.startDate}
                    onChange={(e) => updateEmployment(emp.id, "startDate", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={emp.endDate}
                    onChange={(e) => updateEmployment(emp.id, "endDate", e.target.value)}
                    disabled={emp.currentlyWorking}
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={emp.currentlyWorking}
                      onChange={(e) => updateEmployment(emp.id, "currentlyWorking", e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">Currently working here</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <Label>Description / Responsibilities</Label>
                  <textarea
                    value={emp.description}
                    onChange={(e) => updateEmployment(emp.id, "description", e.target.value)}
                    className="mt-2 w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Describe responsibilities and achievements..."
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeEmployment(emp.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
