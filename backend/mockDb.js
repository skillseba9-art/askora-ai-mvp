// Backend in-memory database for demo/fallback purposes

let stats = {
  totalCalls: 142,
  totalLeads: 41,
  conversionRate: 28.8,
  missedCalls: 5,
  trendData: [
    { date: "Mon", calls: 18, leads: 4 },
    { date: "Tue", calls: 24, leads: 7 },
    { date: "Wed", calls: 32, leads: 9 },
    { date: "Thu", calls: 28, leads: 8 },
    { date: "Fri", calls: 22, leads: 6 },
    { date: "Sat", calls: 10, leads: 4 },
    { date: "Sun", calls: 8, leads: 3 }
  ]
};

let callLogs = [
  {
    id: "call-1",
    callerName: "Sarah Jenkins",
    callerPhone: "+1 (555) 234-5678",
    duration: "2m 15s",
    status: "Booking Made",
    timestamp: "10 minutes ago",
    summary: "Caller wanted to book an appointment for dental cleaning. AI confirmed booking for Friday at 3:00 PM and sent confirmation SMS via Twilio.",
    transcript: [
      { speaker: "Assistant", text: "Hello! Welcome to Radiant Dental Clinic. I am Ora, your AI receptionist. How can I help you today?" },
      { speaker: "Caller", text: "Hi, I'd like to book an appointment for dental cleaning, please." },
      { speaker: "Assistant", text: "I can help with that! Do you have a preferred day or time this week?" },
      { speaker: "Caller", text: "Is Friday afternoon available? Maybe around three?" },
      { speaker: "Assistant", text: "Yes! We have Friday at 3:00 PM open. May I get your name and phone number to secure the slot?" },
      { speaker: "Caller", text: "Sure, my name is Sarah Jenkins and my number is +1 (555) 234-5678." },
      { speaker: "Assistant", text: "Got it, Sarah. I have successfully scheduled you for a dental cleaning on Friday, May 22nd at 3:00 PM. A confirmation text message has been sent to your phone. We look forward to seeing you!" }
    ]
  },
  {
    id: "call-2",
    callerName: "David Chen",
    callerPhone: "+1 (555) 876-5432",
    duration: "1m 30s",
    status: "Lead Generated",
    timestamp: "1 hour ago",
    summary: "Caller asked about Invisalign pricing and dental insurance coverage. AI provided general pricing ($3,500 - $8,000) and noted we accept Delta Dental. Captured lead details.",
    transcript: [
      { speaker: "Assistant", text: "Hello! Welcome to Radiant Dental Clinic. I am Ora, how may I assist you today?" },
      { speaker: "Caller", text: "Hi, how much does Invisalign cost at your clinic? And do you take insurance?" },
      { speaker: "Assistant", text: "Invisalign treatment typically ranges from $3,500 to $8,000 depending on complexity. We also accept Delta Dental and most major PPO insurances. Would you like to schedule a free consult?" },
      { speaker: "Caller", text: "I'll need to check my budget first, but you can send me the details." }
    ]
  },
  {
    id: "call-3",
    callerName: "Unknown Caller",
    callerPhone: "+1 (555) 901-2345",
    duration: "0m 12s",
    status: "Missed Call",
    timestamp: "4 hours ago",
    summary: "Caller hung up immediately after assistant introduction. No lead info captured.",
    transcript: [
      { speaker: "Assistant", text: "Hello! Welcome to Radiant Dental Clinic. I am Ora, your virtual receptionist. How..." },
      { speaker: "Caller", text: "[Hang up]" }
    ]
  }
];

let leads = [
  {
    id: "lead-1",
    name: "Sarah Jenkins",
    phone: "+1 (555) 234-5678",
    email: "sarah.j@example.com",
    service: "Dental Cleaning",
    status: "Converted",
    lastContact: "10 mins ago",
    notes: "Appointment booked for Friday 3:00 PM. Booking confirmation SMS dispatched."
  },
  {
    id: "lead-2",
    name: "David Chen",
    phone: "+1 (555) 876-5432",
    email: "dchen@example.com",
    service: "Invisalign Consult",
    status: "Hot",
    lastContact: "1 hour ago",
    notes: "Inquired about Invisalign costs and insurance. Sent pricing pamphlet via SMS link."
  }
];

let settings = {
  businessName: "Radiant Dental Clinic",
  businessHours: "Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM",
  bookingLink: "https://calendly.com/radiant-dental/consult",
  systemPrompt: "You are Ora, a warm and professional virtual receptionist for Radiant Dental Clinic. Your goal is to answer patient questions about services, hours, pricing, and insurance, and guide them to schedule appointments using the booking link. Be concise and conversational. If a caller wants to book, collect their name and phone number and send them the booking link.",
  openRouterModel: "openai/gpt-4o-mini",
  botVoice: "en-US-Neural-F",
  vapiPhoneNumber: "+1 (234) 567-8900"
};

let documents = [
  {
    id: "doc-1",
    name: "radiant_dental_faqs.pdf",
    type: "PDF Document",
    size: "142 KB",
    status: "Synced",
    dateAdded: "Yesterday",
    chunksCount: 24
  },
  {
    id: "doc-2",
    name: "invisalign_info_sheet.pdf",
    type: "PDF Document",
    size: "95 KB",
    status: "Synced",
    dateAdded: "Yesterday",
    chunksCount: 16
  }
];

module.exports = {
  stats,
  callLogs,
  leads,
  settings,
  documents
};
