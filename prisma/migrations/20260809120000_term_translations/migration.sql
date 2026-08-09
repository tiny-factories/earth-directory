-- CreateTable
CREATE TABLE "TermTranslation" (
    "termId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tldr" TEXT,
    "definitionKids" TEXT,
    "definitionMedium" TEXT,
    "definitionScientific" TEXT,
    "provenance" "DefinitionProvenance" NOT NULL DEFAULT 'AI_GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermTranslation_pkey" PRIMARY KEY ("termId","locale")
);

-- CreateIndex
CREATE INDEX "TermTranslation_locale_idx" ON "TermTranslation"("locale");

-- AddForeignKey
ALTER TABLE "TermTranslation" ADD CONSTRAINT "TermTranslation_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
