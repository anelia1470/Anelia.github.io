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
