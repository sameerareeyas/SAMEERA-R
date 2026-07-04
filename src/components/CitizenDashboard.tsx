import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Complaint, UserProfile } from "../types";
import { getLocalComplaints, saveLocalComplaints } from "../lib/mockData";
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Play, 
  Square, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  Compass, 
  Plus, 
  Search, 
  ListFilter,
  Volume2,
  FileText,
  BadgeAlert,
  ChevronRight,
  Activity
} from "lucide-react";

interface CitizenDashboardProps {
  currentUser: any;
  userProfile: UserProfile;
  onLogout: () => void;
  quickAction: "raise" | "track" | null;
  onClearQuickAction: () => void;
}

// Preset assets for easy testing of AI routing
const IMAGE_PRESETS = [
  {
    name: "Road Pothole",
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80",
    description: "Deep pothole causing traffic issues on main intersection."
  },
  {
    name: "Garbage Pile",
    url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80",
    description: "Uncontrolled household garbage pile rotting near public park entrance."
  },
  {
    name: "Water Board Pipeline Leak",
    url: "https://images.unsplash.com/photo-1542013936693-8848e5740a7a?auto=format&fit=crop&w=400&q=80",
    description: "Main water pipe burst spraying gallons of water and creating a swamp."
  },
  {
    name: "Malfunctioning Street Lights",
    url: "https://images.unsplash.com/photo-1509021436665-8f37df706543?auto=format&fit=crop&w=400&q=80",
    description: "Broken electrical luminaire making the sector extremely dark at night."
  }
];

// Preset locations in Bangalore, India
const LOCATION_PRESETS = [
  { name: "Indira Nagar, Bengaluru", lat: 12.9718, lng: 77.6411 },
  { name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6244 },
  { name: "MG Road, Bengaluru", lat: 12.9733, lng: 77.6117 },
  { name: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7499 },
  { name: "Jayanagar, Bengaluru", lat: 12.9307, lng: 77.5832 }
];

export default function CitizenDashboard({ 
  currentUser, 
  userProfile, 
  onLogout, 
  quickAction, 
  onClearQuickAction 
}: CitizenDashboardProps) {
  
  // Tab Views
  const [activeTab, setActiveTab] = useState<"overview" | "raise">("overview");

  // Inline Notification States
  const [formError, setFormError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // "Raise Complaint" Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [voiceUrl, setVoiceUrl] = useState("");
  const [latitude, setLatitude] = useState(12.9718); // Default Bengaluru
  const [longitude, setLongitude] = useState(77.6411);
  const [locating, setLocating] = useState(false);
  const [locationName, setLocationName] = useState("MG Road, Bengaluru (Default)");

  // Recording State (Simulated)
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  // AI loading and outputs
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  // Trigger quick action routing on load
  useEffect(() => {
    if (quickAction === "raise") {
      setActiveTab("raise");
      onClearQuickAction();
    } else if (quickAction === "track") {
      setActiveTab("overview");
      onClearQuickAction();
    }
  }, [quickAction]);

  // Real-time synchronization of complaints for current user
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.uid.startsWith("mock-")) {
      const loadLocal = () => {
        const localList = getLocalComplaints();
        // In local mode, show complaints filed by this mock citizen
        const userList = localList.filter(c => c.citizenId === currentUser.uid);
        setComplaints(userList);
        
        if (selectedComplaint) {
          const updated = userList.find((c) => c.complaintId === selectedComplaint.complaintId);
          if (updated) setSelectedComplaint(updated);
        }
      };

      loadLocal();
      window.addEventListener("local_complaints_updated", loadLocal);
      return () => window.removeEventListener("local_complaints_updated", loadLocal);
    }

    const q = query(
      collection(db, "complaints"),
      where("citizenId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Complaint[] = [];
      snapshot.forEach((doc) => {
        list.push({ complaintId: doc.id, ...doc.data() } as Complaint);
      });
      setComplaints(list);
      
      // Keep selected complaint updated in real time if open
      if (selectedComplaint) {
        const updated = list.find((c) => c.complaintId === selectedComplaint.complaintId);
        if (updated) setSelectedComplaint(updated);
      }
    }, (error) => {
      console.error("Firestore loading error:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle Geolocation
  const detectLocation = () => {
    setLocating(true);
    setLocationWarning(null);
    if (!navigator.geolocation) {
      setLocationWarning("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationName(`GPS Coordinates (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        setLocating(false);
      },
      (error) => {
        console.warn("Geolocation permission error, using preset default", error);
        setLocationWarning("Could not automatically detect location. Please select one of the Bangalore ward presets below.");
        setLocating(false);
      }
    );
  };

  // Preset location handler
  const handleSelectLocationPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setLocationName(preset.name);
    setLocationWarning(null);
  };

  // Mock Voice Recording simulation
  useEffect(() => {
    let interval: any;
    if (recording) {
      interval = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setVoiceUrl("simulated_voice_memo_token_382.mp3");
    } else {
      setRecording(false);
      setRecording(true);
      setVoiceUrl("");
    }
  };

  // Handle Submit Complaint
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title || !description) {
      setFormError("Please provide a concise title and a detailed description of the grievance.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Send description and title to Gemini Server AI API
      console.log("Analyzing complaint with server-side Gemini API...");
      const aiResponse = await fetch("/api/analyze-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!aiResponse.ok) {
        throw new Error("Gemini routing services experienced a brief hiccup.");
      }

      const aiData = await aiResponse.json();
      console.log("AI Analysis Complete:", aiData);

      // Extract details or fallback
      const finalCategory = aiData.category || "Government Infrastructure Problems";
      const finalDepartment = aiData.department || "Public Works";
      const finalPriority = aiData.priority || "Medium";
      const finalSeverity = typeof aiData.severity === "number" ? aiData.severity : 50;
      const finalSuggestedAction = aiData.suggestedAction || "Review for administrative allocation.";
      const finalEnglishTranslation = aiData.englishTranslation || description;

      // 2. Save directly to Cloud Run Firestore or LocalStorage
      const docData: any = {
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        department: finalDepartment,
        priority: finalPriority,
        severity: finalSeverity,
        status: "Pending", // initial status
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=400&q=80", // generic city asset
        voiceUrl: voiceUrl || null,
        latitude,
        longitude,
        citizenId: currentUser.uid,
        citizenName: userProfile.name,
        suggestedAction: finalSuggestedAction,
        englishTranslation: finalEnglishTranslation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let complaintId = "";
      if (currentUser.uid.startsWith("mock-")) {
        complaintId = "local-comp-" + Math.random().toString(36).substr(2, 9);
        const newComplaint: Complaint = {
          complaintId,
          ...docData
        };
        const localList = getLocalComplaints();
        localList.unshift(newComplaint);
        saveLocalComplaints(localList);
        window.dispatchEvent(new Event("local_complaints_updated"));
        console.log("Incident successfully filed in Local Sandbox Database:", complaintId);
      } else {
        const docRef = await addDoc(collection(db, "complaints"), docData);
        complaintId = docRef.id;
        console.log("Incident successfully filed in Firestore: ", complaintId);
      }

      // Display AI analysis success modal/state
      setAiAnalysisResult({
        id: complaintId,
        ...docData
      });

      // Reset Form fields
      setTitle("");
      setDescription("");
      setImageUrl("");
      setVoiceUrl("");

    } catch (err: any) {
      console.error("Submission error:", err);
      setFormError("Error submitting issue: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Close AI modal and navigate to list
  const handleCloseAiModal = () => {
    setAiAnalysisResult(null);
    setActiveTab("overview");
  };

  // Local stats
  const totalSubmits = complaints.length;
  const pendingSubmits = complaints.filter(c => c.status === "Pending" || c.status === "Assigned" || c.status === "In Progress").length;
  const resolvedSubmits = complaints.filter(c => c.status === "Resolved" || c.status === "Completed").length;
  const highPrioritySubmits = complaints.filter(c => c.priority === "High" || c.priority === "Critical").length;

  // Filter list
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "pending") return matchesSearch && (c.status === "Pending" || c.status === "Assigned" || c.status === "In Progress");
    if (filterStatus === "resolved") return matchesSearch && (c.status === "Resolved" || c.status === "Completed");
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col select-none">
      
      {/* Top Banner */}
      <div className="bg-[#1a365d] text-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black">
              <div className="w-5.5 h-5.5 bg-[#1a365d] rounded-sm transform rotate-45 flex items-center justify-center">
                <span className="text-white text-[9px] transform -rotate-45 font-extrabold font-mono">AI</span>
              </div>
            </div>
            <div>
              <span className="font-black text-base uppercase tracking-tight">JanAI <span className="font-light opacity-85">Citizen</span></span>
              <p className="text-[9px] uppercase font-black text-slate-300 tracking-wider">SECURE AUDIT PORTAL — {userProfile.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-100">{userProfile.email}</p>
              <p className="text-[9px] text-[#2ebd85] font-black uppercase tracking-wider">WARD: {userProfile.address || "Bengaluru Town"}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-black/15 hover:bg-red-900/25 border border-white/10 hover:border-red-500/30 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full py-3 px-4 rounded-lg text-left text-xs font-black uppercase tracking-wider transition flex items-center space-x-2.5 cursor-pointer ${
                activeTab === "overview" 
                  ? "bg-[#1a365d] text-white" 
                  : "bg-[#f8f9fa] text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Grievance History</span>
            </button>
            <button
              onClick={() => setActiveTab("raise")}
              className={`w-full py-3 px-4 rounded-lg text-left text-xs font-black uppercase tracking-wider transition flex items-center space-x-2.5 cursor-pointer ${
                activeTab === "raise" 
                  ? "bg-[#1a365d] text-white" 
                  : "bg-[#f8f9fa] text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Raise Civic Issue</span>
            </button>
          </div>

          {/* Quick Profile Info */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Citizen Profile</span>
            </div>
            <div className="space-y-2 text-[11px] font-semibold text-slate-600">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Name</p>
                <p className="font-bold text-slate-800">{userProfile.name}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Mobile</p>
                <p className="font-bold text-slate-800">{userProfile.phone || "Not Configured"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Filing Ward</p>
                <p className="font-bold text-slate-800">{userProfile.address || "Bengaluru Town"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Tab 1: Grievance History */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Analytics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Total Reports</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{totalSubmits}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Active/Pending</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{pendingSubmits}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Resolved</p>
                  <p className="text-2xl font-black text-[#2ebd85] mt-1">{resolvedSubmits}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Urgent Cases</p>
                  <p className="text-2xl font-black text-rose-700 mt-1">{highPrioritySubmits}</p>
                </div>
              </div>

              {/* Grid: Search, Filter & List + Details Viewer */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* List Container */}
                <div className="md:col-span-6 space-y-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-3">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search grievances..."
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-hidden focus:border-[#1a365d] transition font-black uppercase tracking-wider"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Active</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                      {filteredComplaints.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
                          <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-black text-slate-500 mt-2">No complaints matched.</p>
                          <button onClick={() => setActiveTab("raise")} className="mt-2 text-xs font-black text-[#1a365d] hover:underline uppercase tracking-wider cursor-pointer">
                            Raise a new complaint
                          </button>
                        </div>
                      ) : (
                        filteredComplaints.map((c) => {
                          const isSelected = selectedComplaint?.complaintId === c.complaintId;
                          return (
                            <div
                              key={c.complaintId}
                              onClick={() => setSelectedComplaint(c)}
                              className={`p-3.5 rounded-lg border cursor-pointer text-left transition ${
                                isSelected 
                                  ? "bg-slate-50 border-[#1a365d] ring-1 ring-[#1a365d]/40" 
                                  : "bg-white hover:bg-slate-50/75 border-slate-200"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase">
                                  #{c.complaintId.slice(-6)}
                                </span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  c.status === "Completed" || c.status === "Resolved"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : c.status === "In Progress"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {c.status}
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-900 mt-1 line-clamp-1">{c.title}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{c.description}</p>
                              
                              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                                <span>{c.category}</span>
                                <span className={`px-1.5 py-0.5 rounded ${
                                  c.priority === "Critical" ? "text-red-700 bg-red-50" : c.priority === "High" ? "text-amber-700 bg-amber-50" : "text-slate-600 bg-slate-100"
                                }`}>{c.priority}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Viewer Column */}
                <div className="md:col-span-6">
                  {selectedComplaint ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs text-left space-y-5">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Grievance Audit Record</p>
                          <h3 className="text-xs font-black text-slate-900 mt-0.5 uppercase tracking-tight">{selectedComplaint.title}</h3>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                          selectedComplaint.status === "Completed" || selectedComplaint.status === "Resolved"
                            ? "bg-emerald-50 text-[#2ebd85] border border-emerald-200"
                            : "bg-blue-50 text-[#1a365d] border border-blue-200"
                        }`}>
                          {selectedComplaint.status}
                        </span>
                      </div>

                      {/* Complaint Metadata details */}
                      <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Responsible Department</p>
                          <p className="font-bold text-slate-800 mt-0.5">{selectedComplaint.department}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Priority / Risk Score</p>
                          <p className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                            <span className="text-rose-700">{selectedComplaint.priority}</span>
                            <span className="text-slate-300">|</span>
                            <span className="bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200 text-slate-600 font-bold">{selectedComplaint.severity}/100</span>
                          </p>
                        </div>
                      </div>

                      {/* Image Viewer */}
                      {selectedComplaint.imageUrl && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-40">
                          <img 
                            src={selectedComplaint.imageUrl} 
                            alt="Complaint attachment" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Description & Translation block */}
                      <div className="space-y-1.5 text-xs">
                        <p className="font-black text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Incident Narrative</span>
                        </p>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed max-h-28 overflow-y-auto font-semibold">
                          {selectedComplaint.description}
                        </p>
                        
                        {/* Translation display */}
                        {selectedComplaint.englishTranslation && selectedComplaint.englishTranslation !== selectedComplaint.description && (
                          <div className="mt-1 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[#1a365d]">
                            <p className="font-black uppercase tracking-wider text-[9px] text-slate-400 mb-0.5">English AI-Translation Summary</p>
                            <p className="italic font-semibold text-slate-600">"{selectedComplaint.englishTranslation}"</p>
                          </div>
                        )}
                      </div>

                      {/* AI Action recommendation */}
                      {selectedComplaint.suggestedAction && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center space-x-1 text-[#1a365d] font-black text-[9px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-slate-600 animate-pulse" />
                            <span>JanAI Recommended Action Blueprint</span>
                          </div>
                          <p className="text-slate-600 mt-1 text-[11px] leading-relaxed font-semibold">
                            {selectedComplaint.suggestedAction}
                          </p>
                        </div>
                      )}

                      {/* Tracker Timeline */}
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Official Audit Trail</p>
                        
                        <div className="space-y-3 pl-3 text-[11px]">
                          {[
                            { name: "Report Lodged", date: new Date(selectedComplaint.createdAt).toLocaleDateString(), desc: "Citizen filed geolocated incident on portal.", active: true },
                            { name: "AI Triage & Route", date: new Date(selectedComplaint.createdAt).toLocaleDateString(), desc: `Automatically classified to ${selectedComplaint.category} and routed to ${selectedComplaint.department}.`, active: true },
                            { name: "Officer Review", date: selectedComplaint.status !== "Pending" ? "Complete" : "Awaiting", desc: selectedComplaint.status !== "Pending" ? "Assigned officer reviewed severity tags." : "Pending review in department dispatch board.", active: selectedComplaint.status !== "Pending" },
                            { name: "Case Resolved", date: (selectedComplaint.status === "Resolved" || selectedComplaint.status === "Completed") ? "Complete" : "Awaiting", desc: selectedComplaint.officerNotes || "Awaiting municipal ground clearance.", active: (selectedComplaint.status === "Resolved" || selectedComplaint.status === "Completed") }
                          ].map((step, idx) => (
                            <div key={idx} className="relative pl-5 border-l border-slate-200 last:border-0 pb-1">
                              <span className={`absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border flex items-center justify-center ${
                                step.active ? "bg-[#1a365d] border-[#1a365d]" : "bg-slate-200 border-slate-300"
                              }`}>
                                {step.active && <CheckCircle2 className="w-2 h-2 text-white" />}
                              </span>
                              <div className="flex justify-between items-center">
                                <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{step.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{step.date}</p>
                              </div>
                              <p className="text-slate-500 text-[10px] mt-0.5 font-semibold">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-16 text-center h-full flex flex-col justify-center items-center">
                      <Compass className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wider">No Grievance Selected</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed font-semibold">
                        Click on any filed complaint from the history list to track real-time resolution timeline, view AI-suggested actions, and review assigned municipal heads.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Raise Complaint Form */}
          {activeTab === "raise" && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs text-left">
              
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-6">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Raise New Smart Grievance</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Gemini automatically routes your issue based on description syntax.</p>
                </div>
              </div>

              {formError && (
                <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start space-x-2">
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {aiAnalysisResult ? (
                /* Success AI triage confirmation card */
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center space-y-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-black text-slate-950 uppercase tracking-tight">Grievance Filed & AI-Routed Successfully!</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto font-semibold">
                      Our Gemini cognitive layer analysed your report in real-time. The issue has been registered with the municipal department listed below.
                    </p>
                  </div>

                  {/* AI Metadata Results card */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Assigned Department</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{aiAnalysisResult.department}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Auto-Classified Category</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{aiAnalysisResult.category}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Priority Rating</p>
                      <p className="text-xs font-black text-rose-700 mt-0.5 uppercase tracking-wider">{aiAnalysisResult.priority}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Severity Risk Score</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{aiAnalysisResult.severity}/100</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-150">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Automated Action Dispatch</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 italic font-semibold">"{aiAnalysisResult.suggestedAction}"</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseAiModal}
                    className="px-6 py-2.5 bg-[#1a365d] hover:bg-[#11243f] text-white rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Go to Grievance Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitComplaint} className="space-y-6">
                  
                  {/* Field 1: Title */}
                  <div className="space-y-1 col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Complaint Brief Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Broken water mains leaking near Metro Gate"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                    />
                  </div>

                  {/* Field 2: Description */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Detailed Description</label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the civic grievance. Multilingual description (e.g. Hindi, Tamil, Telugu, etc.) is fully understood and classified by JanAI."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition leading-relaxed font-semibold"
                    ></textarea>
                  </div>

                  {/* Field 3: Image Upload & Preset */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Attach Image Evidence</label>
                      <span className="text-[9px] font-black text-[#1a365d] tracking-wider uppercase">SELECT TO PRE-POPULATE</span>
                    </div>

                    {/* Image Preset Selectors for Easy Testing */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {IMAGE_PRESETS.map((preset, idx) => {
                        const isSelected = imageUrl === preset.url;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setImageUrl(preset.url);
                              if (!title) setTitle(preset.name);
                              setDescription(preset.description);
                            }}
                            className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                              isSelected 
                                ? "bg-blue-50/50 border-[#1a365d] text-[#1a365d]" 
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            <div className="w-full h-12 rounded overflow-hidden border border-slate-250 mb-1">
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <p className="text-[9px] font-black leading-tight line-clamp-1 uppercase tracking-tight">{preset.name}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Direct Manual URL path */}
                    <div className="flex space-x-2 items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase">OR IMAGE URL</span>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste image link manually..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-700 outline-hidden focus:border-[#1a365d] focus:bg-white font-semibold"
                      />
                    </div>
                  </div>

                  {/* Field 4: Optional Voice Memo Recorder */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Add Voice Memo (Optional)</label>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={toggleRecording}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition cursor-pointer ${
                            recording 
                              ? "bg-red-600 animate-pulse" 
                              : voiceUrl 
                              ? "bg-emerald-600" 
                              : "bg-[#1a365d]"
                          }`}
                        >
                          {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <div>
                          <p className="text-xs font-black text-slate-850 uppercase tracking-tight">
                            {recording ? `Recording... 00:${recordTime < 10 ? "0" + recordTime : recordTime}` : voiceUrl ? "Voice memo attached successfully!" : "Click to record audio grievance description"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {recording ? "Pulsing audio capture matrix online..." : voiceUrl ? "Playable on Officer portal" : "Maximum length: 30 seconds"}
                          </p>
                        </div>
                      </div>

                      {voiceUrl && (
                        <div className="flex items-center space-x-1.5 bg-emerald-50 px-3 py-1 rounded border border-emerald-100 text-[9px] text-emerald-800 font-black">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>0:08 SEC</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Field 5: Location Detection & Presets */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Geographical Coordinates Pin</label>
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={locating}
                        className="text-[10px] font-black text-[#1a365d] hover:text-[#11243f] flex items-center space-x-1 uppercase tracking-wider cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{locating ? "Locking GPS Satellite..." : "Lock GPS Location"}</span>
                      </button>
                    </div>

                    {locationWarning && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg font-semibold">
                        {locationWarning}
                      </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-200">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Active Location Pin: <span className="text-[#1a365d]">{locationName}</span></p>
                      
                      {/* Location presets for simulation */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-[9px]">
                        {LOCATION_PRESETS.map((preset, idx) => {
                          const isSelected = locationName === preset.name;
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => handleSelectLocationPreset(preset)}
                              className={`py-1.5 px-2 rounded-lg border transition font-black uppercase tracking-wider truncate cursor-pointer ${
                                isSelected 
                                  ? "bg-[#1a365d] text-white border-[#1a365d]" 
                                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {preset.name.split(",")[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#1a365d] hover:bg-[#11243f] text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                        <span>JanAI Engine Analyzing & Routing Report...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <span>Submit Grievance to JanAI</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
