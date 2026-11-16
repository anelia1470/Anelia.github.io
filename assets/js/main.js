// Shared behaviour: mobile nav, footer year, blog post lists.

(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();

// Root of the site relative to the current page ("" or "../").
function siteRoot() {
  const el = document.querySelector("meta[name='site-root']");
  return el ? el.content : "";
}

async function loadPosts() {
  const res = await fetch(siteRoot() + "posts/posts.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("Could not load posts/posts.json");
  const posts = await res.json();
  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function formatDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderPostList(listEl, posts) {
  if (!posts.length) {
    listEl.innerHTML = '<li class="post-empty">No posts here yet.</li>';
    return;
  }
  listEl.innerHTML = posts
    .map(
      (p) => `
      <li>
        <a href="${siteRoot()}post.html?p=${encodeURIComponent(p.slug)}">
          <time datetime="${p.date}">${formatDate(p.date)}</time>
          <div>
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.summary || "")}</p>
          </div>
          <span class="tag">${escapeHtml(p.tag || "Note")}</span>
        </a>
      </li>`
    )
    .join("");
}

// Home page: latest N posts.
(function () {
  const el = document.querySelector("[data-latest-posts]");
  if (!el) return;
  const n = Number(el.dataset.latestPosts) || 3;
  loadPosts()
    .then((posts) => renderPostList(el, posts.slice(0, n)))
    .catch(() => { el.innerHTML = '<li class="post-empty">Posts could not be loaded.</li>'; });
})();

// Home page: Selected work carousel. The centre card is highlighted; arrows, dots,
// swipes, arrow keys or a click on a side card rotate it.
(function () {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;
  const cards = Array.from(root.querySelectorAll(".car-card"));
  const dotsEl = root.querySelector(".car-dots");
  const n = cards.length;
  let idx = 0;
  const mq = window.matchMedia("(max-width: 860px)");

  dotsEl.innerHTML = cards.map((c, i) =>
    `<button type="button" role="tab" aria-label="${escapeHtml(c.querySelector("h3").textContent)}"></button>`).join("");
  const dots = Array.from(dotsEl.children);

  function layout() {
    const side = mq.matches ? 90 : 70;
    cards.forEach((card, i) => {
      const off = (i - idx + n) % n;
      let pos, t;
      if (off === 0) { pos = "0"; t = "translateX(0) scale(1)"; }
      else if (off === 1) { pos = "1"; t = `translateX(${side}%) scale(.86) rotateY(-8deg)`; }
      else if (off === n - 1) { pos = "-1"; t = `translateX(-${side}%) scale(.86) rotateY(8deg)`; }
      else { pos = "hidden"; t = "translateX(0) scale(.6)"; }
      card.dataset.pos = pos;
      card.style.transform = t;
      card.setAttribute("tabindex", pos === "0" ? "0" : "-1");
      card.setAttribute("aria-hidden", pos === "0" ? "false" : "true");
    });
    dots.forEach((d, i) => d.setAttribute("aria-selected", String(i === idx)));
  }
  function go(i) { idx = (i + n) % n; layout(); }

  root.querySelector(".car-prev").addEventListener("click", () => go(idx - 1));
  root.querySelector(".car-next").addEventListener("click", () => go(idx + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  cards.forEach((card, i) => card.addEventListener("click", (e) => {
    if (card.dataset.pos !== "0") { e.preventDefault(); go(i); }
  }));
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
  });
  // Swipe on touch screens
  let x0 = null;
  const track = root.querySelector(".car-track");
  track.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) go(idx + (dx < 0 ? 1 : -1));
  });
  mq.addEventListener("change", layout);
  layout();
})();
