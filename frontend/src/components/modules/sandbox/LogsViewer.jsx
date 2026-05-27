import {
  FiActivity,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";

export default function LogsViewer({
  logs,
  expandedProject,
}) {

  const projectLogs =
    logs[expandedProject] || [];

  return (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl overflow-hidden h-full flex flex-col">

      {/* HEADER */}
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center justify-between bg-black/20">

        <div className="flex items-center gap-3">
          <FiActivity className="text-brand-blue" />

          <span className="text-xs font-mono uppercase tracking-widest text-white">
            Workflow Logs
          </span>
        </div>

        <div className="text-[10px] uppercase tracking-widest font-mono text-brand-muted">
          {projectLogs.length} entries
        </div>
      </div>

      {/* LOG BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {projectLogs.length === 0 && (
          <div className="h-full flex items-center justify-center text-brand-muted text-xs font-mono">
            No orchestration logs available
          </div>
        )}

        {projectLogs.map((log, idx) => {

          const isRunning =
            log.status === "running";

          return (
            <div
              key={idx}
              className="border border-white/[0.05] bg-black/20 rounded-2xl p-4"
            >

              {/* TOP */}
              <div className="flex items-center justify-between mb-3">

                <div className="flex items-center gap-2">

                  {isRunning ? (
                    <FiLoader className="animate-spin text-brand-gold" />
                  ) : (
                    <FiCheckCircle className="text-brand-green" />
                  )}

                  <span className="text-xs font-mono uppercase tracking-widest text-white">
                    {log.agent}
                  </span>
                </div>

                <span
                  className={`text-[10px] uppercase tracking-widest font-mono ${
                    isRunning
                      ? "text-brand-gold"
                      : "text-brand-green"
                  }`}
                >
                  {log.status}
                </span>
              </div>

              {/* MESSAGE */}
              <pre className="whitespace-pre-wrap text-[12px] leading-6 font-mono text-brand-muted">
                {log.message}
              </pre>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/[0.05] bg-black/20 px-5 flex items-center justify-between text-[10px] uppercase tracking-widest font-mono text-brand-muted">

        <span>
          orchestration stream
        </span>

        <span>
          realtime sync active
        </span>
      </div>
    </div>
  );
}