import ReactMarkdown from "react-markdown";
import { FiCpu, FiGrid, FiSearch, FiServer } from "react-icons/fi";


const agents = [
  {
    name: "Planner",
    icon: <FiGrid />,
    colorClass: "text-amber-400",
    borderColor: "border-amber-500/10 hover:border-amber-500/30",
    bgGlow: "bg-amber-500/5",
    badgeColor: "bg-amber-500/10 text-amber-400",
    markdown: "Creates the project architecture, API contract, data model, security requirements, and implementation plan.",
    output: "architecture.md",
  },
  {
    name: "Backend Dev",
    icon: <FiServer />,
    colorClass: "text-blue-400",
    borderColor: "border-blue-500/10 hover:border-blue-500/30",
    bgGlow: "bg-blue-500/5",
    badgeColor: "bg-blue-500/10 text-blue-400",
    markdown: "Generates backend source files for the selected stack and the project-specific API contract.",
    output: "Backend source and configuration files",
  },
  {
    name: "Frontend Dev",
    icon: <FiCpu />,
    colorClass: "text-purple-400",
    borderColor: "border-purple-500/10 hover:border-purple-500/30",
    bgGlow: "bg-purple-500/5",
    badgeColor: "bg-purple-500/10 text-purple-400",
    markdown: "Builds a React interface using the generated backend files and matching their actual routes and payloads.",
    output: "React source and package files",
  },
  {
    name: "Code Reviewer",
    icon: <FiSearch />,
    colorClass: "text-green-400",
    borderColor: "border-green-500/10 hover:border-green-500/30",
    bgGlow: "bg-green-500/5",
    badgeColor: "bg-green-500/10 text-green-400",
    markdown: "Reviews the generated plan and source files for likely security, correctness, and integration issues. It reports findings; it does not claim to execute tests.",
    output: "review.md",
  },
];


export default function AgentGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {agents.map((agent) => (
        <article
          key={agent.name}
          className={`p-6 rounded-[24px] border ${agent.borderColor} bg-[#0c0e14]/50 backdrop-blur-xl relative overflow-hidden transition-all duration-300 group`}
        >
          <div className={`absolute -top-10 -right-10 w-24 h-24 ${agent.bgGlow} rounded-full filter blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500`} />
          <div className="relative flex items-center justify-between mb-4">
            <div className={`text-2xl ${agent.colorClass}`}>{agent.icon}</div>
            <span className={`text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full ${agent.badgeColor}`}>
              {agent.name.toUpperCase()}
            </span>
          </div>
          <div className="relative prose prose-invert max-w-none text-brand-muted font-sans text-xs leading-relaxed space-y-2">
            <h3 className="text-sm font-bold text-white tracking-tight">{agent.name}</h3>
            <ReactMarkdown>{agent.markdown}</ReactMarkdown>
            <p className="pt-2 text-[10px] font-mono text-brand-muted">Output: {agent.output}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
