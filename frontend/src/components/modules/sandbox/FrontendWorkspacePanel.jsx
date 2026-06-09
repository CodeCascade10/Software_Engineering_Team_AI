import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGlobe,
  FiRotateCw,
  FiTerminal,
  FiActivity,
  FiCheckCircle,
  FiZap,
  FiArrowLeft,
  FiArrowRight,
  FiCpu,
  FiPlay,
} from "react-icons/fi";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";

export default function FrontendWorkspacePanel({
  projectFiles,
  openedProject,
  activeFileTab,
  handleSelectFile,
  editingFileContent,
  setEditingFileContent,
  handleSaveFileContent,
  handleRunScript,
  isEditingFile,
  setIsEditingFile,
  isRunningFileScript,
  activeFileTerminalOutput,
}) {
  const [browserOnline, setBrowserOnline] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [triggerApiLoading, setTriggerApiLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState("");

  // Sync browser online state with whether sandbox is actively running / finished running
  useEffect(() => {
    if (isRunningFileScript) {
      setBrowserOnline(false);
      setApiResponse("");
      // Simulate loading phase, then set online
      const timer = setTimeout(() => {
        setBrowserOnline(true);
      }, 3500); // Syncs with Sandbox log simulation
      return () => clearTimeout(timer);
    }
  }, [isRunningFileScript]);

  const handleTriggerApi = () => {
    setTriggerApiLoading(true);
    setApiResponse("");
    setTimeout(() => {
      setTriggerApiLoading(false);
      setApiResponse(`{ "status": "active", "db_connected": true, "response_ms": 42 }`);
    }, 1000);
  };

  // Only pass frontend files to explorer
  const allFiles = projectFiles[openedProject] || [];
  const frontendFiles = allFiles.filter(
    (f) =>
      f.file_name.endsWith(".jsx") ||
      f.file_name.endsWith(".json") ||
      f.file_name.endsWith(".css") ||
      f.file_name.endsWith(".html")
  );

  const filteredProjectFiles = {
    [openedProject]: frontendFiles,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[720px]">
      {/* LEFT: CODE WORKSPACE */}
      <div className="space-y-6 flex flex-col">
        {/* Workspace Title Card */}
        <div className="p-4 rounded-2xl border border-white/[0.05] bg-[#0c0e14]/50 flex items-center justify-between">
          <span className="text-xs font-mono text-brand-muted uppercase tracking-widest flex items-center gap-2">
            <FiPlay className="text-brand-blue" /> Code Editor Sandbox
          </span>
          <span className="text-[10px] bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono font-bold px-2.5 py-1 rounded-full uppercase">
            React / JSX Module
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 h-[580px] flex-1">
          <FileExplorer
            projectFiles={filteredProjectFiles}
            openedProject={openedProject}
            activeFileTab={activeFileTab}
            handleSelectFile={handleSelectFile}
          />

          <CodeEditor
            activeFileTab={activeFileTab}
            editingFileContent={editingFileContent}
            setEditingFileContent={setEditingFileContent}
            handleSaveFileContent={handleSaveFileContent}
            handleRunScript={handleRunScript}
            isEditingFile={isEditingFile}
            setIsEditingFile={setIsEditingFile}
            openedProject={openedProject}
            isRunningFileScript={isRunningFileScript}
          />
        </div>
      </div>

      {/* RIGHT: PREMIUM BROWSER CLIENT SIMULATOR */}
      <div className="rounded-[32px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl flex flex-col overflow-hidden h-full min-h-[640px]">
        {/* Browser Top Navigation Bar */}
        <div className="h-14 border-b border-white/[0.05] bg-black/35 px-5 flex items-center justify-between z-10 shrink-0 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/30" />
            <span className="w-3 h-3 rounded-full bg-amber-500/30" />
            <span className="w-3 h-3 rounded-full bg-green-500/30" />
            <div className="flex items-center gap-1.5 ml-4 text-brand-muted">
              <FiArrowLeft size={13} className="opacity-50" />
              <FiArrowRight size={13} className="opacity-50" />
            </div>
          </div>

          {/* Browser Address Box */}
          <div className="flex-1 max-w-lg bg-black/40 border border-white/[0.06] rounded-xl h-9 px-4 flex items-center gap-2 text-xs font-mono text-brand-muted select-none">
            <FiGlobe size={12} className="text-brand-blue" />
            <span className="truncate">http://localhost:5173/</span>
          </div>

          <FiRotateCw size={14} className="text-brand-muted cursor-pointer hover:text-white transition-colors" />
        </div>

        {/* Browser Viewport Area */}
        <div className="flex-1 bg-[#06070a] relative flex flex-col p-6 overflow-y-auto min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* ── SANDBOX CONNECTING ── */}
            {isRunningFileScript && !browserOnline && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/90 z-20 font-mono text-center"
              >
                <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border border-brand-blue/20 rounded-full" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_0_10px_rgba(74,158,255,0.2)]"
                  />
                  <FiCpu className="text-brand-blue text-2xl animate-pulse" />
                </div>
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">
                  Deploying Local Host Port 5173
                </h4>
                {/* Simulated build log loader */}
                <div className="mt-4 text-[#4a9eff] text-[10px] max-w-xs h-[100px] overflow-hidden whitespace-pre-wrap leading-relaxed text-left border border-brand-blue/15 bg-brand-blueDim/10 p-3.5 rounded-xl">
                  {activeFileTerminalOutput || "$> webpack dev compile...\n$> hot module reload active\n$> bundle size: 284kB"}
                </div>
              </motion.div>
            )}

            {/* ── CLIENT APP ONLINE VIEW ── */}
            {browserOnline ? (
              <motion.div
                key="online"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col space-y-6 select-text"
              >
                {/* Generated UI Page Simulator Header */}
                <header className="flex justify-between items-center pb-4 border-b border-white/[0.04] shrink-0">
                  <div>
                    <h1 className="text-lg font-black text-white tracking-wide">
                      Nexus SaaS System
                    </h1>
                    <p className="text-[10px] text-brand-muted uppercase tracking-widest font-mono">
                      generated application view
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full text-[10px] text-brand-green uppercase font-mono font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
                    LIVE OK
                  </span>
                </header>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between h-24">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5 font-bold">
                      <FiActivity /> Operations
                    </span>
                    <span className="text-2xl font-bold font-mono text-white mt-1">
                      {482 + clickCount}
                    </span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between h-24">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5 font-bold">
                      <FiZap className="text-brand-gold" /> System Latency
                    </span>
                    <span className="text-2xl font-bold font-mono text-brand-gold mt-1">
                      0.10s
                    </span>
                  </div>
                </div>

                {/* Simulated Interactive API Section */}
                <div className="flex-1 bg-white/[0.01] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <FiGlobe /> API Integration Testbed
                    </h3>
                    <p className="text-brand-muted text-xs leading-relaxed mt-1">
                      Trigger asynchronous telemetry handshakes with the generated FastAPI backend.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setClickCount((c) => c + 1);
                      handleTriggerApi();
                    }}
                    disabled={triggerApiLoading}
                    className="w-full h-11 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] active:scale-95 text-xs text-white font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    {triggerApiLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>HANDSHAKING ENDPOINT...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-brand-green" />
                        <span>TEST BACKEND API CALL</span>
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {apiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/45 border border-white/[0.06] rounded-xl p-3.5 font-mono text-[10px] text-[#3ddc84] whitespace-pre overflow-x-auto"
                      >
                        {apiResponse}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="offline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8 font-mono text-brand-muted"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-3xl mb-4">
                  <FiGlobe />
                </div>
                <h4 className="text-white font-bold text-sm">Browser Standby</h4>
                <p className="text-xs max-w-[260px] mt-2 leading-relaxed">
                  Click <span className="text-brand-blue font-bold">RUN SANDBOX</span> in the code editor to compile, hot-reload, and host the React SPA sandbox view.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
