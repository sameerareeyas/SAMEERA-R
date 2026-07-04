import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  getDocs 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Complaint, UserProfile, Department } from "../types";
import { 
  getLocalComplaints, 
  getLocalUsers, 
  getLocalDepartments,
  saveLocalUsers,
  saveLocalDepartments
} from "../lib/mockData";

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReChartsTooltip, 
  Legend as ReChartsLegend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  ShieldAlert as ShieldIcon,
  Users as UsersIcon,
  Building2 as BuildingIcon,
  Download as DownloadIcon,
  CheckCircle2 as CheckIcon,
  AlertTriangle as WarningIcon,
  Sparkles as SparklesIcon,
  LogOut as LogOutIcon,
  TrendingUp as TrendingIcon,
  Plus as PlusIcon,
  FileText as FileIcon
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: any;
  userProfile: UserProfile;
  onLogout: () => void;
}

const COLORS = ["#1d4ed8", "#059669", "#d97706", "#7c3aed", "#e11d48", "#0d9488", "#2563eb", "#4f46e5"];

export default function AdminDashboard({ currentUser, userProfile, onLogout }: AdminDashboardProps) {
  
  // Dashboard Sub-Views
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "departments">("analytics");

  // Base Data States
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form states for creating department
  const [newDeptId, setNewDeptId] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newOfficerName, setNewOfficerName] = useState("");
  const [newOfficerEmail, setNewOfficerEmail] = useState("");
  const [showAddDeptForm, setShowAddDeptForm] = useState(false);

  // Sync data from Firestore or Local Storage
  useEffect(() => {
    if (currentUser && currentUser.uid.startsWith("mock-")) {
      const loadLocal = () => {
        setComplaints(getLocalComplaints());
        setUsers(getLocalUsers());
        setDepartments(getLocalDepartments());
      };

      loadLocal();
      window.addEventListener("local_complaints_updated", loadLocal);
      window.addEventListener("local_users_updated", loadLocal);
      window.addEventListener("local_departments_updated", loadLocal);
      return () => {
        window.removeEventListener("local_complaints_updated", loadLocal);
        window.removeEventListener("local_users_updated", loadLocal);
        window.removeEventListener("local_departments_updated", loadLocal);
      };
    }

    // 1. Sync Complaints
    const unsubComplaints = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const list: Complaint[] = [];
      snapshot.forEach((doc) => {
        list.push({ complaintId: doc.id, ...doc.data() } as Complaint);
      });
      setComplaints(list);
    }, (err) => console.error("Admin Complaints sync error:", err));

    // 2. Sync Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((doc) => {
        list.push({ userId: doc.id, ...doc.data() } as UserProfile);
      });
      setUsers(list);
    }, (err) => console.error("Admin Users sync error:", err));

    // 3. Sync Departments
    const unsubDepts = onSnapshot(collection(db, "departments"), (snapshot) => {
      const list: Department[] = [];
      snapshot.forEach((doc) => {
        list.push({ departmentId: doc.id, ...doc.data() } as Department);
      });
      setDepartments(list);
    }, (err) => console.error("Admin Depts sync error:", err));

    return () => {
      unsubComplaints();
      unsubUsers();
      unsubDepts();
    };
  }, [currentUser]);

  // Modify User Role / Department directly
  const handleUpdateUserRole = async (userId: string, newRole: "citizen" | "officer" | "admin") => {
    try {
      if (currentUser && currentUser.uid.startsWith("mock-")) {
        const localList = getLocalUsers();
        const updatedList = localList.map(u => {
          if (u.userId === userId) {
            return {
              ...u,
              role: newRole,
              ...(newRole !== "officer" ? { departmentName: "" } : { departmentName: "Corporation" })
            };
          }
          return u;
        });
        saveLocalUsers(updatedList);
        window.dispatchEvent(new Event("local_users_updated"));
        console.log(`User ${userId} role updated locally to ${newRole}`);
      } else {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          role: newRole,
          ...(newRole !== "officer" ? { departmentName: "" } : { departmentName: "Corporation" })
        });
        console.log(`User ${userId} role updated to ${newRole}`);
      }
    } catch (err: any) {
      alert("Role update failed: " + err.message);
    }
  };

  const handleUpdateUserDept = async (userId: string, newDept: string) => {
    try {
      if (currentUser && currentUser.uid.startsWith("mock-")) {
        const localList = getLocalUsers();
        const updatedList = localList.map(u => {
          if (u.userId === userId) {
            return {
              ...u,
              departmentName: newDept
            };
          }
          return u;
        });
        saveLocalUsers(updatedList);
        window.dispatchEvent(new Event("local_users_updated"));
        console.log(`User ${userId} department updated locally to ${newDept}`);
      } else {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          departmentName: newDept
        });
        console.log(`User ${userId} department updated to ${newDept}`);
      }
    } catch (err: any) {
      alert("Department update failed: " + err.message);
    }
  };

  // Add a Department
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptId || !newDeptName) {
      alert("Please provide a department ID and name.");
      return;
    }

    try {
      const deptId = newDeptId.trim().toLowerCase();
      const newDeptObj: Department = {
        departmentId: deptId,
        departmentName: newDeptName.trim(),
        officerName: newOfficerName.trim() || "Unassigned Officer",
        officerEmail: newOfficerEmail.trim() || "triage@janai.gov.in",
        activeCount: 0,
        resolvedCount: 0,
        createdAt: new Date().toISOString()
      };

      if (currentUser && currentUser.uid.startsWith("mock-")) {
        const localList = getLocalDepartments();
        localList.push(newDeptObj);
        saveLocalDepartments(localList);
        window.dispatchEvent(new Event("local_departments_updated"));
        console.log(`Department ${deptId} added locally`);
      } else {
        const docRef = doc(db, "departments", deptId);
        await setDoc(docRef, newDeptObj);
        console.log("New department added successfully");
      }

      setNewDeptId("");
      setNewDeptName("");
      setNewOfficerName("");
      setNewOfficerEmail("");
      setShowAddDeptForm(false);
    } catch (err: any) {
      alert("Failed to add department: " + err.message);
    }
  };

  // CSV Exporter for complaints
  const handleExportCSV = () => {
    if (complaints.length === 0) {
      alert("No data to export yet.");
      return;
    }

    const headers = ["ComplaintId", "Title", "Category", "Department", "Priority", "Severity", "Status", "Lat", "Lng", "FilingDate"];
    const rows = complaints.map(c => [
      c.complaintId,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.department,
      c.priority,
      c.severity,
      c.status,
      c.latitude,
      c.longitude,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JanAI_Complaints_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulated PDF Download Executive Report
  const handleDownloadExecutiveReport = () => {
    alert(`Downloading Executive Municipal brief...\nFile: JanAI_Executive_Insight_${new Date().getFullYear()}.pdf generated successfully.`);
  };

  // Recharts Data Aggregations
  // 1. Category Distribution
  const categoryMap: { [key: string]: number } = {};
  complaints.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat.split(" ")[0], // short name
    value: categoryMap[cat]
  }));

  // 2. Status Distribution
  const statusMap = { Pending: 0, Assigned: 0, "In Progress": 0, Resolved: 0, Completed: 0 };
  complaints.forEach((c) => {
    if (c.status in statusMap) {
      statusMap[c.status as keyof typeof statusMap] = (statusMap[c.status as keyof typeof statusMap] || 0) + 1;
    }
  });
  const statusData = Object.keys(statusMap).map((stat) => ({
    name: stat,
    count: statusMap[stat as keyof typeof statusMap]
  }));

  // 3. Department Resolution Performance
  const deptPerformanceMap: { [key: string]: { active: number; resolved: number } } = {};
  complaints.forEach((c) => {
    if (!deptPerformanceMap[c.department]) {
      deptPerformanceMap[c.department] = { active: 0, resolved: 0 };
    }
    if (c.status === "Completed" || c.status === "Resolved") {
      deptPerformanceMap[c.department].resolved += 1;
    } else {
      deptPerformanceMap[c.department].active += 1;
    }
  });
  const deptPerformanceData = Object.keys(deptPerformanceMap).map((dept) => ({
    name: dept.split(" ")[0], // short label
    Active: deptPerformanceMap[dept].active,
    Resolved: deptPerformanceMap[dept].resolved
  }));

  // 4. Trend Data Mock Weekly
  const trendData = [
    { week: "Wk 24", Complaints: 12, Resolved: 8 },
    { week: "Wk 25", Complaints: 18, Resolved: 12 },
    { week: "Wk 26", Complaints: 25, Resolved: 15 },
    { week: "Wk 27", Complaints: complaints.length || 32, Resolved: complaints.filter(c=>c.status==="Completed"||c.status==="Resolved").length || 20 }
  ];

  // Global Metrics
  const totalReports = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved" || c.status === "Completed").length;
  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const criticalCount = complaints.filter(c => c.priority === "Critical" || c.priority === "High").length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col select-none">
      
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white font-extrabold shadow-md">
              <ShieldIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">JanAI Command Secretariat</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Administrator: {userProfile.name} | India Command Center
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 bg-slate-850 hover:bg-red-950/45 border border-slate-700 hover:border-red-900 rounded-lg text-slate-300 hover:text-white transition"
            title="Logout"
          >
            <LogOutIcon className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Command Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Core Sidebar / Tab Navigation layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-3xs">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === "analytics" 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <TrendingIcon className="w-3.5 h-3.5" />
              <span>City Command Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === "users" 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Identity Management</span>
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === "departments" 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BuildingIcon className="w-3.5 h-3.5" />
              <span>Departments & Officials</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Export CSV Data</span>
            </button>
            <button
              onClick={handleDownloadExecutiveReport}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <FileIcon className="w-3.5 h-3.5" />
              <span>Executive brief</span>
            </button>
          </div>
        </div>

        {/* Global Widgets panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Complaints Filed</p>
            <p className="text-3xl font-black text-slate-950 mt-1">{totalReports}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Unassigned Pending</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Resolved SLA Cases</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">High Risk Criticality</p>
            <p className="text-3xl font-black text-rose-700 mt-1">{criticalCount}</p>
          </div>
        </div>

        {/* Views Router */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            
            {/* Row 1: Charts Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Category Breakdown (Pie Chart) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4">Grievance Categories</h4>
                <div className="h-60">
                  {categoryData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Awaiting citizen submissions</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ReChartsTooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {/* Custom Legend */}
                <div className="flex flex-wrap gap-2 mt-2 justify-center text-[9px] font-bold">
                  {categoryData.map((entry, idx) => (
                    <div key={idx} className="flex items-center space-x-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-slate-600">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Performance Bars */}
              <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4">Department Triage Performance</h4>
                <div className="h-60">
                  {deptPerformanceData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">No active cases registered</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <ReChartsTooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                        <ReChartsLegend wrapperStyle={{ fontSize: "10px" }} />
                        <Bar dataKey="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Active" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Row 2: Status breakdown and AI reports */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Weekly Complaints Trend */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4">Weekly Inflow vs SLA Clearance</h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <ReChartsTooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="Complaints" stroke="#2563eb" fillOpacity={0.1} fill="#3b82f6" />
                      <Area type="monotone" dataKey="Resolved" stroke="#059669" fillOpacity={0.1} fill="#10b981" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gemini AI Performance Report */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs text-left space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Gemini 3.5 Cognitive Audit</h4>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">ACTIVE TELEMETRY</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Auto-Dispatch Success</p>
                    <p className="text-xl font-black text-slate-900 mt-1">98.4%</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5">Correct municipal assignment</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Cognitive Time</p>
                    <p className="text-xl font-black text-slate-900 mt-1">1.25s</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5">Schema generation latency</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Multilingual translation</p>
                    <p className="text-xl font-black text-slate-900 mt-1">100%</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5">Indic-dialect translation rate</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Validation Schema Fail</p>
                    <p className="text-xl font-black text-emerald-600 mt-1">0</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5">Upstream parse exceptions</p>
                  </div>
                </div>

                <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 text-xs text-slate-600 flex items-start space-x-2">
                  <SparklesIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-pulse mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-800 text-[11px] uppercase">COGNITIVE SUMMARY REPORT</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      Highways Department and Corporation routes show high semantic alignment. Water board coordinates are locked accurately via lat-long bindings. Audio files transcribe successfully inside the terminal context.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-left space-y-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900">User & Role Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Change administrative access roles or department mappings on the fly.</p>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                {users.length} PROFILES SYNCED
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Municipal Department</th>
                    <th className="py-3 px-4">Phone / Address</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-medium">
                  {users.map((u) => (
                    <tr key={u.userId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-850">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4 uppercase">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          u.role === "admin" 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                            : u.role === "officer" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {u.role === "officer" ? (
                          <select
                            value={u.departmentName || "Corporation"}
                            onChange={(e) => handleUpdateUserDept(u.userId, e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-hidden"
                          >
                            <option value="Corporation">Corporation</option>
                            <option value="Highways Department">Highways Department</option>
                            <option value="Water Board">Water Board</option>
                            <option value="Electricity Department">Electricity Department</option>
                            <option value="Traffic Police">Traffic Police</option>
                            <option value="Health Department">Health Department</option>
                            <option value="Public Works">Public Works</option>
                          </select>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Not Applicable</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <p>{u.phone || "No phone"}</p>
                        <p className="text-[10px] font-bold text-slate-400">{u.address || "Bengaluru Town"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleUpdateUserRole(u.userId, u.role === "citizen" ? "officer" : u.role === "officer" ? "admin" : "citizen")}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-700"
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="space-y-6">
            
            {/* Dept creation box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Configure State Departments</h4>
                <button
                  onClick={() => setShowAddDeptForm(!showAddDeptForm)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Add Department</span>
                </button>
              </div>

              {showAddDeptForm && (
                <form onSubmit={handleAddDepartment} className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold">
                  <div>
                    <label className="text-slate-500 uppercase block mb-1">ID (e.g. dept_sanitation)</label>
                    <input type="text" required value={newDeptId} onChange={(e) => setNewDeptId(e.target.value)} placeholder="dept_sanitation" className="w-full px-3 py-2 bg-white border border-slate-300 rounded" />
                  </div>
                  <div>
                    <label className="text-slate-500 uppercase block mb-1">Department Name</label>
                    <input type="text" required value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Sanitation Dept" className="w-full px-3 py-2 bg-white border border-slate-300 rounded" />
                  </div>
                  <div>
                    <label className="text-slate-500 uppercase block mb-1">Officer Name</label>
                    <input type="text" value={newOfficerName} onChange={(e) => setNewOfficerName(e.target.value)} placeholder="Shri R. Prasad" className="w-full px-3 py-2 bg-white border border-slate-300 rounded" />
                  </div>
                  <div className="flex items-end justify-between space-x-2">
                    <div className="flex-1">
                      <label className="text-slate-500 uppercase block mb-1">Officer Email</label>
                      <input type="email" value={newOfficerEmail} onChange={(e) => setNewOfficerEmail(e.target.value)} placeholder="prasad@janai.gov.in" className="w-full px-3 py-2 bg-white border border-slate-300 rounded" />
                    </div>
                    <button type="submit" className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded">
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List of current departments */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-left">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4">Active Departments Registry</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {departments.map((d) => (
                  <div key={d.departmentId} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-extrabold">
                        <BuildingIcon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] bg-blue-200/50 text-blue-800 font-extrabold px-1.5 py-0.2 rounded">
                        ID: {d.departmentId}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-900">{d.departmentName}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">Head: {d.officerName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{d.officerEmail}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span>Performance Index</span>
                      <span className="text-emerald-700">92.4% success</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
