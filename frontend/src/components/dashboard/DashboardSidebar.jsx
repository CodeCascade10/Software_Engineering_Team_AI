import {
  FiGrid,
  FiCpu,
  FiActivity,
  FiServer,
} from "react-icons/fi";

const tabs = [
  {
    id: "sandbox",
    label: "Sandbox",
    icon: FiGrid,
  },

  {
    id: "agents",
    label: "Agents",
    icon: FiCpu,
  },

  {
    id: "metrics",
    label: "Metrics",
    icon: FiActivity,
  },

  {
    id: "cluster",
    label: "Cluster",
    icon: FiServer,
  },
];

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="bg-[#0c0e14]/60 border border-white/[0.05] rounded-3xl p-4 space-y-2">

      {tabs.map((tab) => {

        const Icon = tab.icon;

        const isActive =
          activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id)
            }
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-left ${
              isActive
                ? "bg-brand-gold/10 border border-brand-gold/20 text-white"
                : "hover:bg-white/[0.03] text-brand-muted"
            }`}
          >

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isActive
                  ? "bg-brand-gold/10 border-brand-gold/20 text-brand-gold"
                  : "bg-white/[0.03] border-white/[0.05]"
              }`}
            >
              <Icon size={18} />
            </div>

            <div>
              <div className="font-semibold text-sm">
                {tab.label}
              </div>

              <div className="text-[10px] uppercase tracking-widest font-mono mt-1 opacity-70">
                workspace module
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}