import api from "./axios";

export const getDoctors = (params) => api.get("/users/doctors", { params });
export const getPatients = (params) => api.get("/users/patients", { params });
export const getUserById = (id) => api.get(`/users/${id}`);
