import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiServer, FiCode, FiPlay, FiCpu, FiAlertTriangle, FiHardDrive } from "react-icons/fi";
import API from "../../api/axios";

import PlannerPanel from "../modules/planner/PlannerPanel";
import SandboxPanel from "../modules/sandbox/SandboxPanel";
import FrontendWorkspacePanel from "../modules/sandbox/FrontendWorkspacePanel";
import ReviewerPanel from "../modules/reviewer/ReviewerPanel";

function ServiceGenerator({ moduleName, sandboxProps }) {
  const [desc, setDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!desc.trim()) {
      if (sandboxProps.pushToast) sandboxProps.pushToast(`Please describe your ${moduleName.toLowerCase()} requirements`, "error");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");
      if (sandboxProps.pushToast) sandboxProps.pushToast(`Initializing AI ${moduleName} Engineer...`);

      const endpoint = moduleName === "Backend" ? "/api/planner/generate-backend" : "/api/planner/generate-frontend";
      const response = await API.post(endpoint, { description: desc });
      
      const files = response.data.files;
      if (!files || files.length === 0) {
        throw new Error("No files were returned by the code generator.");
      }

      const pId = sandboxProps.openedProject || `proj_${moduleName.toLowerCase()}_${Date.now()}`;
      
      sandboxProps.setProjectFiles((prev) => ({
        ...prev,
        [pId]: files,
      }));

      const defaultTab = moduleName === "Backend" ? "main.py" : "App.jsx";
      sandboxProps.setOpenedProject(pId);
      sandboxProps.setActiveFileTab(defaultTab);
      
      const defaultFile = files.find(f => f.file_name === defaultTab) || files[0];
      sandboxProps.setEditingFileContent(defaultFile.content);

      if (sandboxProps.pushToast) sandboxProps.pushToast(`${moduleName} codebase generated and mounted!`, "success");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || `Failed to generate ${moduleName.toLowerCase()} codebase`;
      setError(errMsg);
      if (sandboxProps.pushToast) sandboxProps.pushToast(errMsg, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const isBackend = moduleName === "Backend";
  const iconColor = isBackend ? "text-brand-blue" : "text-purple-400";
  const iconBg = isBackend ? "bg-brand-blue/10 border-brand-blue/20" : "bg-purple-500/10 border-purple-500/20";
  const btnGradient = isBackend ? "from-brand-blue via-cyan-400 to-teal-400 text-black font-extrabold" : "from-purple-500 via-pink-500 to-red-400 text-white font-extrabold";
  const glowOrb = isBackend ? "bg-brand-blue/5" : "bg-purple-500/5";

  return (
    <div className="rounded-[32px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl p-8 relative overflow-hidden max-w-2xl mx-auto my-12">
      {/* Background radial glow */}
      <div className={`absolute top-0 left-0 w-36 h-36 ${glowOrb} rounded-full filter blur-[35px] pointer-events-none`} />

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 flex flex-col items-center justify-center font-mono text-center"
          >
            <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-0 border-2 border-dashed border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full`}
              />
              <FiCpu className={`${iconColor} text-4xl animate-pulse`} />
            </div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Generating {moduleName} Codebase...
            </h4>
            <p className="text-brand-muted text-xs leading-relaxed max-w-sm mt-2">
              Writing production-ready files, setting up routes, databases, models, modules, and packaging dependencies...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl mb-4">
              <FiAlertTriangle />
            </div>
            <h4 className="text-white font-bold">Generation Failed</h4>
            <p className="text-red-400/90 text-sm max-w-xs mt-2 font-mono">{error}</p>
            <button
              onClick={() => setError("")}
              className="mt-6 h-10 px-6 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-bold text-white transition-all"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 rounded-3xl ${iconBg} border flex items-center justify-center ${iconColor} mx-auto shadow-[0_0_20px_rgba(74,158,255,0.1)]`}>
                {isBackend ? <FiServer size={24} /> : <FiCode size={24} />}
              </div>
              <h2 className="text-2xl font-black text-white">AI {moduleName} Engineer</h2>
              <p className="text-brand-muted text-sm max-w-md mx-auto leading-relaxed">
                Describe the specific features, database models, schemas, page layouts, or routing behavior you want to build.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={
                  isBackend
                    ? "E.g., Write a FastAPI backend with JWT user registration/login, SQLModel database schema for task management, and CRUD API routes..."
                    : "E.g., Design a responsive React dashboard with a sleek sidebar, glassmorphic layout, product list card grid, and a details modal window..."
                }
                className="w-full h-40 rounded-2xl bg-black/40 border border-white/[0.06] focus:border-white/20 outline-none resize-none p-5 text-white placeholder:text-brand-muted text-sm leading-relaxed font-mono transition-all"
              />

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !desc.trim()}
                className={`w-full h-14 rounded-2xl bg-gradient-to-r ${btnGradient} hover:shadow-[0_4px_25px_rgba(74,158,255,0.15)] hover:scale-[1.005] active:scale-[0.99] font-black tracking-wider flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none uppercase text-sm`}
              >
                <FiPlay />
                <span>Generate {moduleName} Code</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardContent({
  activeTab,
  sandboxProps,
}) {
  const [rightActiveTab, setRightActiveTab] = useState("backend");

  const isProjectLoaded = !!sandboxProps.openedProject;

  if (!isProjectLoaded) {
    return null;
  }

  // Get stack of the active project
  const saved = localStorage.getItem("nexus_local_projects");
  const localProjects = saved ? JSON.parse(saved) : [];
  const proj = localProjects.find((p) => p._id === sandboxProps.openedProject);
  const chosenStack = proj?.stack || "FastAPI";

  // Filter backend specific files: Node/Express for MERN, Python/txt for FastAPI
  const allFiles = sandboxProps.projectFiles[sandboxProps.openedProject] || [];
  const backendFiles = allFiles.filter(
    (f) =>
      chosenStack === "MERN"
        ? (f.file_name.endsWith(".js") && f.file_name !== "App.jsx" && f.file_name !== "vite.config.js") || f.file_name === "package.json"
        : f.file_name.endsWith(".py") || f.file_name.endsWith(".txt")
  );
  const backendProjectFiles = {
    [sandboxProps.openedProject]: backendFiles,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-8 min-h-[820px] w-full">
      
      {/* LEFT COLUMN: ARCHITECTURE PLAN */}
      <div className="flex flex-col h-[820px] overflow-y-auto pr-1">
        <PlannerPanel
          projectFiles={sandboxProps.projectFiles}
          openedProject={sandboxProps.openedProject}
          onResetWorkspace={sandboxProps.onResetWorkspace}
          setProjectFiles={sandboxProps.setProjectFiles}
          setOpenedProject={sandboxProps.setOpenedProject}
          setActiveFileTab={sandboxProps.setActiveFileTab}
          pushToast={sandboxProps.pushToast}
        />
      </div>

      {/* RIGHT COLUMN: WORKSPACE TABS */}
      <div className="flex flex-col h-[820px] bg-[#0c0e14]/40 border border-white/[0.05] rounded-[32px] overflow-hidden">
        
        {/* TABS HEADER */}
        <div className="h-16 border-b border-white/[0.05] bg-black/25 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-white font-mono uppercase">
              WORKSPACE CHANNELS
            </span>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.05] gap-1">
            {[
              { id: "backend", label: "Backend", icon: FiServer, color: "text-brand-blue" },
              { id: "frontend", label: "Frontend", icon: FiCode, color: "text-purple-400" },
              { id: "reviewer", label: "Reviewer", icon: FiCpu, color: "text-brand-green" },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = rightActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRightActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.06] border border-white/[0.08] text-white shadow-sm"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  <TabIcon className={tab.color} size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={rightActiveTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {rightActiveTab === "backend" && (
                <SandboxPanel
                  {...sandboxProps}
                  projectFiles={backendProjectFiles}
                />
              )}
              {rightActiveTab === "frontend" && (
                <FrontendWorkspacePanel
                  {...sandboxProps}
                />
              )}
              {rightActiveTab === "reviewer" && (
                <ReviewerPanel />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}