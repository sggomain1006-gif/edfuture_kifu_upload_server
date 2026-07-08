/* ===========================
   INTERSECTION OBSERVER: REVEAL
=========================== */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.js-reveal').forEach((el) => revealObserver.observe(el));

/* ===========================
   FV COUNT UP
=========================== */
const progressNum = document.getElementById('progressNum');
if (progressNum) {
  const target = 38;
  const duration = 3000;
  let started = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  if (reduceMotion) {
    progressNum.textContent = target;
  }

  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || started || reduceMotion) return;
        started = true;
        const startTime = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = easeOutCubic(progress);
          progressNum.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  if (!reduceMotion) countObserver.observe(progressNum);
}

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
      const openAnswer = openItem.querySelector('.faq-a');
      const openButton = openItem.querySelector('.faq-q');
      if (openAnswer) openAnswer.style.maxHeight = '0';
      if (openButton) openButton.setAttribute('aria-expanded', 'false');
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
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
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
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const lines = entry.target.querySelectorAll('.story__line.js-reveal');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('is-visible'), i * 140);
      });
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.story__lines').forEach((block) => staggerObserver.observe(block));

/* ===========================
   AUTO SLIDERS
=========================== */
(function createAutoSlider(selector, interval) {
  const track = document.querySelector(selector);
  if (!track) return;

  const originals = Array.from(track.children);
  const total = originals.length;
  if (total < 2) return;

  track.insertBefore(originals[total - 1].cloneNode(true), track.firstChild);
  originals.forEach((card) => track.appendChild(card.cloneNode(true)));

  const prepend = 1;
  let current = prepend;
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
      if (current >= prepend + total) {
        current = prepend;
        scrollTo(current, false);
      }
      isAnimating = false;
    }, 420);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, interval);
  }

  track.addEventListener('touchstart', () => { isPaused = true; clearInterval(timer); }, { passive: true });
  track.addEventListener('touchend', () => { isPaused = false; startTimer(); });
  window.addEventListener('resize', setInitialPosition);

  setInitialPosition();
  startTimer();
})('.voices-track', 6000);
