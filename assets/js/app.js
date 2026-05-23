(function () {
  const config = window.CAKGUP_SHORTLINK_CONFIG || {};
  const API_BASE_URL = config.API_BASE_URL || "https://script.google.com/macros/s/AKfycby916I0dtuRqtYSv9U_foaY9KN8nK8_dK49-7ab8E7BC1y3zKwTnXE2ylslbubxlh6U1A/exec";
  const SHORTLINK_BASE_URL = (config.SHORTLINK_BASE_URL || "https://cakgup.github.io/s").replace(/\/$/, "");
  const GUNUNGAN_SRC = config.GUNUNGAN_SRC || "/s/assets/img/gunungan.png";
  const REDIRECT_DELAY_MS = Number(config.REDIRECT_DELAY_MS || 900);
  const FETCH_TIMEOUT_MS = Number(config.FETCH_TIMEOUT_MS || 12000);

  const $ = (selector) => document.querySelector(selector);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildApiUrl(params = {}) {
    const url = new URL(API_BASE_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  function withTimeout(promise, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return {
      signal: controller.signal,
      run: promise(controller.signal).finally(() => clearTimeout(timeout))
    };
  }

  async function fetchJson(url, options = {}) {
    const request = withTimeout((signal) => fetch(url, { ...options, signal }), FETCH_TIMEOUT_MS);
    const response = await request.run;
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error("Response API bukan JSON valid. Periksa deployment Google Apps Script.");
    }
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    return data;
  }

  function getRouteSlug() {
    const query = new URLSearchParams(window.location.search);
    const querySlug = query.get("link_name") || query.get("slug");
    if (querySlug) return normalizeSlug(querySlug);

    const path = window.location.pathname.replace(/\/+/g, "/");
    const parts = path.split("/").filter(Boolean);

    // GitHub Pages project path: /s or /s/ adalah halaman utama, bukan slug.
    // Sebelumnya /link terbaca sebagai slug "link", sehingga muncul error
    // "Shortlink /link belum tersedia".
    if (parts[0] === "s") {
      const secondPart = parts[1] || "";
      if (!secondPart || secondPart === "index.html" || secondPart === "404.html") {
        return "";
      }
      return normalizeSlug(secondPart);
    }

    // Local testing: /[slug]
    if (parts.length === 1 && parts[0] !== "index.html" && parts[0] !== "404.html") {
      return normalizeSlug(parts[0]);
    }

    return "";
  }

  function normalizeSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function renderShell(content, options = {}) {
    const root = $("#app");
    if (!root) return;

    const compactClass = options.compact ? " mobile-frame--compact" : "";
    root.innerHTML = `
      <main class="page-shell">
        <section class="mobile-frame${compactClass}">
          <div class="pattern-glow pattern-glow--one"></div>
          <div class="pattern-glow pattern-glow--two"></div>
          ${content}
        </section>
      </main>
    `;
  }

  function renderBrandHeader(subtitle = "Gerbang Tautan Digital Bernuansa Majapahit") {
    return `
      <header class="brand-header">
        <img class="gunungan" src="${escapeHtml(GUNUNGAN_SRC)}" alt="Gunungan Majapahit" loading="eager">
        <p class="eyebrow">Made with <span class="love-icon" aria-label="love">❤</span></p>
        <h1 class="brand-title">Short Link</h1>
        <p class="brand-subtitle">${escapeHtml(subtitle)}</p>
      </header>
    `;
  }

  function renderFooter() {
    return `<footer class="footer">Made with <span class="love-icon" aria-label="love">❤</span> by cakgup · didedikasikan untuk ummat</footer>`;
  }

  function showLoginPage(message = "") {
    renderShell(`
      ${renderBrandHeader("Masukkan sandi untuk membuka halaman utama shortlink.")}
      <section class="card login-card">
        <label class="label" for="passwordInput">Sandi Akses</label>
        <div class="password-row">
          <input id="passwordInput" class="input" type="password" placeholder="Masukkan password" autocomplete="current-password">
          <button id="togglePassword" class="icon-button" type="button" aria-label="Tampilkan password">👁</button>
        </div>
        <button id="loginButton" class="button button-primary" type="button">Masuk Gerbang</button>
        <p id="loginMessage" class="message message-error">${escapeHtml(message)}</p>
      </section>
      ${renderFooter()}
    `);

    const passwordInput = $("#passwordInput");
    const loginButton = $("#loginButton");
    const togglePassword = $("#togglePassword");

    passwordInput?.focus();

    function submitLogin() {
      const value = passwordInput?.value || "";
      if (window.CakgupAuth.login(value)) {
        showHomePage();
      } else {
        const msg = $("#loginMessage");
        if (msg) msg.textContent = "Password salah. Silakan coba kembali.";
      }
    }

    loginButton?.addEventListener("click", submitLogin);
    passwordInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submitLogin();
    });
    togglePassword?.addEventListener("click", () => {
      passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });
  }

  function showHomePage() {
    if (!window.CakgupAuth.isLoggedIn()) {
      showLoginPage();
      return;
    }

    renderShell(`
      <div class="topbar">
        <span class="topbar-badge">❤</span>
        <button id="logoutButton" class="link-button" type="button">Keluar</button>
      </div>
      ${renderBrandHeader("ringkas, mudah, dan cepat untuk berbagi tautan penting.")}

      <section class="toolbar-card">
        <label class="label" for="searchInput">Cari Tautan</label>
        <input id="searchInput" class="input" type="search" placeholder="Cari judul, kategori, atau link name...">
        <button id="toggleAdminForm" class="button button-secondary" type="button">Tambah Shortlink</button>
      </section>

      <section id="adminPanel" class="card admin-card hidden" aria-label="Form tambah shortlink">
        <h2 class="section-title">Tambah Shortlink</h2>
        <p class="section-desc">API token sementara otomatis mengikuti password login. Token hanya disimpan pada sesi browser.</p>
        <form id="linkForm" class="form-grid">
          <div>
            <label class="label" for="apiKeyInput">API Token</label>
            <input id="apiKeyInput" class="input" type="password" placeholder="Token doPost" autocomplete="off" value="${escapeHtml(window.CakgupAuth.getApiToken?.() || "")}">
          </div>
          <div>
            <label class="label" for="linkNameInput">Link Name</label>
            <input id="linkNameInput" class="input" type="text" placeholder="contoh: donasi-palestina" autocomplete="off">
          </div>
          <div>
            <label class="label" for="targetUrlInput">Target URL</label>
            <input id="targetUrlInput" class="input" type="url" placeholder="https://contoh.com/tujuan" required>
          </div>
          <div>
            <label class="label" for="titleInput">Judul</label>
            <input id="titleInput" class="input" type="text" placeholder="Judul tautan">
          </div>
          <div>
            <label class="label" for="descriptionInput">Deskripsi</label>
            <textarea id="descriptionInput" class="textarea" rows="3" placeholder="Deskripsi singkat"></textarea>
          </div>
          <div>
            <label class="label" for="categoryInput">Kategori</label>
            <input id="categoryInput" class="input" type="text" placeholder="donasi, kajian, laporan">
          </div>
          <label class="check-row">
            <input id="publicInput" type="checkbox" checked>
            <span>Tampilkan di halaman utama</span>
          </label>
          <button class="button button-primary" type="submit">Simpan Shortlink</button>
          <p id="formMessage" class="message"></p>
        </form>
      </section>

      <section class="list-header">
        <div>
          <h2 class="section-title">Tautan Publik</h2>
          <p id="listInfo" class="section-desc">Memuat daftar tautan...</p>
        </div>
        <button id="refreshButton" class="mini-button" type="button">Muat Ulang</button>
      </section>

      <section id="linkList" class="link-list" aria-live="polite"></section>
      ${renderFooter()}
    `);

    $("#logoutButton")?.addEventListener("click", () => {
      window.CakgupAuth.logout();
      showLoginPage("Anda sudah keluar dari halaman utama.");
    });

    $("#toggleAdminForm")?.addEventListener("click", () => {
      $("#adminPanel")?.classList.toggle("hidden");
    });

    $("#refreshButton")?.addEventListener("click", loadPublicLinks);
    $("#searchInput")?.addEventListener("input", filterVisibleLinks);
    $("#linkForm")?.addEventListener("submit", submitShortlinkForm);

    loadPublicLinks();
  }

  async function loadPublicLinks() {
    const list = $("#linkList");
    const info = $("#listInfo");
    if (!list || !info) return;

    list.innerHTML = `<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>`;
    info.textContent = "Memuat daftar tautan...";

    try {
      const data = await fetchJson(buildApiUrl({ action: "list" }));
      const items = Array.isArray(data.data) ? data.data : [];
      window.__cakgupLinks = items;
      renderLinkList(items);
      info.textContent = items.length ? `${items.length} tautan publik tersedia.` : "Belum ada tautan publik.";
    } catch (error) {
      list.innerHTML = `
        <article class="empty-state">
          <h3>Belum dapat memuat tautan</h3>
          <p>${escapeHtml(error.message)}</p>
          <p class="hint">Pastikan API_BASE_URL pada assets/js/config.js sudah diganti dengan URL Web App Google Apps Script.</p>
        </article>
      `;
      info.textContent = "API belum tersambung.";
    }
  }

  function renderLinkList(items) {
    const list = $("#linkList");
    if (!list) return;

    if (!items.length) {
      list.innerHTML = `
        <article class="empty-state">
          <h3>Belum ada tautan publik</h3>
          <p>Tambahkan shortlink melalui form atau API doPost.</p>
        </article>
      `;
      return;
    }

    list.innerHTML = items.map((item) => {
      const slug = item.link_name || item.slug || "";
      const title = item.title || slug || "Tanpa judul";
      const description = item.description || "Tautan ringkas Cakgup Shortlink.";
      const category = item.category || "umum";
      const shortlink = item.shortlink || `${SHORTLINK_BASE_URL}/${slug}`;
      return `
        <article class="link-card" data-search="${escapeHtml(`${title} ${description} ${category} ${slug}`.toLowerCase())}">
          <div class="link-card-main">
            <span class="category-pill">${escapeHtml(category)}</span>
            <h3 class="link-title">${escapeHtml(title)}</h3>
            <p class="link-desc">${escapeHtml(description)}</p>
            <code class="link-slug">/${escapeHtml(slug)}</code>
          </div>
          <div class="link-actions">
            <a class="button button-primary button-small" href="${escapeHtml(shortlink)}">Buka</a>
            <button class="mini-button copy-button" type="button" data-copy="${escapeHtml(shortlink)}">Salin</button>
            <button class="mini-button danger-button delete-button" type="button" data-delete="${escapeHtml(slug)}" data-title="${escapeHtml(title)}">Hapus</button>
          </div>
        </article>
      `;
    }).join("");

    document.querySelectorAll(".copy-button").forEach((button) => {
      button.addEventListener("click", async () => {
        const value = button.getAttribute("data-copy") || "";
        try {
          await navigator.clipboard.writeText(value);
          button.textContent = "Tersalin";
          setTimeout(() => (button.textContent = "Salin"), 1400);
        } catch {
          button.textContent = "Gagal";
          setTimeout(() => (button.textContent = "Salin"), 1400);
        }
      });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", () => deleteShortlink(button));
    });
  }

  function filterVisibleLinks() {
    const query = ($("#searchInput")?.value || "").trim().toLowerCase();
    document.querySelectorAll(".link-card").forEach((card) => {
      const haystack = card.getAttribute("data-search") || "";
      card.classList.toggle("hidden", query && !haystack.includes(query));
    });
  }

  async function deleteShortlink(button) {
    const slug = button.getAttribute("data-delete") || "";
    const title = button.getAttribute("data-title") || slug;
    const apiToken = window.CakgupAuth.getApiToken?.() || "";

    if (!slug) {
      window.alert("Link name tidak ditemukan.");
      return;
    }

    if (!apiToken) {
      window.alert("API Token tidak ditemukan. Silakan keluar, lalu login ulang agar token sesi terisi kembali.");
      return;
    }

    const confirmed = window.confirm(
      `Hapus shortlink /${slug}?\n\nTautan "${title}" akan dinonaktifkan dan tidak tampil lagi di halaman utama.`
    );

    if (!confirmed) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Menghapus...";

    try {
      const data = await fetchJson(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          api_key: apiToken,
          token: apiToken,
          action: "delete",
          link_name: slug
        })
      });

      if (!data.success) {
        throw new Error(data.message || "Gagal menghapus shortlink.");
      }

      button.textContent = "Terhapus";
      loadPublicLinks();
    } catch (error) {
      button.disabled = false;
      button.textContent = originalText;
      window.alert(`Gagal menghapus shortlink /${slug}: ${error.message}`);
    }
  }

  async function submitShortlinkForm(event) {
    event.preventDefault();
    const msg = $("#formMessage");
    const apiToken = ($("#apiKeyInput")?.value.trim() || window.CakgupAuth.getApiToken?.() || "");
    const payload = {
      // Kirim dua nama field agar kompatibel dengan Code.gs versi lama dan versi baru.
      api_key: apiToken,
      token: apiToken,
      link_name: normalizeSlug($("#linkNameInput")?.value || ""),
      target_url: $("#targetUrlInput")?.value.trim(),
      title: $("#titleInput")?.value.trim(),
      description: $("#descriptionInput")?.value.trim(),
      category: $("#categoryInput")?.value.trim(),
      public: $("#publicInput")?.checked,
      status: "aktif"
    };

    if (!apiToken) {
      msg.textContent = "API Token belum terisi. Silakan login ulang atau isi token secara manual.";
      msg.className = "message message-error";
      return;
    }

    if (!payload.target_url) {
      msg.textContent = "Target URL wajib diisi.";
      msg.className = "message message-error";
      return;
    }

    msg.textContent = "Menyimpan shortlink...";
    msg.className = "message";

    try {
      const data = await fetchJson(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      if (!data.success) throw new Error(data.message || "Gagal menyimpan shortlink.");
      msg.innerHTML = `Berhasil dibuat: <a href="${escapeHtml(data.shortlink)}" target="_blank" rel="noopener">${escapeHtml(data.shortlink)}</a>`;
      msg.className = "message message-success";
      $("#linkForm")?.reset();
      if ($("#apiKeyInput")) $("#apiKeyInput").value = window.CakgupAuth.getApiToken?.() || apiToken;
      $("#publicInput").checked = true;
      loadPublicLinks();
    } catch (error) {
      msg.textContent = error.message;
      msg.className = "message message-error";
    }
  }

  async function resolveAndRedirect(slug) {
    renderShell(`
      ${renderBrandHeader("Sedang membuka gerbang tautan...")}
      <section class="card redirect-card">
        <div class="spinner" aria-hidden="true"></div>
        <h2 class="section-title centered">Mohon tunggu</h2>
        <p id="redirectMessage" class="section-desc centered">Mencari tujuan untuk <strong>/${escapeHtml(slug)}</strong>.</p>
      </section>
      ${renderFooter()}
    `, { compact: true });

    try {
      const data = await fetchJson(buildApiUrl({ link_name: slug }));
      if (!data.success || !data.target_url) {
        showNotFound(slug, data.message || "Shortlink tidak ditemukan atau tidak aktif.");
        return;
      }

      const targetUrl = data.target_url;
      const message = $("#redirectMessage");
      if (message) {
        message.innerHTML = `Gerbang ditemukan. Anda akan dialihkan ke:<br><a href="${escapeHtml(targetUrl)}" rel="noopener">${escapeHtml(targetUrl)}</a>`;
      }

      setTimeout(() => {
        window.location.replace(targetUrl);
      }, REDIRECT_DELAY_MS);
    } catch (error) {
      showNotFound(slug, error.message || "Gagal menghubungi API shortlink.");
    }
  }

  function showNotFound(slug, message) {
    renderShell(`
      ${renderBrandHeader("Gerbang tautan belum dapat dibuka.")}
      <section class="card error-card">
        <h2 class="section-title centered">Tautan Tidak Ditemukan</h2>
        <p class="section-desc centered">Shortlink <strong>/${escapeHtml(slug)}</strong> belum tersedia, tidak aktif, atau API belum tersambung.</p>
        <p class="message message-error">${escapeHtml(message)}</p>
        <a class="button button-primary" href="${SHORTLINK_BASE_URL}/">Kembali ke Halaman Utama</a>
      </section>
      ${renderFooter()}
    `, { compact: true });
  }

  function boot() {
    const slug = getRouteSlug();
    if (slug) {
      resolveAndRedirect(slug);
      return;
    }

    if (window.CakgupAuth.isLoggedIn()) {
      showHomePage();
    } else {
      showLoginPage();
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
