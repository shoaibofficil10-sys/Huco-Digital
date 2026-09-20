/* Shared editorial controls and honest email-based enquiries. */
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
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const lines = controls.filter(control => control.name && control.value.trim()).map(control => {
        const labelElement = control.labels?.[0];
        const label = (labelElement?.querySelector('span') || labelElement)?.textContent.trim() || control.name;
        return `${label}: ${control.value.trim()}`;
      });
      const company = form.elements.namedItem('company')?.value.trim();
      const subject = `HUCO project enquiry${company ? ` — ${company}` : ''}`;
      const body = `Hello HUCO team,\n\nI would like to discuss a project.\n\n${lines.join('\n\n')}\n\nEnquiry from: ${document.title}`;
      let result = form.querySelector('.form-email-result');
      if (!result) {
        result = document.createElement('div');
        result.className = 'form-email-result';
        result.setAttribute('role', 'status');
        form.append(result);
      }
      result.replaceChildren();
      const message = document.createElement('p');
      message.textContent = 'Your email draft is ready. Open it in your email app and send it to hello@hucodigital.com to submit your brief.';
      const link = document.createElement('a');
      link.href = `mailto:hello@hucodigital.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      link.textContent = 'Open email draft';
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'huco-icon');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('aria-hidden', 'true');
      icon.setAttribute('focusable', 'false');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M6 18 18 6M6 6h12v12');
      icon.append(path);
      link.append(icon);
      result.append(message, link);
    });
  });
})();
