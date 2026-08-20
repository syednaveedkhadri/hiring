-- CreateTable
CREATE TABLE "CandidateSequence" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateSequence_pkey" PRIMARY KEY ("id")
);
