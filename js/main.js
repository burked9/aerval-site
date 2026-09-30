/* Aerval — hero concept interactions */
document.documentElement.classList.remove('no-js');

document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* keep the footer year current */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- nav inversion: match the tone of the section under the nav ---------- */
  const navEl = document.querySelector('nav');
  const sections = [...document.querySelectorAll('[data-nav]')];
  function updateNav() {
    const line = navEl.getBoundingClientRect().bottom + 2;
    let tone = 'light';
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) tone = s.dataset.nav;
    }
    navEl.classList.toggle('on-light', tone === 'light');
  }
  updateNav();
  addEventListener('scroll', updateNav, { passive: true });
  addEventListener('resize', updateNav);

  /* ---------- hero focus stage ---------- */
  document.querySelectorAll('[data-stage]').forEach(stage => {
    const spots = [...stage.querySelectorAll('.spot')];
    const cards = [...stage.querySelectorAll('.glass')];
    const hud = stage.querySelector('.hud');
    const hudLine = hud.querySelector('polyline');
    const PAD = 10; // frame sits 10px proud of the panel
    let openSpot = null;
    let closeTimer = null;

    const hardReset = () => {
      stage.classList.remove('focused', 'closing');
      cards.forEach(c => c.classList.remove('show'));
      spots.forEach(b => b.classList.remove('active'));
      hud.classList.remove('on', 'out');
    };

    // closing runs the open sequence in reverse: panel, frame, then the line retracts
    const closeAll = (instant, returnFocus) => {
      clearTimeout(closeTimer);
      spots.forEach(b => b.setAttribute('aria-expanded', 'false'));
      const open = cards.find(c => c.classList.contains('show'));
      const wasOpen = openSpot;
      openSpot = null;
      if (returnFocus && wasOpen) wasOpen.focus({ preventScroll: true });
      if (!open || instant || reduce) { hardReset(); return; }
      open.classList.remove('show');
      stage.classList.add('closing');
      hud.classList.remove('on');
      hud.classList.add('out');
      closeTimer = setTimeout(hardReset, 700);
    };

    // leader line: marker centre -> nearest edge of the frame, as an L-shape
    function layoutHud(card, spot) {
      const sr = stage.getBoundingClientRect();
      hud.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
      const cr = card.getBoundingClientRect();
      const fl = cr.left - sr.left - PAD, ft = cr.top - sr.top - PAD;
      const fw = cr.width + PAD * 2, fh = cr.height + PAD * 2;
      const mr = spot.getBoundingClientRect();
      const mx = mr.left + mr.width / 2 - sr.left, my = mr.top + mr.height / 2 - sr.top;
      const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
      let pts;
      if (my < ft || my > ft + fh) {           // above/below -> drop onto a horizontal edge
        const above = my < ft;
        const ax = clamp(mx, fl + 30, fl + fw - 30), ay = (above ? ft : ft + fh) + (above ? 1 : -1);
        pts = Math.abs(ax - mx) < 1 ? `${mx},${my} ${ax},${ay}` : `${mx},${my} ${ax},${my} ${ax},${ay}`;
      } else {                                  // beside -> run onto a vertical edge
        const left = mx < fl + fw / 2;
        const ax = (left ? fl : fl + fw) + (left ? 1 : -1), ay = clamp(my, ft + 30, ft + fh - 30);
        pts = Math.abs(ay - my) < 1 ? `${mx},${my} ${ax},${ay}` : `${mx},${my} ${mx},${ay} ${ax},${ay}`;
      }
      hudLine.setAttribute('points', pts);
    }

    function playHud(card, spot) {
      if (getComputedStyle(hud).display === 'none') return; // leader line is hidden on small screens
      layoutHud(card, spot);
      hud.classList.remove('on');
      const len = hudLine.getTotalLength ? hudLine.getTotalLength() : 400;
      hudLine.style.setProperty('--len', len);
      void hud.offsetWidth; // restart the keyframe
      hud.classList.add('on');
    }
    addEventListener('resize', () => {
      const c = cards.find(c => c.classList.contains('show'));
      if (c && openSpot && getComputedStyle(hud).display !== 'none') layoutHud(c, openSpot);
    });

    // figures count up each time a card opens
    const NUM = /[\d,]+/;
    const firstText = el => [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    function rollNumber(node, delay, dur) {
      const tpl = node.__tpl !== undefined ? node.__tpl : (node.__tpl = node.textContent);
      const m = tpl.match(NUM); if (!m) return;
      const target = parseInt(m[0].replace(/,/g, ''), 10);
      if (!isFinite(target)) return;
      if (reduce) { node.textContent = tpl; return; }
      node.textContent = tpl.replace(NUM, '0');
      const t0 = performance.now() + delay;
      (function frame(t) {
        const p = Math.min(1, Math.max(0, (t - t0) / dur));
        const e = 1 - Math.pow(1 - p, 3);
        node.textContent = tpl.replace(NUM, Math.round(target * e).toLocaleString('en-US'));
        if (p < 1) requestAnimationFrame(frame);
      })(performance.now());
    }
    function playCard(card) {
      [...card.querySelectorAll('.gbody>.grow,.gbody>.gpath,.gbody>.gfoot')].forEach((b, i) => {
        const d = (reduce ? 0 : 760) + i * 80;
        b.querySelectorAll('.val,.gn,.gchip').forEach(el => { const n = firstText(el); if (n) rollNumber(n, d, 780); });
      });
    }

    spots.forEach(sp => {
      sp.addEventListener('click', e => {
        e.stopPropagation();
        if (openSpot === sp) { closeAll(); return; }
        closeAll(true);
        stage.classList.add('focused');
        sp.classList.add('active');
        sp.setAttribute('aria-expanded', 'true');
        openSpot = sp;
        const card = document.getElementById(sp.dataset.card);
        card.classList.add('show');
        playHud(card, sp);
        playCard(card);
      });
    });

    addEventListener('keydown', e => { if (e.key === 'Escape' && openSpot) closeAll(false, true); });
    stage.querySelectorAll('.gclose').forEach(x => x.addEventListener('click', e => { e.stopPropagation(); closeAll(false, true); }));
    stage.addEventListener('click', e => {
      if (stage.classList.contains('focused') && !e.target.closest('.glass')) closeAll();
    });
  });

  /* ---------- first-load reveal (waits for fonts, max 1.2s) ---------- */
  const boot = () => {
    document.body.classList.add('loaded');
    setTimeout(() => document.body.classList.add('spots-in'), 900);
  };
  if (document.fonts && document.fonts.ready) {
    let done = false;
    const go = () => { if (!done) { done = true; requestAnimationFrame(boot); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1200);
  } else {
    requestAnimationFrame(boot);
  }

  /* ---------- scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .16 });
    document.querySelectorAll('.rev').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.rev').forEach(el => el.classList.add('in'));
  }
});
