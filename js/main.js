/* ==========================================================
   main.js — comportamiento común de las landings
   Cada módulo solo se activa si encuentra su atributo data-*,
   así el mismo archivo sirve para las 4 variantes.
   ========================================================== */

(function () {
  'use strict';

  // Marca que hay JS para que el CSS pueda ocultar lo que se anima
  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menú móvil ---------- */
  function initNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };

    toggle.addEventListener('click', () => {
      setOpen(!nav.classList.contains('is-open'));
    });

    // Al pulsar un enlace en móvil, cerramos el menú
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  /* ---------- Sombra en la cabecera al hacer scroll ---------- */
  function initHeaderShadow() {
    const header = document.querySelector('.header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Carrusel con fundido: [data-slider] ---------- */
  function initSliders() {
    document.querySelectorAll('[data-slider]').forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll('[data-slide]'));
      const dots = Array.from(slider.querySelectorAll('[data-dot]'));
      if (slides.length < 2) return;

      const interval = Number(slider.dataset.interval) || 6000;
      let current = 0;
      let timer = null;

      const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === current);
          dot.setAttribute('aria-current', i === current ? 'true' : 'false');
        });
      };

      const start = () => {
        if (reduceMotion) return;
        stop();
        timer = window.setInterval(() => show(current + 1), interval);
      };

      const stop = () => {
        if (timer) window.clearInterval(timer);
        timer = null;
      };

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          show(i);
          start();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);

      show(0);
      start();
    });
  }

  /* ---------- Aparición al hacer scroll: [data-reveal] ---------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Contadores: [data-count="25"] ---------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = Number(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }
      const duration = 1400;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ---------- Año actual en el footer: [data-year] ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeaderShadow();
    initSliders();
    initReveal();
    initCounters();
    initYear();
  });
})();
