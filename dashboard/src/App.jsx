import React, { useState, useEffect, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import {
 mockStats,
  mockCallLogs,
  mockLeads,
  mockSettings,
  mockDocuments
}from './mockDatabase';

// Custom Inline SVG Icons to prevent registry/dependency errors
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  Calls: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/></svg>
  ),
  Leads: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  KB: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  Link: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  )
};

const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
  // Authentication & Session States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('admin');
  const [loginError, setLoginError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Active Tab View State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Database / Dashboard States
  const [stats, setStats] = useState(mockStats);
  const [callLogs, setCallLogs] = useState(mockCallLogs);
  const [selectedCall, setSelectedCall] = useState(mockCallLogs[0]);
  const [settings, setSettings] = useState(mockSettings);
  const [documents, setDocuments] = useState(mockDocuments);

  // Retell AI Live Demo Call States
  const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active | ended
  const [liveTranscript, setLiveTranscript] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const retellClientRef = useRef(null);
  const callTimerRef = useRef(null);
  const [leads, setLeads] = useState(mockLeads);

  // Load dashboard data from backend APIs (mock data stays as initial/fallback)
  const loadDashboardData = async () => {
    const fetchJson = async (path) => {
      const res = await fetch(`${API_BASE_URL}${path}`);
      if (!res.ok) throw new Error(`${path} returned ${res.status}`);
      return res.json();
    };

    try {
      const [statsData, callsData, leadsData, settingsData, documentsData] = await Promise.all([
        fetchJson('/stats'),
        fetchJson('/calls'),
        fetchJson('/leads'),
        fetchJson('/settings'),
        fetchJson('/documents'),
      ]);

      if (statsData) setStats(statsData);

      if (Array.isArray(callsData)) {
        setCallLogs(callsData);
        if (callsData.length > 0) setSelectedCall(callsData[0]);
      }

      if (Array.isArray(leadsData)) setLeads(leadsData);
      if (settingsData) setSettings(settingsData);
      if (Array.isArray(documentsData)) setDocuments(documentsData);

      console.log('Dashboard data loaded from API');
    } catch (err) {
      console.log('Backend API unavailable — showing mock fallback data.', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        if (loginRole === 'staff') {
          setActiveTab('calls');
        } else {
          setActiveTab('dashboard');
        }
      } else {
        const errData = await response.json();
        setLoginError(errData.message || 'Invalid credentials');
      }
    } catch (err) {
      console.log("Backend auth server offline. Accessing Dashboard in demo mode.");
      if (loginEmail && loginPassword) {
        setUser({ 
          email: loginEmail, 
          role: loginRole, 
          name: loginRole === 'admin' ? 'Admin Owner' : loginRole === 'client' ? 'Client Partner' : 'Receptionist Staff'
        });
        setIsAuthenticated(true);
        if (loginRole === 'staff') {
          setActiveTab('calls');
        } else {
          setActiveTab('dashboard');
        }
      } else {
        setLoginError('Please enter any email and password.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };
  
  // ── Retell AI Demo Call Handlers ──
  const startDemoCall = async () => {
    try {
      setCallStatus('connecting');
      setLiveTranscript([]);
      setCallDuration(0);

      // Backend থেকে Retell access token নাও
      const res = await fetch(`${API_BASE_URL}/retell/create-web-call`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to start call: ${err.error}`);
        setCallStatus('idle');
        return;
      }
      const { access_token } = await res.json();

      // Retell Web Client তৈরি করো
      const client = new RetellWebClient();
      retellClientRef.current = client;

      // Events
      client.on('call_started', () => {
        setCallStatus('active');
        callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      });

      client.on('call_ended', () => {
        setCallStatus('ended');
        clearInterval(callTimerRef.current);
        // Refresh dashboard 3 seconds after call ends
        setTimeout(() => {
          loadDashboardData();
          setCallStatus('idle');
          setLiveTranscript([]);
          setCallDuration(0);
        }, 3000);
      });

      client.on('update', (update) => {
        if (update.transcript) {
          const msgs = update.transcript.map(m => ({
            speaker: m.role === 'agent' ? 'Clara' : 'You',
            text: m.content
          }));
          setLiveTranscript(msgs);
        }
      });

      client.on('error', (err) => {
        console.error('Retell error:', err);
        setCallStatus('idle');
        clearInterval(callTimerRef.current);
      });

      // Call শুরু করো
      await client.startCall({ accessToken: access_token });

    } catch (err) {
      console.error('Demo call failed:', err);
      alert('Failed to start call. Please make sure the backend is running.');
      setCallStatus('idle');
    }
  };

  const endDemoCall = () => {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
    clearInterval(callTimerRef.current);
    setCallStatus('idle');
    setLiveTranscript([]);
    setCallDuration(0);
  };

  const formatDuration = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  // Settings Form Change Handler
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Settings Save Handler
  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Settings successfully saved and synced to Firestore!");
        loadDashboardData();
      } else {
        alert("Failed to save settings to live server.");
      }
    } catch (err) {
      console.log("Backend offline, saving settings in demo mode.");
      alert("Settings successfully saved and synced to Firestore (Demo Mode)!");
    }
  };

  // RAG Document Scraper Simulator
  const [newUrl, setNewUrl] = useState('');
  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    const urlToScrape = newUrl;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: urlToScrape,
      type: "Website URL",
      size: "Scraping...",
      status: "Syncing",
      dateAdded: "Today",
      chunksCount: 0
    };
    setDocuments(prev => [newDoc, ...prev]);
    setNewUrl('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/documents/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScrape })
      });
      if (res.ok) {
        await loadDashboardData();
      } else {
        throw new Error("Scrape failed");
      }
    } catch (err) {
      console.log("Scraping server not detected, using demo timer fallback.");
      setTimeout(() => {
        setDocuments(currentDocs => 
          currentDocs.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, size: "12 Pages Scraped", status: "Synced", chunksCount: 38 } 
              : doc
          )
        );
      }, 3000);
    }
  };

  // Mock Upload Handler
  const handleFileUploadMock = async () => {
    const fileNames = ["dental_insurance_guidelines.pdf", "invisalign_pricing_2026.pdf", "patient_consent_form.pdf"];
    const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: randomName,
      type: "PDF Document",
      size: "185 KB",
      status: "Syncing",
      dateAdded: "Today",
      chunksCount: 0
    };
    
    setDocuments(prev => [newDoc, ...prev]);

    try {
      const res = await fetch(`${API_BASE_URL}/documents/upload-mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: randomName })
      });
      if (res.ok) {
        await loadDashboardData();
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.log("Upload server not detected, using demo timer fallback.");
      setTimeout(() => {
        setDocuments(currentDocs => 
          currentDocs.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: "Synced", chunksCount: 18 } 
              : doc
          )
        );
      }, 2500);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Booking Made": return "badge badge-success";
      case "Lead Generated": return "badge badge-primary";
      case "Missed Call": return "badge badge-danger";
      default: return "badge badge-warning";
    }
  };

  const getLeadStatusBadge = (status) => {
    switch (status) {
      case "Hot": return "badge badge-danger";
      case "Warm": return "badge badge-warning";
      case "Converted": return "badge badge-success";
      default: return "badge badge-primary";
    }
  };

  // Render Login Panel if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.08) 0px, transparent 50%)',
      }}>
        <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', border: '1px solid var(--card-border)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ background: '#6366f1', padding: '0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AskOra AI</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Voice Assistant SaaS Platform Login</p>
          </div>
          
          {loginError && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="admin@askoraai.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Select Workspace Role</label>
              <select 
                className="form-control"
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                style={{ background: 'rgba(17, 24, 39, 0.9)' }}
              >
                <option value="admin">Admin Owner (Full Access)</option>
                <option value="client">Client Business (Dashboard, Logs, Leads)</option>
                <option value="staff">Front-desk Staff (Logs & Leads only)</option>
              </select>
            </div>
            
            <button type="submit" className="btn" style={{ marginTop: '0.5rem', width: '100%' }} disabled={isAuthLoading}>
              {isAuthLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          
          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
            * Demo Mode: Enter any email and password to log in.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="logo-container">
          <div style={{ background: '#6366f1', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
          </div>
          <span>AskOra AI</span>
        </div>
        
        <ul className="nav-links">
          {user?.role !== 'staff' && (
            <li>
              <div 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Icons.Dashboard />
                <span>Dashboard</span>
              </div>
            </li>
          )}
          <li>
            <div 
              className={`nav-item ${activeTab === 'calls' ? 'active' : ''}`}
              onClick={() => setActiveTab('calls')}
            >
              <Icons.Calls />
              <span>Call Logs</span>
            </div>
          </li>
          <li>
            <div 
              className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              <Icons.Leads />
              <span>Leads</span>
            </div>
          </li>
          {user?.role === 'admin' && (
            <li>
              <div 
                className={`nav-item ${activeTab === 'kb' ? 'active' : ''}`}
                onClick={() => setActiveTab('kb')}
              >
                <Icons.KB />
                <span>Knowledge Base</span>
              </div>
            </li>
          )}
          {user?.role !== 'staff' && (
            <li>
              <div 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Icons.Settings />
                <span>Settings</span>
              </div>
            </li>
          )}
        </ul>

        {/* User Card */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AD'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', width: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin Owner'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role || 'Admin'} Role</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Panel Area */}
      <main className="main-content">
        <header className="header">
          <div className="title-group">
            <h1>
              {activeTab === 'dashboard' && "Virtual Receptionist Dashboard"}
              {activeTab === 'calls' && "Call Analysis & Transcripts"}
              {activeTab === 'leads' && "Captured Leads Pipeline"}
              {activeTab === 'kb' && "RAG Document Knowledge Base"}
              {activeTab === 'settings' && "Receptionist Settings"}
            </h1>
            <p>
              {activeTab === 'dashboard' && `Real-time updates for ${settings.businessName}`}
              {activeTab === 'calls' && "Review details, AI summaries, and full chat logs of all client calls"}
              {activeTab === 'leads' && "View hot, warm, and converted leads extracted by n8n"}
              {activeTab === 'kb' && "Upload PDFs or input URLs to train the AI voice assistant receptionist"}
              {activeTab === 'settings' && "Configure voice assistant, booking integration, and OpenRouter API parameters"}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', display: 'inline-block' }}></span>
              Agent Active
            </span>
          </div>
        </header>

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && user?.role !== 'staff' && (
          <div>

            {/* ── Retell AI Live Demo Call Widget ── */}
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Mic icon */}
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: callStatus === 'active' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.15)', border: `2px solid ${callStatus === 'active' ? '#ef4444' : '#6366f1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {callStatus === 'active'
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="10"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                    {callStatus === 'idle' && '🎙️ Live AI Demo Call'}
                    {callStatus === 'connecting' && '⏳ Connecting to Clara...'}
                    {callStatus === 'active' && `🔴 Live Call — ${formatDuration(callDuration)}`}
                    {callStatus === 'ended' && '✅ Call Ended! Refreshing dashboard...'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {callStatus === 'idle' && 'Talk to Clara AI — call log & lead will be created automatically'}
                    {callStatus === 'active' && 'Microphone active. Clara is responding...'}
                    {callStatus === 'connecting' && 'Please wait...'}
                    {callStatus === 'ended' && 'Saving call log & lead to Firestore...'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {callStatus === 'idle' && (
                  <button onClick={startDemoCall} className="btn" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1 4.18 2 2 0 0 1 2.96 2h3.1a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Start Demo Call
                  </button>
                )}
                {callStatus === 'active' && (
                  <button onClick={endDemoCall} style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    📴 End Call
                  </button>
                )}
                {callStatus === 'connecting' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>connecting...</span>
                )}
              </div>
            </div>

            {/* Live Transcript (call চলাকালীন দেখায়) */}
            {(callStatus === 'active' || callStatus === 'ended') && liveTranscript.length > 0 && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Live Transcript</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {liveTranscript.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: msg.speaker === 'Clara' ? '#818cf8' : '#10b981', minWidth: '40px', paddingTop: '2px' }}>{msg.speaker}:</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Total Calls Handled</span>
                  <div className="stat-icon-wrapper"><Icons.Calls /></div>
                </div>
                <div className="stat-value">{stats.totalCalls}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>↑ 12% increase this week</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Leads Extracted (n8n)</span>
                  <div className="stat-icon-wrapper"><Icons.Leads /></div>
                </div>
                <div className="stat-value">{stats.totalLeads}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>↑ 8% conversion growth</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Booking Conversion</span>
                  <div className="stat-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                </div>
                <div className="stat-value">{stats.conversionRate}%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg call duration: 1m 45s</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Missed Calls (Hangs)</span>
                  <div className="stat-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                </div>
                <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.missedCalls}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rate: 3.3% (Lower than average)</div>
              </div>
            </section>

            {/* Dashboard Analytics & Recent Logs Grid */}
            <div className="dashboard-grid">
              {/* Calls Chart */}
              <div className="panel">
                <div className="panel-header">
                  <h3 className="panel-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Weekly Call Analytics
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '2px' }}></span> Calls
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '2px' }}></span> Leads
                    </span>
                  </div>
                </div>
                
                {/* SVG Chart Simulator */}
                <div className="chart-container">
                  {stats.trendData.map((d, i) => (
                    <div key={i} className="chart-bar-wrapper">
                      <div 
                        className="chart-bar-calls" 
                        style={{ height: `${(d.calls / 100) * 160}px` }} 
                        title={`Calls: ${d.calls}`}
                      ></div>
                      <div 
                        className="chart-bar-leads" 
                        style={{ height: `${(d.leads / 100) * 160}px` }} 
                        title={`Leads: ${d.leads}`}
                      ></div>
                      <span className="chart-label">{d.date}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Total Calls: 454</span>
                  <span>Conversion rate: 28.8%</span>
                </div>
              </div>

              {/* Quick Call Activity */}
              <div className="panel">
                <div className="panel-header">
                  <h3 className="panel-title">Recent Inbound Calls</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => setActiveTab('calls')}>View All</span>
                </div>
                <div className="call-logs-list">
                  {callLogs.slice(0, 3).map((log) => (
                    <div 
                      key={log.id} 
                      className={`call-log-item ${selectedCall.id === log.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedCall(log); setActiveTab('calls'); }}
                    >
                      <div className="caller-info">
                        <span className="caller-name">{log.callerName}</span>
                        <span className="caller-phone">{log.callerPhone}</span>
                      </div>
                      <div className="call-meta">
                        <span className={getStatusBadge(log.status)}>{log.status}</span>
                        <span className="call-time">{log.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Call Logs View */}
        {activeTab === 'calls' && (
          <div className="dashboard-grid">
            {/* List Panel */}
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Call Logs</h3>
              </div>
              <div className="call-logs-list">
                {callLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`call-log-item ${selectedCall.id === log.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCall(log)}
                  >
                    <div className="caller-info">
                      <span className="caller-name">{log.callerName}</span>
                      <span className="caller-phone">{log.callerPhone}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{log.timestamp}</span>
                    </div>
                    <div className="call-meta">
                      <span className={getStatusBadge(log.status)}>{log.status}</span>
                      <span className="call-time">{log.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary and Transcript Viewer */}
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">AI Call Insights</h3>
                <span className="badge badge-primary">{selectedCall.callerPhone}</span>
              </div>
              
              <div className="details-container">
                <div className="summary-box">
                  <h4>n8n Post-Call AI Summary</h4>
                  <p>{selectedCall.summary}</p>
                </div>
                
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Conversation Transcript</h4>
                
                <div className="transcript-box">
                  {selectedCall.transcript.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`transcript-message ${msg.speaker.toLowerCase() === 'assistant' ? 'assistant' : 'caller'}`}
                    >
                      <span className="msg-label">{msg.speaker}</span>
                      <p className="msg-text">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Leads View */}
        {activeTab === 'leads' && (
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
              <h3 className="panel-title">Extracted Hot Leads</h3>
              <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => {
                alert("CSV list downloaded successfully!");
              }}>Export CSV List</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem 0.75rem' }}>Name</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Contact Info</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Requested Service</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Lead Health</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Last Call Contact</th>
                    <th style={{ padding: '1rem 0.75rem' }}>n8n Call Summary Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '1.2rem 0.75rem', fontWeight: '600' }}>{lead.name}</td>
                      <td style={{ padding: '1.2rem 0.75rem' }}>
                        <div>{lead.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{lead.email}</div>
                      </td>
                      <td style={{ padding: '1.2rem 0.75rem' }}>{lead.service}</td>
                      <td style={{ padding: '1.2rem 0.75rem' }}>
                        <span className={getLeadStatusBadge(lead.status)}>{lead.status}</span>
                      </td>
                      <td style={{ padding: '1.2rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{lead.lastContact}</td>
                      <td style={{ padding: '1.2rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{lead.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Knowledge Base (RAG) View */}
        {activeTab === 'kb' && user?.role === 'admin' && (
          <div className="kb-grid">
            {/* Upload Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="panel">
                <h3 className="panel-title" style={{ marginBottom: '1.2rem' }}>Upload Guidelines (PDF)</h3>
                <div className="upload-area" onClick={handleFileUploadMock}>
                  <Icons.Upload />
                  <p style={{ marginTop: '1rem', fontWeight: '600', fontSize: '0.95rem' }}>Drag & Drop PDF document here</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>or click to choose files from device</p>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
                  *Files are parsed, chunked, embedded via OpenAI, and sent to vector database.
                </div>
              </div>
              
              <div className="panel">
                <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Scrape Website URL</h3>
                <form onSubmit={handleAddUrl}>
                  <div className="form-group">
                    <label>Website Link</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="url" 
                        placeholder="https://clientbusiness.com/faqs" 
                        className="form-control"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn" style={{ padding: '0.8rem 1.2rem' }}>Scrape</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Document Index List */}
            <div className="panel">
              <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>Synced Knowledge Index</h3>
              
              <div className="file-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="file-item">
                    <div>
                      <span className="file-name">{doc.name}</span>
                      <div className="file-meta">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Added: {doc.dateAdded}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                        {doc.chunksCount > 0 ? `${doc.chunksCount} vectors` : ''}
                      </span>
                      <span className={`badge ${doc.status === 'Synced' ? 'badge-success' : 'badge-warning'}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Settings View */}
        {activeTab === 'settings' && user?.role !== 'staff' && (
          <div className="dashboard-grid">
            {/* Settings Form */}
            <div className="panel">
              <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>Receptionist Agent Profiles</h3>
              
              <div className="form-group">
                <label>Business Name</label>
                <input 
                  type="text" 
                  name="businessName"
                  className="form-control" 
                  value={settings.businessName}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label>Business Operations & Hours</label>
                <input 
                  type="text" 
                  name="businessHours"
                  className="form-control" 
                  value={settings.businessHours}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label>Calendly / Booking Link</label>
                <input 
                  type="url" 
                  name="bookingLink"
                  className="form-control" 
                  value={settings.bookingLink}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label>AI Agent System instructions (Prompt)</label>
                <textarea 
                  name="systemPrompt"
                  className="form-control" 
                  value={settings.systemPrompt}
                  onChange={handleSettingsChange}
                  disabled={user?.role === 'client'}
                  style={{ opacity: user?.role === 'client' ? 0.7 : 1 }}
                ></textarea>
              </div>

              <div className="form-group">
                <label>OpenRouter LLM Model Gateway</label>
                <input 
                  type="text" 
                  name="openRouterModel"
                  className="form-control" 
                  value={settings.openRouterModel}
                  onChange={handleSettingsChange}
                  disabled={user?.role === 'client'}
                  style={{ opacity: user?.role === 'client' ? 0.7 : 1 }}
                />
              </div>
              
              <button 
                className="btn" 
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>

            {/* Quick API Config guide */}
            <div className="panel">
              <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>Integration Configuration</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.9rem' }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Twilio / VAPI Phone Number</h4>
                  <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ color: '#818cf8', fontWeight: 'bold' }}>{settings.vapiPhoneNumber}</code>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => alert("Copied!")}>Copy</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>OpenRouter LLM Integration</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    To run the receptionist using OpenRouter backend, set the API Base URL inside Vapi.ai assistant details to:
                  </p>
                  <code style={{ display: 'block', padding: '0.8rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--card-border)', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    https://openrouter.ai/api/v1
                  </code>
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ color: '#818cf8', fontWeight: '600', marginBottom: '0.5rem' }}>Self-Hosted n8n Endpoints</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                    Your self-hosted n8n is listening on the following webhooks:
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', listStyle: 'none' }}>
                    <li>🔴 <strong>Call End:</strong> https://n8n.yourdomain.com/webhook/call-end</li>
                    <li>🔵 <strong>Live Tools:</strong> https://n8n.yourdomain.com/webhook/live-tools</li>
                    <li>🟢 <strong>RAG Sync:</strong> https://n8n.yourdomain.com/webhook/rag-sync</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
