import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("wooven_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = async (payload) => (await api.post("/auth/login", payload)).data;
export const signup = async (payload) => (await api.post("/auth/signup", payload)).data;
export const fetchCurrentUser = async () => (await api.get("/auth/me")).data;

export const fetchServices = async () => (await api.get("/services")).data;
export const fetchPortalDashboard = async () => (await api.get("/bookings/dashboard")).data;
export const fetchMyBookings = async () => (await api.get("/bookings/my-bookings")).data;
export const createBooking = async (payload) => (await api.post("/bookings", payload)).data;

export const initiatePayment = async (bookingId) =>
  (await api.post("/payments/initiate", { bookingId })).data;

export const verifyPayment = async (reference) =>
  (await api.post("/payments/verify", { reference })).data;

export const fetchNotifications = async () =>
  (await api.get("/support/notifications")).data;

export const fetchSupportThread = async () =>
  (await api.get("/support/thread")).data;

export const sendSupportMessage = async (message) =>
  (await api.post("/support/messages", { message })).data;

export const adminLogin = async (payload) =>
  (await api.post("/admin-auth/login", payload)).data;

export const fetchAdminDashboard = async () =>
  (await api.get("/admin/dashboard")).data;

export const fetchAdminBookings = async () =>
  (await api.get("/admin/bookings")).data;

export const confirmAdminBooking = async (bookingId, payload) =>
  (await api.post(`/admin/bookings/${bookingId}/confirm`, payload)).data;

export const fetchAdminConversations = async () =>
  (await api.get("/admin/support/conversations")).data;

export const fetchAdminConversation = async (ticketId) =>
  (await api.get(`/admin/support/conversations/${ticketId}`)).data;

export const sendAdminSupportReply = async (ticketId, message) =>
  (await api.post(`/admin/support/conversations/${ticketId}/messages`, { message })).data;

export const fetchDispatchBoard = async (date) =>
  (await api.get(`/admin/dispatch?date=${date}`)).data;

export const updateDispatchJourney = async (bookingId, payload) =>
  (await api.patch(`/admin/dispatch/${bookingId}`, payload)).data;

export const fetchPartners = async () => (await api.get("/admin/partners")).data;
export const createPartner = async (payload) => (await api.post("/admin/partners", payload)).data;
export const updatePartner = async (id, payload) => (await api.patch(`/admin/partners/${id}`, payload)).data;

export const fetchPartnerVehicles = async () => (await api.get("/admin/vehicles")).data;
export const createPartnerVehicle = async (payload) => (await api.post("/admin/vehicles", payload)).data;
export const updatePartnerVehicle = async (id, payload) => (await api.patch(`/admin/vehicles/${id}`, payload)).data;

export const fetchPartnerDrivers = async () => (await api.get("/admin/drivers")).data;
export const createPartnerDriver = async (payload) => (await api.post("/admin/drivers", payload)).data;
export const updatePartnerDriver = async (id, payload) => (await api.patch(`/admin/drivers/${id}`, payload)).data;

export const fetchAdminClients = async () => (await api.get("/admin/clients")).data;
export const fetchAvailableBookingResources = async (bookingId) =>
  (await api.get(`/admin/bookings/${bookingId}/resources`)).data;

export default api;