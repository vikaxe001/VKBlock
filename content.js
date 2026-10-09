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

    const host = url.hostname.toLowerCase();

    return blockedEntries.some(entry => {
      const domain = entry.domain.toLowerCase();
      const path = entry.path;

      const hostMatches =
        host === domain ||
        host === "www." + domain ||
        host === "m." + domain;

      return hostMatches && (
        url.pathname === path ||
        (path !== "/" &&
          url.pathname.startsWith(path + "/"))
      );
    });
  }

  function checkUrl() {
    const currentUrl = location.href;

    if (currentUrl === lastCheckedUrl) return;

    lastCheckedUrl = currentUrl;

    if (isBlocked(currentUrl)) {
      const target =
        chrome.runtime.getURL("blocked.html") +
        "#" + currentUrl;

      location.replace(target);
    }
  }

  chrome.storage.local.get("blockedEntries", result => {
    blockedEntries = result.blockedEntries || [];
    checkUrl();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.blockedEntries) {
      blockedEntries = changes.blockedEntries.newValue || [];
      lastCheckedUrl = "";
      checkUrl();
    }
  });

  window.addEventListener("popstate", checkUrl);
  window.addEventListener("hashchange", checkUrl);
  window.addEventListener("yt-navigate-finish", checkUrl);

  // Kontroll av interna sidbyten.
  // Inga nätverksanrop sker här.
  setInterval(checkUrl, 500);
})();
