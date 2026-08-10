/* =========================================================
   Kiwify — Landing Page v3
   ---------------------------------------------------------
   1.  Setup / Lenis          7.  Cards empilháveis
   2.  Vídeo do hero          8.  Física das pílulas
   3.  Topbar / menu / spy    9.  Vídeo com scrub
   4.  FAQ                    10. Contador
   5.  Lightbox
   6.  Dock + progresso + reveal + blur
   ========================================================= */

/* ---------------------------------------------------------
   1. SETUP
   --------------------------------------------------------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nf = new Intl.NumberFormat('pt-BR');
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const topbar = document.querySelector('[data-topbar]');
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
const navAnchors = document.querySelectorAll('.nav a');
const spyLinks = document.querySelectorAll('[data-nav]');
const qaItems = document.querySelectorAll('.qa');
const counters = document.querySelectorAll('[data-counter]');
const heroVideo = document.querySelector('.hero-media');
const scene = document.querySelector('[data-scroll-video]');
const sceneVideo = scene?.querySelector('.scene-video');
const sceneFrame = scene?.querySelector('.scene-frame');
const sceneCopy = scene?.querySelector('.scene-copy');
const progressBar = document.querySelector('[data-progress]');
const dock = document.querySelector('[data-dock]');
const hero = document.querySelector('.hero');
const pricing = document.querySelector('#taxas');
const sceneMobileQuery = window.matchMedia('(max-width: 760px)');
const notebookFrameCount = 48;
const notebookFrames = [];
let notebookFramesQueued = false;

function notebookFrameSource(index) {
  return `assets/notebook-frames/frame-${String(index + 1).padStart(3, '0')}.jpg`;
}

function preloadNotebookFrames() {
  if (notebookFramesQueued || !sceneFrame || !sceneMobileQuery.matches) return;
  notebookFramesQueued = true;

  const load = () => {
    for (let index = 0; index < notebookFrameCount; index += 1) {
      const image = new Image();
      image.decoding = 'async';
      image.src = notebookFrameSource(index);
      notebookFrames[index] = image;
    }
  };

  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1200 });
  else window.setTimeout(load, 120);
}

const lenis = !reduceMotion && window.Lenis
  ? new window.Lenis({
    autoRaf: true,
    smoothWheel: true,
    syncTouch: false,
    lerp: .085,
    wheelMultiplier: .9,
    anchors: true,
  })
  : null;

/* Um único laço de scroll alimenta progresso, cards e blur. */
const scrollTasks = [];
let scrollFrame = 0;

function runScrollTasks() {
  scrollTasks.forEach((task) => task());
  scrollFrame = 0;
}

function requestScrollTasks() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(runScrollTasks);
}

if (lenis) lenis.on('scroll', requestScrollTasks);
else window.addEventListener('scroll', requestScrollTasks, { passive: true });

window.addEventListener('resize', requestScrollTasks);
window.addEventListener('pageshow', requestScrollTasks);

/* ---------------------------------------------------------
   2. VÍDEO DO HERO
   --------------------------------------------------------- */
function playHero() {
  if (!heroVideo) return;
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.play()?.catch(() => {});
}

if (heroVideo?.readyState >= 2) playHero();
else heroVideo?.addEventListener('loadeddata', playHero, { once: true });

window.addEventListener('pageshow', playHero);
document.addEventListener('visibilitychange', () => { if (!document.hidden) playHero(); });

/* ---------------------------------------------------------
   3. TOPBAR / MENU / SCROLL-SPY
   --------------------------------------------------------- */
function closeNav() {
  burger?.setAttribute('aria-expanded', 'false');
  burger?.setAttribute('aria-label', 'Abrir menu');
  nav?.classList.remove('is-open');
  topbar?.classList.remove('is-menu-open');
  document.body.classList.remove('nav-open');
  lenis?.start();
}

burger?.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  burger.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  nav?.classList.toggle('is-open', !open);
  topbar?.classList.toggle('is-menu-open', !open);
  document.body.classList.toggle('nav-open', !open);
  if (open) lenis?.start();
  else lenis?.stop();
});

navAnchors.forEach((link) => link.addEventListener('click', closeNav));
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeNav(); });

scrollTasks.push(() => {
  topbar?.classList.toggle('is-stuck', window.scrollY > 24);

  if (progressBar) {
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    progressBar.style.setProperty('--p', clamp(window.scrollY / max).toFixed(4));
  }
});

/* Marca a seção visível no menu. */
const spyGroups = new Map();

spyLinks.forEach((link) => {
  const id = link.getAttribute('href')?.slice(1);
  const section = id ? document.getElementById(id) : null;
  if (!section) return;
  if (!spyGroups.has(section)) spyGroups.set(section, []);
  spyGroups.get(section).push(link);
});

if (spyGroups.size && 'IntersectionObserver' in window) {
  const visible = new Set();
  const sections = [...spyGroups.keys()];

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });

    const current = sections.find((section) => visible.has(section));

    spyLinks.forEach((link) => link.removeAttribute('aria-current'));
    spyGroups.get(current)?.forEach((link) => link.setAttribute('aria-current', 'true'));
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => spy.observe(section));
}

/* ---------------------------------------------------------
   4. FAQ
   --------------------------------------------------------- */
qaItems.forEach((item) => {
  const button = item.querySelector('button');

  button?.addEventListener('click', () => {
    const willOpen = !item.classList.contains('is-open');

    qaItems.forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('button')?.setAttribute('aria-expanded', 'false');
    });

    if (willOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---------------------------------------------------------
   5. LIGHTBOX
   --------------------------------------------------------- */
const lightbox = document.querySelector('[data-lightbox-dialog]');
const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
const lightboxCaption = lightbox?.querySelector('[data-lightbox-caption]');
let lastTrigger = null;

document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (!lightbox?.showModal || !lightboxImage) return;

    lightboxImage.src = trigger.dataset.lightbox;
    lightboxImage.alt = trigger.querySelector('img')?.alt ?? '';
    if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.caption ?? '';

    lastTrigger = trigger;
    document.body.classList.add('dialog-open');
    lenis?.stop();
    lightbox.showModal();
  });
});

lightbox?.querySelector('[data-lightbox-close]')
  ?.addEventListener('click', () => lightbox.close());

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

lightbox?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  lenis?.start();
  if (lightboxImage) lightboxImage.src = '';
  lastTrigger?.focus();
  lastTrigger = null;
});

/* ---------------------------------------------------------
   6. DOCK / REVEAL / BLUR
   --------------------------------------------------------- */
if (dock && hero && 'IntersectionObserver' in window) {
  let pastHero = false;
  let atPricing = false;

  const sync = () => {
    const show = pastHero && !atPricing;
    dock.hidden = !show;
    requestAnimationFrame(() => dock.classList.toggle('is-on', show));
  };

  new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
  if (pricing) new IntersectionObserver(([entry]) => { atPricing = entry.isIntersecting; sync(); }, { threshold: 0 }).observe(pricing);
}

const revealItems = document.querySelectorAll('[data-reveal]');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-in'));
}

const blurItems = document.querySelectorAll('[data-scroll-blur]');

if (!reduceMotion && blurItems.length) {
  document.documentElement.classList.add('has-scroll-effects');

  scrollTasks.push(() => {
    const viewport = window.innerHeight;
    const center = viewport / 2;

    blurItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + (rect.height / 2);
      const range = Math.max(viewport * .68, rect.height * .7);
      const distance = itemCenter - center;
      const raw = 1 - clamp(Math.abs(distance) / range);

      item.style.setProperty('--focus', (raw * raw * (3 - (2 * raw))).toFixed(4));
      item.style.setProperty('--shift', `${Math.max(-34, Math.min(34, (distance / range) * 34)).toFixed(2)}px`);
    });
  });
}

/* ---------------------------------------------------------
   7. CARDS EMPILHÁVEIS
   --------------------------------------------------------- */
const stackCards = [...document.querySelectorAll('[data-stack-card]')];

if (stackCards.length && !reduceMotion) {
  scrollTasks.push(() => {
    stackCards.forEach((card, index) => {
      const next = stackCards[index + 1];

      if (!next) {
        card.style.setProperty('--covered', '0');
        return;
      }

      const rect = card.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      /* quanto do card já foi coberto pelo próximo */
      const covered = clamp((rect.bottom - nextRect.top) / Math.max(1, rect.height));

      card.style.setProperty('--covered', covered.toFixed(4));
    });
  });
}

/* ---------------------------------------------------------
   8. FÍSICA DAS PÍLULAS
   --------------------------------------------------------- */
const pills = document.querySelectorAll('.pill');
const statementInner = document.querySelector('.statement-inner');
const statementSection = document.querySelector('.statement');
const reactionTimers = new WeakMap();

pills.forEach((pill, pillIndex) => {
  pill.addEventListener('click', (event) => {
    if (pill.dataset.dragged === 'true') {
      event.preventDefault();
      pill.dataset.dragged = 'false';
      return;
    }

    const previous = reactionTimers.get(pill);
    if (previous) window.clearTimeout(previous);

    pill.querySelectorAll('.particle').forEach((particle) => particle.remove());
    pill.classList.remove('is-reacting');
    statementInner?.classList.remove('is-energized');

    void pill.offsetWidth;

    pill.classList.add('is-reacting');
    statementInner?.classList.add('is-energized');

    if (!reduceMotion) {
      const total = 9;

      for (let index = 0; index < total; index += 1) {
        const particle = document.createElement('i');
        const angle = ((Math.PI * 2) / total) * index + (pillIndex * .31);
        const distance = 42 + ((index % 3) * 11);

        particle.className = 'particle';
        particle.setAttribute('aria-hidden', 'true');
        particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        particle.style.setProperty('--size', `${4 + (index % 3)}px`);
        pill.appendChild(particle);
      }
    }

    reactionTimers.set(pill, window.setTimeout(() => {
      pill.classList.remove('is-reacting');
      statementInner?.classList.remove('is-energized');
      pill.querySelectorAll('.particle').forEach((particle) => particle.remove());
      reactionTimers.delete(pill);
    }, 780));
  });
});

const pillStates = new Map([...pills].map((pill) => [pill, {
  pill,
  x: 0, y: 0, vx: 0, vy: 0,
  dragging: false,
  pointerId: null,
  startX: 0, startY: 0,
  originX: 0, originY: 0,
  lastX: 0, lastY: 0, lastTime: 0,
  moved: false,
  pushTimer: 0,
}]));

let physicsFrame = 0;
let physicsPrevious = 0;

function applyPill(state) {
  state.pill.style.setProperty('--px', `${state.x.toFixed(2)}px`);
  state.pill.style.setProperty('--py', `${state.y.toFixed(2)}px`);
}

function keepInside(state) {
  if (!statementSection) return;

  applyPill(state);

  const bounds = statementSection.getBoundingClientRect();
  const rect = state.pill.getBoundingClientRect();
  const gap = 14;
  let dx = 0;
  let dy = 0;

  if (rect.left < bounds.left + gap) dx = (bounds.left + gap) - rect.left;
  else if (rect.right > bounds.right - gap) dx = (bounds.right - gap) - rect.right;

  if (rect.top < bounds.top + gap) dy = (bounds.top + gap) - rect.top;
  else if (rect.bottom > bounds.bottom - gap) dy = (bounds.bottom - gap) - rect.bottom;

  if (dx) { state.x += dx; state.vx *= -.28; }
  if (dy) { state.y += dy; state.vy *= -.28; }
  if (dx || dy) applyPill(state);
}

function markPushed(state) {
  window.clearTimeout(state.pushTimer);
  state.pill.classList.add('is-pushed');
  state.pushTimer = window.setTimeout(() => state.pill.classList.remove('is-pushed'), 190);
}

function resolveCollisions() {
  const states = [...pillStates.values()];

  for (let pass = 0; pass < 3; pass += 1) {
    for (let a = 0; a < states.length; a += 1) {
      for (let b = a + 1; b < states.length; b += 1) {
        const first = states[a];
        const second = states[b];
        const rectA = first.pill.getBoundingClientRect();
        const rectB = second.pill.getBoundingClientRect();
        const overlapX = Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left);
        const overlapY = Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top);

        if (overlapX <= 0 || overlapY <= 0) continue;

        const centerAX = rectA.left + (rectA.width / 2);
        const centerAY = rectA.top + (rectA.height / 2);
        const centerBX = rectB.left + (rectB.width / 2);
        const centerBY = rectB.top + (rectB.height / 2);
        const gap = 7;

        if (overlapX < overlapY) {
          const dir = centerBX >= centerAX ? 1 : -1;
          const push = overlapX + gap;
          const hit = Math.min(18, 3 + Math.abs(first.vx - second.vx) * .72);

          if (first.dragging && !second.dragging) {
            second.x += dir * push; second.vx += dir * hit; markPushed(second);
          } else if (second.dragging && !first.dragging) {
            first.x -= dir * push; first.vx -= dir * hit; markPushed(first);
          } else if (!first.dragging && !second.dragging) {
            first.x -= dir * push * .5; second.x += dir * push * .5;
            first.vx -= dir * hit * .5; second.vx += dir * hit * .5;
            markPushed(first); markPushed(second);
          }
        } else {
          const dir = centerBY >= centerAY ? 1 : -1;
          const push = overlapY + gap;
          const hit = Math.min(18, 3 + Math.abs(first.vy - second.vy) * .72);

          if (first.dragging && !second.dragging) {
            second.y += dir * push; second.vy += dir * hit; markPushed(second);
          } else if (second.dragging && !first.dragging) {
            first.y -= dir * push; first.vy -= dir * hit; markPushed(first);
          } else if (!first.dragging && !second.dragging) {
            first.y -= dir * push * .5; second.y += dir * push * .5;
            first.vy -= dir * hit * .5; second.vy += dir * hit * .5;
            markPushed(first); markPushed(second);
          }
        }

        applyPill(first);
        applyPill(second);
        keepInside(first);
        keepInside(second);
      }
    }
  }
}

function runPhysics(now) {
  const step = physicsPrevious ? Math.min((now - physicsPrevious) / 16.67, 2) : 1;
  const spring = .019;
  const damping = Math.pow(.855, step);
  let active = false;

  physicsPrevious = now;

  pillStates.forEach((state) => {
    if (state.dragging) { active = true; return; }

    state.vx += -state.x * spring * step;
    state.vy += -state.y * spring * step;
    state.vx *= damping;
    state.vy *= damping;
    state.x += state.vx * step;
    state.y += state.vy * step;

    const settled = Math.abs(state.x) < .12 && Math.abs(state.y) < .12
      && Math.abs(state.vx) < .08 && Math.abs(state.vy) < .08;

    if (settled) { state.x = 0; state.y = 0; state.vx = 0; state.vy = 0; }
    else active = true;

    applyPill(state);
    keepInside(state);
  });

  resolveCollisions();

  if (active) physicsFrame = requestAnimationFrame(runPhysics);
  else { physicsFrame = 0; physicsPrevious = 0; }
}

function startPhysics() {
  if (physicsFrame) return;
  physicsPrevious = 0;
  physicsFrame = requestAnimationFrame(runPhysics);
}

function endDrag(state, event) {
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
    state.x = 0; state.y = 0; state.vx = 0; state.vy = 0;
    applyPill(state);
  } else {
    startPhysics();
  }
}

pillStates.forEach((state) => {
  const { pill } = state;

  pill.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    state.dragging = true;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.originX = state.x;
    state.originY = state.y;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.lastTime = performance.now();
    state.vx = 0;
    state.vy = 0;
    state.moved = false;
    pill.dataset.dragged = 'false';
    pill.classList.add('is-dragging');
    pill.setPointerCapture?.(event.pointerId);
    startPhysics();
  });

  pill.addEventListener('pointermove', (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    const now = performance.now();
    const elapsed = Math.max(now - state.lastTime, 8);
    const totalX = event.clientX - state.startX;
    const totalY = event.clientY - state.startY;

    state.x = state.originX + totalX;
    state.y = state.originY + totalY;
    state.vx = Math.max(-24, Math.min(24, ((event.clientX - state.lastX) / elapsed) * 16.67));
    state.vy = Math.max(-24, Math.min(24, ((event.clientY - state.lastY) / elapsed) * 16.67));
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.lastTime = now;
    state.moved ||= Math.hypot(totalX, totalY) > 5;

    applyPill(state);
    keepInside(state);
    resolveCollisions();
    event.preventDefault();
  });

  pill.addEventListener('pointerup', (event) => endDrag(state, event));
  pill.addEventListener('pointercancel', (event) => endDrag(state, event));
  pill.addEventListener('lostpointercapture', (event) => endDrag(state, event));
});

window.addEventListener('resize', () => {
  pillStates.forEach((state) => {
    if (state.dragging) return;
    state.x = 0; state.y = 0; state.vx = 0; state.vy = 0;
    applyPill(state);
  });
}, { passive: true });

/* ---------------------------------------------------------
   9. VÍDEO COM SCRUB
   --------------------------------------------------------- */
function waitFor(video, eventName, timeout = 5000) {
  if (eventName === 'loadeddata' && video.readyState >= 2) return Promise.resolve();
  if (eventName === 'loadedmetadata' && video.readyState >= 1) return Promise.resolve();

  return Promise.race([
    new Promise((resolve) => video.addEventListener(eventName, resolve, { once: true })),
    new Promise((resolve) => window.setTimeout(resolve, timeout)),
  ]);
}

function hydrateSceneVideo() {
  if (!sceneVideo || sceneVideo.currentSrc || !sceneVideo.dataset.src) return;

  const source = document.createElement('source');
  source.src = sceneVideo.dataset.src;
  source.type = 'video/mp4';
  sceneVideo.append(source);
  sceneVideo.load();
}

async function ensureSeekable() {
  hydrateSceneVideo();
  await waitFor(sceneVideo, 'loadeddata');

  const last = sceneVideo.seekable.length - 1;
  const seekable = last >= 0 && sceneVideo.seekable.end(last) > .05;

  if (seekable || sceneVideo.currentSrc.startsWith('blob:')) return;

  try {
    const response = await fetch(sceneVideo.currentSrc, { cache: 'force-cache' });
    if (!response.ok) return;

    const blobUrl = URL.createObjectURL(await response.blob());
    sceneVideo.src = blobUrl;
    sceneVideo.load();
    await waitFor(sceneVideo, 'loadedmetadata');

    window.addEventListener('pagehide', () => URL.revokeObjectURL(blobUrl), { once: true });
  } catch {
    // Em hospedagens com byte ranges o vídeo já é buscável sem fallback.
  }
}

async function setupScene() {
  if (!scene || !sceneVideo || !sceneFrame || !sceneCopy) return;

  if (sceneMobileQuery.matches) preloadNotebookFrames();
  else await ensureSeekable();
  scene.classList.add('is-ready');
  sceneVideo.pause();

  if (reduceMotion) {
    const showLastFrame = () => {
      if (sceneMobileQuery.matches) {
        sceneFrame.src = notebookFrameSource(notebookFrameCount - 1);
      } else if (Number.isFinite(sceneVideo.duration)) {
        sceneVideo.currentTime = Math.max(0, sceneVideo.duration - .05);
      }
    };

    sceneCopy.style.opacity = '1';
    sceneCopy.style.pointerEvents = 'auto';
    sceneCopy.style.transform = 'none';
    sceneCopy.inert = false;

    if (sceneMobileQuery.matches) showLastFrame();
    else if (sceneVideo.readyState >= 1) showLastFrame();
    else sceneVideo.addEventListener('loadedmetadata', showLastFrame, { once: true });
    return;
  }

  let target = 0;
  let rendered = 0;
  let frame = 0;
  let previous = 0;

  sceneCopy.inert = true;

  function read() {
    const rect = scene.getBoundingClientRect();
    const distance = Math.max(1, scene.offsetHeight - window.innerHeight);
    const compact = window.matchMedia('(max-width: 760px)').matches;
    const start = window.innerHeight * (compact ? .72 : .65);
    const end = window.innerHeight * (compact ? .14 : .22);
    const active = Math.max(window.innerHeight, distance - end + start);

    target = clamp((start - rect.top) / active);

    if (!frame) { previous = 0; frame = requestAnimationFrame(render); }
  }

  function render(now) {
    const elapsed = previous ? Math.min(now - previous, 40) : 16;
    const smoothing = 1 - Math.exp(-elapsed / 155);
    previous = now;
    rendered += (target - rendered) * smoothing;

    if (Math.abs(target - rendered) < .0005) rendered = target;

    if (sceneMobileQuery.matches) {
      const frameIndex = Math.min(notebookFrameCount - 1, Math.round(rendered * (notebookFrameCount - 1)));

      if (sceneFrame.dataset.frame !== String(frameIndex)) {
        sceneFrame.dataset.frame = String(frameIndex);
        sceneFrame.src = notebookFrameSource(frameIndex);
      }
    } else if (sceneVideo.readyState >= 1 && Number.isFinite(sceneVideo.duration)) {
      const time = rendered * Math.max(0, sceneVideo.duration - (1 / 24));
      if (Math.abs(sceneVideo.currentTime - time) > 1 / 48) sceneVideo.currentTime = time;
    }

    const copy = clamp((rendered - .44) / .18);
    sceneCopy.style.opacity = copy.toFixed(3);
    sceneCopy.style.pointerEvents = copy > .85 ? 'auto' : 'none';
    sceneCopy.style.transform = `translateY(${((1 - copy) * 22).toFixed(2)}px)`;
    sceneCopy.inert = copy <= .85;

    if (rendered !== target) frame = requestAnimationFrame(render);
    else frame = 0;
  }

  sceneVideo.addEventListener('loadedmetadata', read, { once: true });
  sceneMobileQuery.addEventListener('change', (event) => {
    if (event.matches) preloadNotebookFrames();
    else ensureSeekable().then(read);
    read();
  });
  scrollTasks.push(read);
  window.addEventListener('resize', read);
  window.addEventListener('pageshow', read);
  read();
}

setupScene();

/* ---------------------------------------------------------
   10. CONTADOR
   --------------------------------------------------------- */
function animateCounter(counter) {
  if (counter.dataset.animated === 'true') return;
  counter.dataset.animated = 'true';

  const target = Number(counter.dataset.counter);
  const duration = 2000;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    counter.textContent = nf.format(Math.round(target * (1 - Math.pow(1 - progress, 4))));
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (reduceMotion || !('IntersectionObserver' in window)) {
  counters.forEach((counter) => { counter.textContent = nf.format(Number(counter.dataset.counter)); });
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
requestScrollTasks();
