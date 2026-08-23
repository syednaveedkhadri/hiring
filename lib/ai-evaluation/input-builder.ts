import prisma from "@/lib/db/prisma";

export type CandidateEvaluationInput = {
  position: {
    title: string;
    department: string | null;
    jobDescription: string | null;
    mandatoryRequirements: string | null;
    preferredRequirements: string | null;
    minimumExperience: number | null;
    preferredExperience: number | null;
    salaryMin: string | null;
    salaryMax: string | null;
    currency: string | null;
    requiredSkills: string | null;
    preferredSkills: string | null;
    educationRequirements: string | null;
    certificationRequirements: string | null;
    joiningAvailabilityPreference: string | null;
    specialRequirements: string | null;
    whatMattersMost: string | null;
    majorConcerns: string | null;
    aiEvaluationInstructions: string | null;
  };
  candidate: {
    fullName: string;
    currentJobTitle: string | null;
    currentCompany: string | null;
    currentCity: string | null;
    currentCountry: string | null;
    totalExperience: number | null;
    relevantExperience: number | null;
    currentSalary: string | null;
    expectedSalary: string | null;
    salaryCurrency: string | null;
    noticePeriod: string | null;
    joiningAvailability: string | null;
  };
  skills: Array<{
    skill: string;
    yearsExperience: number | null;
  }>;
  education: Array<{
    qualification: string;
    institution: string | null;
    specialization: string | null;
    startYear: number | null;
    endYear: number | null;
  }>;
  certifications: Array<{
    name: string;
    issuingOrganization: string | null;
  }>;
  employment: Array<{
    company: string;
    jobTitle: string;
    currentlyWorking: boolean;
    description: string | null;
  }>;
  languages: Array<{
    language: string;
    proficiency: string | null;
  }>;
  cv: {
    extractedText: string | null;
    parsedData: Record<string, unknown> | null;
  } | null;
  interviews: Array<{
    interviewType: string;
    overallNotes: string | null;
    strengths: string | null;
    concerns: string | null;
    scores: Array<{
      category: string;
      score: number;
      notes: string | null;
    }>;
    questions: Array<{
      question: string;
      performance: string | null;
      answer: string | null;
      notes: string | null;
    }>;
  }>;
};

/**
 * Build complete candidate evaluation input
 */
export async function buildCandidateEvaluationInput(
  candidateId: string
): Promise<CandidateEvaluationInput | null> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      position: true,
      skills: true,
      education: true,
      certifications: true,
      employment: {
        orderBy: { startDate: "desc" },
      },
      languages: true,
      cv: {
        include: {
          document: true,
        },
      },
      interviews: {
        where: {
          status: "COMPLETED",
        },
        orderBy: {
          interviewDate: "desc",
        },
        include: {
          scores: true,
          questions: true,
        },
      },
    },
  });

  if (!candidate) {
    return null;
  }

  return {
    position: {
      title: candidate.position.title,
      department: candidate.position.department,
      jobDescription: candidate.position.jobDescription,
      mandatoryRequirements: candidate.position.mandatoryRequirements,
      preferredRequirements: candidate.position.preferredRequirements,
      minimumExperience: candidate.position.minimumExperience
        ? Number(candidate.position.minimumExperience)
        : null,
      preferredExperience: candidate.position.preferredExperience
        ? Number(candidate.position.preferredExperience)
        : null,
      salaryMin: candidate.position.salaryMin?.toString() || null,
      salaryMax: candidate.position.salaryMax?.toString() || null,
      currency: candidate.position.currency,
      requiredSkills: candidate.position.requiredSkills,
      preferredSkills: candidate.position.preferredSkills,
      educationRequirements: candidate.position.educationRequirements,
      certificationRequirements: candidate.position.certificationRequirements,
      joiningAvailabilityPreference: candidate.position.joiningAvailabilityPreference,
      specialRequirements: candidate.position.specialRequirements,
      whatMattersMost: candidate.position.whatMattersMost,
      majorConcerns: candidate.position.majorConcerns,
      aiEvaluationInstructions: candidate.position.aiEvaluationInstructions,
    },
    candidate: {
      fullName: candidate.fullName,
      currentJobTitle: candidate.currentJobTitle,
      currentCompany: candidate.currentCompany,
      currentCity: candidate.currentCity,
      currentCountry: candidate.currentCountry,
      totalExperience: candidate.totalExperience
        ? Number(candidate.totalExperience)
        : null,
      relevantExperience: candidate.relevantExperience
        ? Number(candidate.relevantExperience)
        : null,
      currentSalary: candidate.currentSalary?.toString() || null,
      expectedSalary: candidate.expectedSalary?.toString() || null,
      salaryCurrency: candidate.salaryCurrency,
      noticePeriod: candidate.noticePeriod,
      joiningAvailability: candidate.joiningAvailability,
    },
    skills: candidate.skills.map((skill) => ({
      skill: skill.skill,
      yearsExperience: skill.yearsExperience ? Number(skill.yearsExperience) : null,
    })),
    education: candidate.education.map((edu) => ({
      qualification: edu.qualification,
      institution: edu.institution,
      specialization: edu.specialization,
      startYear: edu.startYear,
      endYear: edu.endYear,
    })),
    certifications: candidate.certifications.map((cert) => ({
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
    })),
    employment: candidate.employment.map((emp) => ({
      company: emp.company,
      jobTitle: emp.jobTitle,
      currentlyWorking: emp.currentlyWorking,
      description: emp.description,
    })),
    languages: candidate.languages.map((lang) => ({
      language: lang.language,
      proficiency: lang.proficiency,
    })),
    cv: candidate.cv
      ? {
          extractedText: candidate.cv.extractedText,
          parsedData: candidate.cv.parsedData as Record<string, unknown> | null,
        }
      : null,
    interviews: candidate.interviews.map((interview) => ({
      interviewType: interview.interviewType,
      overallNotes: interview.overallNotes,
      strengths: interview.strengths,
      concerns: interview.concerns,
      scores: interview.scores.map((score) => ({
        category: score.category,
        score: score.score,
        notes: score.notes,
      })),
      questions: interview.questions.map((question) => ({
        question: question.question,
        performance: question.performance,
        answer: question.answer,
        notes: question.notes,
      })),
    })),
  };
}
