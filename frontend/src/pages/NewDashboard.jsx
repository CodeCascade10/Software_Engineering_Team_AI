import Navbar from "../components/dashboard/Navbar";

import HeroSection from "../components/dashboard/HeroSection";

import PromptOrchestrator from "../components/dashboard/PromptOrchestrator";

import ToastContainer from "../components/dashboard/ToastContainer";

import CommandPalette from "../components/dashboard/CommandPalette";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import DashboardContent from "../components/dashboard/DashboardContent";

import DashboardLayout from "../layouts/DashboardLayout";

import AgentGrid from "../components/dashboard/AgentGrid";

import useDashboardBuilder from "../hooks/useDashboardBuilder";

import WorkflowConsole from "../components/dashboard/WorkflowConsole";

const ALL_COMMANDS = [
  {
    cmd: "Create Project",
    desc: "Initialize new autonomous workspace",
    shortcut: "⌘ + P",
  },

  {
    cmd: "Run Workflow",
    desc: "Launch multi-agent orchestration",
    shortcut: "⌘ + R",
  },

  {
    cmd: "Open Sandbox",
    desc: "Inspect runtime execution",
    shortcut: "⌘ + S",
  },

  {
    cmd: "Cluster Metrics",
    desc: "View infrastructure telemetry",
    shortcut: "⌘ + M",
  },

  {
    cmd: "Agent Diagnostics",
    desc: "Inspect AI runtime nodes",
    shortcut: "⌘ + D",
  },
];

export default function NewDashboard() {

  const {

    // workspace
    activeTab,
    setActiveTab,

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

    logs,
    setLogs,

    handleStartWorkflow,
    handleCreateProject,

    // telemetry
    telemetryStats,

    // commands
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,

    commandPaletteQuery,
    setCommandPaletteQuery,

    filteredCommands,

    // toast
    toasts,
    pushToast,

    // sandbox
    projectFiles,
    setProjectFiles,

    openedProject,
    setOpenedProject,

    activeFileTab,
    setActiveFileTab,

    editingFileContent,
    setEditingFileContent,

    isEditingFile,
    setIsEditingFile,

    activeFileTerminalOutput,

    isRunningFileScript,

    // agents
    selectedAgentNode,

    agentDetails,

    agentDiagnosticLogs,

    isAgentDiagnosing,

    // cluster
    clusterPods,

    isClusterScaling,

    // actions
    handleAgentMatrixClick,

    handleProvisionPod,
    handleScaleDownPod,

    handleFetchFiles,

    handleSaveFileContent,

    handleRunScript,

  } = useDashboardBuilder(
    ALL_COMMANDS
  );

  // GENERATE PROJECT
  const handleGenerateProject =
    async () => {

      if (!promptInput.trim()) {

        pushToast(
          "Please describe your software idea",
          "error"
        );

        return;
      }

      try {

        setIsGenerating(true);

        pushToast(
          "Initializing autonomous AI engineering team..."
        );

        const project = await handleCreateProject(promptInput, stack);
        await handleStartWorkflow();
        await handleFetchFiles(project._id);

      } catch (err) {

        console.error(err);

        pushToast(
          "Failed to initialize workflow",
          "error"
        );

      } finally {

        setIsGenerating(false);
      }
    };

  // FILE SELECT
  const handleSelectFile = (
    projectId,
    fileName
  ) => {

    const file =
      projectFiles[projectId]?.find(
        (x) =>
          x.file_name === fileName
      );

    if (!file) return;

    setEditingFileContent(
      file.content
    );
  };

  // COMMAND EXECUTE
  const handleExecuteCommand = (
    cmd
  ) => {

    pushToast(
      `Executed: ${cmd.cmd}`,
      "success"
    );

    setIsCommandPaletteOpen(false);
  };

  return (

    <DashboardLayout

      navbar={
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsCommandPaletteOpen={
            setIsCommandPaletteOpen
          }
          logout={() =>
            pushToast(
              "Session terminated"
            )
          }
          pushToast={pushToast}
          onLogoClick={() => {
            setOpenedProject(null);
            setProjectFiles({});
            setPromptInput("");
            setLogs([]);
          }}
        />
      }

      hero={
        !openedProject || isGenerating ? (
          <div className="space-y-8">
            <PromptOrchestrator
              promptInput={promptInput}
              setPromptInput={setPromptInput}
              workflowMode={workflowMode}
              setWorkflowMode={setWorkflowMode}
              stack={stack}
              setStack={setStack}
              runtime={runtime}
              setRuntime={setRuntime}
              handleGenerateProject={handleGenerateProject}
              isGenerating={isGenerating}
            />

            {isGenerating && (
              <WorkflowConsole
                logs={logs}
                isGenerating={isGenerating}
              />
            )}
          </div>
        ) : null
      }

      sidebar={null}

      content={
        openedProject && !isGenerating ? (
          <DashboardContent
            activeTab={activeTab}
            sandboxProps={{
              projectFiles,
              setProjectFiles,
              openedProject,
              setOpenedProject,
              activeFileTab,
              setActiveFileTab,
              handleSelectFile,
              editingFileContent,
              setEditingFileContent,
              handleSaveFileContent,
              handleRunScript,
              isEditingFile,
              setIsEditingFile,
              isRunningFileScript,
              activeFileTerminalOutput,
              pushToast,
              onResetWorkspace: () => {
                setOpenedProject(null);
                setProjectFiles({});
                setPromptInput("");
                setLogs([]);
              },
            }}
          />
        ) : null
      }

      commandPalette={
        <CommandPalette

          isCommandPaletteOpen={
            isCommandPaletteOpen
          }

          setIsCommandPaletteOpen={
            setIsCommandPaletteOpen
          }

          commandPaletteQuery={
            commandPaletteQuery
          }

          setCommandPaletteQuery={
            setCommandPaletteQuery
          }

          filteredCommands={
            filteredCommands
          }

          handleExecuteCommand={
            handleExecuteCommand
          }
        />
      }

      toasts={
        <ToastContainer
          toasts={toasts}
        />
      }
    />
  );
}