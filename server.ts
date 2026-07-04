import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client (server-side only, secret key hidden from browser)
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Gemini AI client successfully initialized server-side.");
} else {
  console.warn("GEMINI_API_KEY environment variable is missing. AI features will fallback to mock heuristics.");
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai, timestamp: new Date().toISOString() });
});

// 2. Gemini-powered Complaint Analyzer Endpoint
app.post("/api/analyze-complaint", async (req, res) => {
  const { title, description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Complaint description is required" });
  }

  // Fallback helper if Gemini API is not available
  const generateHeuristicFallback = (t: string, d: string) => {
    const text = (t + " " + d).toLowerCase();
    let category = "Government Infrastructure";
    let department = "Public Works";
    let priority = "Medium";
    let severity = 50;
    let suggestedAction = "Dispatch inspection team to assess structural or administrative integrity.";

    if (text.includes("road") || text.includes("pothole") || text.includes("street") || text.includes("pavement")) {
      category = "Road Damage";
      department = "Highways Department";
      priority = "High";
      severity = 75;
      suggestedAction = "Notify local area engineer to inspect road surface damage and schedule cold-mix asphalt patch work.";
    } else if (text.includes("garbage") || text.includes("overflow") || text.includes("waste") || text.includes("dump") || text.includes("litter")) {
      category = "Garbage Overflow";
      department = "Corporation";
      priority = "Medium";
      severity = 60;
      suggestedAction = "Deploy dumper placer vehicle to clear garbage overflow and clean surrounding sanitation bins.";
    } else if (text.includes("water") || text.includes("leak") || text.includes("pipe") || text.includes("contamination")) {
      category = "Water Leakage";
      department = "Water Board";
      priority = "High";
      severity = 80;
      suggestedAction = "Dispatch line-patrol technicians to locate underground pipe burst and isolate water mains.";
    } else if (text.includes("light") || text.includes("bulb") || text.includes("dark") || text.includes("electricity") || text.includes("wire")) {
      category = "Broken Street Lights";
      department = "Electricity Department";
      priority = "Medium";
      severity = 45;
      suggestedAction = "Assign street-lighting crew to replace damaged LED luminaire and verify cable insulation.";
    } else if (text.includes("traffic") || text.includes("jam") || text.includes("signal") || text.includes("parking")) {
      category = "Traffic Issues";
      department = "Traffic Police";
      priority = "Medium";
      severity = 50;
      suggestedAction = "Alert local traffic control booth to deploy officers to manually direct congested intersections.";
    } else if (text.includes("health") || text.includes("hospital") || text.includes("dengue") || text.includes("mosquito") || text.includes("disease")) {
      category = "Public Health Issues";
      department = "Health Department";
      priority = "High";
      severity = 85;
      suggestedAction = "Initiate anti-larval fogging in the ward and coordinate checkups at the primary health center.";
    } else if (text.includes("drain") || text.includes("sewer") || text.includes("gutter") || text.includes("manhole")) {
      category = "Drainage Problems";
      department = "Corporation";
      priority = "Critical";
      severity = 90;
      suggestedAction = "Dispatch jetting and suction machine to clear drainage blockage and secure loose manhole cover.";
    } else if (text.includes("flood") || text.includes("waterlog") || text.includes("monsoon")) {
      category = "Flooding";
      department = "Highways Department";
      priority = "Critical";
      severity = 95;
      suggestedAction = "Activate emergency water pump sets to drain waterlogging and coordinate with disaster management desk.";
    }

    return {
      category,
      department,
      priority,
      severity,
      suggestedAction,
      englishTranslation: d,
    };
  };

  try {
    if (!ai) {
      console.log("Using heuristic analysis due to missing server-side API key.");
      const result = generateHeuristicFallback(title || "", description);
      return res.json(result);
    }

    console.log(`Analyzing complaint with Gemini API. Title: "${title || ""}"`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are JanAI, an advanced AI Governance Assistant analyzing citizen complaints for a municipality in India.
Analyze the following citizen report:
Title: "${title || "Untitled"}"
Description: "${description}"

Based on this content, classify the issue and return a structured JSON output with details on:
1. Category: Must be one of [Road Damage, Garbage Overflow, Water Leakage, Broken Street Lights, Illegal Dumping, Drainage Problems, Public Health Issues, Traffic Issues, Flooding, Government Infrastructure Problems]
2. Department: Must be one of [Highways Department, Corporation, Water Board, Electricity Department, Traffic Police, Health Department, Public Works]
3. Priority: Must be one of [Low, Medium, High, Critical]
4. Severity: An integer between 0 and 100 assessing the immediate threat or public risk.
5. SuggestedAction: A brief professional instruction (one or two sentences) for the government officer detailing the immediate action they should take.
6. EnglishTranslation: A clean English summary/translation of the complaint description if the citizen wrote it in Hindi, Tamil, Telugu, or another language, or mixed with local slang. If already in clean English, return the original text.

Structure your JSON according to the requested schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "The complaint category (e.g. Road Damage, Garbage Overflow, etc.)",
            },
            department: {
              type: Type.STRING,
              description: "The assigned government department responsible for solving this issue.",
            },
            priority: {
              type: Type.STRING,
              description: "The urgency of the complaint: Low, Medium, High, or Critical.",
            },
            severity: {
              type: Type.INTEGER,
              description: "Risk score from 0 (lowest) to 100 (highest/catastrophic).",
            },
            suggestedAction: {
              type: Type.STRING,
              description: "Actionable initial instructions for municipal staff.",
            },
            englishTranslation: {
              type: Type.STRING,
              description: "English translation of multilingual input, or clean original text if English.",
            },
          },
          required: ["category", "department", "priority", "severity", "suggestedAction", "englishTranslation"],
        },
      },
    });

    const aiResponseText = response.text;
    if (!aiResponseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(aiResponseText.trim());
    return res.json(parsedResult);

  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    // Graceful fallback to heuristics if Gemini API throws or times out
    const result = generateHeuristicFallback(title || "", description);
    return res.json({
      ...result,
      aiNotice: "Analysis fallback applied due to upstream service exception.",
    });
  }
});

// Serve frontend build and handle SPA route fallbacks
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode - Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    // Production mode - serve build output
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JanAI Full-Stack Server listening on http://localhost:${PORT}`);
  });
}

serveApp().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
