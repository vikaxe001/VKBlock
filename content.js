(() => {
  "use strict";

  let blockedEntries = [];
  let lastCheckedUrl = "";

  function isBlocked(address) {
    let url;

    try {
      url = new URL(address);
    } catch {
      return false;
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;

    return blockedEntries.some(entry => {
      if (!entry || typeof entry.domain !== "string" ||
          typeof entry.path !== "string") {
        return false;
      }

      const domain = entry.domain.toLowerCase()
        .replace(/^(www|m)\./, "");

      const hostMatches =
        hostname === domain ||
        hostname === "www." + domain ||
        hostname === "m." + domain;

      if (!hostMatches) return false;

      const path = entry.path.replace(/\/+$/, "") || "/";

      return pathname === path ||
        (path !== "/" && pathname.startsWith(path + "/"));
    });
  }

  function checkUrl() {
    const currentUrl = location.href;

    if (currentUrl === lastCheckedUrl) return;

    lastCheckedUrl = currentUrl;

    if (isBlocked(currentUrl)) {
      location.replace(chrome.runtime.getURL("blocked.html"));
    }
  }

  // Hämta den lokalt sparade blockeringslistan.
  chrome.storage.local.get("blockedEntries", result => {
    blockedEntries = result.blockedEntries || [];
    checkUrl();
  });

  // Reagera när listan uppdateras.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.blockedEntries) {
      blockedEntries = changes.blockedEntries.newValue || [];
      lastCheckedUrl = "";
      checkUrl();
    }
  });

  // Fånga intern navigering utan sidomladdning.
  window.addEventListener("popstate", checkUrl);
  window.addEventListener("hashchange", checkUrl);
  window.addEventListener("yt-navigate-finish", checkUrl);

  // Reservkontroll för webbplatser som ändrar
  // webbadressen med history.pushState().
  setInterval(checkUrl, 500);
})();
