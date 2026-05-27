import AgentDiagnostics from "./AgentDiagnostics";

export default function AgentPanel({
  selectedAgentNode,
  agentDetails,
  agentDiagnosticLogs,
  isAgentDiagnosing,
}) {
  return (
    <div className="h-[650px]">

      <AgentDiagnostics
        selectedAgentNode={selectedAgentNode}
        agentDetails={agentDetails}
        agentDiagnosticLogs={agentDiagnosticLogs}
        isAgentDiagnosing={isAgentDiagnosing}
      />
    </div>
  );
}