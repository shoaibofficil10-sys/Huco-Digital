(() => {
  'use strict';
  const hero=document.querySelector('[data-character-hero]');
  if(!hero)return;
  const host=hero.querySelector('[data-character-look]'), scene=hero.querySelector('.hk-scene'), button=hero.querySelector('[data-motion-toggle]');
  const ribbons=[...hero.querySelectorAll('.hk-orbit')];
  let ribbonsRunning=false;
  ribbons.forEach(ribbon=>ribbon.pauseAnimations());
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const ambient=matchMedia('(max-width: 800px), (pointer: coarse)');
  let model=null,started=false,visible=false,sceneVisible=false,paused=false,frame=0,previous=0,ambientTime=0,x=0,y=0,tx=0,ty=0;
  let width=innerWidth,height=innerHeight;
  const active=()=>visible&&sceneVisible&&!document.hidden&&!paused&&!reduced.matches;
  const cancel=()=>{if(frame)cancelAnimationFrame(frame);frame=0;previous=0;};
  function render(now){
    frame=0;if(!active()||!model)return;
    if(ambient.matches){
      // Mobile gets a real head turn, capped at 30 rendered frames per second.
      // Keep the animation clock still while paused or outside the viewport.
      const delta=previous?now-previous:34;
      if(delta>=1000/30){
        ambientTime+=Math.min(delta,66);previous=now;
        const phase=ambientTime/1000;
        x=Math.sin(phase*Math.PI/4.8)*.46;
        y=Math.sin(phase*Math.PI/6.4)*.18;
        model.pose(x,y);
      }
      frame=requestAnimationFrame(render);return;
    }
    const delta=previous?Math.min(50,now-previous):16;previous=now;
    const ease=1-Math.exp(-delta/150);x+=(tx-x)*ease;y+=(ty-y)*ease;
    model.pose(x,y);
    if(Math.abs(tx-x)+Math.abs(ty-y)>.002)frame=requestAnimationFrame(render);else previous=0;
  }
  const request=()=>{if(!frame&&active()&&model)frame=requestAnimationFrame(render);};
  function sync(){
    hero.classList.add('has-hero-motion');
    hero.classList.toggle('is-character-offscreen',!visible||document.hidden);
    hero.classList.toggle('is-scene-offscreen',!sceneVisible);
    hero.classList.toggle('is-motion-paused',paused||reduced.matches);
    hero.dataset.motionMode=ambient.matches?'ambient':'pointer';
    const runRibbons=active();
    if(runRibbons!==ribbonsRunning){
      ribbonsRunning=runRibbons;
      ribbons.forEach(ribbon=>runRibbons?ribbon.unpauseAnimations():ribbon.pauseAnimations());
    }
    if(!active()){cancel();return;}
    request();
  }
  window.addEventListener('pointermove',event=>{
    if(!active()||ambient.matches||!fine.matches||event.pointerType==='touch')return;
    tx=Math.max(-1,Math.min(1,event.clientX/width*2-1));
    ty=Math.max(-1,Math.min(1,event.clientY/height*2-1));request();
  },{passive:true});
  window.addEventListener('pointerout',event=>{if(event.relatedTarget===null){tx=ty=0;request();}},{passive:true});
  window.addEventListener('resize',()=>{width=innerWidth;height=innerHeight;},{passive:true});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>{cancel();ribbonsRunning=false;ribbons.forEach(ribbon=>ribbon.pauseAnimations());});window.addEventListener('pageshow',sync);
  reduced.addEventListener('change',()=>{tx=ty=x=y=0;model?.pose(0,0);loadModel();sync();});
  fine.addEventListener('change',()=>{tx=ty=0;loadModel();request();});
  ambient.addEventListener('change',()=>{tx=ty=0;previous=0;model?.setQuality(ambient.matches?1:1.6);loadModel();sync();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;loadModel();sync();},{threshold:0}).observe(hero);
  // Start the entrance when the artwork appears, not while mobile visitors read the copy.
  new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;loadModel();sync();},{threshold:0}).observe(scene);
  button.addEventListener('click',()=>{
    paused=!paused;button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused?'Resume hero animation':'Pause hero animation');
    button.querySelector('[data-motion-label]').textContent=paused?'Resume motion':'Pause motion';
    button.querySelector('path').setAttribute('d',paused?'M4 2l9 6-9 6z':'M4 2h3v12H4zM10 2h3v12h-3z');sync();
  });
  // The small matching poster paints immediately; WebGL loads only for visible artwork.
  // Desktop renders on demand. Mobile uses a lower pixel ratio and a capped ambient loop.
  function loadModel(){
    // Ribbons also move on touch devices and with the static character fallback.
    button.hidden=reduced.matches;
    if(started||!visible||!sceneVisible||reduced.matches)return;
    started=true;
    import('./character-sculpture.mjs?v=3').then(({mountCharacter})=>mountCharacter(host,{pixelRatio:ambient.matches?1:1.6})).then(result=>{model=result;hero.dataset.characterMode='3d';sync();}).catch(()=>{hero.dataset.characterMode='image';});
  }
})();
