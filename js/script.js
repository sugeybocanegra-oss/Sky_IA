/* ==========================================================================
   ESBS WEB SOLUTIONS — script.js
   Módulos:
   1. Nav: fondo al hacer scroll + menú móvil
   2. Scroll suave para enlaces internos
   3. Scroll-reveal (Intersection Observer)
   4. Parallax suave de los blobs decorativos en el hero
   5. Contador animado de las estadísticas ("Por qué ESBS")
   6. Acordeón de FAQ
   7. Validación y envío del formulario de contacto
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSmoothScroll();
  initScrollReveal();
  initBlobParallax();
  initStatsCounter();
  initFAQ();
  initContactForm();
});

/* Respeta la preferencia de "menos movimiento" del usuario */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------
   1. NAV — fondo tipo vidrio al hacer scroll + menú móvil (hamburguesa)
------------------------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');

  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (burger && links) {
    burger.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cierra el menú móvil al elegir una sección
    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* -------------------------------------------------------------------------
   2. SCROLL SUAVE para anchors internos (respaldo por si el navegador
   no soporta "scroll-behavior: smooth" en CSS, y para offset del nav fijo)
------------------------------------------------------------------------- */
function initSmoothScroll() {
  const navHeight = document.getElementById('nav')?.offsetHeight || 0;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}

/* -------------------------------------------------------------------------
   3. SCROLL-REVEAL — anima cualquier elemento con [data-reveal]
   al entrar en el viewport
------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
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
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   4. PARALLAX de los elementos decorativos (blobs + nube) según el mouse.
   Cualquier elemento con [data-depth] participa automáticamente.
------------------------------------------------------------------------- */
function initBlobParallax() {
  if (prefersReducedMotion) return;

  const items = document.querySelectorAll('[data-depth]');
  if (!items.length) return;

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx);
    const dy = (e.clientY - cy);

    items.forEach((item) => {
      const depth = parseFloat(item.dataset.depth || '0.03');
      item.style.setProperty('--parallax-x', `${dx * depth}px`);
      item.style.setProperty('--parallax-y', `${dy * depth}px`);
    });
  }, { passive: true });
}

/* -------------------------------------------------------------------------
   5. CONTADOR ANIMADO para las estadísticas de "Por qué ESBS"
------------------------------------------------------------------------- */
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat__num[data-count]');
  if (!stats.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  stats.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   6. ACORDEÓN DE FAQ
------------------------------------------------------------------------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Cierra los demás (comportamiento de acordeón exclusivo)
      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq-item__question')?.setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-item__answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* -------------------------------------------------------------------------
   7. VALIDACIÓN Y ENVÍO DEL FORMULARIO DE CONTACTO
   Nota: este sitio es front-end puro (HTML/CSS/JS). El envío real de datos
   requiere conectar este formulario a un backend, servicio de formularios
   (p. ej. Formspree, EmailJS) o una API propia. Aquí se deja la validación
   completa y un flujo de éxito simulado, listo para enchufar el envío real
   en la función submitToBackend().
------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  const validators = {
    name: (v) => v.trim().length >= 2 || 'Escribe tu nombre completo.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Escribe un correo válido.',
    phone: (v) => /^[0-9+\s()-]{7,15}$/.test(v) || 'Escribe un teléfono válido.',
    business: (v) => v.trim().length > 0 || 'Selecciona una opción.',
    message: (v) => v.trim().length >= 10 || 'Cuéntanos un poco más de tu proyecto.',
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach((field) => {
      const input = form.elements[field];
      const errorEl = form.querySelector(`[data-error-for="${field}"]`);
      const result = validators[field](input.value);

      if (result !== true) {
        isValid = false;
        if (errorEl) errorEl.textContent = result;
        input.setAttribute('aria-invalid', 'true');
      } else {
        if (errorEl) errorEl.textContent = '';
        input.removeAttribute('aria-invalid');
      }
    });

    if (!isValid) return;

    const data = Object.fromEntries(new FormData(form).entries());
    submitToBackend(data);
  });
}

function submitToBackend(data) {
  // TODO: reemplazar por el envío real, por ejemplo:
  // fetch('https://tu-endpoint.com/contacto', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  console.log('Datos del formulario listos para enviar:', data);

  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  form.reset();
  if (successMsg) {
    successMsg.hidden = false;
    successMsg.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
  }
}
    const $form = document.querySelector('#form')

    $form.addEventListener('submit', handlesubmit)

    async function handlesubmit(event) {
      event.preventDefault()

      const form = new FormData(this)
      const response = await fetch(this.action, {
        method: this.method,
        body: form,
        headers: {
          'Accept': 'application/json'
        }
        })
        if (response.ok) {
          this.reset()
          alert('Gracias, enseguida nos pondremos en contacto contigo.')
      }
    }