import { FiGlobe, FiPlay } from "react-icons/fi";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";


export default function FrontendWorkspacePanel({
  projectFiles,
  openedProject,
  activeFileTab,
  handleSelectFile,
  editingFileContent,
  setEditingFileContent,
  handleSaveFileContent,
  isEditingFile,
  setIsEditingFile,
}) {
  const allFiles = projectFiles[openedProject] || [];
  const frontendFiles = allFiles.filter((file) =>
    /\.(jsx|tsx|js|css|html|json)$/.test(file.file_name),
  );
  const filteredProjectFiles = { [openedProject]: frontendFiles };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[720px]">
      <div className="space-y-6 flex flex-col">
        <div className="p-4 rounded-2xl border border-white/[0.05] bg-[#0c0e14]/50 flex items-center justify-between">
          <span className="text-xs font-mono text-brand-muted uppercase tracking-widest flex items-center gap-2">
            <FiPlay className="text-brand-blue" /> Generated React source
          </span>
          <span className="text-[10px] bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono font-bold px-2.5 py-1 rounded-full uppercase">
            {frontendFiles.length} files
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 h-[580px] flex-1">
          <FileExplorer
            projectFiles={filteredProjectFiles}
            openedProject={openedProject}
            activeFileTab={activeFileTab}
            handleSelectFile={handleSelectFile}
          />
          <CodeEditor
            activeFileTab={activeFileTab}
            editingFileContent={editingFileContent}
            setEditingFileContent={setEditingFileContent}
            handleSaveFileContent={handleSaveFileContent}
            isEditingFile={isEditingFile}
            setIsEditingFile={setIsEditingFile}
            openedProject={openedProject}
          />
        </div>
      </div>

      <section className="rounded-[32px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 min-h-[640px]">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-3xl text-brand-muted mb-5">
          <FiGlobe />
        </div>
        <h3 className="text-white font-bold">Preview unavailable</h3>
        <p className="text-brand-muted text-sm max-w-md mt-2 leading-relaxed">
          This workspace stores and edits generated source files. An isolated sandbox runtime has not been configured, so the project has not been built or executed.
        </p>
      </section>
    </div>
  );
}
