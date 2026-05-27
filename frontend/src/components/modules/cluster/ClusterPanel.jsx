import {
  FiServer,
  FiCpu,
  FiHardDrive,
  FiActivity,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

export default function ClusterPanel({
  clusterPods,
  handleProvisionPod,
  handleScaleDownPod,
  isClusterScaling,
}) {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-black text-white">
            Cluster Infrastructure
          </h2>

          <p className="text-sm text-brand-muted mt-1">
            Active orchestration containers and runtime nodes
          </p>
        </div>

        {/* ACTION */}
        <button
          onClick={handleProvisionPod}
          disabled={isClusterScaling}
          className="h-11 px-5 rounded-2xl bg-brand-gold hover:bg-amber-300 text-black text-sm font-bold font-mono flex items-center gap-2 transition-all disabled:opacity-60"
        >
          <FiPlus />

          {isClusterScaling
            ? "Provisioning..."
            : "Provision Pod"}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {clusterPods.map((pod) => (

          <div
            key={pod.id}
            className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl p-5 relative overflow-hidden"
          >

            {/* glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/[0.03] to-transparent pointer-events-none" />

            {/* TOP */}
            <div className="flex items-start justify-between relative z-10">

              <div className="flex items-start gap-4">

                {/* ICON */}
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                  <FiServer className="text-brand-blue text-lg" />
                </div>

                {/* INFO */}
                <div>

                  <h3 className="text-white font-bold">
                    {pod.name}
                  </h3>

                  <p className="text-[11px] font-mono uppercase tracking-widest text-brand-muted mt-1">
                    {pod.id}
                  </p>
                </div>
              </div>

              {/* STATUS */}
              <div
                className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-mono ${
                  pod.status === "online"
                    ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                    : "bg-brand-gold/10 border-brand-gold/20 text-brand-gold"
                }`}
              >
                {pod.status}
              </div>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">

              {/* CPU */}
              <div className="bg-black/20 border border-white/[0.04] rounded-2xl p-3">

                <div className="flex items-center gap-2 text-brand-muted text-[10px] uppercase tracking-widest font-mono mb-2">
                  <FiCpu />
                  CPU
                </div>

                <div className="text-white font-bold text-lg">
                  {pod.load}%
                </div>
              </div>

              {/* RAM */}
              <div className="bg-black/20 border border-white/[0.04] rounded-2xl p-3">

                <div className="flex items-center gap-2 text-brand-muted text-[10px] uppercase tracking-widest font-mono mb-2">
                  <FiHardDrive />
                  Memory
                </div>

                <div className="text-white font-bold text-lg">
                  {pod.ram}
                </div>
              </div>

              {/* HEALTH */}
              <div className="bg-black/20 border border-white/[0.04] rounded-2xl p-3">

                <div className="flex items-center gap-2 text-brand-muted text-[10px] uppercase tracking-widest font-mono mb-2">
                  <FiActivity />
                  Health
                </div>

                <div className="text-brand-green font-bold text-lg">
                  99%
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end mt-5 relative z-10">

              <button
                onClick={() =>
                  handleScaleDownPod(pod.id)
                }
                className="h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2 transition-all"
              >
                <FiTrash2 />

                Scale Down
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}