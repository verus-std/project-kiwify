const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');
const faqItems = document.querySelectorAll('.faq-item');
const videoCards = document.querySelectorAll('.video-card');
const counters = document.querySelectorAll('[data-counter]');
const heroVideo = document.querySelector('.hero-video');
const premiumScene = document.querySelector('[data-scroll-video]');
const premiumVideo = premiumScene?.querySelector('.premium-scroll-video');
const premiumCopy = premiumScene?.querySelector('.premium-scroll-copy');
let smoothScroll = null;

function playHeroVideo() {
  if (!heroVideo) return;
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  const playAttempt = heroVideo.play();
  playAttempt?.catch(() => {});
}

if (heroVideo?.readyState >= 2) {
  playHeroVideo();
} else {
  heroVideo?.addEventListener('loadeddata', playHeroVideo, { once: true });
}

window.addEventListener('pageshow', playHeroVideo);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) playHeroVideo();
});

function closeMenu() {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menu');
  navigation?.classList.remove('is-open');
  header?.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
  smoothScroll?.start();
}

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  navigation?.classList.toggle('is-open', !open);
  header?.classList.toggle('menu-active', !open);
  document.body.classList.toggle('menu-open', !open);
  if (!open) smoothScroll?.stop();
  else smoothScroll?.start();
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
});

let headerIsFloating = window.scrollY > 56;

function updateHeader() {
  if (window.scrollY > 56) headerIsFloating = true;
  if (window.scrollY < 12) headerIsFloating = false;
  header?.classList.toggle('is-scrolled', headerIsFloating);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

faqItems.forEach((item) => {
  const button = item.querySelector('button');

  button?.addEventListener('click', () => {
    const willOpen = !item.classList.contains('is-open');

    faqItems.forEach((otherItem) => {
      otherItem.classList.remove('is-open');
      otherItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
    });

    if (willOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

videoCards.forEach((card) => {
  card.addEventListener('click', () => {
    const play = card.querySelector('.play');
    if (!play) return;

    const original = play.textContent;
    play.textContent = '✓';
    card.setAttribute('aria-label', 'Depoimento selecionado');

    window.setTimeout(() => {
      play.textContent = original;
      card.setAttribute('aria-label', 'Assistir depoimento de cliente');
    }, 1400);
  });
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('in-view'));
}

const numberFormatter = new Intl.NumberFormat('pt-BR');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBlurElements = document.querySelectorAll('[data-scroll-blur]');
const floatPills = document.querySelectorAll('.float-pill');
const transformationInner = document.querySelector('.transformation-inner');
const transformationSection = document.querySelector('.transformation-section');

smoothScroll = !reduceMotion && window.Lenis
  ? new window.Lenis({
    autoRaf: true,
    smoothWheel: true,
    syncTouch: false,
    lerp: .085,
    wheelMultiplier: .9,
    anchors: true,
  })
  : null;

if (!reduceMotion && scrollBlurElements.length) {
  document.documentElement.classList.add('has-scroll-effects');

  let blurAnimationFrame = 0;

  const clampUnit = (value) => Math.min(Math.max(value, 0), 1);

  function updateScrollBlur() {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    scrollBlurElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + (rect.height / 2);
      const focusRange = Math.max(viewportHeight * .68, rect.height * .7);
      const distance = elementCenter - viewportCenter;
      const rawFocus = 1 - clampUnit(Math.abs(distance) / focusRange);
      const focus = rawFocus * rawFocus * (3 - (2 * rawFocus));
      const shift = Math.max(-36, Math.min(36, (distance / focusRange) * 36));

      element.style.setProperty('--scroll-focus', focus.toFixed(4));
      element.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`);
    });

    blurAnimationFrame = 0;
  }

  function requestScrollBlurUpdate() {
    if (blurAnimationFrame) return;
    blurAnimationFrame = requestAnimationFrame(updateScrollBlur);
  }

  if (smoothScroll) smoothScroll.on('scroll', requestScrollBlurUpdate);
  else window.addEventListener('scroll', requestScrollBlurUpdate, { passive: true });

  window.addEventListener('resize', requestScrollBlurUpdate);
  window.addEventListener('pageshow', requestScrollBlurUpdate);
  requestScrollBlurUpdate();
}

const pillReactionTimers = new WeakMap();

floatPills.forEach((pill, pillIndex) => {
  pill.addEventListener('click', (event) => {
    if (pill.dataset.dragged === 'true') {
      event.preventDefault();
      pill.dataset.dragged = 'false';
      return;
    }

    const previousTimer = pillReactionTimers.get(pill);
    if (previousTimer) window.clearTimeout(previousTimer);

    pill.querySelectorAll('.pill-particle').forEach((particle) => particle.remove());
    pill.classList.remove('is-reacting');
    transformationInner?.classList.remove('is-energized');

    void pill.offsetWidth;

    pill.classList.add('is-reacting');
    transformationInner?.classList.add('is-energized');

    if (!reduceMotion) {
      const particleCount = 9;

      for (let index = 0; index < particleCount; index += 1) {
        const particle = document.createElement('i');
        const angle = ((Math.PI * 2) / particleCount) * index + (pillIndex * .31);
        const distance = 42 + ((index % 3) * 11);

        particle.className = 'pill-particle';
        particle.setAttribute('aria-hidden', 'true');
        particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
        particle.style.setProperty('--particle-size', `${4 + (index % 3)}px`);
        pill.appendChild(particle);
      }
    }

    const timer = window.setTimeout(() => {
      pill.classList.remove('is-reacting');
      transformationInner?.classList.remove('is-energized');
      pill.querySelectorAll('.pill-particle').forEach((particle) => particle.remove());
      pillReactionTimers.delete(pill);
    }, 780);

    pillReactionTimers.set(pill, timer);
  });
});

const pillPhysicsStates = new Map(
  [...floatPills].map((pill) => [pill, {
    pill,
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    dragging: false,
    pointerId: null,
    pointerStartX: 0,
    pointerStartY: 0,
    positionStartX: 0,
    positionStartY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,
    moved: false,
    pushTimer: 0,
  }]),
);

let pillPhysicsFrame = 0;
let pillPhysicsPreviousTime = 0;

function applyPillPosition(state) {
  state.pill.style.setProperty('--physics-x', `${state.x.toFixed(2)}px`);
  state.pill.style.setProperty('--physics-y', `${state.y.toFixed(2)}px`);
}

function keepPillInsideSection(state) {
  if (!transformationSection) return;

  applyPillPosition(state);

  const sectionBounds = transformationSection.getBoundingClientRect();
  const pillBounds = state.pill.getBoundingClientRect();
  const edgeGap = 14;
  let correctionX = 0;
  let correctionY = 0;

  if (pillBounds.left < sectionBounds.left + edgeGap) {
    correctionX = (sectionBounds.left + edgeGap) - pillBounds.left;
  } else if (pillBounds.right > sectionBounds.right - edgeGap) {
    correctionX = (sectionBounds.right - edgeGap) - pillBounds.right;
  }

  if (pillBounds.top < sectionBounds.top + edgeGap) {
    correctionY = (sectionBounds.top + edgeGap) - pillBounds.top;
  } else if (pillBounds.bottom > sectionBounds.bottom - edgeGap) {
    correctionY = (sectionBounds.bottom - edgeGap) - pillBounds.bottom;
  }

  if (correctionX) {
    state.x += correctionX;
    state.velocityX *= -.28;
  }

  if (correctionY) {
    state.y += correctionY;
    state.velocityY *= -.28;
  }

  if (correctionX || correctionY) applyPillPosition(state);
}

function markPillAsPushed(state) {
  window.clearTimeout(state.pushTimer);
  state.pill.classList.add('is-pushed');
  state.pushTimer = window.setTimeout(() => {
    state.pill.classList.remove('is-pushed');
  }, 190);
}

function resolvePillCollisions() {
  const states = [...pillPhysicsStates.values()];

  for (let pass = 0; pass < 3; pass += 1) {
    for (let firstIndex = 0; firstIndex < states.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < states.length; secondIndex += 1) {
        const first = states[firstIndex];
        const second = states[secondIndex];
        const firstBounds = first.pill.getBoundingClientRect();
        const secondBounds = second.pill.getBoundingClientRect();
        const overlapX = Math.min(firstBounds.right, secondBounds.right)
          - Math.max(firstBounds.left, secondBounds.left);
        const overlapY = Math.min(firstBounds.bottom, secondBounds.bottom)
          - Math.max(firstBounds.top, secondBounds.top);

        if (overlapX <= 0 || overlapY <= 0) continue;

        const firstCenterX = firstBounds.left + (firstBounds.width / 2);
        const firstCenterY = firstBounds.top + (firstBounds.height / 2);
        const secondCenterX = secondBounds.left + (secondBounds.width / 2);
        const secondCenterY = secondBounds.top + (secondBounds.height / 2);
        const firstIsAnchor = first.dragging;
        const secondIsAnchor = second.dragging;
        const collisionGap = 7;

        if (overlapX < overlapY) {
          const direction = secondCenterX >= firstCenterX ? 1 : -1;
          const separation = overlapX + collisionGap;
          const impact = Math.min(18, 3 + Math.abs(first.velocityX - second.velocityX) * .72);

          if (firstIsAnchor && !secondIsAnchor) {
            second.x += direction * separation;
            second.velocityX += direction * impact;
            markPillAsPushed(second);
          } else if (secondIsAnchor && !firstIsAnchor) {
            first.x -= direction * separation;
            first.velocityX -= direction * impact;
            markPillAsPushed(first);
          } else if (!firstIsAnchor && !secondIsAnchor) {
            first.x -= direction * separation * .5;
            second.x += direction * separation * .5;
            first.velocityX -= direction * impact * .5;
            second.velocityX += direction * impact * .5;
            markPillAsPushed(first);
            markPillAsPushed(second);
          }
        } else {
          const direction = secondCenterY >= firstCenterY ? 1 : -1;
          const separation = overlapY + collisionGap;
          const impact = Math.min(18, 3 + Math.abs(first.velocityY - second.velocityY) * .72);

          if (firstIsAnchor && !secondIsAnchor) {
            second.y += direction * separation;
            second.velocityY += direction * impact;
            markPillAsPushed(second);
          } else if (secondIsAnchor && !firstIsAnchor) {
            first.y -= direction * separation;
            first.velocityY -= direction * impact;
            markPillAsPushed(first);
          } else if (!firstIsAnchor && !secondIsAnchor) {
            first.y -= direction * separation * .5;
            second.y += direction * separation * .5;
            first.velocityY -= direction * impact * .5;
            second.velocityY += direction * impact * .5;
            markPillAsPushed(first);
            markPillAsPushed(second);
          }
        }

        applyPillPosition(first);
        applyPillPosition(second);
        keepPillInsideSection(first);
        keepPillInsideSection(second);
      }
    }
  }
}

function runPillPhysics(currentTime) {
  const elapsed = pillPhysicsPreviousTime
    ? Math.min((currentTime - pillPhysicsPreviousTime) / 16.67, 2)
    : 1;
  const springStrength = .019;
  const damping = Math.pow(.855, elapsed);
  let isActive = false;

  pillPhysicsPreviousTime = currentTime;

  pillPhysicsStates.forEach((state) => {
    if (state.dragging) {
      isActive = true;
      return;
    }

    state.velocityX += -state.x * springStrength * elapsed;
    state.velocityY += -state.y * springStrength * elapsed;
    state.velocityX *= damping;
    state.velocityY *= damping;
    state.x += state.velocityX * elapsed;
    state.y += state.velocityY * elapsed;

    const hasSettled = Math.abs(state.x) < .12
      && Math.abs(state.y) < .12
      && Math.abs(state.velocityX) < .08
      && Math.abs(state.velocityY) < .08;

    if (hasSettled) {
      state.x = 0;
      state.y = 0;
      state.velocityX = 0;
      state.velocityY = 0;
    } else {
      isActive = true;
    }

    applyPillPosition(state);
    keepPillInsideSection(state);
  });

  resolvePillCollisions();

  if (isActive) {
    pillPhysicsFrame = requestAnimationFrame(runPillPhysics);
  } else {
    pillPhysicsFrame = 0;
    pillPhysicsPreviousTime = 0;
  }
}

function startPillPhysics() {
  if (pillPhysicsFrame) return;
  pillPhysicsPreviousTime = 0;
  pillPhysicsFrame = requestAnimationFrame(runPillPhysics);
}

function finishPillDrag(state, event) {
  if (!state.dragging || (event.pointerId !== undefined && event.pointerId !== state.pointerId)) return;

  state.dragging = false;
  state.pill.classList.remove('is-dragging');

  if (state.pill.hasPointerCapture?.(state.pointerId)) {
    state.pill.releasePointerCapture(state.pointerId);
  }

  state.pointerId = null;

  if (state.moved) {
    state.pill.dataset.dragged = 'true';
    window.setTimeout(() => {
      if (state.pill.dataset.dragged === 'true') state.pill.dataset.dragged = 'false';
    }, 0);
  }

  if (reduceMotion) {
    state.x = 0;
    state.y = 0;
    state.velocityX = 0;
    state.velocityY = 0;
    applyPillPosition(state);
  } else {
    startPillPhysics();
  }
}

pillPhysicsStates.forEach((state) => {
  const { pill } = state;

  pill.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const now = performance.now();

    state.dragging = true;
    state.pointerId = event.pointerId;
    state.pointerStartX = event.clientX;
    state.pointerStartY = event.clientY;
    state.positionStartX = state.x;
    state.positionStartY = state.y;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerTime = now;
    state.velocityX = 0;
    state.velocityY = 0;
    state.moved = false;
    pill.dataset.dragged = 'false';
    pill.classList.add('is-dragging');
    pill.setPointerCapture?.(event.pointerId);
    startPillPhysics();
  });

  pill.addEventListener('pointermove', (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    const now = performance.now();
    const elapsed = Math.max(now - state.lastPointerTime, 8);
    const totalX = event.clientX - state.pointerStartX;
    const totalY = event.clientY - state.pointerStartY;

    state.x = state.positionStartX + totalX;
    state.y = state.positionStartY + totalY;
    state.velocityX = Math.max(-24, Math.min(24, ((event.clientX - state.lastPointerX) / elapsed) * 16.67));
    state.velocityY = Math.max(-24, Math.min(24, ((event.clientY - state.lastPointerY) / elapsed) * 16.67));
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerTime = now;
    state.moved ||= Math.hypot(totalX, totalY) > 5;

    applyPillPosition(state);
    keepPillInsideSection(state);
    resolvePillCollisions();
    event.preventDefault();
  });

  pill.addEventListener('pointerup', (event) => finishPillDrag(state, event));
  pill.addEventListener('pointercancel', (event) => finishPillDrag(state, event));
  pill.addEventListener('lostpointercapture', (event) => finishPillDrag(state, event));
});

window.addEventListener('resize', () => {
  pillPhysicsStates.forEach((state) => {
    if (state.dragging) return;
    state.x = 0;
    state.y = 0;
    state.velocityX = 0;
    state.velocityY = 0;
    applyPillPosition(state);
  });
}, { passive: true });

function waitForVideoState(video, eventName, timeout = 5000) {
  if (eventName === 'loadeddata' && video.readyState >= 2) return Promise.resolve();
  if (eventName === 'loadedmetadata' && video.readyState >= 1) return Promise.resolve();

  return Promise.race([
    new Promise((resolve) => video.addEventListener(eventName, resolve, { once: true })),
    new Promise((resolve) => window.setTimeout(resolve, timeout)),
  ]);
}

async function ensurePremiumVideoSeekable() {
  await waitForVideoState(premiumVideo, 'loadeddata');

  const lastSeekableRange = premiumVideo.seekable.length - 1;
  const hasSeekableFrames = lastSeekableRange >= 0
    && premiumVideo.seekable.end(lastSeekableRange) > .05;

  if (hasSeekableFrames || premiumVideo.currentSrc.startsWith('blob:')) return;

  try {
    const response = await fetch(premiumVideo.currentSrc, { cache: 'force-cache' });
    if (!response.ok) return;

    const blobUrl = URL.createObjectURL(await response.blob());
    premiumVideo.src = blobUrl;
    premiumVideo.load();
    await waitForVideoState(premiumVideo, 'loadedmetadata');

    window.addEventListener('pagehide', () => URL.revokeObjectURL(blobUrl), { once: true });
  } catch {
    // Em hospedagens com suporte a byte ranges, o vídeo já é buscável sem fallback.
  }
}

async function setupPremiumScrollVideo() {
  if (!premiumScene || !premiumVideo || !premiumCopy) return;

  await ensurePremiumVideoSeekable();
  premiumScene.classList.add('is-scroll-ready');
  premiumVideo.pause();

  if (reduceMotion) {
    const showFinalFrame = () => {
      if (Number.isFinite(premiumVideo.duration)) {
        premiumVideo.currentTime = Math.max(0, premiumVideo.duration - .05);
      }
    };

    premiumCopy.style.opacity = '1';
    premiumCopy.style.pointerEvents = 'auto';
    premiumCopy.style.transform = 'none';
    premiumCopy.inert = false;

    if (premiumVideo.readyState >= 1) showFinalFrame();
    else premiumVideo.addEventListener('loadedmetadata', showFinalFrame, { once: true });
    return;
  }

  let targetProgress = 0;
  let renderedProgress = 0;
  let animationFrame = 0;
  let previousTime = 0;

  premiumCopy.inert = true;

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  function readScrollProgress() {
    const rect = premiumScene.getBoundingClientRect();
    const scrollDistance = Math.max(1, premiumScene.offsetHeight - window.innerHeight);
    const isCompactViewport = window.matchMedia('(max-width: 760px)').matches;
    const earlyStart = window.innerHeight * (isCompactViewport ? .72 : .65);
    const earlyEnd = window.innerHeight * (isCompactViewport ? .14 : .22);
    const activeDistance = Math.max(
      window.innerHeight,
      scrollDistance - earlyEnd + earlyStart,
    );

    targetProgress = clamp((earlyStart - rect.top) / activeDistance);

    if (!animationFrame) {
      previousTime = 0;
      animationFrame = requestAnimationFrame(renderFrame);
    }
  }

  function renderFrame(now) {
    const elapsed = previousTime ? Math.min(now - previousTime, 40) : 16;
    const smoothing = 1 - Math.exp(-elapsed / 155);
    previousTime = now;
    renderedProgress += (targetProgress - renderedProgress) * smoothing;

    if (Math.abs(targetProgress - renderedProgress) < .0005) {
      renderedProgress = targetProgress;
    }

    if (premiumVideo.readyState >= 1 && Number.isFinite(premiumVideo.duration)) {
      const lastFrameOffset = 1 / 24;
      const targetTime = renderedProgress * Math.max(0, premiumVideo.duration - lastFrameOffset);

      if (Math.abs(premiumVideo.currentTime - targetTime) > 1 / 48) {
        premiumVideo.currentTime = targetTime;
      }
    }

    const copyProgress = clamp((renderedProgress - .46) / .17);
    premiumCopy.style.opacity = copyProgress.toFixed(3);
    premiumCopy.style.pointerEvents = copyProgress > .85 ? 'auto' : 'none';
    premiumCopy.style.transform = `translateY(${((1 - copyProgress) * 28).toFixed(2)}px)`;
    premiumCopy.inert = copyProgress <= .85;

    if (renderedProgress !== targetProgress) {
      animationFrame = requestAnimationFrame(renderFrame);
    } else {
      animationFrame = 0;
    }
  }

  premiumVideo.addEventListener('loadedmetadata', readScrollProgress, { once: true });
  window.addEventListener('scroll', readScrollProgress, { passive: true });
  window.addEventListener('resize', readScrollProgress);
  window.addEventListener('pageshow', readScrollProgress);
  readScrollProgress();
}

setupPremiumScrollVideo();

function setCounterValue(counter, value) {
  counter.textContent = numberFormatter.format(value);
}

function animateCounter(counter) {
  if (counter.dataset.animated === 'true') return;
  counter.dataset.animated = 'true';

  const target = Number(counter.dataset.counter);
  const duration = 2200;
  const startedAt = performance.now();

  function updateCount(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 4);
    setCounterValue(counter, Math.round(target * easedProgress));

    if (progress < 1) requestAnimationFrame(updateCount);
  }

  requestAnimationFrame(updateCount);
}

if (reduceMotion || !('IntersectionObserver' in window)) {
  counters.forEach((counter) => setCounterValue(counter, Number(counter.dataset.counter)));
} else {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: .4 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

document.querySelector('#year').textContent = new Date().getFullYear();
