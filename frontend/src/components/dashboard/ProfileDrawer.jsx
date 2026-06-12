import {
  FiX,
  FiUser,
  FiMail,
  FiGithub,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";

export default function ProfileDrawer({
  isOpen,
  onClose,
  user,
  onLogout,
}) {

  if (!isOpen) return null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[380px] bg-[#0b0f17] border-l border-white/[0.08] z-50 p-6 overflow-y-auto">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-white font-bold text-lg">
            Profile Center
          </h2>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] flex items-center justify-center"
          >
            <FiX />
          </button>

        </div>

        {/* Avatar */}

        <div className="flex flex-col items-center">

          <div className="w-20 h-20 rounded-3xl bg-brand-blueDim border border-brand-blue/30 flex items-center justify-center text-brand-blue text-2xl font-bold">
            {initials}
          </div>

          <h3 className="mt-4 text-white font-semibold text-lg">
            {user?.name || "Unknown User"}
          </h3>

          <p className="text-brand-muted text-sm">
            {user?.provider || "Local Account"}
          </p>

        </div>

        {/* User Details */}

        <div className="mt-8 space-y-4">

          <div className="rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <FiUser className="text-brand-gold" />
              <span>{user?.name}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <FiMail className="text-cyan-400" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <FiGithub className="text-green-400" />
              <span>
                {user?.provider || "Connected"}
              </span>
            </div>
          </div>

        </div>

        {/* Future Settings */}

        <div className="mt-8">

          <button
            className="w-full rounded-2xl border border-white/[0.06] p-4 flex items-center gap-3 hover:bg-white/[0.03]"
          >
            <FiSettings />
            Preferences
          </button>

        </div>

        {/* Logout */}

        <div className="mt-8">

          <button
            onClick={onLogout}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl py-3 hover:bg-red-500/20 transition flex items-center justify-center gap-2"
          >
            <FiLogOut />
            Logout
          </button>

        </div>

      </div>
    </>
  );
}