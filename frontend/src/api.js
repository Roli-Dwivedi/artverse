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

// ── CHAT BOX ──────────────────────────────
export const sendChatMessage = async (message, history) => {
  const token = localStorage.getItem('artverse_token');
  const response = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, history })
  });
  return response.json();
};
// ── ART STYLE & AI DETECTION ──────────────────────────────
export const detectArtStyle = async (imageFile) => {
  const token = localStorage.getItem('artverse_token');
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch('http://localhost:5000/api/detect/style', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};

export const detectAIArt = async (imageFile) => {
  const token = localStorage.getItem('artverse_token');
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch('http://localhost:5000/api/detect/ai', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};

// ── AI ART GENERATION ──────────────────────────────
export const generateArt = async (prompt, style) => {
  const token = localStorage.getItem('artverse_token');
  const response = await fetch('http://localhost:5000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, style })
  });
  return response.json();
};

// ── PROFILE ──────────────────────────────
export const getProfile = async () => {
  const token = getToken();
  const res = await fetch(`http://localhost:5000/api/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const updateProfile = async (data) => {
  const token = getToken();
  const res = await fetch(`http://localhost:5000/api/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const saveArtwork = async (data) => {
  const token = getToken();
  const res = await fetch(`http://localhost:5000/api/artworks/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getSavedArtworks = async () => {
  const token = getToken();
  console.log("Token being sent:", token); // add this line temporarily
  const res = await fetch(`http://localhost:5000/api/artworks/saved`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const deleteSavedArtwork = async (id) => {
  const token = getToken();
  const res = await fetch(`http://localhost:5000/api/artworks/saved/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};