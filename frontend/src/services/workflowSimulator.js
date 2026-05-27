export async function simulateWorkflow({

  setLogs,

  setIsGenerating,

  pushToast,

  workflowMode,

  runtime,

}) {

  try {

    setIsGenerating(true);

    setLogs([]);

    const steps = [

      {
        agent: "Planner",
        status: "running",
        message:
          "Analyzing requirements and generating architecture blueprint...",
        delay: 1400,
      },

      {
        agent: "Backend Dev",
        status: "running",
        message:
          "Generating API routes, auth handlers, and service layers...",
        delay: 1800,
      },

      {
        agent: "Frontend Dev",
        status: "running",
        message:
          "Building React components and Tailwind interface systems...",
        delay: 1700,
      },

      {
        agent: "Reviewer",
        status: "running",
        message:
          "Running security analysis and validating generated code...",
        delay: 1400,
      },

      {
        agent: "Executor",
        status: "running",
        message:
          "Launching sandbox runtime and executing application build...",
        delay: 1800,
      },

      {
        agent: "DevOps",
        status: "running",
        message:
          "Preparing deployment pipeline and orchestration containers...",
        delay: 1500,
      },
    ];

    const activeSteps =
      workflowMode === "Planner Only"
        ? [steps[0]]
        : workflowMode === "Reviewer Only"
        ? [steps[3]]
        : workflowMode === "Debugger Only"
        ? [steps[4]]
        : workflowMode === "Deploy Only"
        ? [steps[5]]
        : steps;

    for (const step of activeSteps) {

      setLogs((prev) => [
        ...prev,
        step,
      ]);

      await new Promise((res) =>
        setTimeout(res, step.delay)
      );

      setLogs((prev) =>
        prev.map((x) =>
          x.agent === step.agent
            ? {
                ...x,
                status: "completed",
              }
            : x
        )
      );
    }

    pushToast(
      `${workflowMode} completed successfully using ${runtime}`,
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Workflow execution failed",
      "error"
    );

  } finally {

    setIsGenerating(false);
  }
}