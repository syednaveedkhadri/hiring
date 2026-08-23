import prisma from "@/lib/db/prisma";

export type QuestionGenerationInput = {
  position: {
    title: string;
    jobDescription: string | null;
    mandatoryRequirements: string | null;
    preferredRequirements: string | null;
    requiredSkills: string | null;
    preferredSkills: string | null;
    whatMattersMost: string | null;
    majorConcerns: string | null;
  };
  candidate: {
    fullName: string;
    currentJobTitle: string | null;
    currentCompany: string | null;
    totalExperience: number | null;
    relevantExperience: number | null;
  };
  skills: Array<{
    skill: string;
    yearsExperience: number | null;
  }>;
  education: Array<{
    qualification: string;
    institution: string | null;
    specialization: string | null;
  }>;
  employment: Array<{
    company: string;
    jobTitle: string;
    description: string | null;
  }>;
};

/**
 * Build question generation input for a candidate
 */
export async function buildQuestionGenerationInput(
  candidateId: string
): Promise<QuestionGenerationInput | null> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      position: true,
      skills: true,
      education: true,
      employment: {
        orderBy: { startDate: "desc" },
        take: 5, // Recent 5 jobs
      },
    },
  });

  if (!candidate) {
    return null;
  }

  return {
    position: {
      title: candidate.position.title,
      jobDescription: candidate.position.jobDescription,
      mandatoryRequirements: candidate.position.mandatoryRequirements,
      preferredRequirements: candidate.position.preferredRequirements,
      requiredSkills: candidate.position.requiredSkills,
      preferredSkills: candidate.position.preferredSkills,
      whatMattersMost: candidate.position.whatMattersMost,
      majorConcerns: candidate.position.majorConcerns,
    },
    candidate: {
      fullName: candidate.fullName,
      currentJobTitle: candidate.currentJobTitle,
      currentCompany: candidate.currentCompany,
      totalExperience: candidate.totalExperience
        ? Number(candidate.totalExperience)
        : null,
      relevantExperience: candidate.relevantExperience
        ? Number(candidate.relevantExperience)
        : null,
    },
    skills: candidate.skills.map((skill) => ({
      skill: skill.skill,
      yearsExperience: skill.yearsExperience ? Number(skill.yearsExperience) : null,
    })),
    education: candidate.education.map((edu) => ({
      qualification: edu.qualification,
      institution: edu.institution,
      specialization: edu.specialization,
    })),
    employment: candidate.employment.map((emp) => ({
      company: emp.company,
      jobTitle: emp.jobTitle,
      description: emp.description,
    })),
  };
}
