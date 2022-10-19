-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "href" TEXT,
    "image" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SourceToTerm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SourceToTerm_AB_unique" ON "_SourceToTerm"("A", "B");

-- CreateIndex
CREATE INDEX "_SourceToTerm_B_index" ON "_SourceToTerm"("B");

-- AddForeignKey
ALTER TABLE "_SourceToTerm" ADD FOREIGN KEY ("A") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SourceToTerm" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
