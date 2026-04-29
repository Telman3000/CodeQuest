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
