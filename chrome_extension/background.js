const BLOCKLIST_URL =
  "https://vikaxe001.github.io/VKBlock/blocklist.txt";

const UPDATE_INTERVAL = 15;
const ALARM_NAME = "update-blocklist";
const DEFAULT_HOME = "https://sites.google.com/utb.vaxjo.se/start";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// En rad: domän eller domän/sökväg. HTTPS-prefix accepteras också.
function normalizeEntry(line) {
  const value = line.trim();
  if (!value || value.startsWith("#")) return null;
  if (/\s/.test(value)) throw new Error("Mellanslag i blockeringsregel: " + value);

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : "https://" + value);
  } catch {
    throw new Error("Ogiltig blockeringsregel: " + value);
  }

  const domain = url.hostname.toLowerCase().replace(/\.$/, "");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (!/^https?:$/.test(url.protocol) || url.username || url.password ||
      url.port || url.search || url.hash ||
      !/^(?:[a-z0-9-]+\.)+[a-z0-9-]+$/.test(domain) ||
      domain.split(".").some(part => part.startsWith("-") || part.endsWith("-")) ||
      /[?#*]/.test(path)) {
    throw new Error("Ogiltig domän eller sökväg: " + value);
  }
  return { domain, path };
}

function isBlocked(address, entries) {
  try {
    const url = new URL(address);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    return entries.some(({ domain, path }) =>
      (host === domain || host.endsWith("." + domain)) &&
      (path === "/" || url.pathname === path || url.pathname.startsWith(path + "/"))
    );
  } catch { return false; }
}

function createRule(entry, id) {
  const domain = escapeRegex(entry.domain);
  const path = entry.path === "/" ? "/" : escapeRegex(entry.path);

  // /view/classroom6x2 får INTE matcha /view/classroom6x
  const end = entry.path === "/" ? ".*" : "(?:[/?#]|$).*";
  const regex = `^https?://(?:[a-z0-9-]+\\.)*${domain}(?::[0-9]+)?${path}${end}`;

  return {
    id,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        regexSubstitution: chrome.runtime.getURL("blocked.html") + "#\\0"
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
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
    const entries = lines.map(normalizeEntry).filter(Boolean);

    if (!entries.length || entries.length > 1000) {
      throw new Error("Blockeringslistan måste innehålla 1–1000 giltiga regler");
    }

    const rules = entries.map((entry, index) =>
      createRule(entry, index + 1)
    );

    for (const rule of rules) {
      const result =
        await chrome.declarativeNetRequest.isRegexSupported({
          regex: rule.condition.regexFilter
        });

      if (!result.isSupported) {
        throw new Error("Regex stöds inte: " + result.reason);
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
      homepage: getHomepage(DEFAULT_HOME, entries),
      lastUpdated: new Date().toISOString()
    });

    console.log("VKBlock: Uppdaterade", rules.length, "regler");
  } catch (error) {
    console.error("VKBlock: Uppdatering misslyckades", error);
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
