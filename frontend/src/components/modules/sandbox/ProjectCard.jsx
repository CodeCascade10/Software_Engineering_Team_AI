import {
  FiFolder,
  FiClock,
  FiPlay,
  FiTerminal,
  FiFileText,
} from "react-icons/fi";

export default function ProjectCard({
  project,
  expandedProject,
  openedProject,

  setExpandedProject,
  fetchLogs,

  fetchFiles,

  startWorkflow,
  runEverything,
}) {

  const isExpanded =
    expandedProject === project._id;

  const isOpened =
    openedProject === project._id;

  return (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl overflow-hidden">

      {/* TOP */}
      <div className="p-5">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-4">

            {/* ICON */}
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <FiFolder className="text-brand-gold text-lg" />
            </div>

            {/* INFO */}
            <div>
              <h3 className="text-lg font-bold text-white">
                {project.title}
              </h3>

              <p className="text-sm text-brand-muted mt-1 line-clamp-2">
                {project.prompt}
              </p>

              <div className="flex items-center gap-2 mt-3 text-[10px] uppercase tracking-widest font-mono text-brand-muted">

                <FiClock />

                <span>
                  {new Date(
                    project.created_at
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-mono border ${
              project.status === "completed"
                ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                : "bg-brand-gold/10 border-brand-gold/20 text-brand-gold"
            }`}
          >
            {project.status}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3 mt-6">

          {/* WORKFLOW */}
          <button
            onClick={() =>
              startWorkflow(project._id)
            }
            className="h-11 px-5 rounded-2xl border border-white/[0.06] hover:border-brand-gold/30 bg-white/[0.02] hover:bg-brand-gold/10 text-sm font-mono text-white flex items-center gap-2 transition-all"
          >
            <FiPlay />

            Start Workflow
          </button>

          {/* RUN ALL */}
          <button
            onClick={() =>
              runEverything(project._id)
            }
            className="h-11 px-5 rounded-2xl bg-brand-gold hover:bg-amber-300 text-black text-sm font-bold font-mono flex items-center gap-2 transition-all"
          >
            <FiTerminal />

            Run Everything
          </button>

          {/* LOGS */}
          <button
            onClick={() => {
              setExpandedProject(
                isExpanded
                  ? null
                  : project._id
              );

              fetchLogs(project._id);
            }}
            className="h-11 px-5 rounded-2xl border border-white/[0.06] hover:border-brand-blue/30 bg-white/[0.02] hover:bg-brand-blue/10 text-sm font-mono text-white flex items-center gap-2 transition-all"
          >
            <FiTerminal />

            Logs
          </button>

          {/* FILES */}
          <button
            onClick={() =>
              fetchFiles(project._id)
            }
            className="h-11 px-5 rounded-2xl border border-white/[0.06] hover:border-brand-green/30 bg-white/[0.02] hover:bg-brand-green/10 text-sm font-mono text-white flex items-center gap-2 transition-all"
          >
            <FiFileText />

            Files
          </button>
        </div>
      </div>
    </div>
  );
}