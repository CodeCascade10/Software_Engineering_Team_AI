import {
  runAgentDiagnostics,
} from "../services/agentService";

export default function useAgentActions({
  pushToast,

  setSelectedAgentNode,

  setAgentDiagnosticLogs,
  setIsAgentDiagnosing,
}) {

  const handleAgentMatrixClick =
    async (agentName) => {

      setSelectedAgentNode(agentName);

      await runAgentDiagnostics(
        agentName,

        setAgentDiagnosticLogs,
        setIsAgentDiagnosing,

        pushToast
      );
    };

  return {
    handleAgentMatrixClick,
  };
}