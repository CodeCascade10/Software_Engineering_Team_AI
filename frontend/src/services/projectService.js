export async function createLocalProject(
  prompt,
  stack,
  projects,
  setProjects,
  pushToast
) {

  if (!prompt.trim()) {
    pushToast(
      "Project prompt cannot be empty",
      "error"
    );

    return;
  }

  const newProject = {
    _id: Date.now().toString(),

    title:
      prompt.split(" ").slice(0, 4).join(" ") ||
      "Untitled Project",

    prompt,
    stack: stack || "FastAPI",

    status: "active",

    created_at: new Date().toISOString(),
  };

  const updatedProjects = [
    newProject,
    ...projects,
  ];

  setProjects(updatedProjects);

  localStorage.setItem(
    "nexus_local_projects",
    JSON.stringify(updatedProjects)
  );

  pushToast(
    "Project workspace created successfully",
    "success"
  );

  return newProject;
}

export async function fetchProjectFiles(
  projectId,
  setProjectFiles,
  setOpenedProject,
  setActiveFileTab,
  setEditingFileContent,
  pushToast
) {

  try {

    pushToast(
      "Loading project sandbox files..."
    );

    await new Promise((res) =>
      setTimeout(res, 1200)
    );

    const saved = localStorage.getItem("nexus_local_projects");
    const localProjects = saved ? JSON.parse(saved) : [];
    const proj = localProjects.find((p) => p._id === projectId);
    const chosenStack = proj?.stack || "FastAPI";

    let mockFiles = [];
    if (chosenStack === "MERN") {
      mockFiles = [
        {
          file_name: "architecture.md",
          content: `# Autonomous MERN System Architecture

## 1. Overview
High-performance developer workbench architected by **CodeNexus AI Agents**.
This application integrates a Node/Express backend service layer with a dynamic React layout.

## 2. Database Model
- **Users**: Unique ID, Email, Password Hash, Created At.
- **Notes**: Note ID, User ID, Title, Content, Created At.

## 3. Microservice Infrastructure
- **Express Backend**: Port \`8000\` inside secure Node worker pods.
- **Mongoose / MongoDB**: Database connection client.
- **Frontend App**: SPA mounted on client browser, optimized with Tailwind styling.`,
        },
        {
          file_name: "server.js",
          content: `const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "healthy",
    compliance: "MERN Stack OK",
    nodes: 4
  });
});

app.get("/api/v1/metrics", (req, res) => {
  res.json({
    throughput: "980 MB/s",
    latency: "0.08s",
    active_sessions: 240
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});
`,
        },
        {
          file_name: "db.js",
          content: `const mongoose = require("mongoose");

function connectDB() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mern";
  console.log("MongoDB connected to " + mongoUri);
}

module.exports = { connectDB };
`,
        },
        {
          file_name: "authMiddleware.js",
          content: `module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Invalid token header" });
  }
  next();
};
`,
        },
        {
          file_name: "package.json",
          content: `{
  "name": "mern-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.19.2",
    "mongoose": "^8.4.0",
    "cors": "^2.8.5"
  }
}
`,
        },
        {
          file_name: "App.jsx",
          content: `import React, { useState } from "react";
import { FiZap, FiCheck, FiTerminal } from "react-icons/fi";

export default function SaaSPreview() {
  const [active, setActive] = useState(true);

  return (
    <div className="min-h-screen bg-[#080a0f] text-white flex flex-col p-8 font-sans">
      <header className="flex justify-between items-center pb-6 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-wider text-brand-gold">MERN App Console</h1>
        <span className="px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full text-xs text-brand-green uppercase font-mono font-bold flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 bg-brand-green rounded-full" /> Sandbox Active
        </span>
      </header>
      <main className="flex-1 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/[0.01] border border-white/[0.04] p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-blue"><FiZap /> System Health</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-brand-muted">Gateway Endpoint</span><span className="font-mono text-xs">/api/v1/health</span></div>
            <div className="flex justify-between text-sm"><span className="text-brand-muted">Latency Status</span><span className="text-brand-green font-semibold">0.08s (Optimal)</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
`,
        },
      ];
    } else {
      mockFiles = [
        {
          file_name: "architecture.md",
          content: `# Autonomous System Architecture

## 1. Overview
High-performance developer workbench architected by **CodeNexus AI Agents**.
This application integrates a Python FastAPI service layer with a dynamic React layout.

## 2. Database Model
- **Users**: Unique ID, Email, Password Hash, Created At.
- **Audits**: Audit ID, Source Code Hash, Vulnerabilities found, Quality Index.

## 3. Microservice Infrastructure
- **FastAPI Core**: Port \`8000\` inside secure worker pods.
- **Uvicorn Daemon**: Asynchronous gateway loop.
- **Frontend App**: SPA mounted on client browser, optimized with Tailwind styling.`,
        },
        {
          file_name: "main.py",
          content: `from fastapi import FastAPI, Depends
from auth import verify_jwt
from database import get_db

app = FastAPI(title="CodeNexus Core API")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "compliance": "SOC2 Verified",
        "nodes": 6
    }

@app.get("/api/v1/metrics", dependencies=[Depends(verify_jwt)])
def get_system_metrics():
    return {
        "throughput": "1.2 GB/s",
        "latency": "0.10s",
        "active_sessions": 482
    }
`,
        },
        {
          file_name: "database.py",
          content: `import os
from pymongo import MongoClient

def get_db():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri)
    return client.codenexus_production
`,
        },
        {
          file_name: "auth.py",
          content: `from fastapi import Header, HTTPException

def verify_jwt(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    
    token = authorization.split(" ")[1]
    if not token.startswith("mock_jwt"):
        raise HTTPException(status_code=403, detail="Signature verification failed")
    
    return {"user": "architect", "role": "admin"}
`,
        },
        {
          file_name: "requirements.txt",
          content: `fastapi>=0.136.0
uvicorn>=0.47.0
pymongo>=4.17.0
python-jose>=3.5.0
`,
        },
        {
          file_name: "App.jsx",
          content: `import React, { useState } from "react";
import { FiZap, FiCheck, FiTerminal } from "react-icons/fi";

export default function SaaSPreview() {
  const [active, setActive] = useState(true);

  return (
    <div className="min-h-screen bg-[#080a0f] text-white flex flex-col p-8 font-sans">
      <header className="flex justify-between items-center pb-6 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-wider text-brand-gold">Generated App Console</h1>
        <span className="px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full text-xs text-brand-green uppercase font-mono font-bold flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 bg-brand-green rounded-full" /> Sandbox Active
        </span>
      </header>
      <main className="flex-1 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/[0.01] border border-white/[0.04] p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-blue"><FiZap /> System Health</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-brand-muted">Gateway Endpoint</span><span className="font-mono text-xs">/api/v1/health</span></div>
            <div className="flex justify-between text-sm"><span className="text-brand-muted">Latency Status</span><span className="text-brand-green font-semibold">0.10s (Optimal)</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
`,
        },
        {
          file_name: "package.json",
          content: `{
  "name": "nexus-saas-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
`,
        },
      ];
    }

    setProjectFiles((prev) => ({
      ...prev,
      [projectId]: mockFiles,
    }));

    setOpenedProject(projectId);

    setActiveFileTab(
      mockFiles[0].file_name
    );

    setEditingFileContent(
      mockFiles[0].content
    );

    pushToast(
      "Sandbox files mounted",
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Failed to fetch project files",
      "error"
    );
  }
}

export async function saveProjectFile(
  openedProject,
  activeFileTab,
  editingFileContent,
  setProjectFiles,
  setIsEditingFile,
  pushToast
) {

  try {

    setProjectFiles((prev) => {

      const updated =
        prev[openedProject].map((file) => {

          if (
            file.file_name === activeFileTab
          ) {
            return {
              ...file,
              content: editingFileContent,
            };
          }

          return file;
        });

      return {
        ...prev,
        [openedProject]: updated,
      };
    });

    setIsEditingFile(false);

    pushToast(
      `${activeFileTab} saved successfully`,
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Failed to save file",
      "error"
    );
  }
}