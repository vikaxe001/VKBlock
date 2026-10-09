const BLOCKLIST_URL =
  "https://vikaxe001.github.io/VKBlock/blocklist.json";

const UPDATE_INTERVAL = 1; // Minuter
const ALARM_NAME = "update-blocklist";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createRule(entry, id) {
  if (!entry || typeof entry.domain !== "string" ||
      typeof entry.path !== "string") {
    throw new Error("Ogiltig blockeringsregel");
  }

  const domain = entry.domain.toLowerCase();
  const path = entry.path;

  if (!/^[a-z0-9.-]+$/.test(domain) ||
      !domain.includes(".") ||
      !path.startsWith("/") ||
      path.includes("*") ||
      path.includes("?") ||
      path.includes("#")) {
    throw new Error("Ogiltig domän eller sökväg");
  }

  // Matchar domänen och vanliga www-/m-varianter.
  const host = escapeRegex(domain.replace(/^(www|m)\./, ""));
  const pathname = escapeRegex(path.replace(/\/+$/, "") || "/");

  const regex =
    `^https?://(?:(?:www|m)\\.)?${host}${pathname}` +
    `(?:[/?#]|$)`;

  return {
    id,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/blocked.html"
      }
    },
    condition: {
      regexFilter: regex,
      resourceTypes: ["main_frame"]
    }
  };
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

    const rules = data.blocked.map((entry, index) =>
      createRule(entry, index + 1)
    );

    // Kontrollera att alla regexregler stöds.
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
      blockedEntries: data.blocked,
      lastUpdated: new Date().toISOString()
    });

    console.log("VKBlock: Uppdaterade", rules.length, "regler");
  } catch (error) {
    console.error("VKBlock: Uppdatering misslyckades", error);
  }
}

// Kör direkt vid installation och uppstart.
chrome.runtime.onInstalled.addListener(updateBlocklist);
chrome.runtime.onStartup.addListener(updateBlocklist);

// Kontrollera blockeringslistan varje minut.
chrome.alarms.create(ALARM_NAME, {
  periodInMinutes: UPDATE_INTERVAL
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) {
    updateBlocklist();
  }
});
