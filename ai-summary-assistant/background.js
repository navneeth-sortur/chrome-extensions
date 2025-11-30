const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;

  if (msg.type === "GENERATE") {
    (async () => {
      try {
        const apiKey = await getApiKey();
        if (!apiKey) {
          sendResponse({ error: "OpenAI API key not set. Go to Options." });
          return;
        }

        const prompt = buildPrompt(msg);
        const body = {
          model: MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that creates concise, clear summaries and extracts key points. Provide output in Markdown format when asked."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 800
        };

        const resp = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apiKey
          },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          const errText = await resp.text();
          sendResponse({
            error: `OpenAI API error: ${resp.status} ${errText}`
          });
          return;
        }

        const data = await resp.json();
        const output = parseOpenAIResponse(data);
        sendResponse({ output });
      } catch (err) {
        console.error("Background error:", err);
        sendResponse({ error: err.message || String(err) });
      }
    })();

    // Return true to indicate we'll respond asynchronously.
    return true;
  }
});

function parseOpenAIResponse(resp) {
  try {
    const choice = resp.choices && resp.choices[0];
    if (choice && choice.message && choice.message.content) {
      return choice.message.content.trim();
    }
    return JSON.stringify(resp, null, 2);
  } catch (e) {
    return "Unable to parse response";
  }
}

function buildPrompt(msg) {
  const { mode, length, title = "", url = "", content = "" } = msg;

  // limit content size to first ~20000 chars to avoid sending too much
  const safeContent =
    content.length > 20000 ? content.slice(0, 20000) : content;

  if (mode === "points") {
    return `Extract up to 10 concise key points (bulleted) from the following article. Include only the most important facts, takeaways, or steps. If relevant, include any recommended actions or warnings.
Title: ${title}
URL: ${url}

Article:
${safeContent}

Return the points as Markdown bullets. Keep each bullet short (max 2-3 sentences).`;
  }

  // summary mode
  const lengthSpec =
    length === "short"
      ? "Make it extremely short — 1-2 lines."
      : length === "medium"
      ? "Make it medium-length — 3-6 sentences."
      : "Make it long and detailed — a few paragraphs, include subpoints as needed.";

  return `Write a clear, well-structured summary of the following article. Provide:
1) A short markdown header containing the article title if available.
2) A summary section following the requested length: ${lengthSpec}
3) A "Key points" bullet list (3-8 bullets).
4) A "Suggested next actions" section with 1-3 concise recommendations if relevant.

Title: ${title}
URL: ${url}

Article:
${safeContent}

Return the whole output in Markdown. Keep the language neutral and factual.`;
}

function getApiKey() {
  return new Promise(resolve => {
    chrome.storage.local.get(["openai_api_key"], items => {
      resolve(items.openai_api_key || "");
    });
  });
}
