import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import API from "../api/axios";

export default function Dashboard() {

  const { logout } = useAuth();

  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState([]);

  const [logs, setLogs] = useState({});

  const [expandedProject, setExpandedProject] = useState(null);

  const fetchProjects = async () => {

    try {

      const response = await API.get(
        "/projects/my-projects"
      );

      setProjects(response.data);

    } catch (err) {

      console.error(err);
    }
  };

 useEffect(() => {

  fetchProjects();

}, []);

useEffect(() => {

  if (!expandedProject) return;

  fetchLogs(expandedProject);

  const interval = setInterval(() => {

    fetchLogs(expandedProject);

  }, 2000);

  return () => clearInterval(interval);

}, [expandedProject]);


  const startWorkflow = async (projectId) => {

  try {

    await API.post(
      `/workflow/start/${projectId}`
    );

    alert("Workflow Started Successfully");

    fetchProjects();

  } catch (err) {

    console.error(err);

    alert("Workflow Failed");
  }
};

  const createProject = async () => {

    if (!prompt) {

      return alert("Enter project idea");
    }

    try {

      setLoading(true);

      await API.post(

        "/projects/create",

        {
          title: "AI Generated Project",
          prompt,
        }
      );

      alert("Project Created Successfully");

      setPrompt("");

      fetchProjects();

    } catch (err) {

      console.error(err);

      alert("Project Creation Failed");

    } finally {

      setLoading(false);
    }
  };


  const fetchLogs = async (projectId) => {

  try {

    const response = await API.get(
      `/logs/${projectId}`
    );

    setLogs((prev) => ({
      ...prev,
      [projectId]: response.data,
    }));

  } catch (err) {

    console.error(err);
  }
};



return (

  <div className="min-h-screen bg-black text-white overflow-hidden">

    {/* Background Glow */}

    <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#1e3a8a33,transparent_30%),radial-gradient(circle_at_bottom_right,#22c55e22,transparent_30%)]" />

    {/* Navbar */}

    <nav className="relative z-10 flex items-center justify-between px-10 py-6 border-b border-zinc-800 backdrop-blur-lg">

      <div className="flex items-center gap-3">

        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_20px_#f97316]" />

        <h1 className="text-2xl font-bold tracking-wide">
          AI Engineering Team
        </h1>

      </div>

      <div className="flex items-center gap-8 text-zinc-300">

        <button className="hover:text-white transition">
          Home
        </button>

        <button className="hover:text-white transition">
          Projects
        </button>

        <button className="hover:text-white transition">
          Workflow
        </button>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl transition"
        >
          Logout
        </button>

      </div>

    </nav>

    {/* Hero Section */}

    <section className="relative z-10 flex flex-col items-center justify-center text-center pt-24 px-6">

      <div className="bg-zinc-900 border border-zinc-800 px-5 py-2 rounded-full text-sm text-orange-400 mb-8">
        v2.0 • Autonomous Multi-Agent System
      </div>

      <h1 className="text-7xl font-black leading-tight max-w-5xl">

        AI SOFTWARE <br />

        <span className="text-orange-500 drop-shadow-[0_0_25px_#f97316]">
          ENGINEERING
        </span>{" "}

        TEAM

      </h1>

      <p className="text-zinc-400 text-xl mt-8 max-w-3xl leading-relaxed">

        Describe your idea. A collaborative team of AI agents plans,
        builds, reviews, and delivers your full-stack project automatically.

      </p>

    </section>

    {/* Agent Workflow */}

    <section className="relative z-10 mt-24 flex justify-center gap-10 flex-wrap px-6">

      {[
        "Planner",
        "Backend Dev",
        "Code Reviewer",
        "Executor",
      ].map((agent, index) => (

        <div
          key={index}
          className="bg-zinc-900/70 border border-zinc-800 backdrop-blur-xl rounded-3xl px-8 py-6 w-[220px] hover:scale-105 transition"
        >

          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500 flex items-center justify-center mb-5 shadow-[0_0_20px_#f97316]">

            🤖

          </div>

          <h3 className="text-2xl font-bold mb-2">
            {agent}
          </h3>

          <p className="text-zinc-400 text-sm">
            Autonomous AI execution pipeline
          </p>

        </div>

      ))}

    </section>

    {/* Generate Panel */}

    <section className="relative z-10 mt-24 flex justify-center px-6 pb-20">

      <div className="w-full max-w-6xl bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">

        <h2 className="text-3xl font-bold mb-6">
          Generate Full Stack Project
        </h2>

        <textarea
          placeholder="Describe your SaaS, AI platform, backend API, or startup idea..."
          className="w-full h-40 bg-black/40 border border-zinc-700 rounded-2xl p-5 text-white outline-none resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={createProject}
          disabled={loading}
          className="mt-6 bg-orange-500 hover:bg-orange-600 transition px-8 py-4 rounded-2xl text-lg font-bold shadow-[0_0_30px_#f97316]"
        >

          {loading ? "Generating..." : "Generate Project"}

        </button>

      </div>

    </section>

{/* Projects */}

<section className="relative z-10 px-10 pb-20">

  <div className="flex items-center justify-between mb-10">

    <h2 className="text-4xl font-black">
      Your Projects
    </h2>

    <div className="text-zinc-500 text-sm">
      {projects.length} Active Projects
    </div>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

    {projects.map((project) => (

      <div
        key={project._id}
        className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl hover:border-orange-500 hover:shadow-[0_0_30px_#f9731620] transition-all duration-300"
      >

        {/* Header */}

        <div className="flex items-start justify-between mb-5">

          <div>

            <h3 className="text-2xl font-bold mb-3 leading-tight">
              {project.title}
            </h3>

            <div className="flex items-center gap-2">

              <span className="text-xs uppercase tracking-wide px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-2">

                {project.status === "running" && (

                  <span className="animate-pulse text-base">
                    🛠️
                  </span>

                )}

                {project.status === "completed" && (

                  <span className="text-base">
                    ⚡
                  </span>

                )}

                {project.status}

              </span>

            </div>

          </div>

          <div className="text-4xl opacity-90">
            
          </div>

        </div>

        {/* Prompt */}

        <div className="bg-black/30 border border-zinc-800 rounded-2xl p-4 mb-8">

          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4">

            {project.prompt}

          </p>

        </div>

                    {/* Buttons */}

        <div className="flex items-center gap-4 mb-6">

          <button
            onClick={() => startWorkflow(project._id)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_#f97316]"
          >

            Run Workflow

          </button>

          <button
            onClick={() =>
              setExpandedProject(

                expandedProject === project._id
                  ? null
                  : project._id

              )
            }
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl transition-all duration-300"
          >

            {expandedProject === project._id
              ? "Hide Logs"
              : "Show Logs"}

          </button>

        </div>

        {/* Expanded Logs */}

        {expandedProject === project._id && (

          <div className="mt-6 border-t border-zinc-800 pt-6">

            {/* Logs Header */}

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">

                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

                <h4 className="text-orange-400 font-bold tracking-wide">
                  LIVE WORKFLOW LOGS
                </h4>

              </div>

              <span className="text-xs text-zinc-500">
                Auto Refreshing
              </span>

            </div>

            {/* Logs Container */}

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">

              {(logs[project._id] || []).length === 0 ? (

                <div className="bg-black/30 border border-zinc-800 rounded-2xl p-5 text-zinc-500 text-sm">

                  Waiting for workflow logs...

                </div>

              ) : (

                logs[project._id].map((log, index) => (

                  <div
                    key={index}
                    className="bg-black/40 border border-zinc-800 rounded-2xl p-4 hover:border-orange-500/30 transition"
                  >

                    <div className="flex items-center justify-between mb-3">

                      <div className="flex items-center gap-2">

                        <span className="text-orange-400 font-bold uppercase text-xs">

                          {log.agent}

                        </span>

                        {log.status === "running" && (

                          <span className="animate-pulse">
                            🛠️
                          </span>

                        )}

                        {log.status === "completed" && (

                          <span>
                            ⚡
                          </span>

                        )}

                      </div>

                      <span className="text-zinc-500 text-xs">

                        {log.status}

                      </span>

                    </div>

                    <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">

                      {log.message}

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

        )}

      </div>

    ))}

  </div>

</section>
    

  </div>

);
}