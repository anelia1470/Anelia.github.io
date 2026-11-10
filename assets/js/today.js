// "This week" panel: slides down from the top when you hover over (or tap) the This week button.
// To update: change TODAY below. News: link directly to a free article (e.g. Yahoo Finance). Links starting with "post.html" or "projects/" are pages on this site.
const TODAY = {
  date: "10 November 2026",
  // Optional: the blog post to announce. Remove this block on days without a new post.
  blog: {
    label: "New on the blog",
    title: "What if you had invested your Netflix subscription instead?",
    text: "Two twins spend the same money every month since 2015. One pays for Netflix. The other buys Netflix shares. Who ends up better off, and why the answer depends on when you check.",
    link: "post.html?p=netflix-what-if",
    cta: "Read the post",
  },
  news: [
    {
      label: "AI",
      title: "TSMC Oct revenue jumps 60% as AI-fueled demand remains strong",
      text: "Chipmaker TSMC said on Tuesday 10 November that its October sales rose 59.7% from a year earlier to T$367.47 billion (about $11.8 billion). Its CEO expects demand for AI chips to continue well into 2027 and beyond.",
      link: "https://finance.yahoo.com/technology/ai/articles/tsmc-oct-revenue-jumps-60-064407771.html",
      source: "Yahoo Finance",
    },
    {
      label: "Markets",
      title: "Wall St brokerages say AI selloff overdone, downplay Democratic regulation risks",
      text: "Morgan Stanley, UBS and other brokerages said on Monday 9 November that last week's sell-off in AI stocks went too far. They see Anthropic's IPO and Nvidia's results on 17 November mattering more than the risk of tougher data center rules.",
      link: "https://finance.yahoo.com/technology/ai/articles/wall-st-brokerages-ai-selloff-153512898.html",
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
