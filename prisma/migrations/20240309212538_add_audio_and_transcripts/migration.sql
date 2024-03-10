-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "audioUrlTitle" TEXT,
ADD COLUMN     "transcriptContent" JSONB,
ADD COLUMN     "transcriptTerm" JSONB,
ADD COLUMN     "transcriptTitle" JSONB,
ADD COLUMN     "transcriptTldr" JSONB;
