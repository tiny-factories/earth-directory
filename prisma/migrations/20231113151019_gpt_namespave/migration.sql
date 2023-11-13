-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "example_conent" TEXT;

-- CreateTable
CREATE TABLE "Studies" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "termId" TEXT,

    CONSTRAINT "Studies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Studies" ADD CONSTRAINT "Studies_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;
