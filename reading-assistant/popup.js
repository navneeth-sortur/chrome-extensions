// State management for settings
class SettingsManager {
  constructor() {
    this.defaultSettings = {
      speechRate: 1,
      speechPitch: 1,
      fontSize: 100,
      contrastMode: "normal",
      focusMode: false
    };
  }

  async load() {
    const result = await chrome.storage.sync.get(this.defaultSettings);
    return result;
  }

  async save(settings) {
    await chrome.storage.sync.set(settings);
  }

  async reset() {
    await chrome.storage.sync.set(this.defaultSettings);
    return this.defaultSettings;
  }
}

// UI Controller
class PopupController {
  constructor() {
    this.settings = new SettingsManager();
    this.initElements();
    this.attachEventListeners();
    this.loadSettings();
  }

  initElements() {
    this.elements = {
      speakSelected: document.getElementById("speakSelected"),
      stopSpeaking: document.getElementById("stopSpeaking"),
      speechRate: document.getElementById("speechRate"),
      rateValue: document.getElementById("rateValue"),
      speechPitch: document.getElementById("speechPitch"),
      pitchValue: document.getElementById("pitchValue"),
      fontSize: document.getElementById("fontSize"),
      fontSizeValue: document.getElementById("fontSizeValue"),
      contrastMode: document.getElementById("contrastMode"),
      focusMode: document.getElementById("focusMode"),
      resetSettings: document.getElementById("resetSettings")
    };
  }

  attachEventListeners() {
    // Text-to-speech controls
    this.elements.speakSelected.addEventListener("click", () =>
      this.speakSelectedText()
    );
    this.elements.stopSpeaking.addEventListener("click", () =>
      this.stopSpeaking()
    );

    // Speech settings
    this.elements.speechRate.addEventListener("input", e => {
      this.elements.rateValue.textContent = `${e.target.value}x`;
      this.saveSetting("speechRate", parseFloat(e.target.value));
    });

    this.elements.speechPitch.addEventListener("input", e => {
      this.elements.pitchValue.textContent = `${e.target.value}x`;
      this.saveSetting("speechPitch", parseFloat(e.target.value));
    });

    // Font size
    this.elements.fontSize.addEventListener("input", e => {
      this.elements.fontSizeValue.textContent = `${e.target.value}%`;
      this.saveSetting("fontSize", parseInt(e.target.value));
      this.sendMessageToContent({
        action: "updateFontSize",
        value: parseInt(e.target.value)
      });
    });

    // Contrast mode
    this.elements.contrastMode.addEventListener("change", e => {
      this.saveSetting("contrastMode", e.target.value);
      this.sendMessageToContent({
        action: "updateContrast",
        value: e.target.value
      });
    });

    // Focus mode
    this.elements.focusMode.addEventListener("change", e => {
      this.saveSetting("focusMode", e.target.checked);
      this.sendMessageToContent({
        action: "toggleFocusMode",
        value: e.target.checked
      });
    });

    // Reset button
    this.elements.resetSettings.addEventListener("click", () =>
      this.resetAllSettings()
    );
  }

  async loadSettings() {
    const settings = await this.settings.load();

    this.elements.speechRate.value = settings.speechRate;
    this.elements.rateValue.textContent = `${settings.speechRate}x`;

    this.elements.speechPitch.value = settings.speechPitch;
    this.elements.pitchValue.textContent = `${settings.speechPitch}x`;

    this.elements.fontSize.value = settings.fontSize;
    this.elements.fontSizeValue.textContent = `${settings.fontSize}%`;

    this.elements.contrastMode.value = settings.contrastMode;
    this.elements.focusMode.checked = settings.focusMode;

    // Apply settings to current tab
    this.sendMessageToContent({
      action: "applySettings",
      settings: settings
    });
  }

  async saveSetting(key, value) {
    const settings = await this.settings.load();
    settings[key] = value;
    await this.settings.save(settings);
  }

  async resetAllSettings() {
    const defaultSettings = await this.settings.reset();
    this.loadSettings();
    this.sendMessageToContent({
      action: "applySettings",
      settings: defaultSettings
    });
  }

  async speakSelectedText() {
    const settings = await this.settings.load();
    this.sendMessageToContent({
      action: "speakSelection",
      rate: settings.speechRate,
      pitch: settings.speechPitch
    });
  }

  stopSpeaking() {
    this.sendMessageToContent({ action: "stopSpeaking" });
  }

  async sendMessageToContent(message) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });
      await chrome.tabs.sendMessage(tab.id, message);
    } catch (error) {
      console.error("Error sending message to content script:", error);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
