# Company Links Hub

A single, reusable page that shows a company's **logo, name and all its links** (WhatsApp,
phone, email, website, Facebook, Instagram, TikTok, and more). The same page serves any
company — you just pass the company ID in the URL:

```
https://your-app.vercel.app/?cid=11299
```

It includes an **admin panel** (`/admin`) with login, a company selector, and editable /
removable fields for every link. Data lives in **Firebase Firestore**; the app is built with
**Node.js serverless functions** and deploys to **Vercel**.

---

## How it works

```
public/                 Static frontend (served by Vercel)
  index.html            Customer page — reads ?cid= and renders the link hub
  admin.html            Admin panel (login + editor) at /admin
  js/platforms.js       Single list of supported platforms (shared by both pages)
  js/company.js         Public page logic
  js/admin.js           Admin logic (auth token, selector, save/delete)
  css/style.css         Styling
  logos/                Optional folder for logo image files

api/                    Node.js serverless functions (run on Vercel)
  company.js            GET  /api/company?cid=...        (public)
  login.js              POST /api/login                  (admin login)
  setup.js              POST /api/setup                  (one-time: create first admin)
  admin/companies.js    GET  /api/admin/companies        (protected: list)
  admin/company.js      GET/POST/DELETE /api/admin/company (protected: edit one)
  _lib/firebase.js      Firebase Admin init
  _lib/auth.js          JWT + body parsing + auth guard

scripts/seed.js         Optional local script to create an admin + sample company
```

**Data model** (Firestore):

- `companies/{companyId}` → `{ name, logo, links: { whatsapp, phone, email, website, facebook, instagram, tiktok, ... } }`
- `admins/{username}` → `{ passwordHash }`  (bcrypt-hashed; never store plain passwords)

The admin logs in → receives a signed JWT (12h) → all admin API calls send it as a
`Bearer` token. Public company reads need no auth.

---

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. In the left menu open **Build → Firestore Database → Create database** (Production mode is fine —
   all writes go through the server with the Admin SDK, which bypasses security rules).
3. Open **Project settings (gear) → Service accounts → Generate new private key**. This downloads a
   JSON file containing `project_id`, `client_email` and `private_key`.

## 2. Configure environment variables

Copy `.env.example` to `.env` (for local dev) and fill in the values from that JSON file:

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET=any-long-random-string
SETUP_SECRET=any-secret-you-choose
```

> Keep the quotes around `FIREBASE_PRIVATE_KEY` and keep the `\n` sequences exactly as they appear
> in the JSON.

## 3. Install & run locally

```bash
npm install
npm i -g vercel        # if you don't have it
vercel dev             # serves the site + API at http://localhost:3000
```

## 4. Create your first admin user

Either run the local seed script:

```bash
npm run seed -- --user admin --pass "YourStrongPassword" --sample
```

…or call the setup endpoint once (works on the deployed site too):

```bash
curl -X POST https://your-app.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{"secret":"<SETUP_SECRET>","username":"admin","password":"YourStrongPassword","withSample":true}'
```

(`withSample: true` also creates a demo company with id `11299`.)

After creating your admin you can delete `api/setup.js` if you want to remove that route.

## 5. Use it

- **Admin:** open `/admin`, log in, pick a company (or **New company**), edit fields, **Save**.
  - The **Company ID** is what you put in the public URL (`?cid=<ID>`).
  - Clear any field (or use the ✕ button) to remove that link, then Save.
- **Public:** share `https://your-app.vercel.app/?cid=<ID>`.

---

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket) **or** run `vercel` from the folder.
2. In the Vercel dashboard → your project → **Settings → Environment Variables**, add the same four
   variables from step 2 (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`,
   `JWT_SECRET`, `SETUP_SECRET`).
3. **Deploy.** No build step is required — `public/` is served statically and `api/` becomes
   serverless functions automatically.

### Logos

- Easiest: in the admin **Logo** field paste a full image URL (e.g. a Firebase Storage download URL).
- Or drop a file in `public/logos/` and enter just the file name in the Logo field.

---

## Adding a new platform

Add one entry to `public/js/platforms.js` (key, label, Font Awesome icon, color, type). Both the
public page and the admin editor update automatically — no backend changes needed.
