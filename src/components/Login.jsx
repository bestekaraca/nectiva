import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BoltIcon from "./BoltIcon";

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({
          type: "ok",
          text: "Hesap oluşturuldu. E-postana gelen onay linkine tıkladıktan sonra giriş yapabilirsin.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: translateError(err.message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-paper flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="blob absolute -top-32 -left-24 w-96 h-96 rounded-full bg-violet-400 animate-blob" />
        <div className="blob absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue-400 animate-blobSlow" />
        <div className="blob absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-fuchsia-300 animate-blob" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,27,46,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(30,27,46,0.7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative glass rounded-3xl w-full max-w-sm p-8 shadow-glow-lg">
        <div className="flex items-center gap-2.5 mb-1">
          <BoltIcon size={30} id="login" />
          <div
            className="font-display font-bold text-3xl tracking-tight bg-clip-text text-transparent animate-shimmer drop-shadow-[0_2px_14px_rgba(139,92,246,0.3)]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #7C3AED 0%, #7C3AED 35%, #ffffff 50%, #2563EB 65%, #2563EB 100%)",
              backgroundSize: "250% 100%",
            }}
          >
            Nectiva
          </div>
        </div>
        <div className="text-xs text-violet-500/70 font-mono uppercase tracking-wider mb-7 ml-[42px]">
          Kapat. Büyü. Tekrarla.
        </div>

        <div className="flex gap-1 mb-6 bg-ink/5 rounded-xl p-1 border border-ink/5">
          <TabButton active={mode === "signin"} onClick={() => setMode("signin")}>
            Giriş yap
          </TabButton>
          <TabButton active={mode === "signup"} onClick={() => setMode("signup")}>
            Hesap oluştur
          </TabButton>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            type="email"
            required
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Şifre (en az 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          {message && (
            <div
              className={`text-xs rounded-lg px-3 py-2 border ${
                message.type === "error"
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 relative gradient-anim animate-gradientShift bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-500 text-white font-semibold text-sm py-3 rounded-xl transition-shadow hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Bekleniyor..." : mode === "signin" ? "Giriş yap" : "Hesap oluştur"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-all ${
        active
          ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-glow-sm"
          : "text-ink/45 hover:text-ink/75"
      }`}
    >
      {children}
    </button>
  );
}

function translateError(msg) {
  if (!msg) return "Bir şeyler ters gitti, tekrar dene.";
  if (msg.includes("Invalid login credentials")) return "E-posta veya şifre yanlış.";
  if (msg.includes("User already registered")) return "Bu e-posta ile zaten bir hesap var, giriş yapmayı dene.";
  if (msg.includes("Password should be at least")) return "Şifre en az 6 karakter olmalı.";
  return msg;
}
