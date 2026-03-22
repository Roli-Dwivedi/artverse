import { useState, useEffect, useRef } from "react";
import Communities from "./Communities";
import Auth from "./Auth";
import { isLoggedIn, removeToken, sendChatMessage, detectArtStyle, detectAIArt } from "./api";
const THEMES = {
  warm: {
    name: "Warm Earthy",
    bg: "#1a1209",
    bgSecondary: "#2a1f0f",
    bgCard: "#261a0e",
    bgCardHover: "#2e2010",
    surface: "#332518",
    border: "#4a3420",
    text: "#f5e6d0",
    textMuted: "#b89a7a",
    textSubtle: "#8a6a50",
    accent: "#2dd4c4",
    accentHover: "#14b8a8",
    accentSoft: "rgba(45,212,196,0.12)",
    accentGlow: "rgba(45,212,196,0.25)",
    warm1: "#d97706",
    warm2: "#b45309",
    warm3: "#92400e",
    gradHero: "linear-gradient(135deg, #1a1209 0%, #2a1605 50%, #1a1209 100%)",
    gradCard: "linear-gradient(145deg, #2e2010, #1e1508)",
    shadow: "0 4px 24px rgba(0,0,0,0.5)",
    shadowGlow: "0 0 20px rgba(45,212,196,0.2)",
    inputBg: "#1e1508",
  },
  light: {
    name: "Light Canvas",
    bg: "#fdf6ee",
    bgSecondary: "#f5ebe0",
    bgCard: "#ffffff",
    bgCardHover: "#fef9f5",
    surface: "#ede0d0",
    border: "#d4b896",
    text: "#2c1810",
    textMuted: "#7a5c45",
    textSubtle: "#a08060",
    accent: "#0d9488",
    accentHover: "#0f766e",
    accentSoft: "rgba(13,148,136,0.1)",
    accentGlow: "rgba(13,148,136,0.2)",
    warm1: "#d97706",
    warm2: "#b45309",
    warm3: "#92400e",
    gradHero: "linear-gradient(135deg, #fdf6ee 0%, #f5e8d8 50%, #fdf6ee 100%)",
    gradCard: "linear-gradient(145deg, #ffffff, #fdf6ee)",
    shadow: "0 4px 24px rgba(0,0,0,0.08)",
    shadowGlow: "0 0 20px rgba(13,148,136,0.15)",
    inputBg: "#fff",
  },
};

const SAMPLE_ARTWORKS = [
  { id: 1, title: "Golden Hour", artist: "Maya Chen", style: "Impressionism", likes: 342, ai: false, color: "#8B4513", h: 280 },
  { id: 2, title: "Neon Dreams", artist: "AI Studio", style: "Digital Art", likes: 891, ai: true, color: "#1a4a6b", h: 220 },
  { id: 3, title: "Forest Spirit", artist: "Lena Park", style: "Watercolor", likes: 156, ai: false, color: "#2d5a27", h: 320 },
  { id: 4, title: "Cosmic Flow", artist: "AI Studio", style: "Abstract", likes: 1203, ai: true, color: "#3b1f6b", h: 240 },
  { id: 5, title: "Old Market", artist: "Ravi Patel", style: "Realism", likes: 445, ai: false, color: "#6b4c1e", h: 260 },
  { id: 6, title: "Sea of Thought", artist: "AI Studio", style: "Surrealism", likes: 678, ai: true, color: "#1a3a5c", h: 300 },
  { id: 7, title: "Autumn Study", artist: "Sofia Torres", style: "Sketch", likes: 223, ai: false, color: "#8B5E3C", h: 200 },
  { id: 8, title: "Pixel Garden", artist: "AI Studio", style: "Pixel Art", likes: 934, ai: true, color: "#1e5c3a", h: 270 },
  { id: 9, title: "Portrait in Blue", artist: "James Okafor", style: "Oil Painting", likes: 389, ai: false, color: "#1a3060", h: 310 },
];

const HISTORICAL_ARTISTS = [
  { name: "Leonardo da Vinci", era: "Renaissance", known: "Mona Lisa, The Last Supper", emoji: "🎨" },
  { name: "Vincent van Gogh", era: "Post-Impressionism", known: "Starry Night, Sunflowers", emoji: "🌻" },
  { name: "Frida Kahlo", era: "Surrealism", known: "Self-portraits, symbolic art", emoji: "🌺" },
  { name: "Pablo Picasso", era: "Cubism", known: "Guernica, Les Demoiselles", emoji: "🖼️" },
  { name: "Claude Monet", era: "Impressionism", known: "Water Lilies, Haystacks", emoji: "🌸" },
  { name: "Rembrandt", era: "Dutch Golden Age", known: "The Night Watch, self-portraits", emoji: "🕯️" },
];


const STYLE_TAGS = ["All", "Impressionism", "Digital Art", "Watercolor", "Abstract", "Realism", "Surrealism", "Sketch", "Oil Painting", "Pixel Art"];

const ART_STYLES_DETECT = ["Impressionism", "Oil Painting", "Watercolor", "Digital Art", "Sketch / Pencil", "Charcoal", "Acrylic", "Abstract Expressionism", "Surrealism", "Street Art"];
const ART_MOODS = ["Melancholic", "Joyful", "Ethereal", "Tense", "Peaceful", "Mysterious", "Bold", "Dreamy"];

export default function ArtVerse() {
  const [theme, setTheme] = useState("warm");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("gallery");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStyle, setActiveStyle] = useState("All");
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hey artist! 👋 I'm your ArtVerse muse. Ask me anything about techniques, styles, color theory, or get some creative inspiration!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedArt, setGeneratedArt] = useState(null);
 const [detectResult, setDetectResult] = useState(null);
const [detectTab, setDetectTab] = useState("style");
const [detectImage, setDetectImage] = useState(null);
const [detectImagePreview, setDetectImagePreview] = useState(null);
const [detecting, setDetecting] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [accentColor, setAccentColor] = useState("#2dd4c4");
  const [fontChoice, setFontChoice] = useState("default");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  const T = THEMES[theme];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const filteredArtworks = SAMPLE_ARTWORKS.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.style.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStyle = activeStyle === "All" || a.style === activeStyle;
    return matchSearch && matchStyle;
  });

  const toggleLike = (id) => {
    setLikedArtworks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sendChat = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = { role: "user", text: chatInput };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsTyping(true);
    try {
      // Build history in the format backend expects
      const history = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.text,
      }));
      const data = await sendChatMessage(chatInput, history);
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          text: "Sorry, I couldn't connect right now. Please try again!" 
        }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        text: "Connection error. Make sure the backend is running!" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerate = () => {
    if (!generatePrompt.trim()) return;
    setGenerating(true);
    setGeneratedArt(null);
    setTimeout(() => {
      const colors = ["#1a3a6b", "#3b1f6b", "#1e5c3a", "#6b1f1f", "#2d5a6b", "#5c3a1e"];
      setGeneratedArt({
        prompt: generatePrompt,
        color: colors[Math.floor(Math.random() * colors.length)],
        style: ART_STYLES_DETECT[Math.floor(Math.random() * ART_STYLES_DETECT.length)],
      });
      setGenerating(false);
    }, 2500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDetectImage(file);
    setDetectResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setDetectImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDetect = async () => {
    if (!detectImage) {
      alert("Please upload an image first!");
      return;
    }
    setDetectResult(null);
    setDetecting(true);
    try {
      if (detectTab === "style") {
        const data = await detectArtStyle(detectImage);
        if (data.result) {
          setDetectResult({ type: "style", ...data.result });
        } else {
          alert("Could not analyze image. Try another!");
        }
      } else {
        const data = await detectAIArt(detectImage);
        if (data.result) {
          setDetectResult({ type: "ai", ...data.result });
        } else {
          alert("Could not analyze image. Try another!");
        }
      }
    } catch (err) {
      alert("Connection error. Make sure backend is running!");
    } finally {
      setDetecting(false);
    }
  };

  const NAV_ITEMS = [
    { id: "gallery", label: "Gallery", icon: "🖼️" },
    { id: "generate", label: "AI Studio", icon: "✨" },
    { id: "detect", label: "Art Detect", icon: "🔍" },
    { id: "chat", label: "Muse AI", icon: "🤖" },
    { id: "communities", label: "Communities", icon: "🏘️" },
    { id: "history", label: "Masters", icon: "🏛️" },
  ];

  const fonts = {
    default: "'Georgia', serif",
    modern: "'Courier New', monospace",
    elegant: "'Palatino', serif",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Crimson+Pro:wght@300;400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Crimson Pro', Georgia, serif; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${T.bg}; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 10px ${T.accentGlow}; } 50% { box-shadow: 0 0 30px ${T.accentGlow}, 0 0 60px ${T.accentSoft}; } }
    .fadeIn { animation: fadeIn 0.5s ease forwards; }
    .masonry { columns: 3; column-gap: 16px; }
    @media(max-width:900px) { .masonry { columns: 2; } }
    @media(max-width:600px) { .masonry { columns: 1; } }
  `;

 if (!loggedIn) {
    return <Auth theme={theme} onLoginSuccess={(user) => {
      setCurrentUser(user);
      setLoggedIn(true);
    }} />;
  }

  return (
    <div style={{ fontFamily: fonts[fontChoice], background: T.bg, color: T.text, minHeight: "100vh", transition: "all 0.4s ease" }}>
      <style>{css}</style>

      {/* TOP NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: `${T.bgSecondary}ee`, backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 8, padding: "0 20px", height: 60,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 24 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, animation: "glow 3s ease-in-out infinite",
          }}>🎨</div>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22,
            background: `linear-gradient(90deg, ${T.warm1}, ${T.accent})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>ArtVerse</span>
        </div>

        {/* Nav tabs - desktop */}
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: fonts[fontChoice], fontSize: 14,
              background: activeTab === item.id ? T.accentSoft : "transparent",
              color: activeTab === item.id ? T.accent : T.textMuted,
              borderBottom: activeTab === item.id ? `2px solid ${T.accent}` : "2px solid transparent",
              transition: "all 0.2s",
            }}>
              <span style={{ marginRight: 6 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowCustomizer(!showCustomizer)} title="Customize" style={{
            width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`,
            background: showCustomizer ? T.accentSoft : T.surface, color: T.accent,
            cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}>🎭</button>
          <button onClick={() => setTheme(theme === "warm" ? "light" : "warm")} style={{
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.surface, color: T.text, cursor: "pointer", fontSize: 13,
            fontFamily: fonts[fontChoice], transition: "all 0.2s",
          }}>
            {theme === "warm" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {/* CUSTOMIZER PANEL */}
      {showCustomizer && (
        <div style={{
          position: "fixed", top: 68, right: 16, zIndex: 200,
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: 20, width: 260,
          boxShadow: T.shadow, animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 18, marginBottom: 16, color: T.accent }}>
            🎭 Personalize
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>Font Style</div>
            {[["default", "Classic Serif"], ["modern", "Monospace"], ["elegant", "Elegant"]].map(([key, label]) => (
              <button key={key} onClick={() => setFontChoice(key)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 12px", marginBottom: 4, borderRadius: 8, border: `1px solid ${fontChoice === key ? T.accent : T.border}`,
                background: fontChoice === key ? T.accentSoft : T.surface,
                color: fontChoice === key ? T.accent : T.text,
                cursor: "pointer", fontSize: 13, fontFamily: fonts[key],
              }}>{label}</button>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>Theme Mode</div>
            <button onClick={() => setTheme(theme === "warm" ? "light" : "warm")} style={{
              width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.surface, color: T.text, cursor: "pointer", fontSize: 13,
            }}>
              {theme === "warm" ? "Switch to ☀️ Light Canvas" : "Switch to 🌙 Dark Earthy"}
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{ paddingTop: 72, paddingBottom: 40, minHeight: "100vh" }}>

        {/* ── GALLERY TAB ── */}
        {activeTab === "gallery" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }} className="fadeIn">
            {/* Hero */}
            <div style={{
              background: T.gradHero, borderRadius: 24, padding: "48px 40px",
              marginBottom: 32, border: `1px solid ${T.border}`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -60, right: -60, width: 300, height: 300,
                borderRadius: "50%", background: T.accentGlow, filter: "blur(80px)",
              }} />
              <div style={{
                position: "absolute", bottom: -40, left: 100, width: 200, height: 200,
                borderRadius: "50%", background: `rgba(217,119,6,0.15)`, filter: "blur(60px)",
              }} />
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 700,
                lineHeight: 1.1, marginBottom: 12, position: "relative",
              }}>
                Where Art Meets <span style={{
                  background: `linear-gradient(90deg, ${T.warm1}, ${T.accent})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>Intelligence</span>
              </h1>
              <p style={{ color: T.textMuted, fontSize: 18, maxWidth: 500, position: "relative" }}>
                Discover, create, and connect. Your personal canvas for artistic exploration.
              </p>
            </div>

            {/* Search + Filters */}
            <div style={{ marginBottom: 24 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍  Search artworks, artists, styles..."
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: 12,
                  border: `1px solid ${T.border}`, background: T.inputBg,
                  color: T.text, fontSize: 15, fontFamily: fonts[fontChoice],
                  outline: "none", marginBottom: 16,
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
                }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STYLE_TAGS.map(tag => (
                  <button key={tag} onClick={() => setActiveStyle(tag)} style={{
                    padding: "6px 16px", borderRadius: 20, border: `1px solid ${activeStyle === tag ? T.accent : T.border}`,
                    background: activeStyle === tag ? T.accentSoft : T.surface,
                    color: activeStyle === tag ? T.accent : T.textMuted,
                    cursor: "pointer", fontSize: 13, fontFamily: fonts[fontChoice], transition: "all 0.2s",
                  }}>{tag}</button>
                ))}
              </div>
            </div>

            {/* Masonry Grid */}
            <div className="masonry">
              {filteredArtworks.map((art, i) => (
                <div key={art.id} className="fadeIn" style={{
                  breakInside: "avoid", marginBottom: 16,
                  borderRadius: 16, overflow: "hidden",
                  background: T.gradCard, border: `1px solid ${T.border}`,
                  boxShadow: T.shadow, cursor: "pointer",
                  animationDelay: `${i * 0.06}s`,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = T.shadowGlow; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = T.shadow; }}
                >
                  {/* Art preview */}
                  <div style={{
                    height: art.h, background: `linear-gradient(135deg, ${art.color}, ${art.color}88)`,
                    position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 48, opacity: 0.6 }}>🎨</span>
                    {art.ai && (
                      <div style={{
                        position: "absolute", top: 12, right: 12,
                        background: `${T.accent}22`, border: `1px solid ${T.accent}`,
                        color: T.accent, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600,
                      }}>AI Generated</div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{art.title}</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 10 }}>by {art.artist} · {art.style}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <button onClick={() => toggleLike(art.id)} style={{
                        background: likedArtworks.has(art.id) ? `rgba(239,68,68,0.15)` : T.surface,
                        border: `1px solid ${likedArtworks.has(art.id) ? "#ef4444" : T.border}`,
                        color: likedArtworks.has(art.id) ? "#ef4444" : T.textMuted,
                        borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 13,
                        fontFamily: fonts[fontChoice], transition: "all 0.2s",
                      }}>
                        {likedArtworks.has(art.id) ? "❤️" : "🤍"} {art.likes + (likedArtworks.has(art.id) ? 1 : 0)}
                      </button>
                      <span style={{ fontSize: 12, color: T.textSubtle }}>💬 View</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredArtworks.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, color: T.textMuted }}>
                <div style={{ fontSize: 48 }}>🎨</div>
                <div style={{ marginTop: 12 }}>No artworks found. Try a different search.</div>
              </div>
            )}
          </div>
        )}

        {/* ── AI STUDIO TAB ── */}
        {activeTab === "generate" && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }} className="fadeIn">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, marginBottom: 8 }}>
              ✨ AI <span style={{ color: T.accent }}>Art Studio</span>
            </h2>
            <p style={{ color: T.textMuted, marginBottom: 32, fontSize: 16 }}>
              Describe your vision and watch it come to life.
            </p>

            <div style={{
              background: T.gradCard, border: `1px solid ${T.border}`,
              borderRadius: 20, padding: 32, marginBottom: 24, boxShadow: T.shadow,
            }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 10, color: T.textMuted, fontSize: 14 }}>
                DESCRIBE YOUR ARTWORK
              </label>
              <textarea
                value={generatePrompt}
                onChange={e => setGeneratePrompt(e.target.value)}
                placeholder="e.g. A misty forest at dawn painted in impressionist style with warm golden light filtering through ancient oak trees..."
                rows={4}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 12,
                  border: `1px solid ${T.border}`, background: T.inputBg,
                  color: T.text, fontSize: 15, fontFamily: fonts[fontChoice],
                  resize: "vertical", outline: "none", lineHeight: 1.6,
                }}
              />
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Impressionist forest at sunset", "Abstract ocean waves in neon", "Portrait in Renaissance style", "Surreal dreamscape with floating islands"].map(p => (
                  <button key={p} onClick={() => setGeneratePrompt(p)} style={{
                    padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                    background: T.surface, color: T.textMuted, cursor: "pointer",
                    fontSize: 12, fontFamily: fonts[fontChoice], transition: "all 0.2s",
                  }}>{p}</button>
                ))}
              </div>
              <button onClick={handleGenerate} disabled={generating || !generatePrompt.trim()} style={{
                marginTop: 20, width: "100%", padding: "14px 24px", borderRadius: 12,
                border: "none", cursor: generating ? "not-allowed" : "pointer",
                background: generating ? T.surface : `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
                color: generating ? T.textMuted : "#fff",
                fontSize: 16, fontWeight: 600, fontFamily: fonts[fontChoice],
                transition: "all 0.3s", boxShadow: generating ? "none" : T.shadowGlow,
              }}>
                {generating ? "⏳ Creating your masterpiece..." : "✨ Generate Art"}
              </button>
            </div>

            {/* Generated art preview */}
            {generatedArt && (
              <div className="fadeIn" style={{
                background: T.gradCard, border: `1px solid ${T.accent}`,
                borderRadius: 20, padding: 24, boxShadow: T.shadowGlow,
              }}>
                <div style={{
                  height: 360, borderRadius: 12, marginBottom: 20,
                  background: `linear-gradient(135deg, ${generatedArt.color}, ${generatedArt.color}66, ${T.accent}33)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px)`,
                  }} />
                  <div style={{ textAlign: "center", position: "relative" }}>
                    <div style={{ fontSize: 72, marginBottom: 12 }}>🎨</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>AI Generated • {generatedArt.style}</div>
                  </div>
                </div>
                <div style={{ color: T.textMuted, fontSize: 14, fontStyle: "italic", marginBottom: 12 }}>
                  "{generatedArt.prompt}"
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{
                    flex: 1, padding: "10px 16px", borderRadius: 10,
                    border: `1px solid ${T.accent}`, background: T.accentSoft, color: T.accent,
                    cursor: "pointer", fontSize: 14, fontFamily: fonts[fontChoice],
                  }}>💾 Save to Gallery</button>
                  <button style={{
                    padding: "10px 16px", borderRadius: 10,
                    border: `1px solid ${T.border}`, background: T.surface, color: T.text,
                    cursor: "pointer", fontSize: 14, fontFamily: fonts[fontChoice],
                  }}>🔄 Regenerate</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DETECT TAB ── */}
        {activeTab === "detect" && (
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }} className="fadeIn">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, marginBottom: 8 }}>
              🔍 Art <span style={{ color: T.accent }}>Detector</span>
            </h2>
            <p style={{ color: T.textMuted, marginBottom: 24, fontSize: 16 }}>
              Identify painting styles, moods, and detect AI-generated artwork.
            </p>

            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: T.surface, borderRadius: 12, padding: 4 }}>
              {[["style", "🖼️ Style & Mood Analysis"], ["ai", "🤖 AI Detection"]].map(([key, label]) => (
                <button key={key} onClick={() => { setDetectTab(key); setDetectResult(null); }} style={{
                  flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: detectTab === key ? T.bgCard : "transparent",
                  color: detectTab === key ? T.accent : T.textMuted,
                  fontFamily: fonts[fontChoice], fontSize: 14, fontWeight: 600,
                  boxShadow: detectTab === key ? T.shadow : "none", transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>

            {/* Upload area */}
            <label htmlFor="art-upload" style={{
              display: "block", border: `2px dashed ${detectImagePreview ? T.accent : T.border}`,
              borderRadius: 20, padding: detectImagePreview ? "20px" : "60px 40px",
              textAlign: "center", marginBottom: 20, background: detectImagePreview ? T.accentSoft : T.bgCard,
              cursor: "pointer", transition: "all 0.3s",
            }}>
              {detectImagePreview ? (
                <img src={detectImagePreview} alt="Preview" style={{
                  maxHeight: 280, maxWidth: "100%", borderRadius: 12,
                  objectFit: "contain",
                }} />
              ) : (
                <>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>📁</div>
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Drop your artwork here</div>
                  <div style={{ color: T.textMuted, fontSize: 14 }}>or click to browse • PNG, JPG, WEBP supported</div>
                </>
              )}
            </label>
            <input
              id="art-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            {detectImagePreview && (
              <button onClick={() => { setDetectImage(null); setDetectImagePreview(null); setDetectResult(null); }} style={{
                display: "block", margin: "0 auto 16px", padding: "6px 16px", borderRadius: 8,
                border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted,
                cursor: "pointer", fontSize: 13, fontFamily: fonts[fontChoice],
              }}>✕ Remove image</button>
            )}

            <button onClick={handleDetect} disabled={detecting || !detectImage} style={{
              width: "100%", padding: "14px 24px", borderRadius: 12, border: "none",
              background: detecting || !detectImage ? T.surface : `linear-gradient(135deg, ${T.warm2}, ${T.accent})`,
              color: detecting || !detectImage ? T.textMuted : "#fff",
              fontSize: 16, fontWeight: 600, cursor: detecting || !detectImage ? "not-allowed" : "pointer",
              fontFamily: fonts[fontChoice], boxShadow: detecting || !detectImage ? "none" : T.shadowGlow,
              marginBottom: 24, transition: "all 0.3s",
            }}>
              {detecting ? "⏳ Analyzing artwork..." : detectTab === "style" ? "🎨 Analyze Style & Mood" : "🤖 Detect AI Art"}
            </button>

            {/* Result */}
            {detectResult && (
              <div className="fadeIn" style={{
                background: T.gradCard, border: `1px solid ${T.accent}`,
                borderRadius: 20, padding: 28, boxShadow: T.shadowGlow,
              }}>
                {detectResult.type === "style" ? (
                  <>
                    <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                      {[
                        ["🎨 Style", detectResult.style],
                        ["🌊 Mood", detectResult.mood],
                        ["📅 Period", detectResult.period],
                        ["✅ Confidence", `${detectResult.confidence}%`],
                      ].map(([label, val]) => (
                        <div key={label} style={{
                          flex: "1 1 140px", background: T.surface, borderRadius: 12,
                          padding: "14px 16px", border: `1px solid ${T.border}`,
                        }}>
                          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 17, fontWeight: 700, color: T.accent }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      background: T.accentSoft, borderRadius: 12, padding: "14px 18px",
                      border: `1px solid ${T.accentGlow}`, color: T.text, fontSize: 14, lineHeight: 1.7,
                    }}>
                      💡 {detectResult.description || `This artwork exhibits characteristics consistent with ${detectResult.style} — note the distinctive brushwork and emotional composition that conveys a ${detectResult.mood?.toLowerCase()} atmosphere.`}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                      <div style={{ fontSize: 64, marginBottom: 8 }}>{detectResult.isAI ? "🤖" : "👨‍🎨"}</div>
                      <div style={{
                        fontSize: 28, fontWeight: 800, fontFamily: "'Cormorant Garamond', serif",
                        color: detectResult.isAI ? T.accent : T.warm1,
                      }}>
                        {detectResult.isAI ? "AI Generated" : "Human Created"}
                      </div>
                      <div style={{ color: T.textMuted, fontSize: 15, marginTop: 4 }}>
                        {detectResult.confidence}% confidence
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {detectResult.signals?.map((s, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          background: T.surface, borderRadius: 10, padding: "10px 16px",
                          border: `1px solid ${T.border}`, fontSize: 14,
                        }}>
                          <span style={{ color: detectResult.isAI ? T.accent : T.warm1 }}>
                            {detectResult.isAI ? "⚡" : "✍️"}
                          </span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MUSE AI CHAT TAB ── */}
        {activeTab === "chat" && (
          <div style={{ maxWidth: 740, margin: "0 auto", padding: "24px 20px" }} className="fadeIn">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, marginBottom: 4 }}>
              🤖 <span style={{ color: T.accent }}>Muse</span> AI
            </h2>
            <p style={{ color: T.textMuted, marginBottom: 24, fontSize: 16 }}>
              Your AI art companion — ask about techniques, history, color theory, and more.
            </p>
            <div style={{
              background: T.bgCard, border: `1px solid ${T.border}`,
              borderRadius: 20, display: "flex", flexDirection: "column", height: 520,
              boxShadow: T.shadow, overflow: "hidden",
            }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    animation: "fadeIn 0.3s ease",
                  }}>
                    {msg.role === "assistant" && (
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginRight: 8, marginTop: 2,
                        background: `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                      }}>🎨</div>
                    )}
                    <div style={{
                      maxWidth: "72%", padding: "12px 16px", borderRadius: 16, fontSize: 15, lineHeight: 1.65,
                      background: msg.role === "user" ? `linear-gradient(135deg, ${T.warm2}, ${T.accent})` : T.surface,
                      color: msg.role === "user" ? "#fff" : T.text,
                      borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                      borderBottomLeftRadius: msg.role === "assistant" ? 4 : 16,
                      border: msg.role === "assistant" ? `1px solid ${T.border}` : "none",
                    }}>{msg.text}</div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                    }}>🎨</div>
                    <div style={{ background: T.surface, padding: "12px 18px", borderRadius: 16, border: `1px solid ${T.border}` }}>
                      <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>●</span>
                      <span style={{ animation: "pulse 1s 0.2s infinite", display: "inline-block", margin: "0 4px" }}>●</span>
                      <span style={{ animation: "pulse 1s 0.4s infinite", display: "inline-block" }}>●</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              {/* Input */}
              <div style={{
                padding: "14px 16px", borderTop: `1px solid ${T.border}`,
                display: "flex", gap: 10, background: T.bgSecondary,
              }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Ask about techniques, styles, art history..."
                  style={{
                    flex: 1, padding: "10px 16px", borderRadius: 12,
                    border: `1px solid ${T.border}`, background: T.inputBg,
                    color: T.text, fontSize: 14, fontFamily: fonts[fontChoice], outline: "none",
                  }}
                />
                <button onClick={sendChat} style={{
                  padding: "10px 20px", borderRadius: 12, border: "none",
                  background: `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
                  color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600,
                  fontFamily: fonts[fontChoice],
                }}>Send ↑</button>
              </div>
            </div>
            {/* Quick prompts */}
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["How do I start oil painting?", "Explain color theory", "Who influenced Van Gogh?", "Tips for composition"].map(q => (
                <button key={q} onClick={() => { setChatInput(q); }} style={{
                  padding: "7px 14px", borderRadius: 20, border: `1px solid ${T.border}`,
                  background: T.surface, color: T.textMuted, cursor: "pointer",
                  fontSize: 13, fontFamily: fonts[fontChoice],
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {/* ── COMMUNITIES TAB ── */}
        {activeTab === "communities" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }} className="fadeIn">
            <Communities theme={theme} />
          </div>
        )}

        {/* ── MASTERS TAB ── */}
        {activeTab === "history" && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }} className="fadeIn">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, marginBottom: 8 }}>
              🏛️ The <span style={{ color: T.accent }}>Masters</span>
            </h2>
            <p style={{ color: T.textMuted, marginBottom: 32, fontSize: 16 }}>
              Explore history's greatest artists, their eras, and their iconic works.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
              {HISTORICAL_ARTISTS.map((artist, i) => (
                <div key={i} className="fadeIn" style={{
                  background: T.gradCard, border: `1px solid ${T.border}`,
                  borderRadius: 20, padding: 24, cursor: "pointer",
                  boxShadow: T.shadow, animationDelay: `${i * 0.08}s`,
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = T.shadowGlow; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = T.shadow; }}
                >
                  <div style={{ fontSize: 44, marginBottom: 14 }}>{artist.emoji}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{artist.name}</div>
                  <div style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 6,
                    background: T.accentSoft, color: T.accent, fontSize: 12, marginBottom: 10,
                  }}>{artist.era}</div>
                  <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6 }}>
                    <strong>Known for:</strong> {artist.known}
                  </div>
                  <button style={{
                    marginTop: 16, width: "100%", padding: "8px 16px", borderRadius: 10,
                    border: `1px solid ${T.border}`, background: T.surface, color: T.text,
                    cursor: "pointer", fontSize: 13, fontFamily: fonts[fontChoice],
                  }}>Explore Works →</button>
                </div>
              ))}
            </div>

            {/* Artist Tutorials & Supplies section */}
            <div style={{
              background: T.gradCard, border: `1px solid ${T.border}`,
              borderRadius: 20, padding: 32, boxShadow: T.shadow,
            }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
                📚 Tutorials & Supplies
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { icon: "🎬", label: "Video Tutorials", desc: "Curated YouTube channels for every skill level", tag: "Free" },
                  { icon: "🖌️", label: "Beginner Supplies", desc: "Essential tools to start your art journey", tag: "Guide" },
                  { icon: "📖", label: "Technique Library", desc: "Step-by-step guides for 50+ techniques", tag: "Library" },
                  { icon: "🛒", label: "Supply Store Links", desc: "Best online shops for quality art materials", tag: "Shop" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: T.surface, borderRadius: 14, padding: "18px 20px",
                    border: `1px solid ${T.border}`, cursor: "pointer",
                    display: "flex", gap: 14, alignItems: "flex-start",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
                  >
                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                        {item.label}
                        <span style={{
                          marginLeft: 8, padding: "2px 8px", borderRadius: 4,
                          background: T.accentSoft, color: T.accent, fontSize: 11,
                        }}>{item.tag}</span>
                      </div>
                      <div style={{ color: T.textMuted, fontSize: 13 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        borderTop: `1px solid ${T.border}`, padding: "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: T.bgSecondary, color: T.textSubtle, fontSize: 13,
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: T.textMuted }}>
          🎨 ArtVerse — Where Art Meets Intelligence
        </span>
        <span>Built with ❤️ for artists everywhere</span>
      </footer>
    </div>
  );
}