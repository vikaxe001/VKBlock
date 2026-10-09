(() => {
  "use strict";

  const DEFAULT_HOME = "https://www.google.com/";

  const addressElement =
    document.getElementById("blocked-address");

  const homeLink =
    document.getElementById("home-link");

  // Läs blockerad adress från fragmentet.
  const originalAddress = location.hash.slice(1);

  try {
    const url = new URL(originalAddress);

    if (["http:", "https:"].includes(url.protocol)) {
      const pathname =
        url.pathname === "/" ? "" : url.pathname;

      addressElement.textContent =
        url.hostname + pathname;
    } else {
      addressElement.textContent = "du försökte öppna";
    }
  } catch {
    addressElement.textContent = "du försökte öppna";
  }

  // Ta bort den ursprungliga adressen
  // från blockeringssidans adressfält.
  history.replaceState(
    null,
    "",
    location.pathname
  );

  chrome.storage.local.get("homepage", result => {
    let homepage = DEFAULT_HOME;

    try {
      const url = new URL(result.homepage || DEFAULT_HOME);

      if (["http:", "https:"].includes(url.protocol) &&
          !url.username && !url.password) {
        homepage = url.href;
      }
    } catch {
      homepage = DEFAULT_HOME;
    }

    homeLink.href = homepage;
  });
})();
