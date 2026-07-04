import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  FileText, 
  PhoneCall, 
  Search,
  Activity
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (view: "landing" | "auth" | "citizen" | "officer" | "admin") => void;
  onSetQuickAction: (action: "raise" | "track" | null) => void;
  currentUser: any;
  userProfile: any;
}

export default function LandingPage({ onNavigate, onSetQuickAction, currentUser, userProfile }: LandingPageProps) {
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleRaiseComplaint = () => {
    onSetQuickAction("raise");
    if (currentUser) {
      onNavigate(userProfile?.role === "citizen" ? "citizen" : userProfile?.role === "officer" ? "officer" : "admin");
    } else {
      onNavigate("auth");
    }
  };

  const handleTrackComplaint = () => {
    onSetQuickAction("track");
    if (currentUser) {
      onNavigate(userProfile?.role === "citizen" ? "citizen" : userProfile?.role === "officer" ? "officer" : "admin");
    } else {
      onNavigate("auth");
    }
  };

  const handleDashboardClick = () => {
    if (currentUser) {
      onNavigate(userProfile?.role === "citizen" ? "citizen" : userProfile?.role === "officer" ? "officer" : "admin");
    } else {
      onNavigate("auth");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Government Banner */}
      <div className="bg-slate-900 text-[11px] text-slate-300 font-medium py-1.5 px-4 sm:px-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Digital India Smart Governance Initiative</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>National Complaints Portal</span>
          <span>|</span>
          <span>Language: English (In-built AI Translator active)</span>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#1a365d] text-white border-b border-[#152c4d] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-[#1a365d] rounded-sm transform rotate-45 flex items-center justify-center">
                <span className="text-white text-[10px] transform -rotate-45 font-extrabold font-mono">AI</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none text-white">JanAI</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest leading-none mt-0.5 font-bold">Governance Command Center</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-blue-200">
            <a href="#home" className="hover:text-white border-b-2 border-transparent hover:border-emerald-400 py-4 transition">Home</a>
            <a href="#about" className="hover:text-white border-b-2 border-transparent hover:border-emerald-400 py-4 transition">About</a>
            <a href="#services" className="hover:text-white border-b-2 border-transparent hover:border-emerald-400 py-4 transition">Services</a>
            <a href="#departments" className="hover:text-white border-b-2 border-transparent hover:border-emerald-400 py-4 transition">Departments</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDashboardClick}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-400/30 hover:bg-[#152c4d] text-white transition flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-300" />
              <span>{currentUser ? "Dashboard" : "Sign In"}</span>
            </button>
            <button
              onClick={handleRaiseComplaint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-wider transition shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Raise Issue</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-[#f8f9fa] pt-16 pb-24 overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin-slow" />
              <span className="text-[10px] font-black text-[#1a365d] uppercase tracking-wider">Powered by Google Gemini 3.5</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black text-[#1a365d] tracking-tighter leading-none">
                AI-Powered Governance for <span className="text-emerald-500">Every Citizen</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-650 leading-relaxed max-w-xl font-medium">
                JanAI bridges the gap between citizens and municipal administrations. File complaints with voice or images, and let our intelligent routing automatically classify, prioritize, and assign them to the right officers instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleRaiseComplaint}
                className="px-8 py-4 bg-[#1a365d] hover:bg-[#132847] text-white rounded-lg font-black uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 text-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Raise Complaint Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={handleTrackComplaint}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-black uppercase tracking-wider shadow-2xs hover:shadow-sm transition flex items-center justify-center space-x-2 text-sm"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Track Complaint</span>
              </button>
            </div>

            {/* Micro Stats */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-200 max-w-lg">
              <div>
                <p className="text-3.5xl font-black text-[#1a365d] tracking-tighter">1.2s</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">AI Routing Time</p>
              </div>
              <div>
                <p className="text-3.5xl font-black text-emerald-500 tracking-tighter">98.4%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Department Match</p>
              </div>
              <div>
                <p className="text-3.5xl font-black text-[#1a365d] tracking-tighter">24/7</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Active Monitoring</p>
              </div>
            </div>
          </div>

          {/* Hero Right: Visualization Widget */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-xl"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Live Incident Feed</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  REAL-TIME SYNCHRONIZED
                </span>
              </div>

              {/* Mock Complaint Item 1 - Designed with Geometric Balance Left Border */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border-l-4 border-red-500 border border-slate-250 hover:bg-slate-100/50 transition">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Incident #20412
                  </span>
                  <span className="text-[9px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded uppercase">
                    HIGH PRIORITY
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1a365d]">Drainage Overflow & Water Logging</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">Main drainage line blocked causing severe sewer backup on MG Road. Pedestrians unable to cross.</p>
                </div>
                
                {/* AI Analysis Tag overlay */}
                <div className="bg-[#1a365d] text-white rounded-lg p-3 flex justify-between items-center text-xs shadow-sm border border-blue-400/30">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <div>
                      <p className="font-bold text-[11px]">JanAI Auto-Route</p>
                      <p className="text-[9px] text-blue-200 opacity-90">Routed to Corporation (Water & Sewerage)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[10px] uppercase text-emerald-400">ASSIGNED</span>
                  </div>
                </div>
              </div>

              {/* Mini Tracker timeline */}
              <div className="space-y-2">
                <p className="text-xs font-black text-[#1a365d] uppercase tracking-wide">Complaint Resolution Pipeline</p>
                <div className="grid grid-cols-4 gap-1.5 text-[9px] text-center font-bold text-slate-400 uppercase">
                  <div className="bg-blue-50 text-blue-700 border border-blue-200 py-1.5 rounded">Citizen</div>
                  <div className="bg-emerald-100 text-emerald-700 border border-emerald-300 py-1.5 rounded animate-pulse">AI Auto</div>
                  <div className="bg-slate-100 py-1.5 rounded text-slate-650">Officer</div>
                  <div className="bg-slate-100 py-1.5 rounded text-slate-650">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest">ABOUT THE PORTAL</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-[#1a365d] tracking-tighter">
              Transforming Civic Redressal with Advanced Intelligence
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              JanAI is a modern web application built on robust, decentralized database schemas and state-of-the-art Generative AI. It eliminates human routing delays, categorizes multi-lingual complaints, and provides absolute transparency to Indian communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-xs space-y-4 text-left">
              <div className="w-12 h-12 bg-blue-50 text-[#1a365d] rounded-lg border border-blue-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-[#1a365d]">Gemini-Powered Classification</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                No more manual sorting. Google Gemini reads the user description, extracts the core grievance, determines the responsible department, and predicts priority on submission.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-xs space-y-4 text-left">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-[#1a365d]">Automatic Location Capture</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Using standard browser geolocation APIs, we pin the exact coordinate of the reported issue. Government officers can open the incident map directly on their tablets to head to the location.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-xs space-y-4 text-left">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-[#1a365d]">Role-Based Accountability</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Dedicated dashboards separate the administrative responsibilities of Citizens, Officers, and Admins. Real-time logging tracks updates at every milestone of the resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="py-24 bg-[#f8f9fa] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="space-y-3 text-left">
              <h2 className="text-xs font-black text-[#1a365d] uppercase tracking-widest">REPORTABLE ISSUES</h2>
              <h3 className="text-3xl font-black text-[#1a365d] tracking-tighter">Civic Categories Supported</h3>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Select from a variety of civic issues. JanAI automates classification across all major municipal areas.
              </p>
            </div>
            <button
              onClick={handleRaiseComplaint}
              className="mt-4 md:mt-0 px-5 py-3 bg-white border border-slate-200 hover:border-[#1a365d] text-slate-700 hover:text-[#1a365d] font-black uppercase tracking-wider rounded-lg text-xs transition flex items-center space-x-2"
            >
              <span>View Interactive Reporting Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Road Damage", desc: "Potholes, broken asphalt, damaged pavements, and blockages.", icon: AlertTriangle, color: "text-amber-700 bg-amber-50 border border-amber-100" },
              { title: "Garbage Overflow", desc: "Overflowing municipal dustbins and trash pile-ups.", icon: Trash2, color: "text-emerald-700 bg-emerald-50 border border-emerald-100" },
              { title: "Water Leakage", desc: "Burst drinking water pipelines, sewage mixing, and low pressure.", icon: Droplets, color: "text-blue-700 bg-blue-50 border border-blue-100" },
              { title: "Broken Street Lights", desc: "Malfunctioning street lamps causing dark and unsafe sectors.", icon: Lightbulb, color: "text-indigo-700 bg-indigo-50 border border-indigo-100" },
              { title: "Drainage Problems", desc: "Clogged drains, open manholes, and waste-water stagnation.", icon: ShieldCheck, color: "text-purple-700 bg-purple-50 border border-purple-100" },
              { title: "Public Health Issues", desc: "Stagnant mosquito-breeding pools, sanitation failures.", icon: Users, color: "text-teal-700 bg-teal-50 border border-teal-100" },
              { title: "Traffic Issues", desc: "Defective traffic lights, illegal parking blocks, congestions.", icon: MapPin, color: "text-rose-700 bg-rose-50 border border-rose-100" },
              { title: "Flooding & Monsoon", desc: "Severe monsoon waterlogging requiring active motorized pumps.", icon: Sparkles, color: "text-sky-700 bg-sky-50 border border-sky-100" }
            ].map((service, idx) => {
              const IconComp = service.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between text-left">
                  <div className="space-y-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${service.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-[#1a365d] uppercase tracking-wide">{service.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{service.desc}</p>
                  </div>
                  <button 
                    onClick={handleRaiseComplaint}
                    className="mt-4 inline-flex items-center space-x-1 text-[10px] font-black uppercase tracking-wider text-[#1a365d] hover:text-emerald-500 group"
                  >
                    <span>Report this</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Smart Routing Visualizer */}
      <section id="departments" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visualizer Left */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="text-xs font-black text-[#1a365d] uppercase tracking-widest">SMART INFRASTRUCTURE</h2>
              <h3 className="text-3xl font-black text-[#1a365d] tracking-tighter leading-tight">
                Intelligent Department Routing Pipeline
              </h3>
              <p className="text-slate-505 text-sm leading-relaxed font-medium">
                Once a citizen hits submit, our backend API intercepts the request. The Gemini AI engine reads description semantics, identifies the department owner, and publishes it to the appropriate officer's portal. This completely bypasses traditional red tape.
              </p>

              <div className="space-y-3">
                {[
                  { label: "Road Damage", route: "Highways Department" },
                  { label: "Garbage Overflow", route: "Municipal Corporation" },
                  { label: "Water Leakage", route: "Water & Sewerage Board" },
                  { label: "Broken Street Lights", route: "Electricity Department" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-800 uppercase tracking-wide">{item.label}</span>
                    <div className="flex items-center space-x-1.5 text-emerald-600">
                      <span>→</span>
                      <span>{item.route}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualizer Right */}
            <div className="lg:col-span-7 bg-[#1a365d] text-white rounded-xl p-6 sm:p-8 border border-blue-900/40 shadow-xl space-y-6 text-left">
              <div className="flex justify-between items-center pb-4 border-b border-blue-900/40">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">ADMINISTRATIVE DEPARTMENTS</span>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded uppercase">
                  AUTO-MAPPED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Highways Department", lead: "Shri Rajesh Kumar", count: "12 active" },
                  { name: "Corporation Office", lead: "Smt. Priya Sharma", count: "24 active" },
                  { name: "Water Board (DJB/BWSSB)", lead: "Shri Amit Patel", count: "8 active" },
                  { name: "Electricity Board (TNEB/BESCOM)", lead: "Shri Sanjay Roy", count: "15 active" }
                ].map((dept, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-blue-950/40 border border-blue-900/40 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wide text-blue-200">{dept.name}</p>
                    <p className="text-xs text-slate-300">Head: {dept.lead}</p>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>{dept.count}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-950/20 p-4 rounded-lg border border-blue-900/30 text-xs text-blue-200 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <p className="font-medium text-[11px] leading-relaxed">
                  <strong>AI Note:</strong> Language classification also detects regional dialects like Hinglish or Tamil-English. Translation vectors automatically format a clean English draft for records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Contact Info */}
      <section id="contact" className="py-24 bg-[#f8f9fa] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Quick Helpline */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <h2 className="text-xs font-black text-[#1a365d] uppercase tracking-widest">CITIZEN CARE</h2>
              <h3 className="text-3xl font-black text-[#1a365d] tracking-tighter">National Helpline Desk</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Have questions or experiencing technical difficulties? Get in touch with our tech support or standard municipal desks.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <PhoneCall className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Toll-Free Helpline</p>
                    <p className="text-sm font-black text-[#1a365d]">1800-345-6789</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Grievance Cell Email</p>
                    <p className="text-sm font-black text-[#1a365d]">support@janai.gov.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs text-left">
              <h4 className="text-base font-black uppercase tracking-wider text-[#1a365d] mb-6">Leave Feedback / General Query</h4>
              
              {feedbackSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 space-y-3">
                  <div className="flex items-center space-x-2.5 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h5 className="font-black uppercase tracking-wider text-xs">Feedback Received Successfully</h5>
                  </div>
                  <p className="text-xs text-emerald-700 font-medium">
                    Thank you for sharing your feedback. Your inputs have been recorded and sent to the smart governance platform developers.
                  </p>
                  <button 
                    onClick={() => setFeedbackSuccess(false)}
                    className="text-xs text-[#1a365d] font-black uppercase tracking-wider underline hover:text-[#11243f]"
                  >
                    Send Another message
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Your Full Name</label>
                      <input type="text" placeholder="Sameer Areeyas" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] transition font-semibold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Mobile Number</label>
                      <input type="text" placeholder="+91 98765 43210" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] transition font-semibold" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Message</label>
                      <textarea rows={3} placeholder="Provide your feedback..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] transition font-semibold"></textarea>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFeedbackSuccess(true)}
                    className="mt-6 px-6 py-3 bg-[#1a365d] hover:bg-[#11243f] text-white rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center space-x-2"
                  >
                    <span>Submit Feedback</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-700 to-emerald-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">JanAI Portal</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              India's smart civic complaint platform utilizing state-of-the-art Generative Artificial Intelligence to speed up municipal grievance redressing.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase mb-4 tracking-wider">Citizen Services</h5>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={handleRaiseComplaint} className="hover:text-white transition">Raise New Complaint</button></li>
              <li><button onClick={handleTrackComplaint} className="hover:text-white transition">Track Public Incident</button></li>
              <li><button onClick={handleDashboardClick} className="hover:text-white transition">Citizen Portal Access</button></li>
              <li><a href="#services" className="hover:text-white transition font-medium">Supported Categories</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase mb-4 tracking-wider">Municipal Admins</h5>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={handleDashboardClick} className="hover:text-white transition">Officer Dashboard Login</button></li>
              <li><button onClick={handleDashboardClick} className="hover:text-white transition">Administrator Command Center</button></li>
              <li><a href="#departments" className="hover:text-white transition font-medium">Departmental List</a></li>
              <li><a href="#about" className="hover:text-white transition font-medium">AI Classification Specs</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider">Government Seal</h5>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Approved by municipal bodies for ward-level grievance filing. Real-time logging backed by secure Google Cloud Firestore structures.
            </p>
            <div className="flex items-center space-x-2 text-slate-500 text-[10px] pt-1">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>National Data Standards Compliant</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <span>© {new Date().getFullYear()} JanAI Smart Governance Portal. Digital India Initiative. All Rights Reserved.</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">Terms of Use</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">Grievance SLA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Inline custom icon components to keep imports clean
function Trash2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function Droplets(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 16.3c2.2 0 4-1.8 4-4s-4-7-4-7-4 4.8-4 7 1.8 4 4 4Z" />
      <path d="M17 18.5c1.37 0 2.5-1.13 2.5-2.5s-2.5-4.5-2.5-4.5-2.5 3.13-2.5 4.5 1.13 2.5 2.5 2.5Z" />
    </svg>
  );
}

function Lightbulb(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 7.1 5.8a6 6 0 0 0-.1 2.2c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6M10 22h4" />
    </svg>
  );
}
