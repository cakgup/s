(function () {
  const config = window.CAKGUP_SHORTLINK_CONFIG || {};
  const SESSION_KEY = config.SESSION_KEY || "cakgup_shortlink_logged_in";
  const API_TOKEN_SESSION_KEY = config.API_TOKEN_SESSION_KEY || "cakgup_shortlink_api_token";

  window.CakgupAuth = {
    isLoggedIn() {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    },

    login(password) {
      if (password === config.STATIC_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "true");

        // Untuk versi sementara, password halaman utama = API token doPost.
        // Token hanya disimpan sementara di sessionStorage dan hilang saat tab/browser ditutup.
        sessionStorage.setItem(API_TOKEN_SESSION_KEY, password);
        return true;
      }
      return false;
    },

    getApiToken() {
      return sessionStorage.getItem(API_TOKEN_SESSION_KEY) || "";
    },

    logout() {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(API_TOKEN_SESSION_KEY);
    }
  };
})();
