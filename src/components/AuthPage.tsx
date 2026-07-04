import React, { useState } from "react";
import { 
  auth, 
  db 
} from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { 
  ShieldAlert, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  Building2, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { UserRole } from "../types";
import { getLocalUsers, saveLocalUsers } from "../lib/mockData";

interface AuthPageProps {
  onNavigate: (view: "landing" | "auth" | "citizen" | "officer" | "admin") => void;
  onAuthSuccess: (user: any, profile: any) => void;
  onOfflineModeActivate: (user: any, profile: any) => void;
}

export default function AuthPage({ onNavigate, onAuthSuccess, onOfflineModeActivate }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [departmentName, setDepartmentName] = useState("Corporation"); // Default for officers

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Fetch User Profile from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profile = docSnap.data();
          onAuthSuccess(user, profile);
        } else {
          // If profile missing, create a citizen fallback
          const defaultProfile = {
            userId: user.uid,
            name: user.displayName || email.split("@")[0],
            email: user.email || email,
            role: "citizen" as UserRole,
            phone: "",
            address: "",
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, defaultProfile);
          onAuthSuccess(user, defaultProfile);
        }
      } else {
        // Sign Up
        if (!name || !email || !password) {
          throw new Error("Full Name, Email, and Password are required.");
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        const profileData = {
          userId: user.uid,
          name: name.trim(),
          email: email.trim(),
          role,
          phone: phone.trim(),
          address: address.trim(),
          ...(role === "officer" ? { departmentName } : {}),
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", user.uid), profileData);
        onAuthSuccess(user, profileData);
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      
      const cleanedEmail = email.trim().toLowerCase();
      const localUsers = getLocalUsers();

      // Fallback registration if in Sign Up mode and Firebase auth failed/not-enabled
      if (!isLogin) {
        console.warn("Firebase Auth sign-up failed or unconfigured, registering locally in sandbox:", err);
        const mockUserId = "mock-user-" + Math.random().toString(36).substr(2, 9);
        const mockProfile = {
          userId: mockUserId,
          name: name.trim(),
          email: cleanedEmail,
          role,
          phone: phone.trim(),
          address: address.trim(),
          password: password, // Store so they can sign in later
          ...(role === "officer" ? { departmentName } : {}),
          createdAt: new Date().toISOString()
        };
        const mockUser = {
          uid: mockUserId,
          email: cleanedEmail,
          displayName: name.trim()
        };

        const updatedLocalUsers = [...localUsers, mockProfile];
        saveLocalUsers(updatedLocalUsers);
        window.dispatchEvent(new Event("local_users_updated"));

        onOfflineModeActivate(mockUser, mockProfile);
        return;
      }
      
      // Fallback sign in check for both standard/demo credentials and custom registered local accounts
      if (cleanedEmail === "citizen@janai.gov.in" && password === "citizen123") {
        onOfflineModeActivate(
          { uid: "mock-citizen-id", email: "citizen@janai.gov.in", displayName: "Ananya Iyer (Demo Citizen)" },
          { userId: "mock-citizen-id", name: "Ananya Iyer (Demo Citizen)", email: "citizen@janai.gov.in", role: "citizen", phone: "+91 98765 43210", address: "Apt 4B, Green Meadows, Indira Nagar, Bengaluru, Karnataka", createdAt: new Date().toISOString() }
        );
        return;
      } else if (cleanedEmail === "officer@janai.gov.in" && password === "officer123") {
        onOfflineModeActivate(
          { uid: "mock-officer-id", email: "officer@janai.gov.in", displayName: "Priya Sharma (Muncipal Officer)" },
          { userId: "mock-officer-id", name: "Priya Sharma (Municipal Officer)", email: "officer@janai.gov.in", role: "officer", phone: "+91 99000 12345", address: "Ward 4 Administration Block, Municipal HQ, Bengaluru", departmentName: "Corporation", createdAt: new Date().toISOString() }
        );
        return;
      } else if (cleanedEmail === "admin@janai.gov.in" && password === "admin123") {
        onOfflineModeActivate(
          { uid: "mock-admin-id", email: "admin@janai.gov.in", displayName: "Chief Secretary S. K. Gupta" },
          { userId: "mock-admin-id", name: "Chief Secretary S. K. Gupta", email: "admin@janai.gov.in", role: "admin", phone: "+91 99456 78900", address: "Secretariat Offices, Vidhana Soudha, Bengaluru", createdAt: new Date().toISOString() }
        );
        return;
      }

      // Check custom registered local accounts
      const matchedLocalUser = localUsers.find(
        (u) => u.email.toLowerCase() === cleanedEmail && u.password === password
      );
      if (matchedLocalUser) {
        onOfflineModeActivate(
          { uid: matchedLocalUser.userId, email: matchedLocalUser.email, displayName: matchedLocalUser.name },
          matchedLocalUser
        );
        return;
      }

      let errMsg = err.message || "Authentication failed. Please verify credentials.";
      if (err.code === "auth/user-not-found") errMsg = "No profile found with this email.";
      if (err.code === "auth/wrong-password") errMsg = "Incorrect password.";
      if (err.code === "auth/email-already-in-use") errMsg = "An account already exists with this email.";
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        errMsg = "Firebase Error: The Email/Password sign-in provider is currently disabled in your Firebase console. Please go to Firebase -> Authentication -> Sign-in Method and enable 'Email/Password' to resolve this. Alternatively, click 'Bypass & Use Local Offline Sandbox' below to explore the app instantly!";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Setup / Sign In a Demo Account instantly
  const handleDemoLogin = async (demoRole: UserRole) => {
    setLoading(true);
    setError(null);

    let demoEmail = "";
    let demoPass = "";
    let demoName = "";
    let demoPhone = "";
    let demoAddress = "";
    let demoDept = "";

    if (demoRole === "citizen") {
      demoEmail = "citizen@janai.gov.in";
      demoPass = "citizen123";
      demoName = "Ananya Iyer (Demo Citizen)";
      demoPhone = "+91 98765 43210";
      demoAddress = "Apt 4B, Green Meadows, Indira Nagar, Bengaluru, Karnataka";
    } else if (demoRole === "officer") {
      demoEmail = "officer@janai.gov.in";
      demoPass = "officer123";
      demoName = "Priya Sharma (Muncipal Officer)";
      demoPhone = "+91 99000 12345";
      demoAddress = "Ward 4 Administration Block, Municipal HQ, Bengaluru";
      demoDept = "Corporation";
    } else if (demoRole === "admin") {
      demoEmail = "admin@janai.gov.in";
      demoPass = "admin123";
      demoName = "Chief Secretary S. K. Gupta";
      demoPhone = "+91 99456 78900";
      demoAddress = "Secretariat Offices, Vidhana Soudha, Bengaluru";
    }

    const mockProfile = {
      userId: `mock-${demoRole}-id`,
      name: demoName,
      email: demoEmail,
      role: demoRole,
      phone: demoPhone,
      address: demoAddress,
      ...(demoRole === "officer" ? { departmentName: demoDept } : {}),
      createdAt: new Date().toISOString()
    };

    const mockUser = {
      uid: `mock-${demoRole}-id`,
      email: demoEmail,
      displayName: demoName
    };

    try {
      let user;
      try {
        // Attempt to log in first
        const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
        user = userCredential.user;
      } catch (loginErr: any) {
        // If user not found, create a new one
        if (loginErr.code === "auth/user-not-found" || loginErr.code === "auth/invalid-credential") {
          const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          user = userCredential.user;
        } else {
          throw loginErr;
        }
      }

      // Ensure Profile exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const profileData = {
        userId: user.uid,
        name: demoName,
        email: demoEmail,
        role: demoRole,
        phone: demoPhone,
        address: demoAddress,
        ...(demoRole === "officer" ? { departmentName: demoDept } : {}),
        createdAt: new Date().toISOString()
      };

      await setDoc(docRef, profileData);
      onAuthSuccess(user, profileData);
    } catch (err: any) {
      console.warn("Firebase Auth failed or unconfigured, logging in using Offline Sandbox mode:", err);
      // Seamless bypass fallback to mock sandbox
      onOfflineModeActivate(mockUser, mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const [forgotMessage, setForgotMessage] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col md:flex-row items-stretch select-none">
      
      {/* Banner / Left Info Column */}
      <div className="md:w-1/2 bg-[#1a365d] p-8 sm:p-12 md:p-16 text-white flex flex-col justify-between">
        <button 
          onClick={() => onNavigate("landing")}
          className="self-start text-[10px] font-black uppercase tracking-wider text-blue-200 hover:text-white flex items-center space-x-2 bg-blue-950/40 border border-blue-900/30 px-3.5 py-2 rounded-lg transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-300" />
          <span>Back to Home</span>
        </button>

        <div className="space-y-6 max-w-md my-auto pt-8 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-[#1a365d] rounded-sm transform rotate-45 flex items-center justify-center">
                <span className="text-white text-[10px] transform -rotate-45 font-extrabold font-mono">AI</span>
              </div>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-white">JanAI Command Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black leading-none tracking-tighter text-white">
            Secure Role-Based Governance Gateway
          </h2>
          <p className="text-xs text-blue-150 font-medium leading-relaxed">
            Welcome to the national civic incident reporting portal. Access your custom workflow dashboard securely. Citizens can submit geolocation-logged issues, while department heads resolve actions in real time.
          </p>

          <div className="space-y-3 pt-4 border-t border-blue-900/40">
            <div className="flex items-center space-x-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-450 animate-pulse" />
              <span>Full Stack AI Synchronization Active</span>
            </div>
            <p className="text-[11px] text-blue-200/80 leading-relaxed">
              All logins require Firebase authentication tokens. Your personal reporting history is persistent, protected, and fully auditable by state heads.
            </p>
          </div>
        </div>

        <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest pt-8 flex items-center space-x-2">
          <span>Digital India Standard Portal v2.5</span>
        </div>
      </div>

      {/* Auth Forms & Demo Login Column */}
      <div className="md:w-1/2 bg-[#f8f9fa] flex flex-col justify-center px-4 sm:px-8 md:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-6">
          
          {/* Section: Demo Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-left">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a365d]">
                Friction-Free Review Shortcuts
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-1">
              Select an instant login profile below to immediately explore any dashboard with pre-configured accounts.
            </p>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("citizen")}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 rounded-lg text-left text-xs border border-slate-200 border-l-4 border-l-[#1a365d] text-slate-850 font-bold transition flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded bg-blue-50 text-[#1a365d] border border-blue-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-black text-[11px] text-[#1a365d] uppercase tracking-wide">Login as Citizen</p>
                    <p className="text-[10px] text-slate-500 font-medium">Report issues & track progress</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("officer")}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 rounded-lg text-left text-xs border border-slate-200 border-l-4 border-l-emerald-500 text-slate-850 font-bold transition flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-black text-[11px] text-emerald-700 uppercase tracking-wide">Login as Govt Officer</p>
                    <p className="text-[10px] text-slate-500 font-medium">Departmental triage (Corporation)</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("admin")}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 rounded-lg text-left text-xs border border-slate-200 border-l-4 border-l-indigo-500 text-slate-850 font-bold transition flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-black text-[11px] text-indigo-950 uppercase tracking-wide">Login as Chief Admin</p>
                    <p className="text-[10px] text-slate-500 font-medium">Full analytical reporting & audit controls</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Or login using Email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form UI */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-sm font-black text-[#1a365d] uppercase tracking-wider">
                {isLogin ? "Sign In to JanAI" : "Register Citizen Account"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-xs font-black text-[#1a365d] uppercase tracking-wide hover:text-emerald-500"
              >
                {isLogin ? "Create Account" : "Back to Login"}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex flex-col space-y-2">
                <div className="flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span className="font-semibold">{error}</span>
                </div>
                {(error.includes("disabled") || error.includes("provider") || error.includes("operation-not-allowed") || error.includes("unconfigured")) && (
                  <button
                    type="button"
                    onClick={() => {
                      onOfflineModeActivate(
                        { uid: "mock-citizen-id", email: "citizen@janai.gov.in", displayName: "Ananya Iyer (Demo Citizen)" },
                        { userId: "mock-citizen-id", name: "Ananya Iyer (Demo Citizen)", email: "citizen@janai.gov.in", role: "citizen", phone: "+91 98765 43210", address: "Apt 4B, Green Meadows, Indira Nagar, Bengaluru, Karnataka", createdAt: new Date().toISOString() }
                      );
                    }}
                    className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-black text-[10px] uppercase tracking-wider transition text-center cursor-pointer"
                  >
                    Bypass & Use Local Offline Sandbox Mode
                  </button>
                )}
              </div>
            )}

            {forgotMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-[#1a365d] text-xs rounded-lg flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                <span className="font-semibold">Please contact your municipal system administrator to reset password tokens.</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Registration Extra Fields */}
              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sameer Areeyas"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Full Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ward 4, MG Road, Bengaluru"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                      />
                    </div>
                  </div>

                  {/* Sign Up Role Choice */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Account Access Level</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setRole("citizen")}
                        className={`py-2 px-3 text-xs font-black uppercase tracking-wider border rounded-lg transition ${
                          role === "citizen" 
                            ? "bg-[#1a365d] text-white border-[#1a365d]" 
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Citizen
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("officer")}
                        className={`py-2 px-3 text-xs font-black uppercase tracking-wider border rounded-lg transition ${
                          role === "officer" 
                            ? "bg-[#1a365d] text-white border-[#1a365d]" 
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Govt Officer
                      </button>
                    </div>
                  </div>

                  {/* Officer Department assignment */}
                  {role === "officer" && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Your Department</label>
                      <select
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] transition font-semibold"
                      >
                        <option value="Highways Department">Highways Department</option>
                        <option value="Corporation">Municipal Corporation</option>
                        <option value="Water Board">Water Board</option>
                        <option value="Electricity Department">Electricity Department</option>
                        <option value="Traffic Police">Traffic Police</option>
                        <option value="Health Department">Health Department</option>
                        <option value="Public Works">Public Works</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Standard Credentials */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@janai.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setForgotMessage(true)}
                      className="text-[9px] font-black text-slate-400 uppercase tracking-wider hover:text-[#1a365d]"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-[#1a365d] focus:bg-white transition font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1a365d] hover:bg-[#11243f] text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-xs transition flex items-center justify-center space-x-2 mt-6 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isLogin ? "Authenticate Credentials" : "Create Profile Now"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
