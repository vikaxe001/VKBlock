(() => {
  "use strict";

  let blockedEntries = [];
  let lastCheckedUrl = "";

  // Kontrollerar om webbadressen matchar blockeringslistan.
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

    const host = url.hostname.toLowerCase().replace(/\.$/, "");

    return blockedEntries.some(entry => {
      if (!entry || typeof entry.domain !== "string" ||
          typeof entry.path !== "string") {
        return false;
      }

      const domain = entry.domain.toLowerCase();
      const path = entry.path;

      // Matchar domänen och dess underdomäner.
      const hostMatches =
        host === domain ||
        host.endsWith("." + domain);

      // En domänregel blockerar hela webbplatsen.
      // En sökvägsregel blockerar endast angiven
      // sökväg och dess undersidor.
      const pathMatches =
        path === "/" ||
        url.pathname === path ||
        url.pathname.startsWith(path + "/");

      return hostMatches && pathMatches;
    });
  }

  function checkUrl() {
    const currentUrl = location.href;

    if (currentUrl === lastCheckedUrl) {
      return;
    }

    lastCheckedUrl = currentUrl;

    if (isBlocked(currentUrl)) {
      const target =
        chrome.runtime.getURL("blocked.html") +
        "#" + currentUrl;

      location.replace(target);
    }
  }

  // Hämtar lokalt lagrade blockeringsregler.
  chrome.storage.local.get("blockedEntries", result => {
    blockedEntries = Array.isArray(result.blockedEntries)
      ? result.blockedEntries
      : [];

    checkUrl();
  });

  // Uppdaterar reglerna när background.js
  // har hämtat en ny blockeringslista.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.blockedEntries) {
      blockedEntries = Array.isArray(
        changes.blockedEntries.newValue
      )
        ? changes.blockedEntries.newValue
        : [];

      lastCheckedUrl = "";
      checkUrl();
    }
  });

  // Kontrollerar navigering utan fullständig sidladdning.
  window.addEventListener("popstate", checkUrl);
  window.addEventListener("hashchange", checkUrl);
  window.addEventListener("yt-navigate-finish", checkUrl);

  // Fångar även adressändringar som inte genererar
  // vanliga navigeringshändelser.
  setInterval(checkUrl, 500);
})();
