const toggle = document.getElementById("toggle");
const statusEl = document.getElementById("status");

function setStatus(enabled) {
  toggle.checked = !!enabled;
  statusEl.textContent = enabled
    ? "Blocking is ENABLED"
    : "Blocking is DISABLED";
}

function sendMessage(type, payload = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, ...payload }, res => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      if (!res?.ok) return reject(new Error(res?.error || "Unknown error"));
      resolve(res);
    });
  });
}

async function init() {
  try {
    const res = await sendMessage("GET_STATE");
    setStatus(res.enabled);
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Failed to read state";
  }
}

init();

toggle.addEventListener("change", async e => {
  const enabled = e.target.checked;
  setStatus(enabled);
  try {
    await sendMessage("SET_STATE", { enabled });
  } catch (e2) {
    console.error("Failed to update state", e2);
    // Revert UI if failed
    setStatus(!enabled);
  }
});
