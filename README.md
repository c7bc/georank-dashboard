# GeoRank Dashboard

React and TypeScript application for reviewing brand visibility in AI-generated answers.
It connects monitored domains and keywords to mentions, recommendations and reports.

## Run locally

Use Node.js 24 and npm. From this directory:

```sh
npm ci
npm run dev
```

Open `http://localhost:3001/dashboard/`. The dashboard calls the GeoRank API
(default `http://localhost:8080/api`) and uses the GeoRank sign-in service
(default `http://localhost:3000`). Use a test environment for an end-to-end
walkthrough and keep its credentials outside the repository. The dashboard
shows a session-expired message when opened without a signed-in account.

Copy `.env.example` to `.env.local` to change the service URLs. Variables
prefixed with `VITE_` are visible in the browser bundle and must contain only
public configuration. The services must allow the dashboard origin where
applicable. When deployed behind a reverse proxy, forward `/dashboard/` to
this app and strip that prefix at the upstream.

## Code review

- `src/App.tsx` defines route boundaries and lazy loads feature pages.
- `src/layouts/AuthenticatedLayout.tsx` owns the session gate and shared shell.
- `src/lib/api/` contains the typed transport and each feature's API calls.
- `src/hooks/queries/` and `src/contexts/websocket-context.tsx` connect cached
  queries to server updates.
- `src/pages/MentionsPage.tsx` is a practical entry point for tracing a feature
  from the page to its query and API call.

```sh
npm run check
npm test
npm run build
npm run preview
```

The unit suite exercises API response handling without a running backend.
