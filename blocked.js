(() => {
  "use strict";

  const DEFAULT_HOME =
    "https://sites.google.com/utb.vaxjo.se/start";

  const addressElement =
    document.getElementById("blocked-address");

  const homeLink =
    document.getElementById("home-link");

  // Läs blockerad adress från URL-fragmentet.
  // Fungerar med både background.js och content.js.
  const originalAddress = location.hash.slice(1);

  try {
    const url = new URL(originalAddress);

    if (["http:", "https:"].includes(url.protocol)) {
      const pathname =
        url.pathname === "/" ? "" : url.pathname;

      // Visa domän och sökväg.
      addressElement.textContent =
        url.hostname + pathname;
    } else {
      addressElement.textContent =
        "du försökte öppna";
    }
  } catch {
    addressElement.textContent =
      "du försökte öppna";
  }

  // Ta bort den blockerade adressen från
  // blockeringssidans adressfält.
  history.replaceState(
    null,
    "",
    location.pathname
  );

  // Hämta startsidan från lokal lagring.
  chrome.storage.local.get("homepage", result => {
    let homepage = DEFAULT_HOME;

    try {
      const url = new URL(
        result.homepage || DEFAULT_HOME
      );

      if (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      ) {
        homepage = url.href;
      }
    } catch {
      homepage = DEFAULT_HOME;
    }

    homeLink.href = homepage;
  });
})();
