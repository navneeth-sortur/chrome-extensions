# AI Summary Assistant — Chrome Extension

**Purpose:** Generate AI summaries and extract key points from articles and long-form content.

**Features**

- One-click summarization from the active tab
- Multiple lengths (short / medium / long)
- Key points extraction (bulleted)
- Markdown-formatted output
- API key stored in extension options (chrome.storage)

**Tech**

- Chrome Extension (Manifest v3)
- OpenAI API (`gpt-3.5-turbo`)
- DOM parsing content script
- Background service worker to call OpenAI

**Installation**

1. Clone or unzip the folder.
2. In Chrome go to `chrome://extensions`, enable Developer mode, click **Load unpacked**, and select this folder.
3. Open the extension options and paste your OpenAI API key (sk-...).
4. Visit an article, click the extension, and summarize.

**Extending**

- Swap the model in `background.js` to a different model.
- Add a "summarize selection" feature by sending only selected text from `content_script.js`.
- Add local caching of summaries to avoid repeated API calls.

**Security**

- The API key is stored locally in `chrome.storage.local`. Do not publish your packed extension with the key included.
