import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { FiLayers, FiRefreshCw, FiCalendar, FiHardDrive } from "react-icons/fi";

export default function PlannerPanel({
  projectFiles,
  openedProject,
  onResetWorkspace,
}) {
  const files = projectFiles[openedProject] || [];
  const archFile = files.find((f) => f.file_name === "architecture.md");

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
    li: ({ children }) => (
      <li className="flex gap-3 p-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] text-brand-text/90 text-sm leading-relaxed transition-all">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-2 shadow-[0_0_8px_#f5a623]" />
        <div>{children}</div>
      </li>
    ),
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
              Planner Workspace
            </h1>
            <p className="text-brand-muted mt-2 text-sm max-w-xl">
              Inspect autonomous blueprint designs, schema layouts, and microservices plans.
            </p>
          </div>
        </div>

        <button
          onClick={onResetWorkspace}
          className="h-12 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-brand-gold/20 text-brand-text hover:text-brand-gold transition-all text-xs font-bold font-mono flex items-center gap-2 active:scale-95 z-10"
        >
          <FiRefreshCw className="animate-spin-slow" />
          <span>NEW ARCHITECTURE PLAN</span>
        </button>
      </div>

      {/* BLUEPRINT CANVAS */}
      <div className="rounded-[32px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl p-8 relative overflow-hidden">
        {/* Architectural grid design overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {archFile ? (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {archFile.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="py-20 text-center font-mono space-y-4">
              <FiHardDrive className="mx-auto text-brand-muted text-4xl" />
              <p className="text-brand-muted text-sm">
                No system architecture files found. Run the planner generator above.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
