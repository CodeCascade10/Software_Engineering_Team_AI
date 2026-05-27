import {
  fetchProjectFiles,
  saveProjectFile,
} from "../services/projectService";

import {
  runProjectSandbox,
} from "../services/workflowService";

export default function useSandboxActions({
  pushToast,

  // sandbox
  setProjectFiles,
  setOpenedProject,
  setActiveFileTab,
  setEditingFileContent,
  setIsEditingFile,

  activeFileTab,
  editingFileContent,
  openedProject,

  // terminal
  setActiveFileTerminalOutput,
  setIsRunningFileScript,
}) {

  // LOAD FILES
  const handleFetchFiles =
    async (projectId) => {

      await fetchProjectFiles(
        projectId,

        setProjectFiles,
        setOpenedProject,
        setActiveFileTab,
        setEditingFileContent,

        pushToast
      );
    };

  // SAVE FILE
  const handleSaveFileContent =
    async () => {

      await saveProjectFile(
        openedProject,
        activeFileTab,
        editingFileContent,

        setProjectFiles,
        setIsEditingFile,

        pushToast
      );
    };

  // RUN FILE
  const handleRunScript =
    async () => {

      await runProjectSandbox(
        setActiveFileTerminalOutput,
        setIsRunningFileScript,
        pushToast
      );
    };

  return {
    handleFetchFiles,
    handleSaveFileContent,
    handleRunScript,
  };
}