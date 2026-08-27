# FDvault

FDvault is a personal fixed-deposit tracker built with React, TypeScript, and Vite.

## Features

- Add, edit, and delete fixed deposits.
- Track FD number, bank, principal, interest rate, start date, maturity date, and reminder email.
- See total invested amount, expected maturity amount, earned interest, and next maturity.
- Request browser notification permission for five-day maturity reminders. The default reminder address is kept internal and is not shown in the app.
- Persist deposits in the browser's local storage.

Automatic emails require a backend mail provider or scheduled server function; the browser-only app cannot send email by itself. The app currently uses the owner name in the form instead of displaying an email field.

Maturity values use quarterly compounding based on the deposit period. This is an estimate; confirm the exact maturity value with your bank's terms.

## Run locally

```bash
npm install
npm run dev
```

Build and lint checks:

```bash
npm run build
npm run lint
```
# fd
