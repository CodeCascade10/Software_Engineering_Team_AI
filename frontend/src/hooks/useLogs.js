import { useState } from "react";

export default function useLogs() {

  const [logs, setLogs] =
    useState({});

  return {
    logs,
    setLogs,
  };
}