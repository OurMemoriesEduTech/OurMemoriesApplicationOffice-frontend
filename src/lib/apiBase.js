const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Clean up any whitespace and ensure no trailing slash
export const API_BASE_URL = rawApiBaseUrl
    .replace(/[\r\n]/g, '')  // Remove newlines
    .trim()
    .replace(/\/$/, '');     // Remove trailing slash

// For debugging - log the URL in development
if (import.meta.env.DEV) {
    console.log('API_BASE_URL:', API_BASE_URL);
}