import { motion, AnimatePresence } from "framer-motion";
import {
  FiCpu,
  FiCode,
  FiLayers,
  FiPlay,
  FiShield,
  FiServer,
} from "react-icons/fi";

export default function PromptOrchestrator({
  promptInput,
  setPromptInput,
  workflowMode,
  setWorkflowMode,
  stack,
  setStack,
  handleGenerateProject,
  isGenerating,
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl p-8 lg:p-10">
      {/* BG GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f5a62311,transparent_30%),radial-gradient(circle_at_bottom_right,#3b82f611,transparent_30%)] pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* TOP BADGE */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] uppercase tracking-[0.2em] font-mono font-bold">
          <FiCpu />
          Autonomous AI Engineering Core
        </div>

        {/* TITLE */}
        <h2 className="text-4xl lg:text-5xl font-black leading-tight text-white">
          Build software
          <span className="bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold bg-clip-text text-transparent">
            {" "}with AI teams
          </span>
        </h2>

        {/* DESC */}
        <p className="text-brand-muted text-sm leading-relaxed max-w-3xl">
          Describe your software idea. Autonomous AI agents will architect,
          generate, review, debug, and deploy your application in a collaborative workflow.
        </p>

        {/* TEXTAREA */}
        <div>
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Build a FastAPI + React SaaS platform with JWT authentication, Stripe subscriptions, Docker deployment, admin dashboard, and AI chatbot integration..."
            className="w-full h-[140px] rounded-3xl bg-black/30 border border-white/[0.06] focus:border-brand-gold/30 outline-none resize-none p-6 text-white placeholder:text-brand-muted text-sm leading-8 font-mono transition-all"
          />
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setWorkflowMode("Planner Only");
              if (!promptInput.trim()) {
                setPromptInput("Design a high-level system architecture blueprint for a secure MERN application with database schemas.");
              }
            }}
            className={`text-left rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              workflowMode === "Planner Only"
                ? "bg-brand-gold/10 border-brand-gold/30 shadow-[0_0_20px_rgba(245,166,35,0.15)]"
                : "bg-black/20 border-white/[0.05] hover:bg-black/35 hover:border-white/[0.12]"
            }`}
          >
            <FiLayers className={`${workflowMode === "Planner Only" ? "text-brand-gold" : "text-brand-muted"} text-lg mb-3`} />
            <div className="text-white font-semibold text-sm">
              Planner
            </div>
            <div className="text-brand-muted text-xs mt-1">
              System design & flow
            </div>
          </button>

          <button
            onClick={() => {
              setWorkflowMode("Frontend Only");
              if (!promptInput.trim()) {
                setPromptInput("Generate a beautiful React notes dashboard application interface.");
              }
            }}
            className={`text-left rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              workflowMode === "Frontend Only"
                ? "bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                : "bg-black/20 border-white/[0.05] hover:bg-black/35 hover:border-white/[0.12]"
            }`}
          >
            <FiCode className={`${workflowMode === "Frontend Only" ? "text-purple-400" : "text-brand-muted"} text-lg mb-3`} />
            <div className="text-white font-semibold text-sm">
              Frontend
            </div>
            <div className="text-brand-muted text-xs mt-1">
              React layouts & design
            </div>
          </button>

          <button
            onClick={() => {
              setWorkflowMode("Backend Only");
              if (!promptInput.trim()) {
                setPromptInput("Generate a FastAPI backend with PostgreSQL connections and note CRUD routes.");
              }
            }}
            className={`text-left rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              workflowMode === "Backend Only"
                ? "bg-brand-blue/10 border-brand-blue/30 shadow-[0_0_20px_rgba(74,158,255,0.15)]"
                : "bg-black/20 border-white/[0.05] hover:bg-black/35 hover:border-white/[0.12]"
            }`}
          >
            <FiServer className={`${workflowMode === "Backend Only" ? "text-brand-blue" : "text-brand-muted"} text-lg mb-3`} />
            <div className="text-white font-semibold text-sm">
              Backend
            </div>
            <div className="text-brand-muted text-xs mt-1">
              FastAPI REST API routes
            </div>
          </button>

          <button
            onClick={() => {
              setWorkflowMode("Reviewer Only");
              if (!promptInput.trim()) {
                setPromptInput("Review the backend database connection pool and verifying auth routers for latency vulnerabilities.");
              }
            }}
            className={`text-left rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              workflowMode === "Reviewer Only"
                ? "bg-brand-green/10 border-brand-green/30 shadow-[0_0_20px_rgba(74,222,128,0.15)]"
                : "bg-black/20 border-white/[0.05] hover:bg-black/35 hover:border-white/[0.12]"
            }`}
          >
            <FiShield className={`${workflowMode === "Reviewer Only" ? "text-brand-green" : "text-brand-muted"} text-lg mb-3`} />
            <div className="text-white font-semibold text-sm">
              Reviewer
            </div>
            <div className="text-brand-muted text-xs mt-1">
              Security & QA analysis
            </div>
          </button>
        </div>

        {/* TECH STACK SELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-black/20 border border-white/[0.04] p-4 rounded-2xl">
          <span className="text-[11px] font-bold font-mono text-brand-muted uppercase tracking-[0.2em]">
            Select Tech Stack:
          </span>
          <div className="flex gap-2.5">
            {["FastAPI", "MERN"].map((s) => {
              const isActive = stack === s;
              return (
                <button
                  key={s}
                  onClick={() => setStack(s)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all duration-200 ${
                    isActive
                      ? "bg-brand-gold/15 border border-brand-gold/30 text-white shadow-[0_0_15px_rgba(245,166,35,0.1)]"
                      : "bg-black/45 border border-white/[0.05] text-brand-muted hover:text-white"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA BUTTON */}
        <div className="pt-4 flex justify-end">
          <AnimatePresence>
            {(promptInput.trim() || isGenerating) && (
              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={handleGenerateProject}
                disabled={isGenerating}
                className="w-full sm:max-w-xs h-16 rounded-3xl bg-gradient-to-r from-brand-gold to-amber-300 hover:scale-[1.01] transition-all text-black text-lg font-black tracking-wide flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(245,166,35,0.25)] disabled:opacity-60"
              >
                <FiPlay />
                {isGenerating ? "INITIALIZING..." : "GENERATE SOFTWARE"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}