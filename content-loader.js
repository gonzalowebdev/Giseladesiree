// ══════════════════════════════════════════════════════
// content-loader.js — Gisela Desiree
// Cargá el contenido dinámico desde Supabase en el index
//
// INSTRUCCIONES:
// 1. Completá SUPABASE_URL y SUPABASE_ANON_KEY abajo
// 2. Agregá esta línea antes de </body> en index.html:
//    <script src="content-loader.js"></script>
// ══════════════════════════════════════════════════════

// ── CONFIG — reemplazá con tus datos ──────────────────
const CL_URL = 'https://sxynsagtfghymrbhpqow.supabase.co';
const CL_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4eW5zYWd0ZmdoeW1yYmhwcW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzMzMjIsImV4cCI6MjEwNDYwOTMyMn0.y5gRRMc-Ks2fqRZwtrNjgzLDlyhhrtX3xqxXlMQlLFg';
// ──────────────────────────────────────────────────────

(async function () {
  'use strict';

  // ── 1. Cargá el SDK de Supabase si no está ya cargado ──
  if (!window.supabase) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload  = resolve;
      s.onerror = () => reject(new Error('No se pudo cargar el SDK de Supabase'));
      document.head.appendChild(s);
    });
  }

  const sb = window.supabase.createClient(CL_URL, CL_KEY);

  // ── 2. Fetch paralelo de todas las tablas ──────────────
  const [
    { data: contentRows },
    { data: services },
    { data: courses },
    { data: faqs },
    { data: gallery },
  ] = await Promise.all([
    sb.from('content').select('*'),
    sb.from('services').select('*').order('sort_order').order('created_at'),
    sb.from('courses').select('*').order('year', { ascending: false }).order('sort_order'),
    sb.from('faqs').select('*').order('sort_order'),
    sb.from('gallery').select('*').order('created_at', { ascending: false }).limit(6),
  ]);

  // Si Supabase no devuelve nada, no rompas el sitio
  if (!contentRows) return;
  const c = Object.fromEntries(contentRows.map(r => [r.key, r.value]));

  // ── Helpers ───────────────────────────────────────────
  function setText(selector, val) {
    if (!val) return;
    const el = document.querySelector(selector);
    if (el) el.textContent = val;
  }
  function setHtml(selector, val) {
    if (!val) return;
    const el = document.querySelector(selector);
    if (el) el.innerHTML = val;
  }
  function setSrc(selector, val) {
    if (!val) return;
    const el = document.querySelector(selector);
    if (el) el.src = val;
  }
  // Reemplaza el último nodo de texto de un elemento
  // (útil para elementos que tienen hijos como íconos/spans antes del texto)
  function setLastTextNode(el, val) {
    if (!el || !val) return;
    for (let i = el.childNodes.length - 1; i >= 0; i--) {
      if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim()) {
        el.childNodes[i].textContent = ' ' + val + ' ';
        return;
      }
    }
    // Si no encontró nodo de texto, agregá uno
    el.appendChild(document.createTextNode(' ' + val + ' '));
  }

  // ── 3. LOGO ───────────────────────────────────────────
  if (c.logo_text) {
    setLastTextNode(document.querySelector('.nav-logo'), c.logo_text);
  }

  // ── 4. WHATSAPP — actualizá todos los links ───────────
  if (c.whatsapp_number) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      const url = new URL(a.href);
      const msg = url.searchParams.get('text') || '';
      a.href = 'https://wa.me/' + c.whatsapp_number + (msg ? '?text=' + encodeURIComponent(msg) : '');
    });
  }

  // ── 5. INSTAGRAM ──────────────────────────────────────
  if (c.instagram_handle) {
    const handle = c.instagram_handle.replace('@', '');
    document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
      a.href = 'https://www.instagram.com/' + handle;
      if (a.textContent.trim().startsWith('@')) a.textContent = '@' + handle;
    });
  }

  // ── 6. HERO ───────────────────────────────────────────

  // Badge
  if (c.hero_badge) {
    setLastTextNode(document.querySelector('.hero-badge'), c.hero_badge);
  }

  // Título (línea 1 + texto destacado en itálica rosa)
  const h1 = document.querySelector('.hero h1');
  if (h1 && (c.hero_title_line1 || c.hero_title_highlight)) {
    const l1 = c.hero_title_line1    || 'Tu sonrisa en';
    const l2 = c.hero_title_highlight || 'las mejores manos';
    h1.innerHTML = l1 + '<br><span class="highlight">' + l2 + '</span>';
  }

  // Descripción
  setText('.hero-description', c.hero_description);

  // Botones
  if (c.hero_btn_primary) {
    const btn = document.querySelector('.hero-buttons .btn-primary');
    if (btn) btn.textContent = c.hero_btn_primary;
  }
  if (c.hero_btn_outline) {
    const btn = document.querySelector('.hero-buttons .btn-outline');
    if (btn) btn.textContent = c.hero_btn_outline;
  }

  // Estadísticas
  const stats = document.querySelectorAll('.hero-stat');
  [
    ['hero_stat1_number', 'hero_stat1_label'],
    ['hero_stat2_number', 'hero_stat2_label'],
    ['hero_stat3_number', 'hero_stat3_label'],
  ].forEach(([numKey, lblKey], i) => {
    if (!stats[i]) return;
    if (c[numKey]) setText.call(null, null, c[numKey]),
      stats[i].querySelector('.hero-stat-number').textContent = c[numKey];
    if (c[lblKey])
      stats[i].querySelector('.hero-stat-label').textContent = c[lblKey];
  });

  // Imagen hero
  setSrc('.hero-image', c.hero_image_url);

  // ── 7. SOBRE MÍ ───────────────────────────────────────

  // Imagen
  setSrc('.about-image', c.about_image_url);

  // Párrafos (seleccionamos solo los <p> directos del .about-text que no son el subtitle)
  const aboutParas = Array.from(
    document.querySelectorAll('.about-text > p')
  ).filter(p => !p.classList.contains('section-subtitle'));

  if (aboutParas[0] && c.about_p1) aboutParas[0].textContent = c.about_p1;
  if (aboutParas[1] && c.about_p2) aboutParas[1].textContent = c.about_p2;

  // Características (bullets)
  const features = document.querySelectorAll('.about-feature');
  ['about_feature1', 'about_feature2', 'about_feature3', 'about_feature4'].forEach((key, i) => {
    if (!c[key] || !features[i]) return;
    setLastTextNode(features[i], c[key]);
  });

  // ── 8. RESERVA ────────────────────────────────────────
  const cards = document.querySelectorAll('.consulta-slider > div');

  if (cards[0]) {
    // Precio (div con font-family Cormorant en el style inline)
    const priceEl = cards[0].querySelector('div[style*="font-family"]');
    if (priceEl && c.reserva_price1) priceEl.textContent = c.reserva_price1;
    // Alias (p con font-family monospace en el style inline)
    const aliasEl = cards[0].querySelector('p[style*="monospace"]');
    if (aliasEl && c.reserva_alias) aliasEl.textContent = c.reserva_alias;
  }
  if (cards[1]) {
    const priceEl = cards[1].querySelector('div[style*="font-family"]');
    if (priceEl && c.reserva_price2) priceEl.textContent = c.reserva_price2;
  }

  // ── 9. SERVICIOS — reconstruye la grilla ──────────────
  if (services && services.length) {
    const grid = document.querySelector('.services-grid');
    if (grid) {
      const delays = ['reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4'];
      grid.innerHTML = services.map((s, i) => `
        <div class="service-card reveal ${delays[i % 4]}">
          <img
            src="${s.image_url || ''}"
            alt="${s.title}"
            class="service-img"
            onerror="this.src='https://picsum.photos/seed/srv${i}/400/200'">
          <div class="service-body">
            <div class="service-icon">${s.icon || '🦷'}</div>
            <h3>${s.title}</h3>
            <p>${s.description || ''}</p>
          </div>
        </div>`).join('');

      // Re-observar los nuevos elementos para la animación reveal
      reobserveReveals(grid.querySelectorAll('.reveal'));
    }
  }

  // ── 10. CURSOS — reconstruye el timeline ──────────────
  if (courses && courses.length) {
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      const byYear = {};
      courses.forEach(item => {
        if (!byYear[item.year]) byYear[item.year] = [];
        byYear[item.year].push(item);
      });

      timeline.innerHTML = Object.keys(byYear)
        .sort((a, b) => b - a)
        .map(year => `
          <div class="timeline-year">${year}</div>
          ${byYear[year].map(item => `
            <div class="timeline-course">
              <strong>${item.title}</strong>
              ${item.institution || ''}${item.hours ? ' – ' + item.hours : ''}
            </div>`).join('')}`).join('');
    }
  }

  // ── 11. FAQS — reconstruye la lista ───────────────────
  if (faqs && faqs.length) {
    const faqList = document.querySelector('.faq-list');
    if (faqList) {
      faqList.innerHTML = faqs.map(f => `
        <div class="faq-item reveal">
          <button class="faq-question" onclick="toggleFAQ(this)">
            ${f.question}
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-answer">
            <p>${f.answer || ''}</p>
          </div>
        </div>`).join('');

      reobserveReveals(faqList.querySelectorAll('.reveal'));
    }
  }

  // ── Helper: re-activa el IntersectionObserver para
  //    elementos nuevos generados dinámicamente ──────────
  function reobserveReveals(elements) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => {
      el.classList.remove('visible'); // reset por si ya estaba visible
      observer.observe(el);
    });
  }

  // ── 12. GALERÍA — llena el slider ────────────────────
  if (gallery && gallery.length) {
    const track = document.getElementById('gallery-track');
    if (track) {
      track.innerHTML = gallery.map(img => `
        <div class="gallery-slide">
          <img src="${img.image_url}" alt="Trabajo odontológico"
               loading="lazy"
               onerror="this.parentElement.style.display='none'">
        </div>`).join('');

      // Activar el slider JS (definido inline en el index)
      if (typeof window.galleryInit === 'function') {
        window.galleryInit(gallery.length);
      }
    }
  }

})().catch(err => {
  // Silencioso en producción — el sitio sigue funcionando con el contenido estático del HTML
  console.warn('[content-loader] No se pudo cargar el contenido dinámico:', err.message);
});
