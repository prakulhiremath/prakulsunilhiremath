/* =========================================================
   PRAKUL SUNIL HIREMATH — main.js
   ========================================================= */

/* ── CURSOR ─────────────────────────────────────────────── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
const lbl  = document.getElementById('cursor-label');

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  lbl.style.left  = mx + 'px';
  lbl.style.top   = my + 'px';
});

const lerpCursor = () => {
  rx += (mx - rx) * .1;
  ry += (my - ry) * .1;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(lerpCursor);
};
lerpCursor();

document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
  const label = el.dataset.cursor || '';
  el.addEventListener('mouseenter', () => {
    ring.classList.add('hover');
    if (label) { lbl.textContent = label; lbl.classList.add('show'); }
  });
  el.addEventListener('mouseleave', () => {
    ring.classList.remove('hover');
    lbl.classList.remove('show');
  });
});

/* ── STARFIELD CANVAS ────────────────────────────────────── */
const canvas = document.getElementById('starfield');
const ctx    = canvas.getContext('2d');
let stars    = [];
let W, H;

const resize = () => {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.2 + .2,
    a: Math.random(),
    speed: Math.random() * .3 + .05,
    drift: (Math.random() - .5) * .1,
  }));
};
resize();
window.addEventListener('resize', resize);

const drawStars = () => {
  ctx.clearRect(0, 0, W, H);
  const scroll = window.scrollY * .02;
  stars.forEach(s => {
    s.y -= s.speed;
    s.x += s.drift;
    s.a = .3 + .7 * (Math.sin(Date.now() * .001 + s.r * 10) * .5 + .5);
    if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
    if (s.x < 0)  s.x = W;
    if (s.x > W)  s.x = 0;
    ctx.beginPath();
    ctx.arc(s.x, s.y - scroll % H, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,169,110,${s.a * .5})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
};
drawStars();

/* ── NAV SCROLL ──────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('solid', window.scrollY > 48);
});

/* ── REVEAL ON SCROLL ────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: .08 });
revealEls.forEach(el => revObs.observe(el));

/* ── TYPEWRITER ──────────────────────────────────────────── */
const lines = [
  'AI / ML Researcher at VTU Belagavi',
  'Deep Learning  ·  Astrophysics  ·  RLHF',
  '3 ICML 2026 Submissions · ₹18L+ Grants',
  'Founder, Aliens on Earth (AoE)',
  'State-Level Debater · Open Source Summit',
];
let li = 0, ci = 0, deleting = false;
const tw = document.getElementById('typewriter-text');

const type = () => {
  const current = lines[li];
  if (!deleting) {
    tw.textContent = current.slice(0, ++ci);
    if (ci === current.length) {
      deleting = true;
      setTimeout(type, 2200);
      return;
    }
    setTimeout(type, 42);
  } else {
    tw.textContent = current.slice(0, --ci);
    if (ci === 0) {
      deleting = false;
      li = (li + 1) % lines.length;
    }
    setTimeout(type, 22);
  }
};
setTimeout(type, 1600);

/* ── COUNT-UP NUMBERS ────────────────────────────────────── */
const countEls = document.querySelectorAll('[data-count]');
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const end = el.dataset.count;
    const num = parseFloat(end);
    const isRupee = end.startsWith('₹');
    const suffix  = end.replace(/[₹\d.]/g, '');
    const prefix  = isRupee ? '₹' : '';
    const dur = 1400;
    const step = 16;
    const inc  = num / (dur / step);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + inc, num);
      el.textContent = prefix + (Number.isInteger(num) ? Math.round(cur) : cur.toFixed(1)) + suffix;
      if (cur >= num) clearInterval(timer);
    }, step);
    countObs.unobserve(el);
  });
}, { threshold: .5 });
countEls.forEach(el => countObs.observe(el));

/* ── MAGNETIC HERO NAME ──────────────────────────────────── */
const heroName = document.getElementById('hero-name');
if (heroName) {
  document.addEventListener('mousemove', e => {
    const rect = heroName.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    heroName.style.transform = `translate(${dx * 12}px, ${dy * 6}px)`;
  });
}

/* ── SMOOTH SECTION FADE ON ANCHOR CLICK ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
