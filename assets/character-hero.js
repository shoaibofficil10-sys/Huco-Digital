(() => {
  'use strict';
  const hero = document.querySelector('[data-character-hero]');
  if (!hero) return;
  const character = hero.querySelector('[data-character-look]');
  const button = hero.querySelector('[data-motion-toggle]');
  const label = button.querySelector('[data-motion-label]');
  const icon = button.querySelector('path');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let visible = false, paused = false, frame = 0, previousTime = 0;
  let width = innerWidth, height = innerHeight;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  const active = () => visible && !document.hidden && !paused && !reduced.matches;
  const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
  const reset = () => { stop(); x = y = targetX = targetY = 0; character.style.removeProperty('transform'); };
  function render(now) {
    frame = 0;
    if (!active() || !finePointer.matches) { reset(); return; }
    const delta = previousTime ? Math.min(48, now - previousTime) : 16;
    previousTime = now;
    const ease = 1 - Math.exp(-delta / 115);
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    character.style.transform = `translate3d(${(x * 16).toFixed(2)}px,${(y * 8).toFixed(2)}px,0) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .002) frame = requestAnimationFrame(render);
    else previousTime = 0;
  }
  function request() { if (!frame && active() && finePointer.matches) frame = requestAnimationFrame(render); }
  function sync() {
    hero.classList.toggle('is-motion-offscreen', !visible || document.hidden);
    hero.classList.toggle('is-motion-paused', paused || reduced.matches);
    if (!active() || !finePointer.matches) reset();
  }
  // Only the latest pointer position is used; no layout reads or permanent RAF loop.
  function move(event) {
    if (!active() || !finePointer.matches || event.pointerType === 'touch') return;
    targetX = Math.max(-1, Math.min(1, event.clientX / width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, event.clientY / height * 2 - 1));
    request();
  }
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerout', event => {
    if (event.relatedTarget === null) { targetX = targetY = 0; request(); }
  }, { passive: true });
  window.addEventListener('resize', () => { width = innerWidth; height = innerHeight; }, { passive: true });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', sync);
  reduced.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume hero animation' : 'Pause hero animation');
    label.textContent = paused ? 'Resume motion' : 'Pause motion';
    icon.setAttribute('d', paused ? 'M4 2l9 6-9 6z' : 'M4 2h3v12H4zM10 2h3v12h-3z');
    sync();
  });
  sync();
})();
