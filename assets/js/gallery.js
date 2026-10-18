// Screenshot gallery in a dialog: buttons, arrow keys, swipe and thumbnails.
(function () {
  const dialog = document.getElementById("gallery");
  const openBtn = document.getElementById("gallery-open");
  if (!dialog || !openBtn) return;

  const thumbs = Array.from(dialog.querySelectorAll(".g-thumb"));
  const img = document.getElementById("g-img");
  const caption = document.getElementById("g-caption");
  const group = document.getElementById("g-group");
  const count = document.getElementById("g-count");
  let index = 0;

  function show(i) {
    index = (i + thumbs.length) % thumbs.length;
    const t = thumbs[index];
    img.src = t.dataset.src;
    img.alt = t.dataset.alt;
    caption.textContent = t.dataset.caption;
    group.textContent = t.dataset.group;
    count.textContent = `${index + 1} of ${thumbs.length}`;
    thumbs.forEach((b, j) => b.setAttribute("aria-current", String(j === index)));
    thumbs[index].scrollIntoView({ block: "nearest", inline: "center" });
  }

  openBtn.addEventListener("click", () => {
    show(index);
    dialog.showModal();
    document.body.style.overflow = "hidden";
  });
  dialog.addEventListener("close", () => { document.body.style.overflow = ""; openBtn.focus(); });
  document.getElementById("g-close").addEventListener("click", () => dialog.close());
  document.getElementById("g-prev").addEventListener("click", () => show(index - 1));
  document.getElementById("g-next").addEventListener("click", () => show(index + 1));
  thumbs.forEach((b, j) => b.addEventListener("click", () => show(j)));

  // Click on the dark backdrop closes
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
  });

  // Swipe on touch screens
  let x0 = null;
  img.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  img.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
