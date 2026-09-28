/* ClearAxis — site behaviour. Vanilla JS, no build step. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = (els, fn, threshold = 0.3) => {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); }
    }), { threshold });
    els.forEach((el) => io.observe(el));
  };

  /* ---------------------------------------------------------- mobile menu */
  const burger = $('.burger');
  const menu = $('#menu');
  if (burger && menu) {
    const set = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
    };
    burger.addEventListener('click', () => set(menu.hidden));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    window.matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }

  /* ------------------------------------------- services: list + live mock */
  const items = $$('[data-svc-item]');
  const mocks = $$('[data-mock]');
  if (items.length) {
    let current = 0;
    let timer = null;
    const show = (i) => {
      current = i;
      items.forEach((li, k) => { li.classList.toggle('is-on', k === i); li.setAttribute('aria-selected', String(k === i)); });
      mocks.forEach((m, k) => {
        if (k === i) { m.classList.remove('is-on'); void m.offsetWidth; m.classList.add('is-on'); }  // restart animations
        else m.classList.remove('is-on');
      });
    };
    const cycle = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show((current + 1) % items.length), 7000); };
    items.forEach((li, i) => {
      li.addEventListener('click', (e) => { if (e.target.closest('a')) return; show(i); cycle(); });
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); cycle(); } });
    });
    const panel = $('.svc__panel');
    panel.addEventListener('mouseenter', () => clearInterval(timer));
    panel.addEventListener('mouseleave', cycle);
    // Nav / footer links jump straight to a service
    $$('[data-svc]').forEach((a) => a.addEventListener('click', () => { show(Number(a.dataset.svc)); cycle(); }));
    seen([panel], () => { show(current); cycle(); }, 0.2);
  } else {
    // On other pages, remember the chosen service for the home page
    $$('[data-svc]').forEach((a) => a.addEventListener('click', () => { try { sessionStorage.setItem('svc', a.dataset.svc); } catch {} }));
  }
  try {
    const want = sessionStorage.getItem('svc');
    if (want !== null && items[want]) { items[want].click(); sessionStorage.removeItem('svc'); }
  } catch {}

  /* ------------------------------------------------------------ playbooks */
  const pbData = $('#pb-data');
  if (pbData) {
    const data = JSON.parse(pbData.textContent);
    const desc = $('[data-pb-desc]');
    const plat = $('[data-pb-platforms]');
    const form = $('[data-pb-formats]');
    const chips = (list, darkFirst) => list.map((t, i) => `<span class="chip${darkFirst && i === 0 ? ' is-dark' : ''}">${t}</span>`).join('');
    $$('[data-pb]').forEach((btn) => btn.addEventListener('click', () => {
      const d = data[Number(btn.dataset.pb)];
      $$('[data-pb]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      desc.textContent = d.desc;
      plat.innerHTML = chips(d.platforms, true);
      form.innerHTML = chips(d.formats, false);
    }));
  }

  /* ------------------------------------------------------ counters + bars */
  seen($$('[data-count]'), (el) => {
    const target = Number(el.dataset.count);
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  }, 0.6);
  seen($$('.hbars'), (box) => $$('i[data-w]', box).forEach((i, k) => setTimeout(() => { i.style.width = `${i.dataset.w}%`; }, k * 120)));

  /* ------------------------------------------------ pixel strip accents */
  $$('.strip').forEach((strip) => {
    const cells = $$('i', strip);
    [[2, 0, 18, 18], [9, 'end', 34, 18], [11, 'end', 18, 10]].forEach(([c, pos, w, h]) => {
      const b = document.createElement('span');
      b.className = 'blk';
      b.style.cssText = `width:${w}%;height:${h}px;left:${pos === 'end' ? 0 : 20}%;${pos === 'end' ? 'bottom:0' : 'top:0'}`;
      if (cells[c]) cells[c].appendChild(b);
    });
  });

  /* ---------------------------------------- contact form (Netlify Forms) */
  const formEl = $('#partner-form');
  if (formEl) {
    formEl.noValidate = true;
    const status = $('.form__status', formEl);
    const submit = $('.form__submit', formEl);
    const done = $('.form-done');
    const rules = {
      type: () => (formEl.elements.type.value ? '' : 'Choose the option that best describes you.'),
      name: () => (formEl.elements.name.value.trim() ? '' : 'Please enter your name.'),
      email: () => {
        const el = formEl.elements.email;
        if (!el.value.trim()) return 'Please enter your email.';
        return el.validity.typeMismatch ? "That email address doesn't look right." : '';
      },
      link: () => (formEl.elements.link.validity.typeMismatch ? 'Use a full link, starting with https://' : ''),
    };
    const check = (key) => {
      const field = $(`[data-field="${key}"]`, formEl);
      const msg = rules[key]();
      field.classList.toggle('is-invalid', !!msg);
      $('.field__error', field).textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach((key) => {
      const field = $(`[data-field="${key}"]`, formEl);
      field.addEventListener('change', () => check(key));
      field.addEventListener('input', () => { if (field.classList.contains('is-invalid')) check(key); });
    });
    const preset = new URLSearchParams(location.search).get('type');
    if (preset) {
      const r = $$('input[name="type"]', formEl).find((x) => x.value.toLowerCase().startsWith(preset.toLowerCase()));
      if (r) r.checked = true;
    }
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.classList.remove('is-error');
      if (Object.keys(rules).map(check).includes(false)) {
        const first = $('.field.is-invalid input, .field.is-invalid select', formEl);
        if (first) first.focus();
        return;
      }
      if (location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
        status.textContent = 'Looks good. Submissions go through once the site is deployed on Netlify.';
        return;
      }
      submit.disabled = true;
      status.textContent = 'Sending…';
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(formEl)).toString(),
        });
        if (!res.ok) throw new Error(String(res.status));
        formEl.hidden = true;
        done.hidden = false;
        done.focus();
      } catch {
        status.classList.add('is-error');
        status.textContent = 'Something went wrong sending your details. Please try again.';
      } finally {
        submit.disabled = false;
        if (status.textContent === 'Sending…') status.textContent = '';
      }
    });
  }
})();
