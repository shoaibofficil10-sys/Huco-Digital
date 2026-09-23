const menuToggle=document.getElementById('menuToggle'),mobileMenu=document.getElementById('mobileMenu');if(menuToggle&&mobileMenu){const closeBtn=mobileMenu.querySelector('.mobile-menu-close');const setMenu=(open)=>{mobileMenu.classList.toggle('open',open);mobileMenu.setAttribute('aria-hidden',String(!open));menuToggle.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''};menuToggle.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));closeBtn?.addEventListener('click',()=>setMenu(false));mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});window.addEventListener('resize',()=>{if(innerWidth>980)setMenu(false)})}
/* Cache document height; scrolling only writes composited progress. */
const header=document.getElementById('header');const progress=document.getElementById('progressBar');
(() => {
  let frame=0, max=1, scrolled=null;
  function render(){
    frame=0;
    const y=window.scrollY, next=y>30;
    if(header && next!==scrolled){header.classList.toggle('scrolled',next);scrolled=next;}
    if(progress)progress.style.transform=`scaleX(${Math.min(1,Math.max(0,y/max))})`;
  }
  const request=()=>{if(!frame)frame=requestAnimationFrame(render);};
  function measure(){max=Math.max(1,document.documentElement.scrollHeight-innerHeight);request();}
  new ResizeObserver(measure).observe(document.body);
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('load',measure,{once:true});
  measure();
})();
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');else if(e.boundingClientRect.top>0)e.target.classList.remove('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

/* Optional legacy industries interaction. Guarded so newer industry layouts do not stop the rest of the site JS. */
(() => {
  const industryItems=[...document.querySelectorAll('.industry-item')];
  const industryImage=document.getElementById('industryImage');
  const industryLabel=document.getElementById('industryLabel');
  const industryTitle=document.getElementById('industryTitle');
  const industryText=document.getElementById('industryText');
  if(!industryItems.length || !industryImage || !industryLabel || !industryTitle || !industryText) return;
  const industryData=[
    ['Real Estate','Digital journeys built to move buyers from interest to enquiry.','Property websites, launch campaigns, lead funnels and sales support.','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1500&q=90'],
    ['Healthcare','Clear digital experiences that build trust before the first appointment.','Clinic websites, campaigns, patient journeys and content systems.','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1500&q=90'],
    ['Hospitality','Experience-led design that turns attention into bookings.','Hotel, restaurant and destination websites, media and campaigns.','https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1500&q=90'],
    ['Professional Services','Sharper positioning for firms selling expertise and trust.','Consulting, legal, tax and B2B lead generation systems.','https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1500&q=90'],
    ['Ecommerce','Customer journeys designed to improve product discovery and conversion.','Shopify, WooCommerce, content and performance marketing.','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1500&q=90'],
    ['Automotive','Product-led digital experiences for a highly competitive category.','Catalogues, ecommerce, lead funnels and campaign content.','https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1500&q=90']
  ];
  function showIndustry(i){
    industryItems.forEach((b,n)=>b.classList.toggle('active',n===i));
    industryImage.style.opacity=.25;
    setTimeout(()=>{
      const d=industryData[i];
      industryLabel.textContent=d[0];
      industryTitle.textContent=d[1];
      industryText.textContent=d[2];
      industryImage.src=d[3];
      industryImage.onload=()=>industryImage.style.opacity=1;
    },180);
  }
  industryItems.forEach((b,i)=>['mouseenter','focus','click'].forEach(ev=>b.addEventListener(ev,()=>showIndustry(i))));
  industryImage.style.transition='opacity .35s ease';
})();



/* Scroll-driven word color animation for About heading */
(function(){
  const heading=document.querySelector('.about-scroll-heading');
  if(!heading) return;
  const text=heading.textContent.trim().replace(/\s+/g,' ');
  heading.innerHTML=text.split(' ').map(word=>`<span class="scroll-word">${word}</span>`).join(' ');
  const words=[...heading.querySelectorAll('.scroll-word')];
  let ticking=false;
  function update(){
    const rect=heading.getBoundingClientRect();
    const vh=window.innerHeight||document.documentElement.clientHeight;
    const start=vh*0.82;
    const end=vh*0.30;
    const progress=Math.max(0,Math.min(1,(start-rect.top)/(start-end)));
    const active=Math.round(progress*words.length);
    words.forEach((word,i)=>word.classList.toggle('is-colored',i<active));
    ticking=false;
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  update();
})();


/* Cinematic expanding services */
(function(){
  const cards=[...document.querySelectorAll('[data-service-card]')];
  if(!cards.length) return;
  const activate=(card)=>cards.forEach(c=>c.classList.toggle('is-active',c===card));
  cards.forEach(card=>{
    card.setAttribute('tabindex','0');
    ['mouseenter','focus','click'].forEach(eventName=>card.addEventListener(eventName,()=>activate(card)));
  });
})();


/* Service category tabs */
(function(){
 const tabs=[...document.querySelectorAll('[data-service-tab]')];
 const panels=[...document.querySelectorAll('[data-service-panel]')];
 if(!tabs.length) return;
 function activate(key){
   tabs.forEach(t=>t.classList.toggle('is-active',t.dataset.serviceTab===key));
   panels.forEach(p=>p.classList.toggle('is-active',p.dataset.servicePanel===key));
 }
 tabs.forEach(t=>t.addEventListener('click',()=>activate(t.dataset.serviceTab)));
})();


/* HUCO v7 interactive service experience */
(()=>{
  const root=document.querySelector('.services-v7-stage');
  if(!root) return;
  const tabs=[...root.querySelectorAll('[data-service-tab]')];
  const panels=[...root.querySelectorAll('[data-service-panel]')];
  const activate=(key)=>{
    tabs.forEach(t=>t.classList.toggle('is-active',t.dataset.serviceTab===key));
    panels.forEach(p=>p.classList.toggle('is-active',p.dataset.servicePanel===key));
  };
  tabs.forEach(tab=>{
    ['click','mouseenter','focus'].forEach(evt=>tab.addEventListener(evt,()=>activate(tab.dataset.serviceTab)));
  });
  panels.forEach(panel=>{
    const image=panel.querySelector('.services-v7-image');
    const rows=[...panel.querySelectorAll('.services-v7-row')];
    rows.forEach(row=>{
      const preview=()=>{
        rows.forEach(r=>r.classList.remove('is-active'));
        row.classList.add('is-active');
        const src=row.dataset.serviceImage;
        if(image&&src&&image.src!==src){
          image.style.opacity='.28';
          window.setTimeout(()=>{image.src=src;image.style.opacity='1';},130);
        }
      };
      row.addEventListener('mouseenter',preview);
      row.addEventListener('focus',preview);
      row.addEventListener('touchstart',preview,{passive:true});
    });
  });
})();
// V14 interactive process and counters
(() => {
  const data = [
    ['UNDERSTAND','We find the real problem before making anything.','Business goals, audience, competitors, current performance and the friction stopping growth.',['Discovery','Research','Audit']],
    ['DEFINE','We turn the problem into a focused direction.','Positioning, priorities, channel roles and a clear plan that every specialist can work from.',['Strategy','Journey','Plan']],
    ['CREATE','One team builds the complete experience.','Design, development, campaigns, content and production move together instead of in separate silos.',['Design','Build','Produce']],
    ['LAUNCH','We ship with the details already handled.','QA, tracking, publishing, media setup and launch support are built into the delivery.',['QA','Tracking','Go live']],
    ['IMPROVE','Performance feeds the next creative decision.','We learn from real behaviour, improve the system and keep the work moving after launch.',['Measure','Optimise','Grow']]
  ];
  const buttons=[...document.querySelectorAll('.process-rail button')].filter(button=>!button.closest('[data-process-scroll]')), screen=document.querySelector('.process-copy'), orbit=document.querySelector('.process-orbit b'), progress=document.querySelector('.process-progress');
  buttons.forEach((b,i)=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.remove('active'));b.classList.add('active');const d=data[i];screen.animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:380});screen.querySelector('small').textContent=d[0];screen.querySelector('h3').textContent=d[1];screen.querySelector('p').textContent=d[2];screen.querySelector('ul').innerHTML=d[3].map(x=>`<li>${x}</li>`).join('');orbit.textContent=String(i+1).padStart(2,'0');progress.style.height=(i/(buttons.length-1)*80)+'%';}));
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('[data-count]').forEach(el=>{let end=+el.dataset.count,start=0;const t=setInterval(()=>{start+=Math.max(1,Math.ceil(end/40));if(start>=end){start=end;clearInterval(t)}el.textContent=start},28)});obs.unobserve(e.target)}}),{threshold:.35});document.querySelectorAll('.results-v14').forEach(x=>obs.observe(x));
})();

/* Portfolio: predecode nearby images and keep scroll work out of layout. */
(() => {
  const story = document.querySelector('[data-portfolio-scroll]');
  if (!story) return;
  const slides = [...story.querySelectorAll('[data-portfolio-slide]')];
  if (!slides.length) return;
  const nav = [...story.querySelectorAll('[data-portfolio-nav]')];
  const dots = [...story.querySelectorAll('[data-portfolio-dot]')];
  const progress = story.querySelector('[data-portfolio-progress]');
  const fields = Object.fromEntries(['index', 'kicker', 'title', 'text', 'result', 'resultLabel'].map(key => [
    key, story.querySelector(`[data-portfolio-${key === 'resultLabel' ? 'result-label' : key}]`)
  ]));
  const copy = story.querySelector('.portfolio-scroll-copy');
  const serviceLink = copy?.querySelector('a');
  const desktop = matchMedia('(min-width:1101px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const images = slides.map(slide => [...slide.querySelectorAll('img')]);
  const warmed = new WeakSet();
  let active = -1, raf = 0, nearby = false, geometryDirty = true;
  let storyTop = 0, range = 1, previousProgress = -1;
  let navigation = null, navigationTimer = 0, textAnimations = [];

  function warmSlide(index, priority = 'low') {
    if (!slides[index]) return;
    images[index].forEach((img, position) => {
      // These two website cards are hidden by the existing desktop design.
      if (desktop.matches && slides[index].classList.contains('portfolio-web-grid') && position >= 4) return;
      img.fetchPriority = priority;
      if (warmed.has(img)) return;
      warmed.add(img);
      img.loading = 'eager';
      img.decode?.().catch(() => {});
    });
  }

  function warmNearby() {
    if (!nearby) return;
    warmSlide(active, 'auto');
    slides.forEach((_, index) => { if (index !== active) warmSlide(index); });
  }

  function setActive(index, initial = false) {
    index = Math.max(0, Math.min(slides.length - 1, index));
    if (index === active) return;
    active = index;
    if (nearby || !initial) warmSlide(index, 'auto');
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === index);
      slide.classList.toggle('is-before', position < index);
      slide.classList.toggle('is-after', position > index);
      slide.setAttribute('aria-hidden', String(position !== index));
      slide.inert = position !== index;
    });
    nav.forEach((button, position) => {
      button.classList.toggle('is-active', position === index);
      button.setAttribute('aria-pressed', String(position === index));
    });
    dots.forEach((dot, position) => dot.classList.toggle('is-active', position === index));
    const data = slides[index].dataset;
    Object.entries(fields).forEach(([key, element]) => {
      if (element) element.textContent = data[key] || '';
    });
    if (serviceLink && data.href) serviceLink.href = data.href;
    // Short, composited entrance without forcing a synchronous layout.
    textAnimations.forEach(animation => animation.cancel());
    textAnimations = [];
    if (copy && !initial && !reducedMotion.matches) {
      textAnimations = [...copy.children].map(element => element.animate(
        [{opacity:0, transform:'translateY(9px)'}, {opacity:1, transform:'none'}],
        {duration:240, easing:'ease-out', fill:'both'}
      ));
    }
  }

  function measure() {
    storyTop = story.getBoundingClientRect().top + window.scrollY;
    range = Math.max(1, story.offsetHeight - window.innerHeight);
    geometryDirty = false;
  }

  function finishNavigation() {
    clearTimeout(navigationTimer);
    navigation = null;
    requestUpdate();
  }

  function update() {
    raf = 0;
    if (geometryDirty) measure();
    if (!desktop.matches || !nearby) return;
    const position = Math.max(0, Math.min(1, (window.scrollY - storyTop) / range));
    if (navigation && Math.abs(window.scrollY - navigation.top) < 2) {
      clearTimeout(navigationTimer);
      navigation = null;
    }
    if (!navigation) {
      let index = Math.min(slides.length - 1, Math.floor(position * slides.length));
      // A small dead zone prevents trackpad jitter from flipping tabs repeatedly.
      if (Math.abs(index - active) === 1) {
        const boundary = Math.max(index, active) / slides.length;
        if (Math.abs(position - boundary) < .006) index = active;
      }
      setActive(index);
    }
    if (progress && position !== previousProgress) {
      progress.style.transform = `scaleX(${position})`;
      previousProgress = position;
    }
  }

  function requestUpdate() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  function refreshGeometry() {
    geometryDirty = true;
    requestUpdate();
  }

  function goTo(index) {
    clearTimeout(navigationTimer);
    navigation = null;
    // Read before changing any classes or text.
    if (geometryDirty) measure();
    setActive(index);
    if (!desktop.matches) return;
    const top = storyTop + ((index + .08) / slides.length) * range;
    navigation = {top};
    // Keep the clicked tab selected while native smooth scrolling passes other tabs.
    window.scrollTo({top, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
    navigationTimer = setTimeout(finishNavigation, 1400);
    requestUpdate();
  }

  nav.forEach((button, index) => {
    button.addEventListener('click', () => goTo(index));
    button.addEventListener('pointerenter', () => warmSlide(index, 'auto'));
    button.addEventListener('focus', () => warmSlide(index, 'auto'));
  });
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
  window.addEventListener('scroll', () => { if (nearby) requestUpdate(); }, {passive:true});
  window.addEventListener('resize', refreshGeometry, {passive:true});
  window.addEventListener('load', refreshGeometry, {once:true});
  window.addEventListener('scrollend', () => {
    if (navigation && Math.abs(window.scrollY - navigation.top) < 2) finishNavigation();
  }, {passive:true});
  const interruptNavigation = () => { if (navigation) finishNavigation(); };
  window.addEventListener('wheel', interruptNavigation, {passive:true});
  window.addEventListener('touchstart', interruptNavigation, {passive:true});
  window.addEventListener('pointerdown', interruptNavigation, {passive:true});
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) interruptNavigation();
  });
  desktop.addEventListener('change', () => {
    clearTimeout(navigationTimer);
    navigation = null;
    warmNearby();
    refreshGeometry();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) textAnimations.forEach(animation => animation.cancel());
  });
  new ResizeObserver(refreshGeometry).observe(story);
  new ResizeObserver(refreshGeometry).observe(document.body);
  document.fonts?.ready.then(refreshGeometry);
  new IntersectionObserver(entries => {
    nearby = entries[0].isIntersecting;
    story.classList.toggle('is-nearby', nearby);
    warmNearby();
    refreshGeometry();
  }, {rootMargin:'1200px 0px'}).observe(story);
  setActive(0, true);
  requestUpdate();
})();


/* About in-view motion */
(() => {
 const about=document.querySelector('.about-bento'); if(!about) return;
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){about.classList.add('is-inview');io.disconnect();}}),{threshold:.2});
 io.observe(about);
})();

// V28 testimonial motion: rise early, then horizontal scroll while sticky
(() => {
  const section = document.querySelector('[data-testimonial-scroll]');
  if (!section) return;
  const viewport = section.querySelector('[data-testimonial-cards]');
  if (!viewport) return;
  const cards = [...viewport.querySelectorAll('.testimonial-v26-card')];
  const ghost = section.querySelector('.testimonial-v26-ghost');
  const indexes = [...section.querySelectorAll('.testimonial-v26-index span')];

  // Wrap cards in a track once, so the same cards can rise and then travel horizontally.
  let track = viewport.querySelector('.testimonial-v26-cards-track');
  if (!track) {
    track = document.createElement('div');
    track.className = 'testimonial-v26-cards-track';
    cards.forEach(card => track.appendChild(card));
    viewport.appendChild(track);
  }

  const clamp = (v,min=0,max=1) => Math.max(min,Math.min(max,v));
  const easeOut = t => 1 - Math.pow(1-t,3);
  let raf = 0;

  function update(){
    if (window.innerWidth <= 900) {
      track.style.transform = '';
      return;
    }
    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    const p = clamp((-rect.top) / travel);

    // Cards arrive quickly in the first quarter of the section.
    const riseP = easeOut(clamp((p - .015) / .24));
    cards.forEach((card,i)=>{
      const stagger = Math.min(i * .022, .11);
      const cp = easeOut(clamp((p - .015 - stagger) / .22));
      const y = 165 * (1-cp);
      const scale = .965 + .035*cp;
      card.style.opacity = clamp(cp*1.7);
      card.style.transform = `translate3d(0,${y}px,0) scale(${scale})`;
    });

    // Once settled, the entire row scrolls horizontally for the rest of the sticky journey.
    const horizontalP = easeOut(clamp((p - .23) / .72));
    const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth + 60);
    track.style.transform = `translate3d(${-maxShift*horizontalP}px,0,0)`;

    if (ghost) {
      const gp = clamp((p - .03) / .30);
      ghost.style.opacity = .025 + gp*.025;
      ghost.style.transform = `translate(-50%,-50%) translateX(${34*(1-gp)}px)`;
    }

    const active = Math.min(cards.length-1, Math.floor(horizontalP * cards.length));
    indexes.forEach((el,i)=>el.classList.toggle('is-active', i===active));
  }

  const request = () => {
    if (raf) return;
    raf = requestAnimationFrame(()=>{ raf=0; update(); });
  };
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
  update();
})();

// V29 process interaction
(() => {
  const board=document.querySelector('[data-process-v29]'); if(!board)return;
  const tabs=[...board.querySelectorAll('[data-p29]')], feature=board.querySelector('.process-v29-feature');
  const data=[
    ['DISCOVER','We start with the business, not a deliverable.','We map the audience, competition, current performance and the real friction stopping growth.',['Research','Audit','Opportunity']],
    ['SHAPE','We turn insight into one clear direction.','Positioning, customer journeys, channel roles and priorities become a plan every specialist can build from.',['Strategy','Journey','Roadmap']],
    ['CREATE','Strategy, design, media and technology move together.','Our specialists build the experience as one connected system, from content and campaigns to product and production.',['Design','Content','Build']],
    ['GROW','Launch is where the next learning cycle begins.','Tracking, optimisation and creative iteration turn live performance into better decisions and stronger growth.',['Launch','Measure','Optimise']]
  ];
  tabs.forEach((btn,i)=>btn.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');const d=data[i];
    feature.classList.remove('is-changing');void feature.offsetWidth;feature.classList.add('is-changing');
    feature.querySelector('.p29-word').textContent=d[0];feature.querySelector('.p29-stamp').textContent=`0${i+1} / 04`;
    feature.querySelector('.process-v29-copy>span').textContent=`0${i+1} · ${d[0]}`;feature.querySelector('h3').textContent=d[1];feature.querySelector('.process-v29-copy p').textContent=d[2];feature.querySelector('.process-v29-tags').innerHTML=d[3].map(x=>`<em>${x}</em>`).join('');
  }));
})();

// V29 testimonial motion
(() => {
  const section=document.querySelector('[data-testimonial-v29]'); if(!section)return;
  const viewport=section.querySelector('[data-t29-viewport]'),track=section.querySelector('[data-t29-track]'),cards=[...track.children],bar=section.querySelector('[data-t29-progress]');
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)); const ease=t=>1-Math.pow(1-t,3); let raf=0;
  function update(){
    if(innerWidth<=900){track.style.transform='';cards.forEach(c=>{c.style.opacity=1;c.style.transform='none'});return}
    const r=section.getBoundingClientRect(),travel=Math.max(1,section.offsetHeight-innerHeight),p=clamp(-r.top/travel);
    const rise=ease(clamp((p-.01)/.15)); cards.forEach((c,i)=>{const cp=ease(clamp((p-.01-i*.012)/.15));c.style.opacity=clamp(cp*1.8);c.style.transform=`translateY(${90*(1-cp)}px) scale(${.97+.03*cp})`});
    const hp=ease(clamp((p-.13)/.84)),max=Math.max(0,track.scrollWidth-viewport.clientWidth);track.style.transform=`translate3d(${-max*hp}px,0,0)`;if(bar)bar.style.width=`${hp*100}%`;
  }
  const req=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update()})};addEventListener('scroll',req,{passive:true});addEventListener('resize',req,{passive:true});update();
})();

// V30 process: scroll-linked stage changes, buttons still clickable
(() => {
  const section = document.querySelector('[data-process-scroll]');
  if(!section) return;
  const buttons=[...section.querySelectorAll('.process-rail button')];
  const screen=section.querySelector('.process-copy');
  const orbit=section.querySelector('.process-orbit b');
  const progress=section.querySelector('.process-progress');
  const data=[
    ['01','UNDERSTAND','We find the real problem before making anything.','Business goals, audience, competitors, current performance and the friction stopping growth.',['Discovery','Research','Audit']],
    ['02','DEFINE','We turn insight into one clear direction.','Positioning, channel priorities, user journeys and a practical plan that every discipline can work from.',['Strategy','Journey','Plan']],
    ['03','CREATE','Design, content and technology move together.','Creative, web, production and campaign assets are built as one connected system rather than separate deliverables.',['Design','Build','Production']],
    ['04','LAUNCH','We put the work in front of the right audience.','Campaign setup, tracking, QA and launch are handled with clear ownership and measurable goals.',['Launch','Media','Tracking']],
    ['05','IMPROVE','Performance becomes the next creative brief.','We learn from data, improve weak points and keep iterating across content, media and digital experience.',['Optimise','Learn','Scale']]
  ];
  const mobile = matchMedia('(max-width:980px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const stage = section.querySelector('.process-v30-stage');
  const playButton = section.querySelector('.process-autoplay');
  let active = -1, visible = false, paused = reducedMotion.matches, timer = 0;
  function show(i) {
    i = (i + data.length) % data.length;
    if (i === active) return;
    active = i;
    const d = data[i];
    buttons.forEach((button, n) => {
      button.classList.toggle('active', n === i);
      button.setAttribute('aria-pressed', String(n === i));
    });
    orbit.textContent = d[0];
    screen.querySelector('small').textContent = d[0] + ' · ' + d[1];
    screen.querySelector('h3').textContent = d[2];
    screen.querySelector('p').textContent = d[3];
    screen.querySelector('ul').replaceChildren(...d[4].map(text => {
      const item = document.createElement('li'); item.textContent = text; return item;
    }));
    progress.style.height = ((i / (data.length - 1)) * Math.max(0, section.querySelector('.process-rail').clientHeight - 110)) + 'px';
  }
  function schedule() {
    clearTimeout(timer);
    if (playButton) {
      playButton.textContent = paused ? 'Play' : 'Pause';
      playButton.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' automatic process steps');
    }
    if (mobile.matches && visible && !paused && !document.hidden) {
      timer = setTimeout(() => { show(active + 1); schedule(); }, 6500);
    }
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => {
    show(i);
    if (mobile.matches) { paused = true; schedule(); }
    else section.scrollIntoView({behavior:reducedMotion.matches ? 'instant' : 'smooth', block:'start'});
  }));
  playButton?.addEventListener('click', () => { paused = !paused; schedule(); });
  // Keyboard reading should never be interrupted by changing copy.
  stage.addEventListener('focusin', event => {
    if (mobile.matches && event.target !== playButton) { paused = true; schedule(); }
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; schedule();
  }, {threshold:0.35}).observe(stage);
  let scrollFrame=0, scrollNearby=false;
  function onScroll() {
    scrollFrame=0;
    if (mobile.matches || !scrollNearby) return;
    const r = section.getBoundingClientRect(), vh = innerHeight;
    const start = vh * .55, end = -Math.max(180, r.height - vh * .7);
    const fraction = Math.max(0, Math.min(1, (start - r.top) / (start - end)));
    show(Math.round(fraction * (data.length - 1)));
  }
  const requestScroll=()=>{if(scrollNearby&&!scrollFrame)scrollFrame=requestAnimationFrame(onScroll);};
  new IntersectionObserver(entries=>{scrollNearby=entries[0].isIntersecting;requestScroll();},{rootMargin:'200px 0px'}).observe(section);
  addEventListener('scroll', requestScroll, {passive:true});
  mobile.addEventListener('change', () => { schedule(); onScroll(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  show(0); onScroll();

})();

// V30 testimonials: rise quickly, then horizontal scroll while sticky
(() => {
  const section=document.querySelector('[data-testimonial-v30]'); if(!section)return;
  const viewport=section.querySelector('[data-t30-viewport]'); const track=section.querySelector('[data-t30-track]');
  const cards=[...track.children]; const prog=section.querySelector('[data-t30-progress]');
  function render(){
    if(window.innerWidth<901)return;
    const r=section.getBoundingClientRect(), vh=window.innerHeight;
    const total=Math.max(1,section.offsetHeight-vh); const p=Math.max(0,Math.min(1,-r.top/total));
    const rise=Math.min(1,p/.22);
    cards.forEach((card,i)=>{const delay=i*.035; const cp=Math.max(0,Math.min(1,(rise-delay)/(1-delay||1))); card.style.opacity=cp; card.style.transform=`translate3d(0,${(1-cp)*115}px,0) scale(${.97+cp*.03})`;});
    const hp=Math.max(0,Math.min(1,(p-.18)/.82));
    const maxShift=Math.max(0,track.scrollWidth-viewport.clientWidth);
    track.style.transform=`translate3d(${-maxShift*hp}px,0,0)`;
    if(prog)prog.style.transform=`scaleX(${hp})`;
  }
  window.addEventListener('scroll',render,{passive:true}); window.addEventListener('resize',render); render();
})();


// V31 insights entrance animation
(() => {
 const section=document.querySelector('.insights-v14'); if(!section)return;
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){section.classList.add('is-visible');io.disconnect();}}),{threshold:.18});
 io.observe(section);
})();

// V32 testimonial motion, early rise then horizontal travel
(() => {
  const section=document.querySelector('[data-testimonial-v32]'); if(!section)return;
  const track=section.querySelector('[data-t32-track]'); const cards=[...track.children];
  const stage=section.querySelector('.testimonial-v32-stage'); const progress=section.querySelector('[data-t32-progress]');
  let frame = 0, nearby = false;
  function render(){
    frame = 0;
    if(!nearby)return;
    if(innerWidth<=980){track.style.transform='';return;}
    const r=section.getBoundingClientRect(), vh=innerHeight;
    if(r.top >= vh || r.bottom <= 0)return;
    const total=Math.max(1,section.offsetHeight-vh); const p=Math.max(0,Math.min(1,-r.top/total));
    const max=Math.max(0,track.scrollWidth-stage.clientWidth);
    const rise=Math.min(1,p/.14);
    cards.forEach((c,i)=>{
      const d=i*.018, cp=Math.max(0,Math.min(1,(rise-d)/(1-d||1)));
      c.style.opacity=cp;
      c.style.transform=`translate3d(0,${(1-cp)*(72+i*5)}px,0) scale(${.965+cp*.035}) rotate(${(1-cp)*(i%2?1.2:-1.2)}deg)`;
    });
    const hp=Math.max(0,Math.min(1,(p-.12)/.88));
    track.style.transform=`translate3d(${-max*hp}px,0,0)`;
    if(progress)progress.style.transform=`scaleX(${hp})`;
  }
  const request = () => { if(nearby&&!frame) frame=requestAnimationFrame(render); };
  new IntersectionObserver(entries=>{nearby=entries[0].isIntersecting;request();},{rootMargin:'200px 0px'}).observe(section);
  addEventListener('scroll',request,{passive:true}); addEventListener('resize',request);
})();

// V32 insight reveal
(() => {
  const sec=document.querySelector('.insights-v32'); if(!sec)return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){sec.classList.add('is-visible');io.disconnect();}}),{threshold:.15});
  io.observe(sec);
})();

// V32 live button treatment + small magnetic response on pointer devices
(() => {
  const selector=['.header-cta','.primary-btn','.text-btn','.services-v7-link','.portfolio-v24-link','.contact-v21-bottom button','.footer-v21-news button','.insights-all','.insights-v32-grid a','.mobile-menu a:last-child'].join(',');
  document.querySelectorAll(selector).forEach(el=>{
    el.classList.add('live-btn');
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.08;const y=(e.clientY-r.top-r.height/2)*.12;el.style.transform=`translate(${x}px,${y}px) translateY(-2px)`});
      el.addEventListener('pointerleave',()=>el.style.transform='');
    }
  });
})();

// V32 outcome counters + bar reveal
(() => {
  const sec=document.querySelector('.results-v32'); if(!sec)return;
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;
    const wrap=sec.querySelector('.results-v32-wrap'); wrap?.classList.add('is-visible');
    sec.querySelectorAll('[data-count]').forEach(el=>{
      const end=Number(el.dataset.count)||0; let start=0; const dur=1100; const t0=performance.now();
      const tick=now=>{const p=Math.min(1,(now-t0)/dur); const eased=1-Math.pow(1-p,3); start=Math.round(end*eased); el.textContent=start; if(p<1)requestAnimationFrame(tick);};
      requestAnimationFrame(tick);
    });
    io.disconnect();
  }),{threshold:.3}); io.observe(sec);
})();

// V48 client logo hover and live story
(() => {
  const grid = document.querySelector('[data-clients-grid]');
  if (!grid) return;
  const cells = [...grid.querySelectorAll('.client-logo-item')];
  const count = document.querySelector('.clients-story-count');
  const title = document.querySelector('.clients-story-title');
  const copy = document.querySelector('.clients-story-copy');
  const activate = (cell,index) => {
    cells.forEach((c,n)=>c.classList.toggle('is-active',n===index));
    if(count) count.textContent=String(index+1).padStart(2,'0')+' / '+String(cells.length).padStart(2,'0');
    if(title) title.textContent=cell.dataset.clientTitle || 'Selected client';
    if(copy) copy.textContent=cell.dataset.clientCopy || '';
  };
  cells.forEach((cell,index)=>{
    cell.addEventListener('mouseenter',()=>activate(cell,index));
    cell.addEventListener('focus',()=>activate(cell,index));
    cell.addEventListener('click',()=>activate(cell,index));
  });
  grid.addEventListener('mouseleave',()=>cells.forEach(c=>c.classList.remove('is-active')));
  activate(cells[0],0);
})();


/* Run decorative video only while it can actually be seen. */
(()=>{
  const video=document.querySelector('.hero-video');
  if(!video)return;
  video.loop=true;video.muted=true;video.playsInline=true;
  let visible=false;
  function sync(){
    if(visible&&!document.hidden){if(video.paused)video.play().catch(()=>{});}
    else video.pause();
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(video);
  window.addEventListener('pageshow',sync);
  document.addEventListener('visibilitychange',sync);
})();

/* Pause offscreen decorative CSS motion on the homepage. */
(()=>{
  if(!document.querySelector('[data-portfolio-scroll]'))return;
  document.body.classList.add('home-motion-managed');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    entry.target.classList.toggle('is-motion-offscreen',!entry.isIntersecting);
  }),{rootMargin:'100px 0px'});
  document.querySelectorAll('main > section').forEach(section=>observer.observe(section));
})();

// Inner page reveal animations
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), { threshold: .12 });
  els.forEach(el => io.observe(el));
})();

/* About V5 process: auto-playing workflow with manual control */
(() => {
  const root = document.querySelector('[data-about-process]');
  if (!root) return;
  const steps = [...root.querySelectorAll('[data-process-step]')];
  const rail = root.querySelector('.process-v4-rail span');
  const count = root.querySelector('.process-v4-count');
  const kicker = root.querySelector('[data-process-kicker]');
  const title = root.querySelector('[data-process-title]');
  const text = root.querySelector('[data-process-text]');
  const tags = root.querySelector('[data-process-tags]');
  const copy = root.querySelector('.process-v4-copy');
  const data = [
    ['DISCOVER','Understand what needs to change.','Business goal, audience, current data, constraints and success criteria.',['Audit','Research','Signals']],
    ['DEFINE','Turn the problem into a focused direction.','Scope, channel mix, creative direction, technical plan and the milestones that matter.',['Strategy','Journey','Plan']],
    ['DELIVER','Make and launch as one connected workflow.','Production, design, development, QA, approvals and launch coordination move together.',['Create','Build','Launch']],
    ['IMPROVE','Use evidence to choose the next move.','Performance review, friction analysis, learning and prioritised iteration feed the next cycle.',['Measure','Learn','Grow']]
  ];
  let index = 0, timer = null, inView = false;
  const activate = (i) => {
    index = i;
    steps.forEach((el,n)=>el.classList.toggle('is-active',n===i));
    if (rail) rail.style.transform = `translateX(${i*100}%)`;
    if (count) count.textContent = String(i+1).padStart(2,'0');
    if (copy) { copy.classList.remove('is-changing'); void copy.offsetWidth; copy.classList.add('is-changing'); }
    kicker.textContent = data[i][0]; title.textContent = data[i][1]; text.textContent = data[i][2];
    tags.innerHTML = data[i][3].map(x=>`<em>${x}</em>`).join('');
  };
  const start = () => { clearInterval(timer); if (inView && !matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(()=>activate((index+1)%steps.length),2400); };
  steps.forEach((el,i)=>el.addEventListener('click',()=>{activate(i);start()}));
  const io = new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)start();else clearInterval(timer)},{threshold:.35});
  io.observe(root); activate(0);
})();

// V16 team carousel, seven-card full-width fan
(() => {
  const root = document.querySelector('[data-team-carousel]');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-team-card]')];
  const dots = [...root.querySelectorAll('[data-team-dot]')];
  const prev = root.querySelector('[data-team-prev]');
  const next = root.querySelector('[data-team-next]');
  const count = root.querySelector('[data-team-count]');
  const description = root.querySelector('[data-team-description]');
  const states = [
    {bg:'#8d2028',accent:'#ff7379',copy:'Senior growth specialists connect audience, media and measurement to the same commercial objective.'},
    {bg:'#244b40',accent:'#a6cfb6',copy:'Creative direction stays close to the brief, so ideas are built for the channels where people actually see them.'},
    {bg:'#b85b24',accent:'#ffb16f',copy:'Production turns concepts into sharp, useful content while protecting the original idea and timeline.'},
    {bg:'#302c35',accent:'#d7cddd',copy:'Product and technology specialists build the systems, experiences and automation behind the customer journey.'},
    {bg:'#775036',accent:'#e8c3a0',copy:'Client experience keeps communication, priorities and delivery aligned from kickoff through final handover.'},
    {bg:'#263f55',accent:'#8db5d8',copy:'Media specialists connect creative, targeting and channel decisions so attention turns into measurable demand.'},
    {bg:'#6d3747',accent:'#e5a3b6',copy:'Experience designers shape clear digital journeys that feel useful, intuitive and consistent across every touchpoint.'}
  ];

  const slotSets = () => {
    const w = window.innerWidth;

    // Every position follows one shared, symmetric fan arc.
    // Center is highest/largest. Each step outward moves lower and rotates more.
    if (w <= 760) return [
      {left:'-13%',y:112,r:-34,s:.72,o:.22,z:1,sat:.72,br:.72},
      {left:'8%',y:76,r:-23,s:.79,o:.58,z:2,sat:.82,br:.82},
      {left:'29%',y:32,r:-11,s:.89,o:.94,z:5,sat:.96,br:.96},
      {left:'50%',y:0,r:0,s:1.02,o:1,z:10,sat:1,br:1},
      {left:'71%',y:32,r:11,s:.89,o:.94,z:5,sat:.96,br:.96},
      {left:'92%',y:76,r:23,s:.79,o:.58,z:2,sat:.82,br:.82},
      {left:'113%',y:112,r:34,s:.72,o:.22,z:1,sat:.72,br:.72}
    ];

    if (w <= 1100) return [
      {left:'-3%',y:128,r:-35,s:.73,o:.62,z:1,sat:.78,br:.78},
      {left:'15%',y:82,r:-24,s:.81,o:.80,z:3,sat:.87,br:.87},
      {left:'33%',y:34,r:-12,s:.91,o:.97,z:6,sat:.98,br:.98},
      {left:'50%',y:0,r:0,s:1.04,o:1,z:11,sat:1,br:1},
      {left:'67%',y:34,r:12,s:.91,o:.97,z:6,sat:.98,br:.98},
      {left:'85%',y:82,r:24,s:.81,o:.80,z:3,sat:.87,br:.87},
      {left:'103%',y:128,r:35,s:.73,o:.62,z:1,sat:.78,br:.78}
    ];

    return [
      {left:'-2.5%',y:140,r:-36,s:.76,o:.72,z:1,sat:.82,br:.80},
      {left:'15%',y:86,r:-24,s:.84,o:.87,z:3,sat:.90,br:.89},
      {left:'32.5%',y:34,r:-12,s:.93,o:.98,z:6,sat:.98,br:.98},
      {left:'50%',y:0,r:0,s:1.06,o:1,z:12,sat:1,br:1},
      {left:'67.5%',y:34,r:12,s:.93,o:.98,z:6,sat:.98,br:.98},
      {left:'85%',y:86,r:24,s:.84,o:.87,z:3,sat:.90,br:.89},
      {left:'102.5%',y:140,r:36,s:.76,o:.72,z:1,sat:.82,br:.80}
    ];
  };

  let active = 0, timer, dragStart = null;
  const relative = (index) => {
    let d = index - active;
    const half = Math.floor(cards.length/2);
    while (d > half) d -= cards.length;
    while (d < -half) d += cards.length;
    return d;
  };
  const layout = () => {
    const slots = slotSets();
    cards.forEach((card,i) => {
      const d = relative(i);
      const slot = slots[d + 3];
      if (!slot) return;
      card.style.setProperty('--slot-left',slot.left);
      card.style.setProperty('--slot-y',slot.y+'px');
      card.style.setProperty('--slot-r',slot.r+'deg');
      card.style.setProperty('--slot-s',slot.s);
      card.style.setProperty('--slot-o',slot.o);
      card.style.setProperty('--slot-z',slot.z);
      card.style.setProperty('--slot-sat',slot.sat);
      card.style.setProperty('--slot-br',slot.br);
      card.classList.toggle('is-active',i===active);
    });
  };
  const activate = (i,restart=true) => {
    active = (i + cards.length) % cards.length;
    layout();
    dots.forEach((d,n)=>d.classList.toggle('is-active',n===active));
    const state = states[active] || states[0];
    root.style.setProperty('--team-bg',state.bg);
    root.style.setProperty('--team-accent',state.accent);
    if(count) count.textContent = String(active+1).padStart(2,'0') + ' / ' + String(cards.length).padStart(2,'0');
    if(description) description.textContent = state.copy;
    if(restart) start();
  };
  const start = () => {
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer=setInterval(()=>activate(active+1,false),4600);
  };
  cards.forEach((c,i)=>c.addEventListener('click',()=>activate(i)));
  dots.forEach((d,i)=>d.addEventListener('click',()=>activate(i)));
  prev?.addEventListener('click',()=>activate(active-1));
  next?.addEventListener('click',()=>activate(active+1));
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',start);
  root.addEventListener('pointerdown',e=>{dragStart=e.clientX;clearInterval(timer)});
  root.addEventListener('pointerup',e=>{if(dragStart===null)return;const dx=e.clientX-dragStart;if(Math.abs(dx)>55)activate(active+(dx<0?1:-1));else start();dragStart=null});
  root.addEventListener('pointercancel',()=>{dragStart=null;start()});
  window.addEventListener('resize',layout);
  activate(0,false);
  start();
})();;

// V34 desktop services mega menu
(() => {
  const trigger=document.querySelector('.services-trigger');
  const mega=document.getElementById('servicesMega');
  if(!trigger || !mega) return;
  let closeTimer;
  const desktop=()=>window.innerWidth>960;
  const open=()=>{if(!desktop())return;clearTimeout(closeTimer);mega.classList.add('is-open');mega.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true')};
  const close=()=>{clearTimeout(closeTimer);closeTimer=setTimeout(()=>{mega.classList.remove('is-open');mega.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false')},120)};
  trigger.addEventListener('mouseenter',open);trigger.addEventListener('focus',open);
  trigger.addEventListener('click',e=>{if(desktop()){e.preventDefault();mega.classList.contains('is-open')?close():open()}});
  trigger.addEventListener('mouseleave',close);mega.addEventListener('mouseenter',open);mega.addEventListener('mouseleave',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){mega.classList.remove('is-open');trigger.setAttribute('aria-expanded','false')}});
  document.addEventListener('click',e=>{if(desktop()&&!mega.contains(e.target)&&!trigger.contains(e.target)){mega.classList.remove('is-open');trigger.setAttribute('aria-expanded','false')}});
  window.addEventListener('resize',()=>{if(!desktop()) mega.classList.remove('is-open')});
})();


// HUCO V35 interactions
(() => {
  const mega = document.querySelector('.services-mega-v35');
  if (mega) mega.addEventListener('pointermove', (e) => {
    const r = mega.getBoundingClientRect();
    mega.style.setProperty('--mx', `${((e.clientX-r.left)/r.width)*100}%`);
    mega.style.setProperty('--my', `${((e.clientY-r.top)/r.height)*100}%`);
  });
  const track = document.getElementById('pm35Track');
  if (track) {
    const prev = document.querySelector('.pm35-slide-arrow.prev');
    const next = document.querySelector('.pm35-slide-arrow.next');
    const step = () => Math.min(track.clientWidth * .78, 420);
    prev?.addEventListener('click', () => track.scrollBy({left:-step(),behavior:'smooth'}));
    next?.addEventListener('click', () => track.scrollBy({left:step(),behavior:'smooth'}));
  }
})();

/* HUCO Services V9 interactive visual */
(() => {
  const root = document.querySelector('[data-services-v9]');
  if (!root) return;
  const rows = [...root.querySelectorAll('[data-v9-service]')];
  const images = [...root.querySelectorAll('[data-v9-image]')];
  const label = root.querySelector('[data-v9-label]');
  const railCurrent = root.querySelector('.services-v9-rail b');
  const subsWrap = root.querySelector('[data-v9-subs]');
  const count = root.querySelector('[data-v9-count]');
  const detail = root.querySelector('.services-v9-detail');

  const data = [
    {
      label: 'Digital Marketing',
      subs: [
        ['Performance Marketing','performance-marketing.html'],
        ['SEO & Generative Search','seo-generative-search.html'],
        ['Social Media Growth','social-media-growth.html'],
        ['Lead Generation Systems','lead-generation-systems.html'],
        ['Strategy & Reporting','strategy-reporting.html']
      ]
    },
    {
      label: 'Video & Production',
      subs: [
        ['Video Production','video-production.html'],
        ['Photography','photography.html'],
        ['Wedding Photography','wedding-photography.html'],
        ['Social Content Studio','social-content-studio.html'],
        ['Social Content Studio','social-content-studio.html']
      ]
    },
    {
      label: 'Development',
      subs: [
        ['Web Design & Development','web-design-development.html'],
        ['Mobile App Development','mobile-app-development.html'],
        ['E-commerce Experiences','ecommerce-experiences.html'],
        ['ERP, CRM & Portals','erp-crm-portals.html'],
        ['Dedicated Tech Teams','dedicated-tech-teams.html']
      ]
    },
    {
      label: 'Business Platforms',
      subs: [
        ['ERP, CRM & Portals','erp-crm-portals.html'],
        ['Dedicated Tech Teams','dedicated-tech-teams.html'],
        ['E-commerce Experiences','ecommerce-experiences.html'],
        ['Strategy & Reporting','strategy-reporting.html']
      ]
    }
  ];

  let active = 0;
  const renderSubs = (items) => {
    if (!subsWrap) return;
    subsWrap.innerHTML = items.map((item,i) => `<a href="${item[1]}"><span>${String(i+1).padStart(2,'0')}</span>${item[0]}<i><svg class="huco-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></i></a>`).join('');
    if (count) count.textContent = `${String(items.length).padStart(2,'0')} services`;
  };
  const setActive = (index) => {
    if (index === active && rows[index]?.classList.contains('is-active')) return;
    active = index;
    rows.forEach((row,i) => row.classList.toggle('is-active', i === index));
    images.forEach((img,i) => img.classList.toggle('is-active', i === index));
    if (label) label.textContent = data[index].label;
    if (railCurrent) railCurrent.textContent = String(index + 1).padStart(2,'0');
    renderSubs(data[index].subs);
    if (detail) {
      detail.classList.remove('is-switching');
      void detail.offsetWidth;
      detail.classList.add('is-switching');
    }
  };

  rows.forEach((row,index) => {
    row.addEventListener('mouseenter', () => setActive(index));
    row.addEventListener('focus', () => setActive(index));
  });
  renderSubs(data[0].subs);
})();





/* V71 isolated service delivery-path scroll interaction */
(() => {
  const flows = [...document.querySelectorAll('[data-flow]')];
  if (!flows.length) return;

  const updateFlow = (flow) => {
    const steps = [...flow.querySelectorAll('[data-step]')];
    const progress = flow.querySelector('.pm42-flow-progress');
    if (!steps.length) return;

    const viewportPoint = window.innerHeight * 0.48;
    let active = 0;
    let best = Infinity;

    steps.forEach((step, i) => {
      const r = step.getBoundingClientRect();
      const center = r.top + r.height * 0.5;
      const distance = Math.abs(center - viewportPoint);
      if (distance < best) {
        best = distance;
        active = i;
      }
    });

    steps.forEach((step, i) => step.classList.toggle('is-active', i === active));

    if (progress) {
      const pct = steps.length > 1 ? (active / (steps.length - 1)) * 100 : 0;
      progress.style.height = pct + '%';
    }
  };

  let ticking = false;
  const updateAll = () => {
    flows.forEach(updateFlow);
    ticking = false;
  };
  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateAll);
    }
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateAll();
})();
