import {
  createProject,
} from "../services/projectService";

import {
  startProjectWorkflow,
} from "../services/workflowService";

export default function useProjectActions({
  pushToast,

  setProjects,

  // logs
  setLogs,
}) {

  // CREATE PROJECT
  const handleCreateProject =
    async (prompt, stack) => {

      return await createProject(
        prompt,
        stack,
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
