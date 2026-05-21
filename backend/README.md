# AskOra AI Voice Assistant MVP - Backend Service

This is the production-ready backend service for **AskOra AI** built using Node.js & Express. It handles user authentication, Firestore-ready dashboard stats, website scraping, PDF document parsing, and similarity-based RAG query searching.

---

## 🛠️ Installation & Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   OPENAI_API_KEY=your-openai-api-key-here # Optional (Enables vector embedding similarity. Falls back to keyword matching if omitted)
   ```

4. **Run the server in development mode:**
   ```bash
   npm run dev
   ```
   The backend will start listening at `http://localhost:5000`.

---

## 📡 Core API Routes

### Authentication
* **`POST /api/auth/login`**: Sign-in endpoint supporting role-gated profiles (Admin, Client, Staff).
  * *Demo Credentials:*
    * **Admin:** `admin@askoraai.com` / `admin123`
    * **Client:** `client@askoraai.com` / `client123`
    * **Staff:** `staff@askoraai.com` / `staff123`

### Dashboard & Settings Data
* **`GET /api/stats`**: Fetch weekly call counts, lead conversions, and missed calls statistics.
* **`GET /api/calls`**: Fetch call recordings transcript logs.
* **`GET /api/leads`**: Fetch list of captured hot leads.
* **`GET /api/settings`**: Fetch/save active system instructions, scheduling link, and numbers.
* **`POST /api/settings`**: Update client/agent settings.

### RAG Knowledge Base
* **`GET /api/documents`**: Get list of synced FAQ files and URLs.
* **`POST /api/documents/upload`**: Upload and parse local PDF documents.
* **`POST /api/documents/scrape`**: Crawl and parse public FAQ URLs.
* **`POST /api/rag/query`**: Execute similarity-based keyword search on chunked documents (returns top 3 matched contexts).

---

## ☁️ Google Cloud Run Deployment

To deploy this backend service directly to Google Cloud Run, execute the following Google Cloud SDK commands:

1. **Build container image in Google Artifact Registry:**
   ```bash
   gcloud builds submit --tag gcr.io/your-gcp-project/askora-backend:latest
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy askora-backend \
     --image gcr.io/your-gcp-project/askora-backend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars OPENAI_API_KEY="your-openai-key"
   ```
