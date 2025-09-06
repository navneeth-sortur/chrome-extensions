class JokeExtension {
  constructor() {
    this.jokeElement = document.getElementById("jokeText");
    this.jokeContent = document.getElementById("jokeContent");
    this.loader = document.getElementById("loader");
    this.errorMessage = document.getElementById("errorMessage");
    this.newJokeBtn = document.getElementById("newJokeBtn");
    this.copyJokeBtn = document.getElementById("copyJokeBtn");

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadJoke();
  }

  bindEvents() {
    this.newJokeBtn.addEventListener("click", () => this.loadJoke());
    this.copyJokeBtn.addEventListener("click", () => this.copyJoke());
  }

  async loadJoke() {
    this.showLoader();
    this.hideError();

    try {
      const response = await fetch(
        "https://v2.jokeapi.dev/joke/Any?type=single&safe-mode",
        {
          headers: {
            Accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      this.displayJoke(data.joke || "Could not load joke. Try again!");
    } catch (error) {
      console.error("Error fetching joke:", error);
      this.showError();
    } finally {
      this.hideLoader();
    }
  }

  displayJoke(joke) {
    this.jokeElement.textContent = joke;
    this.jokeContent.style.display = "flex";
  }

  showLoader() {
    this.jokeContent.style.display = "none";
    this.hideError();
    this.loader.style.display = "flex";
    this.newJokeBtn.disabled = true;
  }

  hideLoader() {
    this.loader.style.display = "none";
    this.newJokeBtn.disabled = false;
  }

  showError() {
    this.jokeContent.style.display = "none";
    this.errorMessage.style.display = "block";
  }

  hideError() {
    this.errorMessage.style.display = "none";
  }

  async copyJoke() {
    const jokeText = this.jokeElement.textContent;

    if (!jokeText || jokeText === "Click the button to load a joke!") {
      return;
    }

    try {
      await navigator.clipboard.writeText(jokeText);
      this.showToast("Joke copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      this.showToast("Failed to copy joke", true);
    }
  }

  showToast(message, isError = false) {
    // Remove existing toast if any
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? "error" : "success"}`;
    toast.textContent = message;
    toast.style.backgroundColor = isError
      ? "var(--error-color)"
      : "var(--success-color)";

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 10);

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new JokeExtension();
});
