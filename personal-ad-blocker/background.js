const STORAGE_KEY = "enabled";

async function getEnabled() {
  const { [STORAGE_KEY]: enabled } = await chrome.storage.sync.get({
    [STORAGE_KEY]: true
  });
  return enabled;
}

async function setEnabled(enabled) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: enabled });
  await setBlockingEnabled(enabled);
  await updateActionBadge(enabled);
}

async function setBlockingEnabled(enabled) {
  try {
    if (enabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ["rules_1"],
        disableRulesetIds: []
      });
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: [],
        disableRulesetIds: ["rules_1"]
      });
    }
  } catch (e) {
    console.error("Failed to update ruleset state", e);
  }
}

async function updateActionBadge(enabled) {
  try {
    await chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
    await chrome.action.setBadgeBackgroundColor({
      color: enabled ? "#10b981" : "#ef4444"
    });
  } catch (e) {
    // Badge APIs may fail on some channels — ignore gracefully
    console.debug("Badge update issue (non‑fatal):", e?.message || e);
  }
}

// Initialize on install/update and on service worker startup
chrome.runtime.onInstalled.addListener(async () => {
  const enabled = await getEnabled();
  await setBlockingEnabled(enabled);
  await updateActionBadge(enabled);
});

self.addEventListener("activate", async () => {
  const enabled = await getEnabled();
  await setBlockingEnabled(enabled);
  await updateActionBadge(enabled);
});

// Messages from popup/content script
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "GET_STATE") {
        sendResponse({ ok: true, enabled: await getEnabled() });
      } else if (msg?.type === "SET_STATE") {
        await setEnabled(Boolean(msg.enabled));
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false, error: "Unknown message type" });
      }
    } catch (e) {
      console.error("Message handling failed", e);
      sendResponse({ ok: false, error: e?.message || String(e) });
    }
  })();
  return true; // keep the message channel open for async response
});
