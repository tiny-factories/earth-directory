-- CreateEnum
CREATE TYPE "DefinitionLevel" AS ENUM ('kids', 'medium', 'scientific');

-- CreateEnum
CREATE TYPE "DefinitionProvenance" AS ENUM ('AI_GENERATED', 'GOVERNMENT', 'SCIENTIFIC', 'SCRAPED', 'OTHER');

-- CreateTable
CREATE TABLE "TermDefinition" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "level" "DefinitionLevel" NOT NULL,
    "content" TEXT NOT NULL,
    "sourceId" TEXT,
    "provenance" "DefinitionProvenance" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TermDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TermDefinition_termId_level_idx" ON "TermDefinition"("termId", "level");

-- CreateIndex
CREATE INDEX "TermDefinition_termId_createdAt_idx" ON "TermDefinition"("termId", "createdAt");

-- AddForeignKey
ALTER TABLE "TermDefinition" ADD CONSTRAINT "TermDefinition_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermDefinition" ADD CONSTRAINT "TermDefinition_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
