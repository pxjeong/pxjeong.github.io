(() => {
  const rail = document.querySelector('.dog-scrollbar');
  if (!rail) return;
  const dog = rail.querySelector('.scroll-dog');
  const desktop = matchMedia('(min-width: 900px) and (pointer: fine)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let frame = 0;
  let dragging = false;
  let grabOffset = 0;
  let dogHeight = 54;
  let dogTop = 0;
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  function update() {
    frame = 0;
    const max = maxScroll();
    const enabled = desktop.matches && !forcedColors.matches && max > 0;
    rail.hidden = !enabled;
    document.documentElement.classList.toggle('dog-scroll-enabled', enabled);
    if (!enabled) return;
    const progress = Math.max(0, Math.min(1, scrollY / max));
    dogHeight = Math.min(54 + progress * 60, rail.clientHeight);
    dogTop = progress * (rail.clientHeight - dogHeight);
    dog.style.height = `${dogHeight}px`;
    dog.style.transform = `translateY(${dogTop}px)`;
    rail.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    rail.setAttribute('aria-valuetext', `${Math.round(progress * 100)}%`);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function move(y) {
    const available = rail.clientHeight - dogHeight;
    const position = y - rail.getBoundingClientRect().top - grabOffset;
    const progress = available > 0 ? Math.max(0, Math.min(1, position / available)) : 0;
    window.scrollTo({ top: progress * maxScroll(), behavior: 'instant' });
  }
  rail.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    rail.focus({ preventScroll: true });
    dragging = true;
    grabOffset = dog.contains(event.target) ? event.clientY - rail.getBoundingClientRect().top - dogTop : dogHeight / 2;
    rail.setPointerCapture(event.pointerId);
    move(event.clientY);
  });
  rail.addEventListener('pointermove', event => { if (dragging) move(event.clientY); });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    rail.addEventListener(name, () => { dragging = false; });
  }
  rail.addEventListener('keydown', event => {
    const targets = { ArrowDown: scrollY + 48, ArrowUp: scrollY - 48, PageDown: scrollY + innerHeight * .9, PageUp: scrollY - innerHeight * .9, Home: 0, End: maxScroll() };
    if (!(event.key in targets)) return;
    event.preventDefault();
    window.scrollTo({ top: targets[event.key], behavior: 'instant' });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  desktop.addEventListener('change', schedule);
  forcedColors.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(document.body);
  update();
})();
