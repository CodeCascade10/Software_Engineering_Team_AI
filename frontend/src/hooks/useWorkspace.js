import { useState } from "react";


export default function useWorkspace() {
  const [activeTab, setActiveTab] = useState("planner");
  const [promptInput, setPromptInput] = useState("");
  const [stack, setStack] = useState("FastAPI");
  const [isGenerating, setIsGenerating] = useState(false);

  return {
    activeTab,
    setActiveTab,
    promptInput,
    setPromptInput,
    stack,
    setStack,
    isGenerating,
    setIsGenerating,
  };
}
