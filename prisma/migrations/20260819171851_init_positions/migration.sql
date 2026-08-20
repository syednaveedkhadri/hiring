-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "vacancies" INTEGER NOT NULL,
    "seniorityLevel" TEXT,
    "jobDescription" TEXT,
    "mandatoryRequirements" TEXT,
    "preferredRequirements" TEXT,
    "minimumExperience" DOUBLE PRECISION,
    "preferredExperience" DOUBLE PRECISION,
    "salaryMin" DECIMAL(65,30),
    "salaryMax" DECIMAL(65,30),
    "currency" TEXT DEFAULT 'KWD',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);
