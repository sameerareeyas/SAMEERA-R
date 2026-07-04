import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, writeBatch, getDocs, limit, query } from "firebase/firestore";

// Configuration keys retrieved from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyAsE49mO0HJhXNYX2RSZAeFZt7_vjWNOwk",
  authDomain: "propane-world-8j1d7.firebaseapp.com",
  projectId: "propane-world-8j1d7",
  storageBucket: "propane-world-8j1d7.firebasestorage.app",
  messagingSenderId: "470186818803",
  appId: "1:470186818803:web:e2ede01e74130ba7120b86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore targeting the custom databaseId
export const db = getFirestore(app, "ai-studio-7051ce77-0190-4be0-bfb8-f1c614b69662");

// Helper to seed initial departments if they don't exist
export async function seedInitialDataIfNeeded() {
  try {
    const q = query(collection(db, "departments"), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log("Departments database already seeded.");
      return;
    }

    console.log("Seeding default departments...");
    const batch = writeBatch(db);

    const defaultDepartments = [
      { id: "dept_highways", name: "Highways Department", officer: "Shri Rajesh Kumar", email: "highways@janai.gov.in" },
      { id: "dept_corporation", name: "Corporation", officer: "Smt. Priya Sharma", email: "corporation@janai.gov.in" },
      { id: "dept_water", name: "Water Board", officer: "Shri Amit Patel", email: "waterboard@janai.gov.in" },
      { id: "dept_electricity", name: "Electricity Department", officer: "Shri Sanjay Roy", email: "electricity@janai.gov.in" },
      { id: "dept_traffic", name: "Traffic Police", officer: "Smt. Kiran Bedi", email: "traffic@janai.gov.in" },
      { id: "dept_health", name: "Health Department", officer: "Dr. Anil Saxena", email: "health@janai.gov.in" },
      { id: "dept_publicworks", name: "Public Works", officer: "Shri Manoj Gupta", email: "publicworks@janai.gov.in" }
    ];

    defaultDepartments.forEach((dept) => {
      const docRef = doc(db, "departments", dept.id);
      batch.set(docRef, {
        departmentId: dept.id,
        departmentName: dept.name,
        officerName: dept.officer,
        officerEmail: dept.email,
        activeCount: 0,
        resolvedCount: 0,
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();
    console.log("Successfully seeded default departments!");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}
