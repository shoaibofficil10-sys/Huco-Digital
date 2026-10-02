(() => {
  'use strict';
  const hero=document.querySelector('[data-character-hero]');
  if(!hero)return;
  const host=hero.querySelector('[data-character-look]'), scene=hero.querySelector('.hk-scene');
  const ribbons=[...hero.querySelectorAll('.hk-orbit')];
  let ribbonsRunning=false;
  ribbons.forEach(ribbon=>ribbon.pauseAnimations());
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const ambient=matchMedia('(max-width: 800px), (pointer: coarse)');
  let model=null,started=false,visible=false,sceneVisible=false,frame=0,previous=0,nextDraw=0,ambientTime=0,x=0,y=0,tx=0,ty=0,vx=0,vy=0;
  let width=innerWidth,height=innerHeight;
  const active=()=>visible&&sceneVisible&&!document.hidden&&!reduced.matches;
  const cancel=()=>{if(frame)cancelAnimationFrame(frame);frame=0;previous=nextDraw=0;};
  function render(now){
    frame=0;if(!active()||!model)return;
    const delta=previous?Math.min(50,now-previous):1000/60;previous=now;
    if(ambient.matches){
      ambientTime+=delta;
      const phase=ambientTime/1000;
      tx=Math.sin(phase*Math.PI/4.8)*.46;
      ty=Math.sin(phase*Math.PI/6.4)*.18;
    }
    // Critically damped motion carries velocity through direction changes.
    // The exact time-based step is stable at different display refresh rates.
    const dt=delta/1000,omega=16,decay=Math.exp(-omega*dt);
    const dx=x-tx,dy=y-ty,ax=vx+omega*dx,ay=vy+omega*dy;
    x=tx+(dx+ax*dt)*decay;y=ty+(dy+ay*dt)*decay;
    vx=(vx-omega*ax*dt)*decay;vy=(vy-omega*ay*dt)*decay;
    // Keep the mobile turn fluid at up to 60 fps, without rendering at 120/144 fps.
    if(!ambient.matches||now>=nextDraw-.5){
      model.pose(x,y);
      const interval=1000/60;
      nextDraw=nextDraw&&now-nextDraw<interval?nextDraw+interval:now+interval;
    }
    if(ambient.matches||Math.abs(tx-x)+Math.abs(ty-y)>.00035||Math.abs(vx)+Math.abs(vy)>.003)frame=requestAnimationFrame(render);else previous=nextDraw=0;
  }
  const request=()=>{if(!frame&&active()&&model)frame=requestAnimationFrame(render);};
  function sync(){
    hero.classList.add('has-hero-motion');
    hero.classList.toggle('is-character-offscreen',!visible||document.hidden);
    hero.classList.toggle('is-scene-offscreen',!sceneVisible);
    hero.classList.toggle('is-motion-paused',reduced.matches);
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
  reduced.addEventListener('change',()=>{tx=ty=x=y=vx=vy=0;model?.pose(0,0);loadModel();sync();});
  fine.addEventListener('change',()=>{tx=ty=0;loadModel();request();});
  ambient.addEventListener('change',()=>{tx=ty=0;previous=nextDraw=0;loadModel();sync();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;loadModel();sync();},{threshold:0}).observe(hero);
  // Start the entrance when the artwork appears, not while mobile visitors read the copy.
  new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;loadModel();sync();},{threshold:0}).observe(scene);
  // The small matching poster paints immediately; WebGL loads only for visible artwork.
  // Desktop renders on demand. Mobile has a capped loop; resolution has a pixel budget.
  function loadModel(){
    // Ribbons also move on touch devices and with the static character fallback.
    if(started||!visible||!sceneVisible||reduced.matches)return;
    started=true;
    import('./character-sculpture.mjs?v=4').then(({mountCharacter})=>mountCharacter(host,{pixelRatio:2})).then(result=>{model=result;hero.dataset.characterMode='3d';sync();}).catch(()=>{hero.dataset.characterMode='image';});
  }
})();
