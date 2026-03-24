# YouTube Word Collector — Copilot Instructions

## Project Overview

This is a **Manifest V3 Chrome Extension** for language learners. It makes YouTube's built-in subtitle text mouse-selectable, auto-copies selected text to the clipboard, and persists selected words in `chrome.storage.local` grouped by video URL. A popup UI lets the user browse and manage their saved word lists.

## File Structure

```
manifest.json       — Manifest V3: permissions, content script registration, popup
content.js          — Injected into YouTube pages; handles subtitle selectability, clipboard copy, storage write
content.css         — CSS overrides to make .ytp-caption-* elements selectable (pointer-events, user-select)
popup.html          — Extension popup markup
popup.js            — Popup logic: reads chrome.storage.local, renders grouped word lists, handles delete & toggle
popup.css           — Popup styles (YouTube-red header, toggle chevron, collapsible word lists)
icons/              — Extension icons at 16px, 48px, 128px
.github/
  copilot-instructions.md   — This file
README.md           — User-facing documentation
```

## Architecture & Key Decisions

### Content Script (`content.js` + `content.css`)
- Targets `*://www.youtube.com/*` only.
- Overrides YouTube's `pointer-events: none` and `user-select: none` CSS on `.ytp-caption-window-container` and child elements using `!important` rules in `content.css` **and** inline styles enforced by `ensureCaptionStyles()`.
- A `MutationObserver` on `#movie_player` re-applies selectability styles whenever YouTube's JS mutates the caption DOM.
- Mouse events (`mousedown`, `mousemove`, `click`) are intercepted in the **capture phase** with `stopPropagation()` to prevent the YouTube player from reacting (play/pause, seek) while the user selects subtitle text.
- `dragstart` is cancelled with `preventDefault()` + `stopPropagation()` to prevent element drag instead of text selection.
- On `mouseup` inside `.ytp-caption-window-container`, the selected text is copied to the clipboard via `navigator.clipboard.writeText()` and stored via `chrome.storage.local`.

### Storage Schema (`chrome.storage.local`)
Each video is stored under its canonical URL as key:
```json
{
  "https://www.youtube.com/watch?v=VIDEO_ID": {
    "title": "Human-readable video title",
    "words": ["word1", "word2"]
  }
}
```
- The URL is always normalized to `https://www.youtube.com/watch?v=VIDEO_ID` (strips extra query params).
- Duplicate words within the same video entry are silently skipped.
- Video title is read from the page's `yt-formatted-string` element or falls back to `document.title`.

### Popup (`popup.html`, `popup.js`, `popup.css`)
- Reads all `chrome.storage.local` entries on open, filters those matching the `watch?v=` pattern.
- Renders one **video group card** per entry — collapsible via a ▼/▶ toggle chevron on the left.
- Each group has a **Delete** button (right side) that removes the entry from storage and re-renders.
- Word lists collapse/expand with a CSS `max-height` transition.

## Constraints & Conventions

- **Manifest V3 only** — do not use Manifest V2 APIs (e.g., `background.js` persistent pages, `chrome.browserAction`).
- **No external dependencies** — vanilla JS and CSS only; no npm, no bundler.
- **Permissions are minimal**: `storage` and `activeTab` only — do not add broader permissions without good reason.
- **Content script is scoped to YouTube** — do not broaden the match pattern beyond `*://www.youtube.com/*`.
- **No remote code execution** — do not load scripts from external URLs (violates CSP and MV3 policy).
- **Storage key format** must remain `https://www.youtube.com/watch?v=VIDEO_ID` — `popup.js` filters on this prefix.
- CSS classes targeted: `.ytp-caption-window-container`, `.ytp-caption-window-bottom`, `.ytp-caption-window-top`, `.ytp-caption-window`, `.ytp-caption-segment`. These are YouTube's internal classes and may change with player updates.

## Common Pitfalls to Avoid

- Do not remove the `MutationObserver` — YouTube dynamically re-renders captions and resets inline styles.
- Do not use `e.preventDefault()` on `mousedown` inside captions — it would prevent text selection from starting.
- The `dragstart` handler needs both `preventDefault()` AND `stopPropagation()` to fully stop drag behaviour.
- `chrome.storage.local.get(null, ...)` returns the entire storage object — always filter for the `watch?v=` prefix before rendering.
- The popup has a fixed `width: 380px` — keep new UI elements within this constraint.

## Testing Checklist

When modifying this extension, verify:
1. Subtitle text is selectable by mouse drag in **normal**, **theater**, and **fullscreen** modes.
2. Selected text is auto-copied to clipboard (paste in a text editor to confirm).
3. `chrome.storage.local` is updated (DevTools → Application → Storage → Local storage (Extension)).
4. Popup groups words by video URL correctly.
5. Toggle chevron collapses/expands word lists.
6. Delete button removes the group from both the popup UI and storage.
7. Selecting from two different videos creates two separate groups in the popup.
8. Duplicate words from the same video are not added twice.
