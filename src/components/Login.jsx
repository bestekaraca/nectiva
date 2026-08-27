import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [mode, setMode] = useState("signin"); // signin | signup
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
    <div className="min-h-screen relative overflow-hidden bg-night flex items-center justify-center p-4">
      {/* Hareketli gradyan ışık kütleleri (blob) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="blob absolute -top-32 -left-24 w-96 h-96 rounded-full bg-violet-600 animate-blob" />
        <div className="blob absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue-600 animate-blobSlow" />
        <div className="blob absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-fuchsia-600 animate-blob" />
      </div>

      {/* İnce ızgara dokusu */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative glass rounded-3xl w-full max-w-sm p-8 shadow-glow-lg">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 shadow-glow-sm shrink-0" />
          <div className="font-display text-2xl text-ivory tracking-tight">Nexivra</div>
        </div>
        <div className="text-xs text-violet-300/70 font-mono uppercase tracking-wider mb-7 ml-[42px]">
          Satış Asistanı
        </div>

        <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 border border-white/5">
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
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
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
          : "text-white/45 hover:text-white/75"
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
