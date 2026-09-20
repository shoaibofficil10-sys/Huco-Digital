
(function(){
  function initV108Mega(){
    if (window.innerWidth < 981) return;
    var trigger = document.querySelector('.services-trigger');
    var mega = document.getElementById('servicesMega');
    if (!trigger || !mega) return;

    var timer;
    function openMega(){
      clearTimeout(timer);
      mega.classList.add('is-open');
      mega.setAttribute('data-v108-open','true');
      mega.setAttribute('aria-hidden','false');
      trigger.setAttribute('aria-expanded','true');
    }
    function closeMega(){
      clearTimeout(timer);
      timer=setTimeout(function(){
        mega.classList.remove('is-open');
        mega.setAttribute('data-v108-open','false');
        mega.setAttribute('aria-hidden','true');
        trigger.setAttribute('aria-expanded','false');
      },120);
    }

    trigger.addEventListener('mouseenter',openMega);
    trigger.addEventListener('mouseleave',closeMega);
    mega.addEventListener('mouseenter',openMega);
    mega.addEventListener('mouseleave',closeMega);
    trigger.addEventListener('focus',openMega);
    mega.addEventListener('focusin',openMega);

    trigger.addEventListener('click',function(e){
      if (window.innerWidth >= 981) {
        e.preventDefault();
        var isOpen=mega.getAttribute('data-v108-open')==='true';
        if(isOpen){
          mega.classList.remove('is-open');
          mega.setAttribute('data-v108-open','false');
          mega.setAttribute('aria-hidden','true');
          trigger.setAttribute('aria-expanded','false');
        } else openMega();
      }
    });

    document.addEventListener('click',function(e){
      if(!mega.contains(e.target) && e.target!==trigger){
        mega.classList.remove('is-open');
        mega.setAttribute('data-v108-open','false');
        mega.setAttribute('aria-hidden','true');
        trigger.setAttribute('aria-expanded','false');
      }
    });

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        mega.classList.remove('is-open');
        mega.setAttribute('data-v108-open','false');
        mega.setAttribute('aria-hidden','true');
        trigger.setAttribute('aria-expanded','false');
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initV108Mega);
  else initV108Mega();
})();
