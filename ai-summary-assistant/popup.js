const summarizeBtn = document.getElementById("summarizeBtn");
const pointsBtn = document.getElementById("pointsBtn");
const lengthSelect = document.getElementById("length");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("markdownOutput");
const copyBtn = document.getElementById("copyBtn");
const openInTabBtn = document.getElementById("openInTabBtn");
const optionsLink = document.getElementById("optionsLink");

optionsLink.addEventListener("click", e => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

async function setStatus(msg) {
  statusEl.textContent = msg;
}

async function getTabContent() {
  // ask the content script for page text
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error("No active tab found");

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_CONTENT" }, response => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response && response.text) {
        resolve({ text: response.text, title: response.title, url: tab.url });
      } else {
        reject(new Error("No content extracted from page."));
      }
    });
  });
}

async function requestSummary(mode) {
  try {
    setStatus("Extracting page content…");
    summarizeBtn.disabled = pointsBtn.disabled = true;

    const page = await getTabContent();
    setStatus("Sending to AI…");

    // send to background to call OpenAI (keeps key out of popup)
    const payload = {
      type: "GENERATE",
      mode, // 'summary' or 'points'
      length: lengthSelect.value,
      title: page.title || "",
      url: page.url || "",
      content: page.text
    };

    const res = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(payload, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response) {
          reject(new Error("No response from background."));
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });

    outputEl.textContent = res.output;
    setStatus("Done");
  } catch (err) {
    outputEl.textContent = "";
    setStatus("Error: " + (err.message || err));
    console.error(err);
  } finally {
    summarizeBtn.disabled = pointsBtn.disabled = false;
  }
}

summarizeBtn.addEventListener("click", () => requestSummary("summary"));
pointsBtn.addEventListener("click", () => requestSummary("points"));

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(outputEl.textContent);
    setStatus("Copied to clipboard");
  } catch (e) {
    setStatus("Copy failed");
  }
});

openInTabBtn.addEventListener("click", async () => {
  const content = outputEl.textContent || "";
  const html = `
    <html><head><meta charset="utf-8"><title>Summary</title></head>
    <body><pre style="white-space:pre-wrap;font-family:system-ui">${escapeHtml(
      content
    )}</pre></body></html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  chrome.tabs.create({ url });
});

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

setStatus("Ready");
