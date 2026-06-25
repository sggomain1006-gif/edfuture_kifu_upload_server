/* ===========================
   INTERSECTION OBSERVER: REVEAL
=========================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.js-reveal').forEach((el) => revealObserver.observe(el));

/* ===========================
   EDFUTURE DOT MATRIX
   5×5 pixel font, exactly 100 dots total:
   E=17 d=13 F=13 u=12 t=11 u=12 r=7 e=15
=========================== */
(function renderEdFutureDots() {
  const svg = document.getElementById('fvDots');
  if (!svg) return;

  const FONT = {
    'E': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1]], // 17
    'd': [[0,0,0,1,1],[0,1,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1]], // 13
    'F': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0]], // 13
    'u': [[0,0,0,0,0],[1,1,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1]], // 12
    't': [[0,1,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,1,0]], // 11
    'r': [[0,0,0,0,0],[1,0,1,1,0],[1,1,0,0,0],[1,0,0,0,0],[1,0,0,0,0]], //  7
    'e': [[0,0,0,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,1,1,0,0],[0,1,1,1,1]], // 15
  };
  const FILLED = 38;
  const TEXT = 'EdFuture';
  const CHAR_W = 5;
  const GAP = 2;
  const UNIT = 10;
  const DOT_R = 4;
  const C_ON  = '#FFD83E';
  const C_OFF = 'rgba(255,255,255,0.2)';
  const NS = 'http://www.w3.org/2000/svg';

  let dotIdx = 0;
  TEXT.split('').forEach((ch, charIdx) => {
    const grid = FONT[ch];
    if (!grid) return;
    const xBase = charIdx * (CHAR_W + GAP);
    for (let row = 0; row < CHAR_W; row++) {
      for (let col = 0; col < CHAR_W; col++) {
        if (!grid[row][col]) continue;
        const cx = (xBase + col) * UNIT + UNIT / 2;
        const cy = row * UNIT + UNIT / 2;
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', DOT_R);
        circle.setAttribute('fill', dotIdx < FILLED ? C_ON : C_OFF);
        svg.appendChild(circle);
        dotIdx++;
      }
    }
  });
})();

/* ===========================
   FV BUTTON POSITIONING
=========================== */
(function positionFvBtn() {
  const btn = document.querySelector('.fv__btn');
  const progress = document.querySelector('.fv__progress');
  if (!btn || !progress) return;
  let frameId;
  const update = () => {
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(() => {
      btn.style.bottom = (progress.offsetHeight + 12) + 'px';
    });
  };
  window.addEventListener('load', update);
  window.addEventListener('resize', update);
})();

/* ===========================
   PROGRESS BAR ANIMATION
=========================== */
const CURRENT = 38;
const GOAL = 100;
const PERCENT = Math.round((CURRENT / GOAL) * 100);

const progressFill = document.getElementById('progressFill');
const progressRemain = document.getElementById('progressRemain');

const progressObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (progressFill) progressFill.style.width = PERCENT + '%';
        if (progressRemain) progressRemain.textContent = GOAL - CURRENT;
        progressObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

if (progressFill) progressObserver.observe(progressFill.closest('.fv__progress'));

/* ===========================
   FAQ ACCORDION
=========================== */
const faqItems = Array.from(document.querySelectorAll('.faq-item'));
faqItems.forEach((item) => {
  const btn = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');
  if (!btn || !answer) return;

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    faqItems.forEach((openItem) => {
      if (!openItem.classList.contains('is-open')) return;
      openItem.classList.remove('is-open');
      openItem.querySelector('.faq-a').style.maxHeight = '0';
      openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('is-open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});


/* ===========================
   CTA BUTTON FLOAT EFFECT
=========================== */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.fv__btn, .final-cta__btn, .mid-cta__btn').forEach((btn) => {
    let frameId;
    const handleMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        btn.style.transform = `translate(${x * 4}px, ${y * 4 - 3}px)`;
      });
    };
    const handleLeave = () => {
      cancelAnimationFrame(frameId);
      btn.style.transform = '';
    };
    btn.addEventListener('mousemove', handleMove);
    btn.addEventListener('mouseleave', handleLeave);
  });
}

/* ===========================
   SMOOTH ANCHOR SCROLL
=========================== */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===========================
   STORY LINE STAGGER
   (re-trigger if lines appear grouped)
=========================== */
const staggerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lines = entry.target.querySelectorAll('.story__line.js-reveal');
        lines.forEach((line, i) => {
          setTimeout(() => line.classList.add('is-visible'), i * 140);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.story__lines').forEach((block) => staggerObserver.observe(block));

/* ===========================
   CORE MEMBERS AUTO SLIDER
=========================== */
(function coreMembersSlider() {
  const track = document.querySelector('.core-members__track');
  if (!track) return;

  const originals = Array.from(track.children);
  const TOTAL = originals.length;
  if (TOTAL < 2) return;

  // DOM: [last_pre, 1, 2, 3, 4, 5, 1', 2', 3', 4', 5']
  // 1枚目を中央に置き、左右に前後のカードが少し見える状態から始める。
  track.insertBefore(originals[TOTAL - 1].cloneNode(true), track.firstChild);
  originals.forEach((card) => track.appendChild(card.cloneNode(true)));

  const PREPEND = 1;
  let current = PREPEND;
  let isAnimating = false;
  let isPaused = false;
  let timer;

  function getCenteredScroll(index) {
    const card = track.children[index];
    return card.offsetLeft - ((track.clientWidth - card.offsetWidth) / 2);
  }

  function scrollTo(index, smooth) {
    const pos = getCenteredScroll(index);
    if (smooth) {
      track.style.scrollBehavior = 'smooth';
      track.scrollLeft = pos;
    } else {
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = pos;
      void track.offsetWidth;
      track.style.scrollSnapType = '';
      track.style.scrollBehavior = '';
    }
  }

  function setInitialPosition() {
    scrollTo(current, false);
  }

  function next() {
    if (isAnimating || isPaused) return;
    isAnimating = true;
    current++;
    scrollTo(current, true);

    setTimeout(() => {
      if (current >= PREPEND + TOTAL) {
        current = PREPEND;
        scrollTo(current, false);
      }
      isAnimating = false;
    }, 420);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, 3000);
  }

  track.addEventListener('touchstart', () => { isPaused = true; clearInterval(timer); }, { passive: true });
  track.addEventListener('touchend', () => { isPaused = false; startTimer(); });
  window.addEventListener('resize', setInitialPosition);

  setInitialPosition();
  startTimer();
})();

/* ===========================
   VOICES AUTO SLIDER
=========================== */
(function voicesSlider() {
  const track = document.querySelector('.voices-track');
  if (!track) return;

  const originals = Array.from(track.children);
  const TOTAL = originals.length;
  if (TOTAL < 2) return;

  // DOM: [C_pre, A, B, C, A', B', C']
  // Aを中央に置き、左右にC/Bが少し見える状態から始める。
  track.insertBefore(originals[TOTAL - 1].cloneNode(true), track.firstChild);
  originals.forEach((card) => track.appendChild(card.cloneNode(true)));

  const PREPEND = 1;
  let current = PREPEND;

  let isAnimating = false;
  let isPaused = false;
  let timer;

  function getCenteredScroll(index) {
    const card = track.children[index];
    return card.offsetLeft - ((track.clientWidth - card.offsetWidth) / 2);
  }

  function scrollTo(index, smooth) {
    const pos = getCenteredScroll(index);
    if (smooth) {
      track.style.scrollBehavior = 'smooth';
      track.scrollLeft = pos;
    } else {
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = pos;
      void track.offsetWidth;
      track.style.scrollSnapType = '';
      track.style.scrollBehavior = '';
    }
  }

  function setInitialPosition() {
    scrollTo(current, false);
  }

  function next() {
    if (isAnimating || isPaused) return;
    isAnimating = true;
    current++;
    scrollTo(current, true);

    setTimeout(() => {
      if (current >= PREPEND + TOTAL) {
        current = PREPEND;
        scrollTo(current, false);
      }
      isAnimating = false;
    }, 420);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, 3500);
  }

  track.addEventListener('touchstart', () => { isPaused = true; clearInterval(timer); }, { passive: true });
  track.addEventListener('touchend', () => { isPaused = false; startTimer(); });
  window.addEventListener('resize', setInitialPosition);

  setInitialPosition();
  startTimer();
})();
