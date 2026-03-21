/* ═══════════════════════════════════════════════
   SIGNAL — main.js
   Prakul Sunil Hiremath
═══════════════════════════════════════════════ */

/* ── CURSOR + TRAIL ──────────────────────────── */
const cur = document.getElementById('cur');
const trailCanvas = document.getElementById('trail');
const tctx = trailCanvas.getContext('2d');
let mx = 0, my = 0;
let dots = [];

const resizeTrail = () => {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
};
resizeTrail();
window.addEventListener('resize', resizeTrail);

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
  dots.push({ x: mx, y: my, r: 2.5, a: 0.35, born: Date.now() });
  if (dots.length > 14) dots.shift();
});

const drawTrail = () => {
  tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  const now = Date.now();
  // get current ink color from CSS
  const isDark = document.documentElement.classList.contains('dark');
  const inkBase = isDark ? '240,237,232' : '12,12,12';
  dots = dots.filter(d => now - d.born < 420);
  dots.forEach((d, i) => {
    const age = (now - d.born) / 420;
    const a = (1 - age) * 0.22;
    const r = d.r * (1 - age * 0.5);
    tctx.beginPath();
    tctx.arc(d.x, d.y, r, 0, Math.PI * 2);
    tctx.fillStyle = `rgba(${inkBase},${a})`;
    tctx.fill();
  });
  requestAnimationFrame(drawTrail);
};
drawTrail();

// cursor color by domain
const domainCursors = {
  'space': 'c-space', 'mind': 'c-mind',
  'earth': 'c-earth', 'signal': 'c-signal'
};
document.querySelectorAll('[data-domain]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    const d = el.dataset.domain;
    cur.className = domainCursors[d] || '';
  });
  el.addEventListener('mouseleave', () => { cur.className = ''; });
});
document.querySelectorAll('a,button,.pj,.sc,.pc,.pi,.ff').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (!el.dataset.domain) cur.classList.add('c-mind');
  });
  el.addEventListener('mouseleave', () => {
    if (!el.dataset.domain) cur.classList.remove('c-mind');
  });
});

/* ── HERO SINE WAVE ──────────────────────────── */
const letters = document.querySelectorAll('.hl');
let flatlined = false;
let flatlineTimer = null;
const phases = Array.from(letters, (_, i) => (i / letters.length) * Math.PI * 2);
const amplitudes = [18, 22, 16, 20, 14, 24];
const freqs = [0.9, 1.1, 0.8, 1.0, 1.2, 0.95];

const animLetters = (t) => {
  if (!flatlined) {
    letters.forEach((l, i) => {
      const y = Math.sin(t * freqs[i] * 0.0012 + phases[i]) * amplitudes[i];
      l.style.transform = `translateY(${y}px)`;
    });
  }
  requestAnimationFrame(animLetters);
};
requestAnimationFrame(animLetters);

// Flatline easter egg
const heroLettersWrap = document.querySelector('.h-letters');
const hline = document.querySelector('.h-line');
const sigRestored = document.getElementById('sig-restored');

heroLettersWrap.addEventListener('click', () => {
  if (flatlined) return;
  flatlined = true;
  letters.forEach(l => { l.style.transform = 'translateY(0px)'; });
  hline.classList.add('flat');
  sigRestored.style.opacity = '0';
  setTimeout(() => {
    sigRestored.style.opacity = '1';
    sigRestored.style.transition = 'opacity .3s';
  }, 500);
  setTimeout(() => {
    hline.classList.remove('flat');
    sigRestored.style.opacity = '0';
    setTimeout(() => { flatlined = false; }, 300);
  }, 2000);
});

/* ── RIGHT NAV ───────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const rnavDots = document.querySelectorAll('.rd');

const updateNav = () => {
  let current = '';
  sections.forEach(s => {
    const rect = s.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.4) current = s.id;
  });
  rnavDots.forEach(d => {
    d.classList.toggle('on', d.dataset.s === current || d.dataset.target === current);
  });
};
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

rnavDots.forEach(d => {
  d.addEventListener('click', () => {
    const target = document.getElementById(d.dataset.target || d.dataset.s);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── THEME TOGGLE ────────────────────────────── */
const tbtn = document.getElementById('tbtn');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark);
  sunIcon.style.display = dark ? 'block' : 'none';
  moonIcon.style.display = dark ? 'none' : 'block';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
};

// On load
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(saved === 'dark' || (!saved && prefersDark));

tbtn.addEventListener('click', () => {
  applyTheme(!document.documentElement.classList.contains('dark'));
});

/* ── FILMSTRIP ───────────────────────────────── */
const fs = document.querySelector('.fs');
const fsProg = document.querySelector('.fs-prog');
const fsCtr = document.querySelector('.fs-cur');
const fsTotalEl = document.querySelector('.fs-total');

if (fs) {
  let isDown = false, startX, scrollLeft;

  const updateFilmProgress = () => {
    const max = fs.scrollWidth - fs.clientWidth;
    const pct = max > 0 ? (fs.scrollLeft / max) * 100 : 0;
    if (fsProg) fsProg.style.width = pct + '%';
    if (fsCtr) {
      const frames = fs.querySelectorAll('.ff');
      const frameW = frames[0]?.offsetWidth + 2 || 302;
      const idx = Math.round(fs.scrollLeft / frameW) + 1;
      fsCtr.textContent = String(Math.min(idx, frames.length)).padStart(2, '0');
    }
  };

  fs.addEventListener('mousedown', e => {
    isDown = true; fs.classList.add('drag');
    startX = e.pageX - fs.offsetLeft;
    scrollLeft = fs.scrollLeft;
  });
  window.addEventListener('mouseup', () => { isDown = false; fs.classList.remove('drag'); });
  fs.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - fs.offsetLeft;
    fs.scrollLeft = scrollLeft - (x - startX) * 1.4;
    updateFilmProgress();
  });
  fs.addEventListener('scroll', updateFilmProgress, { passive: true });

  // Touch support
  let touchStartX = 0, touchScrollLeft = 0;
  fs.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = fs.scrollLeft;
  }, { passive: true });
  fs.addEventListener('touchmove', e => {
    const dx = touchStartX - e.touches[0].pageX;
    fs.scrollLeft = touchScrollLeft + dx;
    updateFilmProgress();
  }, { passive: true });
}

/* ── PROJECT STRIPS ──────────────────────────── */
document.querySelectorAll('.pj').forEach(strip => {
  strip.addEventListener('click', () => {
    const wasOpen = strip.classList.contains('open');
    document.querySelectorAll('.pj.open').forEach(s => s.classList.remove('open'));
    if (!wasOpen) strip.classList.add('open');
  });
});

/* ── SCROLL REVEALS ──────────────────────────── */
const rvObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      rvObs.unobserve(e.target);
    }
  });
}, { threshold: 0.07 });
document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

/* ── COMMAND PALETTE ─────────────────────────── */
const cmd = document.getElementById('cmd');
const cmdIn = document.getElementById('cmd-in');
const cmdItems = document.querySelectorAll('.ci');
let selIdx = -1;

const openCmd = () => { cmd.classList.add('open'); cmdIn.focus(); cmdIn.value = ''; filterCmd(''); };
const closeCmd = () => { cmd.classList.remove('open'); selIdx = -1; };

const filterCmd = (q) => {
  let vis = 0;
  cmdItems.forEach(item => {
    const match = item.dataset.target.toLowerCase().includes(q.toLowerCase()) || q === '';
    item.style.display = match ? 'flex' : 'none';
    if (match) vis++;
  });
};

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault(); openCmd();
  }
  if (e.key === 'Escape') closeCmd();
  if (cmd.classList.contains('open')) {
    const visible = [...cmdItems].filter(i => i.style.display !== 'none');
    if (e.key === 'ArrowDown') { selIdx = Math.min(selIdx + 1, visible.length - 1); }
    if (e.key === 'ArrowUp')   { selIdx = Math.max(selIdx - 1, 0); }
    visible.forEach((i, idx) => i.classList.toggle('sel', idx === selIdx));
    if (e.key === 'Enter' && selIdx >= 0) {
      const target = document.getElementById(visible[selIdx].dataset.target);
      if (target) { target.scrollIntoView({ behavior: 'smooth' }); closeCmd(); }
    }
  }
});

cmdIn.addEventListener('input', () => { filterCmd(cmdIn.value); selIdx = -1; });
cmd.addEventListener('click', e => { if (e.target === cmd) closeCmd(); });

cmdItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = document.getElementById(item.dataset.target);
    if (target) { target.scrollIntoView({ behavior: 'smooth' }); closeCmd(); }
  });
});

/* ── CONTACT MODAL ───────────────────────────── */
const modal = document.getElementById('modal');
const mclose = document.getElementById('mclose');
const openModal = () => modal.classList.add('open');
const closeModal = () => modal.classList.remove('open');

document.querySelectorAll('.open-modal').forEach(el => el.addEventListener('click', openModal));
mclose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── SMOOTH ANCHOR SCROLL ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── LIVE CLOCK IN FOOTER ────────────────────── */
const clockEl = document.getElementById('live-clock');
if (clockEl) {
  const tick = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) + ' IST';
  };
  tick();
  setInterval(tick, 1000);
}
