import ReactMarkdown from "react-markdown";
import {
  FiCpu,
  FiLayers,
  FiSearch,
  FiPlay,
  FiGrid,
} from "react-icons/fi";

export default function AgentGrid({ handleAgentMatrixClick }) {
  const actions = [
    {
      name: "Strategy",
      icon: <FiGrid />,
      colorClass: "text-amber-400",
      borderColor: "border-amber-500/10 hover:border-amber-500/30",
      glowColor: "rgba(245,166,35,0.12)",
      bgGlow: "bg-amber-500/5",
      badgeColor: "bg-amber-500/10 text-amber-400",
      indicatorColor: "bg-amber-400",
      markdown: `### Strategy Phase (AI Planner)
The **AI Planner** designs the high-level architecture blueprint and system schemas.
- **Architectural Design**: Establish routes, components, and data structures.
- **Output Artifact**: Generates \`architecture.md\` development roadmap.
- **Technology Stack**: Fully aware of *FastAPI* or *MERN* stack definitions.`
    },
    {
      name: "Development",
      icon: <FiCpu />,
      colorClass: "text-blue-400",
      borderColor: "border-blue-500/10 hover:border-blue-500/30",
      glowColor: "rgba(59,130,246,0.12)",
      bgGlow: "bg-blue-500/5",
      badgeColor: "bg-blue-500/10 text-blue-400",
      indicatorColor: "bg-blue-400",
      markdown: `### Development Phase (Dev Agents)
**AI Developers** write the clean, production-ready codebase based on the system blueprint.
- **Backend Service**: Generates controllers, database schemas, model mappings, and REST API routes.
- **Frontend Panel**: Build layouts, glassmorphic UI components, navigation structures, and state hooks.
- **Tech Stack Options**: Dynamically adjusted based on the selected configuration.`
    },
    {
      name: "Audit",
      icon: <FiSearch />,
      colorClass: "text-purple-400",
      borderColor: "border-purple-500/10 hover:border-purple-500/30",
      glowColor: "rgba(168,85,247,0.12)",
      bgGlow: "bg-purple-500/5",
      badgeColor: "bg-purple-500/10 text-purple-400",
      indicatorColor: "bg-purple-400",
      markdown: `### Audit Phase (Reviewer Agent)
The **AI Code Reviewer** runs automated diagnostics and security audits on the generated workspace.
- **Code Integrity**: Checks for code errors, linting problems, and style discrepancies.
- **Security Check**: Scans for authentication vulnerabilities, loose configuration keys, and DB pool limits.`
    },
    {
      name: "Execute",
      icon: <FiPlay />,
      colorClass: "text-green-400",
      borderColor: "border-green-500/10 hover:border-green-500/30",
      glowColor: "rgba(34,197,94,0.12)",
      bgGlow: "bg-green-500/5",
      badgeColor: "bg-green-500/10 text-green-400",
      indicatorColor: "bg-green-400",
      markdown: `### Execution Phase (Executor & DevOps)
Runs the generated workspace in a fully isolated container runtime sandbox environment.
- **Runtime Compilation**: Compiles client-side bundles and runs live service nodes.
- **Deployment & Scaling**: Provision cluster resources, scale replicas, and inspect hot-reload logs.`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action) => {
        return (
          <div
            key={action.name}
            onClick={() => {
              if (handleAgentMatrixClick) {
                handleAgentMatrixClick(action.name);
              }
            }}
            className={`p-6 rounded-[24px] border ${action.borderColor} bg-[#0c0e14]/50 backdrop-blur-xl relative overflow-hidden transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]`}
            style={{
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Background radial glow */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 ${action.bgGlow} rounded-full filter blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500`} />

            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <div className={`text-2xl ${action.colorClass}`}>{action.icon}</div>
              <span className={`text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full ${action.badgeColor}`}>
                {action.name.toUpperCase()}
              </span>
            </div>

            {/* Markdown content */}
            <div className="prose prose-invert max-w-none text-brand-muted font-sans text-xs leading-relaxed space-y-2">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 mb-2">
                      <span className={`w-1 h-3.5 rounded ${action.indicatorColor}`} />
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => <p className="text-brand-muted text-xs leading-relaxed mb-2 font-medium">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-xs text-brand-muted mb-2">{children}</ul>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  code: ({ children }) => (
                    <code className="px-1 py-0.5 rounded bg-white/[0.08] font-mono text-[10px] text-white">
                      {children}
                    </code>
                  )
                }}
              >
                {action.markdown}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}

