import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#6366f1",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 3,
  },
  generatedDate: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 5,
  },
  candidateHeader: {
    flexDirection: "row",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  photoContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 3,
  },
  candidateCode: {
    fontSize: 10,
    color: "#6366f1",
    fontFamily: "Courier",
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoItem: {
    fontSize: 9,
    color: "#475569",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#1e293b",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 8,
    marginTop: 5,
  },
  grid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "medium",
  },
  list: {
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 10,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6366f1",
    marginRight: 8,
    marginTop: 5,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  listItemDetail: {
    fontSize: 9,
    color: "#64748b",
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    borderBottom: 2,
    borderBottomColor: "#cbd5e1",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: "#1e293b",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  },
  interviewSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 5,
    border: 1,
    borderColor: "#e2e8f0",
  },
  interviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    alignSelf: "flex-start",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#ede9fe",
    color: "#6d28d9",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    borderTop: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
});

type CandidateReportData = {
  candidate: {
    fullName: string;
    candidateCode: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    currentCity: string | null;
    currentCountry: string | null;
    currentCompany: string | null;
    currentJobTitle: string | null;
    totalExperience: number | null;
    relevantExperience: number | null;
    currentSalary: number | null;
    expectedSalary: number | null;
    salaryCurrency: string | null;
    noticePeriod: string | null;
    joiningAvailability: string | null;
    photo?: { fileUrl: string } | null;
  };
  position: {
    title: string;
    department: string | null;
    jobDescription: string | null;
    mandatoryRequirements: string | null;
    preferredRequirements: string | null;
  };
  skills: Array<{ skill: string; yearsExperience: number | null }>;
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
    issueDate: Date | null;
    expiryDate: Date | null;
  }>;
  languages: Array<{ language: string; proficiency: string | null }>;
  employment: Array<{
    company: string;
    jobTitle: string;
    startDate: Date | null;
    endDate: Date | null;
    currentlyWorking: boolean;
    description: string | null;
  }>;
  interviews: Array<{
    interviewType: string;
    interviewDate: Date;
    interviewerId: string | null;
    interviewLocation: string | null;
    overallNotes: string | null;
    strengths: string | null;
    concerns: string | null;
    scores: Array<{ category: string; score: number; notes: string | null }>;
    questions: Array<{
      question: string;
      questionType: string | null;
      performance: string | null;
      answer: string | null;
      notes: string | null;
    }>;
  }>;
};

export function CandidateReportDocument({ data }: { data: CandidateReportData }) {
  const { candidate, position, skills, education, certifications, languages, employment, interviews } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Candidate Report</Text>
          <Text style={styles.subtitle}>{position.title}</Text>
          {position.department && <Text style={styles.subtitle}>{position.department}</Text>}
          <Text style={styles.generatedDate}>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </Text>
        </View>

        {/* Candidate Header */}
        <View style={styles.candidateHeader}>
          {candidate.photo?.fileUrl && (
            <View style={styles.photoContainer}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={candidate.photo.fileUrl} style={styles.photo} />
            </View>
          )}
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>{candidate.fullName}</Text>
            <Text style={styles.candidateCode}>{candidate.candidateCode}</Text>
            <View style={styles.infoGrid}>
              {candidate.currentJobTitle && (
                <Text style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Role:</Text> {candidate.currentJobTitle}
                </Text>
              )}
              {candidate.currentCompany && (
                <Text style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Company:</Text> {candidate.currentCompany}
                </Text>
              )}
              {candidate.totalExperience !== null && (
                <Text style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Experience:</Text> {candidate.totalExperience} years
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.grid}>
            {candidate.phone && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{candidate.phone}</Text>
              </View>
            )}
            {candidate.email && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{candidate.email}</Text>
              </View>
            )}
          </View>
          <View style={styles.grid}>
            {candidate.whatsapp && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>WhatsApp</Text>
                <Text style={styles.value}>{candidate.whatsapp}</Text>
              </View>
            )}
            {(candidate.currentCity || candidate.currentCountry) && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>
                  {candidate.currentCity}{candidate.currentCountry ? `, ${candidate.currentCountry}` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.grid}>
            {candidate.currentCompany && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Current Company</Text>
                <Text style={styles.value}>{candidate.currentCompany}</Text>
              </View>
            )}
            {candidate.currentJobTitle && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Current Job Title</Text>
                <Text style={styles.value}>{candidate.currentJobTitle}</Text>
              </View>
            )}
          </View>
          <View style={styles.grid}>
            {candidate.totalExperience !== null && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Total Experience</Text>
                <Text style={styles.value}>{candidate.totalExperience} years</Text>
              </View>
            )}
            {candidate.relevantExperience !== null && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Relevant Experience</Text>
                <Text style={styles.value}>{candidate.relevantExperience} years</Text>
              </View>
            )}
          </View>
          <View style={styles.grid}>
            {candidate.currentSalary !== null && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Current Salary</Text>
                <Text style={styles.value}>
                  {candidate.salaryCurrency} {Number(candidate.currentSalary).toLocaleString()}
                </Text>
              </View>
            )}
            {candidate.expectedSalary !== null && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Expected Salary</Text>
                <Text style={styles.value}>
                  {candidate.salaryCurrency} {Number(candidate.expectedSalary).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.grid}>
            {candidate.noticePeriod && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Notice Period</Text>
                <Text style={styles.value}>{candidate.noticePeriod}</Text>
              </View>
            )}
            {candidate.joiningAvailability && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Joining Availability</Text>
                <Text style={styles.value}>{candidate.joiningAvailability}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {skills.map((skill, idx) => (
                <Text key={idx} style={styles.skillBadge}>
                  {skill.skill} {skill.yearsExperience ? `(${skill.yearsExperience}y)` : ""}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.list}>
              {education.map((edu, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{edu.qualification}</Text>
                    {edu.institution && <Text style={styles.listItemDetail}>{edu.institution}</Text>}
                    {edu.specialization && <Text style={styles.listItemDetail}>{edu.specialization}</Text>}
                    {(edu.startYear || edu.endYear) && (
                      <Text style={styles.listItemDetail}>
                        {edu.startYear} - {edu.endYear || "Present"}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.list}>
              {certifications.map((cert, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{cert.name}</Text>
                    {cert.issuingOrganization && (
                      <Text style={styles.listItemDetail}>{cert.issuingOrganization}</Text>
                    )}
                    {cert.issueDate && (
                      <Text style={styles.listItemDetail}>
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        {cert.expiryDate && ` | Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.skillsGrid}>
              {languages.map((lang, idx) => (
                <Text key={idx} style={styles.skillBadge}>
                  {lang.language} {lang.proficiency ? `(${lang.proficiency})` : ""}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* Page 2 - Employment History & Interviews */}
      <Page size="A4" style={styles.page}>
        {/* Employment History */}
        {employment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employment History</Text>
            <View style={styles.list}>
              {employment.map((emp, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{emp.jobTitle}</Text>
                    <Text style={styles.listItemDetail}>{emp.company}</Text>
                    <Text style={styles.listItemDetail}>
                      {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "N/A"} -{" "}
                      {emp.currentlyWorking ? "Present" : emp.endDate ? new Date(emp.endDate).toLocaleDateString() : "N/A"}
                    </Text>
                    {emp.description && <Text style={styles.listItemDetail}>{emp.description}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Interview History */}
        {interviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interview History</Text>
            {interviews.map((interview, idx) => {
              const avgScore = interview.scores.length > 0
                ? interview.scores.reduce((sum, s) => sum + s.score, 0) / interview.scores.length
                : 0;

              return (
                <View key={idx} style={styles.interviewSection}>
                  <View style={styles.interviewHeader}>
                    <View>
                      <Text style={styles.listItemTitle}>{interview.interviewType} Interview</Text>
                      <Text style={styles.listItemDetail}>
                        {new Date(interview.interviewDate).toLocaleDateString()}
                      </Text>
                    </View>
                    {avgScore > 0 && (
                      <Text style={styles.badge}>Score: {avgScore.toFixed(1)}/10</Text>
                    )}
                  </View>

                  {interview.scores.length > 0 && (
                    <View style={styles.table}>
                      <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, styles.tableCellHeader]}>Category</Text>
                        <Text style={[styles.tableCell, styles.tableCellHeader]}>Score</Text>
                      </View>
                      {interview.scores.map((score, scoreIdx) => (
                        <View key={scoreIdx} style={styles.tableRow}>
                          <Text style={styles.tableCell}>{score.category}</Text>
                          <Text style={styles.tableCell}>{score.score}/10</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {interview.strengths && (
                    <View>
                      <Text style={styles.subsectionTitle}>Strengths:</Text>
                      <Text style={styles.listItemDetail}>{interview.strengths}</Text>
                    </View>
                  )}

                  {interview.concerns && (
                    <View>
                      <Text style={styles.subsectionTitle}>Concerns:</Text>
                      <Text style={styles.listItemDetail}>{interview.concerns}</Text>
                    </View>
                  )}

                  {interview.overallNotes && (
                    <View>
                      <Text style={styles.subsectionTitle}>Notes:</Text>
                      <Text style={styles.listItemDetail}>{interview.overallNotes}</Text>
                    </View>
                  )}

                  {interview.questions.length > 0 && (
                    <View>
                      <Text style={styles.subsectionTitle}>Key Questions:</Text>
                      {interview.questions.slice(0, 3).map((q, qIdx) => (
                        <View key={qIdx} style={{ marginBottom: 6 }}>
                          <Text style={styles.listItemDetail}>
                            Q: {q.question}
                          </Text>
                          {q.performance && (
                            <Text style={styles.listItemDetail}>
                              Performance: {q.performance}
                            </Text>
                          )}
                          {q.notes && (
                            <Text style={styles.listItemDetail}>
                              Notes: {q.notes}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Position Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position Requirements</Text>
          {position.jobDescription && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.subsectionTitle}>Job Description</Text>
              <Text style={styles.listItemDetail}>{position.jobDescription}</Text>
            </View>
          )}
          {position.mandatoryRequirements && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.subsectionTitle}>Mandatory Requirements</Text>
              <Text style={styles.listItemDetail}>{position.mandatoryRequirements}</Text>
            </View>
          )}
          {position.preferredRequirements && (
            <View>
              <Text style={styles.subsectionTitle}>Preferred Requirements</Text>
              <Text style={styles.listItemDetail}>{position.preferredRequirements}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          This report contains confidential candidate information • Generated by AI Recruit Platform
        </Text>
      </Page>
    </Document>
  );
}
