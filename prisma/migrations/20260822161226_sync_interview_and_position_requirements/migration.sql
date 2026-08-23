-- AlterTable
ALTER TABLE "InterviewQuestion" ADD COLUMN     "performance" TEXT;

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "aiEvaluationInstructions" TEXT,
ADD COLUMN     "certificationRequirements" TEXT,
ADD COLUMN     "educationRequirements" TEXT,
ADD COLUMN     "joiningAvailabilityPreference" TEXT,
ADD COLUMN     "majorConcerns" TEXT,
ADD COLUMN     "preferredSkills" TEXT,
ADD COLUMN     "requiredSkills" TEXT,
ADD COLUMN     "specialRequirements" TEXT,
ADD COLUMN     "whatMattersMost" TEXT;
