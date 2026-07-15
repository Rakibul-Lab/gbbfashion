# GBB Fashion — Full cPanel Hosting Guide (GitHub Actions zip + local DB)

This guide takes you from a working local project to a live site on cPanel using:

- GitHub Actions **cPanel Package** workflow (downloadable zip)
- MySQL data exported from your PC
- cPanel **Setup Node.js App** (Passenger)

---

## What you need

| Item | Example |
|------|---------|
| Domain | `gbbfashion.com` pointing to this hosting |
| cPanel account | e.g. user `rrpdream` |
| Node.js in cPanel | **20.x** (required for Next.js 16) |
| GitHub repo | https://github.com/Rakibul-Lab/gbbfashion |
| Local app | runs on your PC with MySQL + Prisma |

---

## Part 1 — Export database from your PC

Your app uses **MySQL** (`prisma/schema.prisma`).

### Option A — phpMyAdmin / MySQL Workbench / HeidiSQL

1. Open your local database tool.
2. Select your local DB (whatever name is in your local `DATABASE_URL`).
3. **Export** → SQL format.
4. Enable structure + data.
5. Save as `gbbfashion-local.sql` on your desktop.

### Option B — Command line (mysqldump)

Replace user/password/db with your **local** values:

```bash
mysqldump -u LOCAL_USER -p LOCAL_DB_NAME > gbbfashion-local.sql
```

### Important

- Export must be **MySQL**, not SQLite.
- If local table names differ from production Prisma models, prefer exporting after a successful local `npx prisma db push` so schema matches the app.
- Keep the `.sql` file ready for Part 4.

---

## Part 2 — Build the deploy zip with GitHub Actions

1. Push your latest code to `main` on GitHub  
   (or open **Actions** → **cPanel Package** → **Run workflow**).
2. Wait for the workflow to finish (green check).
3. Open the successful run.
4. Under **Artifacts**, download **`gbbfashion-cpanel`**.
5. Unzip that download on your PC — inside you should get something like:
   - `server.js`
   - `.next/`
   - `public/`
   - `prisma/schema.prisma`
   - `.env.example`
   - `README-CPANEL.txt`
   - `node_modules/` (standalone)

That folder is what you upload to the server.

Workflow file in repo: `.github/workflows/cpanel-package.yml`

---

## Part 3 — Create MySQL on cPanel

1. Log into **cPanel**.
2. Go to **MySQL® Databases**.
3. Create a database, e.g. `rrpdream_gbbfashion`.
4. Create a user, e.g. `rrpdream_gbbadmin`, with a strong password.
5. **Add User To Database** → select both → **ALL PRIVILEGES** → Make Changes.
6. Note the exact names (cPanel often prefixes with `rrpdream_`).

Your connection string will look like:

```text
mysql://DB_USER:DB_PASSWORD@127.0.0.1:3306/DB_NAME
```

Use **`127.0.0.1`**, not `localhost`, on most cPanel hosts.

---

## Part 4 — Import your local SQL into cPanel

1. cPanel → **phpMyAdmin**.
2. Click the database `rrpdream_gbbfashion` (left sidebar).
3. Tab **Import**.
4. Choose `gbbfashion-local.sql`.
5. Click **Go**.
6. Confirm tables appear (`User`, `Product`, `Category`, etc. — names may be case-sensitive).

If import fails (duplicate tables):

- Empty the database first (Drop all tables), then import again, **or**
- Drop the DB and recreate it empty, then import.

### Optional: create admin in SQL (if not in dump)

Password below = `Admin@123` (bcrypt):

```sql
INSERT INTO `User` (
  `id`, `name`, `email`, `password`, `role`, `source`,
  `phone`, `shippingAddress`, `city`, `state`, `zipCode`,
  `createdAt`, `updatedAt`
) VALUES (
  'cmadmin000000000000000001',
  'Super Admin',
  'admin@gbbfashion.com',
  '$2b$12$QZymiO1EMev7L1qRI9lkYeWWDlhESO9lW1cVQCVjzZg84rjtgxVqi',
  'admin',
  'admin',
  NULL, NULL, NULL, NULL, NULL,
  NOW(3), NOW(3)
);
```

If table name is lowercase, use `` `user` `` instead of `` `User` ``.

---

## Part 5 — Create the Node.js application

1. cPanel → **Setup Node.js App**.
2. If `gbbfashion.com` already has an app → **edit that app** (do not create a second one; you will get “Base URL already exist”).
3. Settings:

| Field | Value |
|--------|--------|
| Node.js version | **20.x** (not 10/14/16) |
| Application mode | Production |
| Application root | `gbbfashion` → resolves to `/home/rrpdream/gbbfashion` |
| Application URL | `gbbfashion.com` |
| Application startup file | `server.js` |

4. Click **Create** or **Save**.
5. Note the Node binary paths (example):

```text
node: /usr/local/apps/nodejs20/bin/node
npm:  /usr/local/apps/nodejs20/bin/npm
npx:  /usr/local/apps/nodejs20/bin/npx
```

---

## Part 6 — Upload the GitHub zip package

1. Open **File Manager**.
2. Go to `/home/rrpdream/gbbfashion` (or create folder `gbbfashion` under home).
3. Upload the artifact zip / extracted files.
4. Extract so that **`server.js` is directly inside** `gbbfashion/`:

```text
/home/rrpdream/gbbfashion/server.js
/home/rrpdream/gbbfashion/.next/
/home/rrpdream/gbbfashion/public/
/home/rrpdream/gbbfashion/prisma/
/home/rrpdream/gbbfashion/node_modules/
```

Do **not** leave an extra nested folder like `gbbfashion/gbbfashion-cpanel/server.js`.

5. Also upload `data/site-settings.json` if your package needs it (homepage settings). Put it at:

```text
/home/rrpdream/gbbfashion/data/site-settings.json
```

(Create `data/` if missing.)

---

## Part 7 — Environment variables (required)

Passenger often **ignores `.env`**. Add variables in **both** places if possible.

### A) Setup Node.js App → Environment variables

Add each name/value (**no quotes** around values):

| Name | Value |
|------|--------|
| `DATABASE_URL` | `mysql://rrpdream_gbbadmin:YOUR_PASSWORD@127.0.0.1:3306/rrpdream_gbbfashion` |
| `NEXTAUTH_URL` | `https://gbbfashion.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://gbbfashion.com` |
| `NEXTAUTH_SECRET` | long random string |
| `SSLCOMMERZ_STORE_ID` | `testbox` (or live id) |
| `SSLCOMMERZ_STORE_PASSWORD` | store password |
| `SSLCOMMERZ_IS_LIVE` | `false` (or `true` for live) |
| `NEXT_PUBLIC_SSLCOMMERZ_IS_LIVE` | `false` (or `true`) |
| `SMTP_HOST` | `mail.gbbfashion.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `admin@gbbfashion.com` |
| `SMTP_PASS` | mailbox password |
| `SMTP_FROM` | `GBB Fashion <admin@gbbfashion.com>` |
| `NODE_ENV` | `production` |

### B) File `.env` next to `server.js`

Create `/home/rrpdream/gbbfashion/.env` with the same values (quotes OK in the file):

```env
DATABASE_URL="mysql://rrpdream_gbbadmin:YOUR_PASSWORD@127.0.0.1:3306/rrpdream_gbbfashion"
NEXTAUTH_URL=https://gbbfashion.com
NEXT_PUBLIC_SITE_URL=https://gbbfashion.com
NEXTAUTH_SECRET=your-long-random-secret
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
SSLCOMMERZ_IS_LIVE=false
NEXT_PUBLIC_SSLCOMMERZ_IS_LIVE=false
SMTP_HOST=mail.gbbfashion.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=admin@gbbfashion.com
SMTP_PASS=your-mail-password
SMTP_FROM="GBB Fashion <admin@gbbfashion.com>"
```

### C) `.htaccess` (document root / Passenger config)

Ensure `.htaccess` for the domain includes Passenger config. Typical:

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/rrpdream/gbbfashion"
PassengerBaseURI "/"
PassengerNodejs "/usr/local/apps/nodejs20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

Optional but recommended if env still missing: `PassengerEnvVar` lines for `DATABASE_URL` and others (see project `.htaccess`).

---

## Part 8 — Align schema (only if import/app mismatch)

If APIs return 500 and SSH Prisma errors on missing columns:

```bash
export PATH="/usr/local/apps/nodejs20/bin:$PATH"
cd ~/gbbfashion
npx prisma db push
```

- Answer **`N`** if you must keep conflicting data.
- Answer **`y`** only if you accept rebuilding tables (can wipe mismatched old tables).

Prefer fixing via a clean SQL import that already matches the current Prisma schema.

---

## Part 9 — Restart and verify

1. Setup Node.js App → **Restart** (or Stop → Start).
2. Test in browser:

| URL | Expected |
|-----|----------|
| `https://gbbfashion.com` | Homepage loads |
| `https://gbbfashion.com/api/products` | JSON array (products or `[]`) |
| `https://gbbfashion.com/api/categories?nav=1` | JSON categories |
| `https://gbbfashion.com/login` | Can sign in as admin |

3. SSH DB smoke test:

```bash
export PATH="/usr/local/apps/nodejs20/bin:$PATH"
cd ~/gbbfashion
node -e "require('dotenv').config(); const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); Promise.all([p.user.count(), p.product.count()]).then(([u,pr])=>console.log({users:u,products:pr})).catch(e=>console.error(e)).finally(()=>p.\$disconnect())"
```

---

## Part 10 — Updates later (new version)

1. Push to `main` (or Run workflow).
2. Download new **gbbfashion-cpanel** artifact.
3. Backup current `~/gbbfashion` (and `.env`).
4. Replace app files; **keep** `.env` and uploaded `public/uploads` if needed.
5. Restart Node app.
6. Only re-import DB if you intentionally change data from local again.

---

## Troubleshooting cheat sheet

| Symptom | Fix |
|---------|-----|
| `npx: command not found` | `export PATH="/usr/local/apps/nodejs20/bin:$PATH"` |
| `/usr/bin/env: 'node': Permission denied` | Set `PATH` as above first |
| All `/api/*` return 500 | Env not loaded → add vars in Node App UI + `.env` + Restart; use `127.0.0.1` |
| CLI Prisma OK, website 500 | Passenger missing env → Node App env vars / `PassengerEnvVar` |
| `Base URL already exist` | Edit existing Node app for that domain |
| Node 10 selected | Upgrade to Node **20** |
| Products `[]` but no 500 | DB connected; import data or add products in admin |
| `db push` wants to drop tables | Schema mismatch; prefer matching SQL import, or accept wipe with `y` |

---

## Final checklist

- [ ] Local SQL exported
- [ ] GitHub Actions zip downloaded
- [ ] MySQL DB + user + privileges created
- [ ] SQL imported in phpMyAdmin
- [ ] Node 20 app created/edited (`server.js`, root `gbbfashion`)
- [ ] Zip extracted so `server.js` is in app root
- [ ] Environment variables set in cPanel Node App
- [ ] `.env` file next to `server.js`
- [ ] App restarted
- [ ] `/api/products` returns JSON (not 500)
- [ ] Admin login works
