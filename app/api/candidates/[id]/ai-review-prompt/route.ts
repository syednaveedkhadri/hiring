import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch complete candidate and position data
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        position: true,
        skills: true,
        education: true,
        certifications: true,
        languages: true,
        employment: {
          orderBy: {
            startDate: "desc",
          },
        },
        interviews: {
          orderBy: {
            interviewDate: "desc",
          },
          include: {
            scores: true,
            questions: true,
          },
        },
        cv: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const { position } = candidate;

    // Generate comprehensive review prompt
    const prompt = `# EXTERNAL AI CANDIDATE REVIEW REQUEST

## Instructions for AI Reviewer

You are conducting an independent, objective evaluation of a job candidate. Please analyze the information provided below and provide a comprehensive assessment.

**IMPORTANT EVALUATION GUIDELINES:**
- Base your evaluation ONLY on the evidence provided
- Do not assume information that is not explicitly stated
- Do not consider protected characteristics (age, gender, race, religion, etc.)
- Provide specific evidence from the candidate's profile to support your conclusions
- Be honest about gaps or missing information
- Focus strictly on job-related qualifications and fit

---

## POSITION REQUIREMENTS

**Position:** ${position.title}${position.department ? `\n**Department:** ${position.department}` : ""}

${position.jobDescription ? `### Job Description\n${position.jobDescription}\n` : ""}

${position.mandatoryRequirements ? `### Mandatory Requirements\n${position.mandatoryRequirements}\n` : ""}

${position.preferredRequirements ? `### Preferred Requirements\n${position.preferredRequirements}\n` : ""}

${position.requiredSkills ? `### Required Skills\n${position.requiredSkills}\n` : ""}

${position.preferredSkills ? `### Preferred Skills\n${position.preferredSkills}\n` : ""}

${position.educationRequirements ? `### Education Requirements\n${position.educationRequirements}\n` : ""}

${position.certificationRequirements ? `### Certification Requirements\n${position.certificationRequirements}\n` : ""}

${position.minimumExperience !== null || position.preferredExperience !== null ? `### Experience Requirements\n${position.minimumExperience !== null ? `- Minimum: ${position.minimumExperience} years\n` : ""}${position.preferredExperience !== null ? `- Preferred: ${position.preferredExperience} years\n` : ""}` : ""}

${position.salaryMin !== null || position.salaryMax !== null ? `### Salary Range\n${position.currency} ${position.salaryMin !== null ? Number(position.salaryMin).toLocaleString() : "N/A"} - ${position.salaryMax !== null ? Number(position.salaryMax).toLocaleString() : "N/A"}\n` : ""}

${position.joiningAvailabilityPreference ? `### Joining Availability Preference\n${position.joiningAvailabilityPreference}\n` : ""}

${position.whatMattersMost ? `### What Matters Most\n${position.whatMattersMost}\n` : ""}

${position.majorConcerns ? `### Major Concerns\n${position.majorConcerns}\n` : ""}

---

## CANDIDATE INFORMATION

**Name:** ${candidate.fullName}
**Candidate ID:** ${candidate.candidateCode}

### Professional Profile

${candidate.currentCompany ? `**Current Company:** ${candidate.currentCompany}\n` : ""}${candidate.currentJobTitle ? `**Current Job Title:** ${candidate.currentJobTitle}\n` : ""}${candidate.totalExperience !== null ? `**Total Experience:** ${candidate.totalExperience} years\n` : ""}${candidate.relevantExperience !== null ? `**Relevant Experience:** ${candidate.relevantExperience} years\n` : ""}

### Compensation & Availability

${candidate.currentSalary !== null ? `**Current Salary:** ${candidate.salaryCurrency} ${Number(candidate.currentSalary).toLocaleString()}\n` : ""}${candidate.expectedSalary !== null ? `**Expected Salary:** ${candidate.salaryCurrency} ${Number(candidate.expectedSalary).toLocaleString()}\n` : ""}${candidate.noticePeriod ? `**Notice Period:** ${candidate.noticePeriod}\n` : ""}${candidate.joiningAvailability ? `**Joining Availability:** ${candidate.joiningAvailability}\n` : ""}

### Contact Information

${candidate.email ? `**Email:** ${candidate.email}\n` : ""}${candidate.phone ? `**Phone:** ${candidate.phone}\n` : ""}${candidate.currentCity || candidate.currentCountry ? `**Location:** ${candidate.currentCity}${candidate.currentCountry ? `, ${candidate.currentCountry}` : ""}\n` : ""}

${candidate.skills.length > 0 ? `### Skills

${candidate.skills.map(skill => `- ${skill.skill}${skill.yearsExperience !== null ? ` (${skill.yearsExperience} years)` : ""}`).join("\n")}
` : ""}

${candidate.education.length > 0 ? `### Education

${candidate.education.map(edu => `**${edu.qualification}**${edu.institution ? `\n${edu.institution}` : ""}${edu.specialization ? `\n${edu.specialization}` : ""}${edu.startYear || edu.endYear ? `\n${edu.startYear || "N/A"} - ${edu.endYear || "Present"}` : ""}`).join("\n\n")}
` : ""}

${candidate.certifications.length > 0 ? `### Certifications

${candidate.certifications.map(cert => `**${cert.name}**${cert.issuingOrganization ? `\n${cert.issuingOrganization}` : ""}${cert.issueDate ? `\nIssued: ${new Date(cert.issueDate).toLocaleDateString()}` : ""}${cert.expiryDate ? `\nExpires: ${new Date(cert.expiryDate).toLocaleDateString()}` : ""}`).join("\n\n")}
` : ""}

${candidate.languages.length > 0 ? `### Languages

${candidate.languages.map(lang => `- ${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ""}`).join("\n")}
` : ""}

${candidate.employment.length > 0 ? `### Employment History

${candidate.employment.map(emp => `**${emp.jobTitle}** at ${emp.company}
${emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "N/A"} - ${emp.currentlyWorking ? "Present" : emp.endDate ? new Date(emp.endDate).toLocaleDateString() : "N/A"}${emp.description ? `\n${emp.description}` : ""}`).join("\n\n")}
` : ""}

${candidate.interviews.length > 0 ? `---

## INTERVIEW PERFORMANCE

${candidate.interviews.map((interview, idx) => {
  const avgScore = interview.scores.length > 0
    ? (interview.scores.reduce((sum, s) => sum + s.score, 0) / interview.scores.length).toFixed(1)
    : "N/A";

  return `### Interview ${idx + 1}: ${interview.interviewType}
**Date:** ${new Date(interview.interviewDate).toLocaleDateString()}${interview.interviewerId ? `\n**Interviewer ID:** ${interview.interviewerId}` : ""}${interview.interviewLocation ? `\n**Location:** ${interview.interviewLocation}` : ""}

${interview.scores.length > 0 ? `**Performance Scores:**
${interview.scores.map(score => `- ${score.category}: ${score.score}/10${score.notes ? ` - ${score.notes}` : ""}`).join("\n")}

**Average Score:** ${avgScore}/10
` : ""}

${interview.strengths ? `**Strengths Observed:**
${interview.strengths}
` : ""}

${interview.concerns ? `**Concerns Noted:**
${interview.concerns}
` : ""}

${interview.overallNotes ? `**Interviewer Notes:**
${interview.overallNotes}
` : ""}

${interview.questions.length > 0 ? `**Key Questions & Responses:**

${interview.questions.slice(0, 5).map((q, qIdx) => `${qIdx + 1}. **Question:** ${q.question}${q.questionType ? ` (Type: ${q.questionType})` : ""}${q.performance ? `\n   **Performance Rating:** ${q.performance}` : ""}${q.answer ? `\n   **Answer Summary:** ${q.answer}` : ""}${q.notes ? `\n   **Notes:** ${q.notes}` : ""}`).join("\n\n")}
` : ""}`;
}).join("\n\n")}
` : ""}

${candidate.cv?.extractedText ? `---

## CV/RESUME CONTENT

${candidate.cv.extractedText}
` : ""}

---

## EVALUATION FRAMEWORK

Please provide a comprehensive independent assessment covering:

### 1. Requirements Match Analysis
- How well does the candidate meet mandatory requirements?
- How many preferred requirements does the candidate fulfill?
- Provide specific evidence for each requirement

### 2. Requirement Gaps
- What mandatory requirements are missing or unclear?
- What preferred requirements are not met?
- How significant are these gaps?

### 3. Key Strengths
- What are the candidate's most relevant strengths for this role?
- Provide specific evidence from their experience, skills, or interview performance

### 4. Areas of Concern
- What concerns or weaknesses are evident?
- Are there any red flags?
- How might these impact job performance?

### 5. Technical Competency
- Assess technical skills relevant to the position
- Evaluate depth of experience in required technologies/domains

### 6. Experience Fit
- Is the experience level appropriate for this role?
- Is the experience relevant to the position requirements?
- Quality vs. quantity of experience

### 7. Interview Performance Analysis
- How did the candidate perform in interviews?
- What does interview performance indicate about fit?
- Were there any notable strengths or concerns from interviews?

### 8. Practical Fit Considerations
- Salary expectations vs. budget
- Notice period / joining availability
- Location / relocation considerations

### 9. Overall Suitability Assessment
- Provide an overall rating (e.g., Excellent Fit, Good Fit, Moderate Fit, Poor Fit)
- Summarize the key factors influencing this rating

### 10. Final Recommendation
- Would you recommend this candidate for the position?
- What would be your recommended next steps?
- Any conditions or considerations for the recommendation?

---

**Remember:** Base your evaluation solely on the evidence provided. Do not make assumptions about missing information. Focus exclusively on job-related qualifications and avoid any consideration of protected characteristics.
`;

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Failed to generate AI review prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate review prompt" },
      { status: 500 }
    );
  }
}
