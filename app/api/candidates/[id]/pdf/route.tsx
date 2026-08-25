import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import prisma from "@/lib/db/prisma";
import { CandidateReportDocument } from "@/lib/pdf/candidate-report-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch complete candidate data
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        position: true,
        photo: true,
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
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Prepare data for PDF template
    const pdfData = {
      candidate: {
        fullName: candidate.fullName,
        candidateCode: candidate.candidateCode,
        email: candidate.email,
        phone: candidate.phone,
        whatsapp: candidate.whatsapp,
        currentCity: candidate.currentCity,
        currentCountry: candidate.currentCountry,
        currentCompany: candidate.currentCompany,
        currentJobTitle: candidate.currentJobTitle,
        totalExperience: candidate.totalExperience,
        relevantExperience: candidate.relevantExperience,
        currentSalary: candidate.currentSalary ? Number(candidate.currentSalary) : null,
        expectedSalary: candidate.expectedSalary ? Number(candidate.expectedSalary) : null,
        salaryCurrency: candidate.salaryCurrency,
        noticePeriod: candidate.noticePeriod,
        joiningAvailability: candidate.joiningAvailability,
        photo: candidate.photo,
      },
      position: {
        title: candidate.position.title,
        department: candidate.position.department,
        jobDescription: candidate.position.jobDescription,
        mandatoryRequirements: candidate.position.mandatoryRequirements,
        preferredRequirements: candidate.position.preferredRequirements,
      },
      skills: candidate.skills,
      education: candidate.education,
      certifications: candidate.certifications,
      languages: candidate.languages,
      employment: candidate.employment,
      interviews: candidate.interviews,
    };

    // Generate PDF
    const stream = await renderToStream(
      <CandidateReportDocument data={pdfData} />
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="candidate-report-${candidate.candidateCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
