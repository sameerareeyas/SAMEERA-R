import { Complaint, UserProfile, Department } from "../types";

export const MOCK_DEPARTMENTS: Department[] = [
  { departmentId: "dept_highways", departmentName: "Highways Department", officerName: "Shri Rajesh Kumar", officerEmail: "highways@janai.gov.in", activeCount: 1, resolvedCount: 12 },
  { departmentId: "dept_corporation", departmentName: "Corporation", officerName: "Smt. Priya Sharma", officerEmail: "corporation@janai.gov.in", activeCount: 2, resolvedCount: 28 },
  { departmentId: "dept_water", departmentName: "Water Board", officerName: "Shri Amit Patel", officerEmail: "waterboard@janai.gov.in", activeCount: 0, resolvedCount: 15 },
  { departmentId: "dept_electricity", departmentName: "Electricity Department", officerName: "Shri Sanjay Roy", officerEmail: "electricity@janai.gov.in", activeCount: 1, resolvedCount: 9 },
  { departmentId: "dept_traffic", departmentName: "Traffic Police", officerName: "Smt. Kiran Bedi", officerEmail: "traffic@janai.gov.in", activeCount: 0, resolvedCount: 34 },
  { departmentId: "dept_health", departmentName: "Health Department", officerName: "Dr. Anil Saxena", officerEmail: "health@janai.gov.in", activeCount: 0, resolvedCount: 22 },
  { departmentId: "dept_publicworks", departmentName: "Public Works", officerName: "Shri Manoj Gupta", officerEmail: "publicworks@janai.gov.in", activeCount: 1, resolvedCount: 18 }
];

export const MOCK_USERS: UserProfile[] = [
  {
    userId: "mock-citizen-id",
    name: "Ananya Iyer (Demo Citizen)",
    email: "citizen@janai.gov.in",
    role: "citizen",
    phone: "+91 98765 43210",
    address: "Apt 4B, Green Meadows, Indira Nagar, Bengaluru, Karnataka",
    createdAt: new Date().toISOString()
  },
  {
    userId: "mock-officer-id",
    name: "Priya Sharma (Municipal Officer)",
    email: "officer@janai.gov.in",
    role: "officer",
    phone: "+91 99000 12345",
    address: "Ward 4 Administration Block, Municipal HQ, Bengaluru",
    departmentName: "Corporation",
    createdAt: new Date().toISOString()
  },
  {
    userId: "mock-admin-id",
    name: "Chief Secretary S. K. Gupta",
    email: "admin@janai.gov.in",
    role: "admin",
    phone: "+91 99456 78900",
    address: "Secretariat Offices, Vidhana Soudha, Bengaluru",
    createdAt: new Date().toISOString()
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    complaintId: "comp-101",
    title: "Deep Road Pothole",
    description: "A huge, deep pothole has appeared at the main intersection of Indira Nagar 100ft road. Cars are swerving to avoid it and it poses a massive hazard to motorcyclists.",
    category: "Road Pavement Defects",
    department: "Highways Department",
    priority: "High",
    severity: 75,
    status: "In Progress",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80",
    latitude: 12.9718,
    longitude: 77.6411,
    citizenId: "mock-citizen-id",
    citizenName: "Ananya Iyer (Demo Citizen)",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    suggestedAction: "Patch the road using fast-drying cold asphalt mix and set up barricades immediately.",
    englishTranslation: "Deep Road Pothole",
    officerNotes: "Assigned to the highway maintenance sub-division. Crew expected to patch on site by tonight."
  },
  {
    complaintId: "comp-102",
    title: "Uncontrolled Household Garbage Pile",
    description: "A massive pile of rotting garbage has accumulated near the main public park entrance. It smells terrible and is attracting flies and stray animals.",
    category: "Garbage Pile / Sanitation",
    department: "Corporation",
    priority: "Medium",
    severity: 55,
    status: "Pending",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80",
    latitude: 12.9352,
    longitude: 77.6244,
    citizenId: "mock-citizen-id",
    citizenName: "Ananya Iyer (Demo Citizen)",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    suggestedAction: "Deploy a waste management truck with a loader to clear the mound and disinfect the zone.",
    englishTranslation: "Uncontrolled Household Garbage Pile"
  },
  {
    complaintId: "comp-103",
    title: "Main Pipe Burst Water Leak",
    description: "Water is spraying out high into the air from a pipe underneath the pavement. MG Road is starting to flood.",
    category: "Water Pipeline Leak",
    department: "Water Board",
    priority: "Critical",
    severity: 90,
    status: "Resolved",
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e5740a7a?auto=format&fit=crop&w=400&q=80",
    latitude: 12.9733,
    longitude: 77.6117,
    citizenId: "mock-citizen-id",
    citizenName: "Ananya Iyer (Demo Citizen)",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    suggestedAction: "Shut off the primary sector valve, replace the burst high-density polyethylene pipe segment, and restabilize pavement.",
    englishTranslation: "Main Pipe Burst Water Leak",
    officerNotes: "Main supply valve shut off. Pipe segment successfully replaced and supply restored. Road repaired."
  },
  {
    complaintId: "comp-104",
    title: "Broken Street Lights",
    description: "All street lights are off on 5th cross Jayanagar. It is pitch dark at night and unsafe for walking.",
    category: "Electricity Issue / Broken Lights",
    department: "Electricity Department",
    priority: "Medium",
    severity: 45,
    status: "Assigned",
    imageUrl: "https://images.unsplash.com/photo-1509021436665-8f37df706543?auto=format&fit=crop&w=400&q=80",
    latitude: 12.9307,
    longitude: 77.5832,
    citizenId: "mock-citizen-id-other",
    citizenName: "Rohan Das",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    suggestedAction: "Replace blown fuses in the regional feeder pillar and verify street luminaire connection lines.",
    englishTranslation: "Broken Street Lights",
    officerNotes: "Assigned to Ward 4 Electrical Maintenance wing. Inspections underway."
  }
];

// LocalStorage helpers
export function getLocalComplaints(): Complaint[] {
  const stored = localStorage.getItem("janai_local_complaints");
  if (!stored) {
    localStorage.setItem("janai_local_complaints", JSON.stringify(MOCK_COMPLAINTS));
    return MOCK_COMPLAINTS;
  }
  return JSON.parse(stored);
}

export function saveLocalComplaints(complaints: Complaint[]): void {
  localStorage.setItem("janai_local_complaints", JSON.stringify(complaints));
}

export function getLocalDepartments(): Department[] {
  const stored = localStorage.getItem("janai_local_departments");
  if (!stored) {
    localStorage.setItem("janai_local_departments", JSON.stringify(MOCK_DEPARTMENTS));
    return MOCK_DEPARTMENTS;
  }
  return JSON.parse(stored);
}

export function saveLocalDepartments(departments: Department[]): void {
  localStorage.setItem("janai_local_departments", JSON.stringify(departments));
}

export function getLocalUsers(): UserProfile[] {
  const stored = localStorage.getItem("janai_local_users");
  if (!stored) {
    localStorage.setItem("janai_local_users", JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }
  return JSON.parse(stored);
}

export function saveLocalUsers(users: UserProfile[]): void {
  localStorage.setItem("janai_local_users", JSON.stringify(users));
}
