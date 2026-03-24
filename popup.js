(function () {
  "use strict";

  const contentEl = document.getElementById("content");

  function render(data) {
    // data is the full storage object; filter for entries that look like our video entries
    const entries = Object.entries(data).filter(
      ([key, val]) =>
        key.startsWith("https://www.youtube.com/watch?v=") &&
        val &&
        Array.isArray(val.words)
    );

    if (entries.length === 0) {
      contentEl.innerHTML =
        '<p class="empty-state">No words saved yet. Select subtitle text on YouTube to get started!</p>';
      return;
    }

    contentEl.innerHTML = "";

    entries.forEach(([url, entry]) => {
      const group = document.createElement("div");
      group.className = "video-group";

      // Header
      const header = document.createElement("div");
      header.className = "video-group-header";

      // Toggle chevron (left side)
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "toggle-btn expanded";
      toggleBtn.setAttribute("aria-label", "Toggle word list");
      toggleBtn.innerHTML = "&#9660;"; // ▼

      const titleEl = document.createElement("div");
      titleEl.className = "video-group-title";
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = entry.title || url;
      link.title = url;
      titleEl.appendChild(link);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", function () {
        chrome.storage.local.remove(url, function () {
          loadAndRender();
        });
      });

      header.appendChild(toggleBtn);
      header.appendChild(titleEl);
      header.appendChild(deleteBtn);
      group.appendChild(header);

      // Word list
      const list = document.createElement("ul");
      list.className = "word-list";
      entry.words.forEach(function (word) {
        const li = document.createElement("li");
        li.textContent = word;
        list.appendChild(li);
      });
      group.appendChild(list);

      // Toggle behaviour
      toggleBtn.addEventListener("click", function () {
        const collapsed = list.classList.toggle("collapsed");
        toggleBtn.classList.toggle("expanded", !collapsed);
        toggleBtn.innerHTML = collapsed ? "&#9654;" : "&#9660;"; // ► / ▼
      });

      contentEl.appendChild(group);
    });
  }

  function loadAndRender() {
    chrome.storage.local.get(null, function (data) {
      render(data);
    });
  }

  loadAndRender();
})();
