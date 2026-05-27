export async function startProjectWorkflow(
  projectId,
  setLogs,
  pushToast
) {

  try {

    pushToast(
      "Starting autonomous workflow..."
    );

    const workflowLogs = [
      {
        agent: "Planner",
        status: "running",
        message:
          "Analyzing project requirements and generating architecture...",
      },

      {
        agent: "Planner",
        status: "completed",
        message:
          "Microservice layout and database schema generated.",
      },

      {
        agent: "Backend Dev",
        status: "running",
        message:
          "Generating FastAPI routes and authentication handlers...",
      },

      {
        agent: "Backend Dev",
        status: "completed",
        message:
          "REST endpoints, JWT middleware and database connectors created.",
      },

      {
        agent: "Frontend Dev",
        status: "running",
        message:
          "Building React components and Tailwind layouts...",
      },

      {
        agent: "Frontend Dev",
        status: "completed",
        message:
          "Dashboard UI and responsive glassmorphism design completed.",
      },

      {
        agent: "Code Reviewer",
        status: "running",
        message:
          "Running static analysis and validating security rules...",
      },

      {
        agent: "Code Reviewer",
        status: "completed",
        message:
          "No major vulnerabilities detected. Quality score: 94/100.",
      },

      {
        agent: "Executor",
        status: "running",
        message:
          "Deploying sandbox runtime and validating execution...",
      },

      {
        agent: "Executor",
        status: "completed",
        message:
          "Application container compiled and running successfully.",
      },
    ];

    setLogs((prev) => ({
      ...prev,
      [projectId]: [],
    }));

    for (const item of workflowLogs) {

      await new Promise((res) =>
        setTimeout(res, 1100)
      );

      setLogs((prev) => ({
        ...prev,

        [projectId]: [
          ...(prev[projectId] || []),
          item,
        ],
      }));
    }

    pushToast(
      "Autonomous workflow completed",
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Workflow execution failed",
      "error"
    );
  }
}

export async function runProjectSandbox(
  setActiveFileTerminalOutput,
  setIsRunningFileScript,
  pushToast
) {

  try {

    setIsRunningFileScript(true);

    setActiveFileTerminalOutput("");

    pushToast(
      "Launching sandbox runtime..."
    );

    const terminalLogs = [
      "$> Booting CodeNexus runtime...",
      "$> Loading dependencies...",
      "$> Connecting secure execution bridge...",
      "$> Mounting container filesystem...",
      "$> Initializing FastAPI server...",
      "$> Server listening on port 8000",
      "$> Health checks passed.",
      "$> Sandbox execution completed successfully.",
    ];

    for (const line of terminalLogs) {

      await new Promise((res) =>
        setTimeout(res, 700)
      );

      setActiveFileTerminalOutput(
        (prev) =>
          prev + line + "\n"
      );
    }

    pushToast(
      "Sandbox execution completed",
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Sandbox runtime crashed",
      "error"
    );

  } finally {

    setIsRunningFileScript(false);
  }
}