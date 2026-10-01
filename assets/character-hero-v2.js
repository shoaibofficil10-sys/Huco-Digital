(() => {
  'use strict';
  const hero=document.querySelector('[data-character-hero]');
  if(!hero)return;
  const host=hero.querySelector('[data-character-look]'), button=hero.querySelector('[data-motion-toggle]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  let model=null,visible=false,paused=false,frame=0,previous=0,x=0,y=0,tx=0,ty=0;
  let width=innerWidth,height=innerHeight;
  const active=()=>visible&&!document.hidden&&!paused&&!reduced.matches;
  const cancel=()=>{if(frame)cancelAnimationFrame(frame);frame=0;previous=0;};
  function render(now){
    frame=0;if(!active()||!model)return;
    const delta=previous?Math.min(50,now-previous):16;previous=now;
    const ease=1-Math.exp(-delta/150);x+=(tx-x)*ease;y+=(ty-y)*ease;
    model.pose(x,y);
    if(Math.abs(tx-x)+Math.abs(ty-y)>.002)frame=requestAnimationFrame(render);else previous=0;
  }
  const request=()=>{if(!frame&&active()&&model)frame=requestAnimationFrame(render);};
  function sync(){
    hero.classList.toggle('is-character-offscreen',!visible||document.hidden);
    hero.classList.toggle('is-motion-paused',paused||reduced.matches);
    if(!active()){cancel();return;}
    request();
  }
  window.addEventListener('pointermove',event=>{
    if(!active()||!fine.matches||event.pointerType==='touch')return;
    tx=Math.max(-1,Math.min(1,event.clientX/width*2-1));
    ty=Math.max(-1,Math.min(1,event.clientY/height*2-1));request();
  },{passive:true});
  window.addEventListener('pointerout',event=>{if(event.relatedTarget===null){tx=ty=0;request();}},{passive:true});
  window.addEventListener('resize',()=>{width=innerWidth;height=innerHeight;},{passive:true});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',cancel);window.addEventListener('pageshow',sync);
  reduced.addEventListener('change',()=>{tx=ty=x=y=0;model?.pose(0,0);sync();});
  fine.addEventListener('change',()=>{tx=ty=0;request();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
  button.addEventListener('click',()=>{
    paused=!paused;button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused?'Resume hero animation':'Pause hero animation');
    button.querySelector('[data-motion-label]').textContent=paused?'Resume motion':'Pause motion';
    button.querySelector('path').setAttribute('d',paused?'M4 2l9 6-9 6z':'M4 2h3v12H4zM10 2h3v12h-3z');sync();
  });
  // The image paints first; the WebGL module loads independently of the rest of the page.
  import('./character-sculpture.mjs?v=2').then(({mountCharacter})=>mountCharacter(host)).then(result=>{model=result;hero.dataset.characterMode='3d';sync();}).catch(()=>{hero.dataset.characterMode='image';button.hidden=true;});
})();
