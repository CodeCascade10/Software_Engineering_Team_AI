import SandboxPanel from "../modules/sandbox/SandboxPanel";

import ClusterPanel from "../modules/cluster/ClusterPanel";

import AgentPanel from "../modules/agents/AgentPanel";

export default function DashboardContent({
  activeTab,

  // sandbox
  sandboxProps,

  // cluster
  clusterProps,

  // agents
  agentProps,
}) {

  switch (activeTab) {

    case "sandbox":
      return (
        <SandboxPanel
          {...sandboxProps}
        />
      );

    case "cluster":
      return (
        <ClusterPanel
          {...clusterProps}
        />
      );

    case "agents":
      return (
        <AgentPanel
          {...agentProps}
        />
      );

    case "metrics":
      return (
        <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl h-[650px] flex items-center justify-center text-brand-muted font-mono">
          Metrics dashboard coming soon...
        </div>
      );

    default:
      return null;
  }
}