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
