
(function(){
  function initPortfolioPin(){
    if(window.innerWidth < 981) return;

    var portfolio = document.querySelector('.pm40-portfolio');
    var side = document.querySelector('.pm40-side');
    var inner = document.querySelector('.pm40-side-inner');
    if(!portfolio || !side || !inner) return;

    var offset = 92;
    var ticking = false;

    /* Remove all previous sticky/fixed classes so only V111 controls it. */
    function clearOld(){
      inner.classList.remove('v109-fixed','v109-bottom','v111-fixed','v111-bottom');
      inner.style.left='';
      inner.style.top='';
      inner.style.bottom='';
      inner.style.width='';
      inner.style.height='';
    }

    function update(){
      ticking=false;

      if(window.innerWidth < 981){
        clearOld();
        return;
      }

      inner.classList.remove('v109-fixed','v109-bottom');

      var p = portfolio.getBoundingClientRect();
      var s = side.getBoundingClientRect();

      /* Natural content height, never viewport height. */
      inner.classList.remove('v111-fixed','v111-bottom');
      inner.style.height='auto';
      inner.style.width='100%';
      inner.style.left='0';
      inner.style.top='0';
      inner.style.bottom='auto';

      var h = inner.getBoundingClientRect().height;
      var stopThreshold = offset + h;

      if(p.top <= offset && p.bottom > stopThreshold){
        inner.classList.add('v111-fixed');
        inner.style.top=offset+'px';
        inner.style.left=s.left+'px';
        inner.style.width=s.width+'px';
        inner.style.bottom='auto';
      }
      else if(p.top <= offset && p.bottom <= stopThreshold){
        inner.classList.add('v111-bottom');
        inner.style.left='0';
        inner.style.width='100%';
        inner.style.top='auto';
        inner.style.bottom='0';
      }
    }

    function requestUpdate(){
      if(!ticking){
        ticking=true;
        requestAnimationFrame(update);
      }
    }

    clearOld();
    update();
    window.addEventListener('scroll',requestUpdate,{passive:true});
    window.addEventListener('resize',requestUpdate);
    window.addEventListener('load',requestUpdate);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initPortfolioPin);
  }else{
    initPortfolioPin();
  }
})();
