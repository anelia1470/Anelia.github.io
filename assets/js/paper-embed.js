// Expandable research paper inside a post.
// Markdown placeholder: <div class="paper-embed" data-src="posts/x.html" data-title="..." data-meta="..."></div>
(function () {
  function escapeText(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function setup(box, i) {
    const src = box.dataset.src;
    const panelId = "paper-panel-" + i;
    box.innerHTML = `
      <div class="paper-embed-head">
        <div class="paper-embed-text">
          <strong>${escapeText(box.dataset.title || "Read the full research")}</strong>
          <span>${escapeText(box.dataset.meta || "")}</span>
        </div>
        <button type="button" class="btn paper-toggle" aria-expanded="false" aria-controls="${panelId}">
          <span class="paper-toggle-label">Show the research</span>
          <svg class="paper-chevron" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="paper-panel" id="${panelId}" role="region" aria-label="Full research paper">
        <div class="paper-panel-inner">
          <div class="paper-content"><p class="paper-loading">Loading the paper…</p></div>
          <div class="paper-panel-foot">
            <button type="button" class="btn btn-ghost paper-close">Collapse the paper</button>
          </div>
        </div>
      </div>`;

    const toggle = box.querySelector(".paper-toggle");
    const label = box.querySelector(".paper-toggle-label");
    const content = box.querySelector(".paper-content");
    let loaded = false;

    async function load() {
      if (loaded) return;
      loaded = true;
      try {
        const res = await fetch(src, { cache: "no-cache" });
        if (!res.ok) throw new Error();
        content.innerHTML = await res.text();
        // Keep the table of contents inside the panel
        content.querySelectorAll('.paper-toc a[href^="#"]').forEach((a) => {
          a.addEventListener("click", (e) => {
            const target = content.querySelector(a.getAttribute("href"));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
          });
        });
      } catch (e) {
        loaded = false;
        content.innerHTML = '<p class="paper-loading">The paper could not be loaded. Refresh the page and try again.</p>';
      }
    }

    function setOpen(open) {
      box.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Hide the research" : "Show the research";
      if (open) load();
    }

    toggle.addEventListener("click", () => setOpen(!box.classList.contains("open")));
    box.querySelector(".paper-close").addEventListener("click", () => {
      setOpen(false);
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Preload in the background so opening feels instant
    setTimeout(load, 600);
  }

  document.addEventListener("post:rendered", () => {
    document.querySelectorAll(".paper-embed").forEach(setup);
  });
})();
