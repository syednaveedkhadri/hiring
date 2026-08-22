-- CreateTable
CREATE TABLE "AIEvaluation" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "confidence" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "jobRequirementScore" DOUBLE PRECISION,
    "experienceScore" DOUBLE PRECISION,
    "skillsScore" DOUBLE PRECISION,
    "technicalScore" DOUBLE PRECISION,
    "interviewScore" DOUBLE PRECISION,
    "practicalScore" DOUBLE PRECISION,
    "salaryFitScore" DOUBLE PRECISION,
    "availabilityScore" DOUBLE PRECISION,
    "educationScore" DOUBLE PRECISION,
    "certificationScore" DOUBLE PRECISION,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "requirementGaps" JSONB NOT NULL,
    "missingInformation" JSONB NOT NULL,
    "evidence" JSONB,
    "summary" TEXT NOT NULL,
    "model" TEXT,
    "promptVersion" TEXT,
    "positionSnapshot" JSONB NOT NULL,
    "candidateSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateRanking" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIEvaluation_candidateId_idx" ON "AIEvaluation"("candidateId");

-- CreateIndex
CREATE INDEX "AIEvaluation_positionId_idx" ON "AIEvaluation"("positionId");

-- CreateIndex
CREATE INDEX "AIEvaluation_overallScore_idx" ON "AIEvaluation"("overallScore");

-- CreateIndex
CREATE INDEX "AIEvaluation_createdAt_idx" ON "AIEvaluation"("createdAt");

-- CreateIndex
CREATE INDEX "CandidateRanking_candidateId_idx" ON "CandidateRanking"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateRanking_positionId_idx" ON "CandidateRanking"("positionId");

-- CreateIndex
CREATE INDEX "CandidateRanking_evaluationId_idx" ON "CandidateRanking"("evaluationId");

-- CreateIndex
CREATE INDEX "CandidateRanking_recordedAt_idx" ON "CandidateRanking"("recordedAt");

-- AddForeignKey
ALTER TABLE "AIEvaluation" ADD CONSTRAINT "AIEvaluation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEvaluation" ADD CONSTRAINT "AIEvaluation_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateRanking" ADD CONSTRAINT "CandidateRanking_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateRanking" ADD CONSTRAINT "CandidateRanking_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "AIEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
