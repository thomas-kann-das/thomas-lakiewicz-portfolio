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

const DURATION      = 3000;             // Millisekunden pro Slide
const CIRCUMFERENCE = 2 * Math.PI * 11; // Umfang des Timer-Rings (r = 11)

const slides     = Array.from(document.querySelectorAll('.slide'));
const timerFill  = document.getElementById('timer-fill');
const pagerLabel = document.getElementById('pager-label');
const slideLabel = document.getElementById('slide-label');
const btnPrev    = document.getElementById('btn-prev');
const btnNext    = document.getElementById('btn-next');

const total = slides.length;
let current   = 0;
let autoTimer = null;

/* Zweistellige Zahl erzeugen: 1 → "01" */
function pad(n) {
  return String(n).padStart(2, '0');
}

/* Pager-Text und Slide-Label aktualisieren */
function updatePager() {
  pagerLabel.textContent = `${pad(current + 1)} / ${pad(total)}`;
  slideLabel.textContent = slides[current].dataset.label || '';
}

/* Timer-Ring-Animation starten */
function startTimerAnim() {
  timerFill.style.transition    = 'none';
  timerFill.style.strokeDashoffset = '0';
  timerFill.getBoundingClientRect(); // Reflow erzwingen
  timerFill.style.transition    = `stroke-dashoffset ${DURATION}ms linear`;
  timerFill.style.strokeDashoffset = String(CIRCUMFERENCE);
}

/* Zu einem bestimmten Slide springen */
function goTo(index, resetTimer = true) {
  // Video auf altem Slide pausieren
  const oldVideo = slides[current].querySelector('video');
  if (oldVideo) oldVideo.pause();

  // Slide wechseln
  slides[current].classList.remove('active');
  current = ((index % total) + total) % total;
  slides[current].classList.add('active');

  // Video auf neuem Slide abspielen
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

btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

/* Pfeiltasten auf der Tastatur */
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
    await Promise.all([loadProfil(), loadLeistungen()]);
  } catch(e) {
    // Kein CMS-Daten vorhanden — statische Inhalte bleiben
    console.log('CMS-Daten nicht gefunden, statische Inhalte werden verwendet.');
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
