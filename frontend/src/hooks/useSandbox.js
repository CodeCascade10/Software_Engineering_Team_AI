import { useState } from "react";

export default function useSandbox() {

  const [projectFiles, setProjectFiles] =
    useState({});

  const [openedProject, setOpenedProject] =
    useState(null);

  const [expandedProject, setExpandedProject] =
    useState(null);

  const [activeFileTab, setActiveFileTab] =
    useState("main.py");

  const [
    editingFileContent,
    setEditingFileContent,
  ] = useState("");

  const [isEditingFile, setIsEditingFile] =
    useState(false);

  return {

    // FILES
    projectFiles,
    setProjectFiles,

    // PROJECTS
    openedProject,
    setOpenedProject,

    expandedProject,
    setExpandedProject,

    // FILE TABS
    activeFileTab,
    setActiveFileTab,

    // EDITOR
    editingFileContent,
    setEditingFileContent,

    isEditingFile,
    setIsEditingFile,

  };
}
