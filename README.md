# House Social

A lightweight social app for houses — follow homes you love, post projects and dream spaces. **No street addresses** (town is optional). Built for friends-beta testing.

## Features

- Sign up / log in
- Create house pages: **My home**, **Project**, or **Dream / inspo**
- Optional town + tags (no address)
- Posts with photos + captions (photos auto-compressed)
- Follow houses, like posts, comment
- **Feed** (houses you follow) and **Explore**

## Quick start (local)

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"   # if you use nvm
cd house-social
npm install
cp .env.example .env   # if you don't already have .env
npm run db:setup       # SQLite + demo accounts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Email | Password |
|-------|----------|
| `demo@housesocial.test` | `password123` |
| `friend@housesocial.test` | `password123` |

## Share on the internet (recommended)

**GitHub** stores the *code*. **Vercel** (free) hosts the *live website* your friends open.

### 1. Push this repo to GitHub

```bash
# after logging in with: gh auth login
gh repo create house-social --public --source=. --remote=origin --push
```

Or create an empty repo on github.com and:

```bash
git remote add origin https://github.com/YOUR_USER/house-social.git
git push -u origin main
```

### 2. Create a free Postgres database (Neon)

1. Sign up at [https://neon.tech](https://neon.tech)
2. Create a project → copy the **connection string** (`postgresql://...`)

### 3. Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Import** your GitHub `house-social` repo  
2. Add environment variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon `postgresql://...` connection string |
| `AUTH_SECRET` | random string (`openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | from Vercel → Storage → Blob → create store |

3. **Important:** change Prisma to Postgres before the first production deploy (see below), then push.  
4. After deploy, run migrations once (Vercel → project → Settings / or local against prod URL):

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run db:seed   # optional demo data
```

5. Share the Vercel URL (e.g. `https://house-social-xxx.vercel.app`) with friends.

### Prisma: local SQLite vs production Postgres

Local development uses **SQLite** (`file:./dev.db`).

For Vercel you need **PostgreSQL**. Before deploying:

1. In `prisma/schema.prisma`, set:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Point `DATABASE_URL` at Neon and run `npx prisma db push`.

You can keep a branch or local override for SQLite if you prefer.

## Stack

- Next.js (App Router) + Tailwind  
- NextAuth (email/password)  
- Prisma + SQLite (local) / Postgres (production)  
- Local `public/uploads` or **Vercel Blob** for photos  

## Useful commands

```bash
npm run dev        # local server
npm run db:setup   # schema + seed
npm run build && npm start
```

## Notes

- Not a real-estate marketplace (no listings/prices/agents).  
- Only the house creator can post on that house (for now).  
- Phone photos used to fail with “Body exceeded 1 MB limit” — fixed with a higher Server Action limit + client compression.
