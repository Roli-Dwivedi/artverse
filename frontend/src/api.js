// Base URL of our Flask backend
const BASE_URL = "http://localhost:5000/api";

// ── AUTH ──────────────────────────────
export const registerUser = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// ── ARTWORKS ──────────────────────────
export const getArtworks = async () => {
  const res = await fetch(`${BASE_URL}/artworks/`);
  return res.json();
};

export const likeArtwork = async (id) => {
  const res = await fetch(`${BASE_URL}/artworks/${id}/like`, {
    method: "POST",
  });
  return res.json();
};

// ── COMMUNITIES ───────────────────────
export const getCommunities = async () => {
  const res = await fetch(`${BASE_URL}/communities/`);
  return res.json();
};

// ── TOKEN HELPERS ─────────────────────
export const saveToken = (token) => localStorage.setItem("artverse_token", token);
export const getToken = () => localStorage.getItem("artverse_token");
export const removeToken = () => localStorage.removeItem("artverse_token");
export const isLoggedIn = () => !!getToken();