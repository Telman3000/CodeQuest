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

Planning uses **mock** logic (`src/lib/mockPlan.ts`) — no API keys required. You can swap it for a real backend later.
