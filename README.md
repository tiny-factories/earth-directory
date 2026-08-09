# Earth Directory - A Comprehensive Glossary for Climate Action

[![wakatime](https://wakatime.com/badge/user/dd7ed260-af32-43f0-bd89-496e1d7ed257/project/d24a3db6-6593-4e63-af4d-ecfd2d86b596.svg)](https://wakatime.com/badge/user/dd7ed260-af32-43f0-bd89-496e1d7ed257/project/d24a3db6-6593-4e63-af4d-ecfd2d86b596)

## Local development (Docker Postgres)

The app uses PostgreSQL. Run it locally with Docker, then point the app at it.

1. **Start Postgres**
   ```bash
   npm run db:up
   ```
   This starts a Postgres 16 container (`earth-directory-postgres`) on port 5432 with user `earth`, password `earth`, database `earth_directory`.

2. **Configure env**
   - Copy `.env.example` to `.env.local`.
   - For local Docker, `DATABASE_URL` is already set in `.env.example`:
     `postgresql://earth:earth@localhost:5432/earth_directory`

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```
   (Or `npx prisma db push` for a quick schema sync without migration files.)

4. **Seed (optional)**
   ```bash
   npx prisma db seed
   ```

5. **Start the app**
   ```bash
   npm run dev
   ```

**Useful commands**
- `npm run db:down` — stop and remove the Postgres container (data in Docker volume is kept).
- `npm run studio` — open Prisma Studio to inspect/edit data.

### Filter scheme (categories and tags)

Terms can be filtered by:

- **Term type** (category): `GLOSSARY_TERM` | `HISTORICAL_EVENT` | `SPOTLIGHT` | `CONCEPT` | `POLICY` | `PERSON` | `ORGANIZATION` | `MISSION` | `PRINCIPLE` | `OTHER`. Each term has exactly one type.
- **Tags** (many per term): each term can have multiple tags. Tags have an optional **kind**: `LEVEL` (e.g. “Kids definition”, “Medium definition”), `TOPIC` (e.g. “Climate”, “Energy”), `TYPE`, or `GENERAL`. Definition levels are exposed as tags so you can filter by “has kids definition”, etc.

The `/terms` page includes a filter bar (type dropdown + tag chips). Level tags are synced when you run the seed (terms with `definitionKids` get the “Kids definition” tag, etc.).

Later you can point `DATABASE_URL` at your Tailscale-hosted Postgres (same user/password/db name) to use the same container remotely.

## Tagline: 
Unlock the language of sustainability with Earth Directory, your centralized source for clear, verified terms and concepts driving global climate solutions.

## Introduction:
Earth Directory is a shared knowledge base designed to clarify and demystify the terms and concepts crucial to understanding and participating in climate action. In an era where information can be overwhelming and scattered, Earth Directory stands as a beacon for students, educators, activists, and policymakers.

## Key Features:

**Verified Glossary:** Access a meticulously curated list of terms related to climate and sustainability, each with detailed definitions and context.

**Community-Driven:** Contributions are community-powered, encouraging collaborative refinement and expansion of entries.

**Global Focus:** Multilingual support fosters global inclusivity, breaking down language barriers in climate education.

**Engagement Tools:** Interactive features like case studies and 'TLDR' summaries make learning and engagement more accessible.

## Impact:
Whether you're deepening your own understanding or developing educational resources, Earth Directory empowers you with accurate and actionable knowledge. It's more than a glossary—it's a growing resource for those shaping a sustainable future.

## Call to Action:
Join us at Earth Directory. [Contribute a term](https://form.typeform.com/to/lowIfjl5), suggest edits, or simply explore the glossary. Together, we can create a clear path for climate action. Or [help translate](https://form.typeform.com/to/hV9yuh6J).