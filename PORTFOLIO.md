# AskOra AI — AI Voice Receptionist & SaaS Dashboard

> **Live Demo:** https://askora-ai-mvp.onrender.com  
> **GitHub:** https://github.com/skillseba9-art/askora-ai-mvp

---

## What It Does

AskOra AI is a production-ready AI voice receptionist that answers patient calls, extracts leads, and displays everything in a real-time SaaS dashboard — built as a white-label solution for dental and medical clinics.

---

## Key Features

### 🎙️ Live AI Voice Call (Browser-Based)
- AI receptionist "Clara" answers calls directly in the browser — no phone number required
- Real-time voice conversation powered by Retell AI + GPT-4o-mini via OpenRouter
- Auto-saves full transcript, lead info, and call duration after every call

### 📊 SaaS Analytics Dashboard
- Role-based access: **Admin** (full access) → **Client** (view only) → **Staff** (calls & leads)
- Live stats: total calls, leads extracted, conversion rate, missed calls
- Weekly bar chart analytics + recent inbound call feed

### 🧠 RAG Knowledge Pipeline
- Upload clinic PDFs → auto-parsed, chunked, and indexed for AI retrieval
- Scrape any website URL → content extracted and synced to knowledge base
- Clara pulls relevant answers from documents during live calls

### 📋 Automated Lead Extraction
- GPT-4o-mini parses each call transcript after it ends
- Extracts: caller name, service requested, lead temperature (Hot/Warm/Cold), email
- Leads appear instantly in the dashboard with AI-generated call summary

### ⚙️ Call Log Viewer
- Full transcript playback for every call
- AI summary panel with caller intent and outcome
- Status tags: Booking Made / Lead Generated / Missed Call / Completed

### 🔁 n8n Post-Call Automation (Workflow Ready)
- Complete n8n workflow designed and included in the codebase
- Triggers automatically when a call ends via webhook
- **Pipeline:** Call transcript → GPT-4o-mini lead extraction → Firestore save → Twilio SMS → Gmail notification
- Workflow is ready to activate — requires client's Twilio and Gmail credentials to go live
- Easily extendable: add CRM sync, Slack alerts, or calendar booking nodes

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite 8, Custom CSS (no UI library) |
| **Backend** | Node.js + Express, deployed on Render |
| **Database** | Google Cloud Firestore (real-time, NoSQL) |
| **AI Voice** | Retell AI SDK + GPT-4o-mini via OpenRouter |
| **RAG Engine** | PDF-Parse + Cheerio scraper + keyword/vector search |
| **Automation** | n8n workflow (Twilio SMS + Gmail — ready to activate) |
| **Auth** | Role-based access control (Admin / Client / Staff) |
| **DevOps** | GitHub → Render auto-deploy, Dockerfile included |

---

## Architecture

```
Browser Demo Call
      ↓
 Retell AI (Speech ↔ Text)
      ↓
 Clara AI Agent (GPT-4o-mini)
      ↓  (live RAG lookup)
 Backend /webhook/retell
      ↓  (transcript → lead extraction)
 Google Firestore
      ↓
 AskOra Dashboard (auto-refresh)

 ── n8n Automation Layer (ready to activate) ──
 Call End Webhook → n8n →
      ├── Twilio SMS (booking link to caller)
      └── Gmail (hot lead alert to admin)
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@askoraai.com | admin123 |
| Client | client@askoraai.com | client123 |
| Staff | staff@askoraai.com | staff123 |

---

## Screenshots

> <img width="1918" height="911" alt="image" src="https://github.com/user-attachments/assets/cabf9654-bb4e-4646-a787-952ac5eadc3b" />
<img width="1840" height="607" alt="image" src="https://github.com/user-attachments/assets/b2c7c7a5-1a62-4bdd-8079-ae219e35cf1f" />
<img width="1825" height="882" alt="image" src="https://github.com/user-attachments/assets/00020bfc-48b3-405a-9e80-dd7739462f70" />




---

## What Makes This Portfolio-Ready

- ✅ **End-to-end working system** — not a mockup, real AI calls with live data
- ✅ **Production deployed** — Render backend + Firestore live database
- ✅ **Clean codebase** — ~1,200 lines frontend, ~1,200 lines backend, fully commented
- ✅ **White-label ready** — clinic name, prompt, and branding configurable via Settings tab
- ✅ **Graceful fallback** — demo mode works even if APIs are offline
- ✅ **n8n automation included** — post-call SMS + email workflow designed and ready to activate with client credentials
