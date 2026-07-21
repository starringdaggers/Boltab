# Boltab Brilliant Schools — Results Portal

Phase 1: project foundation, database schema, and authentication.

## What's in this phase

- Next.js 14 project (App Router) — one codebase for frontend + backend API routes
- Prisma schema covering users, students, teachers, classes, subjects, terms, and results
- JWT-based auth with httpOnly cookies, bcrypt password hashing
- Role-based route protection middleware (`/admin`, `/teacher`, `/student`)
- Login page built to your reference design, wired to the real auth API
- Design tokens (colors, fonts) set up in `tailwind.config.ts` using your palette

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a free Postgres database** at [neon.tech](https://neon.tech) — takes about a minute. Copy the connection string it gives you.

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and paste in your Neon `DATABASE_URL`, and generate a `JWT_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Push the schema to your database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed test accounts**
   ```bash
   npm run seed
   ```
   This creates one login for each role, all with password `password123`:
   - `admin@boltabschools.edu`
   - `teacher@boltabschools.edu`
   - `student@boltabschools.edu`

6. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` — it redirects to `/login`. Log in with any seeded account above and you'll land on that role's dashboard stub.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Phase 1: foundation, schema, auth, login page"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`.env` is already git-ignored, so your database credentials won't be committed.

## Deploying later (Netlify/Vercel)

When you're ready to deploy:
1. Connect the GitHub repo in Vercel or Netlify's dashboard.
2. Add the same environment variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`) in the platform's project settings.
3. Deploy — no config changes needed, Next.js is supported natively by both.

## What's next

- **Phase 2:** Admin dashboard — manage classes, subjects, terms, teacher accounts, and student accounts (with CSV bulk import).
- **Phase 3:** Teacher dashboard — bulk result entry per class/subject/term.
- **Phase 4:** Student dashboard — results by term, summary, downloadable report card.
- **Phase 5:** Public landing page, connected to this login.
