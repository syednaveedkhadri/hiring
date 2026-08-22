import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { InterviewForm } from "./form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
};

async function getCandidate(id: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      position: true,
      photo: true,
    },
  });

  return candidate;
}

async function getInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      scores: true,
      questions: true,
    },
  });

  return interview;
}

export default async function NewInterviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { edit } = await searchParams;

  const candidate = await getCandidate(id);

  if (!candidate) {
    notFound();
  }

  // If editing, fetch the interview
  let existingInterview = null;
  if (edit) {
    existingInterview = await getInterview(edit);

    // Verify interview belongs to this candidate
    if (!existingInterview || existingInterview.candidateId !== id) {
      redirect(`/candidates/${id}/interviews/new`);
    }
  }

  return (
    <InterviewForm
      candidate={{
        id: candidate.id,
        fullName: candidate.fullName,
        candidateCode: candidate.candidateCode,
        currentJobTitle: candidate.currentJobTitle,
        position: {
          title: candidate.position.title,
        },
        photo: candidate.photo
          ? {
              fileUrl: candidate.photo.fileUrl,
            }
          : null,
      }}
      existingInterview={
        existingInterview
          ? {
              id: existingInterview.id,
              interviewType: existingInterview.interviewType,
              interviewDate: existingInterview.interviewDate,
              interviewerId: existingInterview.interviewerId,
              interviewLocation: existingInterview.interviewLocation,
              overallNotes: existingInterview.overallNotes,
              strengths: existingInterview.strengths,
              concerns: existingInterview.concerns,
              scores: existingInterview.scores,
              questions: existingInterview.questions,
            }
          : null
      }
    />
  );
}
