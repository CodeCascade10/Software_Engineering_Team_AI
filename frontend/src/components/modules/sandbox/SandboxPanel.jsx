import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";

export default function SandboxPanel({
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
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 h-[700px]">

      {/* LEFT FILE EXPLORER */}
      <FileExplorer
        projectFiles={projectFiles}
        openedProject={openedProject}
        activeFileTab={activeFileTab}
        handleSelectFile={handleSelectFile}
      />

      {/* RIGHT CODE EDITOR */}
      <CodeEditor
        activeFileTab={activeFileTab}
        editingFileContent={editingFileContent}
        setEditingFileContent={setEditingFileContent}
        handleSaveFileContent={handleSaveFileContent}
        handleRunScript={handleRunScript}
        isEditingFile={isEditingFile}
        setIsEditingFile={setIsEditingFile}
        openedProject={openedProject}
        isRunningFileScript={isRunningFileScript}
      />
    </div>
  );
}