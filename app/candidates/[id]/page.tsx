import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CandidateStatusBadge } from "@/components/candidates/candidate-status-badge";
import { StatusChangeControl } from "@/components/candidates/status-change-control";
import { CVSection } from "@/components/candidates/cv-section";
import { InterviewsSection } from "@/components/candidates/interviews-section";
import { AIEvaluationSection } from "@/components/candidates/ai-evaluation-section";
import { ExternalAIReviewDialog } from "@/components/candidates/external-ai-review-dialog";
import { StructuredCVData } from "@/lib/cv/schemas";
import prisma from "@/lib/db/prisma";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Award,
  GraduationCap,
  Languages,
  Building2,
  FileText,
  Download
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getCandidate(id: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      position: true,
      photo: true,
      cv: {
        include: {
          document: true,
        },
      },
      skills: true,
      education: true,
      certifications: true,
      languages: true,
      employment: {
        orderBy: {
          startDate: "desc",
        },
      },
      notes: {
        orderBy: {
          createdAt: "desc",
        },
      },
      interviews: {
        orderBy: {
          interviewDate: "desc",
        },
        include: {
          scores: true,
        },
      },
      aiEvaluations: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          rankings: {
            orderBy: {
              recordedAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  return candidate;
}

export default async function CandidateProfilePage({ params }: PageProps) {
  const { id } = await params;
  const candidate = await getCandidate(id);

  if (!candidate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/candidates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <ExternalAIReviewDialog
              candidateId={candidate.id}
              candidateName={candidate.fullName}
            />
            <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20">
              <a href={`/api/candidates/${candidate.id}/pdf`} download>
                <Download className="h-4 w-4 mr-2" />
                Download Candidate Report
              </a>
            </Button>
          </div>
        </div>

        {/* Header with Photo */}
        <div className="mb-8">
          <Card className="p-6 bg-gradient-to-br from-card via-card to-purple-50/20 dark:to-purple-950/10 border-purple-200/30 dark:border-purple-800/20 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Avatar size="lg" className="w-32 h-32 ring-4 ring-purple-100 dark:ring-purple-900/30">
                  {candidate.photo?.fileUrl ? (
                    <AvatarImage src={candidate.photo.fileUrl} alt={candidate.fullName} />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-600 text-white">
                    {candidate.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">{candidate.fullName}</h1>
                    <p className="text-lg text-muted-foreground mt-1 font-mono">{candidate.candidateCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CandidateStatusBadge status={candidate.status} className="text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Position:</span>
                    <span>{candidate.position.title}</span>
                  </div>
                  {candidate.currentJobTitle && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Current Role:</span>
                      <span>{candidate.currentJobTitle}</span>
                    </div>
                  )}
                  {candidate.currentCompany && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Company:</span>
                      <span>{candidate.currentCompany}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="text-sm">{candidate.phone}</div>
                    </div>
                  </div>
                )}
                {candidate.whatsapp && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">WhatsApp</div>
                      <div className="text-sm">{candidate.whatsapp}</div>
                    </div>
                  </div>
                )}
                {candidate.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm">{candidate.email}</div>
                    </div>
                  </div>
                )}
                {candidate.currentCity && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="text-sm">{candidate.currentCity}{candidate.currentCountry ? `, ${candidate.currentCountry}` : ""}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total Experience</div>
                  <div className="text-lg font-semibold">{candidate.totalExperience !== null ? `${candidate.totalExperience} years` : "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Relevant Experience</div>
                  <div className="text-lg font-semibold">{candidate.relevantExperience !== null ? `${candidate.relevantExperience} years` : "Not specified"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Compensation & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Current Salary</div>
                  <div className="text-sm">{candidate.currentSalary ? `${candidate.salaryCurrency} ${Number(candidate.currentSalary).toLocaleString()}` : "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Expected Salary</div>
                  <div className="text-sm">{candidate.expectedSalary ? `${candidate.salaryCurrency} ${Number(candidate.expectedSalary).toLocaleString()}` : "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Notice Period</div>
                  <div className="text-sm">{candidate.noticePeriod || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Joining Availability</div>
                  <div className="text-sm">{candidate.joiningAvailability || "Not specified"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {candidate.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium">{skill.skill}</span>
                        {skill.yearsExperience && (
                          <span className="text-sm text-muted-foreground">{skill.yearsExperience} years</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {candidate.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.education.map((edu) => (
                    <div key={edu.id} className="pb-4 border-b last:border-0">
                      <div className="font-medium">{edu.qualification}</div>
                      {edu.institution && <div className="text-sm text-muted-foreground">{edu.institution}</div>}
                      {edu.specialization && <div className="text-sm">{edu.specialization}</div>}
                      {(edu.startYear || edu.endYear) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {edu.startYear} - {edu.endYear || "Present"}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {candidate.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.certifications.map((cert) => (
                    <div key={cert.id} className="pb-3 border-b last:border-0">
                      <div className="font-medium">{cert.name}</div>
                      {cert.issuingOrganization && <div className="text-sm text-muted-foreground">{cert.issuingOrganization}</div>}
                      {cert.issueDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          {cert.expiryDate && ` | Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {candidate.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {candidate.languages.map((lang) => (
                      <div key={lang.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium">{lang.language}</span>
                        {lang.proficiency && <span className="text-xs text-muted-foreground">{lang.proficiency}</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employment History */}
            {candidate.employment.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Employment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.employment.map((emp) => (
                    <div key={emp.id} className="pb-4 border-b last:border-0">
                      <div className="font-medium">{emp.jobTitle}</div>
                      <div className="text-sm text-muted-foreground">{emp.company}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "N/A"} -{" "}
                        {emp.currentlyWorking ? "Present" : emp.endDate ? new Date(emp.endDate).toLocaleDateString() : "N/A"}
                      </div>
                      {emp.description && <div className="text-sm mt-2">{emp.description}</div>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Position Info */}
            <Card>
              <CardHeader>
                <CardTitle>Position Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Position</div>
                  <div className="font-medium">{candidate.position.title}</div>
                </div>
                {candidate.position.department && (
                  <div>
                    <div className="text-xs text-muted-foreground">Department</div>
                    <div className="text-sm">{candidate.position.department}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Status</div>
                  <StatusChangeControl
                    candidateId={candidate.id}
                    currentStatus={candidate.status}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Registered On</div>
                  <div className="text-sm">{new Date(candidate.createdAt).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            {candidate.notes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.notes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted/50 rounded text-sm">
                      <div>{note.note}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {note.createdBy && `${note.createdBy} • `}
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* CV Section */}
            <CVSection
              candidateId={candidate.id}
              candidateData={{
                id: candidate.id,
                fullName: candidate.fullName,
                email: candidate.email,
                phone: candidate.phone,
                currentCity: candidate.currentCity,
                currentCountry: candidate.currentCountry,
                currentCompany: candidate.currentCompany,
                currentJobTitle: candidate.currentJobTitle,
                totalExperience: candidate.totalExperience,
                skills: candidate.skills,
                employment: candidate.employment,
                education: candidate.education,
                certifications: candidate.certifications,
                languages: candidate.languages,
              }}
              cvData={candidate.cv ? {
                id: candidate.cv.id,
                documentId: candidate.cv.documentId,
                extractedText: candidate.cv.extractedText,
                parsedData: candidate.cv.parsedData as unknown as StructuredCVData | null,
                extractionStatus: candidate.cv.extractionStatus,
                extractionError: candidate.cv.extractionError,
                extractedAt: candidate.cv.extractedAt,
                createdAt: candidate.cv.createdAt,
                document: candidate.cv.document,
              } : null}
            />

            {/* Interviews Section */}
            <InterviewsSection
              candidateId={candidate.id}
              interviews={candidate.interviews.map((interview) => ({
                id: interview.id,
                interviewType: interview.interviewType,
                interviewDate: interview.interviewDate,
                interviewerId: interview.interviewerId,
                interviewLocation: interview.interviewLocation,
                strengths: interview.strengths,
                concerns: interview.concerns,
                scores: interview.scores,
              }))}
            />

            {/* AI Evaluation */}
            <AIEvaluationSection
              candidateId={candidate.id}
              evaluation={candidate.aiEvaluations[0] ? {
                id: candidate.aiEvaluations[0].id,
                overallScore: candidate.aiEvaluations[0].overallScore,
                confidence: candidate.aiEvaluations[0].confidence,
                recommendation: candidate.aiEvaluations[0].recommendation,
                jobRequirementScore: candidate.aiEvaluations[0].jobRequirementScore,
                experienceScore: candidate.aiEvaluations[0].experienceScore,
                skillsScore: candidate.aiEvaluations[0].skillsScore,
                technicalScore: candidate.aiEvaluations[0].technicalScore,
                interviewScore: candidate.aiEvaluations[0].interviewScore,
                practicalScore: candidate.aiEvaluations[0].practicalScore,
                salaryFitScore: candidate.aiEvaluations[0].salaryFitScore,
                availabilityScore: candidate.aiEvaluations[0].availabilityScore,
                educationScore: candidate.aiEvaluations[0].educationScore,
                certificationScore: candidate.aiEvaluations[0].certificationScore,
                strengths: candidate.aiEvaluations[0].strengths as Array<{ title: string; evidence: string | null }>,
                weaknesses: candidate.aiEvaluations[0].weaknesses as Array<{ title: string; evidence: string | null }>,
                requirementGaps: candidate.aiEvaluations[0].requirementGaps as Array<{ requirement: string; status: string; evidence: string | null }>,
                missingInformation: candidate.aiEvaluations[0].missingInformation as string[],
                summary: candidate.aiEvaluations[0].summary,
                createdAt: candidate.aiEvaluations[0].createdAt,
                rankings: candidate.aiEvaluations[0].rankings,
              } : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
