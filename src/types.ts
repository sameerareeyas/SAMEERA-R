export type UserRole = "citizen" | "officer" | "admin";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  departmentName?: string; // If officer, which department they handle
  createdAt: string;
  password?: string; // Optional for local sandbox mode
}

export interface Complaint {
  complaintId: string;
  title: string;
  description: string;
  category: string;
  department: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: number; // 0 to 100
  status: "Pending" | "Assigned" | "In Progress" | "Resolved" | "Completed";
  imageUrl?: string;
  voiceUrl?: string; // base64 mock or ObjectURL
  latitude: number;
  longitude: number;
  citizenId: string;
  citizenName: string;
  createdAt: string;
  updatedAt: string;
  suggestedAction?: string;
  englishTranslation?: string;
  officerNotes?: string;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  officerName: string;
  officerEmail: string;
  activeCount: number;
  resolvedCount: number;
  createdAt?: string;
}
