import { useState } from "react";

export default function useAgents() {

  const [
    selectedAgentNode,
    setSelectedAgentNode,
  ] = useState(null);

  const [
    agentDiagnosticLogs,
    setAgentDiagnosticLogs,
  ] = useState("");

  const [
    isAgentDiagnosing,
    setIsAgentDiagnosing,
  ] = useState(false);

  const [agentDetails, setAgentDetails] =
    useState({
      Planner: {
        allocatedRAM: 16,
        cores: 8,
        model: "Gemini Pro (Advanced)",
        latency: "0.12s",
      },

      "Backend Dev": {
        allocatedRAM: 24,
        cores: 12,
        model: "Gemini Pro (Advanced)",
        latency: "0.22s",
      },

      "Frontend Dev": {
        allocatedRAM: 16,
        cores: 6,
        model: "Gemini Flash (Hyper-Fast)",
        latency: "0.15s",
      },

      "Code Reviewer": {
        allocatedRAM: 8,
        cores: 4,
        model: "Gemini Flash (Hyper-Fast)",
        latency: "0.10s",
      },

      Executor: {
        allocatedRAM: 32,
        cores: 16,
        model: "Gemini Pro (Advanced)",
        latency: "0.32s",
      },

      DevOps: {
        allocatedRAM: 16,
        cores: 8,
        model: "Gemini Flash (Hyper-Fast)",
        latency: "0.28s",
      },
    });

  return {

    selectedAgentNode,
    setSelectedAgentNode,

    agentDiagnosticLogs,
    setAgentDiagnosticLogs,

    isAgentDiagnosing,
    setIsAgentDiagnosing,

    agentDetails,
    setAgentDetails,
  };
}