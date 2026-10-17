import API from "../api/axios";

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function startProjectWorkflow(projectId, setLogs, pushToast) {
  await API.post(`/workflow/start/${encodeURIComponent(projectId)}`);
  pushToast("Four-agent workflow started", "success");

  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    let statusResponse;
    let logsResponse;
    try {
      [statusResponse, logsResponse] = await Promise.all([
        API.get(`/workflow/status/${encodeURIComponent(projectId)}`),
        API.get(`/logs/${encodeURIComponent(projectId)}`),
      ]);
    } catch (error) {
      if (error.response && error.response.status < 500) throw error;
      await wait(1800);
      continue;
    }

    const logs = logsResponse.data.map((entry) => ({
      agent: entry.agent,
      status: entry.status,
      message: entry.message,
      timestamp: entry.timestamp,
    }));
    setLogs(logs);

    const { status, error } = statusResponse.data;
    if (status === "completed") {
      pushToast("All four agents completed", "success");
      return statusResponse.data;
    }
    if (status === "needs_review") {
      pushToast("Generation finished with findings that need review", "error");
      return statusResponse.data;
    }
    if (status === "cancelled") {
      pushToast("Workflow was cancelled", "error");
      return statusResponse.data;
    }
    if (status === "failed") {
      throw new Error(error || "Agent workflow failed");
    }

    await wait(1200);
  }

  throw new Error("The workflow is still running. Reopen the project to check its status.");
}
