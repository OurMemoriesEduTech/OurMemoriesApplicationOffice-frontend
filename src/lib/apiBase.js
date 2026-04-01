const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const API_BASE_URL = rawApiBaseUrl
    .replace(/[\r\n]/g, '')
    .trim()
    .replace(/\/$/, '');