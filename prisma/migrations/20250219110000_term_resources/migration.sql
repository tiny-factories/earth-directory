-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PAPER', 'ARTICLE', 'VIDEO', 'PODCAST', 'WEBSITE', 'OTHER');

-- CreateTable
CREATE TABLE "TermResource" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TermResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TermResource_termId_idx" ON "TermResource"("termId");

-- AddForeignKey
ALTER TABLE "TermResource" ADD CONSTRAINT "TermResource_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
