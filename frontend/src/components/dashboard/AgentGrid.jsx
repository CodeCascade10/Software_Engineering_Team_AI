import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  FiCpu,
  FiLayers,
  FiSearch,
  FiPlay,
  FiGrid,
} from "react-icons/fi";

export default function AgentGrid({ handleAgentMatrixClick }) {
  const [activeAction, setActiveAction] = useState("Strategy");

  const actions = [
    {
      name: "Strategy",
      icon: <FiGrid />,
      activeClass: "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,166,35,0.15)]",
      inactiveClass: "border-white/[0.05] bg-black/20 text-brand-muted hover:border-amber-500/20 hover:text-amber-400",
      desc: "Initialize planning",
      markdown: `### Strategy Phase (AI Planner)
The **AI Planner** designs the high-level architecture blueprint and system schemas.
- **Architectural Design**: Establish routes, components, and data structures.
- **Output Artifact**: Generates \`architecture.md\` development roadmap.
- **Technology Stack**: Fully aware of *FastAPI* or *MERN* stack definitions.`
    },
    {
      name: "Development",
      icon: <FiCpu />,
      activeClass: "bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      inactiveClass: "border-white/[0.05] bg-black/20 text-brand-muted hover:border-blue-500/20 hover:text-blue-400",
      desc: "Trigger generation",
      markdown: `### Development Phase (Dev Agents)
**AI Developers** write the clean, production-ready codebase based on the system blueprint.
- **Backend Service**: Generates controllers, database schemas, model mappings, and REST API routes.
- **Frontend Panel**: Build layouts, glassmorphic UI components, navigation structures, and state hooks.
- **Tech Stack Options**: Dynamically adjusted based on the selected configuration.`
    },
    {
      name: "Audit",
      icon: <FiSearch />,
      activeClass: "bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
      inactiveClass: "border-white/[0.05] bg-black/20 text-brand-muted hover:border-purple-500/20 hover:text-purple-400",
      desc: "Security analysis",
      markdown: `### Audit Phase (Reviewer Agent)
The **AI Code Reviewer** runs automated diagnostics and security audits on the generated workspace.
- **Code Integrity**: Checks for code errors, linting problems, and style discrepancies.
- **Security Check**: Scans for authentication vulnerabilities, loose configuration keys, and DB pool limits.`
    },
    {
      name: "Execute",
      icon: <FiPlay />,
      activeClass: "bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)]",
      inactiveClass: "border-white/[0.05] bg-black/20 text-brand-muted hover:border-green-500/20 hover:text-green-400",
      desc: "Sandbox deploy",
      markdown: `### Execution Phase (Executor & DevOps)
Runs the generated workspace in a fully isolated container runtime sandbox environment.
- **Runtime Compilation**: Compiles client-side bundles and runs live service nodes.
- **Deployment & Scaling**: Provision cluster resources, scale replicas, and inspect hot-reload logs.`
    }
  ];

  const currentAction = actions.find(a => a.name === activeAction) || actions[0];

  return (
    <div className="space-y-6">
      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const isActive = activeAction === action.name;
          return (
            <button
              key={action.name}
              onClick={() => {
                setActiveAction(action.name);
                if (handleAgentMatrixClick) {
                  handleAgentMatrixClick(action.name);
                }
              }}
              className={`flex flex-col items-center justify-center p-6 border-2 rounded-3xl transition-all duration-300 group ${
                isActive ? action.activeClass : action.inactiveClass
              }`}
            >
              <div className="text-xl mb-2">{action.icon}</div>
              <span className="font-bold text-sm tracking-wide">{action.name}</span>
              <span className="text-[9px] opacity-60 mt-1 uppercase font-mono">{action.desc}</span>
            </button>
          );
        })}
      </div>

      {/* DESCRIPTION SECTION (MARKDOWN) */}
      <div className="p-6 rounded-[24px] border border-white/[0.06] bg-[#0c0e14]/50 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full filter blur-2xl pointer-events-none" />
        <div className="prose prose-invert max-w-none text-brand-muted font-sans text-xs leading-relaxed space-y-2">
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3">
                  <span className={`w-1.5 h-4 rounded ${
                    activeAction === "Strategy" ? "bg-amber-400" :
                    activeAction === "Development" ? "bg-blue-400" :
                    activeAction === "Audit" ? "bg-purple-400" : "bg-green-400"
                  }`} />
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="text-brand-muted text-sm leading-relaxed mb-3">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-sm text-brand-muted mb-3">{children}</ul>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded bg-white/[0.08] font-mono text-xs text-white">
                  {children}
                </code>
              )
            }}
          >
            {currentAction.markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
