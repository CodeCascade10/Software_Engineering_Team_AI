import { FiLogOut } from "react-icons/fi";

export default function Navbar({
  activeTab,
  setActiveTab,
  setIsCommandPaletteOpen,
  logout,
  pushToast,
}) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-[#080a0f]/80 backdrop-blur-xl border-b border-white/[0.04] px-6 lg:px-12 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-brand-goldDim border border-brand-gold/30 flex items-center justify-center relative">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping absolute" />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold relative z-10" />
          </div>

          <span className="font-mono text-sm tracking-[0.2em] font-extrabold text-white">
            CODENEXUS <span className="text-brand-gold">AI</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="hidden md:flex items-center gap-1">
          {["sandbox", "agents", "metrics", "cluster"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-mono font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-xl border transition-all ${
                activeTab === tab
                  ? "bg-white/[0.03] border-white/[0.08] text-white"
                  : "border-transparent text-brand-muted hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        
        {/* Command Palette */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-3 bg-black/40 border border-white/[0.06] hover:border-white/[0.12] rounded-xl px-4 py-2 text-xs font-mono text-brand-muted transition-all duration-200"
        >
          <span>Search console...</span>

          <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] text-[10px]">
            Ctrl+K
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 border-l border-white/[0.05] pl-4">
          
          <div
            onClick={() => {
              pushToast(
                "Secure credentials profile role: Senior Architect",
                "success"
              );
            }}
            className="w-8 h-8 rounded-lg bg-brand-blueDim border border-brand-blue/30 flex items-center justify-center text-xs font-bold text-brand-blue font-mono cursor-pointer hover:bg-brand-blueDim/20"
            title="System Profile Information"
          >
            SE
          </div>

          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center text-sm transition-all duration-200"
            title="Logout Session"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </nav>
  );
}