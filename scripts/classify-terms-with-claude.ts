/**
 * Agent script: uses Claude to classify each Term in the DB with a TermType.
 * Types: Glossary term, Historical event, Spotlight, Concept, Policy, Person, Organization (or Other).
 *
 * Usage:
 *   pnpm run classify-terms                    # classify terms with null termType (unclassified)
 *   pnpm run classify-terms -- --all           # re-classify all terms
 *   pnpm run classify-terms -- --legacy        # classify terms still GLOSSARY_TERM (pre-nullable behavior)
 *   pnpm run classify-terms -- --dry-run       # no DB updates, only log suggested types
 *
 * Requires ANTHROPIC_API_KEY in .env.local or .env.
 */

import path from "path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { runClassifyTerms } from "../lib/classify-terms";

async function main() {
  const args = process.argv.slice(2);
  const reclassifyAll = args.includes("--all");
  const dryRun = args.includes("--dry-run");
  const legacy = args.includes("--legacy");

  await runClassifyTerms({
    onlyNullType: !reclassifyAll && !legacy,
    onlyGlossaryTerm: legacy,
    reclassifyAll,
    dryRun,
    delayMs: 400,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
