// Heuristic: find <article> or the element with largest text content length under body
// Return cleaned text, title

function extractArticleText() {
  try {
    // 1. prefer <article>
    let article = document.querySelector("article");
    if (article && getVisibleTextLength(article) > 200) {
      return normalizeText(article.innerText);
    }

    // 2. prefer <main>
    const main = document.querySelector("main");
    if (main && getVisibleTextLength(main) > 200) {
      return normalizeText(main.innerText);
    }

    // 3. fallback: find the largest textual node
    const candidates = Array.from(
      document.body.querySelectorAll("div, section, article, p, main")
    );
    let best = "";
    let bestLen = 0;
    for (const el of candidates) {
      if (!isVisible(el)) continue;
      const text = el.innerText || "";
      const len = getVisibleTextLength(el);
      if (len > bestLen) {
        bestLen = len;
        best = text;
      }
    }

    if (bestLen > 120) return normalizeText(best);

    // 4. very fallback: use full page text but trim
    const page = normalizeText(document.body.innerText || "");
    return page.slice(0, 20000);
  } catch (e) {
    return "";
  }
}

function normalizeText(s) {
  if (!s) return "";
  // remove excessive whitespace
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function getVisibleTextLength(el) {
  if (!el) return 0;
  const text = (el.innerText || "").trim();
  return text.length;
}

function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (
    style &&
    (style.display === "none" ||
      style.visibility === "hidden" ||
      parseFloat(style.opacity) === 0)
  )
    return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return true;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "EXTRACT_CONTENT") {
    const text = extractArticleText();
    const title = document.title || "";
    sendResponse({ text, title });
  }
  // return true indicates async; but we respond synchronously so false
});
