/* =============================================================
   Cosmo Textile — site behaviour
   Requires (self-hosted, loaded before this file):
   gsap.min.js, ScrollTrigger.min.js, lenis.min.js
   ============================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    // lerp model tracks the wheel 1:1 — snappier than the duration/easing model
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1 });
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- in-page anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    a.addEventListener("click", function (e) {
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -90 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- header: shrink + hide on scroll ---------- */
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("site-header--solid", y > 24);
      if (!document.body.classList.contains("menu-open")) {
        var goingDown = y > lastY && y > 240;
        header.classList.toggle("site-header--hidden", goingDown);
      }
    }
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- back to top ---------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal], .reveal-stagger, .clip-reveal");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
      revealEls.forEach(function (el) {
        // anything already within ~1 screen of the viewport on load: show now
        if (el.getBoundingClientRect().top < vh * 1.05) el.classList.add("is-in");
        else io.observe(el);
      });
      // safety net: never leave content hidden (slow rAF, background tab, etc.)
      var failsafe = setTimeout(function () {
        revealEls.forEach(function (el) { el.classList.add("is-in"); });
      }, 4000);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
          revealEls.forEach(function (el) {
            if (el.getBoundingClientRect().top < (window.innerHeight || vh)) el.classList.add("is-in");
          });
        }
      });
      window.addEventListener("pagehide", function () { clearTimeout(failsafe); });
    }
  }

  /* ---------- hero intro ---------- */
  if (hasGSAP && !reduceMotion) {
    var heroCopy = document.querySelector(".hero__copy");
    var heroMediaEl = document.querySelector(".hero__media");
    if (heroCopy) {
      gsap.from(heroCopy.querySelectorAll(".eyebrow, .lede, .hero__cta, .hero__marks"), {
        y: 18, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.2
      });
    }
    if (heroMediaEl) {
      gsap.from(heroMediaEl, { autoAlpha: 0, scale: 0.97, duration: 1, ease: "power3.out", delay: 0.15 });
    }
  }

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split(".")[1] || "").length;
    var dur = 1400, start = null;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
    // failsafe against throttled rAF: guarantee the final value
    setTimeout(function () { el.textContent = target.toFixed(decimals); }, dur + 600);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- marquee: duplicate content for seamless loop ---------- */
  document.querySelectorAll(".marquee__row, .logos").forEach(function (row) {
    row.innerHTML += row.innerHTML;
  });

  /* ---------- hero parallax ---------- */
  if (hasGSAP && !reduceMotion) {
    var heroMedia = document.querySelector("[data-parallax]");
    if (heroMedia) {
      gsap.to(heroMedia, {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: heroMedia, start: "top top", end: "bottom top", scrub: 0.5 }
      });
    }
    gsap.utils.toArray("[data-parallax-slow]").forEach(function (el) {
      gsap.fromTo(el, { yPercent: -6 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 }
      });
    });
  }

  /* ---------- process: progress bar + panel reveals ---------- */
  if (hasGSAP && !reduceMotion) {
    var proc = document.querySelector("[data-proc]");
    if (proc) {
      var bar = proc.querySelector("[data-proc-bar]");
      if (bar) {
        gsap.to(bar, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: proc, start: "top 40%", end: "bottom 70%", scrub: true }
        });
      }
      gsap.utils.toArray(".proc__panel").forEach(function (panel) {
        gsap.from(panel.querySelectorAll(".proc__num, .proc__step, h3, p, a"), {
          y: 22, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 74%" }
        });
      });
    }
  }

  /* ---------- markets: draw arcs + pulse targets on scroll ---------- */
  var mapSvg = document.querySelector("[data-map]");
  if (mapSvg) {
    var arcs = mapSvg.querySelectorAll(".map-arc");
    arcs.forEach(function (arc) {
      var len = arc.getTotalLength ? arc.getTotalLength() : 300;
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = reduceMotion ? 0 : len;
    });
    if (!reduceMotion && "IntersectionObserver" in window) {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          arcs.forEach(function (arc, i) {
            arc.animate(
              [{ strokeDashoffset: arc.style.strokeDasharray }, { strokeDashoffset: 0 }],
              { duration: 1400, delay: i * 220, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
            );
          });
          mio.disconnect();
        });
      }, { threshold: 0.4 });
      mio.observe(mapSvg);
    }
  }

  /* ---------- split headline (word reveal) ---------- */
  if (hasGSAP && !reduceMotion) {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) {
        return '<span class="word"><span>' + w + "</span></span>";
      }).join(" ");
      el.querySelectorAll(".word").forEach(function (w) {
        w.style.display = "inline-block"; w.style.overflow = "hidden"; w.style.verticalAlign = "top";
      });
      gsap.from(el.querySelectorAll(".word > span"), {
        yPercent: 115, duration: 0.9, ease: "power3.out", stagger: 0.06, delay: 0.15
      });
    });
  }

  /* ---------- Formspree AJAX submit ---------- */
  var form = document.querySelector("form[data-ajax]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("[type=submit]");
      var original = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          var ok = document.createElement("div");
          ok.className = "form-success";
          ok.setAttribute("role", "status");
          ok.textContent = "Thank you — your enquiry has reached our export team. We usually reply within one business day.";
          form.replaceWith(ok);
        } else {
          throw new Error("bad response");
        }
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
        alert("Something went wrong sending your message. Please email subra.cosmotextile@gmail.com or message us on WhatsApp.");
      });
    });
  }

  /* refresh ScrollTrigger after fonts load (layout can shift) */
  if (hasGSAP && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
