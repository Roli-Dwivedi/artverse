import { useState } from "react";

const THEMES = {
  warm: {
    bg: "#1a1209", bgSecondary: "#2a1f0f", bgCard: "#261a0e",
    surface: "#332518", border: "#4a3420", text: "#f5e6d0",
    textMuted: "#b89a7a", textSubtle: "#8a6a50",
    accent: "#2dd4c4", accentSoft: "rgba(45,212,196,0.12)",
    accentGlow: "rgba(45,212,196,0.25)", warm1: "#d97706",
    gradCard: "linear-gradient(145deg, #2e2010, #1e1508)",
    shadow: "0 4px 24px rgba(0,0,0,0.5)",
    shadowGlow: "0 0 20px rgba(45,212,196,0.2)",
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
    shadowGlow: "0 0 20px rgba(13,148,136,0.15)",
    inputBg: "#fff",
  },
};

const COMMUNITIES = [
  { id: 1, name: "Watercolor World", desc: "A space for watercolor lovers to share tips, techniques, and paintings.", emoji: "🌊", members: 4821, posts: 342, color: "#1a4a6b", tags: ["Watercolor", "Beginner Friendly"] },
  { id: 2, name: "Digital Art Lab", desc: "Explore AI tools, digital brushes, and the future of art creation.", emoji: "💻", members: 9203, posts: 891, color: "#3b1f6b", tags: ["Digital", "AI Art"] },
  { id: 3, name: "Oil & Canvas", desc: "Traditional oil painting techniques from old masters to modern styles.", emoji: "🖼️", members: 3456, posts: 215, color: "#6b2d1a", tags: ["Oil Painting", "Traditional"] },
  { id: 4, name: "Sketch & Doodle", desc: "Daily sketching challenges, figure drawing, and sketchbook sharing.", emoji: "✏️", members: 6789, posts: 1203, color: "#2d5a27", tags: ["Sketch", "Daily Challenge"] },
  { id: 5, name: "Street Art Collective", desc: "Urban art, graffiti culture, and mural photography from around the world.", emoji: "🏙️", members: 2341, posts: 445, color: "#5c3a1e", tags: ["Street Art", "Photography"] },
  { id: 6, name: "Abstract Minds", desc: "Where rules are broken and creativity is limitless. Pure abstract art.", emoji: "🌀", members: 5102, posts: 678, color: "#1e4a5c", tags: ["Abstract", "Experimental"] },
];

const SAMPLE_POSTS = {
  1: [
    { id: 1, user: "Maya Chen", avatar: "🎨", time: "2h ago", text: "Just finished this misty mountain scene! Used wet-on-wet technique for the fog. Any tips on keeping edges soft without losing detail?", likes: 47, comments: 12, image: "#1a4a6b" },
    { id: 2, user: "Ravi Patel", avatar: "🌸", time: "5h ago", text: "My first attempt at floral watercolor! I was so nervous but really happy with how the petals turned out 🌺", likes: 89, comments: 23, image: "#2d5a27" },
    { id: 3, user: "Sofia Torres", avatar: "✨", time: "1d ago", text: "Sharing my favorite brush collection for beginners. The round #8 from Winsor & Newton is absolutely essential for loose washes!", likes: 134, comments: 41, image: null },
  ],
  2: [
    { id: 4, user: "Alex Kim", avatar: "🤖", time: "1h ago", text: "Generated this cyberpunk cityscape using Stable Diffusion + did manual touch-ups in Photoshop. The hybrid workflow is fascinating!", likes: 203, comments: 67, image: "#3b1f6b" },
    { id: 5, user: "Lena Park", avatar: "💫", time: "3h ago", text: "Tutorial: How I use AI for initial composition ideas, then paint over them digitally. Sharing my full process below 👇", likes: 156, comments: 38, image: "#1a3a6b" },
  ],
  3: [
    { id: 6, user: "James Okafor", avatar: "🕯️", time: "4h ago", text: "Rembrandt lighting study — 3 weeks in the making. The key is building up glazes slowly. Never rush oil painting!", likes: 312, comments: 89, image: "#6b2d1a" },
  ],
};

const ALL_POSTS = Object.values(SAMPLE_POSTS).flat().sort(() => Math.random() - 0.5);

export default function Communities({ theme = "warm" }) {
  const T = THEMES[theme];
  const [view, setView] = useState("browse"); // browse | community | feed
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState(new Set([1, 4]));
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [feedPosts, setFeedPosts] = useState(ALL_POSTS);
  const [activeTab, setActiveTab] = useState("all"); // all | joined

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Crimson+Pro:wght@300;400;600&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .fadeUp { animation: fadeUp 0.4s ease forwards; }
    .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .card-hover:hover { transform: translateY(-3px); }
    .btn-hover { transition: all 0.2s ease; }
    .btn-hover:hover { opacity: 0.85; transform: scale(0.98); }
  `;

  const toggleJoin = (id) => {
    setJoinedCommunities(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleLike = (id) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const submitPost = () => {
    if (!newPostText.trim()) return;
    const newPost = {
      id: Date.now(),
      user: "You",
      avatar: "🌟",
      time: "Just now",
      text: newPostText,
      likes: 0,
      comments: 0,
      image: null,
    };
    if (activeCommunity) {
      setPosts(prev => ({
        ...prev,
        [activeCommunity.id]: [newPost, ...(prev[activeCommunity.id] || [])],
      }));
    }
    setFeedPosts(prev => [newPost, ...prev]);
    setNewPostText("");
    setShowNewPost(false);
  };

  const filteredCommunities = COMMUNITIES.filter(c =>
    activeTab === "joined" ? joinedCommunities.has(c.id) : true
  ).filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentPosts = activeCommunity
    ? (posts[activeCommunity.id] || [])
    : feedPosts;

  // POST CARD component
  const PostCard = ({ post, i }) => (
    <div className="fadeUp card-hover" style={{
      animationDelay: `${i * 0.06}s`,
      background: T.gradCard, border: `1px solid ${T.border}`,
      borderRadius: 16, overflow: "hidden",
      boxShadow: T.shadow, marginBottom: 16,
    }}>
      {post.image && (
        <div style={{
          height: 200, background: `linear-gradient(135deg, ${post.image}, ${post.image}88)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
        }}>🎨</div>
      )}
      <div style={{ padding: "16px 20px" }}>
        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${T.warm1}44, ${T.accent}44)`,
            border: `2px solid ${T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>{post.avatar}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{post.user}</div>
            <div style={{ fontSize: 12, color: T.textSubtle }}>{post.time}</div>
          </div>
        </div>
        {/* Post text */}
        <p style={{ color: T.text, fontSize: 15, lineHeight: 1.65, marginBottom: 14 }}>
          {post.text}
        </p>
        {/* Actions */}
        <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          <button onClick={() => toggleLike(post.id)} className="btn-hover" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${likedPosts.has(post.id) ? "#ef4444" : T.border}`,
            background: likedPosts.has(post.id) ? "rgba(239,68,68,0.12)" : T.surface,
            color: likedPosts.has(post.id) ? "#ef4444" : T.textMuted,
            cursor: "pointer", fontSize: 13,
          }}>
            {likedPosts.has(post.id) ? "❤️" : "🤍"} {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
          </button>
          <button className="btn-hover" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.surface, color: T.textMuted, cursor: "pointer", fontSize: 13,
          }}>
            💬 {post.comments}
          </button>
          <button className="btn-hover" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.surface, color: T.textMuted, cursor: "pointer", fontSize: 13,
            marginLeft: "auto",
          }}>
            ↗ Share
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", color: T.text }}>
      <style>{css}</style>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          {activeCommunity && (
            <button onClick={() => { setActiveCommunity(null); setView("browse"); }} style={{
              background: T.surface, border: `1px solid ${T.border}`,
              color: T.textMuted, borderRadius: 8, padding: "6px 12px",
              cursor: "pointer", fontSize: 13,
            }}>← Back</button>
          )}
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 38, fontWeight: 700,
          }}>
            {activeCommunity ? (
              <span>{activeCommunity.emoji} <span style={{ color: T.accent }}>{activeCommunity.name}</span></span>
            ) : (
              <>🏘️ <span style={{ color: T.accent }}>Communities</span></>
            )}
          </h2>
        </div>
        <p style={{ color: T.textMuted, fontSize: 16 }}>
          {activeCommunity
            ? `${activeCommunity.members.toLocaleString()} members · ${activeCommunity.posts} posts`
            : "Find your tribe. Share your art. Grow together."}
        </p>
      </div>

      {/* BROWSE VIEW */}
      {!activeCommunity && (
        <>
          {/* Search + tabs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍  Search communities..."
              style={{
                flex: 1, minWidth: 200, padding: "11px 16px", borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.inputBg,
                color: T.text, fontSize: 14, outline: "none",
              }}
            />
            <div style={{ display: "flex", background: T.surface, borderRadius: 10, padding: 3, border: `1px solid ${T.border}` }}>
              {[["all", "All"], ["joined", "Joined"]].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} style={{
                  padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: activeTab === key ? T.bgCard : "transparent",
                  color: activeTab === key ? T.accent : T.textMuted,
                  fontSize: 13, fontWeight: activeTab === key ? 600 : 400,
                  boxShadow: activeTab === key ? T.shadow : "none",
                  transition: "all 0.2s",
                }}>{label} {key === "joined" ? `(${joinedCommunities.size})` : ""}</button>
              ))}
            </div>
          </div>

          {/* Community grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 32 }}>
            {filteredCommunities.map((community, i) => (
              <div key={community.id} className="fadeUp card-hover" style={{
                animationDelay: `${i * 0.07}s`,
                background: T.gradCard, border: `1px solid ${T.border}`,
                borderRadius: 20, overflow: "hidden", boxShadow: T.shadow,
              }}>
                {/* Color banner */}
                <div style={{
                  height: 80, background: `linear-gradient(135deg, ${community.color}, ${community.color}66)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 36, position: "relative",
                }}>
                  {community.emoji}
                  {joinedCommunities.has(community.id) && (
                    <div style={{
                      position: "absolute", top: 10, right: 12,
                      background: `${T.accent}22`, border: `1px solid ${T.accent}`,
                      color: T.accent, borderRadius: 6, padding: "2px 8px", fontSize: 11,
                    }}>✓ Joined</div>
                  )}
                </div>

                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                    {community.name}
                  </div>
                  <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
                    {community.desc}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {community.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, padding: "3px 8px", borderRadius: 5,
                        background: T.accentSoft, color: T.accent,
                        border: `1px solid ${T.accentGlow}`,
                      }}>{tag}</span>
                    ))}
                  </div>

                  {/* Stats + buttons */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13, color: T.textSubtle }}>
                      👥 {community.members.toLocaleString()} · 📝 {community.posts}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setActiveCommunity(community); setView("community"); }}
                        className="btn-hover"
                        style={{
                          padding: "7px 14px", borderRadius: 8,
                          border: `1px solid ${T.border}`,
                          background: T.surface, color: T.text,
                          cursor: "pointer", fontSize: 13,
                        }}>View</button>
                      <button
                        onClick={() => toggleJoin(community.id)}
                        className="btn-hover"
                        style={{
                          padding: "7px 14px", borderRadius: 8, border: "none",
                          background: joinedCommunities.has(community.id)
                            ? T.surface
                            : `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
                          color: joinedCommunities.has(community.id) ? T.textMuted : "#fff",
                          cursor: "pointer", fontSize: 13, fontWeight: 600,
                          border: joinedCommunities.has(community.id) ? `1px solid ${T.border}` : "none",
                        }}>
                        {joinedCommunities.has(community.id) ? "Leave" : "Join"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCommunities.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏘️</div>
              <div>No communities found. Try a different search!</div>
            </div>
          )}

          {/* Feed section */}
          <div style={{
            borderTop: `1px solid ${T.border}`, paddingTop: 28,
          }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
              🌐 Community <span style={{ color: T.accent }}>Feed</span>
            </h3>
            {feedPosts.slice(0, 4).map((post, i) => (
              <PostCard key={post.id} post={post} i={i} />
            ))}
          </div>
        </>
      )}

      {/* COMMUNITY DETAIL VIEW */}
      {activeCommunity && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

          {/* Posts feed */}
          <div>
            {/* New post button / form */}
            {!showNewPost ? (
              <button
                onClick={() => setShowNewPost(true)}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: 14, marginBottom: 20,
                  border: `2px dashed ${T.border}`, background: T.bgCard,
                  color: T.textMuted, cursor: "pointer", fontSize: 15,
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
              >
                ✏️ Share something with the community...
              </button>
            ) : (
              <div className="fadeUp" style={{
                background: T.gradCard, border: `1px solid ${T.accent}`,
                borderRadius: 16, padding: 20, marginBottom: 20,
                boxShadow: `0 0 20px ${T.accentGlow}`,
              }}>
                <textarea
                  value={newPostText}
                  onChange={e => setNewPostText(e.target.value)}
                  placeholder="What's on your artistic mind? Share a technique, a WIP, or ask for feedback..."
                  rows={4}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 10,
                    border: `1px solid ${T.border}`, background: T.inputBg,
                    color: T.text, fontSize: 14, resize: "vertical", outline: "none",
                    lineHeight: 1.6, marginBottom: 12,
                    fontFamily: "'Crimson Pro', Georgia, serif",
                  }}
                />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => { setShowNewPost(false); setNewPostText(""); }} style={{
                    padding: "8px 18px", borderRadius: 8, border: `1px solid ${T.border}`,
                    background: T.surface, color: T.textMuted, cursor: "pointer", fontSize: 14,
                  }}>Cancel</button>
                  <button onClick={submitPost} style={{
                    padding: "8px 20px", borderRadius: 8, border: "none",
                    background: `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
                    color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600,
                  }}>Post 🎨</button>
                </div>
              </div>
            )}

            {/* Posts */}
            {currentPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                <div>No posts yet. Be the first to share!</div>
              </div>
            ) : (
              currentPosts.map((post, i) => <PostCard key={post.id} post={post} i={i} />)
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Community info card */}
            <div style={{
              background: T.gradCard, border: `1px solid ${T.border}`,
              borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: T.shadow,
            }}>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>{activeCommunity.emoji}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>
                {activeCommunity.name}
              </div>
              <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 14, textAlign: "center" }}>
                {activeCommunity.desc}
              </p>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16, padding: "12px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: T.accent }}>{activeCommunity.members.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: T.textSubtle }}>Members</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: T.warm1 }}>{activeCommunity.posts}</div>
                  <div style={{ fontSize: 12, color: T.textSubtle }}>Posts</div>
                </div>
              </div>
              <button onClick={() => toggleJoin(activeCommunity.id)} style={{
                width: "100%", padding: "10px 16px", borderRadius: 10, border: "none",
                background: joinedCommunities.has(activeCommunity.id)
                  ? T.surface : `linear-gradient(135deg, ${T.warm1}, ${T.accent})`,
                color: joinedCommunities.has(activeCommunity.id) ? T.textMuted : "#fff",
                cursor: "pointer", fontSize: 14, fontWeight: 600,
                border: joinedCommunities.has(activeCommunity.id) ? `1px solid ${T.border}` : "none",
              }}>
                {joinedCommunities.has(activeCommunity.id) ? "✓ Joined — Leave?" : "Join Community"}
              </button>
            </div>

            {/* Tags */}
            <div style={{
              background: T.gradCard, border: `1px solid ${T.border}`,
              borderRadius: 16, padding: 18, boxShadow: T.shadow,
            }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: T.textMuted }}>TOPICS</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {activeCommunity.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 12, padding: "5px 12px", borderRadius: 8,
                    background: T.accentSoft, color: T.accent,
                    border: `1px solid ${T.accentGlow}`,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}