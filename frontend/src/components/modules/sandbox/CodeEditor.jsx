import { FiPlay, FiSave } from "react-icons/fi";

export default function CodeEditor({
  activeFileTab,
  editingFileContent,
  setEditingFileContent,
  handleSaveFileContent,
  handleRunScript,
  isEditingFile,
  setIsEditingFile,
  openedProject,
  isRunningFileScript,
}) {
  return (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl overflow-hidden h-full flex flex-col">

      {/* TOP BAR */}
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center justify-between bg-black/20">

        {/* FILE TAB */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />

          <span className="text-sm font-mono text-white">
            {activeFileTab}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">

          {/* SAVE */}
          <button
            onClick={() =>
              handleSaveFileContent(openedProject)
            }
            className="h-9 px-4 rounded-xl border border-white/[0.06] hover:border-brand-gold/40 bg-white/[0.02] hover:bg-brand-gold/10 text-xs font-mono text-white flex items-center gap-2 transition-all"
          >
            <FiSave />

            Save
          </button>

          {/* RUN */}
          <button
            onClick={handleRunScript}
            disabled={isRunningFileScript}
            className="h-9 px-4 rounded-xl bg-brand-gold hover:bg-amber-300 text-black text-xs font-bold font-mono flex items-center gap-2 transition-all disabled:opacity-60"
          >
            <FiPlay />

            {isRunningFileScript
              ? "Running..."
              : "Run"}
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-hidden">

        <textarea
          value={editingFileContent}
          onChange={(e) => {
            setEditingFileContent(e.target.value);
            setIsEditingFile(true);
          }}
          spellCheck={false}
          className="w-full h-full bg-transparent resize-none outline-none border-none p-6 text-sm text-white font-mono leading-7 overflow-auto"
        />
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/[0.05] bg-black/20 px-5 flex items-center justify-between text-[10px] uppercase tracking-widest font-mono text-brand-muted">

        <span>
          {isEditingFile
            ? "Unsaved Changes"
            : "Saved"}
        </span>

        <span>
          Sandbox Editor v2.0
        </span>
      </div>
    </div>
  );
}