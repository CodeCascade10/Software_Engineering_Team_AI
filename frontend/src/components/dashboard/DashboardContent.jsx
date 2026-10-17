import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiServer, FiCode, FiCpu } from "react-icons/fi";

import PlannerPanel from "../modules/planner/PlannerPanel";
import SandboxPanel from "../modules/sandbox/SandboxPanel";
import FrontendWorkspacePanel from "../modules/sandbox/FrontendWorkspacePanel";
import ReviewerPanel from "../modules/reviewer/ReviewerPanel";

export default function DashboardContent({ sandboxProps }) {
  const [rightActiveTab, setRightActiveTab] = useState("backend");

  const isProjectLoaded = !!sandboxProps.openedProject;

  if (!isProjectLoaded) {
    return null;
  }

  const allFiles = sandboxProps.projectFiles[sandboxProps.openedProject] || [];
  const reviewFile = allFiles.find((file) => file.file_name === "review.md");
  const backendFiles = allFiles.filter((file) => file.file_name.startsWith("backend/"));
  const backendProjectFiles = {
    [sandboxProps.openedProject]: backendFiles,
  };
  const frontendFiles = allFiles.filter((file) => file.file_name.startsWith("frontend/"));

  const handleTabChange = (tabId) => {
    setRightActiveTab(tabId);
    const availableFiles = tabId === "backend" ? backendFiles : frontendFiles;
    if (
      availableFiles.length > 0
      && !availableFiles.some((file) => file.file_name === sandboxProps.activeFileTab)
    ) {
      setSandboxFile(availableFiles[0]);
    }
  };

  const setSandboxFile = (file) => {
    sandboxProps.setActiveFileTab(file.file_name);
    sandboxProps.setEditingFileContent(file.content);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-8 min-h-[820px] w-full">
      
      {/* LEFT COLUMN: ARCHITECTURE PLAN */}
      <div className="flex flex-col h-[820px] overflow-y-auto pr-1">
        <PlannerPanel
          projectFiles={sandboxProps.projectFiles}
          openedProject={sandboxProps.openedProject}
          onResetWorkspace={sandboxProps.onResetWorkspace}
          setProjectFiles={sandboxProps.setProjectFiles}
          setOpenedProject={sandboxProps.setOpenedProject}
          setActiveFileTab={sandboxProps.setActiveFileTab}
          pushToast={sandboxProps.pushToast}
        />
      </div>

      {/* RIGHT COLUMN: WORKSPACE TABS */}
      <div className="flex flex-col h-[820px] bg-[#0c0e14]/40 border border-white/[0.05] rounded-[32px] overflow-hidden">
        
        {/* TABS HEADER */}
        <div className="h-16 border-b border-white/[0.05] bg-black/25 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-white font-mono uppercase">
              WORKSPACE CHANNELS
            </span>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.05] gap-1">
            {[
              { id: "backend", label: "Backend", icon: FiServer, color: "text-brand-blue" },
              { id: "frontend", label: "Frontend", icon: FiCode, color: "text-purple-400" },
              { id: "reviewer", label: "Reviewer", icon: FiCpu, color: "text-brand-green" },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = rightActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.06] border border-white/[0.08] text-white shadow-sm"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  <TabIcon className={tab.color} size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={rightActiveTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {rightActiveTab === "backend" && (
                <SandboxPanel
                  {...sandboxProps}
                  projectFiles={backendProjectFiles}
                />
              )}
              {rightActiveTab === "frontend" && (
                <FrontendWorkspacePanel
                  {...sandboxProps}
                />
              )}
              {rightActiveTab === "reviewer" && (
                <ReviewerPanel reviewContent={reviewFile?.content} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
