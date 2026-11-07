// "Today" panel: slides down from the top when you hover over (or tap) the Today button.
// To update: change TODAY below. News: link directly to a free article (e.g. Yahoo Finance). Links starting with "post.html" or "projects/" are pages on this site.
const TODAY = {
  date: "7 November 2026",
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
      label: "Economy",
      title: "Employers added 165,000 jobs in October, soaring past expectations",
      text: "Economists had expected only 65,000 new jobs. Unemployment fell from 4.2% to 4.1%, and job gains for August and September were revised up by a combined 84,000.",
      link: "https://finance.yahoo.com/economy/articles/employers-added-165-000-jobs-135017342.html",
      source: "Yahoo Finance",
    },
    {
      label: "Markets",
      title: "Stock market today: Nasdaq and S&P 500 rebound, Dow slips to cap bruising week for AI stocks",
      text: "On Friday the Nasdaq rose 1.1% and the S&P 500 0.3%, while the Dow fell 0.5%. Even so, it was a hard week: technology stocks lost about 7% after Thursday's AI selloff.",
      link: "https://finance.yahoo.com/markets/live/stock-market-today-friday-november-6-dow-sp-500-nasdaq-jobs-report-earnings-135953863.html",
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
