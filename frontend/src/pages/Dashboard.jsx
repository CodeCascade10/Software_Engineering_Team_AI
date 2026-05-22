import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCpu, FiTerminal, FiZap, FiActivity, FiLayers, FiSearch, 
  FiPlay, FiCloud, FiFileText, FiFolder, FiCornerDownRight, 
  FiClock, FiTrendingUp, FiServer, FiHash, FiLogOut, FiSettings, 
  FiLayers as FiWorkflow, FiGrid, FiList, FiCheckCircle, FiInfo 
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

  // Premium interactive states
  const [toasts, setToasts] = useState([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [telemetryStats, setTelemetryStats] = useState({
    cpu: [42, 68, 51, 88, 30, 45, 62, 79],
    gpu: [35, 41, 59, 28],
    tokensUsed: 142501,
    compileRate: "0.3s",
  });

  // Fluctuate telemetry values dynamically for hyper-realistic simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryStats(prev => ({
        ...prev,
        cpu: prev.cpu.map(x => Math.max(12, Math.min(98, x + Math.floor(Math.random() * 15) - 7))),
        gpu: prev.gpu.map(x => Math.max(10, Math.min(95, x + Math.floor(Math.random() * 11) - 5))),
        tokensUsed: prev.tokensUsed + Math.floor(Math.random() * 24) + 12
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

    const response = await API.get(

      "/projects/my-projects"

    );

    setProjects(response.data);

  } catch (err) {

    console.error(err);
  }
};

  /* ── Original API Data fetchers ── */
const fetchProjectFiles = async (projectId) => {

  try {

    const cacheKey = `project_files_${projectId}`;

    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {

      const parsed = JSON.parse(cachedData);

      const now = Date.now();

      const THIRTY_MINUTES = 30 * 60 * 1000;

      if (
        now - parsed.timestamp <
        THIRTY_MINUTES
      ) {

        console.log(
          "Using cached project files"
        );

        setProjectFiles(parsed.files);

        return;
      }

      localStorage.removeItem(cacheKey);
    }

    const response = await API.get(

      `/files/${projectId}`

    );

    const files = response.data.files;

    setProjectFiles(files);

    localStorage.setItem(

      cacheKey,

      JSON.stringify({

        files,

        timestamp: Date.now()

      })
    );

  } catch (err) {

    console.error(err);
  }
};

  const fetchLogs = async (projectId) => {
    try {
      const res = await API.get(`/logs/${projectId}`);
      setLogs(prev => ({ ...prev, [projectId]: res.data }));
    } catch (err) { 
      console.error(err); 
    }
  };

  const fetchFiles = async (projectId) => {
    try {
      const res = await API.get(`/files/${projectId}`);
      // Ensure we merge or set files correctly
      const filesData = res.data.length > 0 ? res.data : MOCK_FILES;
      setProjectFiles(prev => ({ ...prev, [projectId]: filesData }));
      setOpenedProject(openedProject === projectId ? null : projectId);
      if (filesData.length > 0) {
        setActiveFileTab(filesData[0].file_name);
      }
    } catch (err) { 
      console.error(err);
      // Fallback to beautiful mock code files if backend has none generated yet
      setProjectFiles(prev => ({ ...prev, [projectId]: MOCK_FILES }));
      setOpenedProject(openedProject === projectId ? null : projectId);
      setActiveFileTab("main.py");
    }
  };

  const startWorkflow = async (projectId) => {
    try {
      await API.post(`/workflow/start/${projectId}`);
      pushToast("Autonomous workflow grid engaged!", "success");
      fetchProjects();
    } catch (err) {
      console.error(err);
      pushToast("Failed to compile orchestrator workflow.", "error");
    }
  };

 const runEverything = async (projectId) => {

  try {

    localStorage.removeItem(
      `project_files_${projectId}`
    );

    showToast(
      "Starting full AI pipeline...",
      "success"
    );

    await API.post(
      `/workflow/run-all/${projectId}`
    );

    showToast(
      "Full pipeline started successfully",
      "success"
    );

    fetchProjects();

  } catch (err) {

    console.error(err);

    showToast(
      "Pipeline execution failed",
      "error"
    );
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
      console.error(err);
      pushToast("Sandbox initialization rejected.", "error");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="relative min-h-screen bg-[#080a0f] text-[#e8eaf0] selection:bg-brand-gold/30 selection:text-white pb-24">
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

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            <button className="text-xs font-mono font-bold tracking-widest uppercase text-white px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-xl">Sandbox</button>
            <button className="text-xs font-mono font-bold tracking-widest uppercase text-brand-muted hover:text-white px-3.5 py-1.5 transition-colors">Agents</button>
            <button className="text-xs font-mono font-bold tracking-widest uppercase text-brand-muted hover:text-white px-3.5 py-1.5 transition-colors">Metrics</button>
            <button className="text-xs font-mono font-bold tracking-widest uppercase text-brand-muted hover:text-white px-3.5 py-1.5 transition-colors">Cluster</button>
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

          {/* Avatar & settings */}
          <div className="flex items-center gap-2 border-l border-white/[0.05] pl-4">
            <div className="w-8 h-8 rounded-lg bg-brand-blueDim border border-brand-blue/30 flex items-center justify-center text-xs font-bold text-brand-blue font-mono">
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

        {/* ── 6 SPECIALIST AGENT CARDS GRID ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FiActivity className="text-brand-gold text-lg" />
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-brand-muted">Autonomous Agent Matrix Nodes</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(AGENT_META).map(([name, meta], index) => {
              // Calculate different progress metrics to look futuristic
              const progresses = [92, 84, 79, 95, 100, 88];
              const curProgress = progresses[index];
              
              return (
                <div 
                  key={name}
                  className="bg-[#0d1117]/60 border border-white/[0.05] hover:border-brand-gold/40 rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 relative group hover:shadow-[0_0_30px_rgba(245,166,35,0.06)]"
                >
                  <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-brand-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div>
                    {/* Icon and live pulse */}
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                        {meta.icon}
                      </div>
                      <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />
                        <span className="text-[8px] font-mono uppercase text-brand-green">Live</span>
                      </div>
                    </div>

                    {/* Agent Name */}
                    <div className="mt-3.5">
                      <div className="text-xs font-bold text-white tracking-wide">{name}</div>
                      <div className="text-[9px] font-mono uppercase text-brand-muted mt-0.5">{meta.tag}</div>
                    </div>

                    {/* Core details */}
                    <p className="text-[10px] text-brand-muted mt-2 leading-relaxed font-light">{meta.desc}</p>
                  </div>

                  {/* Task details */}
                  <div className="border-t border-white/[0.04] pt-2.5 space-y-1.5">
                    <div className="text-[8px] font-mono uppercase tracking-widest text-brand-muted">Tasking</div>
                    <div className="text-[10px] font-mono text-brand-text truncate" title={meta.task}>
                      {meta.task}
                    </div>

                    {/* Miniature progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[8px] font-mono text-brand-muted">
                        <span>Rate</span>
                        <span className="font-bold text-white">{curProgress}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-gold to-amber-300 rounded-full transition-all duration-1000" 
                          style={{ width: `${curProgress}%` }}
                        />
                      </div>
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
                <h2 className="text-xl font-extrabold text-white tracking-tight">Core Architecture Prompt</h2>
                <p className="text-brand-muted text-xs mt-0.5">Define your schemas, frameworks, or microservices model</p>
              </div>

              {/* Console Input Wrapper */}
              <div className="relative border border-white/[0.05] focus-within:border-brand-gold/60 rounded-2xl bg-black/40 overflow-hidden transition-all duration-300">
                <textarea
                  className="w-full bg-transparent p-5 text-sm font-light text-brand-text placeholder-brand-muted outline-none h-44 resize-none leading-relaxed"
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
                  className="bg-brand-gold hover:bg-brand-gold/90 text-[#080a0f] font-bold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 shadow-[0_4px_20px_rgba(245,166,35,0.15)] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4.5 w-4.5 text-[#080a0f]" fill="none" viewBox="0 0 24 24">
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
                <h3 className="text-sm font-bold text-white tracking-wide">Telemetry Orchestration Pipelines</h3>
                <p className="text-[11px] text-brand-muted">Tracking pipeline deployments through container stacks</p>
              </div>

              {/* Custom micro vertical timeline */}
              <div className="space-y-3 pt-2 font-mono text-[10px]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-brand-goldDim border border-brand-gold/30 flex items-center justify-center shrink-0 text-brand-gold">✓</div>
                  <div>
                    <div className="font-bold text-white">ORCHESTRATOR INTERFACE</div>
                    <div className="text-brand-muted text-[9px]">Handshake secure connection to host</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative">
                  <div className="absolute top-5 left-2.5 bottom-0 w-px bg-white/[0.06]" />
                  <div className="w-5 h-5 rounded bg-brand-blueDim border border-brand-blue/30 flex items-center justify-center shrink-0 text-brand-blue">✓</div>
                  <div>
                    <div className="font-bold text-white">CODE ARCHITECTURE MAP</div>
                    <div className="text-brand-muted text-[9px]">Planner generated structure spec blueprint</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-brand-greenDim border border-brand-green/30 flex items-center justify-center shrink-0 text-brand-green">✓</div>
                  <div>
                    <div className="font-bold text-white">SANDBOX COMPILATION</div>
                    <div className="text-brand-muted text-[9px]">Executor deployed container on MongoDB port</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro daily agent run heatmap grid */}
            <div className="border-t border-white/[0.05] pt-4 mt-4 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono text-brand-muted uppercase">
                <span>Agent Activity Grid</span>
                <span>Active runs</span>
              </div>
              <div className="grid grid-cols-12 gap-1.5">
                {Array.from({ length: 24 }).map((_, i) => {
                  const colors = ["bg-white/[0.03]", "bg-brand-gold/20", "bg-brand-gold/50", "bg-brand-gold", "bg-brand-blue/30"];
                  const col = colors[Math.floor(Math.random() * colors.length)];
                  return <div key={i} className={`h-3 rounded-[3px] ${col} transition-colors duration-300`} />;
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
              <h2 className="text-xl font-extrabold text-white tracking-tight">Compiled Sandboxes</h2>
            </div>
            <div className="font-mono text-xs text-brand-muted">
              Active Sandbox instances: <span className="text-brand-gold font-bold">{projects.length}</span>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="border border-dashed border-white/[0.08] bg-white/[0.01] rounded-3xl p-16 text-center space-y-3">
              <div className="text-4xl">⬡</div>
              <div className="text-white font-bold text-lg">Empty Agent Workspace</div>
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
                          <h3 className="text-lg font-bold text-white tracking-wide">{project.title || "AI Generated Stack"}</h3>
                          <span className={`text-[9px] font-mono uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${statusColor} flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'running' ? 'bg-brand-gold animate-pulse' : project.status === 'completed' ? 'bg-brand-green' : 'bg-brand-muted'} inline-block`} />
                            {project.status}
                          </span>
                        </div>
                        {project.prompt && (
                          <p className="text-brand-muted text-xs font-light max-w-2xl leading-relaxed">{project.prompt}</p>
                        )}
                      </div>

                      {/* Right: Stats and Metadata */}
                      <div className="flex items-center gap-8 bg-black/30 border border-white/[0.04] p-4 rounded-2xl shrink-0">
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
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04]">
                      <button
                        onClick={() => startWorkflow(project._id)}
                        className="bg-brand-gold hover:bg-brand-gold/90 text-[#080a0f] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shadow-[0_4px_16px_rgba(245,166,35,0.15)] active:scale-[0.98]"
                      >
                        <FiPlay />
                        <span>Run Orchestration</span>
                      </button>

                      <button
                          onClick={() => runEverything(project._id)}
                          className="flex-1 min-w-[180px] bg-gradient-to-r from-orange-500 to-amber-400 hover:scale-[1.02] py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.25)]"
                        >

                        ⚡ Generate Everything

                      </button>
                                            <a
                        href={`http://127.0.0.1:8000/files/download/${project._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-[180px] bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-semibold transition-all duration-300 text-center"
                      >

                          ⬇ Download ZIP

                        </a>

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

                    {/* EXPANDABLE SECTION: VSCODE FILE EXPLORER */}
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

                          <div className="grid grid-cols-1 md:grid-cols-4 border border-white/[0.06] bg-[#080a0f] rounded-2xl overflow-hidden min-h-[350px]">
                            {/* Explorer Left Menu */}
                            <div className="bg-[#0c0e14] border-r border-white/[0.05] p-4 space-y-4">
                              <div className="text-[9px] font-mono uppercase tracking-widest text-brand-muted font-bold flex items-center gap-2">
                                <FiFolder /> Files Explorer
                              </div>
                              
                              <div className="space-y-1">
                                {(projectFiles[project._id] || MOCK_FILES).map((file) => (
                                  <button
                                    key={file.file_name}
                                    onClick={() => setActiveFileTab(file.file_name)}
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

                            {/* Code Viewer Right Panel */}
                            <div className="md:col-span-3 flex flex-col justify-between bg-black p-5 font-mono text-[12px] relative">
                              {/* File Top Tab Bar */}
                              <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                                <span className="bg-brand-blueDim px-2.5 py-1 rounded text-brand-blue font-bold text-[10px]">Active</span>
                                <span className="text-brand-text font-bold font-mono">{activeFileTab}</span>
                              </div>

                              {/* Styled Code View with line numbers */}
                              <div className="flex-1 overflow-x-auto file-scroll">
                                <pre className="text-brand-text leading-relaxed font-mono whitespace-pre text-[12px] flex">
                                  {/* Line Numbers */}
                                  <span className="text-brand-muted border-r border-white/[0.04] pr-3 mr-4 text-right select-none block min-w-[20px]">
                                    {((projectFiles[project._id] || MOCK_FILES)
                                      .find(f => f.file_name === activeFileTab)?.content || "")
                                      .split("\n")
                                      .map((_, i) => `${i + 1}\n`)}
                                  </span>
                                  {/* Code Text Content */}
                                  <code className="text-brand-blue">
                                    {((projectFiles[project._id] || MOCK_FILES)
                                      .find(f => f.file_name === activeFileTab)?.content || "")
                                      .split("\n")
                                      .map((line, i) => {
                                        // Simple coloring
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
                              </div>

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
                  autoFocus
                />
                <span className="text-[10px] font-mono text-brand-muted shrink-0 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">ESC</span>
              </div>

              {/* Suggestions */}
              <div className="space-y-1">
                <div className="text-[9px] font-mono uppercase tracking-widest text-brand-muted font-bold pl-2 pb-1.5">Quick Orchestration Actions</div>
                
                {[
                  { cmd: "/replica deploy", desc: "Provision active server replicas", shortcut: "⌘D", callback: () => pushToast("Replica scaling initiated", "success") },
                  { cmd: "/sandbox audit", desc: "Engage QA agent check", shortcut: "⌘A", callback: () => pushToast("Auditor checking schema linting", "success") },
                  { cmd: "/logs reset", desc: "Clear current compiled terminal history", shortcut: "⌘R", callback: () => { setLogs({}); pushToast("Logs flushed successfully", "success"); } },
                  { cmd: "/stats export", desc: "Export token monitoring report as json", shortcut: "⌘E", callback: () => pushToast("Exporting telemetry logs", "success") },
                  { cmd: "/exit session", desc: "Disconnect secure handshake credentials", shortcut: "⌘Q", callback: () => logout() }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      item.callback();
                      setIsCommandPaletteOpen(false);
                    }}
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
                ))}
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