/*
  Warnings:

  - You are about to drop the `_LanguageToTerm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SourceToTerm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagToTerm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LanguageToTerm" DROP CONSTRAINT "_LanguageToTerm_A_fkey";

-- DropForeignKey
ALTER TABLE "_LanguageToTerm" DROP CONSTRAINT "_LanguageToTerm_B_fkey";

-- DropForeignKey
ALTER TABLE "_SourceToTerm" DROP CONSTRAINT "_SourceToTerm_A_fkey";

-- DropForeignKey
ALTER TABLE "_SourceToTerm" DROP CONSTRAINT "_SourceToTerm_B_fkey";

-- DropForeignKey
ALTER TABLE "_TagToTerm" DROP CONSTRAINT "_TagToTerm_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToTerm" DROP CONSTRAINT "_TagToTerm_B_fkey";

-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "languageId" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "tagId" TEXT;

-- DropTable
DROP TABLE "_LanguageToTerm";

-- DropTable
DROP TABLE "_SourceToTerm";

-- DropTable
DROP TABLE "_TagToTerm";

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
