import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiArrowRight,
  FiCheck,
  FiX,
  FiTerminal,
} from "react-icons/fi";

import API from "../api/axios";

export default function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "None",
    color: "bg-white/[0.06]",
  });

  const [checklist, setChecklist] = useState({
    length: false,
    number: false,
    special: false,
    match: false,
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [successRegistered, setSuccessRegistered] = useState(false);

  const [successLogs, setSuccessLogs] = useState([]);

  useEffect(() => {

    const pwd = formData.password;

    const cpwd = formData.confirmPassword;

    const newChecklist = {
      length: pwd.length >= 8,
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
      match: pwd === cpwd && pwd !== "",
    };

    setChecklist(newChecklist);

    let score = 0;

    if (pwd.length > 0) score += 1;

    if (newChecklist.length) score += 1;

    if (newChecklist.number) score += 1;

    if (newChecklist.special) score += 1;

    let label = "None";

    let color = "bg-white/[0.06]";

    if (score === 1) {

      label = "Weak";

      color = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";

    } else if (score === 2) {

      label = "Moderate";

      color = "bg-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";

    } else if (score === 3) {

      label = "Strong";

      color = "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]";

    } else if (score === 4) {

      label = "Hyper Secure";

      color = "bg-green-500 shadow-[0_0_10px_rgba(61,220,132,0.5)]";
    }

    setPasswordStrength({
      score,
      label,
      color,
    });

  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const runSuccessTerminalSim = async () => {

    const logs = [
      "Establishing secure connection...",
      "API handshake completed...",
      "Initializing AI workspace...",
      "Generating credentials...",
      "Securing encrypted session...",
      "Account created successfully...",
    ];

    for (let i = 0; i < logs.length; i++) {

      await new Promise((res) => setTimeout(res, 450));

      setSuccessLogs((prev) => [
        ...prev,
        logs[i],
      ]);
    }

    await new Promise((res) => setTimeout(res, 700));

    navigate("/login");
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setErrorMsg("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {

      setErrorMsg("Please complete all fields.");

      return;
    }

    if (!acceptedTerms) {

      setErrorMsg("Please accept terms and conditions.");

      return;
    }

    if (formData.password !== formData.confirmPassword) {

      setErrorMsg("Passwords do not match.");

      return;
    }

    if (passwordStrength.score < 3) {

      setErrorMsg("Password is too weak.");

      return;
    }

    try {

      setLoading(true);

      await API.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccessRegistered(true);

      runSuccessTerminalSim();

    } catch (err) {

      console.error(err);

      setErrorMsg(
        "Signup failed. Email may already exist."
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="relative min-h-screen bg-[#080a0f] flex items-center justify-center p-4 overflow-hidden">

      {/* Background */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f5a62322,transparent_30%),radial-gradient(circle_at_bottom_right,#3b82f622,transparent_30%)]" />

      <div className="absolute inset-0 backdrop-blur-[120px]" />

      <AnimatePresence mode="wait">

        {!successRegistered ? (

          <motion.div
            key="signup-form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full max-w-[520px] bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl rounded-[32px] p-8 lg:p-10 relative z-10 shadow-[0_0_60px_rgba(0,0,0,0.4)]"
          >

            {/* Glow */}

            <div className="absolute top-0 right-0 w-40 h-1 bg-gradient-to-l from-amber-400/40 to-transparent" />

            <div className="space-y-6">

              {/* Header */}

              <div className="text-center">

                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-5">

                  <FiShield className="text-amber-400 text-2xl" />

                </div>

                <h1 className="text-4xl font-black text-white tracking-tight">

                  Create Account

                </h1>

                <p className="text-zinc-400 text-sm mt-2">

                  Start building with autonomous AI agents

                </p>

              </div>

              {/* Error */}

              {errorMsg && (

                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-2xl flex items-center gap-2"
                >

                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />

                  <span>{errorMsg}</span>

                </motion.div>

              )}

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* Name */}

                <div className="space-y-2">

                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">

                    Full Name

                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500">

                      <FiUser />

                    </span>

                    <input
                      type="text"
                      name="name"
                      placeholder="Alan Turing"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full bg-black/40 border border-white/[0.06] focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition-all"
                    />

                  </div>

                </div>

                {/* Email */}

                <div className="space-y-2">

                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">

                    Email Address

                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500">

                      <FiMail />

                    </span>

                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full bg-black/40 border border-white/[0.06] focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition-all"
                    />

                  </div>

                </div>

                {/* Passwords */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Password */}

                  <div className="space-y-2">

                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">

                      Password

                    </label>

                    <div className="relative">

                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500">

                        <FiLock />

                      </span>

                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full bg-black/40 border border-white/[0.06] focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition-all"
                      />

                    </div>

                  </div>

                  {/* Confirm */}

                  <div className="space-y-2">

                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">

                      Confirm Password

                    </label>

                    <div className="relative">

                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500">

                        <FiLock />

                      </span>

                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full bg-black/40 border border-white/[0.06] focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition-all"
                      />

                    </div>

                  </div>

                </div>

                {/* Password Strength */}

                {formData.password && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3"
                  >

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-zinc-500 uppercase tracking-wider">

                        Password Strength

                      </span>

                      <span className="font-bold text-white">

                        {passwordStrength.label}

                      </span>

                    </div>

                    <div className="grid grid-cols-4 gap-2">

                      {[1, 2, 3, 4].map((step) => (

                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all ${
                            step <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-white/[0.06]"
                          }`}
                        />

                      ))}

                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">

                      <div className="flex items-center gap-2">

                        {checklist.length
                          ? <FiCheck className="text-green-400" />
                          : <FiX className="text-red-400" />}

                        <span>8+ Characters</span>

                      </div>

                      <div className="flex items-center gap-2">

                        {checklist.number
                          ? <FiCheck className="text-green-400" />
                          : <FiX className="text-red-400" />}

                        <span>Contains Number</span>

                      </div>

                      <div className="flex items-center gap-2">

                        {checklist.special
                          ? <FiCheck className="text-green-400" />
                          : <FiX className="text-red-400" />}

                        <span>Special Character</span>

                      </div>

                      <div className="flex items-center gap-2">

                        {checklist.match
                          ? <FiCheck className="text-green-400" />
                          : <FiX className="text-red-400" />}

                        <span>Passwords Match</span>

                      </div>

                    </div>

                  </motion.div>

                )}

                {/* Terms */}

                <div className="flex items-start gap-3 pt-2">

                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) =>
                      setAcceptedTerms(e.target.checked)
                    }
                    className="mt-1 accent-amber-400"
                  />

                  <p className="text-xs text-zinc-500 leading-relaxed">

                    I agree to the terms and conditions
                    and understand platform usage policies.

                  </p>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(251,191,36,0.2)] hover:shadow-[0_4px_40px_rgba(251,191,36,0.4)] active:scale-[0.98]"
                >

                  {loading ? (

                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >

                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />

                      </svg>

                      <span>Creating Account...</span>

                    </>

                  ) : (

                    <>
                      <span>Create Account</span>

                      <FiArrowRight />

                    </>

                  )}

                </button>

              </form>

              {/* Footer */}

              <div className="text-center pt-2">

                <span className="text-xs text-zinc-500">

                  Already have an account?{" "}

                </span>

                <Link
                  to="/login"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                >

                  Login

                </Link>

              </div>

            </div>

          </motion.div>

        ) : (

          <motion.div
            key="success-terminal"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="w-full max-w-[520px] bg-black border border-amber-400/20 rounded-[28px] p-8 shadow-[0_0_60px_rgba(251,191,36,0.12)] relative z-10 font-mono"
          >

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">

              <div className="flex items-center gap-2">

                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />

                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />

                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />

              </div>

              <span className="text-amber-400 text-xs uppercase tracking-widest flex items-center gap-2">

                <FiTerminal />

                secure_auth.sh

              </span>

            </div>

            <div className="space-y-3 min-h-[180px] text-white/90 text-sm">

              {successLogs.map((log, index) => (

                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="flex items-start gap-2"
                >

                  <span className="text-amber-400 font-bold">
                    $&gt;
                  </span>

                  <span>{log}</span>

                </motion.div>

              ))}

              {successLogs.length < 6 && (

                <div className="flex items-center gap-2">

                  <span className="text-amber-400 font-bold animate-pulse">
                    $&gt;
                  </span>

                  <span className="w-2 h-4 bg-amber-400 inline-block animate-pulse" />

                </div>

              )}

            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500">

              <span>Status: Success</span>

              <span>Redirecting...</span>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );
}