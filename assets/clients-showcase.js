/* A small orthographic Earth: spin longitude while keeping the sphere fixed. */
(() => {
  const canvas = document.querySelector('.client-earth');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const map = document.createElement('canvas');
  map.width = 720; map.height = 360;
  const paint = map.getContext('2d');
  if (!paint) return;
  paint.fillStyle = '#397caa'; paint.fillRect(0, 0, 720, 360);
  // Simplified coastlines are intentionally lightweight at this 60px display size.
  const lands = [
    [[-168,72],[-145,70],[-130,58],[-124,49],[-123,40],[-116,30],[-106,23],[-98,16],[-88,15],[-83,9],[-77,8],[-81,19],[-87,22],[-90,29],[-81,25],[-80,32],[-74,40],[-63,47],[-55,53],[-63,60],[-80,63],[-95,73],[-120,76],[-150,72]],
    [[-73,60],[-48,59],[-21,70],[-25,82],[-48,84],[-65,77]],
    [[-81,12],[-70,11],[-62,7],[-51,3],[-35,-5],[-40,-18],[-48,-27],[-54,-35],[-65,-55],[-73,-49],[-75,-32],[-80,-8]],
    [[-17,35],[-5,36],[11,37],[25,32],[33,31],[35,23],[43,12],[51,11],[43,0],[40,-12],[32,-28],[19,-35],[12,-24],[9,-5],[-1,4],[-10,5],[-17,15]],
    [[-10,36],[-9,44],[2,49],[10,55],[5,60],[15,71],[30,70],[42,66],[57,69],[80,73],[105,77],[135,71],[175,66],[180,53],[160,52],[145,43],[135,34],[122,25],[110,20],[106,9],[99,5],[96,18],[88,22],[80,8],[73,20],[62,25],[54,24],[44,12],[36,30],[27,41],[15,45],[12,37],[5,43]],
    [[112,-11],[132,-12],[142,-10],[153,-26],[146,-39],[131,-33],[115,-35]],
    [[47,-13],[50,-17],[47,-25],[44,-21]],
    [[130,31],[141,42],[145,44],[142,35],[135,31]],
    [[-8,50],[-6,59],[0,58],[2,51]],
    [[96,5],[108,-6],[119,-9],[115,-4],[104,0]],
    [[130,-3],[142,-2],[151,-8],[141,-10]],
    [[166,-34],[179,-39],[173,-46],[166,-45]],
    [[-180,-72],[-120,-76],[-60,-70],[0,-74],[60,-70],[120,-73],[180,-72],[180,-90],[-180,-90]]
  ];
  const terrain = paint.createLinearGradient(0, 50, 0, 310);
  terrain.addColorStop(0, '#d9ddcd'); terrain.addColorStop(.25, '#819a79');
  terrain.addColorStop(.43, '#c7b68e'); terrain.addColorStop(.56, '#829772');
  terrain.addColorStop(.76, '#a4aa83'); terrain.addColorStop(1, '#e8eeef');
  paint.fillStyle = terrain;
  lands.forEach(points => {
    paint.beginPath(); points.forEach(([lon,lat],i) => {
      const x = (lon + 180) * 2, y = (90 - lat) * 2;
      if (i) paint.lineTo(x,y); else paint.moveTo(x,y);
    }); paint.closePath(); paint.fill();
  });
  const texture = paint.getImageData(0, 0, 720, 360).data;
  const size = canvas.width, radius = size / 2 - 2;
  const frame = context.createImageData(size, size);
  const surface = [];
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    const nx=(x-size/2+.5)/radius, ny=(size/2-y-.5)/radius;
    const distance=nx*nx+ny*ny;
    if (distance>1) continue;
    const z=Math.sqrt(1-distance);
    surface.push({offset:(y*size+x)*4,lon:Math.atan2(nx,z),row:Math.min(359,Math.floor((Math.PI/2-Math.asin(ny))*360/Math.PI)),light:.38+.62*Math.max(0,-nx*.35+ny*.2+z*.91),alpha:Math.min(1,(1-Math.sqrt(distance))*radius)*255});
  }
  let rotation=20*Math.PI/180;
  function draw() {
    surface.forEach(pixel => {
      const column=Math.floor(((pixel.lon+rotation+Math.PI)/(2*Math.PI)*720)%720+720)%720;
      const source=(pixel.row*720+column)*4, dest=pixel.offset;
      frame.data[dest]=texture[source]*pixel.light;
      frame.data[dest+1]=texture[source+1]*pixel.light;
      frame.data[dest+2]=texture[source+2]*pixel.light;
      frame.data[dest+3]=pixel.alpha;
    });
    context.putImageData(frame,0,0);
  }
  draw(); canvas.parentElement.classList.add('earth-ready');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false, request=0, previous=0;
  function tick(now) {
    if (!visible || document.hidden || reduced.matches) { request=0; previous=0; return; }
    if (!previous || now-previous>=40) {
      if (previous) rotation+=(now-previous)/24000*Math.PI*2;
      previous=now; draw();
    }
    request=requestAnimationFrame(tick);
  }
  function resume() { if (!request && visible && !document.hidden && !reduced.matches) request=requestAnimationFrame(tick); }
  new IntersectionObserver(entries => { visible=entries[0].isIntersecting; resume(); }).observe(canvas);
  document.addEventListener('visibilitychange',resume);
  reduced.addEventListener('change',resume);
})();
