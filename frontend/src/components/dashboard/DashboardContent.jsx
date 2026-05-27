import PlannerPanel from "../modules/planner/PlannerPanel";
import SandboxPanel from "../modules/sandbox/SandboxPanel";
import FrontendWorkspacePanel from "../modules/sandbox/FrontendWorkspacePanel";
import ReviewerPanel from "../modules/reviewer/ReviewerPanel";
import { FiHardDrive } from "react-icons/fi";

export default function DashboardContent({
  activeTab,
  sandboxProps,
}) {
  const isProjectLoaded = !!sandboxProps.openedProject;

  // Placeholder for when tabs requiring generated codebase are opened before generation
  const renderPlaceholder = (moduleName) => (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-[32px] h-[550px] flex flex-col items-center justify-center text-center p-8 font-mono space-y-4">
      <FiHardDrive size={40} className="text-brand-muted shrink-0" />
      <div>
        <h4 className="text-white font-bold text-sm tracking-wide">
          {moduleName} Sandbox Locked
        </h4>
        <p className="text-brand-muted text-xs max-w-sm leading-relaxed mt-2">
          No generated project code was detected. Please navigate to the **Planner** tab to describe your system architecture and initialize your AI team.
        </p>
      </div>
    </div>
  );

  switch (activeTab) {
    case "planner":
      return (
        <PlannerPanel
          projectFiles={sandboxProps.projectFiles}
          openedProject={sandboxProps.openedProject}
          onResetWorkspace={sandboxProps.onResetWorkspace}
        />
      );

    case "backend":
      if (!isProjectLoaded) {
        return renderPlaceholder("Backend");
      }
      // Filter backend specific files: Python (.py) and configuration (.txt)
      const allFiles = sandboxProps.projectFiles[sandboxProps.openedProject] || [];
      const backendFiles = allFiles.filter(
        (f) =>
          f.file_name.endsWith(".py") ||
          f.file_name.endsWith(".txt")
      );
      const backendProjectFiles = {
        [sandboxProps.openedProject]: backendFiles,
      };

      return (
        <SandboxPanel
          {...sandboxProps}
          projectFiles={backendProjectFiles}
        />
      );

    case "frontend":
      if (!isProjectLoaded) {
        return renderPlaceholder("Frontend");
      }
      return (
        <FrontendWorkspacePanel
          {...sandboxProps}
        />
      );

    case "reviewer":
      return (
        <ReviewerPanel />
      );

    default:
      return null;
  }
}