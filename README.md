# Civic Vibe — Civic Issue Reporting Platform

Minimal scaffold for the Civic Vibe platform (Next.js + TypeScript).

Environment variables (create a `.env` from `.env.example`):

- `DATABASE_URL` — Postgres URL (Neon or similar)
- `NEXTAUTH_SECRET` — NextAuth secret
- `CLOUDINARY_URL` — Cloudinary connection string
- `MAPBOX_TOKEN` — Mapbox API token
- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox public token

Quick start:

```bash
npm install
npm run dev
```

Files of interest:

- `app/` — Next.js app router pages and layout
- `prisma/schema.prisma` — Prisma data model
- `app/api/issues/route.ts` — example API route to create an issue
- `lib/prisma.ts` — Prisma client helper

This scaffold keeps implementations minimal so you can continue building features: authentication, Cloudinary image uploads, Mapbox map UI, verification flow, and authority workflows.
