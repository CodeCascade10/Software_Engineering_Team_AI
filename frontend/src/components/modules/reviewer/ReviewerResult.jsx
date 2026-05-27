import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertTriangle,
  FiShield,
  FiCpu,
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiInfo,
  FiCode,
  FiZap,
} from "react-icons/fi";

export default function ReviewerResult({
  reviewResult,
  reviewError,
  isReviewing,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!reviewResult) return;
    navigator.clipboard.writeText(reviewResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom Markdown components to style headers and code blocks beautifully
  const markdownComponents = {
    h1: ({ children }) => (
      <h3 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2 mt-6 mb-3 tracking-tight flex items-center gap-2">
        <span className="w-1.5 h-6 rounded bg-brand-gold" />
        {children}
      </h3>
    ),
    h2: ({ children }) => (
      <h4 className="text-lg font-bold text-brand-gold mt-6 mb-3 tracking-tight flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-brand-gold/60" />
        {children}
      </h4>
    ),
    h3: ({ children }) => (
      <h5 className="text-base font-bold text-brand-blue mt-4 mb-2 tracking-tight flex items-center gap-2">
        {children}
      </h5>
    ),
    p: ({ children }) => (
      <p className="text-brand-text/95 text-sm leading-relaxed mb-3">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="space-y-2.5 my-3 pl-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal space-y-2.5 my-3 pl-5 text-brand-text/90 text-sm">
        {children}
      </ol>
    ),
    li: ({ children }) => {
      // Check if bullet contains key terms and style dynamically
      const text = String(children);
      let borderClass = "border-white/[0.04] bg-white/[0.01]";
      let icon = <FiInfo className="text-brand-blue shrink-0 mt-0.5" />;

      if (
        text.toLowerCase().includes("bug") ||
        text.toLowerCase().includes("error") ||
        text.toLowerCase().includes("issue")
      ) {
        borderClass = "border-red-500/10 bg-red-500/[0.02]";
        icon = <FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" />;
      } else if (
        text.toLowerCase().includes("security") ||
        text.toLowerCase().includes("vulnerability") ||
        text.toLowerCase().includes("leak")
      ) {
        borderClass = "border-purple-500/15 bg-purple-500/[0.02]";
        icon = <FiShield className="text-purple-400 shrink-0 mt-0.5" />;
      } else if (
        text.toLowerCase().includes("perf") ||
        text.toLowerCase().includes("speed") ||
        text.toLowerCase().includes("slow")
      ) {
        borderClass = "border-amber-500/10 bg-amber-500/[0.02]";
        icon = <FiZap className="text-amber-400 shrink-0 mt-0.5" />;
      } else if (
        text.toLowerCase().includes("good") ||
        text.toLowerCase().includes("best practice") ||
        text.toLowerCase().includes("optimal")
      ) {
        borderClass = "border-green-500/10 bg-green-500/[0.02]";
        icon = <FiCheckCircle className="text-brand-green shrink-0 mt-0.5" />;
      }

      return (
        <li className={`flex gap-3 p-3.5 rounded-2xl border ${borderClass} text-brand-text/90 text-sm leading-relaxed transition-all`}>
          {icon}
          <div>{children}</div>
        </li>
      );
    },
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline ? (
        <div className="my-4 rounded-2xl border border-white/[0.08] overflow-hidden bg-black/40">
          <div className="bg-white/[0.02] px-4 py-2 border-b border-white/[0.05] flex items-center justify-between text-xs font-mono text-brand-muted">
            <span className="flex items-center gap-1.5 uppercase tracking-wider font-bold">
              <FiCode /> {match ? match[1] : "code snippet"}
            </span>
          </div>
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
    <div className="rounded-[28px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl overflow-hidden min-h-[500px] flex flex-col relative">
      {/* Background Orbs inside panel for depth */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-brand-gold/5 rounded-full filter blur-[40px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-brand-blue/5 rounded-full filter blur-[40px] pointer-events-none" />

      {/* HEADER */}
      <div className="h-16 border-b border-white/[0.05] px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
            <FiShield />
          </div>
          <div>
            <div className="text-white font-bold">Audit Insights</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-muted font-mono">
              AI recommendations
            </div>
          </div>
        </div>

        {reviewResult && !isReviewing && (
          <button
            onClick={handleCopy}
            className="h-10 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-brand-text hover:text-white transition-all text-xs font-bold font-mono flex items-center gap-2 active:scale-95"
          >
            {copied ? (
              <>
                <FiCheck className="text-brand-green" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <FiCopy />
                <span>COPY REVIEW</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* INNER CONTENT SCROLL CONTAINER */}
      <div className="p-6 flex-1 overflow-y-auto z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {/* ── LOADING SCANNER VIEW ── */}
          {isReviewing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-16 font-mono text-center"
            >
              {/* Rotating Circular Scanner Element */}
              <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-brand-gold/10 rounded-full" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-t-brand-gold border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                />
                <FiCpu className="text-brand-gold text-4xl animate-pulse" />
              </div>

              <div className="space-y-3 max-w-sm">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">
                  Static Audit in Progress
                </h4>
                <p className="text-brand-muted text-xs leading-relaxed">
                  Parsing syntax structures, executing rules engine, identifying design anti-patterns, and validating security controls...
                </p>

                {/* Animated status tickers */}
                <div className="pt-6 flex flex-col items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-goldDim border border-brand-gold/15 text-[10px] text-brand-gold uppercase tracking-widest font-bold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
                    Deep Audit Scanning
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ERROR VIEW ── */}
          {reviewError && !isReviewing && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl mb-4">
                <FiAlertTriangle />
              </div>
              <h4 className="text-white font-bold">Analysis Failed</h4>
              <p className="text-red-400/90 text-sm max-w-xs mt-2 font-mono">
                {reviewError}
              </p>
            </motion.div>
          )}

          {/* ── RECEIVED RESULT VIEW ── */}
          {reviewResult && !isReviewing && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 space-y-4"
            >
              {/* Dynamic Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-brand-goldDim border border-brand-gold/15 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold flex items-center gap-1.5 font-bold">
                    <FiShield /> Compliance Status
                  </span>
                  <span className="text-base font-bold text-white mt-1">Audit Verified</span>
                </div>
                <div className="bg-brand-blueDim border border-brand-blue/15 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-blue flex items-center gap-1.5 font-bold">
                    <FiZap /> System Health
                  </span>
                  <span className="text-base font-bold text-white mt-1">Action Required</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {reviewResult}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* ── EMPTY STATE VIEW ── */}
          {!reviewResult && !reviewError && !isReviewing && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-brand-muted text-2xl mb-4">
                <FiInfo />
              </div>
              <h4 className="text-white font-bold">Idle State</h4>
              <p className="text-brand-muted text-xs max-w-[260px] mt-2 leading-relaxed">
                Paste your codebase snippet in the editor and click "Review Code" to trigger the audit engines.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}