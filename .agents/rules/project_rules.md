---
trigger: always_on
description: Core project coding standards, UI font rules, and architecture guidelines for YWCA School Management System.
---

# YWCA School Management System - AI Agent Rules & Guidelines

These instructions define the architectural, styling, database, hardware, and workflow standards for this project. Every AI agent working on this repository MUST strictly follow these rules.

---

## 1. 🎨 Typography & Font Rules
* **Primary Latin Font:** Always use **`Scoutie Sans`** for English text, UI controls, navigation labels, data tables, metrics, and headings.
* **Bengali / Bangla Font:** Always use **`Hind Siliguri`** (with the `.font-bangla` CSS helper class) for Bangla student names and Bangla SMS/notices.
* **Monospace Font:** Use `font-mono` (`ui-monospace`, `Courier New`) for Student IDs, codes, phone numbers, timestamps, and biometric keys.
* **Never** override or replace `Scoutie Sans` with Inter, Roboto, or standard system fonts unless explicitly instructed by the user.

---

## 2. 📁 Project Structure Rules (NO `src/` Folder)
* **Root Layout:** The codebase strictly resides at the project root:
  - `app/`: Next.js 15 App Router (Pages, Layouts, and API Route Handlers).
  - `components/`: Reusable UI components (Sidebar, Navbar, Modals, Tables, Forms).
  - `lib/`: Utilities (`prisma.ts`, `auth.ts`, `sms.ts`, `utils.ts`, `constants.ts`).
  - `middleware.ts`: Security, session token verification, and route protection.
  - `prisma/`: Prisma schema (`schema.prisma`) and migrations.
  - `scripts/`: Data migration (`import_sql_data.js`), database seeders (`seed.js`), and ZKTeco sync daemon (`zkteco-bridge/`).
* **Do NOT create a `src/` folder.** All imports must use the root path alias `@/*` (e.g. `@/lib/prisma`, `@/components/layout/Navbar`).

---

## 3. 🗄️ Database & ORM Rules (Prisma + MySQL)
* **Database Provider:** Self-hosted MySQL on aaPanel / Contabo VPS.
* **Schema Integrity:**
  - All database modifications must be reflected in `prisma/schema.prisma`.
  - Always run `npx prisma generate` after changing the schema.
  - Always handle relational nullability safely (e.g. `enrollment.section?.name || '-'`, `student.guardian?.guardianPhone`).
  - Never hardcode raw SQL queries; use the Prisma client singleton (`@/lib/prisma`).

---

## 4. 📟 ZKTeco K40 Hardware & Biometric Sync Rules
* **Device Communication:** Physical ZKTeco K40 devices communicate over LAN TCP/UDP port `4370`.
* **Sync Webhook (`/api/attendance/sync`):**
  - Requires the `x-bridge-token` HTTP header for verification.
  - Automatically identifies whether a punch belongs to a `Student` or `Employee` by matching `biometricId`.
  - Evaluates Shift start/end times to mark `PRESENT` vs `LATE`.
  - Dispatches automated SMS alerts to guardians upon check-in.
* **Local Bridge Agent (`scripts/zkteco-bridge/bridge.js`):**
  - Standalone Node.js daemon running on a school PC.
  - Keeps an offline cache (`offline_punches.json`) so punches are uploaded automatically when internet connectivity returns.

---

## 5. 📱 Greenweb SMS Gateway Rules
* **Phone Number Formatting:** Always normalize Bangladeshi phone numbers to international standard (`8801XXXXXXXXX`) using `normalizePhoneNumber()` in `@/lib/sms.ts`.
* **Character Limits:**
  - English: 160 characters = 1 SMS.
  - Bengali / Unicode: 70 characters = 1 SMS.
* **Logging:** Every SMS sent or attempted must be recorded in the `SmsLog` table (`@/lib/sms.ts`).

---

## 6. 💻 Deployment & aaPanel PM2 Rules
* **Node Version:** Node.js v18+ / v20+ LTS.
* **PM2 Startup:** Managed via `ecosystem.config.js` (`next start -p 3000`).
* **Environment Configuration:** Always read production secrets from `.env` (`DATABASE_URL`, `JWT_SECRET`, `GREENWEB_SMS_API_KEY`, `BIOMETRIC_SYNC_SECRET`).

---

## 7. 🧪 Mandatory Post-Edit Bug & Build Verification Rule (CRITICAL)
* **Always verify after EVERY edit or code addition:**
  1. **TypeScript Type Check:** Always run `npx tsc --noEmit` to ensure there are zero syntax, import, or type errors.
  2. **Build Integrity Check:** Run `npm run build` whenever routes, layout, middleware, or configuration files are modified to guarantee 100% error-free compilation.
  3. **Static & Asset Security:** Ensure Next.js internal chunks (`_next/static`, `webpack.js`, `main.js`), static assets, and middleware matchers never return 404 or get falsely intercepted.
  4. **Never conclude a turn with unverified, broken, or untested code.**
