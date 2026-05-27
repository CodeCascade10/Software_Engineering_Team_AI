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

    openedProject,

    activeFileTab,

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

        await new Promise((res) =>
          setTimeout(res, 1800)
        );

        pushToast(
          `${workflowMode} workflow launched using ${runtime}`,
          "success"
        );

        setActiveTab("sandbox");

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
        />
      }

      hero={
        <div className="space-y-8">

          <HeroSection
            telemetryStats={
              telemetryStats
            }
          />

          <PromptOrchestrator

            promptInput={promptInput}
            setPromptInput={setPromptInput}

            workflowMode={workflowMode}
            setWorkflowMode={setWorkflowMode}

            stack={stack}
            setStack={setStack}

            runtime={runtime}
            setRuntime={setRuntime}

            handleGenerateProject={
              handleGenerateProject
            }

            isGenerating={isGenerating}
          />

          <AgentGrid
            handleAgentMatrixClick={
              handleAgentMatrixClick
            }
          />
        </div>
      }

      sidebar={
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      }

      content={
        <DashboardContent

          activeTab={activeTab}

          sandboxProps={{

            projectFiles,

            openedProject,

            activeFileTab,

            handleSelectFile,

            editingFileContent,
            setEditingFileContent,

            handleSaveFileContent,

            handleRunScript,

            isEditingFile,
            setIsEditingFile,

            isRunningFileScript,

            activeFileTerminalOutput,
          }}

          clusterProps={{

            clusterPods,

            handleProvisionPod,

            handleScaleDownPod,

            isClusterScaling,
          }}

          agentProps={{

            selectedAgentNode,

            agentDetails,

            agentDiagnosticLogs,

            isAgentDiagnosing,
          }}
        />
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