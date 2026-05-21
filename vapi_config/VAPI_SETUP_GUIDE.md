# VAPI Integration Setup Guide
## AskOra AI — Phase 3: Real Phone Calls

**Time Required:** 30-60 minutes  
**Prerequisites:** OpenRouter API key, deployed backend URL

---

## 🗺️ What We're Building

```
Incoming Phone Call
      ↓
 VAPI Phone Number (+1 888 xxx xxxx)
      ↓ (speech → text)
 Clara AI Agent (GPT-4o-mini via OpenRouter)
      ↓ (live RAG lookup mid-call)
 Your Backend /webhook/vapi/live-tools
      ↓ (call ends)
 Your Backend /webhook/vapi
      ↓ (stores to DB, creates lead)
 Google Firestore
      ↓ (dashboard refreshes)
 AskOra AI Dashboard
```

---

## Step 1: Get Required Accounts & Keys

### 1A — OpenRouter API Key (FREE tier available)
1. Go to https://openrouter.ai
2. Sign up → Dashboard → API Keys → Create Key
3. Copy the key (starts with `sk-or-...`)
4. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-or-your-openrouter-key-here
   ```
   > ⚠️ Note: Even though it says OPENAI_API_KEY, we point it to OpenRouter

### 1B — VAPI Account (Free trial available)
1. Go to https://vapi.ai
2. Sign up → you get trial credits
3. Go to **Dashboard** (dashboard.vapi.ai)

---

## Step 2: Deploy Your Backend (Required for VAPI to reach it)

VAPI needs a **public URL** to send webhooks. Localhost won't work.

### Option A: Railway (Recommended — Free tier available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy from backend folder
cd backend
railway init
railway up
```
Your backend URL will be: `https://your-project.railway.app`

### Option B: Render.com (Also free)
1. Create account at render.com
2. New → Web Service → connect GitHub repo
3. Root Directory: `backend`
4. Start Command: `npm start`
5. Your URL: `https://your-service.onrender.com`

### Option C: ngrok (For local testing only)
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 5000
# Copy the https URL: https://xxxx.ngrok.io
```

> **Save your backend URL** — you'll need it in the next steps.

---

## Step 3: Get a VAPI Phone Number

1. In VAPI Dashboard → **Phone Numbers** → **Buy Number**
2. Select a US number (or your country)
3. Cost: ~$2-5/month
4. Copy the **Phone Number ID** (not the phone number itself — it's a UUID)

---

## Step 4: Create VAPI Assistant

### Method A: Using the Config JSON (Quick)
1. In VAPI Dashboard → **Assistants** → **Create Assistant**
2. Click **Advanced** → **JSON Editor**
3. Open `vapi_config/assistant_config.json` from your project
4. Replace these values:
   - `YOUR_OPENROUTER_API_KEY` → your OpenRouter key
   - `YOUR_BACKEND_URL` → your Railway/Render URL
   - `YOUR_VAPI_PHONE_NUMBER_ID` → your phone number UUID
5. Paste the JSON → **Save**

### Method B: Manual Setup in VAPI Dashboard
1. **Assistants** → **Create**
2. **Name:** Clara - Radiant Dental AI Receptionist
3. **Model:**
   - Provider: OpenAI
   - Model: gpt-4o-mini
   - Base URL: `https://openrouter.ai/api/v1`
   - API Key: your OpenRouter key
4. **System Prompt:** Copy from `assistant_config.json` → `model.messages[0].content`
5. **Voice:**
   - Provider: ElevenLabs
   - Voice: Rachel (or any you prefer)
6. **First Message:** `Hello! Thank you for calling Radiant Dental Clinic. This is Clara, your AI receptionist. How can I help you today?`
7. **Server URL:** `YOUR_BACKEND_URL/webhook/vapi`

---

## Step 5: Assign Phone Number to Assistant

1. VAPI Dashboard → **Phone Numbers** → Click your number
2. **Assistant:** Select "Clara - Radiant Dental AI Receptionist"
3. **Save**

Now test by calling the phone number! 📞

---

## Step 6: Configure Backend for VAPI

Add to your `backend/.env`:

```env
PORT=5000

# Firestore (already configured ✅)
FIREBASE_SERVICE_ACCOUNT='...'

# OpenRouter — used for lead extraction AND RAG embeddings
OPENAI_API_KEY=sk-or-your-openrouter-key

# OpenRouter model choice (default: gpt-4o-mini, cheapest)
OPENROUTER_MODEL=openai/gpt-4o-mini

# VAPI webhook secret (optional but recommended for production)
VAPI_WEBHOOK_SECRET=vapi-secret-key-change-this
```

Restart backend:
```bash
cd backend
npm start
```

---

## Step 7: Verify Webhook Connection

Test that VAPI can reach your backend:
```bash
# Should return {"status":"online",...}
curl https://your-backend.railway.app/webhook/vapi/status
```

Simulate a VAPI call-end event:
```bash
curl -X POST https://your-backend.railway.app/webhook/vapi \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "test-call-001",
        "customer": { "number": "+15551234567" }
      },
      "transcript": "Assistant: Hello! Thank you for calling Radiant Dental.\nCaller: Hi, I need to book a dental cleaning.\nAssistant: I can help with that! May I get your name?\nCaller: My name is John Smith.\nAssistant: Great John! I am sending you a booking link now.",
      "durationSeconds": 45,
      "endedReason": "customer-ended-call"
    }
  }'
```

Expected response: `{"received": true}`

Then open dashboard → **Call Logs** — you should see the test call!

---

## Step 8: Test Live Phone Call

1. Call your VAPI phone number
2. Clara will answer with the greeting
3. Ask a question (e.g., "What are your hours?")
4. Ask to book an appointment
5. After hanging up, check dashboard → Call Logs

---

## 🔍 Troubleshooting

### Clara doesn't answer?
- Check VAPI Dashboard → Phone Numbers → is assistant assigned?
- Check VAPI Dashboard → Logs → any error messages?

### Webhook not receiving data?
- Verify backend URL is public (not localhost)
- Test: `curl https://your-backend-url/webhook/vapi/status`
- Check Railway/Render logs for errors

### Call logs not showing in dashboard?
- Check browser console for API errors
- Verify `/api/calls` endpoint returns data
- Check Firestore console for new documents in `calls` collection

### RAG not working during calls?
- Upload some documents first in Knowledge Base tab
- Test: `curl -X POST .../webhook/vapi/live-tools -d '{"message":{"type":"function-call","functionCall":{"name":"getKnowledgeBaseAnswer","parameters":{"query":"office hours"}}}}'`

---

## 💰 Cost Estimate

| Service | Cost |
|---------|------|
| VAPI phone number | ~$2/month |
| VAPI calls | ~$0.05-0.10/minute |
| OpenRouter (gpt-4o-mini) | ~$0.15/1M tokens ≈ very cheap |
| Railway backend | Free tier (500 hrs/month) |
| Firestore | Free tier (1GB, 50K reads/day) |
| **Total for 100 calls/month** | **~$5-15/month** |

---

## 🎯 What Happens After Setup

Every phone call will automatically:
1. ✅ Be answered by Clara AI
2. ✅ Have full transcript saved to Firestore
3. ✅ Extract lead info (name, service, temperature)
4. ✅ Show up in Call Logs tab on dashboard
5. ✅ Create/update lead in Leads tab
6. ✅ Update stats (call count, conversion rate)

**Optional (Phase 5 — n8n):**
- Send Twilio SMS booking link after call
- Email admin notification for Hot leads
- Sync to CRM

---

## 📞 Test Credentials (Demo)

When testing, use these pre-configured credentials:
- **Admin login:** admin@askoraai.com / admin123
- **Client login:** client@askoraai.com / client123
- **Staff login:** staff@askoraai.com / staff123

---

## ✅ Checklist

- [ ] OpenRouter API key added to backend `.env`
- [ ] Backend deployed to Railway/Render (public URL)
- [ ] VAPI account created
- [ ] VAPI phone number purchased
- [ ] VAPI assistant created with Clara config
- [ ] Phone number assigned to assistant
- [ ] Webhook URL configured: `YOUR_BACKEND_URL/webhook/vapi`
- [ ] Webhook status test passes: `GET /webhook/vapi/status`
- [ ] Simulated webhook test succeeds (call appears in dashboard)
- [ ] Live phone call test succeeds

---

**Next Steps After VAPI Works:**
1. Upload PDFs to Knowledge Base → Clara will use them during calls
2. Phase 5: Activate n8n for SMS + email automation
3. Phase 6: Deploy frontend to Vercel for live dashboard
