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
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="bg-paper rounded-2xl w-full max-w-sm p-7 shadow-xl">
        <div className="font-display text-2xl text-ink mb-1">Nexivra</div>
        <div className="text-xs text-ink/45 font-mono uppercase tracking-wider mb-6">
          Satış Asistanı
        </div>

        <div className="flex gap-1 mb-5 bg-line/60 rounded-lg p-1">
          <TabButton active={mode === "signin"} onClick={() => setMode("signin")}>
            Giriş yap
          </TabButton>
          <TabButton active={mode === "signup"} onClick={() => setMode("signup")}>
            Hesap oluştur
          </TabButton>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              className={`text-xs rounded-lg px-3 py-2 ${
                message.type === "error"
                  ? "bg-brick-light text-brick-dark"
                  : "bg-teal-light text-teal-dark"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-amber hover:bg-amber-dark text-ink font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
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
      className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
        active ? "bg-card text-ink shadow-sm" : "text-ink/50 hover:text-ink/80"
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
