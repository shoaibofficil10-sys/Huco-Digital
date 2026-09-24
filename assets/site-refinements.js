/* Shared editorial controls and server-delivered enquiries. */
(() => {
  const cards = [...document.querySelectorAll('[data-insight-card]')];
  const filters = [...document.querySelectorAll('[data-insight-filter]')];
  const search = document.querySelector('[data-insight-search]');
  const results = document.querySelector('[data-insight-results]');
  const empty = document.querySelector('[data-insight-empty]');
  let category = 'all';
  function filterArticles() {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => {
      const visible = (category === 'all' || card.dataset.category === category)
        && card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !visible;
      if (visible) count++;
    });
    if (results) results.textContent = `${count} ${count === 1 ? 'article' : 'articles'}`;
    if (empty) empty.hidden = count > 0;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.insightFilter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterArticles();
  }));
  search?.addEventListener('input', filterArticles);

  document.querySelectorAll('[data-email-brief]').forEach((form, formIndex) => {
    const controls = [...form.querySelectorAll('input, select, textarea')];
    controls.forEach((control, index) => {
      const label = control.closest('label') || control.parentElement.querySelector('label');
      if (label && !label.contains(control)) {
        if (!control.id) control.id = `brief-${formIndex}-${index}`;
        label.htmlFor = control.id;
      }
    });
    const trap = document.createElement('input');
    trap.name = 'website'; trap.type = 'text'; trap.tabIndex = -1;
    trap.autocomplete = 'off'; trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
    form.append(trap);
    let sending = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;
      const payload = Object.fromEntries(controls.filter(control => control.name).map(control => [control.name, control.value.trim()]));
      payload.page = location.pathname;
      payload.website = trap.value;
      const button = form.querySelector('button[type="submit"], button:not([type])');
      let result = form.querySelector('.form-email-result');
      if (!result) {
        result = document.createElement('div');
        result.className = 'form-email-result';
        result.setAttribute('role', 'status');
        result.setAttribute('aria-live', 'polite');
        form.append(result);
      }
      result.textContent = 'Sending your enquiry…';
      sending = true;
      if (button) button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(form.getAttribute('action') || 'send.php', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload), signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok !== true) throw new Error(data.error || 'We could not confirm sending. Please try again or use the email link below.');
        result.textContent = 'Thank you. Your enquiry has been sent to our team. We’ll be in touch soon.';
        form.reset();
        window.location.assign('thank-you.html');
      } catch (error) {
        const message = document.createElement('p');
        message.textContent = error.name === 'AbortError'
          ? 'Sending took longer than expected. We could not confirm delivery. Your details are still here; you can contact us by email below.'
          : (error instanceof TypeError ? 'We could not connect. Please check your connection or use the email link below.' : error.message);
        const link = document.createElement('a');
        const body = Object.entries(payload).filter(([key]) => key !== 'website').map(([key, value]) => `${key}: ${value}`).join('\n\n');
        link.href = `mailto:arsalan@hucodigital.com?subject=${encodeURIComponent('HUCO website enquiry')}&body=${encodeURIComponent(body)}`;
        link.textContent = 'Email your enquiry';
        result.replaceChildren(message, link);
      } finally {
        clearTimeout(timeout);
        sending = false;
        if (button) button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();

/* Mobile layout enhancements keep the original controls, values and desktop layout. */
(() => {
  const mobile = matchMedia('(max-width:980px)');
  const menus = [...document.querySelectorAll('.footer-menu')];
  menus.forEach(menu => menu.querySelector('summary').addEventListener('click', event => {
    if (!mobile.matches) event.preventDefault();
  }));
  const hero = document.querySelector('.service-landing-page .pm49-hero');
  const form = hero?.querySelector('.pm49-form-wrap');
  let anchor, review;
  if (form) {
    anchor = document.createComment('Desktop service form position');
    form.before(anchor);
    review = document.createElement('section');
    review.className = 'service-mobile-review';
    review.setAttribute('aria-label', 'Request a project review');
    review.hidden = true;
    hero.after(review);
  }
  function syncLayout() {
    menus.forEach(menu => { menu.open = !mobile.matches; });
    if (!form) return;
    if (mobile.matches) {
      review.hidden = false;
      review.append(form);
    } else {
      anchor.after(form);
      review.hidden = true;
    }
  }
  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();
