const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Suppress Chrome DevTools autodiscovery 404 noise
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});
});

// Initialize Firestore — supports both:
//   1. FIREBASE_SERVICE_ACCOUNT_FILE  (path to JSON file — Render Secret File)
//   2. FIREBASE_SERVICE_ACCOUNT       (raw JSON string — local .env)
let db = null;
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
  try {
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
    console.log(`Firebase service account loaded from file: ${filePath}`);
  } catch (err) {
    console.error("Failed to read Firebase service account file:", err.message);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Firebase service account loaded from env variable.");
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:", err.message);
  }
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("Firebase Admin SDK initialized successfully. Firestore is active.");
  } catch (err) {
    console.error("Firebase Admin SDK failed to initialize: ", err.message);
  }
} else {
  console.log("No Firebase credentials found. Running in mock/demo fallback mode.");
}

// Setup Multer for PDF uploads (saving temporarily to uploads folder)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Import mock database for demo fallback
const mockDb = require('./mockDb');

// In-Memory Vector Store cache for active RAG searches
let ragVectorStore = [];

// Load existing knowledge base chunks from Firestore if active
const loadKnowledgeBase = async () => {
  if (!db) return;
  try {
    const snapshot = await db.collection('knowledge_base').get();
    ragVectorStore = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      ragVectorStore.push({
        id: doc.id,
        docId: data.docId,
        docName: data.docName,
        text: data.text,
        embedding: data.embedding || null
      });
    });
    console.log(`Loaded ${ragVectorStore.length} chunks from Firestore knowledge_base.`);
  } catch (err) {
    console.error("Failed to load knowledge_base from Firestore: ", err.message);
  }
};
loadKnowledgeBase();

// Initialize OpenAI client if API key is present
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("OpenAI API client initialized successfully for RAG.");
} else {
  console.log("No OPENAI_API_KEY found in .env. RAG will fall back to local keyword-matching search.");
}

// ----------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Predefined logins for testing
  const users = {
    'admin@askoraai.com': { password: 'admin123', role: 'admin', name: 'Admin Owner' },
    'client@askoraai.com': { password: 'client123', role: 'client', name: 'Client Partner' },
    'staff@askoraai.com': { password: 'staff123', role: 'staff', name: 'Receptionist Staff' }
  };

  const matchedUser = users[email.toLowerCase()];
  
  if (matchedUser && matchedUser.password === password) {
    return res.json({
      user: {
        email: email.toLowerCase(),
        role: matchedUser.role,
        name: matchedUser.name
      }
    });
  }

  // Demo mode fallback: if not matching credentials, accept any details
  res.json({
    user: {
      email: email.toLowerCase(),
      role: role || 'admin',
      name: (role || 'admin').charAt(0).toUpperCase() + (role || 'admin').slice(1) + ' User (Demo)'
    }
  });
});

// =================================================================
// FIRESTORE CRUD TEST ROUTES (Safe Implementation)
// =================================================================

// 1. Create Test: Firestore-e data insert kora
app.get('/test-create', async (req, res) => {
  // db initialization check
  if (!db) {
    return res.status(500).send("Firestore is not initialized. Please check your .env file.");
  }
  
  try {
    const docRef = await db.collection('testCollection').add({
      name: req.body.name || 'Test Name from Askora AI',
      createdAt: new Date(),
      status: 'active'
    });
    res.status(200).send(`Document created with ID: ${docRef.id}`);
  } catch (error) {
    res.status(500).send(`Error creating document: ${error.message}`);
  }
});

// 2. Read Test: Firestore theke sob data fetch kora
app.get('/test-read', async (req, res) => {
  if (!db) {
    return res.status(500).send("Firestore is not initialized. Please check your .env file.");
  }

  try {
    const snapshot = await db.collection('testCollection').get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(`Error reading documents: ${error.message}`);
  }
});

// 3. Update Test: ID dhore specific document update kora
app.put('/test-update/:id', async (req, res) => {
  if (!db) {
    return res.status(500).send("Firestore is not initialized. Please check your .env file.");
  }

  try {
    const { id } = req.params;
    await db.collection('testCollection').doc(id).update({
      name: req.body.name || 'Updated Name successfully',
      updatedAt: new Date()
    });
    res.status(200).send(`Document with ID: ${id} updated successfully.`);
  } catch (error) {
    res.status(500).send(`Error updating document: ${error.message}`);
  }
});

// 4. Delete Test: ID dhore document delete kora
app.delete('/test-delete/:id', async (req, res) => {
  if (!db) {
    return res.status(500).send("Firestore is not initialized. Please check your .env file.");
  }

  try {
    const { id } = req.params;
    await db.collection('testCollection').doc(id).delete();
    res.status(200).send(`Document with ID: ${id} deleted successfully.`);
  } catch (error) {
    res.status(500).send(`Error deleting document: ${error.message}`);
  }
});

// ----------------------------------------
// DASHBOARD DATA ENDPOINTS
// ----------------------------------------
app.get('/api/stats', async (req, res) => {
  if (db) {
    try {
      const statsDoc = await db.collection('stats').doc('main').get();
      if (statsDoc.exists) {
        return res.json(statsDoc.data());
      } else {
        await db.collection('stats').doc('main').set(mockDb.stats);
        return res.json(mockDb.stats);
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockDb.stats);
});

app.get('/api/calls', async (req, res) => {
  if (db) {
    try {
      const snapshot = await db.collection('calls').orderBy('timestamp', 'desc').limit(50).get();
      const calls = [];
      snapshot.forEach(doc => {
        calls.push({ id: doc.id, ...doc.data() });
      });
      return res.json(calls);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockDb.callLogs);
});

app.get('/api/leads', async (req, res) => {
  if (db) {
    try {
      const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
      const leads = [];
      snapshot.forEach(doc => {
        leads.push({ id: doc.id, ...doc.data() });
      });
      return res.json(leads);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockDb.leads);
});

app.post('/api/leads', async (req, res) => {
  const { name, phone, email, service, status, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const newLead = {
    name,
    phone,
    email: email || null,
    service: service || "General inquiry",
    status: status || "Warm",
    lastContact: "Just now",
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      const leadRef = await db.collection('leads').add(newLead);
      newLead.id = leadRef.id;

      // Dynamically update stats in Firestore
      const statsRef = db.collection('stats').doc('main');
      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(statsRef);
        let currentStats = { ...mockDb.stats };
        if (statsDoc.exists) {
          currentStats = statsDoc.data();
        }
        currentStats.totalLeads = (currentStats.totalLeads || 0) + 1;
        if (currentStats.totalCalls > 0) {
          currentStats.conversionRate = parseFloat(((currentStats.totalLeads / currentStats.totalCalls) * 100).toFixed(1));
        }
        transaction.set(statsRef, currentStats);
      });

      return res.json({ message: "Lead saved successfully", lead: newLead });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  newLead.id = `lead-${Date.now()}`;
  mockDb.leads.unshift(newLead);
  
  // Dynamically update stats
  mockDb.stats.totalLeads = mockDb.leads.length;
  if (mockDb.stats.totalCalls > 0) {
    mockDb.stats.conversionRate = parseFloat(((mockDb.stats.totalLeads / mockDb.stats.totalCalls) * 100).toFixed(1));
  }
  
  res.json({ message: "Lead saved successfully", lead: newLead });
});

app.get('/api/settings', async (req, res) => {
  if (db) {
    try {
      const settingsDoc = await db.collection('settings').doc('main').get();
      if (settingsDoc.exists) {
        return res.json(settingsDoc.data());
      } else {
        await db.collection('settings').doc('main').set(mockDb.settings);
        return res.json(mockDb.settings);
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockDb.settings);
});

app.post('/api/settings', async ({ body }, res) => {
  if (db) {
    try {
      await db.collection('settings').doc('main').set(body, { merge: true });
      return res.json({ message: "Settings saved successfully", settings: body });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  mockDb.settings = { ...mockDb.settings, ...body };
  res.json({ message: "Settings saved successfully", settings: mockDb.settings });
});

app.get('/api/documents', async (req, res) => {
  if (db) {
    try {
      const snapshot = await db.collection('documents').orderBy('createdAt', 'desc').get();
      const documents = [];
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return res.json(documents);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockDb.documents);
});

// Mock document upload helper endpoint (triggered from dashboard)
app.post('/api/documents/upload-mock', async ({ body: { filename } }, res) => {
  const fileTitle = filename || "uploaded_document.pdf";
  const docId = `doc-${Date.now()}`;
  const newDoc = {
    id: docId,
    name: fileTitle,
    type: "PDF Document",
    size: "185 KB",
    status: "Synced",
    dateAdded: "Today",
    createdAt: new Date().toISOString(),
    chunksCount: 3
  };

  const mockChunks = [
    `Radiant Dental Clinic offers pricing guidelines for Invisalign starting at $3,500 up to $8,000.`,
    `We accept Delta Dental, MetLife, Cigna, and most major PPO insurance policies.`,
    `Our office hours are Monday to Friday from 8:00 AM to 5:00 PM, and Saturday from 9:00 AM to 2:00 PM.`
  ];

  if (db) {
    try {
      await db.collection('documents').doc(docId).set(newDoc);
      for (let i = 0; i < mockChunks.length; i++) {
        const chunkData = {
          docId: docId,
          docName: fileTitle,
          text: mockChunks[i],
          embedding: null,
          createdAt: new Date().toISOString()
        };
        const chunkRef = await db.collection('knowledge_base').add(chunkData);
        ragVectorStore.push({ id: chunkRef.id, ...chunkData });
      }
      return res.json({ message: "Mock document synchronized to Firestore", chunksCount: mockChunks.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  mockDb.documents.unshift(newDoc);
  mockChunks.forEach((chunk, i) => {
    ragVectorStore.push({
      id: `${docId}-chunk-${i}`,
      docId: docId,
      docName: newDoc.name,
      text: chunk,
      embedding: null
    });
  });

  res.json({ message: "Mock document synchronized", chunksCount: mockChunks.length });
});

// ----------------------------------------
// REAL RAG & SCRAPING ENDPOINTS
// ----------------------------------------

// Text chunker utility helper
const chunkText = (text, maxLength = 800, overlap = 150) => {
  const sentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.?!])\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-Math.floor(overlap / 6)).join(' ') + ' ' + sentence + ' ';
    } else {
      currentChunk += sentence + ' ';
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
};

// Compute similarity score using a basic cosine similarity simulation (or word overlap) if OpenAI is not available
const computeKeywordScore = (query, text) => {
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();
  let matches = 0;
  for (const word of queryWords) {
    if (textLower.includes(word)) matches++;
  }
  return matches / (queryWords.length || 1);
};

// 1. PDF File Upload and Parsing
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const parsedPdf = await pdfParse(dataBuffer);
    const rawText = parsedPdf.text;
    
    // Chunk parsed text
    const chunks = chunkText(rawText);
    const docId = `doc-${Date.now()}`;
    const docName = req.file.originalname;

    // Save metadata
    const newDoc = {
      id: docId,
      name: docName,
      type: "PDF Document",
      size: `${Math.round(req.file.size / 1024)} KB`,
      status: "Synced",
      dateAdded: "Today",
      createdAt: new Date().toISOString(),
      chunksCount: chunks.length
    };

    if (db) {
      await db.collection('documents').doc(docId).set(newDoc);
    } else {
      mockDb.documents.unshift(newDoc);
    }

    // Save chunks to Vector Store (compute OpenAI embeddings asynchronously if key exists)
    for (let i = 0; i < chunks.length; i++) {
      let embedding = null;
      if (openai) {
        try {
          const embRes = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunks[i],
          });
          embedding = embRes.data[0].embedding;
        } catch (embErr) {
          console.error("OpenAI Embedding generation failed: ", embErr.message);
        }
      }

      const chunkData = {
        docId: docId,
        docName: docName,
        text: chunks[i],
        embedding: embedding,
        createdAt: new Date().toISOString()
      };

      if (db) {
        const chunkRef = await db.collection('knowledge_base').add(chunkData);
        ragVectorStore.push({ id: chunkRef.id, ...chunkData });
      } else {
        ragVectorStore.push({
          id: `${docId}-chunk-${i}`,
          docId: docId,
          docName: docName,
          text: chunks[i],
          embedding: embedding
        });
      }
    }

    // Delete temp file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "PDF parsed, embedded, and added to knowledge base successfully.",
      document: newDoc,
      chunksCount: chunks.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload and parse PDF", error: err.message });
  }
});

// 2. URL Scraping and Parsing
app.post('/api/documents/scrape', async ({ body: { url } }, res) => {
  try {
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Remove unwanted script, style, navigation elements
    $('script, style, nav, footer, header, noscript').remove();
    
    const bodyText = $('body').text();
    const cleanText = bodyText.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
    
    if (cleanText.length < 50) {
      return res.status(400).json({ message: "Insufficient text content found at URL to scrape" });
    }

    // Chunk text
    const chunks = chunkText(cleanText);
    const docId = `doc-${Date.now()}`;

    // Save metadata
    const newDoc = {
      id: docId,
      name: url,
      type: "Website URL",
      size: `${chunks.length} Chunks Scraped`,
      status: "Synced",
      dateAdded: "Today",
      createdAt: new Date().toISOString(),
      chunksCount: chunks.length
    };

    if (db) {
      await db.collection('documents').doc(docId).set(newDoc);
    } else {
      mockDb.documents.unshift(newDoc);
    }

    // Save chunks to Vector Store
    for (let i = 0; i < chunks.length; i++) {
      let embedding = null;
      if (openai) {
        try {
          const embRes = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunks[i],
          });
          embedding = embRes.data[0].embedding;
        } catch (embErr) {
          console.error("OpenAI Embedding generation failed for URL: ", embErr.message);
        }
      }

      const chunkData = {
        docId: docId,
        docName: url,
        text: chunks[i],
        embedding: embedding,
        createdAt: new Date().toISOString()
      };

      if (db) {
        const chunkRef = await db.collection('knowledge_base').add(chunkData);
        ragVectorStore.push({ id: chunkRef.id, ...chunkData });
      } else {
        ragVectorStore.push({
          id: `${docId}-chunk-${i}`,
          docId: docId,
          docName: url,
          text: chunks[i],
          embedding: embedding
        });
      }
    }

    res.json({
      message: "Website URL scraped and synced successfully",
      document: newDoc,
      chunksCount: chunks.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to scrape Website URL", error: err.message });
  }
});

// 3. RAG Query search (used by VAPI / n8n workflow to lookup answers)
app.post('/api/rag/query', async ({ body: { query } }, res) => {
  try {
    if (!query) {
      return res.status(400).json({ message: "Query string is required" });
    }

    let results = [];

    // Option A: Use Vector Similarity Search if OpenAI is initialized
    if (openai && ragVectorStore.some(c => c.embedding !== null)) {
      try {
        const queryEmbRes = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: query,
        });
        const queryEmbedding = queryEmbRes.data[0].embedding;

        // Calculate cosine similarity
        results = ragVectorStore
          .filter(c => c.embedding !== null)
          .map(chunk => {
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;
            for (let i = 0; i < queryEmbedding.length; i++) {
              dotProduct += queryEmbedding[i] * chunk.embedding[i];
              normA += queryEmbedding[i] * queryEmbedding[i];
              normB += chunk.embedding[i] * chunk.embedding[i];
            }
            const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
            return { text: chunk.text, source: chunk.docName, score: similarity };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3); // Return top 3 matches
      } catch (embErr) {
        console.error("Vector search failed, falling back to keyword search: ", embErr.message);
      }
    }

    // Option B: Fallback to keyword overlap indexing
    if (results.length === 0) {
      results = ragVectorStore
        .map(chunk => {
          const score = computeKeywordScore(query, chunk.text);
          return { text: chunk.text, source: chunk.docName, score: score };
        })
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    }

    // Default response if no knowledge is synced yet
    if (results.length === 0) {
      let bookingLink = "http://localhost:5173/";
      if (db) {
        const settingsDoc = await db.collection('settings').doc('main').get();
        if (settingsDoc.exists) {
          bookingLink = settingsDoc.data().bookingLink || bookingLink;
        }
      } else {
        bookingLink = mockDb.settings.bookingLink;
      }

      results = [{
        text: `No matching clinic info found in our database. Rely on general scheduling procedures. Business Hours: Monday to Saturday, Booking Link: ${bookingLink}`,
        source: "Default Clinic Info",
        score: 0.1
      }];
    }

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "RAG query processing failed", error: err.message });
  }
});

// ========================================================
// RETELL AI INTEGRATION — Phase 3 (Web Call Demo)
// ========================================================

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_BASE    = 'https://api.retellai.com';

// POST /api/retell/setup — Retell LLM + Agent তৈরি করে (একবার চালাতে হবে)
app.post('/api/retell/setup', async (req, res) => {
  if (!RETELL_API_KEY) return res.status(400).json({ error: 'RETELL_API_KEY .env-এ নেই' });

  try {
    // Settings থেকে system prompt নাও
    let settings = mockDb.settings;
    if (db) {
      const snap = await db.collection('settings').doc('main').get();
      if (snap.exists) settings = snap.data();
    }

    // Step 1: Retell LLM তৈরি করো
    const llmRes = await axios.post(`${RETELL_BASE}/create-retell-llm`, {
      model: 'gpt-4o-mini',
      general_prompt: settings.systemPrompt || 'You are Clara, a professional virtual receptionist for Radiant Dental Clinic. Answer questions about services, hours, insurance, and help patients book appointments. Be concise and friendly.',
      begin_message: 'Hello! Thank you for calling Radiant Dental Clinic. This is Clara, your AI receptionist. How can I help you today?',
    }, { headers: { 'Authorization': `Bearer ${RETELL_API_KEY}`, 'Content-Type': 'application/json' } });

    const llmId = llmRes.data.llm_id;
    console.log('✅ Retell LLM created:', llmId);

    // Step 2: Retell Agent তৈরি করো (v2 format — response_engine required)
    const agentRes = await axios.post(`${RETELL_BASE}/create-agent`, {
      response_engine: { type: 'retell-llm', llm_id: llmId },
      voice_id: 'cartesia-Cleo',
      agent_name: 'Clara - Radiant Dental',
      ambient_sound: 'coffee-shop',
      language: 'en-US',
      responsiveness: 1,
      interruption_sensitivity: 0.8,
      end_call_after_silence_ms: 10000,
    }, { headers: { 'Authorization': `Bearer ${RETELL_API_KEY}`, 'Content-Type': 'application/json' } });

    const agentId = agentRes.data.agent_id;
    console.log('✅ Retell Agent created:', agentId);

    res.json({
      success: true,
      llm_id: llmId,
      agent_id: agentId,
      next_step: `RETELL_AGENT_ID=${agentId} → .env ফাইলে add করো`
    });

  } catch (err) {
    console.error('Retell setup error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// POST /api/retell/create-web-call — Frontend থেকে demo call শুরু করতে
app.post('/api/retell/create-web-call', async (req, res) => {
  if (!RETELL_API_KEY) return res.status(400).json({ error: 'RETELL_API_KEY নেই' });

  const agentId = process.env.RETELL_AGENT_ID;
  if (!agentId) return res.status(400).json({ error: 'RETELL_AGENT_ID নেই। আগে /api/retell/setup চালাও।' });

  try {
    const response = await axios.post(`${RETELL_BASE}/v2/create-web-call`,
      { agent_id: agentId },
      { headers: { 'Authorization': `Bearer ${RETELL_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    res.json({ access_token: response.data.access_token, call_id: response.data.call_id });
  } catch (err) {
    console.error('Web call error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// GET /api/retell/status — Retell কনফিগার হয়েছে কিনা চেক করো
app.get('/api/retell/status', (req, res) => {
  res.json({
    api_key_set: !!RETELL_API_KEY,
    agent_ready: !!process.env.RETELL_AGENT_ID,
    agent_id: process.env.RETELL_AGENT_ID || null
  });
});

// POST /webhook/retell — Call শেষ হলে Retell এখানে data পাঠায়
app.post('/webhook/retell', async (req, res) => {
  res.status(200).json({ received: true }); // Retell-কে তাড়াতাড়ি reply

  try {
    const { event, call } = req.body;
    if (event !== 'call_ended') return;

    const callId       = call.call_id;
    const callerPhone  = call.from_number || 'Web Demo Call';
    const rawTranscript = call.transcript || '';
    const durationSecs = Math.round((call.duration_ms || 0) / 1000);
    const durationStr  = `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`;

    console.log(`\n📞 Retell call ended — ${callId} | ${durationStr}`);

    // Retell transcript_object: [{role:"agent", content:"..."}, {role:"user", content:"..."}]
    const parseRetellTranscript = (transcriptObj) => {
      if (!Array.isArray(transcriptObj)) return [];
      return transcriptObj.map(msg => ({
        speaker: msg.role === 'agent' ? 'Assistant' : 'Caller',
        text: msg.content || ''
      })).filter(m => m.text.trim());
    };

    const leadInfo = await extractLeadFromTranscript(rawTranscript, callerPhone);

    let callStatus = 'Completed';
    if (durationSecs < 8)           callStatus = 'Missed Call';
    else if (leadInfo.wantsBooking)  callStatus = 'Booking Made';
    else if (leadInfo.callerName !== 'Unknown Caller') callStatus = 'Lead Generated';

    const callLog = {
      id: callId,
      callerName: leadInfo.callerName,
      callerPhone,
      duration: durationStr,
      status: callStatus,
      timestamp: new Date().toLocaleString('en-US'),
      summary: call.call_analysis?.call_summary || leadInfo.summary,
      transcript: parseRetellTranscript(call.transcript_object),
      source: 'Retell Web Demo',
      createdAt: new Date().toISOString()
    };

    if (db) {
      await db.collection('calls').doc(callId).set(callLog);
    } else {
      mockDb.callLogs.unshift(callLog);
    }

    await updateCallStats(callStatus);

    if (callStatus !== 'Missed Call') {
      const lead = {
        name: leadInfo.callerName,
        phone: callerPhone,
        email: leadInfo.email || null,
        service: leadInfo.serviceRequested || 'General Inquiry',
        status: leadInfo.leadTemperature || 'Warm',
        lastContact: new Date().toLocaleString('en-US'),
        notes: leadInfo.summary,
        source: 'Retell Web Demo',
        createdAt: new Date().toISOString()
      };
      if (db) {
        await db.collection('leads').add(lead);
        const statsRef = db.collection('stats').doc('main');
        await db.runTransaction(async tx => {
          const doc = await tx.get(statsRef);
          const cur = doc.exists ? doc.data() : { totalLeads: 0 };
          tx.set(statsRef, { ...cur, totalLeads: (cur.totalLeads || 0) + 1 }, { merge: true });
        });
      } else {
        lead.id = `lead-${Date.now()}`;
        mockDb.leads.unshift(lead);
        mockDb.stats.totalLeads += 1;
      }
      console.log(`✅ Lead saved: ${lead.name} | ${callStatus}`);
    }

  } catch (err) {
    console.error('❌ Retell webhook error:', err.message);
  }
});

// ========================================================
// VAPI PHONE INTEGRATION — Phase 3
// ========================================================

// Helper: Parse raw VAPI transcript string into message array
// VAPI sends transcript as: "AI: Hello\nUser: Hi\nAI: How can I help?"
const parseTranscriptToMessages = (rawTranscript) => {
  if (!rawTranscript || typeof rawTranscript !== 'string') return [];
  return rawTranscript
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      if (line.startsWith('AI:') || line.startsWith('Assistant:')) {
        return { speaker: 'Assistant', text: line.replace(/^(AI:|Assistant:)\s*/, '') };
      } else if (line.startsWith('User:') || line.startsWith('Caller:') || line.startsWith('Human:')) {
        return { speaker: 'Caller', text: line.replace(/^(User:|Caller:|Human:)\s*/, '') };
      }
      return { speaker: 'System', text: line };
    })
    .filter(msg => msg.speaker !== 'System');
};

// Helper: Extract lead info from transcript using OpenRouter or keyword fallback
const extractLeadFromTranscript = async (transcript, callerPhone) => {
  const defaultResult = {
    callerName: 'Unknown Caller',
    serviceRequested: 'General Inquiry',
    leadTemperature: 'Cold',
    summary: 'Call received. No details captured.',
    wantsBooking: false,
    email: null
  };

  if (!transcript || transcript.length < 10) return defaultResult;

  // Option A: Use OpenRouter/OpenAI to parse transcript
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI parser for a dental clinic. Analyze the call transcript and extract structured data. Return ONLY valid JSON with no extra text. Format:
{
  "callerName": "extracted full name or Unknown Caller",
  "serviceRequested": "specific dental service or General Inquiry",
  "leadTemperature": "Hot | Warm | Cold",
  "summary": "one sentence call summary",
  "wantsBooking": true or false,
  "email": "email address if mentioned or null"
}`
          },
          {
            role: 'user',
            content: `Caller phone: ${callerPhone}\nTranscript:\n${transcript}`
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      });

      const rawJson = completion.choices[0].message.content.trim();
      const parsed = JSON.parse(rawJson);
      console.log('✅ OpenRouter lead extraction successful:', parsed.callerName);
      return { ...defaultResult, ...parsed };
    } catch (err) {
      console.log('⚠️ OpenRouter extraction failed, using keyword fallback:', err.message);
    }
  }

  // Option B: Keyword-based fallback extraction
  const lowerTranscript = transcript.toLowerCase();

  // Extract name: look for "my name is X" or "this is X" patterns
  let callerName = 'Unknown Caller';
  const namePatterns = [
    /my name is ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /i(?:'m| am) ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /this is ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /name(?:'s| is) ([A-Z][a-z]+ [A-Z][a-z]+)/i
  ];
  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match) { callerName = match[1]; break; }
  }

  // Extract email
  const emailMatch = transcript.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Detect service requested
  const serviceKeywords = {
    'Dental Implants': ['implant', 'implants'],
    'Invisalign / Braces': ['invisalign', 'braces', 'aligner', 'straighten'],
    'Teeth Whitening': ['whiten', 'whitening', 'bleach'],
    'Emergency Dentistry': ['emergency', 'urgent', 'pain', 'toothache', 'broken tooth', 'knocked out'],
    'Root Canal': ['root canal', 'nerve'],
    'Dental Cleaning': ['cleaning', 'checkup', 'check-up', 'routine', 'hygiene'],
    'Veneers': ['veneer', 'veneers', 'cosmetic'],
    'Tooth Extraction': ['extract', 'pull', 'removal'],
    'Pricing / Insurance': ['price', 'cost', 'insurance', 'coverage', 'how much'],
    'Appointment Booking': ['book', 'schedule', 'appointment', 'available']
  };

  let serviceRequested = 'General Inquiry';
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(kw => lowerTranscript.includes(kw))) {
      serviceRequested = service;
      break;
    }
  }

  // Determine lead temperature
  const wantsBooking = /book|schedul|appointment|confirm|yes please|when can/i.test(transcript);
  const showsUrgency = /emergency|urgent|pain|today|asap|immediately/i.test(transcript);
  const justBrowsing = /maybe|think about|not sure|later|just curious/i.test(transcript);

  let leadTemperature = 'Warm';
  if (wantsBooking || showsUrgency) leadTemperature = 'Hot';
  else if (justBrowsing || callerName === 'Unknown Caller') leadTemperature = 'Cold';

  // Build summary
  const summary = callerName !== 'Unknown Caller'
    ? `${callerName} called regarding ${serviceRequested}. Lead temperature: ${leadTemperature}.`
    : `Unknown caller inquired about ${serviceRequested}. No personal details captured.`;

  return { callerName, serviceRequested, leadTemperature, summary, wantsBooking, email };
};

// Helper: Update stats in Firestore or mockDb after a call
const updateCallStats = async (callStatus) => {
  const increment = {
    totalCalls: 1,
    missedCalls: callStatus === 'Missed Call' ? 1 : 0
  };

  if (db) {
    try {
      const statsRef = db.collection('stats').doc('main');
      await db.runTransaction(async (tx) => {
        const doc = await tx.get(statsRef);
        const current = doc.exists ? doc.data() : { totalCalls: 0, totalLeads: 0, conversionRate: 0, missedCalls: 0 };
        const updated = {
          ...current,
          totalCalls: (current.totalCalls || 0) + 1,
          missedCalls: (current.missedCalls || 0) + increment.missedCalls
        };
        if (updated.totalCalls > 0) {
          updated.conversionRate = parseFloat(((updated.totalLeads / updated.totalCalls) * 100).toFixed(1));
        }
        tx.set(statsRef, updated);
      });
    } catch (err) {
      console.error('Stats update error:', err.message);
    }
  } else {
    mockDb.stats.totalCalls += 1;
    if (callStatus === 'Missed Call') mockDb.stats.missedCalls += 1;
    if (mockDb.stats.totalCalls > 0) {
      mockDb.stats.conversionRate = parseFloat(((mockDb.stats.totalLeads / mockDb.stats.totalCalls) * 100).toFixed(1));
    }
  }
};

// ─────────────────────────────────────────────────────────────
// POST /webhook/vapi — VAPI calls this after every call ends
// This replaces n8n for MVP — no separate automation server needed
// ─────────────────────────────────────────────────────────────
app.post('/webhook/vapi', async (req, res) => {
  // Acknowledge immediately — VAPI has a short timeout (3s)
  res.status(200).json({ received: true });

  try {
    const message = req.body?.message;

    // VAPI sends several event types; only process end-of-call-report
    if (!message || message.type !== 'end-of-call-report') {
      console.log(`📡 VAPI event received (ignored): ${req.body?.message?.type || 'unknown'}`);
      return;
    }

    // Extract call details from VAPI payload
    const callId       = message.call?.id || `call-${Date.now()}`;
    const callerPhone  = message.call?.customer?.number || 'Unknown';
    const rawTranscript = message.transcript || '';
    const durationSecs = Math.round(message.durationSeconds || 0);
    const endedReason  = message.endedReason || 'unknown';

    // Format duration as "Xm Ys"
    const durationStr = `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`;

    console.log(`\n📞 VAPI call ended — ID: ${callId} | Phone: ${callerPhone} | Duration: ${durationStr}`);

    // Parse transcript and extract lead info
    const leadInfo = await extractLeadFromTranscript(rawTranscript, callerPhone);

    // Determine call outcome status
    let callStatus = 'Completed';
    if (durationSecs < 8) {
      callStatus = 'Missed Call';
    } else if (leadInfo.wantsBooking) {
      callStatus = 'Booking Made';
    } else if (leadInfo.callerName !== 'Unknown Caller') {
      callStatus = 'Lead Generated';
    }

    // Build structured call log
    const callLog = {
      id: callId,
      callerName: leadInfo.callerName,
      callerPhone,
      duration: durationStr,
      status: callStatus,
      timestamp: new Date().toLocaleString('en-US'),
      summary: leadInfo.summary,
      transcript: parseTranscriptToMessages(rawTranscript),
      endedReason,
      createdAt: new Date().toISOString()
    };

    // Persist call log
    if (db) {
      await db.collection('calls').doc(callId).set(callLog);
    } else {
      callLog.id = callId;
      mockDb.callLogs.unshift(callLog);
    }

    // Update call stats
    await updateCallStats(callStatus);

    // Save lead (only if we have at least a phone number)
    const shouldSaveLead = callStatus !== 'Missed Call' || leadInfo.callerName !== 'Unknown Caller';
    if (shouldSaveLead) {
      const lead = {
        name: leadInfo.callerName,
        phone: callerPhone,
        email: leadInfo.email || null,
        service: leadInfo.serviceRequested || 'General Inquiry',
        status: leadInfo.leadTemperature || 'Warm',
        lastContact: new Date().toLocaleString('en-US'),
        notes: leadInfo.summary,
        createdAt: new Date().toISOString()
      };

      if (db) {
        const leadRef = await db.collection('leads').add(lead);
        // Also update totalLeads in stats
        await db.runTransaction(async (tx) => {
          const statsRef = db.collection('stats').doc('main');
          const doc = await tx.get(statsRef);
          const current = doc.exists ? doc.data() : { totalCalls: 0, totalLeads: 0 };
          tx.set(statsRef, { ...current, totalLeads: (current.totalLeads || 0) + 1 }, { merge: true });
        });
        console.log(`✅ Lead saved to Firestore: ${lead.name} | ${leadRef.id}`);
      } else {
        lead.id = `lead-${Date.now()}`;
        mockDb.leads.unshift(lead);
        mockDb.stats.totalLeads += 1;
        console.log(`✅ Lead saved to mockDb: ${lead.name}`);
      }
    }

    console.log(`✅ VAPI call fully processed: ${callStatus} | Caller: ${leadInfo.callerName}`);
  } catch (err) {
    console.error('❌ VAPI webhook processing error:', err.message);
  }
});

// POST /webhook/vapi/live-tools — VAPI calls this mid-call for RAG lookups
// Allows the AI to look up knowledge base answers DURING the call
app.post('/webhook/vapi/live-tools', async (req, res) => {
  try {
    const { message } = req.body;

    if (message?.type === 'function-call' && message?.functionCall?.name === 'getKnowledgeBaseAnswer') {
      const query = message.functionCall.parameters?.query || '';
      console.log(`🔍 VAPI live RAG lookup: "${query}"`);

      // Run RAG search
      let results = ragVectorStore
        .map(chunk => ({ text: chunk.text, score: computeKeywordScore(query, chunk.text) }))
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      let answer = results.length > 0
        ? results.map(r => r.text).join(' ')
        : 'I don\'t have specific information about that. Please let me connect you with our team.';

      // Trim to 400 chars for voice (don't read 1000 words on a phone call!)
      if (answer.length > 400) answer = answer.substring(0, 397) + '...';

      return res.json({
        result: answer
      });
    }

    res.json({ result: 'OK' });
  } catch (err) {
    console.error('❌ VAPI live-tools error:', err.message);
    res.json({ result: 'An error occurred. Please hold.' });
  }
});

// GET /webhook/vapi/status — Health check for VAPI to confirm server is reachable
app.get('/webhook/vapi/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'AskOra AI Backend',
    firestore: db ? 'connected' : 'mock-mode',
    rag_chunks: ragVectorStore.length,
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 AskOra AI MVP Backend Server is running!`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`================================================`);
  console.log(`📞 VAPI Webhook:  POST /webhook/vapi`);
  console.log(`🔍 VAPI Live RAG: POST /webhook/vapi/live-tools`);
  console.log(`🟢 VAPI Status:   GET  /webhook/vapi/status`);
  console.log(`================================================`);
});
