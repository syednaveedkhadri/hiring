-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "candidateCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "currentCity" TEXT,
    "currentCountry" TEXT,
    "currentCompany" TEXT,
    "currentJobTitle" TEXT,
    "totalExperience" DOUBLE PRECISION,
    "relevantExperience" DOUBLE PRECISION,
    "currentSalary" DECIMAL(65,30),
    "expectedSalary" DECIMAL(65,30),
    "salaryCurrency" TEXT DEFAULT 'INR',
    "noticePeriod" TEXT,
    "joiningAvailability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "positionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_candidateCode_key" ON "Candidate"("candidateCode");

-- CreateIndex
CREATE INDEX "Candidate_positionId_idx" ON "Candidate"("positionId");

-- CreateIndex
CREATE INDEX "Candidate_fullName_idx" ON "Candidate"("fullName");

-- CreateIndex
CREATE INDEX "Candidate_phone_idx" ON "Candidate"("phone");

-- CreateIndex
CREATE INDEX "Candidate_status_idx" ON "Candidate"("status");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
