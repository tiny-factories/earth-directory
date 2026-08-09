-- CreateTable
CREATE TABLE "TermRelation" (
    "termId" TEXT NOT NULL,
    "relatedTermId" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "TermRelation_pkey" PRIMARY KEY ("termId","relatedTermId")
);

-- CreateIndex
CREATE INDEX "TermRelation_relatedTermId_idx" ON "TermRelation"("relatedTermId");

-- AddForeignKey
ALTER TABLE "TermRelation" ADD CONSTRAINT "TermRelation_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermRelation" ADD CONSTRAINT "TermRelation_relatedTermId_fkey" FOREIGN KEY ("relatedTermId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
