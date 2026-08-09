-- Make termType nullable so new terms are unclassified until the weekly cron runs
ALTER TABLE "Term" ALTER COLUMN "termType" DROP DEFAULT;
ALTER TABLE "Term" ALTER COLUMN "termType" DROP NOT NULL;
