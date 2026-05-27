import {
  FiTerminal,
  FiLoader,
} from "react-icons/fi";

export default function TerminalPanel({
  activeFileTerminalOutput,
  isRunningFileScript,
}) {
  return (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl overflow-hidden h-full flex flex-col">

      {/* HEADER */}
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center justify-between bg-black/20">

        <div className="flex items-center gap-3">
          <FiTerminal className="text-brand-green" />

          <span className="text-xs font-mono uppercase tracking-widest text-white">
            Sandbox Terminal
          </span>
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono">

          {isRunningFileScript ? (
            <>
              <FiLoader className="animate-spin text-brand-gold" />

              <span className="text-brand-gold">
                executing
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />

              <span className="text-brand-green">
                idle
              </span>
            </>
          )}
        </div>
      </div>

      {/* TERMINAL BODY */}
      <div className="flex-1 overflow-auto p-5">

        <pre className="text-[13px] leading-7 font-mono text-brand-green whitespace-pre-wrap">
          {activeFileTerminalOutput ||
            `$> Sandbox runtime initialized...
$> Waiting for execution command...
$> Connected to CodeNexus compiler mesh.`}
        </pre>
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/[0.05] bg-black/20 px-5 flex items-center justify-between text-[10px] uppercase tracking-widest font-mono text-brand-muted">

        <span>
          Runtime v2.04
        </span>

        <span>
          secure shell active
        </span>
      </div>
    </div>
  );
}