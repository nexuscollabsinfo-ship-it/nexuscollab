import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { getFriendlyError } from "@/lib/errors";
import { toast } from "sonner";
import {
  Zap, Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle,
} from "lucide-react";

type AuthMode = "login" | "register" | "otp";

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      toast.success("Welcome back!");
      window.location.href = redirect;
    },
    onError: (err) => {
      const msg = getFriendlyError(err);
      toast.error(msg);
      setError(msg);
    },
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      toast.success("Account created successfully!");
      window.location.href = redirect;
    },
    onError: (err) => {
      const msg = getFriendlyError(err);
      toast.error(msg);
      setError(msg);
    },
  });

  const sendOtpMutation = trpc.otpAuth.sendCode.useMutation({
    onSuccess: () => {
      setOtpSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) clearInterval(timer);
          return c - 1;
        });
      }, 1000);
      toast.success("OTP sent to your phone!");
    },
    onError: (err) => {
      const msg = getFriendlyError(err);
      toast.error(msg);
      setError(msg);
    },
  });

  const verifyOtpMutation = trpc.otpAuth.verifyCode.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      toast.success("Login successful!");
      window.location.href = redirect;
    },
    onError: (err) => {
      const msg = getFriendlyError(err);
      toast.error(msg);
      setError(msg);
    },
  });

  function getOAuthUrl() {
    const appId = import.meta.env.VITE_APP_ID;
    const authBase = import.meta.env.VITE_KIMI_AUTH_URL;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const url = new URL(`${authBase}/api/oauth/authorize`);
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile");
    url.searchParams.set("state", state);
    return url.toString();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      if (!email.trim() || !password.trim()) {
        const msg = "Please fill in all fields.";
        setError(msg);
        toast.error(msg);
        return;
      }
      loginMutation.mutate({ email, password });
    } else if (mode === "register") {
      if (!name.trim() || !email.trim() || !password.trim()) {
        const msg = "Please fill in all fields.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (password.length < 6) {
        const msg = "Password must be at least 6 characters.";
        setError(msg);
        toast.error(msg);
        return;
      }
      registerMutation.mutate({ name, email, password });
    }
  }

  function handleOtpSend() {
    if (!phone.trim()) {
      const msg = "Please enter your phone number.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setError("");
    sendOtpMutation.mutate({ phone, countryCode });
  }

  function handleOtpVerify() {
    if (!otpCode || otpCode.length !== 6) {
      const msg = "Please enter the 6-digit OTP code.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setError("");
    verifyOtpMutation.mutate({ phone, countryCode, code: otpCode });
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setError("");
    setOtpSent(false);
    setOtpCode("");
  }

  const isPending = loginMutation.isPending || registerMutation.isPending || sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="/aurora-bg.jpg" alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 to-[#0a0a0a]" />
      </div>
      <div className="absolute inset-0 cyber-grid opacity-10" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-4">
        <button
          type="button"
          onClick={() => { window.location.href = "/"; }}
          className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#3b82f6] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="glass-panel-strong rounded-2xl p-8 neon-border">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Phone Login"}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              {mode === "login" ? "Sign in to your NEXUS account" : mode === "register" ? "Join the NEXUS ecosystem" : "Login with your phone number"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-1 p-1 rounded-lg bg-[#111] mb-6">
            {(["login", "register", "otp"] as AuthMode[]).map(m => (
              <button key={m} type="button" onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${mode === m ? "bg-[#3b82f6]/20 text-[#3b82f6]" : "text-[#666] hover:text-[#999]"}`}>
                {m === "login" ? "Email" : m === "register" ? "Sign Up" : "Phone"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "otp" ? (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="input-field w-24 flex-shrink-0">
                        {["+1","+44","+91","+86","+81","+49","+33","+61","+971"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field flex-1" placeholder="Phone number" />
                    </div>
                    <button type="button" onClick={handleOtpSend} disabled={isPending}
                      className="btn-glow w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50">
                      {isPending ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-[#999]">Code sent to {countryCode} {phone}</p>
                      {countdown > 0 && <p className="text-xs text-[#666] mt-1">Resend in {countdown}s</p>}
                    </div>
                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="input-field text-center text-2xl tracking-[0.5em]" placeholder="______" maxLength={6} />
                    <button type="button" onClick={handleOtpVerify} disabled={isPending || otpCode.length !== 6}
                      className="btn-glow w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50">
                      {isPending ? "Verifying..." : "Verify & Login"}
                    </button>
                    {countdown === 0 && (
                      <button type="button" onClick={handleOtpSend} className="w-full text-center text-sm text-[#3b82f6] hover:text-[#22d3ee]">Resend Code</button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="block text-xs text-[#999] mb-1.5">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe" required />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><Mail className="w-3 h-3 inline mr-1" />Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><Lock className="w-3 h-3 inline mr-1" />Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                        className="input-field pr-10" placeholder={mode === "register" ? "Min 6 characters" : "Your password"} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#999]">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isPending}
                    className="btn-glow w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50">
                    {isPending ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-xs text-[#666]">
                    {mode === "login"
                      ? <>Don&apos;t have an account? <button type="button" onClick={() => switchMode("register")} className="text-[#3b82f6] hover:text-[#22d3ee]">Sign up</button></>
                      : <>Already have an account? <button type="button" onClick={() => switchMode("login")} className="text-[#3b82f6] hover:text-[#22d3ee]">Sign in</button></>
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== "otp" && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-[#222]" />
                <span className="text-xs text-[#666]">or</span>
                <div className="flex-1 h-px bg-[#222]" />
              </div>
              <a href={getOAuthUrl()} className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111] border border-[#222] text-sm text-white hover:border-[#3b82f6]/30 transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </a>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
