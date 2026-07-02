import api from "./axios";

export const bookAppointment = (data) => api.post("/appointments", data);
export const getAppointments = (params) => api.get("/appointments", { params });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const cancelAppointment = (id, data) => api.patch(`/appointments/${id}/cancel`, data);
export const confirmAppointment = (id) => api.patch(`/appointments/${id}/confirm`);
export const completeAppointment = (id, data) => api.patch(`/appointments/${id}/complete`, data);
