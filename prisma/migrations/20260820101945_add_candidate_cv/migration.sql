-- CreateTable
CREATE TABLE "CandidateCV" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "extractedText" TEXT,
    "parsedData" JSONB,
    "extractionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "extractionError" TEXT,
    "extractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateCV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCV_candidateId_key" ON "CandidateCV"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCV_documentId_key" ON "CandidateCV"("documentId");

-- AddForeignKey
ALTER TABLE "CandidateCV" ADD CONSTRAINT "CandidateCV_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateCV" ADD CONSTRAINT "CandidateCV_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CandidateDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
