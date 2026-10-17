import useWorkspace from "./useWorkspace";
import useToast from "./useToast";
import useCommandPalette from "./useCommandPalette";
import useProjects from "./useProjects";
import useLogs from "./useLogs";
import useSandbox from "./useSandbox";
import useProjectActions from "./useProjectActions";
import useSandboxActions from "./useSandboxActions";


export default function useDashboardBuilder(allCommands) {
  const {
    activeTab,
    setActiveTab,
    promptInput,
    setPromptInput,
    stack,
    setStack,
    isGenerating,
    setIsGenerating,
  } = useWorkspace();
  const { toasts, pushToast } = useToast();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    commandPaletteQuery,
    setCommandPaletteQuery,
    filteredCommands,
  } = useCommandPalette(allCommands);
  const { projects, setProjects } = useProjects();
  const { logs, setLogs } = useLogs();
  const sandbox = useSandbox();

  const projectActions = useProjectActions({
    pushToast,
    setProjects,
    setLogs,
  });
  const sandboxActions = useSandboxActions({
    pushToast,
    ...sandbox,
  });

  return {
    activeTab,
    setActiveTab,
    promptInput,
    setPromptInput,
    stack,
    setStack,
    isGenerating,
    setIsGenerating,
    toasts,
    pushToast,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    commandPaletteQuery,
    setCommandPaletteQuery,
    filteredCommands,
    projects,
    setProjects,
    logs,
    setLogs,
    ...sandbox,
    ...projectActions,
    ...sandboxActions,
  };
}
