-- CreateEnum
CREATE TYPE "TermType" AS ENUM ('GLOSSARY_TERM', 'HISTORICAL_EVENT', 'SPOTLIGHT', 'CONCEPT', 'POLICY', 'PERSON', 'ORGANIZATION', 'OTHER');

-- CreateEnum
CREATE TYPE "TagKind" AS ENUM ('LEVEL', 'TOPIC', 'TYPE', 'GENERAL');

-- AlterTable: add termType and tag slug/kind
ALTER TABLE "Term" ADD COLUMN "termType" "TermType" NOT NULL DEFAULT 'GLOSSARY_TERM';

ALTER TABLE "Tag" ADD COLUMN "slug" TEXT,
ADD COLUMN "kind" "TagKind" DEFAULT 'GENERAL';

-- Unique constraint on Tag.slug
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateTable: many-to-many Term <-> Tag for filtering
CREATE TABLE "TermTag" (
    "termId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TermTag_pkey" PRIMARY KEY ("termId","tagId")
);

-- CreateIndex
CREATE INDEX "TermTag_tagId_idx" ON "TermTag"("tagId");

-- AddForeignKey
ALTER TABLE "TermTag" ADD CONSTRAINT "TermTag_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermTag" ADD CONSTRAINT "TermTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
