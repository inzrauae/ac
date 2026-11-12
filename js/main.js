// ===== Manazel Al Reyada — site interactions =====
const WHATSAPP_NUMBER = "971528255441"; // update if the number changes

document.addEventListener("DOMContentLoaded", () => {
  // Sticky header
  const header = document.querySelector(".header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        toggle.classList.remove("open");
        links.classList.remove("open");
      })
    );
  }

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // Animated counters
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const dur = 1600;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(el => counterIO.observe(el));

  // Gallery filter
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn =>
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      document.querySelectorAll(".gallery-item").forEach(item => {
        item.classList.toggle("hide", f !== "all" && item.dataset.cat !== f);
      });
    })
  );

  // Gold sparkles
  document.querySelectorAll(".sparkles").forEach(box => {
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = 40 + Math.random() * 60 + "%";
      s.style.animationDelay = Math.random() * 8 + "s";
      s.style.animationDuration = 6 + Math.random() * 6 + "s";
      box.appendChild(s);
    }
  });

  // Contact / quote form -> WhatsApp
  document.querySelectorAll("form.quote-form").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(form);
      const note = form.querySelector(".form-note");
      if (!d.get("name") || !d.get("phone")) {
        if (note) note.textContent = "Please enter your name and phone number.";
        return;
      }
      const msg =
        `Hello Manazel Al Reyada,%0A%0A` +
        `Name: ${encodeURIComponent(d.get("name"))}%0A` +
        `Phone: ${encodeURIComponent(d.get("phone"))}%0A` +
        (d.get("email") ? `Email: ${encodeURIComponent(d.get("email"))}%0A` : "") +
        `Service: ${encodeURIComponent(d.get("service") || "General")}%0A` +
        (d.get("message") ? `Message: ${encodeURIComponent(d.get("message"))}` : "");
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
      if (note) note.textContent = "Thank you! Opening WhatsApp to send your request…";
      form.reset();
    });
  });

  // Footer year
  document.querySelectorAll(".year").forEach(y => (y.textContent = new Date().getFullYear()));
});

// ===== Hero photo slider =====
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero-slider");
  if (!hero) return;
  const slides = [...hero.querySelectorAll(".slide")];
  const dots = [...hero.querySelectorAll(".hs-dot")];
  const items = [...hero.querySelectorAll(".hs-item")];
  const DURATION = 6000;
  hero.style.setProperty("--hs-time", DURATION + "ms");
  let current = 0, timer;

  const show = i => {
    current = (i + slides.length) % slides.length;
    [slides, dots, items].forEach(list => list.forEach((el, k) => el.classList.toggle("active", k === current)));
    // restart the progress bar on the active service (re-apply .active to re-run the animation)
    const item = items[current];
    if (item) { item.classList.remove("active"); void item.offsetWidth; item.classList.add("active"); }
  };
  const restart = () => { clearInterval(timer); timer = setInterval(() => show(current + 1), DURATION); };

  dots.forEach(d => d.addEventListener("click", () => { show(+d.dataset.slide); restart(); }));
  hero.querySelector(".hs-prev")?.addEventListener("click", () => { show(current - 1); restart(); });
  hero.querySelector(".hs-next")?.addEventListener("click", () => { show(current + 1); restart(); });
  // hovering a service in the bottom bar previews its photo
  items.forEach(it => it.addEventListener("mouseenter", () => { show(+it.dataset.slide); restart(); }));

  // swipe on touch devices
  let x0 = null;
  hero.addEventListener("touchstart", e => (x0 = e.touches[0].clientX), { passive: true });
  hero.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { show(current + (dx < 0 ? 1 : -1)); restart(); }
    x0 = null;
  });

  // preload the other photos so transitions are smooth
  slides.forEach(s => {
    const m = s.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (m) new Image().src = m[1];
  });
  restart();
});

// ===== Mobile menu: backdrop, scroll lock, Esc to close =====
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  const backdrop = document.querySelector(".menu-backdrop");
  if (!toggle || !links) return;
  const sync = () => {
    const open = links.classList.contains("open");
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  const close = () => { links.classList.remove("open"); toggle.classList.remove("open"); sync(); };
  toggle.addEventListener("click", sync);                 // runs after the existing toggle handler
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", sync));
  backdrop && backdrop.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  window.addEventListener("resize", () => { if (innerWidth > 900) close(); });
});
