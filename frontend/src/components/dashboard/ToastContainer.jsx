import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-20 right-6 z-[100] space-y-3">

      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: 50,
              scale: 0.9,
            }}
            transition={{
              duration: 0.25,
            }}
            className={`min-w-[320px] max-w-[380px] rounded-2xl border backdrop-blur-xl px-4 py-4 shadow-2xl flex items-start gap-3 ${
              toast.type === "error"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-brand-green/10 border-brand-green/20"
            }`}
          >

            {/* ICON */}
            <div
              className={`mt-0.5 ${
                toast.type === "error"
                  ? "text-red-400"
                  : "text-brand-green"
              }`}
            >
              {toast.type === "error" ? (
                <FiAlertTriangle />
              ) : (
                <FiCheckCircle />
              )}
            </div>

            {/* TEXT */}
            <div className="flex-1">
              <div className="text-xs font-mono uppercase tracking-widest text-white/70 mb-1">
                {toast.type === "error"
                  ? "System Error"
                  : "System Success"}
              </div>

              <p className="text-sm text-white leading-relaxed">
                {toast.msg}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}