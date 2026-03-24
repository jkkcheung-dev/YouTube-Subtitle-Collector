(function () {
  "use strict";

  // ── Helpers ──

  /** Get canonical video URL: https://www.youtube.com/watch?v=VIDEO_ID */
  function getVideoUrl() {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get("v");
    if (!videoId) return null;
    return "https://www.youtube.com/watch?v=" + videoId;
  }

  /** Get a readable video title from the page */
  function getVideoTitle() {
    const titleEl =
      document.querySelector(
        "#above-the-fold #title h1 yt-formatted-string"
      ) || document.querySelector("h1.ytd-watch-metadata yt-formatted-string");
    if (titleEl && titleEl.textContent.trim()) {
      return titleEl.textContent.trim();
    }
    // Fallback: strip " - YouTube" suffix from document.title
    return document.title.replace(/\s*-\s*YouTube\s*$/, "").trim();
  }

  // ── Toast ──

  let toastEl = null;
  let toastTimer = null;

  function showToast(text) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "yt-word-collector-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 1200);
  }

  // ── Prevent video player from reacting to clicks on subtitles ──

  function isInsideCaptions(el) {
    return el && el.closest(".ytp-caption-window-container");
  }

  // Use capture phase so we intercept before the player's handlers
  document.addEventListener(
    "mousedown",
    function (e) {
      if (isInsideCaptions(e.target)) {
        e.stopPropagation();
      }
    },
    true
  );

  document.addEventListener(
    "mousemove",
    function (e) {
      if (isInsideCaptions(e.target)) {
        e.stopPropagation();
      }
    },
    true
  );

  document.addEventListener(
    "click",
    function (e) {
      if (isInsideCaptions(e.target)) {
        e.stopPropagation();
      }
    },
    true
  );

  // Prevent element drag — we want text selection, not element drag
  document.addEventListener(
    "dragstart",
    function (e) {
      if (isInsideCaptions(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // ── Selection → Clipboard + Storage ──

  document.addEventListener(
    "mouseup",
    function (e) {
      if (!isInsideCaptions(e.target)) return;

      // Small delay to let the browser finalize the selection
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection ? selection.toString().trim() : "";
        if (!text) return;

        const videoUrl = getVideoUrl();
        if (!videoUrl) return;

        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
          showToast("Copied!");
        });

        // Store in chrome.storage.local
        const title = getVideoTitle();
        chrome.storage.local.get([videoUrl], function (result) {
          const entry = result[videoUrl] || { title: title, words: [] };
          // Update title in case it wasn't available before
          if (title) entry.title = title;
          // Avoid duplicates
          if (!entry.words.includes(text)) {
            entry.words.push(text);
          }
          chrome.storage.local.set({ [videoUrl]: entry });
        });
      }, 10);
    },
    true
  );

  // ── MutationObserver: re-apply pointer-events if YouTube resets inline styles ──

  function ensureCaptionStyles() {
    const containers = document.querySelectorAll(
      ".ytp-caption-window-container"
    );
    containers.forEach((container) => {
      container.style.setProperty("pointer-events", "auto", "important");
      container.style.setProperty("user-select", "text", "important");
      container.style.setProperty("-webkit-user-select", "text", "important");
      container.style.setProperty("-webkit-user-drag", "none", "important");
      container.draggable = false;
    });

    const windows = document.querySelectorAll(
      ".ytp-caption-window-bottom, .ytp-caption-window-top, .ytp-caption-window"
    );
    windows.forEach((win) => {
      win.style.setProperty("pointer-events", "auto", "important");
      win.style.setProperty("user-select", "text", "important");
      win.style.setProperty("-webkit-user-select", "text", "important");
      win.style.setProperty("-webkit-user-drag", "none", "important");
      win.draggable = false;
    });

    const segments = document.querySelectorAll(".ytp-caption-segment");
    segments.forEach((seg) => {
      seg.draggable = false;
    });
  }

  const observer = new MutationObserver(() => {
    ensureCaptionStyles();
  });

  // Start observing once the player is present
  function startObserver() {
    const player = document.querySelector("#movie_player") || document.body;
    observer.observe(player, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    // Initial pass
    ensureCaptionStyles();
  }

  // YouTube is an SPA — wait for the player to appear
  if (document.querySelector("#movie_player")) {
    startObserver();
  } else {
    const init = new MutationObserver(() => {
      if (document.querySelector("#movie_player")) {
        init.disconnect();
        startObserver();
      }
    });
    init.observe(document.body, { childList: true, subtree: true });
  }
})();
