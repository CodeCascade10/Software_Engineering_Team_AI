import {
  FiActivity,
  FiCpu,
  FiLayers,
  FiSearch,
  FiPlay,
  FiCloud,
  FiGrid,
} from "react-icons/fi";

const AGENT_META = {
  Planner: {
    icon: <FiGrid className="text-amber-400 text-lg" />,
    tag: "Architecture",
    task: "Designing microservices blueprint",
    desc: "Drafts structural specs and schemas",
  },

  "Backend Dev": {
    icon: <FiCpu className="text-brand-blue text-lg" />,
    tag: "REST Engineering",
    task: "Generating FastAPI controllers",
    desc: "Builds routers, services and logic",
  },

  "Frontend Dev": {
    icon: <FiLayers className="text-brand-gold text-lg" />,
    tag: "UI Components",
    task: "Injecting tailwind design grids",
    desc: "Assembles glassmorphic user panels",
  },

  "Code Reviewer": {
    icon: <FiSearch className="text-purple-400 text-lg" />,
    tag: "QA Auditing",
    task: "Verifying security access keys",
    desc: "Ensures linting, coverage and safety",
  },

  Executor: {
    icon: <FiPlay className="text-brand-green text-lg" />,
    tag: "Sandbox Execution",
    task: "Launching test container instances",
    desc: "Compiles, runs, and monitors packages",
  },

  DevOps: {
    icon: <FiCloud className="text-cyan-400 text-lg" />,
    tag: "Scale & Orchestrate",
    task: "Allocating proxy replica nodes",
    desc: "Configures docker clusters and builds",
  },
};

export default function AgentGrid({
  handleAgentMatrixClick,
}) {
  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        <FiActivity className="text-brand-gold text-lg" />

        <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-brand-muted">
          Autonomous Agent Matrix Nodes
        </h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        {Object.entries(AGENT_META).map(([name, meta]) => {

          const progressMap = {
            Planner: 92,
            "Backend Dev": 84,
            "Frontend Dev": 79,
            "Code Reviewer": 85,
            Executor: 100,
            DevOps: 68,
          };

          const curProgress = progressMap[name];

          return (
            <div
              key={name}
              onClick={() => handleAgentMatrixClick(name)}
              className="bg-[#0c0e14]/50 border border-white/[0.05] hover:border-brand-gold/30 hover:shadow-[0_0_20px_rgba(245,166,35,0.15)] rounded-3xl p-5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >

              {/* glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* top */}
              <div className="flex items-start justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center">
                  {meta.icon}
                </div>

                <span className="text-[9px] uppercase tracking-widest font-mono text-brand-muted">
                  {meta.tag}
                </span>
              </div>

              {/* title */}
              <div className="mt-5 relative z-10">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {name}
                </h3>

                <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">
                  {meta.desc}
                </p>
              </div>

              {/* progress */}
              <div className="mt-5 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-brand-muted">
                    ACTIVE LOAD
                  </span>

                  <span className="text-white">
                    {curProgress}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-amber-300 rounded-full"
                    style={{ width: `${curProgress}%` }}
                  />
                </div>
              </div>

              {/* task */}
              <div className="mt-4 text-[10px] font-mono uppercase tracking-wide text-brand-muted relative z-10">
                {meta.task}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}