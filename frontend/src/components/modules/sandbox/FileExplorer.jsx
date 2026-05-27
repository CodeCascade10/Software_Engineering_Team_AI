import {
  FiFileText,
  FiFolder,
} from "react-icons/fi";

export default function FileExplorer({
  projectFiles,
  openedProject,
  activeFileTab,
  handleSelectFile,
}) {

  const files =
    projectFiles[openedProject] || [];

  return (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl overflow-hidden h-full flex flex-col">

      {/* HEADER */}
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center gap-3 bg-black/20">

        <FiFolder className="text-brand-gold" />

        <span className="text-xs font-mono uppercase tracking-widest text-white">
          Project Explorer
        </span>
      </div>

      {/* FILE LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">

        {files.length === 0 && (
          <div className="h-full flex items-center justify-center text-brand-muted text-xs font-mono">
            No files loaded
          </div>
        )}

        {files.map((file, idx) => {

          const isActive =
            activeFileTab === file.file_name;

          return (
            <button
              key={idx}
              onClick={() =>
                handleSelectFile(
                  openedProject,
                  file.file_name
                )
              }
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left group ${
                isActive
                  ? "bg-brand-gold/10 border border-brand-gold/20"
                  : "hover:bg-white/[0.03]"
              }`}
            >

              {/* ICON */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  isActive
                    ? "bg-brand-gold/10 border-brand-gold/20 text-brand-gold"
                    : "bg-white/[0.03] border-white/[0.05] text-brand-muted"
                }`}
              >
                <FiFileText size={14} />
              </div>

              {/* FILE INFO */}
              <div className="flex-1 min-w-0">

                <div
                  className={`text-sm font-mono truncate ${
                    isActive
                      ? "text-white"
                      : "text-brand-text"
                  }`}
                >
                  {file.file_name}
                </div>

                <div className="text-[10px] uppercase tracking-widest text-brand-muted mt-1">
                  source file
                </div>
              </div>

              {/* ACTIVE DOT */}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/[0.05] bg-black/20 px-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-mono text-brand-muted">

        <span>
          {files.length} files
        </span>

        <span>
          sandbox mounted
        </span>
      </div>
    </div>
  );
}