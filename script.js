/* ════════════════════════════════════════════════════
   thomas lakiewicz — Portfolio
   script.js
   ════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════
   MOBILE NAVIGATION
══════════════════════════════════════════════════ */

function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger-btn');
  const isOpen = nav.classList.contains('open');

  if (isOpen) {
    nav.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = '';
  } else {
    nav.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden';
  }
}

// Menü schließen bei Escape-Taste
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const nav = document.getElementById('mobile-nav');
    if (nav.classList.contains('open')) toggleMobileNav();
  }
});


/* ══════════════════════════════════════════════════
   SLIDER
══════════════════════════════════════════════════ */

const DURATION      = 6000;             // 6 Sekunden pro Slide
const CIRCUMFERENCE = 2 * Math.PI * 11;

const slides     = Array.from(document.querySelectorAll('.slide'));
const timerFill  = document.getElementById('timer-fill');
const pagerLabel = document.getElementById('pager-label');
const slideLabel = document.getElementById('slide-label');

const total = slides.length;
let current   = 0;
let autoTimer = null;

function pad(n) { return String(n).padStart(2, '0'); }

function updatePager() {
  pagerLabel.textContent = `${pad(current + 1)} / ${pad(total)}`;
  slideLabel.textContent = slides[current].dataset.label || '';
}

function startTimerAnim() {
  timerFill.style.transition       = 'none';
  timerFill.style.strokeDashoffset = '0';
  timerFill.getBoundingClientRect();
  timerFill.style.transition       = `stroke-dashoffset ${DURATION}ms linear`;
  timerFill.style.strokeDashoffset = String(CIRCUMFERENCE);
}

function goTo(index, resetTimer = true) {
  const oldVideo = slides[current].querySelector('video');
  if (oldVideo) oldVideo.pause();

  slides[current].classList.remove('active');
  current = ((index % total) + total) % total;
  slides[current].classList.add('active');

  const newVideo = slides[current].querySelector('video');
  if (newVideo) newVideo.play().catch(() => {});

  updatePager();

  if (resetTimer) {
    clearTimeout(autoTimer);
    startTimerAnim();
    autoTimer = setTimeout(() => goTo(current + 1), DURATION);
  }
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

/* ── Cursor-Navigation (Desktop) ── */
const sliderNav    = document.getElementById('slider-nav');
const sliderCursor = document.getElementById('slider-cursor');
const cursorArrow  = document.getElementById('cursor-arrow');

if (sliderNav && sliderCursor) {
  sliderNav.addEventListener('mousemove', e => {
    sliderCursor.style.left = e.clientX + 'px';
    sliderCursor.style.top  = e.clientY + 'px';
    sliderCursor.classList.add('visible');
    const isRight = e.clientX > window.innerWidth / 2;
    cursorArrow.setAttribute('d', isRight
      ? 'M20 16l8 8-8 8'   // Pfeil →
      : 'M28 16l-8 8 8 8'  // Pfeil ←
    );
  });

  sliderNav.addEventListener('mouseleave', () => {
    sliderCursor.classList.remove('visible');
  });

  document.getElementById('slider-nav-prev').addEventListener('click', prev);
  document.getElementById('slider-nav-next').addEventListener('click', next);
}

/* ── Touch-Swipe (Mobil) ── */
let touchStartX = 0;
let touchStartY = 0;

const sliderEl = document.getElementById('slider');
if (sliderEl) {
  sliderEl.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  sliderEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });
}

/* Tastatur-Pfeile */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft')  prev();
});

/* Slider initialisieren */
updatePager();
startTimerAnim();
autoTimer = setTimeout(() => goTo(1), DURATION);


/* ══════════════════════════════════════════════════
   CMS DATEN LADEN
   Liest JSON-Dateien aus _data/ und befüllt die Seite
══════════════════════════════════════════════════ */

async function loadCMSData() {
  try {
    await Promise.all([
      loadHome(),
      loadProfil(),
      loadLeistungen(),
      loadImpressum(),
      loadEinstellungen(),
      loadTypografie()
    ]);
  } catch(e) {
    console.log('CMS-Daten nicht gefunden, statische Inhalte werden verwendet.');
  }
}

async function loadTypografie() {
  const res = await fetch('/_data/typografie.json');
  if (!res.ok) return;
  const t = await res.json();
  const root = document.documentElement;

  // Headline
  const h = t.headline || {};
  if (h.size)           root.style.setProperty('--typo-home-size',           h.size + 'px');
  if (h.weight)         root.style.setProperty('--typo-home-weight',          h.weight);
  if (h.align)          root.style.setProperty('--typo-home-align',           h.align);
  if (h.line_height)    root.style.setProperty('--typo-home-line-height',     h.line_height);
  if (h.letter_spacing !== undefined) root.style.setProperty('--typo-home-letter-spacing', h.letter_spacing + 'em');

  // Navigation
  const n = t.navigation || {};
  if (n.nav_size)      root.style.setProperty('--typo-nav-size',      n.nav_size + 'px');
  if (n.nav_weight)    root.style.setProperty('--typo-nav-weight',     n.nav_weight);
  if (n.nav_link_size) root.style.setProperty('--typo-nav-link-size',  n.nav_link_size + 'px');

  // Profil
  const p = t.profil || {};
  if (p.size)          root.style.setProperty('--typo-profil-size',           p.size + 'px');
  if (p.weight)        root.style.setProperty('--typo-profil-weight',         p.weight);
  if (p.align)         root.style.setProperty('--typo-profil-align',          p.align);
  if (p.line_height)   root.style.setProperty('--typo-profil-line-height',    p.line_height);
  if (p.letter_spacing !== undefined) root.style.setProperty('--typo-profil-letter-spacing', p.letter_spacing + 'em');

  // Statistiken
  const s = t.stats || {};
  if (s.number_size)   root.style.setProperty('--typo-stats-number-size',   s.number_size + 'px');
  if (s.number_weight) root.style.setProperty('--typo-stats-number-weight', s.number_weight);
  if (s.label_size)    root.style.setProperty('--typo-stats-label-size',    s.label_size + 'px');

  // Service-Namen
  const sn = t.service_name || {};
  if (sn.size)   root.style.setProperty('--typo-service-name-size',  sn.size + 'px');
  if (sn.weight) root.style.setProperty('--typo-service-name-weight', sn.weight);
  if (sn.align)  root.style.setProperty('--typo-service-name-align',  sn.align);

  // Service-Items
  const si = t.service_items || {};
  if (si.size)        root.style.setProperty('--typo-service-items-size',        si.size + 'px');
  if (si.weight)      root.style.setProperty('--typo-service-items-weight',      si.weight);
  if (si.line_height) root.style.setProperty('--typo-service-items-line-height', si.line_height);

  // Animations-Einstellungen
  if (t.animation) {
    animConfig.type  = t.animation.type  || 'mask';
    animConfig.speed = t.animation.speed || 'normal';
    animConfig.delay = t.animation.delay ?? 0.3;
  }
}


async function loadHome() {
  const res = await fetch('/_data/home.json');
  if (!res.ok) return;
  const d = await res.json();

  const el = document.getElementById('home-headline');
  if (!el || !d.headline) return;

  if (d.headline_break) {
    const parts = d.headline.split(' ');
    const first = parts[0];
    const rest  = parts.slice(1).join(' ');
    el.innerHTML = rest ? `${first}<br>${rest}` : first;
  } else {
    el.textContent = d.headline;
  }
}

async function loadImpressum() {
  const res = await fetch('/_data/impressum.json');
  if (!res.ok) return;
  const d = await res.json();

  const sec1 = document.getElementById('imp-1');
  if (sec1) sec1.querySelector('address').innerHTML =
    `${d.name}<br>${d.strasse}<br>${d.ort}<br>${d.land}`;

  const sec2 = document.getElementById('imp-2');
  if (sec2) sec2.querySelector('p').innerHTML =
    `E-Mail: <a href="mailto:${d.email}">${d.email}</a>`;

  const sec3 = document.getElementById('imp-3');
  if (sec3) sec3.querySelector('address').innerHTML =
    `${d.name}<br>${d.strasse}<br>${d.ort}`;

  const sec4 = document.getElementById('imp-4');
  if (sec4 && d.haftung_inhalte) sec4.querySelector('p').textContent = d.haftung_inhalte;

  const sec5 = document.getElementById('imp-5');
  if (sec5 && d.haftung_links) sec5.querySelector('p').textContent = d.haftung_links;

  const sec6 = document.getElementById('imp-6');
  if (sec6 && d.urheberrecht) sec6.querySelector('p').textContent = d.urheberrecht;

  const sec7 = document.getElementById('imp-7');
  if (sec7 && d.datenschutz) sec7.querySelector('p').textContent = d.datenschutz;
}

async function loadEinstellungen() {
  const res = await fetch('/_data/einstellungen.json');
  if (!res.ok) return;
  const d = await res.json();

  // Nav-Name
  if (d.nav_name) {
    document.querySelectorAll('.nav-logo-name').forEach(el => {
      el.textContent = d.nav_name;
    });
  }

  // E-Mail Links
  if (d.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = `mailto:${d.email}`;
    });
  }

  // LinkedIn Links
  if (d.linkedin) {
    document.querySelectorAll('a[href*="linkedin"]').forEach(el => {
      el.href = d.linkedin;
    });
  }

  // Instagram Links
  if (d.instagram) {
    document.querySelectorAll('a[href*="instagram"]').forEach(el => {
      el.href = d.instagram;
    });
  }
}

async function loadProfil() {
  const res = await fetch('/_data/profil.json');
  if (!res.ok) return;
  const d = await res.json();

  const textEl = document.getElementById('profile-text');
  if (!textEl) return;

  textEl.innerHTML = `
    <p>${d.intro}</p>
    ${d.absatz1 ? `<p>${d.absatz1}</p>` : ''}
    ${d.absatz2 ? `<p>${d.absatz2}</p>` : ''}
    ${d.absatz3 ? `<p>${d.absatz3}</p>` : ''}
    ${d.absatz4 ? `<p>${d.absatz4}</p>` : ''}
    ${d.abschluss ? `<p><span class="highlight">⸺ ${d.abschluss}</span></p>` : ''}
  `;

  if (d.stats && d.stats.length) {
    const statsEl = document.getElementById('profile-stats');
    if (statsEl) {
      statsEl.innerHTML = d.stats.map(s => `
        <div class="stat">
          <div class="stat-number">${s.zahl}</div>
          <div class="stat-label">${s.beschreibung}</div>
        </div>
      `).join('');
    }
  }
}

async function loadLeistungen() {
  const res = await fetch('/_data/leistungen.json');
  if (!res.ok) return;
  const d = await res.json();

  if (d.intro && d.intro.length) {
    const introEl = document.getElementById('services-intro');
    if (introEl) {
      introEl.innerHTML = d.intro.map(i => `<p>${i.text}</p>`).join('');
    }
  }

  if (d.bereiche && d.bereiche.length) {
    const listEl = document.getElementById('services-list');
    if (listEl) {
      listEl.innerHTML = d.bereiche.map(b => `
        <div class="service-row">
          <div class="service-name">${b.name}</div>
          <ul class="service-items">
            ${b.items.map(i => `<li>${i.item}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }
  }
}


/* ══════════════════════════════════════════════════
   GSAP — ANIMATIONEN
   Mask Reveal für alle Textelemente
══════════════════════════════════════════════════ */

gsap.registerPlugin(SplitText);

// Animations-Einstellungen (werden per CMS überschrieben)
let animConfig = {
  type:     'mask',   // 'mask' | 'words' | 'chars' | 'fade' | 'none'
  speed:    'normal', // 'slow' | 'normal' | 'fast'
  delay:    0.3       // Sekunden bis Animation startet
};

// Geschwindigkeit → Dauer in Sekunden
const speedMap = { slow: 1.0, normal: 0.65, fast: 0.35 };

function getDuration() {
  return speedMap[animConfig.speed] || 0.65;
}

/* ── Mask Reveal für ein einzelnes Element ── */
function maskReveal(el, opts = {}) {
  if (!el || animConfig.type === 'none') {
    gsap.set(el, { opacity: 1, y: 0 });
    return;
  }

  const dur     = getDuration();
  const delay   = opts.delay ?? animConfig.delay;
  const stagger = opts.stagger ?? 0.04;
  const type    = animConfig.type;

  if (type === 'fade') {
    gsap.fromTo(el,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: dur, delay, ease: 'power3.out' }
    );
    return;
  }

  const splitType = type === 'mask'  ? 'lines'
                  : type === 'words' ? 'words'
                  : type === 'chars' ? 'chars'
                  : 'lines';

  const split = SplitText.create(el, {
    type: splitType,
    // Extra Padding für Unterlängen (g, p, y, q...)
    linesClass:  'split-line',
    wordsClass:  'split-word',
    charsClass:  'split-char',
    ...(type === 'mask' ? { mask: splitType } : {})
  });

  const targets = split[splitType] || split.lines;

  // Masken-Elemente: Unterlängen nicht abschneiden
  if (type === 'mask') {
    targets.forEach(t => {
      const parent = t.parentElement;
      if (parent) {
        parent.style.overflow = 'hidden';
        parent.style.paddingBottom = '0.15em';
        parent.style.marginBottom  = '-0.15em';
      }
      t.style.display = 'block';
    });
  }

  gsap.fromTo(targets,
    { y: '110%', opacity: type === 'mask' ? 1 : 0 },
    {
      y: '0%',
      opacity: 1,
      duration: dur,
      delay,
      stagger,
      ease: 'power4.out',
      onComplete: () => {
        // Originalstruktur nach Animation wiederherstellen
        if (type !== 'mask') split.revert();
      }
    }
  );
}

/* ── Headline Startseite ── */
function animateHeadline() {
  const el = document.getElementById('home-headline');
  if (!el) return;
  gsap.set(el, { opacity: 1, transform: 'none' }); // CSS-Klasse überschreiben
  maskReveal(el, { delay: animConfig.delay, stagger: 0.08 });
}

/* ── Profil-Texte ── */
function animateProfil() {
  const textEl  = document.getElementById('profile-text');
  const statsEl = document.getElementById('profile-stats');

  if (textEl) {
    textEl.classList.add('visible');
    const paras = textEl.querySelectorAll('p');
    paras.forEach((p, i) => {
      maskReveal(p, { delay: animConfig.delay + i * 0.08, stagger: 0.05 });
    });
  }

  if (statsEl) {
    statsEl.classList.add('visible');
    const numbers = statsEl.querySelectorAll('.stat-number');
    const labels  = statsEl.querySelectorAll('.stat-label');
    numbers.forEach((n, i) => {
      maskReveal(n, { delay: animConfig.delay + 0.1 + i * 0.1, stagger: 0 });
    });
    labels.forEach((l, i) => {
      maskReveal(l, { delay: animConfig.delay + 0.15 + i * 0.1, stagger: 0 });
    });
  }
}

/* ── Leistungen ── */
function animateLeistungen() {
  const introEl = document.getElementById('services-intro');
  const listEl  = document.getElementById('services-list');

  if (introEl) {
    introEl.classList.add('visible');
    introEl.querySelectorAll('p').forEach((p, i) => {
      maskReveal(p, { delay: animConfig.delay + i * 0.1, stagger: 0.05 });
    });
  }

  if (listEl) {
    listEl.classList.add('visible');
    const names = listEl.querySelectorAll('.service-name');
    const items = listEl.querySelectorAll('.service-items li');

    names.forEach((n, i) => {
      maskReveal(n, { delay: animConfig.delay + i * 0.15, stagger: 0.06 });
    });
    items.forEach((item, i) => {
      maskReveal(item, { delay: animConfig.delay + 0.1 + i * 0.03, stagger: 0 });
    });
  }
}

/* ── Seitenübergang ── */
function animatePageIn(id) {
  const page = document.getElementById('page-' + id);
  if (!page) return;

  gsap.fromTo(page,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: getDuration() * 0.8, ease: 'power3.out' }
  );
}


/* ══════════════════════════════════════════════════
   SEITENNAVIGATION
══════════════════════════════════════════════════ */

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'entering');
    p.style.display = 'none';
  });

  const target = document.getElementById('page-' + id);
  target.style.display = 'flex';
  requestAnimationFrame(() => {
    target.classList.add('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === id);
  });

  setTimeout(() => {
    animatePageIn(id);

    if (id === 'home') {
      animateHeadline();
      clearTimeout(autoTimer);
      startTimerAnim();
      autoTimer = setTimeout(() => goTo(current + 1), DURATION);
    }

    if (id === 'profile') {
      animateProfil();
      clearTimeout(autoTimer);
    }

    if (id === 'services') {
      animateLeistungen();
      clearTimeout(autoTimer);
    }

    if (id === 'impressum') {
      const title = document.getElementById('impressum-title');
      if (title) maskReveal(title, { delay: 0.1 });
      ['imp-1','imp-2','imp-3','imp-4','imp-5','imp-6','imp-7'].forEach((sid, i) => {
        setTimeout(() => {
          const el = document.getElementById(sid);
          if (el) {
            el.classList.add('visible');
            maskReveal(el.querySelector('p, address'), { delay: 0.05 });
          }
        }, i * 80);
      });
      clearTimeout(autoTimer);
    }

  }, 80);

  window.scrollTo(0, 0);
}


/* ══════════════════════════════════════════════════
   INITIALER SEITENAUFRUF
══════════════════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', async () => {
  await loadCMSData();
  // Kurze Pause damit Schriften geladen sind
  setTimeout(() => {
    animateHeadline();
  }, 300);
});
