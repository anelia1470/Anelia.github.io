// "Today" panel: slides down from the top when you hover over (or tap) the Today button.
// To update: change TODAY below. News: link directly to a free article (e.g. Yahoo Finance). Links starting with "post.html" or "projects/" are pages on this site.
const TODAY = {
  date: "6 November 2026",
  // Optional: the blog post to announce. Remove this block on days without a new post.
  blog: {
    label: "New on the blog",
    title: "From \"google it\" to \"ask ChatGPT\": is AI eating Google's search business?",
    text: "Google still handles five times as many queries as ChatGPT, and search is still growing. So why did investors wipe $500 billion off Alphabet in a day?",
    link: "post.html?p=google-it-or-chat-it",
    cta: "Read the post",
  },
  news: [
    {
      label: "AI & policy",
      title: "Trump doubles down on data centers as he absorbs the market turmoil",
      text: "After Thursday's tech selloff, driven by worries that data center construction and AI spending are slowing, the President renewed his support for data centers. The article also looks at how opposition to data centers shaped several races for governor on Tuesday.",
      link: "https://finance.yahoo.com/economy/article/trump-doubles-down-on-data-centers-as-he-absorbs-the-market-turmoil-132648002.html",
      source: "Yahoo Finance",
    },
    {
      label: "Markets",
      title: "Nvidia, AMD, and Micron stocks lead chip sector higher following worst sell-off since 2020",
      text: "The semiconductor index fell about 12% on Thursday, its worst day since 2020. In early trading on Friday, Nvidia rose nearly 4% after a 9% drop, Micron more than 7%, and AMD bounced back after falling 17%.",
      link: "https://finance.yahoo.com/markets/article/nvidia-amd-micron-sandsik-lead-chip-sector-higher-134336542.html",
      source: "Yahoo Finance",
    },
  ],
};

(function () {
  const btn = document.querySelector(".nav-today");
  if (!btn) return;
  const root = (document.querySelector('meta[name="site-root"]') || {}).content || "";
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const isExternal = (u) => /^https?:/.test(u);

  const panel = document.createElement("section");
  panel.id = "today-panel";
  panel.className = "today-panel";
  panel.setAttribute("aria-label", "Today");
  panel.hidden = true;
  panel.innerHTML = `
    <div class="today-inner">
      <div class="today-head">
        <p class="today-kicker"><span class="pulse" aria-hidden="true"></span>Today</p>
        <h2 class="today-date">${esc(TODAY.date)}</h2>
        <button type="button" class="today-close" aria-label="Close">×</button>
      </div>
      <div class="today-grid${TODAY.blog ? "" : " no-blog"}">
        ${TODAY.blog ? (() => {
          const it = TODAY.blog, href = root + it.link;
          return `<article class="today-blog">
            <p class="today-label">${esc(it.label)}</p>
            <h3><a href="${esc(href)}">${esc(it.title)}</a></h3>
            <p>${esc(it.text)}</p>
            <a class="today-cta" href="${esc(href)}">${esc(it.cta)} →</a>
          </article>`;
        })() : ""}
        <div class="today-news">
          ${TODAY.news.map((it) => `<article class="today-row">
            <div class="today-row-text">
              <p class="today-label">${esc(it.label)}${it.source ? ` · ${esc(it.source)}` : ""}</p>
              <h4><a href="${esc(it.link)}" target="_blank" rel="noopener">${esc(it.title)}</a></h4>
              <p>${esc(it.text)}</p>
              <div class="today-row-foot"><a class="today-cta" href="${esc(it.link)}" target="_blank" rel="noopener">Read more ↗</a></div>
            </div>
          </article>`).join("")}
        </div>
      </div>
    </div>`;
  document.body.appendChild(panel);
  const backdrop = document.createElement("div");
  backdrop.className = "today-backdrop";
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", () => close());

  let closeTimer;
  function open() {
    clearTimeout(closeTimer);
    if (!panel.hidden && panel.classList.contains("is-open")) return;
    panel.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => { panel.classList.add("is-open"); backdrop.classList.add("is-on"); }));
    btn.setAttribute("aria-expanded", "true");
  }
  function close() {
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-on");
    btn.setAttribute("aria-expanded", "false");
    closeTimer = setTimeout(() => { panel.hidden = true; }, 420);
  }
  function closeSoon() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 250);
  }

  const canHover = window.matchMedia("(hover: hover)").matches;
  if (canHover) {
    btn.addEventListener("mouseenter", open);
    btn.addEventListener("mouseleave", closeSoon);
    panel.addEventListener("mouseenter", () => clearTimeout(closeTimer));
    panel.addEventListener("mouseleave", closeSoon);
  }
  // With a mouse, hovering already opens the panel, so a click keeps it open; on touch screens a tap toggles it
  btn.addEventListener("click", () => (canHover ? open() : (btn.getAttribute("aria-expanded") === "true" ? close() : open())));
  panel.querySelector(".today-close").addEventListener("click", () => { close(); btn.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { close(); btn.focus(); } });
  document.addEventListener("click", (e) => {
    if (btn.getAttribute("aria-expanded") === "true" && !panel.contains(e.target) && !btn.contains(e.target)) close();
  });
})();
