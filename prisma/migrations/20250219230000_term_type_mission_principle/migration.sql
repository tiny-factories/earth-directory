-- Add MISSION and PRINCIPLE to TermType enum (e.g. NASA missions, bioregional principles)
ALTER TYPE "TermType" ADD VALUE IF NOT EXISTS 'MISSION';
ALTER TYPE "TermType" ADD VALUE IF NOT EXISTS 'PRINCIPLE';
