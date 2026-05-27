import { AnimatePresence, motion } from "framer-motion";

export default function CommandPalette({
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  commandPaletteQuery,
  setCommandPaletteQuery,
  filteredCommands,
  handleExecuteCommand,
}) {
  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-start justify-center pt-32 px-4"
          onClick={() => setIsCommandPaletteOpen(false)}
        >

          {/* PANEL */}
          <motion.div
            initial={{
              opacity: 0,
              y: -30,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.96,
            }}
            transition={{
              duration: 0.2,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-white/[0.06] bg-[#0c0e14]/95 backdrop-blur-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          >

            {/* INPUT */}
            <div className="border-b border-white/[0.04] px-5 py-4">
              <input
                autoFocus
                type="text"
                placeholder="Search commands..."
                value={commandPaletteQuery}
                onChange={(e) =>
                  setCommandPaletteQuery(e.target.value)
                }
                className="w-full bg-transparent outline-none text-white placeholder:text-brand-muted text-sm font-mono"
              />
            </div>

            {/* COMMANDS */}
            <div className="max-h-[420px] overflow-y-auto p-2">

              {filteredCommands.length === 0 && (
                <div className="text-center py-10 text-brand-muted text-sm font-mono">
                  No commands found.
                </div>
              )}

              {filteredCommands.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecuteCommand(item)}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-white/[0.03] transition-all text-left group"
                >

                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-brand-gold transition-colors">
                      {item.cmd}
                    </div>

                    <div className="text-xs text-brand-muted mt-1">
                      {item.desc}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-widest text-brand-muted border border-white/[0.06] px-2 py-1 rounded-lg">
                    {item.shortcut}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}