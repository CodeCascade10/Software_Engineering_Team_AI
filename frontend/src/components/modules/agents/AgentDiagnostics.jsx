import {
  FiCpu,
  FiDatabase,
  FiActivity,
  FiLoader,
} from "react-icons/fi";

export default function AgentDiagnostics({
  selectedAgentNode,
  agentDetails,
  agentDiagnosticLogs,
  isAgentDiagnosing,
}) {

  if (!selectedAgentNode) {
    return (
      <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl h-full flex items-center justify-center text-brand-muted text-sm font-mono">
        Select an agent node to inspect diagnostics
      </div>
    );
  }

  const details =
    agentDetails[selectedAgentNode];

  return (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl overflow-hidden h-full flex flex-col">

      {/* HEADER */}
      <div className="h-16 border-b border-white/[0.05] px-6 flex items-center justify-between bg-black/20">

        <div>
          <h2 className="text-lg font-bold text-white">
            {selectedAgentNode}
          </h2>

          <p className="text-[11px] uppercase tracking-widest font-mono text-brand-muted mt-1">
            Runtime Diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono">

          {isAgentDiagnosing ? (
            <>
              <FiLoader className="animate-spin text-brand-gold" />

              <span className="text-brand-gold">
                scanning
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />

              <span className="text-brand-green">
                stable
              </span>
            </>
          )}
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/[0.05]">

        {/* RAM */}
        <div className="bg-black/20 border border-white/[0.04] rounded-2xl p-4">

          <div className="flex items-center gap-2 text-brand-muted text-[10px] uppercase tracking-widest font-mono mb-2">
            <FiDatabase />
            RAM
          </div>

          <div className="text-2xl font-bold text-white">
            {details.allocatedRAM}GB
          </div>
        </div>

        {/* CORES */}
        <div className="bg-black/20 border border-white/[0.04] rounded-2xl p-4">

          <div className="flex items-center gap-2 text-brand-muted text-[10px] uppercase tracking-widest font-mono mb-2">
            <FiCpu />
            Cores
          </div>

          <div className="text-2xl font-bold text-white">
            {details.cores}
          </div>
        </div>

        {/* LATENCY */}
        <div className="bg-black/20 border border-white/[0.04] rounded-2xl p-4">

          <div className="flex items-center gap-2 text-brand-muted text-[10px] uppercase tracking-widest font-mono mb-2">
            <FiActivity />
            Latency
          </div>

          <div className="text-2xl font-bold text-brand-green">
            {details.latency}
          </div>
        </div>
      </div>

      {/* MODEL */}
      <div className="px-6 py-4 border-b border-white/[0.05]">

        <div className="text-[10px] uppercase tracking-widest font-mono text-brand-muted mb-2">
          AI Runtime Model
        </div>

        <div className="text-white font-semibold">
          {details.model}
        </div>
      </div>

      {/* LOGS */}
      <div className="flex-1 overflow-auto p-6">

        <pre className="whitespace-pre-wrap text-[13px] leading-7 font-mono text-brand-green">
          {agentDiagnosticLogs ||
            `$> Initializing diagnostics...
$> Connected to ${selectedAgentNode} node...
$> Awaiting telemetry stream...`}
        </pre>
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/[0.05] bg-black/20 px-5 flex items-center justify-between text-[10px] uppercase tracking-widest font-mono text-brand-muted">

        <span>
          neural runtime active
        </span>

        <span>
          diagnostics stream online
        </span>
      </div>
    </div>
  );
}