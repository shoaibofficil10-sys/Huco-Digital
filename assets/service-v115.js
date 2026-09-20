
(function () {
  function initPortfolioPin() {
    var portfolio = document.querySelector('.pm40-portfolio');
    var side = document.querySelector('.pm40-side');
    var panel = document.querySelector('.pm40-side-inner');
    var header = document.querySelector('.site-header');

    if (!portfolio || !side || !panel) return;

    var raf = 0;

    function reset() {
      panel.classList.remove('v115-pin', 'v115-end');
      panel.style.left = '';
      panel.style.width = '';
      panel.style.top = '';
      panel.style.bottom = '';
    }

    function headerBottom() {
      if (!header) return 0;
      var r = header.getBoundingClientRect();
      return Math.max(0, r.bottom);
    }

    function update() {
      raf = 0;

      if (window.innerWidth <= 980) {
        reset();
        return;
      }

      /* Measure everything in the natural V114 layout first. */
      panel.classList.remove('v115-pin', 'v115-end');
      panel.style.left = '';
      panel.style.width = '';
      panel.style.top = '';
      panel.style.bottom = '';

      var p = portfolio.getBoundingClientRect();
      var s = side.getBoundingClientRect();
      var top = headerBottom();
      var panelHeight = panel.getBoundingClientRect().height;

      /* Portfolio has not reached the header yet. */
      if (p.top >= top) return;

      /* Keep the left panel pinned while right cases continue. */
      if (p.bottom > top + panelHeight) {
        panel.classList.add('v115-pin');
        panel.style.top = top + 'px';
        panel.style.left = s.left + 'px';
        panel.style.width = s.width + 'px';
        panel.style.bottom = 'auto';
        return;
      }

      /* Last case reached. Lock panel to the exact portfolio bottom. */
      panel.classList.add('v115-end');
      panel.style.top = 'auto';
      panel.style.bottom = '0px';
      panel.style.left = '0px';
      panel.style.width = '100%';
    }

    function requestUpdate() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    reset();
    update();

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);

    if ('ResizeObserver' in window) {
      new ResizeObserver(requestUpdate).observe(portfolio);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioPin);
  } else {
    initPortfolioPin();
  }
})();
