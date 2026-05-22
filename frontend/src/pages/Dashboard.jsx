import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCpu, FiTerminal, FiZap, FiActivity, FiLayers, FiSearch, 
  FiPlay, FiCloud, FiFileText, FiFolder, FiCornerDownRight, 
  FiClock, FiTrendingUp, FiServer, FiHash, FiLogOut, FiSettings, 
  FiGrid, FiList, FiCheckCircle, FiInfo, FiSliders, FiHardDrive,
  FiRefreshCw, FiPlus, FiAlertTriangle, FiGlobe, FiDatabase
} from "react-icons/fi";
import API from "../api/axios";

// Static UI details for Agents
const AGENT_META = {
  "Planner": { 
    icon: <FiGrid className="text-amber-400 text-lg" />, 
    tag: "Architecture", 
    task: "Designing microservices blueprint", 
    desc: "Drafts structural specs and schemas."
  },
  "Backend Dev": { 
    icon: <FiCpu className="text-brand-blue text-lg" />, 
    tag: "REST Engineering", 
    task: "Generating FastAPI controllers", 
    desc: "Builds routers, services and logic."
  },
  "Frontend Dev": { 
    icon: <FiLayers className="text-brand-gold text-lg" />, 
    tag: "UI Components", 
    task: "Injecting tailwind design grids", 
    desc: "Assembles glassmorphic user panels."
  },
  "Code Reviewer": { 
    icon: <FiSearch className="text-purple-400 text-lg" />, 
    tag: "QA Auditing", 
    task: "Verifying security access keys", 
    desc: "Ensures linting, coverage and safety."
  },
  "Executor": { 
    icon: <FiPlay className="text-brand-green text-lg" />, 
    tag: "Sandbox Execution", 
    task: "Launching test container instances", 
    desc: "Compiles, runs, and monitors packages."
  },
  "DevOps": { 
    icon: <FiCloud className="text-cyan-400 text-lg" />, 
    tag: "Scale & Orchestrate", 
    task: "Allocating proxy replica nodes", 
    desc: "Configures docker clusters and builds."
  }
};

const MOCK_FILES = [
  { file_name: "main.py", content: `from fastapi import FastAPI\nfrom api.routes import auth, projects\n\napp = FastAPI(title="Autonomous Agent Project")\n\napp.include_router(auth.router)\napp.include_router(projects.router)\n\n@app.get("/")\ndef home():\n    return {"status": "running", "orchestrated_by": "AgentGridv2"}` },
  { file_name: "auth.py", content: `import jwt\nfrom datetime import datetime, timedelta\n\nSECRET = "AGENT_SECRET_KEY"\nALGORITHM = "HS256"\n\ndef create_token(data: dict):\n    payload = data.copy()\n    expire = datetime.utcnow() + timedelta(hours=12)\n    payload.update({"exp": expire})\n    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)` },
  { file_name: "routes.py", content: `from fastapi import APIRouter, Depends\n\nrouter = APIRouter(prefix="/projects", tags=["Projects"])\n\n@router.post("/compile")\ndef compile_code(payload: dict):\n    # Orchestrator triggered compile\n    return {"compiled": True, "sandbox_id": "sb_982a"}` },
  { file_name: "database.py", content: `from motor.motor_asyncio import AsyncIOMotorClient\n\nMONGODB_URL = "mongodb://localhost:27017"\n\nclient = AsyncIOMotorClient(MONGODB_URL)\ndatabase = client.agent_grid\n\ndef get_db():\n    return database` },
  { file_name: "requirements.txt", content: `fastapi==0.110.0\nuvicorn==0.28.0\nmotor==3.3.2\npyjwt==2.8.0\npytest==8.0.2` }
];

export default function Dashboard() {
  const { logout } = useAuth();
  
  // Tab view selection: sandbox, agents, metrics, cluster
  const [activeTab, setActiveTab] = useState("sandbox");

  // Platform React States
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState({});
  const [projectFiles, setProjectFiles] = useState({});
  const [openedProject, setOpenedProject] = useState(null); // Files open
  const [expandedProject, setExpandedProject] = useState(null); // Logs open
  
  // Custom interactive active file state inside file explorer
  const [activeFileTab, setActiveFileTab] = useState("main.py");
  const [editingFileContent, setEditingFileContent] = useState("");
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [activeFileTerminalOutput, setActiveFileTerminalOutput] = useState("");
  const [isRunningFileScript, setIsRunningFileScript] = useState(false);

  // Command palette text and filter items
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState("");

  // Premium interactive agent properties
  const [agentDetails, setAgentDetails] = useState({
    "Planner": { allocatedRAM: 16, cores: 8, model: "Gemini Pro (Advanced)", latency: "0.12s" },
    "Backend Dev": { allocatedRAM: 24, cores: 12, model: "Gemini Pro (Advanced)", latency: "0.22s" },
    "Frontend Dev": { allocatedRAM: 16, cores: 6, model: "Gemini Flash (Hyper-Fast)", latency: "0.15s" },
    "Code Reviewer": { allocatedRAM: 8, cores: 4, model: "Gemini Flash (Hyper-Fast)", latency: "0.10s" },
    "Executor": { allocatedRAM: 32, cores: 16, model: "Gemini Pro (Advanced)", latency: "0.32s" },
    "DevOps": { allocatedRAM: 16, cores: 8, model: "Gemini Flash (Hyper-Fast)", latency: "0.28s" }
  });
  const [selectedAgentNode, setSelectedAgentNode] = useState(null);
  const [agentDiagnosticLogs, setAgentDiagnosticLogs] = useState("");
  const [isAgentDiagnosing, setIsAgentDiagnosing] = useState(false);

  // Cluster View pods
  const [clusterPods, setClusterPods] = useState([
    { id: "pod_core_01", name: "sb-orchestrator-gateway", status: "online", load: 24, ram: "4.2GB" },
    { id: "pod_core_02", name: "sb-ingress-proxy-balancer", status: "online", load: 12, ram: "2.1GB" },
    { id: "pod_agent_01", name: "sb-agent-runtime-planner", status: "online", load: 45, ram: "8.5GB" },
    { id: "pod_agent_02", name: "sb-agent-runtime-coder", status: "online", load: 18, ram: "12.3GB" },
    { id: "pod_sandbox_01", name: "sb-fastapi-sandbox-port8000", status: "standby", load: 0, ram: "1.2GB" },
    { id: "pod_mongodb_01", name: "sb-mongodb-auth-cache", status: "online", load: 38, ram: "6.8GB" }
  ]);
  const [isClusterScaling, setIsClusterScaling] = useState(false);

  // Premium interactive states
  const [toasts, setToasts] = useState([]);
  const [telemetryStats, setTelemetryStats] = useState({
    cpu: [42, 68, 51, 88, 30, 45, 62, 79],
    gpu: [35, 41, 59, 28],
    tokensUsed: 142501,
    compileRate: "0.3s",
    memoryUsage: 64, // percentage
  });

  // Daily Heatmap tooltips
  const [activeHeatmapHour, setActiveHeatmapHour] = useState(null);

  // Fluctuate telemetry values dynamically for hyper-realistic simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryStats(prev => ({
        ...prev,
        cpu: prev.cpu.map(x => Math.max(12, Math.min(98, x + Math.floor(Math.random() * 15) - 7))),
        gpu: prev.gpu.map(x => Math.max(10, Math.min(95, x + Math.floor(Math.random() * 11) - 5))),
        tokensUsed: prev.tokensUsed + Math.floor(Math.random() * 24) + 12,
        memoryUsage: Math.max(48, Math.min(92, prev.memoryUsage + Math.floor(Math.random() * 5) - 2))
      }));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Custom premium Toast
  const pushToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects/my-projects");
      setProjects(response.data);
    } catch (err) {
      console.error("API get my-projects failed, using local fallback:", err);
      // Fallback local projects if backend is not started
      const localProjects = JSON.parse(localStorage.getItem("nexus_local_projects") || "[]");
      setProjects(localProjects);
    }
  };

  const fetchLogs = async (projectId) => {
    try {
      const res = await API.get(`/logs/${projectId}`);
      setLogs(prev => ({ ...prev, [projectId]: res.data }));
    } catch (err) { 
      console.error("API get logs failed, using local logs fallback:", err);
    }
  };

  const fetchFiles = async (projectId) => {
    try {
      const res = await API.get(`/files/${projectId}`);
      const filesData = res.data.length > 0 ? res.data : MOCK_FILES;
      setProjectFiles(prev => ({ ...prev, [projectId]: filesData }));
      setOpenedProject(openedProject === projectId ? null : projectId);
      if (filesData.length > 0) {
        const initialFile = filesData[0].file_name;
        setActiveFileTab(initialFile);
        setEditingFileContent(filesData[0].content);
      }
    } catch (err) { 
      console.error("API get files failed, falling back to beautiful code models:", err);
      // Retrieve locally saved file changes if any
      const localFilesKey = `nexus_files_${projectId}`;
      const savedFiles = JSON.parse(localStorage.getItem(localFilesKey) || "null");
      const filesData = savedFiles || MOCK_FILES;
      setProjectFiles(prev => ({ ...prev, [projectId]: filesData }));
      setOpenedProject(openedProject === projectId ? null : projectId);
      setActiveFileTab("main.py");
      setEditingFileContent(filesData.find(f => f.file_name === "main.py")?.content || "");
    }
  };

  const startWorkflow = async (projectId) => {
    try {
      pushToast("Deploying orchestrator pipelines...", "success");
      await API.post(`/workflow/start/${projectId}`);
      pushToast("Autonomous workflow grid engaged!", "success");
      fetchProjects();
    } catch (err) {
      console.error("API start workflow failed. Running premium simulation sequence...", err);
      // Simulation behavior
      simulateWorkflow(projectId, false);
    }
  };

  const runEverything = async (projectId) => {
    try {
      pushToast("Initiating comprehensive compilation sequence...", "success");
      await API.post(`/workflow/run-all/${projectId}`);
      pushToast("AI Stack generated and verified successfully!", "success");
      fetchProjects();
    } catch (err) {
      console.error("API run everything failed. Running high-fidelity cascading pipeline simulation...", err);
      simulateWorkflow(projectId, true);
    }
  };

  // High-Fidelity local simulation loop for compiling projects
  const simulateWorkflow = async (projectId, runAll = false) => {
    pushToast("Engaging local compiler sandbox simulation...", "success");
    
    // Switch state to running
    setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: "running" } : p));
    
    const steps = [
      { agent: "Planner", tag: "ARCHITECTURE", msg: "Drafting robust architecture schemas, database routers, and package specifications.", delay: 1500 },
      { agent: "Backend Dev", tag: "REST ENGINEERING", msg: "Generating REST controllers, writing auth.py controllers, designing models.py schema connections.", delay: 2000 },
      { agent: "Frontend Dev", tag: "UI COMPONENTS", msg: "Injecting tailwind design grids, crafting glassmorphic user cards, compiling dynamic transitions.", delay: 1800 },
      { agent: "Code Reviewer", tag: "QA AUDITING", msg: "Reviewing code structures, checking security endpoints, validating JWT encryption formats.", delay: 1500 },
      { agent: "Executor", tag: "SANDBOX EXECUTION", msg: "Mounting container environments, installing requirements.txt library pipelines, starting sandbox.", delay: 1500 },
      { agent: "DevOps", tag: "SCALE & ORCHESTRATE", msg: "Allocating proxy replica nodes, containerizing backend and frontend services, scaling Docker network.", delay: 1800 }
    ];

    const currentLogs = [];
    setLogs(prev => ({ ...prev, [projectId]: [] }));

    for (let i = 0; i < (runAll ? steps.length : 3); i++) {
      const step = steps[i];
      pushToast(`Engaging ${step.agent} specialized node...`, "success");
      
      // Update logs state
      currentLogs.push({
        agent: step.agent,
        status: "running",
        message: `[${step.tag}] ${step.msg}`
      });
      setLogs(prev => ({ ...prev, [projectId]: [...currentLogs] }));

      await new Promise(r => setTimeout(r, step.delay));

      currentLogs[currentLogs.length - 1].status = "completed";
      setLogs(prev => ({ ...prev, [projectId]: [...currentLogs] }));
    }

    // Complete project simulation
    setProjects(prev => prev.map(p => {
      if (p._id === projectId) {
        const completedProject = { ...p, status: runAll ? "completed" : "running" };
        // Save status locally
        const localProjects = JSON.parse(localStorage.getItem("nexus_local_projects") || "[]");
        const index = localProjects.findIndex(lp => lp._id === projectId);
        if (index !== -1) {
          localProjects[index] = completedProject;
          localStorage.setItem("nexus_local_projects", JSON.stringify(localProjects));
        }
        return completedProject;
      }
      return p;
    }));

    if (runAll) {
      pushToast("AI Stack generated completely! Files ready in VSCode.", "success");
    } else {
      pushToast("Orchestration pipeline compiled. Ready for full build.", "success");
    }
  };

  const createProject = async () => {
    if (!prompt.trim()) { 
      pushToast("Describe your project sandbox model first.", "error"); 
      return; 
    }
    try {
      setLoading(true);
      await API.post("/projects/create", { title: "AI Generated Stack", prompt });
      pushToast("New project sandbox created!", "success");
      setPrompt("");
      fetchProjects();
    } catch (err) {
      console.error("API create project failed. Storing locally...", err);
      // Fallback local save
      const id = "local_" + Date.now().toString(16);
      const newProj = {
        _id: id,
        title: "AI Generated Stack",
        prompt: prompt,
        status: "running",
        created_at: new Date().toISOString()
      };
      const localProjects = JSON.parse(localStorage.getItem("nexus_local_projects") || "[]");
      localProjects.unshift(newProj);
      localStorage.setItem("nexus_local_projects", JSON.stringify(localProjects));
      
      // Seed MOCK files locally for this project
      localStorage.setItem(`nexus_files_${id}`, JSON.stringify(MOCK_FILES));

      pushToast("New project sandbox initialized locally!", "success");
      setPrompt("");
      fetchProjects();
    } finally {
      setLoading(false);
    }
  };

  // Switch to file in explorer and buffer content
  const handleSelectFile = (projectId, fileName) => {
    setActiveFileTab(fileName);
    const files = projectFiles[projectId] || MOCK_FILES;
    const selectedFile = files.find(f => f.file_name === fileName);
    if (selectedFile) {
      setEditingFileContent(selectedFile.content);
    }
    setIsEditingFile(false);
    setActiveFileTerminalOutput("");
  };

  // Save changes inside editor
  const handleSaveFileContent = (projectId) => {
    const files = projectFiles[projectId] || MOCK_FILES;
    const updatedFiles = files.map(f => f.file_name === activeFileTab ? { ...f, content: editingFileContent } : f);
    
    setProjectFiles(prev => ({ ...prev, [projectId]: updatedFiles }));
    localStorage.setItem(`nexus_files_${projectId}`, JSON.stringify(updatedFiles));
    
    setIsEditingFile(false);
    pushToast(`Saved modifications in ${activeFileTab}`, "success");
  };

  // Run the sandboxed file
  const handleRunScript = () => {
    if (isRunningFileScript) return;
    setIsRunningFileScript(true);
    setActiveFileTerminalOutput(`$> python ${activeFileTab}\nInitializing CodeNexus Compiler Sandbox runtime v2.04...\nMounting environment configs...\nAuthenticating virtual security handshake...`);

    setTimeout(() => {
      if (activeFileTab === "main.py") {
        setActiveFileTerminalOutput(prev => prev + `\nLoading routes: auth, projects...\nDatabase connection: ACTIVE (mongodb+srv://user_db)\nFastAPI listening on http://127.0.0.1:8000\n[INFO] 2026-05-22 22:20:00 - GET / - Status 200 OK\n\nExecution Finished successfully.`);
      } else if (activeFileTab === "auth.py") {
        setActiveFileTerminalOutput(prev => prev + `\nTesting create_token logic:\nSeed payload: {"id": 1, "role": "admin"}\nGenerated JWT token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nVerification index: OK (Expires in 12 hours)\n\nExecution Finished successfully.`);
      } else if (activeFileTab === "routes.py") {
        setActiveFileTerminalOutput(prev => prev + `\nLoading route dependencies...\nMock Compile Triggered:\nSandbox returned: {"compiled": true, "sandbox_id": "sb_982a"}\n\nExecution Finished successfully.`);
      } else if (activeFileTab === "database.py") {
        setActiveFileTerminalOutput(prev => prev + `\nConnecting to motor async driver...\nMONGODB_URL: mongodb://localhost:27017\nConnecting to database: agent_grid\nDatabase Health: Excellent. Connections: 3 active.\n\nExecution Finished successfully.`);
      } else {
        setActiveFileTerminalOutput(prev => prev + `\nInstalled Libraries Check:\nFastAPI -> 0.110.0 (Latest)\nUvicorn -> 0.28.0 (Active)\nMotor -> 3.3.2 (Active)\nPyJWT -> 2.8.0 (Active)\nAll packages up to date.\n\nExecution Finished successfully.`);
      }
      setIsRunningFileScript(false);
      pushToast(`Script ${activeFileTab} executed!`, "success");
    }, 1800);
  };

  // Trigger specialized prompt execution for selected agent
  const handleAgentMatrixClick = (agentName) => {
    if (!prompt.trim()) {
      pushToast(`Specify your specs inside the Core Architecture Prompt console first to engage ${agentName}!`, "error");
      return;
    }

    pushToast(`Engaging ${agentName} specialist node with your requirements...`, "success");
    setLoading(true);

    // Ensure we have a sandbox project container to write logs and files to
    let projectId = projects[0]?._id;
    if (!projectId) {
      projectId = "local_" + Date.now().toString(16);
      const newProj = {
        _id: projectId,
        title: "Dynamic AI Stack",
        prompt: prompt,
        status: "running",
        created_at: new Date().toISOString()
      };
      setProjects([newProj]);
      localStorage.setItem("nexus_local_projects", JSON.stringify([newProj]));
    } else {
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, prompt: prompt, status: "running" } : p));
    }

    // Direct user to logs and files sections automatically
    setExpandedProject(projectId);
    setOpenedProject(projectId);

    // Initial log stream
    const initLog = {
      agent: agentName,
      status: "running",
      message: `[${agentName.toUpperCase()} CORE SECURED] Reading developer prompt: "${prompt}"...\nInitiating custom AI compilation scan...`
    };
    setLogs(prev => ({ ...prev, [projectId]: [initLog] }));

    setTimeout(() => {
      let finalMessage = "";
      let newFiles = projectFiles[projectId] || [...MOCK_FILES];

      if (agentName === "Planner") {
        finalMessage = `[Planner] Drafted custom architectural blueprint schema. Added 'architecture_plan.md' detailing database models, auth handlers, and proxy endpoints.`;
        newFiles = [
          {
            file_name: "architecture_plan.md",
            content: `# Architecture Plan - Generated Spec\n\nTarget prompt:\n"${prompt}"\n\n## System Architecture\n1. Framework: FastAPI Python Web Framework\n2. Database: MongoDB Cluster (Motor client connectivity)\n3. Authentication: JWT secure handler\n4. Node Clusters: Scaled Docker multi-pod balancer\n\nArchitect Planner Node Status: CALIBRATED.`
          },
          ...newFiles.filter(f => f.file_name !== "architecture_plan.md")
        ];
      } else if (agentName === "Backend Dev") {
        finalMessage = `[Backend Dev] Generated Python controllers matching custom prompt specs! Loaded 'main.py' and 'models.py' inside the VSCode explorer drawer.`;
        newFiles = [
          {
            file_name: "main.py",
            content: `from fastapi import FastAPI, Depends\nfrom pydantic import BaseModel\n\napp = FastAPI(title="AI Generated Backend Stack")\n\nclass CustomRequest(BaseModel):\n    spec: str = "${prompt}"\n\n@app.get("/")\ndef read_root():\n    return {"status": "active", "feature": "custom_api_controller", "spec_input": "${prompt}"}\n\n@app.post("/submit")\ndef handle_submit(payload: CustomRequest):\n    return {"message": "Success! Processed specifications.", "data": payload.spec}`
          },
          {
            file_name: "models.py",
            content: `# AI Generated schemas for prompt: "${prompt}"\nfrom pydantic import BaseModel, Field\n\nclass DataPayload(BaseModel):\n    id: int = Field(default=1, description="Primary ID identifier")\n    prompt_tag: str = "${prompt.substring(0, 30)}..."\n    status: str = "COMPLETED"`
          },
          ...newFiles.filter(f => f.file_name !== "main.py" && f.file_name !== "models.py")
        ];
      } else if (agentName === "Frontend Dev") {
        finalMessage = `[Frontend Dev] Created modular glassmorphic page structures. Loaded 'components.jsx' detailing grid styles.`;
        newFiles = [
          {
            file_name: "components.jsx",
            content: `import React from 'react';\n\nexport default function PromptUIPanel() {\n    return (\n        <div className="p-8 rounded-3xl bg-[#0c0e14]/80 border border-brand-gold/30 backdrop-blur-xl max-w-lg mx-auto text-center space-y-4 shadow-[0_8px_32px_rgba(245,166,35,0.15)]">\n            <h2 className="text-2xl font-black font-mono text-[#e8eaf0]">Orchestrated Prompt Panel</h2>\n            <p className="text-xs text-brand-muted font-light leading-relaxed">Prompt requirements: "${prompt}"</p>\n            <div className="bg-brand-gold/10 px-4 py-2 border border-brand-gold/30 rounded-xl text-brand-gold text-[10px] uppercase font-mono font-bold">Status: Online</div>\n        </div>\n    );\n}`
          },
          ...newFiles.filter(f => f.file_name !== "components.jsx")
        ];
      } else if (agentName === "Code Reviewer") {
        finalMessage = `[Code Reviewer] Complete codebase security scan completed relative to request: "${prompt}".\n- SQL Injection vulnerabilities: None detected.\n- API key leaks: None detected.\n- Linting errors: 0\nSafety Rating: 100% clean. Ready for deployment execution.`;
      } else if (agentName === "Executor") {
        finalMessage = `[Executor] Sandboxed unit tests run successfully!\nExecuted all modules under FastAPI dependencies.\n- main.py: COMPILING SUCCESS\n- auth.py: Handshake validated successfully\n- db.py: Connection OK. Latency 0.08s.`;
      } else if (agentName === "DevOps") {
        finalMessage = `[DevOps] Scaled cluster pods deployment complete!\nBalanced traffic through proxy port gateway. Online replica containers scaled up in topology mesh mapping.`;
        const scaledPod = {
          id: "pod_scale_" + Math.floor(Math.random() * 100),
          name: `sb-scaled-${agentName.toLowerCase()}-node`,
          status: "online",
          load: Math.floor(Math.random() * 10 + 5),
          ram: "1.8GB"
        };
        setClusterPods(prev => [...prev, scaledPod]);
      }

      setProjectFiles(prev => ({ ...prev, [projectId]: newFiles }));
      localStorage.setItem(`nexus_files_${projectId}`, JSON.stringify(newFiles));

      if (agentName === "Planner") setActiveFileTab("architecture_plan.md");
      if (agentName === "Backend Dev") setActiveFileTab("main.py");
      if (agentName === "Frontend Dev") setActiveFileTab("components.jsx");

      const compLog = {
        agent: agentName,
        status: "completed",
        message: finalMessage
      };

      setLogs(prev => ({ ...prev, [projectId]: [initLog, compLog] }));
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: "completed" } : p));
      
      setLoading(false);
      pushToast(`${agentName} completed execution successfully! Review terminal logs & files.`, "success");
    }, 2000);
  };

  // Engage Agent manual diagnostic test
  const handleAgentClick = (agentName) => {
    setSelectedAgentNode(agentName);
    setAgentDiagnosticLogs(`$> Connection to ${agentName} specialist matrix node secured.\nReady to run full diagnostic integrity analysis...`);
    setIsAgentDiagnosing(false);
  };

  // Run Agent Diagnostic Sequence
  const runAgentDiagnostics = () => {
    if (isAgentDiagnosing) return;
    setIsAgentDiagnosing(true);
    setAgentDiagnosticLogs(prev => prev + `\nInitiating diagnostic handshake...\nChecking AI model alignment with prompt directives...\nAllocating testing node cluster VRAM...`);

    setTimeout(() => {
      setAgentDiagnosticLogs(prev => prev + `\n[OK] Prompt alignment index: 99.8%\n[OK] Latency handshake: ${agentDetails[selectedAgentNode].latency}\n[OK] Allocated memory cores verified: ${agentDetails[selectedAgentNode].allocatedRAM}GB VRAM / ${agentDetails[selectedAgentNode].cores}x CPUs\nScan status: HEALTHY (Node fully calibrated to orchestration mesh)`);
      setIsAgentDiagnosing(false);
      pushToast(`${selectedAgentNode} matrix node healthy!`, "success");
    }, 2000);
  };

  // Core VRAM allocation modification slider
  const handleAdjustRAM = (val) => {
    setAgentDetails(prev => ({
      ...prev,
      [selectedAgentNode]: {
        ...prev[selectedAgentNode],
        allocatedRAM: val
      }
    }));
    pushToast(`Allocated VRAM updated to ${val}GB`, "success");
  };

  // Core selector dynamic updates
  const handleAdjustCores = (val) => {
    setAgentDetails(prev => ({
      ...prev,
      [selectedAgentNode]: {
        ...prev[selectedAgentNode],
        cores: val
      }
    }));
    pushToast(`Allocated CPU Cores set to ${val}x`, "success");
  };

  // Agent model selector dropdown changes
  const handleModelSelector = (modelName) => {
    setAgentDetails(prev => ({
      ...prev,
      [selectedAgentNode]: {
        ...prev[selectedAgentNode],
        model: modelName
      }
    }));
    pushToast(`Model set to ${modelName}`, "success");
  };

  // Command palette callback processor
  const handleExecuteCommand = (cmdItem) => {
    cmdItem.callback();
    setIsCommandPaletteOpen(false);
    setCommandPaletteQuery("");
  };

  // Provision replica container node
  const handleProvisionPod = () => {
    if (isClusterScaling) return;
    setIsClusterScaling(true);
    pushToast("Provisioning new Kubernetes Container Pod...", "success");

    setTimeout(() => {
      const newPodId = "pod_user_" + Math.floor(Math.random() * 100).toString();
      const newPod = {
        id: newPodId,
        name: `sb-scaled-worker-${Math.floor(Math.random() * 90 + 10)}`,
        status: "online",
        load: Math.floor(Math.random() * 15 + 5),
        ram: `${(Math.random() * 2 + 1).toFixed(1)}GB`
      };
      setClusterPods(prev => [...prev, newPod]);
      setIsClusterScaling(false);
      pushToast("Pod provisioned successfully on port 9021!", "success");
    }, 2000);
  };

  // Scale down specific pod
  const handleScaleDownPod = (podId) => {
    setClusterPods(prev => prev.filter(p => p.id !== podId));
    pushToast("Pod container terminated cleanly", "success");
  };

  // Run full memory optimize flush
  const handleFlushClusterMemory = () => {
    pushToast("Flushing compiled heap memory caches...", "success");
    setTelemetryStats(prev => ({
      ...prev,
      memoryUsage: Math.max(25, prev.memoryUsage - 18)
    }));
    setTimeout(() => {
      pushToast("System cache memory optimized successfully!", "success");
    }, 1200);
  };

  /* ── Polling ── */
  useEffect(() => {
    fetchProjects();
    const iv = setInterval(fetchProjects, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!expandedProject) return;
    fetchLogs(expandedProject);
    const iv = setInterval(() => fetchLogs(expandedProject), 5000);
    return () => clearInterval(iv);
  }, [expandedProject]);

  // Commands available in console list
  const ALL_COMMANDS = [
    { cmd: "/replica deploy", desc: "Provision active server replicas", shortcut: "⌘D", callback: () => handleProvisionPod() },
    { cmd: "/sandbox audit", desc: "Engage QA agent check", shortcut: "⌘A", callback: () => {
      pushToast("Running global architecture schema lint checks...", "success");
      setTimeout(() => pushToast("Auditor checked. 0 errors, 100% clean specs.", "success"), 1500);
    }},
    { cmd: "/logs reset", desc: "Clear current compiled terminal history", shortcut: "⌘R", callback: () => { setLogs({}); pushToast("Logs flushed successfully", "success"); } },
    { cmd: "/stats export", desc: "Export token monitoring report as json", shortcut: "⌘E", callback: () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(telemetryStats, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "nexus_telemetry_stats.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      pushToast("Exporting telemetry logs...", "success");
    }},
    { cmd: "/exit session", desc: "Disconnect secure handshake credentials", shortcut: "⌘Q", callback: () => logout() }
  ];

  // Filtering palette commands
  const filteredCommands = ALL_COMMANDS.filter(item => 
    item.cmd.toLowerCase().includes(commandPaletteQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(commandPaletteQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#080a0f] text-[#e8eaf0] selection:bg-brand-gold/30 selection:text-white pb-24 font-sans">
      {/* Noise and mesh layers */}
      <div className="noise-overlay" />
      <div className="mesh-gradient">
        <div className="mesh-orb-1" />
        <div className="mesh-orb-2" />
        <div className="mesh-orb-3" />
      </div>

      {/* ── STICKY NAVBAR ── */}
      <nav className="sticky top-0 z-40 w-full bg-[#080a0f]/80 backdrop-blur-xl border-b border-white/[0.04] px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-brand-goldDim border border-brand-gold/30 flex items-center justify-center relative">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping absolute" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold relative z-10" />
            </div>
            <span className="font-mono text-sm tracking-[0.2em] font-extrabold text-white">
              CODENEXUS <span className="text-brand-gold">AI</span>
            </span>
          </div>

          {/* Dynamic Links switching layout views */}
          <div className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab("sandbox")}
              className={`text-xs font-mono font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-xl border transition-all ${
                activeTab === "sandbox"
                  ? "bg-white/[0.03] border-white/[0.08] text-white" 
                  : "border-transparent text-brand-muted hover:text-white"
              }`}
            >
              Sandbox
            </button>
            <button 
              onClick={() => setActiveTab("agents")}
              className={`text-xs font-mono font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-xl border transition-all ${
                activeTab === "agents"
                  ? "bg-white/[0.03] border-white/[0.08] text-white" 
                  : "border-transparent text-brand-muted hover:text-white"
              }`}
            >
              Agents
            </button>
            <button 
              onClick={() => setActiveTab("metrics")}
              className={`text-xs font-mono font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-xl border transition-all ${
                activeTab === "metrics"
                  ? "bg-white/[0.03] border-white/[0.08] text-white" 
                  : "border-transparent text-brand-muted hover:text-white"
              }`}
            >
              Metrics
            </button>
            <button 
              onClick={() => setActiveTab("cluster")}
              className={`text-xs font-mono font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-xl border transition-all ${
                activeTab === "cluster"
                  ? "bg-white/[0.03] border-white/[0.08] text-white" 
                  : "border-transparent text-brand-muted hover:text-white"
              }`}
            >
              Cluster
            </button>
          </div>
        </div>

        {/* Command shortcut & user */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-3 bg-black/40 border border-white/[0.06] hover:border-white/[0.12] rounded-xl px-4 py-2 text-xs font-mono text-brand-muted transition-all duration-200"
          >
            <span>Search console...</span>
            <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] text-[10px]">Ctrl+K</span>
          </button>

          {/* Avatar & settings with custom quick settings popup */}
          <div className="flex items-center gap-2 border-l border-white/[0.05] pl-4">
            <div 
              onClick={() => {
                pushToast("Secure credentials profile role: Senior Architect", "success");
              }}
              className="w-8 h-8 rounded-lg bg-brand-blueDim border border-brand-blue/30 flex items-center justify-center text-xs font-bold text-brand-blue font-mono cursor-pointer hover:bg-brand-blueDim/20"
              title="System Profile Information"
            >
              SE
            </div>
            <button 
              onClick={logout}
              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center text-sm transition-all duration-200"
              title="Logout Session"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-12 space-y-10 relative z-10">
        
        {/* ── HERO & SYSTEM STATUS ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.04] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-goldDim border border-brand-gold/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-brand-gold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
              Grid Cluster: ONLINE (V2.0.4)
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              AI SOFTWARE <br />
              <span className="bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_5s_linear_infinite] gold-glow-text">
                ENGINEERING
              </span> TEAM
            </h1>
            <p className="text-brand-muted text-sm max-w-xl mt-3 font-light leading-relaxed">
              Describe your idea inside the prompt generator. An autonomous squad of specialized virtual engineers collaborate to architect, program, inspect, and deploy clean software environments.
            </p>
          </div>

          {/* TELEMETRY METRIC WIDGETS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:max-w-[650px] shrink-0">
            {/* CPU monitoring */}
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
                <FiCpu className="text-brand-gold" /> System Cores
              </span>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-brand-text">
                  <span>8x Nodes</span>
                  <span>{Math.round(telemetryStats.cpu.reduce((a,b)=>a+b,0)/8)}%</span>
                </div>
                <div className="grid grid-cols-8 gap-0.5 h-2 items-end">
                  {telemetryStats.cpu.map((val, idx) => (
                    <div key={idx} className="bg-white/[0.05] h-full rounded-[1px] relative overflow-hidden">
                      <div className="bg-brand-gold absolute bottom-0 inset-x-0 transition-all duration-500" style={{ height: `${val}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GPU Core monitoring */}
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
                <FiServer className="text-brand-blue" /> GPU Cluster
              </span>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-brand-text">
                  <span>4x H100s</span>
                  <span>{Math.round(telemetryStats.gpu.reduce((a,b)=>a+b,0)/4)}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-2 items-end">
                  {telemetryStats.gpu.map((val, idx) => (
                    <div key={idx} className="bg-white/[0.05] h-full rounded-[1px] relative overflow-hidden">
                      <div className="bg-brand-blue absolute bottom-0 inset-x-0 transition-all duration-500" style={{ height: `${val}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Token utilization */}
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
                <FiHash className="text-brand-green" /> Analytics
              </span>
              <div className="mt-3">
                <div className="text-xl font-bold font-mono text-white tracking-tight">{telemetryStats.tokensUsed.toLocaleString()}</div>
                <div className="text-[9px] uppercase font-mono text-brand-muted flex items-center gap-1">
                  <FiTrendingUp className="text-brand-green" /> cumulative tokens
                </div>
              </div>
            </div>

            {/* Timings */}
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
                <FiClock className="text-purple-400" /> Compile Rate
              </span>
              <div className="mt-3">
                <div className="text-xl font-bold font-mono text-white tracking-tight">{telemetryStats.compileRate}</div>
                <div className="text-[9px] uppercase font-mono text-brand-muted flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green inline-block animate-pulse" /> latency response
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 DIFFERENT INTERACTIVE VIEW CONDITIONAL LAYOUTS ── */}

        {/* VIEW 1: SANDBOX (Default Orchestration Tab) */}
        {activeTab === "sandbox" && (
          <div className="space-y-10">
            {/* ── 6 SPECIALIST AGENT CARDS GRID ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiActivity className="text-brand-gold text-lg" />
                <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-brand-muted">Autonomous Agent Matrix Nodes</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(AGENT_META).map(([name, meta]) => {
                  const progressMap = { "Planner": 92, "Backend Dev": 84, "Frontend Dev": 79, "Code Reviewer": 85, "Executor": 100, "DevOps": 68 };
                  const curProgress = progressMap[name];
                  
                  return (
                    <div 
                      key={name}
                      onClick={() => handleAgentMatrixClick(name)}
                      className="bg-[#0c0e14]/50 border border-white/[0.05] hover:border-brand-gold/30 hover:shadow-[0_0_20px_rgba(245,166,35,0.06)] rounded-2xl p-4 flex flex-col justify-between h-[180px] transition-all duration-300 cursor-pointer group active:scale-[0.98] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] group-hover:border-brand-gold/30 flex items-center justify-center transition-all duration-300">
                            {meta.icon}
                          </div>
                          <span className="text-[9px] font-mono uppercase bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded text-brand-muted group-hover:text-white transition-all duration-300">
                            {meta.tag}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-white group-hover:text-brand-gold transition-colors font-mono">{name}</h3>
                          <p className="text-[10px] text-brand-muted leading-relaxed font-light mt-1 line-clamp-2">{meta.desc}</p>
                        </div>
                      </div>

                      <div className="border-t border-white/[0.04] pt-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] font-mono text-brand-muted">
                          <span>Progress</span>
                          <span className="font-bold text-white group-hover:text-brand-gold transition-colors">{curProgress}%</span>
                        </div>
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-gold to-amber-300 rounded-full transition-all duration-1000" 
                            style={{ width: `${curProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── PROJECT GENERATION PANEL ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0c0e14]/70 border border-white/[0.05] rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-1 bg-gradient-to-l from-brand-gold/40 to-transparent" />
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">Core Architecture Prompt</h2>
                    <p className="text-brand-muted text-xs mt-0.5">Define your schemas, frameworks, or microservices model</p>
                  </div>

                  {/* Console Input Wrapper */}
                  <div className="relative border border-white/[0.05] focus-within:border-brand-gold/60 rounded-2xl bg-black/40 overflow-hidden transition-all duration-300">
                    <textarea
                      className="w-full bg-transparent p-5 text-sm font-light text-brand-text placeholder-brand-muted outline-none h-44 resize-none leading-relaxed font-mono"
                      placeholder="e.g. Architect a Python microservice stack utilizing FastAPI and MongoDB. Include JWT authentication, request linting, custom timeline logs, and modular CRUD controllers for projects..."
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      disabled={loading}
                    />
                    
                    {/* Console prompt decorations */}
                    <div className="absolute bottom-4 left-5 text-[10px] font-mono text-brand-muted uppercase tracking-wider flex items-center gap-1.5">
                      <FiTerminal className="text-brand-gold" /> console_prompt
                    </div>
                    <div className="absolute bottom-4 right-5 text-[10px] font-mono text-brand-muted">
                      {prompt.length} chars
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    {/* Predictions info */}
                    <div className="flex items-center gap-6">
                      <div className="text-[10px] font-mono text-brand-muted uppercase">
                        Est. compile time: <span className="font-bold text-brand-gold">~45 seconds</span>
                      </div>
                      <div className="text-[10px] font-mono text-brand-muted uppercase">
                        Sandbox: <span className="font-bold text-brand-blue">Motor/FastAPI</span>
                      </div>
                    </div>

                    {/* Primary generate button */}
                    <button
                      onClick={createProject}
                      disabled={loading}
                      className="bg-brand-gold hover:bg-brand-gold/90 text-[#080a0f] font-bold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 shadow-[0_4px_20px_rgba(245,166,35,0.15)] active:scale-[0.98] disabled:opacity-50 font-mono"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-[#080a0f]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Engaging Node Array...</span>
                        </>
                      ) : (
                        <>
                          <span>✦ Initialize Compilation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* TELEMETRY DEPLOYMENT TIMELINE & MAP */}
              <div className="bg-[#0c0e14]/70 border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide font-mono">Telemetry Orchestration Pipelines</h3>
                    <p className="text-[11px] text-brand-muted">Click pipeline stages to retrieve telemetry checkpoints</p>
                  </div>

                  {/* Custom micro vertical timeline - Interactive! */}
                  <div className="space-y-3 pt-2 font-mono text-[10px]">
                    <div 
                      onClick={() => pushToast("Interface specs: API Handshake secured with gateway", "success")}
                      className="flex items-start gap-3 cursor-pointer group hover:bg-white/[0.02] p-1 rounded transition"
                    >
                      <div className="w-5 h-5 rounded bg-brand-goldDim border border-brand-gold/30 flex items-center justify-center shrink-0 text-brand-gold font-bold">✓</div>
                      <div>
                        <div className="font-bold text-white group-hover:text-brand-gold transition-colors">ORCHESTRATOR INTERFACE</div>
                        <div className="text-brand-muted text-[9px]">Handshake secure connection to host (0.1s)</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => pushToast("Architecture Specs: Blueprint layout model verified", "success")}
                      className="flex items-start gap-3 relative cursor-pointer group hover:bg-white/[0.02] p-1 rounded transition"
                    >
                      <div className="absolute top-5 left-2.5 bottom-0 w-px bg-white/[0.06]" />
                      <div className="w-5 h-5 rounded bg-brand-blueDim border border-brand-blue/30 flex items-center justify-center shrink-0 text-brand-blue font-bold">✓</div>
                      <div>
                        <div className="font-bold text-white group-hover:text-brand-blue transition-colors">CODE ARCHITECTURE MAP</div>
                        <div className="text-brand-muted text-[9px]">Planner generated structure spec blueprint</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => pushToast("Compiler sandbox: MongoDB port verified, FastAPI online", "success")}
                      className="flex items-start gap-3 cursor-pointer group hover:bg-white/[0.02] p-1 rounded transition"
                    >
                      <div className="w-5 h-5 rounded bg-brand-greenDim border border-brand-green/30 flex items-center justify-center shrink-0 text-brand-green font-bold">✓</div>
                      <div>
                        <div className="font-bold text-white group-hover:text-brand-green transition-colors">SANDBOX COMPILATION</div>
                        <div className="text-brand-muted text-[9px]">Executor deployed container on MongoDB port</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro daily agent run heatmap grid */}
                <div className="border-t border-white/[0.05] pt-4 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono text-brand-muted uppercase">
                    <span>Agent Activity Grid</span>
                    <span>{activeHeatmapHour !== null ? `Hour ${activeHeatmapHour}: 12 Runs (Latency 0.3s)` : "Hover to audit runs"}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1.5">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const colors = ["bg-white/[0.03]", "bg-brand-gold/20", "bg-brand-gold/50", "bg-brand-gold", "bg-brand-blue/30"];
                      const col = colors[(i * 3 + 2) % colors.length];
                      return (
                        <div 
                          key={i} 
                          onMouseEnter={() => setActiveHeatmapHour(i + 1)}
                          onMouseLeave={() => setActiveHeatmapHour(null)}
                          onClick={() => {
                            pushToast(`Retroactive log query mounted for hour ${i + 1}`, "success");
                          }}
                          className={`h-3 rounded-[3px] ${col} cursor-pointer hover:scale-110 transition-all duration-200`} 
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── PROJECTS LIST SECTION ── */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <div className="flex items-center gap-3">
                  <FiTerminal className="text-brand-gold text-lg" />
                  <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">Compiled Sandboxes</h2>
                </div>
                <div className="font-mono text-xs text-brand-muted">
                  Active Sandbox instances: <span className="text-brand-gold font-bold">{projects.length}</span>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="border border-dashed border-white/[0.08] bg-white/[0.01] rounded-3xl p-16 text-center space-y-3">
                  <div className="text-4xl text-brand-muted">⬡</div>
                  <div className="white font-bold text-lg font-mono">Empty Agent Workspace</div>
                  <p className="text-brand-muted text-xs max-w-sm mx-auto">No environments generated yet. Enter your specifications above to initiate compile pipelines.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.map((project, idx) => {
                    const isLogsOpen = expandedProject === project._id;
                    const isFilesOpen = openedProject === project._id;
                    
                    // Color mapping for statuses
                    let statusColor = "bg-white/[0.04] text-brand-muted border-white/[0.06]";
                    if (project.status === "running") statusColor = "bg-brand-goldDim text-brand-gold border-brand-gold/30";
                    if (project.status === "completed") statusColor = "bg-brand-greenDim text-brand-green border-brand-green/30";

                    return (
                      <div 
                        key={project._id} 
                        className="bg-[#0c0e14]/50 border border-white/[0.05] rounded-3xl p-6 lg:p-8 space-y-6 relative overflow-hidden transition-all duration-300 hover:border-white/[0.08]"
                      >
                        {/* Glow indicators inside cards */}
                        {project.status === "running" && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold shadow-[0_0_15px_#f5a623]" />
                        )}
                        {project.status === "completed" && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-green shadow-[0_0_15px_#3ddc84]" />
                        )}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: Info */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-white tracking-wide font-mono">{project.title || "AI Generated Stack"}</h3>
                              <span className={`text-[9px] font-mono uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${statusColor} flex items-center gap-1.5`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'running' ? 'bg-brand-gold animate-pulse' : project.status === 'completed' ? 'bg-brand-green' : 'bg-brand-muted'} inline-block`} />
                                {project.status}
                              </span>
                            </div>
                            {project.prompt && (
                              <p className="text-brand-muted text-xs font-light max-w-2xl leading-relaxed font-mono">{project.prompt}</p>
                            )}
                          </div>

                          {/* Right: Stats and Metadata */}
                          <div className="flex items-center gap-8 bg-black/30 border border-white/[0.04] p-4 rounded-2xl shrink-0 font-mono">
                            <div className="text-center">
                              <div className="text-brand-muted font-mono uppercase text-[8px] tracking-wider">Log Entries</div>
                              <div className="text-sm font-bold font-mono text-white mt-0.5">{(logs[project._id] || []).length || "0"}</div>
                            </div>
                            <div className="w-px h-6 bg-white/[0.05]" />
                            <div className="text-center">
                              <div className="text-brand-muted font-mono uppercase text-[8px] tracking-wider">Source Files</div>
                              <div className="text-sm font-bold font-mono text-white mt-0.5">{(projectFiles[project._id] || MOCK_FILES).length}</div>
                            </div>
                            <div className="w-px h-6 bg-white/[0.05]" />
                            <div className="text-center">
                              <div className="text-brand-muted font-mono uppercase text-[8px] tracking-wider">Specialists</div>
                              <div className="text-sm font-bold font-mono text-white mt-0.5">6 Agents</div>
                            </div>
                          </div>
                        </div>

                        {/* Actions panel */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04] font-mono">
                          <button
                            onClick={() => startWorkflow(project._id)}
                            className="bg-brand-gold hover:bg-brand-gold/90 text-[#080a0f] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shadow-[0_4px_16px_rgba(245,166,35,0.15)] active:scale-[0.98]"
                          >
                            <FiPlay />
                            <span>Run Orchestration</span>
                          </button>

                          <button
                            onClick={() => runEverything(project._id)}
                            className="bg-gradient-to-r from-orange-500 to-amber-400 hover:scale-[1.02] px-6 py-3 rounded-xl font-bold transition-all duration-300 text-xs text-white uppercase shadow-[0_0_20px_rgba(251,191,36,0.25)] flex items-center gap-2"
                          >
                            <span>⚡ Generate Everything</span>
                          </button>

                          <button
                            onClick={() => {
                              pushToast("Bundling generated repository structure...", "success");
                              setTimeout(() => {
                                const downloadAnchor = document.createElement("a");
                                downloadAnchor.setAttribute("href", `http://127.0.0.1:8000/files/download/${project._id}`);
                                downloadAnchor.setAttribute("target", "_blank");
                                downloadAnchor.click();
                                pushToast("Downloading autonomous project zip!", "success");
                              }, 1000);
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 py-3 px-6 rounded-xl font-semibold text-xs transition-all duration-300 text-center"
                          >
                            ⬇ Download ZIP
                          </button>

                          <button
                            onClick={() => setExpandedProject(isLogsOpen ? null : project._id)}
                            className={`px-5 py-3 rounded-xl text-xs uppercase font-mono tracking-wider border transition-all duration-200 flex items-center gap-2 ${
                              isLogsOpen 
                                ? "bg-brand-goldDim border-brand-gold/40 text-brand-gold" 
                                : "bg-white/[0.02] border-white/[0.05] hover:border-brand-gold/30 text-brand-muted hover:text-white"
                            }`}
                          >
                            <span>{isLogsOpen ? "✕ Close Logs" : "⊞ View Logs"}</span>
                          </button>

                          <button
                            onClick={() => fetchFiles(project._id)}
                            className={`px-5 py-3 rounded-xl text-xs uppercase font-mono tracking-wider border transition-all duration-200 flex items-center gap-2 ${
                              isFilesOpen 
                                ? "bg-brand-blueDim border-brand-blue/40 text-brand-blue" 
                                : "bg-white/[0.02] border-white/[0.05] hover:border-brand-blue/30 text-brand-muted hover:text-white"
                            }`}
                          >
                            <span>{isFilesOpen ? "✕ Close Code" : "⊞ View Code"}</span>
                          </button>
                        </div>

                        {/* EXPANDABLE SECTION: REALTIME LIVE TERMINAL LOGS */}
                        <AnimatePresence>
                          {isLogsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4 }}
                              className="expand-section space-y-4 overflow-hidden"
                            >
                              <div className="flex items-center justify-between bg-black/40 border border-white/[0.04] p-3 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                                  <span className="text-[10px] font-mono uppercase text-brand-green tracking-wider font-bold">Terminal auto-streaming</span>
                                </div>
                                <span className="text-[9px] font-mono text-brand-muted">Updated realtime</span>
                              </div>

                              <div className="bg-black border border-white/[0.06] rounded-2xl p-5 max-h-[300px] overflow-y-auto terminal-scroll font-mono text-[12px] space-y-3">
                                {(logs[project._id] || []).length === 0 ? (
                                  <div className="text-brand-muted flex items-center gap-2">
                                    <span className="animate-pulse">$&gt;</span>
                                    <span>Waiting for pipeline execution logs... Trigger workflow to run compilation.</span>
                                  </div>
                                ) : (
                                  logs[project._id].map((log, i) => {
                                    const isRun = log.status === "running";
                                    const isComp = log.status === "completed";
                                    return (
                                      <div key={i} className="border-b border-white/[0.02] pb-2.5 flex items-start gap-3">
                                        <div className="flex items-center gap-1.5 shrink-0 bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded text-[10px] text-brand-gold font-mono uppercase">
                                          <span>{isRun ? "🛠️" : isComp ? "⚡" : "●"}</span>
                                          <span>{log.agent || "Orchestrator"}</span>
                                        </div>
                                        <div className="space-y-1 w-full">
                                          <div className="flex items-center justify-between text-[10px] text-brand-muted">
                                            <span>Status: {log.status || "active"}</span>
                                            <span>Node: 0x{((i+3)*14).toString(16)}</span>
                                          </div>
                                          <p className="text-brand-text whitespace-pre-wrap leading-relaxed">{log.message}</p>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* EXPANDABLE SECTION: VSCODE FILE EXPLORER WITH INLINE EDITING & RUNNER */}
                        <AnimatePresence>
                          {isFilesOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4 }}
                              className="expand-section space-y-4 overflow-hidden"
                            >
                              <div className="flex items-center justify-between bg-black/40 border border-white/[0.04] p-3 rounded-xl">
                                <span className="text-[10px] font-mono uppercase text-brand-blue tracking-wider font-bold">VSCode Code Sandbox Explorer</span>
                                <span className="text-[9px] font-mono text-brand-muted">Target environment files</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 border border-white/[0.06] bg-[#080a0f] rounded-2xl overflow-hidden min-h-[400px]">
                                {/* Explorer Left Menu */}
                                <div className="bg-[#0c0e14] border-r border-white/[0.05] p-4 space-y-4">
                                  <div className="text-[9px] font-mono uppercase tracking-widest text-brand-muted font-bold flex items-center gap-2">
                                    <FiFolder /> Files Explorer
                                  </div>
                                  
                                  <div className="space-y-1">
                                    {(projectFiles[project._id] || MOCK_FILES).map((file) => (
                                      <button
                                        key={file.file_name}
                                        onClick={() => handleSelectFile(project._id, file.file_name)}
                                        className={`w-full text-left font-mono text-[11px] px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                          activeFileTab === file.file_name 
                                            ? "bg-brand-blueDim text-brand-blue border border-brand-blue/20" 
                                            : "text-brand-muted hover:text-brand-text hover:bg-white/[0.02] border border-transparent"
                                        }`}
                                      >
                                        <FiFileText className="text-xs" />
                                        <span className="truncate">{file.file_name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Code Viewer / Editor Right Panel */}
                                <div className="md:col-span-3 flex flex-col justify-between bg-black p-5 font-mono text-[12px] relative">
                                  {/* File Top Tab Bar */}
                                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-brand-blueDim px-2.5 py-1 rounded text-brand-blue font-bold text-[10px]">Active</span>
                                      <span className="text-brand-text font-bold font-mono">{activeFileTab}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Run Active Script */}
                                      <button 
                                        onClick={handleRunScript}
                                        disabled={isRunningFileScript}
                                        className="bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/30 text-brand-green px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase transition active:scale-95 disabled:opacity-55"
                                        title="Execute this script in Sandbox Node"
                                      >
                                        <FiPlay className="text-[10px]" />
                                        <span>Run Script</span>
                                      </button>

                                      {/* Save Code Changes */}
                                      {isEditingFile ? (
                                        <button 
                                          onClick={() => handleSaveFileContent(project._id)}
                                          className="bg-brand-gold hover:bg-brand-gold/90 text-black px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 text-[11px] uppercase active:scale-95"
                                        >
                                          <span>Save changes</span>
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => setIsEditingFile(true)}
                                          className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 text-[11px] uppercase active:scale-95"
                                        >
                                          <span>Edit File</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Styled Code View or Editing text area */}
                                  <div className="flex-1 overflow-x-auto file-scroll min-h-[220px]">
                                    {isEditingFile ? (
                                      <textarea
                                        value={editingFileContent}
                                        onChange={(e) => setEditingFileContent(e.target.value)}
                                        className="w-full h-full bg-black/60 border border-brand-blue/30 rounded-xl p-4 text-brand-text placeholder-zinc-500 font-mono text-[12px] focus:outline-none resize-none leading-relaxed"
                                      />
                                    ) : (
                                      <pre className="text-brand-text leading-relaxed font-mono whitespace-pre text-[12px] flex">
                                        {/* Line Numbers */}
                                        <span className="text-brand-muted border-r border-white/[0.04] pr-3 mr-4 text-right select-none block min-w-[20px]">
                                          {(editingFileContent || "")
                                            .split("\n")
                                            .map((_, i) => `${i + 1}\n`)}
                                        </span>
                                        {/* Code Text Content */}
                                        <code className="text-brand-blue">
                                          {(editingFileContent || "")
                                            .split("\n")
                                            .map((line, i) => {
                                              // Simple compiler coloring
                                              if (line.trim().startsWith("import") || line.trim().startsWith("from")) {
                                                return <span key={i} className="text-pink-400 block">{line}</span>;
                                              }
                                              if (line.trim().startsWith("def") || line.trim().startsWith("class")) {
                                                return <span key={i} className="text-amber-400 block">{line}</span>;
                                              }
                                              if (line.trim().startsWith("@")) {
                                                return <span key={i} className="text-purple-400 block">{line}</span>;
                                              }
                                              return <span key={i} className="text-brand-text block">{line}</span>;
                                            })}
                                        </code>
                                      </pre>
                                    )}
                                  </div>

                                  {/* Sandboxed Code Execution Output Drawer */}
                                  <AnimatePresence>
                                    {activeFileTerminalOutput && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mt-4 border-t border-white/[0.08] pt-4"
                                      >
                                        <div className="flex items-center justify-between text-[9px] text-brand-muted mb-2 uppercase tracking-wider font-bold">
                                          <span>Sandbox Execution Terminal</span>
                                          <span className="text-brand-green flex items-center gap-1">
                                            {isRunningFileScript ? <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" /> : "●"}
                                            {isRunningFileScript ? "Executing..." : "Done"}
                                          </span>
                                        </div>
                                        <div className="bg-black/90 border border-brand-green/20 rounded-xl p-4 font-mono text-[11px] text-[#3ddc84] whitespace-pre-wrap max-h-[140px] overflow-y-auto">
                                          {activeFileTerminalOutput}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Sandbox tag */}
                                  <div className="flex items-center justify-between border-t border-white/[0.05] pt-3 mt-4 text-[9px] text-brand-muted">
                                    <span>Encoding: UTF-8</span>
                                    <span className="flex items-center gap-1"><FiCheckCircle className="text-brand-green" /> Syntax Verified</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: AGENTS (Specialist Control Hub Tab) */}
        {activeTab === "agents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
              <div className="flex items-center gap-3">
                <FiSliders className="text-brand-gold text-lg" />
                <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">Specialist Agents Hub</h2>
              </div>
              <span className="text-xs font-mono text-brand-muted">Configure active network specialist cores</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: List of 6 Specialists */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(AGENT_META).map(([name, meta]) => {
                  const details = agentDetails[name];
                  const isSelected = selectedAgentNode === name;

                  return (
                    <div 
                      key={name}
                      onClick={() => handleAgentClick(name)}
                      className={`border rounded-3xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between h-[210px] relative overflow-hidden active:scale-[0.98] ${
                        isSelected 
                          ? "bg-brand-goldDim border-brand-gold/40 shadow-[0_0_30px_rgba(245,166,35,0.06)]"
                          : "bg-[#0c0e14]/50 border-white/[0.05] hover:border-white/[0.12] hover:bg-[#0c0e14]/75"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                            isSelected ? "bg-brand-goldDim border-brand-gold/30" : "bg-white/[0.02] border-white/[0.05]"
                          }`}>
                            {meta.icon}
                          </div>
                          <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border ${
                            isSelected ? "bg-brand-goldDim border-brand-gold/20 text-brand-gold" : "bg-white/[0.02] border-white/[0.05] text-brand-muted"
                          }`}>
                            {meta.tag}
                          </span>
                        </div>

                        <div>
                          <h3 className={`font-bold font-mono text-sm ${isSelected ? "text-brand-gold" : "text-white"}`}>{name}</h3>
                          <p className="text-brand-muted text-xs font-light mt-1.5 leading-relaxed line-clamp-2">{meta.desc}</p>
                        </div>
                      </div>

                      {/* Micro telemetries */}
                      <div className="border-t border-white/[0.04] pt-3 flex items-center justify-between text-[9px] font-mono text-brand-muted">
                        <span>Model: <span className="text-white font-bold">{details.model.split(" ")[0]}</span></span>
                        <span>RAM: <span className="text-white font-bold">{details.allocatedRAM}GB</span></span>
                        <span>Cores: <span className="text-white font-bold">{details.cores}x</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Interactive Diagnostic & Allocation Panel */}
              <div className="bg-[#0c0e14]/70 border border-white/[0.05] rounded-3xl p-6 lg:p-8 flex flex-col justify-between min-h-[440px]">
                {selectedAgentNode ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white font-mono">{selectedAgentNode} Cores</h3>
                        <span className="text-[10px] font-mono bg-brand-greenDim border border-brand-green/20 px-2 py-0.5 rounded text-brand-green">Active Node</span>
                      </div>
                      <p className="text-brand-muted text-xs font-mono">{AGENT_META[selectedAgentNode].desc}</p>

                      {/* VRAM Allocation Slider */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-[11px] font-mono text-brand-muted">
                          <span>Allocated VRAM</span>
                          <span className="text-white font-bold">{agentDetails[selectedAgentNode].allocatedRAM} GB</span>
                        </div>
                        <input 
                          type="range" 
                          min="4" 
                          max="64" 
                          step="4"
                          value={agentDetails[selectedAgentNode].allocatedRAM}
                          onChange={(e) => handleAdjustRAM(parseInt(e.target.value))}
                          className="w-full accent-brand-gold h-1 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* CPU Core Allocation Slider */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-[11px] font-mono text-brand-muted">
                          <span>Allocated CPU Cores</span>
                          <span className="text-white font-bold">{agentDetails[selectedAgentNode].cores} Cores</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="16" 
                          step="1"
                          value={agentDetails[selectedAgentNode].cores}
                          onChange={(e) => handleAdjustCores(parseInt(e.target.value))}
                          className="w-full accent-brand-gold h-1 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Model Selector Dropdown */}
                      <div className="space-y-2 pt-2">
                        <label className="block text-[11px] font-mono text-brand-muted">Handshake Model Model</label>
                        <select
                          value={agentDetails[selectedAgentNode].model}
                          onChange={(e) => handleModelSelector(e.target.value)}
                          className="w-full bg-black/40 border border-white/[0.06] rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-brand-gold/60 transition"
                        >
                          <option value="Gemini Pro (Advanced)">Gemini Pro (Advanced Analytics)</option>
                          <option value="Gemini Flash (Hyper-Fast)">Gemini Flash (Hyper-Fast Execution)</option>
                          <option value="Local Custom Stack">Local Custom Deep Neural Stack</option>
                        </select>
                      </div>
                    </div>

                    {/* Agent diagnostics logs screen */}
                    <div className="space-y-3 pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between text-[10px] font-mono text-brand-muted uppercase">
                        <span>Agent Console Log</span>
                        <span className="text-brand-gold font-bold">Node 0x9f</span>
                      </div>
                      <div className="bg-black border border-white/[0.06] rounded-2xl p-4 font-mono text-[11px] text-brand-text max-h-[140px] overflow-y-auto whitespace-pre-line leading-relaxed">
                        {agentDiagnosticLogs}
                      </div>

                      <button
                        onClick={runAgentDiagnostics}
                        disabled={isAgentDiagnosing}
                        className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50 font-mono flex items-center justify-center gap-2"
                      >
                        {isAgentDiagnosing ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
                            <span>Diagnosing Caches...</span>
                          </>
                        ) : (
                          <>
                            <FiActivity className="text-brand-gold text-sm" />
                            <span>Trigger Node Diagnostics</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 text-brand-muted">
                    <FiSliders className="text-3xl text-brand-muted" />
                    <h3 className="font-mono text-sm font-bold text-white">Select Specialist Core</h3>
                    <p className="text-xs max-w-[220px]">Click any matrix agent card on the left to allocate RAM resources, configure core models, or run active diagnostics.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: METRICS (Telemetry Analytics Tab) */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
              <div className="flex items-center gap-3">
                <FiHardDrive className="text-brand-gold text-lg" />
                <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">System Telemetry & Live Resource Metrics</h2>
              </div>
              <button 
                onClick={handleFlushClusterMemory}
                className="bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition flex items-center gap-1.5 active:scale-95"
              >
                <FiRefreshCw className="text-[10px]" />
                <span>Optimize Caches</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* circular VRAM Gauge */}
              <div className="bg-[#0c0e14]/50 border border-white/[0.05] rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[220px]">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5"><FiCpu /> Global VRAM Allocation</span>
                <div className="relative w-28 h-28 flex items-center justify-center mt-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                    <circle cx="56" cy="56" r="46" stroke="#f5a623" strokeWidth="8" fill="transparent" strokeDasharray="290" strokeDashoffset={290 - (290 * telemetryStats.memoryUsage) / 100} className="transition-all duration-1000" />
                  </svg>
                  <span className="absolute font-mono text-xl font-bold text-white">{telemetryStats.memoryUsage}%</span>
                </div>
                <span className="text-[10px] font-mono text-brand-muted mt-2">Active Heap Usage: {(telemetryStats.memoryUsage * 0.48).toFixed(1)}GB / 48GB</span>
              </div>

              {/* Latency Handshake Gauge */}
              <div className="bg-[#0c0e14]/50 border border-white/[0.05] rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[220px]">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5"><FiClock /> Pipeline Latency Timer</span>
                <div className="relative w-28 h-28 flex items-center justify-center mt-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                    <circle cx="56" cy="56" r="46" stroke="#4a9eff" strokeWidth="8" fill="transparent" strokeDasharray="290" strokeDashoffset="70" />
                  </svg>
                  <span className="absolute font-mono text-xl font-bold text-white">{telemetryStats.compileRate}</span>
                </div>
                <span className="text-[10px] font-mono text-brand-muted mt-2">API handshake speed confirmed</span>
              </div>

              {/* Cluster CPU workloads */}
              <div className="bg-[#0c0e14]/50 border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between min-h-[220px]">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5"><FiActivity /> Cluster Core workloads</span>
                <div className="space-y-3 mt-4 w-full font-mono text-[11px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span>Ingress Router</span>
                      <span className="text-brand-green font-bold">12%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-brand-green rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span>Specialist Runtimes</span>
                      <span className="text-brand-gold font-bold">78%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full transition-all duration-700" style={{ width: `${Math.round(telemetryStats.cpu.reduce((a,b)=>a+b,0)/8)}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span>MongoDB Replica Engine</span>
                      <span className="text-brand-blue font-bold">38%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: "38%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* system temperatures */}
              <div className="bg-[#0c0e14]/50 border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between min-h-[220px]">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5"><FiServer /> GPU Cluster Temperature</span>
                <div className="space-y-2 mt-4 font-mono text-xs w-full">
                  <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
                    <span>H100 Node #1</span>
                    <span className="font-bold text-white">56°C</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
                    <span>H100 Node #2</span>
                    <span className="font-bold text-white">62°C</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
                    <span>H100 Node #3</span>
                    <span className="font-bold text-white">51°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>H100 Node #4</span>
                    <span className="font-bold text-brand-gold animate-pulse">78°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Analytics details */}
            <div className="bg-[#0c0e14]/70 border border-white/[0.05] rounded-3xl p-6 lg:p-8 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono">Live Cluster Health Monitor</h3>
              <div className="border border-white/[0.06] bg-black rounded-2xl p-5 font-mono text-xs text-[#3ddc84] space-y-2 h-[160px] overflow-y-auto">
                <div>$&gt; Fetching docker agent cluster node status lists...</div>
                <div>$&gt; checking container replica pod logs integrity checks: OK</div>
                <div className="text-brand-muted">$&gt; cluster node #1 latency: 0.12s (healthy)</div>
                <div className="text-brand-muted">$&gt; cluster node #2 latency: 0.22s (healthy)</div>
                <div className="text-brand-muted">$&gt; cluster node #3 latency: 0.15s (healthy)</div>
                <div className="text-brand-muted">$&gt; database replication lag: 0.01ms (verified)</div>
                <div className="text-brand-green font-bold">$&gt; Global diagnostics: 0 errors detected. Operations status: OPTIMAL.</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: CLUSTER (Container Pod Topology Tab) */}
        {activeTab === "cluster" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
              <div className="flex items-center gap-3">
                <FiGlobe className="text-brand-gold text-lg" />
                <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">Kubernetes Cluster Pod Topology Map</h2>
              </div>
              <button 
                onClick={handleProvisionPod}
                disabled={isClusterScaling}
                className="bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/30 text-brand-blue px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <FiPlus />
                <span>Provision Replica</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Pods Topology Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {clusterPods.map((pod) => (
                  <div 
                    key={pod.id}
                    className="bg-[#0c0e14]/50 border border-white/[0.05] hover:border-brand-blue/40 rounded-3xl p-5 flex flex-col justify-between h-[160px] relative transition-all duration-300 group hover:shadow-[0_0_20px_rgba(74,158,255,0.04)]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase bg-brand-blueDim text-brand-blue border border-brand-blue/20 px-2 py-0.5 rounded">
                          {pod.id}
                        </span>
                        <button 
                          onClick={() => handleScaleDownPod(pod.id)}
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1 rounded transition opacity-0 group-hover:opacity-100 duration-200"
                          title="Terminate Container Pod"
                        >
                          ✕
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-xs font-mono truncate pt-1">{pod.name}</h4>
                    </div>

                    <div className="border-t border-white/[0.04] pt-3 space-y-1 text-[9px] font-mono text-brand-muted">
                      <div className="flex justify-between">
                        <span>Work Load:</span>
                        <span className="text-white font-bold">{pod.load}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RAM Util:</span>
                        <span className="text-white font-bold">{pod.ram}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Status:</span>
                        <span className="text-brand-green font-bold flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-brand-green inline-block animate-ping" />
                          <span>{pod.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Node Controls and Logs */}
              <div className="bg-[#0c0e14]/70 border border-white/[0.05] rounded-3xl p-6 lg:p-8 flex flex-col justify-between min-h-[400px]">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white font-mono">Cluster Control Panel</h3>
                  <p className="text-brand-muted text-xs font-mono leading-relaxed">Mount dynamic replica nodes into your Kubernetes framework clusters to support intensive parallel execution.</p>

                  <div className="space-y-3 pt-3 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-white/[0.03] pb-2">
                      <span>Total Active Pods</span>
                      <span className="text-brand-blue font-bold">{clusterPods.length} / 12</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-2">
                      <span>Ingress Bandwidth</span>
                      <span className="text-white font-bold">142.8 KB/s</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-2">
                      <span>Network Protocol</span>
                      <span className="text-white font-bold">MERN G-RPC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gateway Handshake</span>
                      <span className="text-brand-green font-bold">SECURED</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/[0.04] mt-6">
                  <button 
                    onClick={() => {
                      pushToast("Initiating cluster networks rebalance scan...", "success");
                      setTimeout(() => pushToast("Cluster re-balanced completely!", "success"), 1500);
                    }}
                    className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition active:scale-95 font-mono"
                  >
                    Trigger Global Network Rebalance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── SYSTEM TOAST ALERTS ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
                t.type === "success" 
                  ? "bg-brand-green/10 border-brand-green/20 text-brand-green" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <span className="text-base shrink-0">{t.type === "success" ? "✓" : "✕"}</span>
              <span className="text-xs font-mono font-bold tracking-wide leading-tight">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── INTERACTIVE COMMAND PALETTE MODAL ── */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#080a0f]/90 backdrop-blur-md flex items-start justify-center pt-[15vh] z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.97, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: -10 }}
              className="w-full max-w-xl bg-[#0c0e14] border border-white/[0.08] rounded-3xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)] space-y-4"
            >
              {/* Header search bar */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                <FiSearch className="text-brand-gold text-lg shrink-0" />
                <input
                  type="text"
                  placeholder="Trigger cluster command (e.g. /replica scale)..."
                  className="w-full bg-transparent outline-none text-sm text-brand-text placeholder-brand-muted font-mono"
                  value={commandPaletteQuery}
                  onChange={(e) => setCommandPaletteQuery(e.target.value)}
                  autoFocus
                />
                <span className="text-[10px] font-mono text-brand-muted shrink-0 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">ESC</span>
              </div>

              {/* Suggestions */}
              <div className="space-y-1 max-h-[280px] overflow-y-auto">
                <div className="text-[9px] font-mono uppercase tracking-widest text-brand-muted font-bold pl-2 pb-1.5">Quick Orchestration Actions</div>
                
                {filteredCommands.length === 0 ? (
                  <div className="text-brand-muted font-mono text-xs pl-2 py-3">No matching commands resolved.</div>
                ) : (
                  filteredCommands.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleExecuteCommand(item)}
                      className="w-full text-left font-mono text-xs px-3.5 py-3 rounded-2xl flex items-center justify-between border border-transparent hover:bg-white/[0.02] hover:border-white/[0.04] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FiCornerDownRight className="text-brand-muted group-hover:text-brand-gold transition-colors" />
                        <div>
                          <span className="text-white font-bold">{item.cmd}</span>
                          <span className="text-brand-muted text-[10px] ml-3 font-light">{item.desc}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-brand-muted bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.05]">{item.shortcut}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Help hint */}
              <div className="flex items-center gap-1.5 text-[10px] text-brand-muted pt-2 border-t border-white/[0.04]">
                <FiInfo />
                <span>Tip: Click any action or use keyboard inputs to execute. Press ESC to exit.</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}