# AskOra AI MVP - Complete Codebase Reference

**Quick Navigation:** Frontend | Backend | Workflows | Configuration

---

## 📂 Full Folder Structure

```
ai_voice_assistant_mvp/
│
├── dashboard/                              # 🎨 React Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx                         # 880 lines - MAIN APP (all 5 tabs + login)
│   │   ├── App.css                         # Custom dark theme styling
│   │   ├── main.jsx                        # Vite entry point
│   │   ├── index.css                       # Global CSS variables
│   │   ├── mockDatabase.js                 # Client-side mock data (fallback)
│   │   └── assets/
│   │       ├── react.svg
│   │       ├── vite.svg
│   │       └── hero.png
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── dist/                               # Build output (pre-generated)
│   ├── index.html                          # HTML entry
│   ├── package.json                        # React 19.2.6, Vite 8.0.13
│   ├── vite.config.js                      # Vite build config
│   ├── eslint.config.js                    # Linting rules
│   ├── README.md                           # Vite template docs
│   └── node_modules/                       # Dependencies (installed)
│
├── backend/                                # 🚀 Express.js Backend
│   ├── server.js                           # 725 lines - ALL 12 ENDPOINTS
│   ├── mockDb.js                           # Server-side mock data (fallback)
│   ├── package.json                        # Express, Firestore, multer, etc.
│   ├── .env                                # ✅ FIRESTORE CREDENTIALS HERE
│   ├── Dockerfile                          # Ready for deployment
│   ├── deploy_backend.sh                   # Deployment script
│   ├── README.md                           # Setup instructions
│   ├── uploads/                            # Temp folder for PDF uploads
│   └── node_modules/                       # Dependencies (installed)
│
├── n8n_workflows/
│   └── post_call_automation.json           # 6-node workflow (NOT ACTIVE)
│       ├── Webhook trigger (VAPI calls)
│       ├── AI Lead Extractor (OpenRouter)
│       ├── Save to Firestore (calls)
│       ├── Save to Firestore (leads)
│       ├── Twilio SMS (follow-up)
│       └── Gmail notification (admin)
│
├── mock_data/
│   └── sample_faqs.txt                     # 7 FAQs for Dental clinic RAG
│
├── IMPLEMENTATION_STATUS.md                # 📊 Current status (this session)
├── CODEBASE_REFERENCE.md                   # This file
├── project_portfolio.txt                   # Upwork portfolio description
├── project_status_report.txt               # Previous status
├── roadmap_plan.txt                        # Original roadmap
└── demo_credentials.txt                    # Sample test credentials
```

---

## 🎨 FRONTEND - React Dashboard

### File: `dashboard/src/App.jsx` (880 lines)

**Structure:**
```javascript
// Lines 1-40: Imports + Inline SVG Icons (no external UI library)
// Lines 41-48: State variables (auth, tab, database)
// Lines 49-99: useEffect for API calls
// Lines 100-155: Authentication handlers
// Lines 157-181: Settings form handlers
// Lines 183-265: RAG document handlers
// Lines 287-362: Login Screen (if not authenticated)
// Lines 364-881: Main Dashboard (5 tabs)
```

**Login Screen (Demo Mode):**
```javascript
// Any email/password works
// Role selection: Admin / Client / Staff
// Graceful fallback to demo when backend offline
```

**5 Dashboard Tabs:**

1. **Dashboard Tab** (Lines 481-593)
   - Stats cards: Total calls, leads, conversion rate, missed calls
   - Weekly trend bar chart (7 days)
   - Recent calls list (3 latest)

2. **Call Logs Tab** (Lines 596-652)
   - Full call history list (sortable)
   - Selected call detail view:
     - n8n AI summary
     - Full transcript with speaker labels
     - Call metadata (duration, status, phone)

3. **Leads Tab** (Lines 656-697)
   - Table: Name, phone, email, service, lead health, last contact, notes
   - Badges: Hot / Warm / Converted / Cold
   - Export CSV button

4. **Knowledge Base Tab** (Lines 700-765)
   - PDF upload area
   - URL scraper form
   - Document index with sync status
   - Chunk counts and vector sync indicators
   - Admin-only access

5. **Settings Tab** (Lines 768-877)
   - Business name, hours, booking link
   - System prompt for AI agent
   - OpenRouter model selection
   - VAPI phone number display
   - n8n webhook endpoints
   - Save button (POST to backend)

### API Integration Points in Frontend

```javascript
const API_BASE_URL = 'http://localhost:5000/api';  // Line 38

// All fetch calls have try/catch with graceful fallback to mock data
loadDashboardData()      // Lines 62-93
handleLogin()            // Lines 102-146
handleSaveSettings()     // Lines 164-181
handleAddUrl()           // Lines 185-224
handleFileUploadMock()   // Lines 227-266
```

---

## 🚀 BACKEND - Express.js API

### File: `backend/server.js` (725 lines)

**Endpoints Implemented:**

#### 1. Authentication
```javascript
POST /api/auth/login
  Input: { email, password, role }
  Output: { user: { email, role, name } }
  Lines: 105-137
```

#### 2. Dashboard Stats
```javascript
GET /api/stats
  Output: { totalCalls, totalLeads, conversionRate, missedCalls, trendData }
  Reads from Firestore collection 'stats' or returns mock data
  Lines: 218-233
```

#### 3. Call Logs
```javascript
GET /api/calls
  Output: Array of calls [{ id, callerName, callerPhone, duration, status, summary, transcript }]
  Fetches 50 most recent from Firestore
  Lines: 235-249
```

#### 4. Leads Management
```javascript
GET /api/leads
  Output: Array of leads [{ id, name, phone, email, service, status, notes, lastContact }]
  Lines: 251-265

POST /api/leads
  Input: { name, phone, email, service, status, notes }
  Output: { message, lead }
  Auto-updates stats (totalLeads count + conversion rate)
  Lines: 267-320
```

#### 5. Settings
```javascript
GET /api/settings
  Output: { businessName, businessHours, bookingLink, systemPrompt, openRouterModel, vapiPhoneNumber }
  Lines: 322-337

POST /api/settings
  Input: Updated settings object
  Saves to Firestore with merge: true
  Lines: 339-350
```

#### 6. Documents & Knowledge Base
```javascript
GET /api/documents
  Output: Array of documents [{ id, name, type, size, status, chunksCount }]
  Lines: 352-366

POST /api/documents/upload-mock
  Input: { filename }
  Simulates PDF upload with 3 mock chunks
  Lines: 369-421

POST /api/documents/upload
  Input: FormData with PDF file
  Process: Parse PDF → chunk text → embed (OpenAI if available) → save to Firestore
  Multer storage: uploads/ folder (temp)
  Lines: 460-542

POST /api/documents/scrape
  Input: { url }
  Process: Fetch URL → extract text (Cheerio) → chunk → embed → save
  Lines: 545-638
```

#### 7. RAG Query Search
```javascript
POST /api/rag/query
  Input: { query }
  Process:
    1. Vector similarity search (if OpenAI embeddings available)
    2. Fallback: Keyword matching if no embeddings
    3. Return top 3 results [{ text, source, score }]
  Lines: 641-716
```

#### 8. Firestore CRUD Test Routes
```javascript
GET /test-create          → Create test document
GET /test-read            → Read all test documents
PUT /test-update/:id      → Update document
DELETE /test-delete/:id   → Delete document
Lines: 144-213
```

### Backend Dependencies

```json
{
  "express": "4.19.2",              // Web framework
  "cors": "2.8.5",                  // Cross-origin requests
  "dotenv": "16.4.5",               // Environment variables
  "firebase-admin": "12.1.0",       // Firestore SDK
  "jsonwebtoken": "9.0.2",          // JWT tokens
  "multer": "1.4.5-lts.1",          // File uploads
  "pdf-parse": "1.1.1",             // PDF text extraction
  "cheerio": "1.0.0-rc.12",         // HTML parsing
  "axios": "1.7.2",                 // HTTP requests
  "openai": "4.51.0"                // OpenAI SDK (embeddings)
}
```

### Backend Configuration

**File: `backend/.env`**
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT='...'  # ✅ VALID GCP CREDENTIALS POPULATED
```

**File: `backend/mockDb.js`**
- Mock stats object
- Mock call logs (4 calls)
- Mock leads (3 leads)
- Mock settings
- Mock documents
- All used as fallback when Firestore unavailable

---

## 🔄 FIRESTORE DATABASE

### Schema & Collections

**Collection: `stats/main`**
```javascript
{
  totalCalls: 142,
  totalLeads: 41,
  conversionRate: 28.8,
  missedCalls: 5,
  trendData: [
    { date: "Mon", calls: 18, leads: 4 },
    // ... 7 days
  ]
}
```

**Collection: `calls/{callId}`**
```javascript
{
  callId: "call-001",
  callerName: "John Doe",
  callerPhone: "+1 555 123 4567",
  duration: "2m 14s",
  status: "Booking Made",
  summary: "...",
  transcript: [...],
  timestamp: "2026-05-21T..."
}
```

**Collection: `leads/{leadId}`**
```javascript
{
  name: "John Doe",
  phone: "+1 555 123 4567",
  email: "john@example.com",
  service: "Dental Cleaning",
  status: "Hot",  // or "Warm", "Converted", "Cold"
  notes: "...",
  lastContact: "2026-05-21T...",
  createdAt: "2026-05-21T..."
}
```

**Collection: `documents/{docId}`**
```javascript
{
  id: "doc-123",
  name: "invisalign_pricing.pdf",
  type: "PDF Document",
  size: "142 KB",
  status: "Synced",  // or "Syncing"
  dateAdded: "Today",
  chunksCount: 24,
  createdAt: "2026-05-21T..."
}
```

**Collection: `knowledge_base/{chunkId}` (RAG vectors)**
```javascript
{
  docId: "doc-123",
  docName: "invisalign_pricing.pdf",
  text: "Invisalign starts at $3,500...",
  embedding: [0.123, -0.456, ...],  // 1536-dim OpenAI embedding
  createdAt: "2026-05-21T..."
}
```

**Collection: `settings/main`**
```javascript
{
  businessName: "Radiant Dental Clinic",
  businessHours: "Mon-Fri: 8-6, Sat: 9-2",
  bookingLink: "https://calendly.com/...",
  systemPrompt: "You are Clara, a friendly virtual receptionist...",
  openRouterModel: "openai/gpt-4o-mini",
  vapiPhoneNumber: "+1 (888) 555-9087"
}
```

---

## 🔄 n8n WORKFLOW (Not Yet Active)

### File: `n8n_workflows/post_call_automation.json`

**Workflow Nodes:**

1. **Webhook Trigger** (Line 4)
   - Listens for: `POST /webhook/vapi-call-end`
   - Expects VAPI payload with `body.message.transcript`

2. **AI Lead Extractor** (Line 21)
   - Model: `openai/gpt-4o-mini` via OpenRouter
   - Extracts: name, serviceRequested, leadTemperature (Hot/Warm/Cold), wantsBooking, email
   - System prompt parses call transcript

3. **Save Call Logs** (Line 56)
   - Collection: `calls`
   - Fields: callId, callerPhone, duration, summary, transcript, clientId

4. **Save Lead Entry** (Line 106)
   - Collection: `leads`
   - Upsert by: `name + phone` composite key
   - Fields: name, phone, email, service, status, notes, lastContact

5. **Send SMS Follow-up** (Line 159)
   - Provider: Twilio
   - Message: Booking link + thank you
   - Target: Caller's phone number

6. **Notify Admin Email** (Line 180)
   - Provider: Gmail
   - Recipient: admin@askoraai.com
   - Subject: "New AI Receptionist Lead: {name}"
   - Body: Lead summary + call details

**Status:** `"active": false` (not deployed)

---

## 📋 Configuration Files

### `package.json` (Backend)
- Start script: `npm start` → node server.js
- Dev script: `npm run dev` → nodemon server.js

### `package.json` (Frontend)
- Dev script: `npm run dev` → vite
- Build script: `npm run build` → vite build

### `Dockerfile` (Backend)
- Base image: Node
- Port: 5000
- Ready for deployment

### `.env` (Backend)
- `PORT=5000`
- `FIREBASE_SERVICE_ACCOUNT='...'` ← **VALID GCP KEY POPULATED**

---

## 🧪 Testing the System

### 1. Start Both Servers
```bash
# Terminal 1: Backend
cd backend && npm start
# Server on http://localhost:5000

# Terminal 2: Frontend
cd dashboard && npm run dev
# App on http://localhost:5173
```

### 2. Test API Endpoints
```bash
# Get stats
curl http://localhost:5000/api/stats

# Get calls
curl http://localhost:5000/api/calls

# Create lead
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+1 555 999 1234","service":"Test","status":"Hot"}'

# Query RAG
curl -X POST http://localhost:5000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What are your hours?"}'
```

### 3. Login to Dashboard
- URL: http://localhost:5173
- Email: any@email.com
- Password: anything
- Role: Admin (for full access)

---

## 🎯 Key Code Patterns

### Frontend API Calls with Fallback
```javascript
const loadData = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/endpoint`);
    if (res.ok) {
      const data = await res.json();
      setState(data);
    }
  } catch (err) {
    // Gracefully fall back to mock data
    setState(mockData);
  }
};
```

### Backend Firestore with Mock Fallback
```javascript
app.get('/api/endpoint', async (req, res) => {
  if (db) {
    try {
      const snapshot = await db.collection('name').get();
      return res.json(snapshot.data());
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockDb.data); // Fallback to mock
});
```

### PDF Processing Pipeline
```
Upload PDF → Multer temp storage → 
Parse with pdf-parse → 
Chunk text (800 chars, 150 overlap) →
Embed with OpenAI (or skip if key missing) →
Save chunks to Firestore knowledge_base →
Return chunk count to frontend
```

---

## 📊 Current Status at a Glance

| Component | Lines | Status |
|-----------|-------|--------|
| Frontend (App.jsx) | 880 | ✅ Complete |
| Backend (server.js) | 725 | ✅ Complete |
| Firestore Schema | - | ✅ Designed |
| n8n Workflow | 257 | ⏳ Designed, not active |
| Tests | 0 | ❌ None |
| Deployment | Dockerfile | ⏳ Ready |

---

## 🔗 Quick Links

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Frontend Code:** `dashboard/src/App.jsx`
- **Backend Code:** `backend/server.js`
- **Database Schema:** Firestore console
- **Workflow:** `n8n_workflows/post_call_automation.json`

---

**Last Updated:** 2026-05-21  
**Total Lines of Code:** ~1,600 (frontend + backend)  
**Completion:** Phase 1 & 2 Done, Ready for Phase 3 (VAPI Integration)
