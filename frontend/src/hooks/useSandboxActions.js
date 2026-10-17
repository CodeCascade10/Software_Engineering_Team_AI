import {
  fetchProjectFiles,
  saveProjectFile,
} from "../services/projectService";

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

  return {
    handleFetchFiles,
    handleSaveFileContent,
  };
}
