
(function(){
  function initV112(){
    var portfolio=document.querySelector('.pm40-portfolio');
    var side=document.querySelector('.pm40-side');
    var inner=document.querySelector('.pm40-side-inner');
    if(!portfolio||!side||!inner) return;

    var offset=92, ticking=false;

    function clear(){
      inner.classList.remove(
        'v109-fixed','v109-bottom',
        'v111-fixed','v111-bottom',
        'v112-fixed','v112-bottom'
      );
      inner.style.left='';
      inner.style.width='';
    }

    function update(){
      ticking=false;
      if(window.innerWidth<981){
        clear();
        return;
      }

      inner.classList.remove('v109-fixed','v109-bottom','v111-fixed','v111-bottom');

      var pr=portfolio.getBoundingClientRect();
      var sr=side.getBoundingClientRect();

      // Measure natural content height without clipping.
      inner.classList.remove('v112-fixed','v112-bottom');
      inner.style.left='0px';
      inner.style.width='100%';
      var h=inner.offsetHeight;

      // Before portfolio reaches header: natural position.
      if(pr.top > offset){
        return;
      }

      // While enough portfolio remains below the pinned panel: keep it fixed.
      if(pr.bottom > offset + h){
        inner.classList.add('v112-fixed');
        inner.style.left=sr.left+'px';
        inner.style.width=sr.width+'px';
        return;
      }

      // At portfolio end: anchor the same panel to the bottom of its own column.
      inner.classList.add('v112-bottom');
      inner.style.left='0px';
      inner.style.width='100%';
    }

    function request(){
      if(!ticking){
        ticking=true;
        requestAnimationFrame(update);
      }
    }

    clear();
    update();
    window.addEventListener('scroll',request,{passive:true});
    window.addEventListener('resize',request);
    window.addEventListener('load',request);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initV112);
  }else{
    initV112();
  }
})();
