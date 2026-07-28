import axios from "axios";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:9090/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!(config.data instanceof FormData)) config.headers["Content-Type"] = "application/json";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
};

export const propertyApi = {
  search: (params = {}) => api.get("/properties/search", {
    params: {
      city: params.city || undefined,
      type: params.type || params.propertyType || undefined,
      minRent: params.minRent || undefined,
      maxRent: params.maxRent || undefined,
    }
  }),
  getById: (id) => api.get(`/properties/${id}`),
  getMine: () => api.get("/properties/my"),
  create: (payload) => api.post("/properties", payload),
  update: (id, payload) => api.put(`/properties/${id}`, payload),
  remove: (id) => api.delete(`/properties/${id}`),
  setAmenities: (id, amenities) => api.put(`/properties/${id}/amenities`, amenities),
  addAmenity: (id, value) => api.post(`/properties/${id}/amenities`, { value }),
  removeAmenity: (id, value) => api.delete(`/properties/${id}/amenities`, { params: { value } }),
  uploadImages: (id, files) => {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    return api.post(`/properties/${id}/images/upload-multiple`, form);
  },
  setCover: (id, imageUrl) => api.put(`/properties/${id}/images/cover`, null, { params: { imageUrl } }),
  removeImage: (id, imageUrl) => api.delete(`/properties/${id}/images/uploaded`, { params: { imageUrl } }),
};

export const roomApi = {
  list: (propertyId) => api.get(`/properties/${propertyId}/rooms`),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (propertyId, payload) => api.post(`/properties/${propertyId}/rooms`, payload),
  update: (id, payload) => api.put(`/rooms/${id}`, payload),
  activate: (id, active) => api.put(`/rooms/${id}/activate`, null, { params: { active } }),
  remove: (id) => api.delete(`/rooms/${id}`),
  addBed: (roomId, payload) => api.post(`/rooms/${roomId}/beds`, payload),
  updateBed: (id, payload) => api.put(`/beds/${id}`, payload),
  removeBed: (id) => api.delete(`/beds/${id}`),
};

export const availabilityApi = {
  check: (propertyId, from, to) => api.get(`/availability/properties/${propertyId}`, {
    params: { from, ...(to ? { to } : {}) },
  }),
};

export const bookingApi = {
  create: (payload) => api.post("/bookings", payload),
  mine: () => api.get("/bookings/my"),
  owner: () => api.get("/bookings/owner"),
  updateStatus: (id, status, reason = "") => api.patch(`/bookings/${id}/status`, { status, reason }),
};

export const wishlistApi = {
  list: () => api.get("/wishlist"),
  add: (propertyId) => api.post(`/wishlist/${propertyId}`),
  remove: (propertyId) => api.delete(`/wishlist/${propertyId}`),
};

export const reviewApi = {
  list: (propertyId) => api.get(`/properties/${propertyId}/reviews`),
  summary: (propertyId) => api.get(`/properties/${propertyId}/rating`),
  save: (propertyId, payload) => api.post(`/properties/${propertyId}/reviews`, payload),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const userApi = {
  me: () => api.get("/users/me"),
  update: (payload) => api.put("/users/me", payload),
  changePassword: (payload) => api.put("/users/me/password", payload),
  submitVerification: (payload) => api.post("/users/me/verification", payload),
};

export const dashboardApi = { owner: () => api.get("/dashboard/owner") };

export const adminApi = {
  users: () => api.get("/admin/users"),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  pendingProperties: () => api.get("/admin/properties/pending"),
  decideProperty: (id, decision, reason = "") => api.patch(`/admin/properties/${id}/decision`, { decision, reason }),
  pendingOwners: () => api.get("/admin/owners/pending"),
  decideOwner: (id, decision, reason = "") => api.patch(`/admin/owners/${id}/decision`, { decision, reason }),
  reports: () => api.get("/admin/reports"),
};

export const errorMessage = (error, fallback = "Something went wrong") => {
  if (!error.response) return "Cannot connect to backend. Start Spring Boot on http://localhost:9090.";
  const data = error.response.data;
  if (typeof data === "string") return data;
  return data?.message || data?.detail || data?.error || fallback;
};

export default api;
