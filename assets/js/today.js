// "This week" panel: slides down from the top when you hover over (or tap) the This week button.
// To update: change TODAY below. News: link directly to a free article (e.g. Yahoo Finance). Links starting with "post.html" or "projects/" are pages on this site.
const TODAY = {
  date: "16 November 2026",
  // Optional: the blog post to announce. Remove this block on days without a new post.
  blog: {
    label: "New on the blog",
    title: "Bidding war: how Fortum beat Audax to Elmera",
    text: "A Spanish bidder went public with support from 39% of the shareholders and still lost. What made Fortum's offer stronger, and did it pay too much?",
    link: "post.html?p=elmera-takeover-fortum-audax",
    cta: "Read the post",
  },
  news: [
    {
      label: "AI",
      title: "Nvidia's first post-Jensen earnings and Anthropic's IPO: What to watch this week",
      text: "Nvidia reports earnings on Tuesday 17 November, days after Jensen Huang resigned as CEO. Anthropic plans to price its IPO on Wednesday 18 November and start trading on Nasdaq on Thursday 19 November, selling 825 million shares at $70 to $78 each.",
      link: "https://finance.yahoo.com/markets/article/nvidias-first-post-jensen-earnings-and-anthropics-ipo-what-to-watch-this-week-110000732.html",
      source: "Yahoo Finance",
    },
    {
      label: "Markets",
      title: "Asia stocks slide as AI jitters deepen ahead of Nvidia results",
      text: "Asian stocks fell on Monday 16 November ahead of Nvidia's results, with Taiwan's benchmark down 3.9% and South Korea's KOSPI down 2.8%. Japan's Nikkei 225 dropped 1.7% after data showed the economy shrank at a 0.1% annualized rate in the third quarter.",
      link: "https://finance.yahoo.com/markets/stocks/articles/asia-stocks-slide-ai-jitters-043337789.html",
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

  // Weekends (Norwegian time): markets are closed, so show a short note instead of the news
  const osloDay = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", weekday: "long" }).format(new Date());
  const weekend = osloDay === "Saturday" || osloDay === "Sunday";
  const shownDate = weekend
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).replace(",", "")
    : TODAY.date;
  const newsHtml = weekend
    ? `<article class="today-row today-closed">
        <div class="today-row-text">
          <p class="today-label">Markets closed</p>
          <h4>The markets are closed for the weekend</h4>
          <p>News will be back on Monday morning, when the markets open again.</p>
        </div>
      </article>`
    : TODAY.news.map((it) => `<article class="today-row">
            <div class="today-row-text">
              <p class="today-label">${esc(it.label)}${it.source ? ` · ${esc(it.source)}` : ""}</p>
              <h4><a href="${esc(it.link)}" target="_blank" rel="noopener">${esc(it.title)}</a></h4>
              <p>${esc(it.text)}</p>
              <div class="today-row-foot"><a class="today-cta" href="${esc(it.link)}" target="_blank" rel="noopener">Read more ↗</a></div>
            </div>
          </article>`).join("");

  const panel = document.createElement("section");
  panel.id = "today-panel";
  panel.className = "today-panel";
  panel.setAttribute("aria-label", "This week");
  panel.hidden = true;
  panel.innerHTML = `
    <div class="today-inner">
      <div class="today-head">
        <p class="today-kicker"><span class="pulse" aria-hidden="true"></span>This week</p>
        <h2 class="today-date">${esc(shownDate)}</h2>
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
          ${newsHtml}
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
