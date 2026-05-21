// Mock Database for AI Voice Assistant SaaS Dashboard

export const mockStats = {
  totalCalls: 1248,
  totalLeads: 312,
  conversionRate: 25, // 25% of calls convert to leads/bookings
  missedCalls: 42,
  trendData: [
    { date: 'May 14', calls: 42, leads: 9 },
    { date: 'May 15', calls: 58, leads: 15 },
    { date: 'May 16', calls: 35, leads: 8 },
    { date: 'May 17', calls: 62, leads: 18 },
    { date: 'May 18', calls: 78, leads: 22 },
    { date: 'May 19', calls: 85, leads: 28 },
    { date: 'May 20', calls: 94, leads: 31 },
  ]
};

export const mockCallLogs = [
  {
    id: "call-001",
    callerName: "Robert Miller",
    callerPhone: "+1 (555) 234-5678",
    timestamp: "May 20, 2026, 4:12 PM",
    duration: "2m 14s",
    status: "Booking Made",
    summary: "Caller requested an emergency appointment for a severe toothache. The AI assistant successfully verified insurance (Delta Dental) and sent the scheduling link via SMS.",
    transcript: [
      { speaker: "Assistant", text: "Hello! Thank you for calling Radiant Dental. This is Clara, your virtual assistant. How can I help you today?" },
      { speaker: "Caller", text: "Hi Clara, I have a really bad toothache on my lower left side. It started yesterday and is throbbing. Do you have any emergency openings today or tomorrow?" },
      { speaker: "Assistant", text: "I'm so sorry to hear you're in pain, Robert. Yes, we prioritize emergencies. Let me check. We have an opening tomorrow morning at 9:00 AM or tomorrow afternoon at 2:30 PM. Would either of those work?" },
      { speaker: "Caller", text: "Tomorrow at 9:00 AM works perfectly. Do you accept Delta Dental insurance?" },
      { speaker: "Assistant", text: "Yes, we accept Delta Dental PPO. I have reserved the 9:00 AM slot for you under your phone number. I am sending you a text message right now with the booking confirmation and a link to fill out your intake forms. Please check your phone." },
      { speaker: "Caller", text: "Awesome, I just got the text. Thank you so much, Clara!" },
      { speaker: "Assistant", text: "You are very welcome! Rest up, and we'll see you tomorrow at 9:00 AM. Goodbye!" }
    ]
  },
  {
    id: "call-002",
    callerName: "Sarah Connor",
    callerPhone: "+1 (555) 876-5432",
    timestamp: "May 20, 2026, 2:45 PM",
    duration: "1m 32s",
    status: "Lead Generated",
    summary: "Caller inquired about pricing for dental implants and cosmetic veneers. The AI assistant provided estimated pricing and sent our services brochure to her phone.",
    transcript: [
      { speaker: "Assistant", text: "Hello! Thank you for calling Radiant Dental. This is Clara, your virtual assistant. How can I help you today?" },
      { speaker: "Caller", text: "Hi, I wanted to know how much dental implants usually cost at your clinic, and if you offer financing?" },
      { speaker: "Assistant", text: "Of course! Dental implants typically range from $3,000 to $4,500 per tooth, depending on the complexity. We also offer 0% financing through CareCredit. Would you like me to send you our brochure and a link to pre-qualify for financing?" },
      { speaker: "Caller", text: "Yes, that would be great. Send it to this number." },
      { speaker: "Assistant", text: "Perfect, I have sent a text message to your phone with the brochure link and the CareCredit details. Would you also like to schedule a free cosmetic consultation?" },
      { speaker: "Caller", text: "Not right now, I want to look over the details first. Thanks." },
      { speaker: "Assistant", text: "No problem at all! Feel free to call back when you're ready. Have a wonderful day!" }
    ]
  },
  {
    id: "call-003",
    callerName: "Unknown Caller",
    callerPhone: "+1 (555) 432-1098",
    timestamp: "May 20, 2026, 11:15 AM",
    duration: "0m 45s",
    status: "Missed Call",
    summary: "Caller asked for Dr. Howard directly. The AI assistant explained the doctor was in surgery and offered to book an appointment or take a message, but the caller hung up.",
    transcript: [
      { speaker: "Assistant", text: "Hello! Thank you for calling Radiant Dental. This is Clara, your virtual assistant. How can I help you today?" },
      { speaker: "Caller", text: "Yeah, is Dr. Howard there? I need to speak with him." },
      { speaker: "Assistant", text: "Dr. Howard is currently with a patient and unavailable to take calls. I can take a message for him, or help you schedule a time to speak. How would you like to proceed?" },
      { speaker: "Caller", text: "Nah, I'll just try back later. Thanks." }
    ]
  },
  {
    id: "call-004",
    callerName: "David Kim",
    callerPhone: "+1 (555) 901-2345",
    timestamp: "May 19, 2026, 3:30 PM",
    duration: "3m 05s",
    status: "Booking Made",
    summary: "Caller inquired about dental cleaning and checkup availability. Booked routine cleaning for next Tuesday at 11:00 AM. Verified insurance details (Cigna PPO).",
    transcript: [
      { speaker: "Assistant", text: "Hello! Thank you for calling Radiant Dental. This is Clara, your virtual assistant. How can I help you today?" },
      { speaker: "Caller", text: "Hi, I need to schedule a regular cleaning and checkup. I haven't been in for about a year." },
      { speaker: "Assistant", text: "We'd love to have you back! We have openings next Tuesday, May 26th, at 11:00 AM or 1:00 PM. Do either of those work?" },
      { speaker: "Caller", text: "Tuesday at 11:00 AM is good. I have Cigna insurance, is that in-network?" },
      { speaker: "Assistant", text: "Yes, we are in-network with Cigna PPO! I've booked you for Tuesday at 11:00 AM. I am sending you a text message with the confirmation and our new patient forms. Please fill them out prior to your visit." },
      { speaker: "Caller", text: "Perfect, thank you!" }
    ]
  }
];

export const mockLeads = [
  {
    id: "lead-01",
    name: "Robert Miller",
    phone: "+1 (555) 234-5678",
    email: "robert.miller@example.com",
    service: "Emergency Dentistry",
    status: "Hot",
    lastContact: "May 20, 2026, 4:12 PM",
    notes: "Severe throbbing toothache. Appt booked for May 21st, 9:00 AM."
  },
  {
    id: "lead-02",
    name: "Sarah Connor",
    phone: "+1 (555) 876-5432",
    email: "s.connor@example.com",
    service: "Dental Implants / Veneers",
    status: "Warm",
    lastContact: "May 20, 2026, 2:45 PM",
    notes: "Requested brochure and CareCredit financing link. Inquiring about cosmetic options."
  },
  {
    id: "lead-03",
    name: "David Kim",
    phone: "+1 (555) 901-2345",
    email: "dkim90@example.com",
    service: "Routine Cleaning",
    status: "Converted",
    lastContact: "May 19, 2026, 3:30 PM",
    notes: "Routine checkup and cleaning scheduled for May 26th, 11:00 AM."
  }
];

export const mockSettings = {
  businessName: "Radiant Dental Clinic",
  businessHours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM",
  bookingLink: "https://calendly.com/radiant-dental/appointment",
  botVoice: "Clara (US English - Warm)",
  systemPrompt: `You are Clara, a friendly and highly professional virtual receptionist for Radiant Dental Clinic. Your primary objectives are to answer FAQs accurately, capture leads (name, phone, email), and direct callers to the booking link if they want to schedule an appointment. Always maintain a polite, helpful, and empathetic tone. For emergencies, prioritize booking immediately.`,
  openRouterModel: "openai/gpt-4o-mini",
  vapiPhoneNumber: "+1 (888) 555-9087"
};

export const mockDocuments = [
  {
    id: "doc-1",
    name: "radiant_dental_faqs.pdf",
    type: "PDF Document",
    size: "142 KB",
    status: "Synced",
    dateAdded: "May 15, 2026",
    chunksCount: 24
  },
  {
    id: "doc-2",
    name: "implants_pricing_sheet.pdf",
    type: "PDF Document",
    size: "88 KB",
    status: "Synced",
    dateAdded: "May 18, 2026",
    chunksCount: 12
  },
  {
    id: "doc-3",
    name: "https://radiantdentalhouston.com",
    type: "Website URL",
    size: "8 Pages Scraped",
    status: "Synced",
    dateAdded: "May 19, 2026",
    chunksCount: 45
  }
];
