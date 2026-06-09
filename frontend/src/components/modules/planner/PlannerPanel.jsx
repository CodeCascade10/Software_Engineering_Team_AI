import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { FiLayers, FiRefreshCw, FiCalendar, FiHardDrive, FiCpu, FiPlay, FiAlertTriangle, FiBookOpen } from "react-icons/fi";
import API from "../../../api/axios";

export default function PlannerPanel({
  projectFiles,
  openedProject,
  onResetWorkspace,
  setProjectFiles,
  setOpenedProject,
  setActiveFileTab,
  pushToast,
}) {
  const [idea, setIdea] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState("");

  const files = projectFiles[openedProject] || [];
  const archFile = files.find((f) => f.file_name === "architecture.md");

  const handleGeneratePlan = async () => {
    if (!idea.trim()) {
      if (pushToast) pushToast("Please describe your software idea", "error");
      return;
    }

    try {
      setIsPlanning(true);
      setError("");
      if (pushToast) pushToast("Initializing software architect agents...");

      const response = await API.post("/api/planner/plan-project", { idea });
      const planMarkdown = response.data.plan;

      const pId = openedProject || `proj_${Date.now()}`;

      // Update project files in state
      const newArchFile = {
        file_name: "architecture.md",
        content: planMarkdown,
      };

      setProjectFiles((prev) => {
        const existingFiles = prev[pId] || [];
        const filtered = existingFiles.filter((f) => f.file_name !== "architecture.md");
        return {
          ...prev,
          [pId]: [newArchFile, ...filtered],
        };
      });

      setOpenedProject(pId);
      setActiveFileTab("architecture.md");

      if (pushToast) pushToast("Architecture roadmap generated successfully!", "success");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Failed to generate architecture plan";
      setError(errMsg);
      if (pushToast) pushToast(errMsg, "error");
    } finally {
      setIsPlanning(false);
    }
  };

  // Custom Markdown styling for architecture plans
  const markdownComponents = {
    h1: ({ children }) => (
      <h2 className="text-2xl font-black text-white border-b border-white/[0.08] pb-3 mt-8 mb-4 tracking-tight flex items-center gap-2">
        <span className="w-2 h-7 rounded bg-brand-gold shadow-[0_0_15px_rgba(245,166,35,0.2)]" />
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3 className="text-lg font-extrabold text-brand-gold mt-6 mb-3 tracking-tight flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-brand-gold/60" />
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="text-base font-bold text-brand-blue mt-4 mb-2 tracking-tight">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-brand-text/90 text-sm leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="space-y-3 my-4 pl-1">
        {children}
      </ul>
    ),
    li: ({ children }) => {
      const text = String(children);
      // Format sequence flows or arrows nicely
      if (text.includes("➔") || text.includes("──>")) {
        return (
          <li className="flex gap-3 p-4 rounded-2xl border border-brand-gold/10 bg-brand-goldDim/5 text-brand-text/90 text-sm leading-relaxed transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-2 shadow-[0_0_8px_#f5a623]" />
            <div className="font-mono text-brand-gold">{children}</div>
          </li>
        );
      }
      return (
        <li className="flex gap-3 p-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] text-brand-text/90 text-sm leading-relaxed transition-all">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/40 shrink-0 mt-2" />
          <div>{children}</div>
        </li>
      );
    },
    code: ({ node, inline, className, children, ...props }) => {
      return !inline ? (
        <div className="my-4 rounded-2xl border border-white/[0.08] overflow-hidden bg-black/40">
          <pre className="p-4 overflow-x-auto font-mono text-xs text-brand-text leading-relaxed bg-black/20">
            <code {...props}>{children}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-brand-goldDim border border-brand-gold/15 text-brand-gold rounded px-1.5 py-0.5 font-mono text-xs" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* HEADER SECTION */}
      <div className="rounded-[28px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl p-8 flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full filter blur-[35px] pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shadow-[0_0_15px_rgba(245,166,35,0.15)]">
            <FiLayers size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              AI System Architect
            </h1>
            <p className="text-brand-muted mt-2 text-sm max-w-xl">
              Inspect autonomous blueprint designs, schema layouts, and microservices plans.
            </p>
          </div>
        </div>

        {archFile && (
          <button
            onClick={onResetWorkspace}
            className="h-12 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-brand-gold/20 text-brand-text hover:text-brand-gold transition-all text-xs font-bold font-mono flex items-center gap-2 active:scale-95 z-10"
          >
            <FiRefreshCw className="animate-spin-slow" />
            <span>NEW ARCHITECTURE PLAN</span>
          </button>
        )}
      </div>

      {/* BLUEPRINT CANVAS */}
      <div className="rounded-[32px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl p-8 relative overflow-hidden">
        {/* Architectural grid design overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {isPlanning ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 font-mono text-center"
              >
                <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-brand-gold/10 rounded-full" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-t-brand-gold border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                  />
                  <FiCpu className="text-brand-gold text-4xl animate-pulse" />
                </div>
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">
                  Modeling Architecture Flow
                </h4>
                <p className="text-brand-muted text-xs leading-relaxed max-w-sm mt-2">
                  Invoking software architect agents to model system flow, databases, API routes, and page view structures...
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
                <h4 className="text-white font-bold">Planning Failed</h4>
                <p className="text-red-400/90 text-sm max-w-xs mt-2 font-mono">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="mt-6 h-10 px-6 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-bold text-white transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            ) : archFile ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert max-w-none"
              >
                <ReactMarkdown components={markdownComponents}>
                  {archFile.content}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <motion.div
                key="input-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 space-y-8 max-w-2xl mx-auto"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mx-auto shadow-[0_0_20px_rgba(245,166,35,0.1)]">
                    <FiBookOpen size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-white">System Architecture Planner</h2>
                  <p className="text-brand-muted text-sm max-w-md mx-auto leading-relaxed">
                    Provide your product concept or system requirements, and the AI agent will map out a detailed sequential development roadmap.
                  </p>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="E.g., Build a modern SaaS platform with user workspaces, billing integrations, and document management systems..."
                    className="w-full h-40 rounded-2xl bg-black/40 border border-white/[0.06] focus:border-brand-gold/30 outline-none resize-none p-5 text-white placeholder:text-brand-muted text-sm leading-relaxed font-mono transition-all"
                  />

                  <button
                    onClick={handleGeneratePlan}
                    disabled={isPlanning || !idea.trim()}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand-gold to-amber-300 hover:shadow-[0_4px_25px_rgba(245,166,35,0.25)] hover:scale-[1.005] active:scale-[0.99] text-black font-black tracking-wider flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none uppercase text-sm"
                  >
                    <FiPlay />
                    <span>Generate Architectural Flow</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
