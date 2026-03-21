import { useState } from "react";
import { registerUser, loginUser, saveToken } from "./api";

const THEMES = {
  warm: {
    bg: "#1a1209", bgSecondary: "#2a1f0f", bgCard: "#261a0e",
    surface: "#332518", border: "#4a3420", text: "#f5e6d0",
    textMuted: "#b89a7a", textSubtle: "#8a6a50",
    accent: "#2dd4c4", accentSoft: "rgba(45,212,196,0.12)",
    accentGlow: "rgba(45,212,196,0.25)", warm1: "#d97706",
    gradCard: "linear-gradient(145deg, #2e2010, #1e1508)",
    shadow: "0 4px 24px rgba(0,0,0,0.5)",
    shadowGlow: "0 0 30px rgba(45,212,196,0.2)",
    inputBg: "#1e1508",
  },
  light: {
    bg: "#fdf6ee", bgSecondary: "#f5ebe0", bgCard: "#ffffff",
    surface: "#ede0d0", border: "#d4b896", text: "#2c1810",
    textMuted: "#7a5c45", textSubtle: "#a08060",
    accent: "#0d9488", accentSoft: "rgba(13,148,136,0.1)",
    accentGlow: "rgba(13,148,136,0.2)", warm1: "#d97706",
    gradCard: "linear-gradient(145deg, #ffffff, #fdf6ee)",
    shadow: "0 4px 24px rgba(0,0,0,0.08)",
    shadowGlow: "0 0 30px rgba(13,148,136,0.15)",
    inputBg: "#fff",
  },
};

const AVATARS = ["🎨", "🌸", "✨", "🌊", "🖌️", "🌺", "💫", "🎭", "🌙", "🔥"];

export default function Auth({ theme = "warm", onLoginSuccess }) {
  const T = THEMES[theme];
  const [mode, setMode] = useState("login"); // login | register
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPassword: "",
  });
  const [selectedAvatar, setSelectedAvatar] = useState("🎨");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Crimson+Pro:wght@300;400;600&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 10px rgba(45,212,196,0.2); } 50% { box-shadow: 0 0 30px rgba(45,212,196,0.4); } }
    .fadeUp { animation: fadeUp 0.5s ease forwards; }
    input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentSoft} !important; }
  `;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        // Validation
        if (!formData.username || !formData.email || !formData.password) {
          setError("All fields are required!"); setLoading(false); return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match!"); setLoading(false); return;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters!"); setLoading(false); return;
        }

        const data = await registerUser(formData.username, formData.email, formData.password);

        if (data.error) {
          setError(data.error);
        } else {
          saveToken(data.token);
          setSuccess("Account created! Welcome to ArtVerse 🎨");
          setTimeout(() => onLoginSuccess(data.user), 1000);
        }

      } else {
        // Login
        if (!formData.email || !formData.password) {
          setError("Email and password required!"); setLoading(false); return;
        }

        const data = await loginUser(formData.email, formData.password);

        if (data.error) {
          setError(data.error);
        } else {
          saveToken(data.token);
          setSuccess("Welcome back! 🎨");
          setTimeout(() => onLoginSuccess(data.user), 800);
        }
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure Flask is running!");
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Crimson Pro', Georgia, serif", padding: 20,
      position: "relative", overflow: "hidden",
    }}>
      <style>{css}</style>

      {/* Background glows */}
      <div style={{
        position: "absolute", top: -100, right: -100, width: 500, height: 500,
        borderRadius: "50%", background: "rgba(45,212,196,0.06)", filter: "blur(100px)",
      }} />
      <div style={{
        position: "absolute", bottom: -100, left: -100, width: 400, height: 400,
        borderRadius: "50%", background: "rgba(217,119,6,0.08)", filter: "blur(80px)",
      }} />

      {/* Auth card */}
      <div className="fadeUp" style={{
        width: "100%", maxWidth: 460,
        background: T.gradCard, border: `1px solid ${T.border}`,
        borderRadius: 24, padding: "40px 36px",
        boxShadow: T.shadowGlow, position: "relative", zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px",
            background: "linear-gradient(135deg, #d97706, #2dd4c4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, animation: "glow 3s ease-in-out infinite",
          }}>🎨</div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700,
            background: `linear-gradient(90deg, ${T.warm1}, ${T.accent})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>ArtVerse</div>
          <div style={{ color: T.textSubtle, fontSize: 14, marginTop: 4 }}>
            {mode === "login" ? "Welcome back, artist!" : "Join the art community"}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: "flex", background: T.surface, borderRadius: 12,
          padding: 4, marginBottom: 28, border: `1px solid ${T.border}`,
        }}>
          {[["login", "Sign In"], ["register", "Create Account"]].map(([key, label]) => (
            <button key={key} onClick={() => { setMode(key); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "10px 16px", borderRadius: 9, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 600,
              fontFamily: "'Crimson Pro', Georgia, serif",
              background: mode === key ? T.bgCard : "transparent",
              color: mode === key ? T.accent : T.textMuted,
              boxShadow: mode === key ? T.shadow : "none",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Avatar picker (register only) */}
        {mode === "register" && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 8 }}>
              PICK YOUR AVATAR
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AVATARS.map(avatar => (
                <button key={avatar} onClick={() => setSelectedAvatar(avatar)} style={{
                  width: 40, height: 40, borderRadius: 10, border: `2px solid ${selectedAvatar === avatar ? T.accent : T.border}`,
                  background: selectedAvatar === avatar ? T.accentSoft : T.surface,
                  cursor: "pointer", fontSize: 20, transition: "all 0.2s",
                  transform: selectedAvatar === avatar ? "scale(1.15)" : "scale(1)",
                }}>{avatar}</button>
              ))}
            </div>
          </div>
        )}

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>

          {mode === "register" && (
            <div>
              <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>USERNAME</label>
              <input
                name="username" value={formData.username} onChange={handleChange}
                placeholder="e.g. artlover_ravi"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  border: `1px solid ${T.border}`, background: T.inputBg,
                  color: T.text, fontSize: 15, outline: "none",
                  transition: "all 0.2s", fontFamily: "'Crimson Pro', Georgia, serif",
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>EMAIL</label>
            <input
              name="email" value={formData.email} onChange={handleChange}
              placeholder="your@email.com" type="email"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.inputBg,
                color: T.text, fontSize: 15, outline: "none",
                transition: "all 0.2s", fontFamily: "'Crimson Pro', Georgia, serif",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>PASSWORD</label>
            <input
              name="password" value={formData.password} onChange={handleChange}
              placeholder="Min. 6 characters" type="password"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.inputBg,
                color: T.text, fontSize: 15, outline: "none",
                transition: "all 0.2s", fontFamily: "'Crimson Pro', Georgia, serif",
              }}
            />
          </div>

          {mode === "register" && (
            <div>
              <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>CONFIRM PASSWORD</label>
              <input
                name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="Repeat your password" type="password"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  border: `1px solid ${T.border}`, background: T.inputBg,
                  color: T.text, fontSize: 15, outline: "none",
                  transition: "all 0.2s", fontFamily: "'Crimson Pro', Georgia, serif",
                }}
              />
            </div>
          )}
        </div>

        {/* Error / Success messages */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
            color: "#f87171", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
            color: "#34d399", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
          }}>✅ {success}</div>
        )}

        {/* Submit button */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "13px 20px", borderRadius: 12, border: "none",
          background: loading ? T.surface : `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
          color: loading ? T.textMuted : "#fff",
          fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Crimson Pro', Georgia, serif",
          boxShadow: loading ? "none" : T.shadowGlow,
          transition: "all 0.3s", marginBottom: 16,
        }}>
          {loading ? "⏳ Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        {/* Switch mode link */}
        <div style={{ textAlign: "center", fontSize: 14, color: T.textMuted }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{
            background: "none", border: "none", color: T.accent,
            cursor: "pointer", fontSize: 14, fontWeight: 600,
            fontFamily: "'Crimson Pro', Georgia, serif",
          }}>
            {mode === "login" ? "Create one free" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}