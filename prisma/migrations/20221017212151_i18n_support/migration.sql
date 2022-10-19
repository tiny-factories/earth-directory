/*
  Warnings:

  - You are about to drop the column `authorId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_authorId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "authorId",
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "i18n" TEXT,
    "image" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "tagId" TEXT,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LanguageToTerm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LanguageToTerm_AB_unique" ON "_LanguageToTerm"("A", "B");

-- CreateIndex
CREATE INDEX "_LanguageToTerm_B_index" ON "_LanguageToTerm"("B");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LanguageToTerm" ADD FOREIGN KEY ("A") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LanguageToTerm" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
