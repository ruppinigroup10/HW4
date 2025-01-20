const config = {
  // Base settings
  PORT: "7067", // make sure to change this to your server port
  apiVersion: "tar1", // For API endpoints
  clientVersion: "tar3", // For static assets/client files
  localIP: "127.0.0.1", // Localhost IP

  // Base API URL
  get baseApi() {
    const isLocal =
      window.location.host.includes(this.localIP) ||
      window.location.host.includes("localhost");
    const apiUrl = isLocal
      ? `https://localhost:${this.PORT}/api`
      : `https://proj.ruppin.ac.il/igroup10/test2/${this.apiVersion}/api`;
    console.log("API URL:", apiUrl);
    return apiUrl;
  },

  // Base path for static assets
  get basePath() {
    const isLocal =
      window.location.host.includes(this.localIP) ||
      window.location.host.includes("localhost");
    const fullPath = isLocal
      ? window.location.origin // This will give us http://127.0.0.1:5500
      : `https://proj.ruppin.ac.il/igroup10/test2/${this.clientVersion}`;
    console.log("Base Path:", fullPath);
    return fullPath;
  },

  // Helper for API URLs
  getApiUrl(endpoint) {
    endpoint = endpoint.replace(/^\/+/, "");
    const url = `${this.baseApi}/${endpoint}`;
    return url.replace(/([^:]\/)\/+/g, "$1");
  },

  // Helper for static asset URLs (JS, CSS, HTML)
  getAssetUrl(path) {
    path = path.replace(/^\/+/, "");
    return `${this.basePath}/${path}`;
  },
};

// Make it globally available
window.config = config;
window.Port_BU = "7067"; // Backup port
