-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "example_conent_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studies_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tldr_published" BOOLEAN NOT NULL DEFAULT false;
