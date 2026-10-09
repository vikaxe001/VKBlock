const BLOCKLIST_URL =
  "https://vikaxe001.github.io/VKBlock/blocklist.json";

const UPDATE_INTERVAL = 5;
const ALARM_NAME = "update-blocklist";
const DEFAULT_HOME = "https://www.google.com/";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeEntry(entry) {
  if (!entry ||
      typeof entry.domain !== "string" ||
      typeof entry.path !== "string") {
    throw new Error("Ogiltig blockeringsregel");
  }

  const domain = entry.domain.toLowerCase()
    .replace(/^(www|m)\./, "");

  const path = entry.path.replace(/\/+$/, "") || "/";

  if (!/^[a-z0-9.-]+$/.test(domain) ||
      !domain.includes(".") ||
      !path.startsWith("/") ||
      /[?#*]/.test(path)) {
    throw new Error("Ogiltig domän eller sökväg");
  }

  return { domain, path };
}

function isBlocked(address, entries) {
  try {
    const url = new URL(address);
    const host = url.hostname.toLowerCase();

    return entries.some(entry => {
      const domain = entry.domain;
      const hostMatches =
        host === domain ||
        host === "www." + domain ||
        host === "m." + domain;

      return hostMatches && (
        url.pathname === entry.path ||
        (entry.path !== "/" &&
          url.pathname.startsWith(entry.path + "/"))
      );
    });
  } catch {
    return false;
  }
}

function createRule(entry, id) {
  const domain = escapeRegex(entry.domain);
  const pathname = escapeRegex(entry.path);

  const pathEnd = entry.path === "/"
    ? ".*"
    : "(?:[/?#]|$).*";

  const regex =
    `^https?://(?:(?:www|m)\\.)?${domain}` +
    `${pathname}${pathEnd}`;

  return {
    id,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        regexSubstitution:
          chrome.runtime.getURL("blocked.html") + "#\\0"
      }
    },
    condition: {
      regexFilter: regex,
      resourceTypes: ["main_frame"]
    }
  };
}

function getHomepage(value, entries) {
  try {
    const url = new URL(value || DEFAULT_HOME);

    if (!["http:", "https:"].includes(url.protocol) ||
        url.username || url.password ||
        isBlocked(url.href, entries)) {
      return DEFAULT_HOME;
    }

    return url.href;
  } catch {
    return DEFAULT_HOME;
  }
}

async function updateBlocklist() {
  try {
    const response = await fetch(BLOCKLIST_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.blocked) ||
        data.blocked.length > 1000) {
      throw new Error("Ogiltig blockeringslista");
    }

    const entries = data.blocked.map(normalizeEntry);
    const rules = entries.map((entry, index) =>
      createRule(entry, index + 1)
    );

    for (const rule of rules) {
      const result =
        await chrome.declarativeNetRequest.isRegexSupported({
          regex: rule.condition.regexFilter
        });

      if (!result.isSupported) {
        throw new Error(
          "Regex stöds inte: " + result.reason
        );
      }
    }

    const existing =
      await chrome.declarativeNetRequest.getDynamicRules();

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existing.map(rule => rule.id),
      addRules: rules
    });

    await chrome.storage.local.set({
      blockedEntries: entries,
      homepage: getHomepage(data.homepage, entries),
      lastUpdated: new Date().toISOString()
    });

    console.log(
      "VKBlock: Uppdaterade",
      rules.length,
      "regler"
    );
  } catch (error) {
    console.error(
      "VKBlock: Uppdatering misslyckades",
      error
    );
  }
}

chrome.runtime.onInstalled.addListener(updateBlocklist);
chrome.runtime.onStartup.addListener(updateBlocklist);

chrome.alarms.create(ALARM_NAME, {
  periodInMinutes: UPDATE_INTERVAL
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) {
    updateBlocklist();
  }
});
