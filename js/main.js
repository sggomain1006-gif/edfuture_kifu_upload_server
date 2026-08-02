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
   LAZY VIDEO LOADING
   data-src の動画をビューポート接近時にのみ読み込む。
   display:none の動画（SP/PC出し分けの非表示側）は交差しないため
   読み込まれず、無駄な転送が発生しない。
=========================== */
const lazyVideos = document.querySelectorAll('video[data-src]');
if (lazyVideos.length > 0) {
  const loadVideo = (video) => {
    if (!video.dataset.src || video.src) return;
    video.src = video.dataset.src;
    video.removeAttribute('data-src');
    video.load();
    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    };
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }
  };

  const startObserving = () => {
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            loadVideo(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '600px 0px 600px 0px' }
      );
      lazyVideos.forEach((video) => videoObserver.observe(video));
    } else {
      lazyVideos.forEach(loadVideo);
    }
  };

  // FV画像・フォント等の初期リソースと帯域を奪い合わないよう、
  // 動画の読み込み開始は window load 後にする
  if (document.readyState === 'complete') {
    startObserving();
  } else {
    window.addEventListener('load', startObserving, { once: true });
  }
}

/* ===========================
   FV COUNT UP
=========================== */
const progressNum = document.getElementById('progressNum');
const progressRemain = document.getElementById('progressRemain');
if (progressNum) {
  const target = 97;
  const total = 100;
  const duration = 3000;
  if (progressRemain) progressRemain.textContent = total - target;
  let started = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  if (reduceMotion) {
    progressNum.textContent = target;
  } else {
    // HTML初期値は真値(97)＝JS無効環境向け。アニメーション時はカウントアップ開始前に0へ戻す
    // （deferスクリプトは初回描画前に実行されるため見た目のカウント演出は従来どおり）
    progressNum.textContent = '0';
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

  // モーション低減設定時は自動送りしない（手動スクロールは可能なまま）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const originals = Array.from(track.children);
  const total = originals.length;
  if (total < 2) return;

  const makeClone = (card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true'); // ループ用クローンをSRの二重読み上げ対象から外す
    return clone;
  };
  track.insertBefore(makeClone(originals[total - 1]), track.firstChild);
  originals.forEach((card) => track.appendChild(makeClone(card)));

  const prepend = 1;
  let current = prepend;
  let isAnimating = false;
  let isPaused = false;
  let timer;

  // PC(≥768px)の全幅カルーセルで、両端に出る見切れカードが常に50%以上見えるように
  // 左右対称のピーク(部分表示)量を算出する。カード幅・比率は一切変えない。
  // ピークは白余白ではなく前後カードの一部＝視覚的に「見切れ」だが50%以上を保証する。
  function getPeekInset() {
    const sample = track.children[prepend];
    const cardW = sample.offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const vw = track.clientWidth;
    // 中央に並べる「フル表示カード」の枚数nを、両端ピークがカード幅の50%以上に
    // なる最大値まで増やす（＝見切れを最小化しつつ50%未満のスライバーを防ぐ）。
    let n = 1;
    while ((vw - (n + 1) * cardW - (n + 2) * gap) / 2 >= cardW / 2) n++;
    let peek = (vw - n * cardW - (n + 1) * gap) / 2;
    if (peek < 0) peek = 0;
    return gap + peek; // カード左端をこの位置(x=inset)に置く＝左側にpeek分のカードが覗く
  }

  function getCenteredScroll(index) {
    const card = track.children[index];
    // PC: 全幅・1枚ずつ左送り。左右対称ピークで見切れ50%以上を担保。
    // SP(<768px): 従来どおりアクティブカードを中央寄せ（挙動は不変）。
    if (window.innerWidth >= 768) {
      return card.offsetLeft - getPeekInset();
    }
    return card.offsetLeft - ((track.clientWidth - card.offsetWidth) / 2);
  }

  function scrollTo(index, smooth) {
    if (smooth) {
      const pos = getCenteredScroll(index);
      track.style.scrollBehavior = 'smooth';
      track.scrollLeft = pos;
      return;
    }
    // 強制リフロー回避: void track.offsetWidth によるスタイル即時反映の
    // 強制読み取りをやめ、rAFでフレームをまたいで適用する（見た目は同一の瞬間ジャンプ）
    track.style.scrollSnapType = 'none';
    track.style.scrollBehavior = 'auto';
    requestAnimationFrame(() => {
      track.scrollLeft = getCenteredScroll(index);
      requestAnimationFrame(() => {
        track.style.scrollSnapType = '';
        track.style.scrollBehavior = '';
      });
    });
  }

  function setInitialPosition() {
    // 手動スワイプ時のスナップ基準(scroll-padding-left)もピーク量に合わせる。
    // PCのみ。SPは中央寄せなので未設定(既定に戻す)。
    track.style.scrollPaddingLeft = window.innerWidth >= 768 ? getPeekInset() + 'px' : '';
    scrollTo(current, false);
  }

  function next() {
    if (isAnimating || isPaused) return;
    isAnimating = true;
    current++;
    scrollTo(current, true);

    setTimeout(() => {
      // タッチ操作中はループ巻き戻しの瞬間ジャンプを保留（再開時にsyncToScrollで正規化される）
      if (!isPaused && current >= prepend + total) {
        current = prepend;
        scrollTo(current, false);
      }
      isAnimating = false;
    }, 420);
  }

  // 手動スワイプ後に実スクロール位置から現在インデックスを求め直す。
  // クローン領域にいる場合は等価な本体カードへ瞬間ジャンプして正規化する（見た目は同一）。
  function syncToScroll() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = prepend;
    let bestDist = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const card = track.children[i];
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < bestDist) { bestDist = dist; nearest = i; }
    }
    if (nearest < prepend) {
      nearest += total;
      scrollTo(nearest, false);
    } else if (nearest >= prepend + total) {
      nearest -= total;
      scrollTo(nearest, false);
    }
    current = nearest;
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, interval);
  }

  track.addEventListener('touchstart', () => { isPaused = true; clearInterval(timer); }, { passive: true });
  track.addEventListener('touchend', () => {
    syncToScroll();
    isPaused = false;
    startTimer();
  });
  window.addEventListener('resize', () => { if (!isPaused) setInitialPosition(); });

  setInitialPosition();
  startTimer();
})('.voices-track', 6000);
