
(function(){
  function initHardSticky(){
    if (window.innerWidth < 981) return;

    var section = document.querySelector('.pm40-portfolio');
    var side = document.querySelector('.pm40-side');
    var inner = document.querySelector('.pm40-side-inner');
    if (!section || !side || !inner) return;

    var headerOffset = 92;
    var ticking = false;

    function resetInline(){
      inner.style.left = '';
      inner.style.width = '';
      inner.style.top = '';
      inner.style.bottom = '';
    }

    function update(){
      ticking = false;

      if (window.innerWidth < 981){
        inner.classList.remove('v109-fixed','v109-bottom');
        resetInline();
        return;
      }

      var sectionRect = section.getBoundingClientRect();
      var sideRect = side.getBoundingClientRect();
      var innerHeight = inner.offsetHeight;

      /* Exact point where the fixed panel must stop so its bottom
         never crosses the portfolio section bottom. */
      var stopPoint = headerOffset + innerHeight;

      if (sectionRect.top <= headerOffset && sectionRect.bottom > stopPoint){
        inner.classList.add('v109-fixed');
        inner.classList.remove('v109-bottom');
        inner.style.width = sideRect.width + 'px';
        inner.style.left = sideRect.left + 'px';
        inner.style.top = headerOffset + 'px';
        inner.style.bottom = 'auto';
      }
      else if (sectionRect.top <= headerOffset && sectionRect.bottom <= stopPoint){
        /* Lock inside the left column at the exact section bottom. */
        inner.classList.remove('v109-fixed');
        inner.classList.add('v109-bottom');
        inner.style.left = '0';
        inner.style.width = '100%';
        inner.style.top = 'auto';
        inner.style.bottom = '0';
      }
      else{
        inner.classList.remove('v109-fixed','v109-bottom');
        inner.style.left = '0';
        inner.style.width = '100%';
        inner.style.top = '0';
        inner.style.bottom = 'auto';
      }
    }

    function requestUpdate(){
      if (!ticking){
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener('scroll', requestUpdate, {passive:true});
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initHardSticky);
  } else {
    initHardSticky();
  }
})();
