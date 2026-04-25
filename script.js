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
      loadEinstellungen()
    ]);
  } catch(e) {
    console.log('CMS-Daten nicht gefunden, statische Inhalte werden verwendet.');
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
   SEITENNAVIGATION
══════════════════════════════════════════════════ */

function showPage(id) {

  /* Alle Seiten ausblenden */
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'entering');
    p.style.display = 'none';
  });

  /* Zielseite einblenden */
  const target = document.getElementById('page-' + id);
  target.style.display = 'flex';
  requestAnimationFrame(() => {
    target.classList.add('active', 'entering');
  });

  /* Aktiven Nav-Link markieren */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === id);
  });

  /* Seitenspezifische Animationen auslösen */
  setTimeout(() => {

    if (id === 'home') {
      document.getElementById('home-headline').classList.add('visible');
      clearTimeout(autoTimer);
      startTimerAnim();
      autoTimer = setTimeout(() => goTo(current + 1), DURATION);
    }

    if (id === 'profile') {
      document.getElementById('profile-text').classList.add('visible');
      document.getElementById('profile-stats').classList.add('visible');
      clearTimeout(autoTimer);
    }

    if (id === 'services') {
      document.getElementById('services-intro').classList.add('visible');
      document.getElementById('services-list').classList.add('visible');
      clearTimeout(autoTimer);
    }

    if (id === 'impressum') {
      document.getElementById('impressum-title').classList.add('visible');
      ['imp-1', 'imp-2', 'imp-3', 'imp-4', 'imp-5', 'imp-6', 'imp-7'].forEach((sid, i) => {
        setTimeout(() => {
          const el = document.getElementById(sid);
          if (el) el.classList.add('visible');
        }, i * 60);
      });
      clearTimeout(autoTimer);
    }

  }, 80);

  window.scrollTo(0, 0);
}


/* ══════════════════════════════════════════════════
   INITIALER SEITENAUFRUF
══════════════════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', () => {
  loadCMSData();
  setTimeout(() => {
    document.getElementById('home-headline').classList.add('visible');
  }, 400);
});
