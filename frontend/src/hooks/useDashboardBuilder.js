import useWorkspace from "./useWorkspace";

import useTelemetry from "./useTelemetry";

import useToast from "./useToast";

import useCommandPalette from "./useCommandPalette";

import useProjects from "./useProjects";

import useLogs from "./useLogs";

import useSandbox from "./useSandbox";

import useAgents from "./useAgents";

import useCluster from "./useCluster";

import useProjectActions from "./useProjectActions";

import useSandboxActions from "./useSandboxActions";

import useAgentActions from "./useAgentActions";

import useClusterActions from "./useClusterActions";

export default function useDashboardBuilder(
  ALL_COMMANDS
) {

  // WORKSPACE
 const {

  // tabs
  activeTab,
  setActiveTab,

  // workspace
  activeWorkspaceView,
  setActiveWorkspaceView,

  // prompt
  promptInput,
  setPromptInput,

  // workflow
  workflowMode,
  setWorkflowMode,

  // stack
  stack,
  setStack,

  // runtime
  runtime,
  setRuntime,

  // generation
  isGenerating,
  setIsGenerating,

} = useWorkspace();

  // TELEMETRY
  const {
    telemetryStats,
  } = useTelemetry();

  // TOASTS
  const {
    toasts,
    pushToast,
  } = useToast();

  // COMMANDS
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,

    commandPaletteQuery,
    setCommandPaletteQuery,

    filteredCommands,
  } = useCommandPalette(
    ALL_COMMANDS
  );

  // PROJECTS
  const {
    projects,
    setProjects,

    loading,
    setLoading,
  } = useProjects();

  // LOGS
  const {
    logs,
    setLogs,
  } = useLogs();

  // SANDBOX
  const sandbox =
    useSandbox();

  // AGENTS
  const agents =
    useAgents();

  // CLUSTER
  const cluster =
    useCluster();

  // PROJECT ACTIONS
  const projectActions =
    useProjectActions({
      pushToast,

      projects,
      setProjects,

      setLogs,
    });

  // SANDBOX ACTIONS
  const sandboxActions =
    useSandboxActions({
      pushToast,

      ...sandbox,
    });

  // AGENT ACTIONS
  const agentActions =
    useAgentActions({
      pushToast,

      ...agents,
    });

  // CLUSTER ACTIONS
  const clusterActions =
    useClusterActions({
      pushToast,

      ...cluster,
    });

  return {

    // workspace
    activeTab,
    setActiveTab,

    activeWorkspaceView,
    setActiveWorkspaceView,

    promptInput,
    setPromptInput,

    workflowMode,
    setWorkflowMode,

    stack,
    setStack,

    runtime,
    setRuntime,

    isGenerating,
    setIsGenerating,

    // telemetry
    telemetryStats,

    // toasts
    toasts,
    pushToast,

    // commands
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,

    commandPaletteQuery,
    setCommandPaletteQuery,

    filteredCommands,

    // projects
    projects,
    setProjects,

    loading,
    setLoading,

    // logs
    logs,
    setLogs,

    // sandbox
    ...sandbox,

    // agents
    ...agents,

    // cluster
    ...cluster,

    // project actions
    ...projectActions,

    // sandbox actions
    ...sandboxActions,

    // agent actions
    ...agentActions,

    // cluster actions
    ...clusterActions,
  };
}