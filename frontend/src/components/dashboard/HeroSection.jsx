import {
  FiCpu,
  FiServer,
  FiHash,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";

export default function HeroSection({ telemetryStats }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.04] pb-8">

      {/* LEFT */}
      <div>
        <div className="inline-flex items-center gap-2 bg-brand-goldDim border border-brand-gold/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-brand-gold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          Grid Cluster: ONLINE (V2.0.4)
        </div>

        <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          AI SOFTWARE <br />

          <span className="bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_5s_linear_infinite] gold-glow-text">
            ENGINEERING
          </span>{" "}
          TEAM
        </h1>

        <p className="text-brand-muted text-sm max-w-xl mt-3 font-light leading-relaxed">
          Describe your idea inside the prompt generator. An autonomous squad
          of specialized virtual engineers collaborate to architect, program,
          inspect, and deploy clean software environments.
        </p>
      </div>

      {/* RIGHT TELEMETRY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:max-w-[650px] shrink-0">

        {/* CPU */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
            <FiCpu className="text-brand-gold" />
            System Cores
          </span>

          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-brand-text">
              <span>8x Nodes</span>

              <span>
                {Math.round(
                  telemetryStats.cpu.reduce((a, b) => a + b, 0) / 8
                )}
                %
              </span>
            </div>

            <div className="grid grid-cols-8 gap-0.5 h-2 items-end">
              {telemetryStats.cpu.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.05] h-full rounded-[1px] relative overflow-hidden"
                >
                  <div
                    className="bg-brand-gold absolute bottom-0 inset-x-0 transition-all duration-500"
                    style={{ height: `${val}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GPU */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
            <FiServer className="text-brand-blue" />
            GPU Cluster
          </span>

          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-brand-text">
              <span>4x H100s</span>

              <span>
                {Math.round(
                  telemetryStats.gpu.reduce((a, b) => a + b, 0) / 4
                )}
                %
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 h-2 items-end">
              {telemetryStats.gpu.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.05] h-full rounded-[1px] relative overflow-hidden"
                >
                  <div
                    className="bg-brand-blue absolute bottom-0 inset-x-0 transition-all duration-500"
                    style={{ height: `${val}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOKENS */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
            <FiHash className="text-brand-green" />
            Analytics
          </span>

          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {telemetryStats.tokensUsed.toLocaleString()}
            </div>

            <div className="text-[9px] uppercase font-mono text-brand-muted flex items-center gap-1">
              <FiTrendingUp className="text-brand-green" />
              cumulative tokens
            </div>
          </div>
        </div>

        {/* LATENCY */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-widest text-brand-muted flex items-center gap-1.5">
            <FiClock className="text-purple-400" />
            Compile Rate
          </span>

          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {telemetryStats.compileRate}
            </div>

            <div className="text-[9px] uppercase font-mono text-brand-muted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green inline-block animate-pulse" />
              latency response
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}