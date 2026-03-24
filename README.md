# YouTube Subtitle Collector

A Chrome extension for language learners. Select words directly from YouTube's subtitles — they're automatically copied to your clipboard and saved in a tidy list, grouped by video.

![Extension popup showing two saved video groups, each with a collapsible word list and a delete button](icons/icon128.png)

---

## Features

- **Selectable subtitles** — drag your mouse over any subtitle text on YouTube to select it, just like regular text on a webpage.
- **Auto-copy** — the selected text is automatically copied to your clipboard the moment you release the mouse. No extra button click needed.
- **Saved word lists** — every word you select is saved to your browser's local storage, grouped by video.
- **Popup browser** — click the extension icon in your browser toolbar to view all saved words, organized under each video's title.
- **Collapsible groups** — click the ▼/▶ chevron next to a video title to expand or collapse its word list.
- **Delete lists** — remove an entire video's word list with one click using the Delete button.

---

## Installation

This extension is not published to the Chrome Web Store. Install it manually as an unpacked extension:

1. Download or clone this repository to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the folder containing this project (the one with `manifest.json` in it).
6. The **YouTube Subtitle Collector** icon (red "W") will appear in your browser toolbar.

> **Tip:** Pin the extension to your toolbar by clicking the puzzle-piece icon → pin icon next to "YouTube Subtitle Collector".

---

## How to Use

### Selecting and saving words

1. Go to any YouTube video.
2. Enable subtitles on the video using YouTube's CC button.
3. When subtitles appear on the screen, **hover your mouse over the subtitle text** — the cursor will change to a text cursor (I-beam), indicating the text is selectable.
4. **Click and drag** to select the word or phrase you want to save.
5. Release the mouse — you'll see a brief **"Copied!"** notification near the subtitles, confirming the text has been:
   - Copied to your clipboard (you can paste it anywhere immediately).
   - Saved to your word list for this video.

### Viewing your saved words

1. Click the **YouTube Subtitle Collector icon** (red "W") in your browser toolbar.
2. The popup shows all your saved words, grouped by video title.
3. Click the **▼ chevron** on the left of a video title to collapse that group.
4. Click the **▶ chevron** to expand it again.

### Deleting a word list

1. Open the popup by clicking the extension icon.
2. Find the video group you want to remove.
3. Click the **Delete** button on the right side of that group's header.
4. The entire group and all its words are permanently removed.

---

## Notes

- Words are stored locally in your browser using `chrome.storage.local`. They are **not synced** to other devices or sent anywhere.
- Each video has its own separate list. Words from different videos are never mixed.
- If you select the same word twice from the same video, it is only stored once (no duplicates).
- The extension only runs on `www.youtube.com`. It does not activate on any other website.
- Subtitles must be **turned on** in YouTube for selection to work — the extension works with YouTube's built-in caption overlay.

---

## File Structure

```
manifest.json   — Extension configuration (Manifest V3)
content.js      — Makes subtitles selectable; handles clipboard copy and storage
content.css     — CSS overrides to enable text selection on YouTube's caption layer
popup.html      — Popup page markup
popup.js        — Popup logic (render lists, toggle, delete)
popup.css       — Popup styling
icons/          — Extension icons (16px, 48px, 128px)
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Cursor doesn't change to text cursor on subtitles | Make sure you reloaded the extension after installing. Go to `chrome://extensions/` and click the reload (↺) button. Then reload the YouTube tab. |
| Clicking subtitles pauses/unpauses the video | Reload the extension and the YouTube tab. If it persists, the MutationObserver may need a moment to initialize — wait a second after the video loads. |
| "Copied!" toast doesn't appear | Check that the page has focus. Chrome requires the page to be focused for clipboard write access. |
| Words don't appear in the popup | The popup only shows words from URLs matching `youtube.com/watch?v=...`. Make sure you're on a video page, not the YouTube home page or a channel page. |
| Extension icon is missing from toolbar | Click the puzzle-piece 🧩 icon in Chrome's toolbar → click the pin icon next to "YouTube Subtitle Collector". |
