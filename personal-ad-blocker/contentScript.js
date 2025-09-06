const STORAGE_KEY = "enabled";
let isEnabled = true;

// Read initial state and subscribe to changes
chrome.storage.sync.get({ [STORAGE_KEY]: true }, res => {
  isEnabled = Boolean(res[STORAGE_KEY]);
  if (isEnabled) startSkipper();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes[STORAGE_KEY]) return;
  isEnabled = Boolean(changes[STORAGE_KEY].newValue);
  if (isEnabled) startSkipper();
});

let skipperStarted = false;

function startSkipper() {
  if (skipperStarted) return;
  skipperStarted = true;

  const log = (...args) => console.debug("[Personal Ad‑Blocker]", ...args);

  const trySkip = () => {
    if (!isEnabled) return;

    // Click the Skip button if present
    const skipBtn = document.querySelector(
      ".ytp-ad-skip-button, .ytp-ad-skip-button-modern"
    );
    if (skipBtn) {
      skipBtn.click();
      log("Clicked skip button");
    }

    // Close overlay ads
    document
      .querySelectorAll(".ytp-ad-overlay-close-button")
      .forEach(btn => btn.click());

    // If an ad is playing, jump to end of ad
    const player = document.querySelector("video.html5-main-video");
    const isAd = document.body.classList.contains("ad-showing");

    if (isAd && player && player.duration) {
      try {
        // mute while skipping to avoid bursts
        const wasMuted = player.muted;
        player.muted = true;
        player.currentTime = player.duration;
        // speed up briefly to finish any trailing ad segments
        const oldRate = player.playbackRate;
        player.playbackRate = 16;
        setTimeout(() => {
          player.playbackRate = oldRate;
          player.muted = wasMuted;
        }, 300);
        log("Jumped to end of ad");
      } catch (e) {
        log("Seek failed:", e);
      }
    }
  };

  // Observe DOM changes for ad state / buttons
  const observer = new MutationObserver(() => trySkip());
  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"]
  });

  // Also poll occasionally in case observer misses
  const interval = setInterval(() => trySkip(), 500);

  // Clean up on unload (not strictly needed for content scripts)
  window.addEventListener("beforeunload", () => {
    clearInterval(interval);
    observer.disconnect();
  });
}
