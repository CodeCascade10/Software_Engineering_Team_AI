import { FiCode, FiSearch, FiLayers } from "react-icons/fi";

export default function ReviewerForm({
  code,
  setCode,
  language,
  setLanguage,
  handleReview,
  isReviewing,
}) {
  const languages = [
    "auto",
    "javascript",
    "typescript",
    "python",
    "cpp",
    "java",
    "go",
    "rust",
  ];

  return (
    <div className="rounded-[28px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl overflow-hidden flex flex-col relative">
      {/* Background radial glow */}
      <div className="absolute top-0 left-0 w-36 h-36 bg-brand-blue/5 rounded-full filter blur-[35px] pointer-events-none" />

      {/* HEADER */}
      <div className="h-16 border-b border-white/[0.05] px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue shadow-[0_0_15px_rgba(74,158,255,0.15)] animate-pulse">
            <FiCode />
          </div>
          <div>
            <div className="text-white font-bold">Source Code</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-muted font-mono">
              Workspace Editor
            </div>
          </div>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-brand-muted font-mono uppercase tracking-widest hidden md:inline-block">
            Language:
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-black/40 border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-4 py-2 text-xs font-semibold text-white outline-none cursor-pointer focus:ring-1 focus:ring-brand-blue/40 focus:border-brand-blue/40 transition-all font-mono uppercase"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang} className="bg-[#0c0e14] text-white">
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CODE INPUT AREA */}
      <div className="p-6 flex-1 flex flex-col z-10">
        <div className="relative flex-1">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your codebase snippet here to perform AI static inspection, compliance verification, and performance analysis..."
            className="w-full h-[410px] rounded-2xl bg-black/45 border border-white/[0.06] focus:border-brand-blue/40 focus:ring-1 focus:ring-brand-blue/25 outline-none resize-none p-5 text-brand-text placeholder:text-brand-muted text-xs leading-relaxed font-mono transition-all selection:bg-brand-blue/20"
          />
          {/* Editor background design grid pattern */}
          <div className="absolute right-4 bottom-4 pointer-events-none text-white/[0.02] flex items-center gap-1">
            <FiLayers size={45} />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleReview}
          disabled={isReviewing || !code.trim()}
          className="mt-6 w-full h-14 rounded-2xl bg-gradient-to-r from-brand-blue via-cyan-400 to-teal-400 text-black font-black tracking-wider flex items-center justify-center gap-3 hover:shadow-[0_4px_25px_rgba(74,158,255,0.25)] hover:scale-[1.005] active:scale-[0.99] transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none font-sans uppercase text-sm"
        >
          {isReviewing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>AUDITING SYSTEM PIPELINES...</span>
            </>
          ) : (
            <>
              <FiSearch className="text-base stroke-[3]" />
              <span>RUN STATIC CODE ANALYSIS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}