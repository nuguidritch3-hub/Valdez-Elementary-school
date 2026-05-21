/**
 * Global Configuration Utility
 * Dynamically resolves the API server URL to avoid hardcoded localhost issues
 * when accessing the school site on a local network or multiple hostnames.
 */
export const getApiUrl = (path) => {
  const isDev = import.meta.env.DEV;
  if (isDev) {
    const hostname = window.location.hostname || 'localhost';
    // Dynamically point to the backend server on port 5000 of the serving host
    return `http://${hostname}:5000${path}`;
  }
  // In production (built assets), use relative routing from the same origin
  return path;
};
