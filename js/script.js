/* ============================================================
   PENEZA HOSPITAL — script.js
   ============================================================ */
(function () {
  'use strict';

  /* ---- Sticky nav: solid background past 60px ---- */
  const nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile hamburger menu ---- */
  const burger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    const toggle = (open) => {
      burger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', () => toggle(!burger.classList.contains('open')));
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => toggle(false))
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggle(false);
    });
  }

  /* ---- Accordion ---- */
  document.querySelectorAll('.acc-head').forEach((head) => {
    head.addEventListener('click', () => {
      const item = head.closest('.acc-item');
      const body = item.querySelector('.acc-body');
      const isOpen = item.classList.contains('open');
      // close siblings within the same accordion
      const parent = item.closest('.accordion');
      if (parent) {
        parent.querySelectorAll('.acc-item.open').forEach((other) => {
          if (other !== item) {
            other.classList.remove('open');
            other.querySelector('.acc-body').style.maxHeight = null;
          }
        });
      }
      item.classList.toggle('open', !isOpen);
      body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
    });
  });

  /* ---- Gallery filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      galleryItems.forEach((item) => {
        const show = cat === 'all' || item.dataset.category === cat;
        item.classList.toggle('hide', !show);
      });
    });
  });

  /* ---- Gallery lightbox ---- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && galleryItems.length) {
    const lbImg = lightbox.querySelector('img');
    const lbCap = lightbox.querySelector('.lb-cap');
    let visible = [];
    let idx = 0;

    const collectVisible = () =>
      Array.from(galleryItems).filter((i) => !i.classList.contains('hide'));

    const show = (i) => {
      visible = collectVisible();
      if (!visible.length) return;
      idx = (i + visible.length) % visible.length;
      const item = visible[idx];
      const img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = item.dataset.category
        ? item.dataset.category.toUpperCase()
        : '';
    };
    const open = (item) => {
      visible = collectVisible();
      show(visible.indexOf(item));
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    galleryItems.forEach((item) =>
      item.addEventListener('click', () => open(item))
    );
    lightbox.querySelector('.lb-close').addEventListener('click', close);
    lightbox.querySelector('.lb-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      show(idx - 1);
    });
    lightbox.querySelector('.lb-next').addEventListener('click', (e) => {
      e.stopPropagation();
      show(idx + 1);
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---- Static form handling (no backend) ---- */
  document.querySelectorAll('form[data-static]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      if (note) note.classList.add('show');
      form.reset();
    });
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Split Text: wrap each word so it can blur/fade in ---- */
  document.querySelectorAll('[data-reveal-text]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    el.classList.add('reveal-text');
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.setProperty('--i', i);
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---- Count Up: animate numbers with data-count when in view ---- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Scroll reveal (handles .reveal, .reveal-text, [data-count]) ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-text, [data-count]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            if (en.target.dataset.count !== undefined) countUp(en.target);
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => {
      el.classList.add('in');
      if (el.dataset.count !== undefined) el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
  }

  /* ---- Tilted Card: subtle 3D tilt + glare on feature images ---- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
      const max = 4; // degrees — kept subtle for a clinical brand
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform =
          `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg)`;
        const glare = card.querySelector('.tilt__glare');
        if (glare) { glare.style.setProperty('--gx', px * 100 + '%'); glare.style.setProperty('--gy', py * 100 + '%'); }
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    /* ---- Spotlight follow on cards ---- */
    document.querySelectorAll('.spotlight').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });
  }
})();
