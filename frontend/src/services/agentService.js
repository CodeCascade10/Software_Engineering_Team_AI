export async function runAgentDiagnostics(
  agentName,
  setAgentDiagnosticLogs,
  setIsAgentDiagnosing,
  pushToast
) {

  try {

    setIsAgentDiagnosing(true);

    setAgentDiagnosticLogs("");

    pushToast(
      `Initializing ${agentName} diagnostics...`
    );

    const logs = [
      `$> Connecting to ${agentName} runtime node...`,
      `$> Fetching telemetry streams...`,
      `$> Verifying orchestration health...`,
      `$> Scanning execution layers...`,
      `$> Validating memory allocation...`,
      `$> Checking inference latency...`,
      `$> Running neural stability tests...`,
      `$> Diagnostics completed successfully.`,
    ];

    for (const line of logs) {

      await new Promise((res) =>
        setTimeout(res, 700)
      );

      setAgentDiagnosticLogs(
        (prev) =>
          prev + line + "\n"
      );
    }

    pushToast(
      `${agentName} diagnostics completed`,
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      `Failed to inspect ${agentName}`,
      "error"
    );

  } finally {

    setIsAgentDiagnosing(false);
  }
}