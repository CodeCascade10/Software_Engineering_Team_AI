import { useState } from "react";

export default function useWorkspace() {

  // DASHBOARD TAB
  const [activeTab, setActiveTab] =
    useState("planner");

  // WORKSPACE VIEW
  const [
    activeWorkspaceView,
    setActiveWorkspaceView,
  ] = useState("editor");

  // PROMPT
  const [promptInput, setPromptInput] =
    useState("");

  // WORKFLOW MODE
  const [
    workflowMode,
    setWorkflowMode,
  ] = useState("Full Team");

  // STACK
  const [stack, setStack] =
    useState("FastAPI");

  // RUNTIME
  const [runtime, setRuntime] =
    useState("Gemini Pro");

  // GENERATION
  const [isGenerating, setIsGenerating] =
    useState(false);

  return {

    // tabs
    activeTab,
    setActiveTab,

    // workspace
    activeWorkspaceView,
    setActiveWorkspaceView,

    // prompt
    promptInput,
    setPromptInput,

    // workflow
    workflowMode,
    setWorkflowMode,

    // stack
    stack,
    setStack,

    // runtime
    runtime,
    setRuntime,

    // generation
    isGenerating,
    setIsGenerating,
  };
}