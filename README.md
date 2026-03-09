# ULD

Merged single Next.js app combining public (FrontEnd) and admin (FE-adm).

## Structure
- app/: Public pages + admin login and dashboard
- components/: Shared UI (Navbar, Footer, landing sections)
- lib/: API base + utilities
- middleware.ts: Route guards for OTP/admin/dashboard

## Environment
Configure in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Run

```
npm install
npm run dev
```

App runs at http://localhost:3000.
