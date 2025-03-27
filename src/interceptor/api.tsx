import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// Create basic API instance without interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;