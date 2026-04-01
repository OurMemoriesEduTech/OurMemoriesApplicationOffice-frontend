const rawApiBaseUrl = "https://ourmemoriesapplicationoffice-server.onrender.com";

export const API_BASE_URL = rawApiBaseUrl
  .replace(/\\r|\\n/g, "")
  .replace(/[\r\n]/g, "")
  .trim();
