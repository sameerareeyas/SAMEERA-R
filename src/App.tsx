import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, seedInitialDataIfNeeded } from "./lib/firebase";
import { UserProfile } from "./types";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import CitizenDashboard from "./components/CitizenDashboard";
import OfficerDashboard from "./components/OfficerDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [isOffline, setIsOffline] = useState(() => localStorage.getItem("janai_offline_mode") === "true");
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<"landing" | "auth" | "citizen" | "officer" | "admin">("landing");
  
  // Quick Actions from Hero Section
  const [quickAction, setQuickAction] = useState<"raise" | "track" | null>(null);

  const [loading, setLoading] = useState(true);

  // 1. Initial Seeding of departments and auth listener
  useEffect(() => {
    if (isOffline) {
      const storedUser = localStorage.getItem("janai_offline_user");
      const storedProfile = localStorage.getItem("janai_offline_profile");
      if (storedUser && storedProfile) {
        setCurrentUser(JSON.parse(storedUser));
        setUserProfile(JSON.parse(storedProfile));
        const profile = JSON.parse(storedProfile);
        if (profile.role === "admin") {
          setView("admin");
        } else if (profile.role === "officer") {
          setView("officer");
        } else {
          setView("citizen");
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setView("landing");
      }
      setLoading(false);
      return;
    }

    // Seed database with default departments if empty
    seedInitialDataIfNeeded();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        
        // Fetch Profile
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setUserProfile(profile);
            
            // Auto route based on role
            if (profile.role === "admin") {
              setView("admin");
            } else if (profile.role === "officer") {
              setView("officer");
            } else {
              setView("citizen");
            }
          } else {
            // Fallback profile
            const fallback: UserProfile = {
              userId: user.uid,
              name: user.displayName || user.email?.split("@")[0] || "Citizen",
              email: user.email || "",
              role: "citizen",
              createdAt: new Date().toISOString()
            };
            setUserProfile(fallback);
            setView("citizen");
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setView("auth");
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setView("landing");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOffline]);

  // Handle successful login
  const handleAuthSuccess = (user: any, profile: any) => {
    setCurrentUser(user);
    setUserProfile(profile);
    
    if (profile.role === "admin") {
      setView("admin");
    } else if (profile.role === "officer") {
      setView("officer");
    } else {
      setView("citizen");
    }
  };

  // Handle local sandbox offline login
  const handleOfflineModeActivate = (user: any, profile: any) => {
    localStorage.setItem("janai_offline_mode", "true");
    localStorage.setItem("janai_offline_user", JSON.stringify(user));
    localStorage.setItem("janai_offline_profile", JSON.stringify(profile));
    setIsOffline(true);
    setCurrentUser(user);
    setUserProfile(profile);
    
    if (profile.role === "admin") {
      setView("admin");
    } else if (profile.role === "officer") {
      setView("officer");
    } else {
      setView("citizen");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        localStorage.removeItem("janai_offline_user");
        localStorage.removeItem("janai_offline_profile");
        localStorage.setItem("janai_offline_mode", "false");
        setIsOffline(false);
        setCurrentUser(null);
        setUserProfile(null);
        setView("landing");
      } else {
        await signOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
        setView("landing");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setCurrentUser(null);
      setUserProfile(null);
      setView("landing");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">JanAI Security</h2>
            <p className="text-xs text-slate-400 mt-1">Verifying encrypted portal session...</p>
          </div>
        </div>
      </div>
    );
  }

  // View Routing Switch
  switch (view) {
    case "landing":
      return (
        <LandingPage 
          onNavigate={(target) => setView(target)} 
          onSetQuickAction={setQuickAction}
          currentUser={currentUser}
          userProfile={userProfile}
        />
      );
    case "auth":
      return (
        <AuthPage 
          onNavigate={(target) => setView(target)} 
          onAuthSuccess={handleAuthSuccess} 
          onOfflineModeActivate={handleOfflineModeActivate}
        />
      );
    case "citizen":
      return userProfile && userProfile.role === "citizen" ? (
        <CitizenDashboard 
          currentUser={currentUser} 
          userProfile={userProfile} 
          onLogout={handleLogout}
          quickAction={quickAction}
          onClearQuickAction={() => setQuickAction(null)}
        />
      ) : (
        <AuthPage 
          onNavigate={(target) => setView(target)} 
          onAuthSuccess={handleAuthSuccess} 
          onOfflineModeActivate={handleOfflineModeActivate}
        />
      );
    case "officer":
      return userProfile && userProfile.role === "officer" ? (
        <OfficerDashboard 
          currentUser={currentUser} 
          userProfile={userProfile} 
          onLogout={handleLogout}
        />
      ) : (
        <AuthPage 
          onNavigate={(target) => setView(target)} 
          onAuthSuccess={handleAuthSuccess} 
          onOfflineModeActivate={handleOfflineModeActivate}
        />
      );
    case "admin":
      return userProfile && userProfile.role === "admin" ? (
        <AdminDashboard 
          currentUser={currentUser} 
          userProfile={userProfile} 
          onLogout={handleLogout}
        />
      ) : (
        <AuthPage 
          onNavigate={(target) => setView(target)} 
          onAuthSuccess={handleAuthSuccess} 
          onOfflineModeActivate={handleOfflineModeActivate}
        />
      );
    default:
      return (
        <LandingPage 
          onNavigate={(target) => setView(target)} 
          onSetQuickAction={setQuickAction}
          currentUser={currentUser}
          userProfile={userProfile}
        />
      );
  }
}
