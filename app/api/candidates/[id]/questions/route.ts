import { NextRequest, NextResponse } from "next/server";
import { buildQuestionGenerationInput } from "@/lib/interview-questions/input-builder";
import { getQuestionGenerationProvider } from "@/lib/interview-questions/provider";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id: candidateId } = await context.params;

    // Build input from candidate data
    const input = await buildQuestionGenerationInput(candidateId);

    if (!input) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Generate questions using AI
    const provider = getQuestionGenerationProvider();
    const result = await provider.generateQuestions(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Question Generation Error]", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
