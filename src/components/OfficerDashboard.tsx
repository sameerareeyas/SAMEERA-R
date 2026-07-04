import React, { useState, useEffect } from "react";
import { 
  collection, 
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
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  Play, 
  FileText, 
  Compass, 
  Filter, 
  CheckSquare, 
  Clipboard, 
  Activity, 
  Volume2, 
  ChevronRight,
  TrendingUp,
  Inbox
} from "lucide-react";

interface OfficerDashboardProps {
  currentUser: any;
  userProfile: UserProfile;
  onLogout: () => void;
}

export default function OfficerDashboard({ currentUser, userProfile, onLogout }: OfficerDashboardProps) {
  
  // Department filter (initially the officer's department, but can be switched on-the-fly for demo inspection!)
  const [activeDept, setActiveDept] = useState(userProfile.departmentName || "Corporation");
  
  // Complaints List state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Local list filter toggles
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "Critical" | "High" | "Medium" | "Low">("all");

  // Officer inputs for active complaint
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Audio playback simulation state
  const [playingAudio, setPlayingAudio] = useState(false);
  const [actionError, setActionError] = useState("");

  // Sync complaints for the active department
  useEffect(() => {
    if (currentUser && currentUser.uid.startsWith("mock-")) {
      const loadLocal = () => {
        const localList = getLocalComplaints();
        const deptList = localList.filter(c => c.department === activeDept);
        setComplaints(deptList);

        // Keep details panel updated in real time
        if (selectedComplaint) {
          const updated = deptList.find(c => c.complaintId === selectedComplaint.complaintId);
          if (updated) setSelectedComplaint(updated);
        }
      };

      loadLocal();
      window.addEventListener("local_complaints_updated", loadLocal);
      return () => window.removeEventListener("local_complaints_updated", loadLocal);
    }

    const q = query(
      collection(db, "complaints"),
      where("department", "==", activeDept),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Complaint[] = [];
      snapshot.forEach((doc) => {
        list.push({ complaintId: doc.id, ...doc.data() } as Complaint);
      });
      setComplaints(list);

      // Keep details panel updated in real time
      if (selectedComplaint) {
        const updated = list.find(c => c.complaintId === selectedComplaint.complaintId);
        if (updated) setSelectedComplaint(updated);
      }
    }, (error) => {
      console.error("Error syncing officer complaints:", error);
    });

    return () => unsubscribe();
  }, [activeDept, currentUser]);

  // Load notes when selected complaint changes
  useEffect(() => {
    setActionError("");
    if (selectedComplaint) {
      setNotes(selectedComplaint.officerNotes || "");
    } else {
      setNotes("");
    }
  }, [selectedComplaint]);

  // Handle status update
  const handleUpdateStatus = async (newStatus: "Assigned" | "In Progress" | "Resolved" | "Completed") => {
    if (!selectedComplaint) return;
    setUpdating(true);
    setActionError("");

    try {
      if (currentUser && currentUser.uid.startsWith("mock-")) {
        const localList = getLocalComplaints();
        const updatedList = localList.map(c => {
          if (c.complaintId === selectedComplaint.complaintId) {
            return {
              ...c,
              status: newStatus,
              officerNotes: notes.trim(),
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        });
        saveLocalComplaints(updatedList);
        window.dispatchEvent(new Event("local_complaints_updated"));
        console.log(`Complaint ${selectedComplaint.complaintId} status updated locally to: ${newStatus}`);
      } else {
        const docRef = doc(db, "complaints", selectedComplaint.complaintId);
        await updateDoc(docRef, {
          status: newStatus,
          officerNotes: notes.trim(),
          updatedAt: new Date().toISOString()
        });
        console.log(`Complaint ${selectedComplaint.complaintId} status updated to: ${newStatus}`);
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      setActionError("Status update failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Metrics for current department
  const totalCases = complaints.length;
  const pendingCases = complaints.filter(c => c.status === "Pending").length;
  const progressCases = complaints.filter(c => c.status === "Assigned" || c.status === "In Progress").length;
  const closedCases = complaints.filter(c => c.status === "Resolved" || c.status === "Completed").length;
  const criticalCount = complaints.filter(c => (c.priority === "Critical" || c.priority === "High") && c.status !== "Completed").length;

  // Local List filtering logic
  const filteredComplaints = complaints.filter((c) => {
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = c.status !== "Completed" && c.status !== "Resolved";
    if (statusFilter === "resolved") matchesStatus = c.status === "Completed" || c.status === "Resolved";

    let matchesPriority = true;
    if (priorityFilter !== "all") matchesPriority = c.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col select-none">
      
      {/* Top Banner */}
      <div className="bg-[#1a365d] text-white shadow-xs border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Geometric Rotating Logo */}
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black transition-transform hover:scale-105 duration-300">
              <div className="w-5.5 h-5.5 bg-[#1a365d] rounded-sm transform rotate-45 flex items-center justify-center">
                <span className="text-white text-[9px] transform -rotate-45 font-black font-mono">AI</span>
              </div>
            </div>
            <div>
              <span className="font-black text-sm uppercase tracking-wider text-white">JanAI Officer Terminal</span>
              <p className="text-[9px] uppercase font-bold text-slate-300 tracking-wider">
                Jurisdiction: {activeDept} | Officer {userProfile.name.split(" ")[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Department Selector ONLY for Demo review */}
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded border border-white/20">
              <span className="text-[9px] text-slate-300 font-black uppercase tracking-wider">Triage Dept:</span>
              <select
                value={activeDept}
                onChange={(e) => {
                  setActiveDept(e.target.value);
                  setSelectedComplaint(null);
                }}
                className="bg-transparent text-xs text-white outline-hidden font-black cursor-pointer uppercase tracking-tight"
              >
                <option value="Corporation" className="bg-[#1a365d] text-white font-bold">Municipal Corporation</option>
                <option value="Highways Department" className="bg-[#1a365d] text-white font-bold">Highways Department</option>
                <option value="Water Board" className="bg-[#1a365d] text-white font-bold">Water Board</option>
                <option value="Electricity Department" className="bg-[#1a365d] text-white font-bold">Electricity Department</option>
                <option value="Traffic Police" className="bg-[#1a365d] text-white font-bold">Traffic Police</option>
                <option value="Health Department" className="bg-[#1a365d] text-white font-bold">Health Department</option>
                <option value="Public Works" className="bg-[#1a365d] text-white font-bold">Public Works</option>
              </select>
            </div>

            <button
              onClick={onLogout}
              className="p-2 bg-white/10 hover:bg-rose-950/40 border border-white/20 hover:border-rose-900 rounded-lg text-slate-100 hover:text-white transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Metric widgets for active department */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs text-left">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Routed Grievances</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalCases}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs text-left">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Unassigned / New</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingCases}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs text-left">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Active Progress</p>
            <p className="text-2xl font-black text-[#1a365d] mt-1">{progressCases}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs text-left">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Resolved / Closed</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{closedCases}</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg shadow-xs text-left col-span-2 md:col-span-1">
            <p className="text-rose-900 text-[9px] font-black uppercase tracking-wider">Critical Risk Pipeline</p>
            <p className="text-2xl font-black text-rose-700 mt-1">{criticalCount} urgent</p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: List with Filters */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            
            {/* Header / List filters */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">Department In-Tray</span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Filters</span>
              </div>
            </div>

            {/* Sub-Filters layout */}
            <div className="grid grid-cols-2 gap-2 text-[9px] font-black">
              <div>
                <label className="text-slate-400 uppercase tracking-wider block mb-1">Status Type</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-[#1a365d] font-semibold"
                >
                  <option value="all">All Files</option>
                  <option value="active">Active Only</option>
                  <option value="resolved">Resolved Only</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 uppercase tracking-wider block mb-1">Priority Rank</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-[#1a365d] font-semibold"
                >
                  <option value="all">All Ranks</option>
                  <option value="Critical">Critical Only</option>
                  <option value="High">High Only</option>
                  <option value="Medium">Medium Only</option>
                  <option value="Low">Low Only</option>
                </select>
              </div>
            </div>

            {/* List scrolling items */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider mt-3">In-Tray is currently empty</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto font-semibold">
                    Any new citizen submissions matching the "{activeDept}" classification vector will populate here automatically.
                  </p>
                </div>
              ) : (
                filteredComplaints.map((c) => {
                  const isSelected = selectedComplaint?.complaintId === c.complaintId;
                  const isCritical = c.priority === "Critical" || c.priority === "High";
                  return (
                    <div
                      key={c.complaintId}
                      onClick={() => setSelectedComplaint(c)}
                      className={`p-3.5 rounded-lg border cursor-pointer text-left transition ${
                        isSelected 
                          ? "bg-blue-50/40 border-[#1a365d] ring-1 ring-[#1a365d]" 
                          : isCritical && c.status === "Pending"
                          ? "bg-rose-50/30 border-rose-200 hover:bg-slate-50"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          #{c.complaintId.slice(-6)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                            c.priority === "Critical" ? "text-red-700 bg-red-50" : c.priority === "High" ? "text-amber-700 bg-amber-50" : "text-slate-600 bg-slate-100"
                          }`}>
                            {c.priority}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                            c.status === "Completed" || c.status === "Resolved"
                              ? "bg-emerald-50 text-[#2ebd85] border border-emerald-200"
                              : "bg-blue-50 text-[#1a365d] border border-blue-200"
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 mt-1.5 uppercase tracking-tight line-clamp-1">{c.title}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold line-clamp-2 mt-1 leading-relaxed">{c.description}</p>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 text-[9px] font-black uppercase text-slate-400 border-t border-slate-100">
                        <span className="text-slate-500">{c.category}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Active Complaint Action Area */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-xs text-left">
            {selectedComplaint ? (
              <div className="space-y-6">
                
                {/* Header detail */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Incident Registry #{selectedComplaint.complaintId.slice(-8)}</span>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight mt-0.5">{selectedComplaint.title}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5 tracking-wider">Filed by Citizen: {selectedComplaint.citizenName || "Ananya Iyer"}</p>
                  </div>
                  
                  {/* Severity level circular gauge */}
                  <div className="text-right flex items-center space-x-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center min-w-16">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Risk Score</p>
                      <p className="text-base font-black text-rose-700 mt-0.5">{selectedComplaint.severity}/100</p>
                    </div>
                  </div>
                </div>

                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
                    {actionError}
                  </div>
                )}

                {/* Grid attachment info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: description, voice playback, geolocation */}
                  <div className="space-y-4">
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Citizen Statement</p>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed max-h-36 overflow-y-auto font-semibold">
                        {selectedComplaint.description}
                      </p>
                    </div>

                    {/* Translation Draft if applicable */}
                    {selectedComplaint.englishTranslation && selectedComplaint.englishTranslation !== selectedComplaint.description && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[#1a365d] text-[11px]">
                        <p className="font-black uppercase tracking-wider text-[8px] text-slate-400 mb-0.5">AI Language translation summarize</p>
                        <p className="italic font-semibold text-slate-600">"{selectedComplaint.englishTranslation}"</p>
                      </div>
                    )}

                    {/* Geolocation visualizer coordinates */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4.5 h-4.5 text-[#1a365d]" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">GEOLOCATION LOCKED</p>
                          <p className="text-[11px] font-bold text-slate-800">
                            Lat: {selectedComplaint.latitude.toFixed(4)}, Lng: {selectedComplaint.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <span className="bg-blue-50 text-[#1a365d] text-[9px] font-black px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                        GPS LOCKED
                      </span>
                    </div>

                    {/* Voice Attachment */}
                    {selectedComplaint.voiceUrl && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Audio Evidence Memo</span>
                        </div>
                        <button
                          type="button"
                          disabled={playingAudio}
                          onClick={() => {
                            setPlayingAudio(true);
                            setTimeout(() => setPlayingAudio(false), 4000);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer ${
                            playingAudio 
                              ? "bg-red-600 text-white animate-pulse" 
                              : "bg-[#1a365d] text-white hover:bg-[#11243f]"
                          }`}
                        >
                          {playingAudio ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-ping mr-1"></span>
                              <span>PLAYING...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-white" />
                              <span>LISTEN 8s</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Right: Image Evidence Preview */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attached Evidence Photo</p>
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-44 relative">
                      {selectedComplaint.imageUrl ? (
                        <img 
                          src={selectedComplaint.imageUrl} 
                          alt="Incident attachment" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                          No photo provided.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Gemini AI recommendation card */}
                {selectedComplaint.suggestedAction && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-slate-600 animate-pulse" />
                      <span>Gemini AI Action Playbook</span>
                    </div>
                    <p className="text-slate-600 mt-1.5 text-[11px] leading-relaxed font-semibold">
                      "{selectedComplaint.suggestedAction}"
                    </p>
                  </div>
                )}

                {/* Action Controls & Notes */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Resolution Report / Action Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Write resolution remarks, work updates, or final completion logs to send back to the citizen."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-850 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    
                    <button
                      type="button"
                      disabled={updating || selectedComplaint.status === "Assigned"}
                      onClick={() => handleUpdateStatus("Assigned")}
                      className="py-3 px-2 border border-blue-200 bg-blue-50 text-[#1a365d] font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-blue-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      Accept Case
                    </button>

                    <button
                      type="button"
                      disabled={updating || selectedComplaint.status === "In Progress"}
                      onClick={() => handleUpdateStatus("In Progress")}
                      className="py-3 px-2 border border-amber-200 bg-amber-50 text-amber-950 font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-amber-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      In Progress
                    </button>

                    <button
                      type="button"
                      disabled={updating || selectedComplaint.status === "Resolved"}
                      onClick={() => handleUpdateStatus("Resolved")}
                      className="py-3 px-2 border border-emerald-200 bg-emerald-50 text-emerald-950 font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-emerald-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      Resolve File
                    </button>

                    <button
                      type="button"
                      disabled={updating || selectedComplaint.status === "Completed"}
                      onClick={() => handleUpdateStatus("Completed")}
                      className="py-3 px-2 bg-[#1a365d] text-white font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-[#11243f] transition disabled:opacity-50 cursor-pointer"
                    >
                      Close Complaint
                    </button>

                  </div>
                </div>

                {/* Audit tracker */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#1a365d] animate-pulse" />
                    <span>Current Status: <span className="text-slate-800 uppercase font-black">{selectedComplaint.status}</span></span>
                  </div>
                  <span className="uppercase text-[9px] font-black">Last Updated: {new Date(selectedComplaint.updatedAt).toLocaleTimeString()}</span>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center py-20 text-center text-slate-400">
                <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Triage Deck Idle</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed font-semibold">
                  Select a routed civic incident from the left-side In-Tray to begin investigation, view image evidence, run Gemini action playbooks, write resolution logs, and update filing status.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
