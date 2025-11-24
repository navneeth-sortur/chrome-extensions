// Content Script - Runs on web pages
class ReadEaseContent {
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.focusModeEnabled = false;
    this.settings = {
      fontSize: 100,
      contrastMode: "normal",
      focusMode: false
    };

    this.init();
  }

  init() {
    this.createStyleElement();
    this.setupMessageListener();
    this.loadAndApplySettings();
  }

  createStyleElement() {
    this.styleElement = document.createElement("style");
    this.styleElement.id = "readease-styles";
    document.head.appendChild(this.styleElement);
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message);
      sendResponse({ success: true });
      return true;
    });
  }

  async loadAndApplySettings() {
    try {
      const result = await chrome.storage.sync.get({
        fontSize: 100,
        contrastMode: "normal",
        focusMode: false
      });
      this.applySettings(result);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  handleMessage(message) {
    const actions = {
      speakSelection: () => this.speakSelectedText(message.rate, message.pitch),
      stopSpeaking: () => this.stopSpeaking(),
      updateFontSize: () => this.updateFontSize(message.value),
      updateContrast: () => this.updateContrast(message.value),
      toggleFocusMode: () => this.toggleFocusMode(message.value),
      applySettings: () => this.applySettings(message.settings)
    };

    const action = actions[message.action];
    if (action) {
      action();
    }
  }

  speakSelectedText(rate = 1, pitch = 1) {
    const selectedText = window.getSelection().toString().trim();

    if (!selectedText) {
      this.showNotification("Please select some text to read aloud");
      return;
    }

    // Stop any ongoing speech
    this.stopSpeaking();

    // Create new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(selectedText);
    this.currentUtterance.rate = rate;
    this.currentUtterance.pitch = pitch;
    this.currentUtterance.volume = 1;

    // Event handlers
    this.currentUtterance.onstart = () => {
      this.highlightSpeakingText(selectedText);
    };

    this.currentUtterance.onend = () => {
      this.removeHighlight();
    };

    this.currentUtterance.onerror = event => {
      console.error("Speech synthesis error:", event);
      this.removeHighlight();
    };

    // Speak
    this.speechSynthesis.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
      this.removeHighlight();
    }
  }

  highlightSpeakingText(text) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className = "readease-speaking";
      span.style.cssText = `
          background-color: #fff59d;
          padding: 2px 4px;
          border-radius: 3px;
          animation: readease-pulse 1.5s ease-in-out infinite;
        `;

      try {
        range.surroundContents(span);
      } catch (e) {
        // If surroundContents fails (complex selection), just highlight differently
        console.log("Complex selection detected");
      }
    }
  }

  removeHighlight() {
    const highlightedElements = document.querySelectorAll(".readease-speaking");
    highlightedElements.forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });
  }

  updateFontSize(size) {
    this.settings.fontSize = size;
    this.applyFontSize();
  }

  applyFontSize() {
    const percentage = this.settings.fontSize / 100;
    const css = `
        body {
          font-size: ${percentage}em !important;
        }
      `;
    this.updateStyles(css, "fontSize");
  }

  updateContrast(mode) {
    this.settings.contrastMode = mode;
    this.applyContrast();
  }

  applyContrast() {
    const modes = {
      normal: "",
      high: `
          body {
            filter: contrast(1.5) !important;
          }
          * {
            text-shadow: none !important;
          }
        `,
      dark: `
          body {
            background-color: #1a1a1a !important;
            color: #e0e0e0 !important;
            filter: invert(0.9) hue-rotate(180deg) !important;
          }
          img, video, [style*="background-image"] {
            filter: invert(1) hue-rotate(180deg) !important;
          }
        `,
      sepia: `
          body {
            background-color: #f4ecd8 !important;
            color: #5c4a3a !important;
          }
          * {
            color: #5c4a3a !important;
          }
          a {
            color: #8b6914 !important;
          }
        `
    };

    const css = modes[this.settings.contrastMode] || "";
    this.updateStyles(css, "contrast");
  }

  toggleFocusMode(enabled) {
    this.settings.focusMode = enabled;
    this.focusModeEnabled = enabled;

    if (enabled) {
      this.enableFocusMode();
    } else {
      this.disableFocusMode();
    }
  }

  enableFocusMode() {
    const css = `
        @keyframes readease-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        p:hover,
        div:hover > p:only-child,
        article:hover > p:only-child,
        section:hover > p:only-child {
          background-color: rgba(102, 126, 234, 0.1) !important;
          outline: 2px solid rgba(102, 126, 234, 0.3) !important;
          outline-offset: 4px !important;
          transition: all 0.3s ease !important;
          border-radius: 4px !important;
        }
        
        body.readease-focus-active *:not(:hover) {
          opacity: 0.6 !important;
          transition: opacity 0.3s ease !important;
        }
        
        body.readease-focus-active p:hover,
        body.readease-focus-active div:hover > p:only-child,
        body.readease-focus-active article:hover > p:only-child,
        body.readease-focus-active section:hover > p:only-child {
          opacity: 1 !important;
        }
      `;

    this.updateStyles(css, "focusMode");

    // Add class to body for focus mode
    document.body.classList.add("readease-focus-active");
  }

  disableFocusMode() {
    this.updateStyles("", "focusMode");
    document.body.classList.remove("readease-focus-active");
  }

  updateStyles(css, category) {
    // Store styles by category to allow independent updates
    if (!this.styleCategories) {
      this.styleCategories = {};
    }

    this.styleCategories[category] = css;

    // Combine all styles
    const allStyles = Object.values(this.styleCategories).join("\n");
    this.styleElement.textContent = allStyles;
  }

  applySettings(settings) {
    this.settings = { ...this.settings, ...settings };

    this.applyFontSize();
    this.applyContrast();

    if (settings.focusMode) {
      this.enableFocusMode();
    } else {
      this.disableFocusMode();
    }
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease;
      `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Add animation styles
const animationStyles = document.createElement("style");
animationStyles.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
document.head.appendChild(animationStyles);

// Initialize ReadEase
const readEase = new ReadEaseContent();
