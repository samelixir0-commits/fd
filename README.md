# FDvault

FDvault is a personal fixed-deposit tracker built with React, TypeScript, Vite, and a small Node.js JSON-file API.

## Features

- Add, edit, and delete fixed deposits.
- Track FD number, bank, principal, interest rate, start date, maturity date, and reminder email.
- See total invested amount, expected maturity amount, earned interest, and next maturity.
- Request browser notification permission for five-day maturity reminders. The default reminder address is kept internal and is not shown in the app.
- Persist deposits in `server/data/deposits.json` through the Node API.

Automatic emails require a backend mail provider or scheduled server function; the browser-only app cannot send email by itself. The app currently uses the owner name in the form instead of displaying an email field.

Maturity values use quarterly compounding based on the deposit period. This is an estimate; confirm the exact maturity value with your bank's terms.

## Run locally

```bash
npm install
npm run dev
```

This single command starts Vite on port `5173` and the Node data server on port `5174`.

The app uses `/api/deposits` for loading, adding, editing, and deleting records. Deploy the Node server on a host with persistent disk storage; serverless hosts may reset JSON-file changes when instances restart. This file is simple and has no database backup or multi-user authorization.

Build and lint checks:

```bash
npm run build
npm run lint
```
# fd
