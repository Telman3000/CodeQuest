# CodeQuest — web app

Web implementation of **CodeQuest: AI-based Focus & Task Structuring Assistant** (same flow as in the HIAD report).

This folder on your machine is standalone. The LaTeX / `Hum-ai` report folder is not modified by this repo.

## Run locally

```bash
cd CodeQuest
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Connect to GitHub

If the remote is empty ([Telman3000/CodeQuest](https://github.com/Telman3000/CodeQuest)):

```bash
cd CodeQuest
git init
git add .
git commit -m "Initial CodeQuest web app"
git branch -M main
git remote add origin https://github.com/Telman3000/CodeQuest.git
git push -u origin main
```

If the remote already has a commit (e.g. only LICENSE), pull with allow-unrelated histories or follow GitHub’s “push an existing repo” docs, then merge.

## Note on “AI”

- **Without setup:** planning uses **offline mock** logic (`src/lib/mockPlan.ts`) and the **AI chat** panel uses **rule-based replies** — no API keys in the browser.
- **For real model (you + everyone):**
  1. Deploy the small proxy in **`server/`** (Node 18+). Set **`OPENAI_API_KEY`** on the host (never commit it). Optional: **`OPENAI_MODEL`**, **`CORS_ORIGIN`** (your Vite/production site origin).
  2. In the web app root, copy **`.env.example`** → **`.env`** and set **`VITE_AI_API_BASE`** to that server’s public URL (no trailing slash), e.g. `https://your-api.up.railway.app`.
  3. Local API test: `cd server && npm start` → set `VITE_AI_API_BASE=http://localhost:8787` and run **`npm run dev`**.

The client calls **`POST …/plan`** and **`POST …/chat`** (see `src/lib/aiClient.ts`). If the API is down, planning falls back to the mock and chat falls back to offline hints.

### Railway (example)

1. **Create a project** on [Railway](https://railway.app) → **New project** → **Deploy from GitHub** → select repo **Telman3000/CodeQuest** (or your fork).
2. **Root directory:** set the service **Root Directory** to **`server`** (Railway should run `npm start` from that folder; `server/package.json` has `"start": "node index.mjs"`).
3. **Variables** (project/service → **Variables**):
   - **`OPENAI_API_KEY`** — required. Your key from [OpenAI API keys](https://platform.openai.com/api-keys). Never put this in the frontend `.env`.
   - **`OPENAI_MODEL`** — optional, default `gpt-4o-mini`.
   - **`CORS_ORIGIN`** — optional. For production, set your real frontend origin (e.g. `https://your-app.pages.dev`). Use `*` only for quick tests (less safe).
4. **Generate domain:** service → **Settings** → **Networking** → **Generate domain**. You get a URL like `https://codequest-api-production-xxxx.up.railway.app`.
5. **Local frontend `.env`** (CodeQuest root, next to `package.json`):

   ```env
   VITE_AI_API_BASE=https://codequest-api-production-xxxx.up.railway.app
   ```

   No trailing slash. Restart `npm run dev` after changing `.env`.

6. **Smoke test:** open `https://YOUR-RAILWAY-URL/plan` in a browser — you should get **404 JSON** (`Not found`) because only **POST** is allowed; that still proves the service is up. Real check: run the app and use **Generate draft plan** / **AI chat**.

If the service sleeps on a free tier, the first request may be slow or timeout — retry once.

### Render (Blueprint or Web Service)

- **Blueprint:** the repo includes **`render.yaml`** at the root. In Render: **New** → **Blueprint** → connect **Telman3000/CodeQuest** → branch **`main`**. After the service is created, open it → **Environment** → add **`OPENAI_API_KEY`** as a **secret**.
- **Without Blueprint:** **New** → **Web Service** → same repo → set **Root Directory** to **`server`**, **Build** `npm install`, **Start** `npm start`, add env vars manually.
- **Health check:** `GET https://YOUR-SERVICE.onrender.com/health` should return `{"ok":true,...}`.
- Put the service **HTTPS URL** (no trailing slash) into your frontend **`.env`** as **`VITE_AI_API_BASE`**.

If Blueprint says the file is missing, **pull the latest `main`** from GitHub (this repo now ships `render.yaml`).
