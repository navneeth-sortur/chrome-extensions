const apiKeyInput = document.getElementById("apiKey");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const savedMsg = document.getElementById("savedMsg");

function showMsg(msg, timeout = 3000) {
  savedMsg.textContent = msg;
  setTimeout(() => {
    savedMsg.textContent = "";
  }, timeout);
}

saveBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showMsg("Empty key not saved.");
    return;
  }
  chrome.storage.local.set({ openai_api_key: key }, () => {
    showMsg("API key saved.");
  });
});

clearBtn.addEventListener("click", () => {
  chrome.storage.local.remove("openai_api_key", () => {
    apiKeyInput.value = "";
    showMsg("API key cleared.");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["openai_api_key"], items => {
    if (items.openai_api_key) {
      apiKeyInput.value = items.openai_api_key;
    }
  });
});
