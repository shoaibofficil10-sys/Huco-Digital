import * as THREE from './three-hero-core.mjs';

// A two-bone sculpture: the upper neck/head rotates, the shoulders remain anchored.
// Base scan: Infinite by Lee Perry-Smith, CC BY 3.0. See sculpture-credits.html.
export async function mountCharacter(host, { pixelRatio=2, maxPixels=2400000 }={}) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.className = 'hk-canvas';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 80);
  camera.position.set(0, .3, 16.5);
  camera.lookAt(0, .1, 0);

  // Small procedural studio environment; no HDR file or post-processing passes.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x222226);
  const panel = (color, intensity, x, y, z, sx, sy, sz) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), new THREE.MeshBasicMaterial({color, toneMapped:false}));
    mesh.material.color.multiplyScalar(intensity);
    mesh.position.set(x,y,z); studio.add(mesh);
  };
  panel(0xffffff, 4, -5, 5, 6, 3, 8, .2);
  panel(0xffffff, 3, 5, 7, 0, 2, 10, 4);
  panel(0xff3545, 3, 4, 0, -4, 2, 8, 5);
  panel(0xffffff, 1.6, 0, -4, 6, 8, 1, .2);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .025, .1, 40);
  scene.environment = environment.texture;
  pmrem.dispose(); studio.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  scene.add(new THREE.HemisphereLight(0xffffff, 0x35292d, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(-5,7,8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xef1633, 5); rim.position.set(5,2,-4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xf6e8e0, .8); fill.position.set(1,0,8); scene.add(fill);

  const response = await fetch(new URL('./hero-character/sculpture-mesh.bin', import.meta.url));
  if (!response.ok) throw new Error('Character mesh unavailable');
  const data = await response.arrayBuffer();
  const count = new DataView(data).getUint32(0,true), indexCount = new DataView(data).getUint32(4,true);
  const positions = new Float32Array(count*3);
  const packed = new Int16Array(data,8,count*3);
  for (let i=0;i<positions.length;i++) positions[i] = packed[i]/32767*8;
  const normals = new Int16Array(data,8+count*6,count*3);
  const indices = new Uint16Array(data,8+count*12,indexCount);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3,true));
  geometry.setIndex(new THREE.BufferAttribute(indices,1));
  const boneIndices = new Uint16Array(count*4), weights = new Float32Array(count*4);
  for (let i=0;i<count;i++) {
    const y=positions[i*3+1];
    const t=THREE.MathUtils.clamp((y+2.1)/1.55,0,1);
    const w=t*t*(3-2*t);
    boneIndices[i*4]=0; boneIndices[i*4+1]=1;
    weights[i*4]=1-w; weights[i*4+1]=w;
  }
  geometry.setAttribute('skinIndex',new THREE.BufferAttribute(boneIndices,4));
  geometry.setAttribute('skinWeight',new THREE.BufferAttribute(weights,4));
  const graphite = new THREE.MeshPhysicalMaterial({color:0x24262b,metalness:.84,roughness:.38,clearcoat:.3,clearcoatRoughness:.24,envMapIntensity:1});
  const sculpture = new THREE.SkinnedMesh(geometry,graphite);
  const root=new THREE.Bone(), head=new THREE.Bone(); head.position.set(0,-1.2,0); root.add(head);
  sculpture.add(root); sculpture.bind(new THREE.Skeleton([root,head]));
  scene.add(sculpture);
  const accessories=new THREE.Group(); accessories.position.y=1.2; head.add(accessories);

  function curvedBand(radiusX, radiusZ, y, height, start, end, material) {
    const p=[],uv=[],ind=[],segments=96;
    for(let i=0;i<=segments;i++){
      const t=start+(end-start)*i/segments;
      for(let j=0;j<2;j++) {p.push(Math.sin(t)*radiusX,y+(j-.5)*height,Math.cos(t)*radiusZ-.05);uv.push(i/segments,j);}
      if(i<segments){const a=i*2;ind.push(a,a+2,a+1,a+1,a+2,a+3);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ind);geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,material);accessories.add(mesh);return mesh;
  }
  const glass=new THREE.MeshPhysicalMaterial({color:0x68091e,metalness:.4,roughness:.16,clearcoat:1,clearcoatRoughness:.1,emissive:0xe31835,emissiveIntensity:.48,side:THREE.DoubleSide});
  curvedBand(1.83,2.42,1.77,.89,-1.5,1.5,graphite);
  curvedBand(1.84,2.45,1.77,.75,-1.5,1.5,glass);
  const visorLight=new THREE.PointLight(0xff163c,6,3,2);visorLight.position.set(0,1.15,2.5);accessories.add(visorLight);
  const edge=new THREE.MeshStandardMaterial({color:0xef2949,emissive:0xf31032,emissiveIntensity:.85,metalness:.2,roughness:.25});
  for(const y of [1.39,2.15]) {
    const points=[];for(let i=0;i<=96;i++){const t=-1.5+3*i/96;points.push(new THREE.Vector3(Math.sin(t)*1.848,y,Math.cos(t)*2.46-.05));}
    accessories.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),96,.019,8,false),edge));
  }
  const label=document.createElement('canvas');label.width=1024;label.height=256;
  const ctx=label.getContext('2d');ctx.clearRect(0,0,1024,256);ctx.fillStyle='#fff7f5';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 88px Arial, sans-serif';ctx.fillText('HUCO DIGITAL',512,132);
  const textTexture=new THREE.CanvasTexture(label);textTexture.colorSpace=THREE.SRGBColorSpace;
  textTexture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  curvedBand(1.858,2.471,1.78,.62,-.87,.87,new THREE.MeshBasicMaterial({map:textTexture,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
  // Fine sagittal fins give the sculpture its technical silhouette without covering the face.
  const finMat=new THREE.MeshPhysicalMaterial({color:0x25272c,metalness:.94,roughness:.24,clearcoat:.6});
  for(let i=0;i<9;i++) {
    const x=.65+i*.145, scale=1-i*.025;
    const shape=new THREE.Shape();
    shape.absellipse(0,0,1.83*scale,2.70*scale,0,Math.PI*2,false,0);
    
    const fin=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.074,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1,curveSegments:80}),finMat);
    fin.rotation.y=Math.PI/2;fin.position.set(x,1.23,-.5);accessories.add(fin);
  }

  let destroyed=false,lastX=0,lastY=0;
  const pose=(x,y)=>{
    lastX=x;lastY=y;
    head.rotation.set(-.08+y*.19,-.23+x*.38, -x*.025, 'YXZ');
    renderer.render(scene,camera);
    host.dataset.headYaw=head.rotation.y.toFixed(3);
    host.dataset.headPitch=head.rotation.x.toFixed(3);
  };
  function resize(){
    if(destroyed)return;
    const width=host.clientWidth,height=host.clientHeight;
    if(!width||!height)return;
    // Supersampling softens silhouettes, including on 1x screens. Bound the
    // drawing buffer so large desktop canvases cannot multiply the GPU cost.
    const scale=Math.min(pixelRatio,Math.max(1.5,devicePixelRatio||1),Math.sqrt(maxPixels/(width*height)));
    renderer.setPixelRatio(scale);
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();pose(lastX,lastY);
    host.dataset.renderScale=scale.toFixed(2);
  }
  host.appendChild(renderer.domElement);resize();
  const observer=new ResizeObserver(resize);observer.observe(host);
  host.classList.add('has-3d-character');
  return {pose,setQuality(ratio){pixelRatio=ratio;resize();},destroy(){destroyed=true;observer.disconnect();environment.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material) o.material.dispose();});renderer.dispose();renderer.domElement.remove();}};
}
