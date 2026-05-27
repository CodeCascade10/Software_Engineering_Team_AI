import {
  createLocalProject,
} from "../services/projectService";

import {
  startProjectWorkflow,
} from "../services/workflowService";

export default function useProjectActions({
  pushToast,

  // projects
  projects,
  setProjects,

  // logs
  setLogs,
}) {

  // CREATE PROJECT
  const handleCreateProject =
    async (prompt) => {

      return await createLocalProject(
        prompt,

        projects,
        setProjects,

        pushToast
      );
    };

  // START WORKFLOW
  const handleStartWorkflow =
    async (projectId) => {

      await startProjectWorkflow(
        projectId,

        setLogs,

        pushToast
      );
    };

  return {
    handleCreateProject,
    handleStartWorkflow,
  };
}