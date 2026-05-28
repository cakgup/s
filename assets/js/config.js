/**
 * Konfigurasi aplikasi Cakgup Shortlink.
 * Endpoint Google Apps Script Web App sudah menggunakan URL real.
 */
(function () {
  const GUNUNGAN_SRC = new URL("../img/gunungan.png", document.currentScript.src).href;
  const APP_BASE_URL = new URL("../..", document.currentScript.src).href.replace(/\/$/, "");

  window.CAKGUP_SHORTLINK_CONFIG = {
    APP_NAME: "Cakgup Shortlink",
    STATIC_PASSWORD: "cakgup",
    SESSION_KEY: "cakgup_shortlink_logged_in",
    API_TOKEN_SESSION_KEY: "cakgup_shortlink_api_token",
    API_BASE_URL: "https://script.google.com/macros/s/AKfycby916I0dtuRqtYSv9U_foaY9KN8nK8_dK49-7ab8E7BC1y3zKwTnXE2ylslbubxlh6U1A/exec",
    SHORTLINK_BASE_URL: APP_BASE_URL,
    GUNUNGAN_SRC,
    REDIRECT_DELAY_MS: 900,
    FETCH_TIMEOUT_MS: 12000
  };
})();
