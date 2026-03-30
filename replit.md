# IE Portfolio — Ankit Canchi

An Industrial Engineering portfolio website focused on reducing hospital wait times. Built with React, Vite, and Tailwind CSS, with AI-powered analysis throughout all simulation tools.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express server (port 3001) — proxied via Vite's `/api` proxy
- **Styling**: Tailwind CSS + shadcn/ui components + Framer Motion animations
- **Font**: Inter (professional) + JetBrains Mono (data/code values)
- **Theme**: Deep navy palette (background 222 47% 8%), professional blue primary (214 89% 62%)

## Features

- **ED Queue Simulator** — Interactive M/M/1 queuing theory visualizer with AI staffing analysis
- **Staff Scheduling Optimizer** — LP solver with AI interpretation of optimal solutions
- **Patient Flow Network** — Network flow visualization with AI bottleneck detection
- **ED Operations Dashboard** — Real-time KPI dashboard with AI shift report generation
- **AI Chat Widget** — Floating chat powered by GPT-4o-mini for IE/hospital Q&A

## AI Integration

Two server endpoints power AI throughout the app:
- `POST /api/chat` — Streaming chat for the floating chat widget
- `POST /api/analyze` — Non-streaming analysis endpoint used by all simulation tools

Frontend utility: `src/lib/aiAnalysis.ts` — `getAIInsight(context)` calls `/api/analyze`.

Each simulation sends structured operational context to the AI and displays the insight in a styled `.ai-panel` block.

## Running the App

```bash
npm run dev
```

This starts both:
1. Express backend server on port 3001 (`tsx server/index.ts`)
2. Vite dev server on port 5000 (proxies `/api` to port 3001)

## Key Files

- `server/index.ts` — Express server with `/api/chat` (streaming) and `/api/analyze` (non-streaming) routes
- `src/lib/aiAnalysis.ts` — Frontend AI analysis utility
- `src/components/HeroSection.tsx` — Hero with minimal canvas particle animation
- `src/components/QueueSimulator.tsx` — M/M/1 queue sim + AI analysis
- `src/components/LPVisualizer.tsx` — LP feasible region + AI interpretation
- `src/components/SupplyChainViz.tsx` — Patient flow network + AI bottleneck finder
- `src/components/Dashboard.tsx` — ED KPI dashboard + AI shift report
- `src/pages/Index.tsx` — Main landing page

## Environment Variables / Secrets

- `OPENAI_API_KEY` — OpenAI API key (stored in Replit Secrets, used server-side only)

## Deployment

Build command: `npm run build`
Run command: `node ./dist/index.cjs`
