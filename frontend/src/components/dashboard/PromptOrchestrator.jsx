import {
  FiCpu,
  FiCode,
  FiLayers,
  FiPlay,
  FiShield,
  FiTerminal,
} from "react-icons/fi";

export default function PromptOrchestrator({

  promptInput,
  setPromptInput,

  workflowMode,
  setWorkflowMode,

  stack,
  setStack,

  runtime,
  setRuntime,

  handleGenerateProject,

  isGenerating,
}) {

  const workflowModes = [
    "Full Team",
    "Planner Only",
    "Reviewer Only",
    "Debugger Only",
    "Deploy Only",
  ];

  const stacks = [
    "FastAPI",
    "MERN",
    "Next.js",
    "Django",
    "Microservices",
  ];

  const runtimes = [
    "Gemini Pro",
    "Gemini Flash",
    "Hybrid Agents",
  ];

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/[0.05] bg-[#0c0e14]/70 backdrop-blur-xl p-8 lg:p-10">

      {/* BG GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f5a62311,transparent_30%),radial-gradient(circle_at_bottom_right,#3b82f611,transparent_30%)] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.3fr_420px] gap-10">

        {/* LEFT */}
        <div>

          {/* TOP BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] uppercase tracking-[0.2em] font-mono font-bold mb-6">

            <FiCpu />

            Autonomous AI Engineering Core
          </div>

          {/* TITLE */}
          <h2 className="text-4xl lg:text-5xl font-black leading-tight text-white">

            Build software
            <span className="bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold bg-clip-text text-transparent">
              {" "}with AI teams
            </span>
          </h2>

          {/* DESC */}
          <p className="text-brand-muted text-sm leading-relaxed mt-5 max-w-2xl">

            Describe your software idea. Autonomous AI agents will architect,
            generate, review, debug, and deploy your application in a collaborative workflow.
          </p>

          {/* TEXTAREA */}
          <div className="mt-8">

            <textarea
              value={promptInput}
              onChange={(e) =>
                setPromptInput(e.target.value)
              }
              placeholder="Build a FastAPI + React SaaS platform with JWT authentication, Stripe subscriptions, Docker deployment, admin dashboard, and AI chatbot integration..."
              className="w-full h-[220px] rounded-3xl bg-black/30 border border-white/[0.06] focus:border-brand-gold/30 outline-none resize-none p-6 text-white placeholder:text-brand-muted text-sm leading-8 font-mono transition-all"
            />
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
              <FiLayers className="text-brand-gold text-lg mb-3" />

              <div className="text-white font-semibold text-sm">
                Architecture
              </div>

              <div className="text-brand-muted text-xs mt-1">
                System design generation
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
              <FiCode className="text-brand-blue text-lg mb-3" />

              <div className="text-white font-semibold text-sm">
                Fullstack Code
              </div>

              <div className="text-brand-muted text-xs mt-1">
                Backend + frontend generation
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
              <FiShield className="text-purple-400 text-lg mb-3" />

              <div className="text-white font-semibold text-sm">
                Code Review
              </div>

              <div className="text-brand-muted text-xs mt-1">
                Security & QA analysis
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
              <FiTerminal className="text-brand-green text-lg mb-3" />

              <div className="text-white font-semibold text-sm">
                Sandbox Runtime
              </div>

              <div className="text-brand-muted text-xs mt-1">
                Execute generated projects
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">

          {/* WORKFLOW */}
          <div className="rounded-3xl border border-white/[0.05] bg-black/20 p-6">

            <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-brand-muted mb-4">
              Workflow Mode
            </div>

            <div className="space-y-3">

              {workflowModes.map((item) => (

                <button
                  key={item}
                  onClick={() =>
                    setWorkflowMode(item)
                  }
                  className={`w-full text-left px-4 py-4 rounded-2xl border transition-all text-sm font-semibold ${
                    workflowMode === item
                      ? "bg-brand-gold/10 border-brand-gold/20 text-white"
                      : "border-white/[0.05] hover:bg-white/[0.03] text-brand-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* STACK */}
          <div className="rounded-3xl border border-white/[0.05] bg-black/20 p-6">

            <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-brand-muted mb-4">
              Tech Stack
            </div>

            <div className="flex flex-wrap gap-3">

              {stacks.map((item) => (

                <button
                  key={item}
                  onClick={() =>
                    setStack(item)
                  }
                  className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                    stack === item
                      ? "bg-brand-blue/10 border-brand-blue/20 text-white"
                      : "border-white/[0.05] hover:bg-white/[0.03] text-brand-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* RUNTIME */}
          <div className="rounded-3xl border border-white/[0.05] bg-black/20 p-6">

            <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-brand-muted mb-4">
              Runtime Engine
            </div>

            <div className="space-y-3">

              {runtimes.map((item) => (

                <button
                  key={item}
                  onClick={() =>
                    setRuntime(item)
                  }
                  className={`w-full text-left px-4 py-4 rounded-2xl border transition-all text-sm font-semibold ${
                    runtime === item
                      ? "bg-brand-green/10 border-brand-green/20 text-white"
                      : "border-white/[0.05] hover:bg-white/[0.03] text-brand-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleGenerateProject}
            disabled={isGenerating}
            className="w-full h-16 rounded-3xl bg-gradient-to-r from-brand-gold to-amber-300 hover:scale-[1.01] transition-all text-black text-lg font-black tracking-wide flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(245,166,35,0.25)] disabled:opacity-60"
          >

            <FiPlay />

            {isGenerating
              ? "INITIALIZING AI TEAM..."
              : "GENERATE SOFTWARE"}
          </button>
        </div>
      </div>
    </div>
  );
}