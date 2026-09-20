(function(){
  function init(){
    if(window.innerWidth<981)return;
    var trigger=document.querySelector('.services-trigger');
    var mega=document.getElementById('servicesMega');
    if(!trigger||!mega)return;
    var timer;
    function open(){clearTimeout(timer);mega.classList.add('is-open');mega.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');}
    function closeNow(){mega.classList.remove('is-open');mega.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');}
    function close(){clearTimeout(timer);timer=setTimeout(closeNow,180);}
    trigger.addEventListener('mouseenter',open);
    trigger.addEventListener('mouseleave',close);
    mega.addEventListener('mouseenter',open);
    mega.addEventListener('mouseleave',close);
    trigger.addEventListener('focus',open);
    mega.addEventListener('focusin',open);
    trigger.addEventListener('click',function(e){e.preventDefault();mega.classList.contains('is-open')?closeNow():open();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeNow();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
