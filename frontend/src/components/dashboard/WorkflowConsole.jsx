import { FiTerminal } from "react-icons/fi";

export default function WorkflowConsole({
  logs = [],
  isGenerating,
}) {

  // SUPPORT BOTH:
  // []
  // { projectId: [...] }

  const normalizedLogs =
    Array.isArray(logs)
      ? logs
      : Object.values(logs || {}).flat();

  return (

    <div className="rounded-[28px] border border-white/[0.05] bg-black/40 overflow-hidden">

      {/* HEADER */}
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-8 h-8 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green">
            <FiTerminal />
          </div>

          <div>

            <div className="text-sm font-bold text-white font-mono">
              Live Workflow Console
            </div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-mono">
              Autonomous orchestration stream
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">

          <span
            className={`w-2 h-2 rounded-full ${
              isGenerating
                ? "bg-brand-green animate-pulse"
                : "bg-white/20"
            }`}
          />

          <span className="text-brand-muted">

            {isGenerating
              ? "STREAMING"
              : "IDLE"}

          </span>
        </div>
      </div>

      {/* TERMINAL */}
      <div className="p-5 h-[340px] overflow-y-auto bg-[#05070b] font-mono text-[12px] space-y-4">

        {normalizedLogs.length === 0 ? (

          <div className="text-brand-muted flex items-center gap-2">

            <span className="animate-pulse">
              $&gt;
            </span>

            <span>
              Waiting for workflow initialization...
            </span>
          </div>

        ) : (

          normalizedLogs.map((log, idx) => (

            <div
              key={idx}
              className="border-b border-white/[0.03] pb-3"
            >

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">

                  <span className="px-2 py-1 rounded bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] uppercase tracking-wider">

                    {log.agent || "SYSTEM"}

                  </span>

                  <span
                    className={`text-[10px] uppercase tracking-wider ${
                      log.status === "completed"
                        ? "text-brand-green"
                        : "text-brand-blue"
                    }`}
                  >

                    {log.status || "running"}

                  </span>
                </div>

                <span className="text-[10px] text-brand-muted">
                  node_{idx + 1}
                </span>
              </div>

              <p className="text-brand-text whitespace-pre-wrap leading-6">

                {log.message}

              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}