const usedEl = document.getElementById("used");
const totalEl = document.getElementById("total");
const refreshBtn = document.getElementById("refresh");

function formatMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function fetchMemoryUsage() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id) return;

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content.js"]
    },
    results => {
      const data = results?.[0]?.result;

      if (!data) {
        usedEl.textContent = "Not available";
        totalEl.textContent = "Not available";
        return;
      }

      usedEl.textContent = formatMB(data.usedJSHeapSize);
      totalEl.textContent = formatMB(data.totalJSHeapSize);
    }
  );
}

refreshBtn.addEventListener("click", fetchMemoryUsage);
fetchMemoryUsage();
