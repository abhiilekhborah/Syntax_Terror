# E2E tests (map + frontend)

These tests run against the **map frontend** and verify that reporting an issue through the UI works end-to-end (form → Flask → Node → DB).

## Prerequisites

- **Flask backend** (Python) serving the map frontend and `/report` API on `http://127.0.0.1:5000`
- **Node backend** (backendDB) running on `http://localhost:3000` with MongoDB (so Flask can POST to `/api/issues/map`)

## Run the stack (manual)

From project root (`Syntax_Terror/`):

1. **Terminal 1 – Node + MongoDB**
   ```bash
   cd backendDB && npm run dev
   ```
   (Ensure `MONGO_URI` is set in `backendDB/.env`.)

2. **Terminal 2 – Flask**
   ```bash
   cd backend_map && python app.py
   # Serves frontend at http://127.0.0.1:5000 and /report at POST http://127.0.0.1:5000/report
   ```

3. **Terminal 3 – E2E tests**
   ```bash
   cd e2e && npm install && npx playwright install && npm test
   ```
   If you see "Executable doesn't exist", run **`npx playwright install`** from the `e2e` folder (downloads Chromium to your machine).

## What the tests do

- **map-report.spec.js**
  - Open the report page with lat/lng/address in the URL.
  - Fill description and submit.
  - Assert either the success screen (with TICKET #) or the duplicate screen appears.
  - One test checks that submitting without a description does not show success (validation).

## Run options

- `npm test` – headless
- `npm run test:headed` – see the browser
- `npm run test:ui` – Playwright UI mode
