/* First screen: red silk, and a ribbon of the work screenshots flowing through a twisted figure-eight.
   Under the cursor (or a finger) the ribbon crumbles into sand that blows away, then gathers back.
   Scrolling burns the whole screen away with a glowing edge and shows the next scene underneath. */
import * as THREE from 'three';

const host=document.querySelector('.hero'),duo=document.querySelector('.duo');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const weak=(navigator.hardwareConcurrency||8)<=4||innerWidth<700||(navigator.deviceMemory||8)<=4;
const r=new THREE.WebGLRenderer({antialias:true,alpha:true,premultipliedAlpha:true});
r.setPixelRatio(Math.min(devicePixelRatio,weak?1:1.5));
r.domElement.className='gl';
r.autoClear=false;r.setClearColor(0x000000,0);
host.prepend(r.domElement);

const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(34,1,.1,60);
const root=new THREE.Group();scene.add(root);
const NOISE=`float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+vec2(1.,1.)),f.x),f.y);}`;

/* ---------- red silk, drawn small and scaled up with grain ---------- */
const flat=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.PlaneGeometry(2,2);
const rt=new THREE.WebGLRenderTarget(4,4,{depthBuffer:false});
const SU={uT:{value:0},uRes:{value:new THREE.Vector2(1,1)},uM:{value:new THREE.Vector2()},uWide:{value:1}};
const VQ='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const silkScene=new THREE.Scene();
silkScene.add(new THREE.Mesh(quad,new THREE.ShaderMaterial({uniforms:SU,depthTest:false,depthWrite:false,vertexShader:VQ,
 fragmentShader:`varying vec2 vUv;uniform float uT,uWide;uniform vec2 uRes,uM;${NOISE}
 float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*ns(p);p=m*p;a*=.5;}return v;}
 void main(){
  float asp=uRes.x/uRes.y;vec2 p=(vUv-.5)*vec2(asp,1.);
  vec2 m=uM*vec2(asp,1.)*.5;float md=length(p-m);p+=(p-m)*.22*exp(-md*2.6);
  float t=uT*.045;
  vec2 q=vec2(fbm(p*1.15+vec2(0.,t)),fbm(p*1.15+vec2(3.1,1.7)-t*.8));
  vec2 r=vec2(fbm(p*1.3+2.3*q+vec2(1.7,9.2)+t*1.4),fbm(p*1.3+2.3*q+vec2(8.3,2.8)-t));
  float f=fbm(p*1.05+2.7*r);
  float sheen=pow(.5+.5*sin((p.x*1.2-p.y*.9)*2.6+f*7.5+t*3.),4.);
  vec3 c=mix(vec3(.025,0.,.004),vec3(.42,0.,.03),smoothstep(.18,.7,f));
  c=mix(c,vec3(.87,.04,.08),smoothstep(.42,.92,f)*.92);
  c+=vec3(1.,.3,.24)*sheen*smoothstep(.3,.85,f)*.5+vec3(.5,.02,.03)*exp(-md*3.)*.35;
  float lit=uWide>.5?smoothstep(.05,.62,vUv.x)*(.75+.25*vUv.y):smoothstep(.12,.75,vUv.y);
  gl_FragColor=vec4(c*mix(.16,1.,lit),1.);
 }`})));
const outScene=new THREE.Scene();
outScene.add(new THREE.Mesh(quad,new THREE.ShaderMaterial({uniforms:{uTex:{value:rt.texture},uT:SU.uT,uRes:SU.uRes},depthTest:false,depthWrite:false,vertexShader:VQ,
 fragmentShader:`varying vec2 vUv;uniform sampler2D uTex;uniform float uT;uniform vec2 uRes;
 float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec3 c=texture2D(uTex,vUv).rgb;c+=(h1(vUv*uRes+fract(uT*7.)*91.)-.5)*.07;gl_FragColor=vec4(c,1.);}`})));

/* ---------- burn: first cut the picture away, then draw the glowing edge ---------- */
const BU={uB:{value:0},uT:SU.uT,uRes:SU.uRes};
const BURN=`varying vec2 vUv;uniform float uB,uT;uniform vec2 uRes;${NOISE}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*ns(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
 float edge(){vec2 bp=vUv*vec2(uRes.x/uRes.y,1.);float n=fbm(bp*2.4+vec2(0.,uT*.05));
  float d=abs(dot(vUv-.5,vec2(-.7071,.7071)))*1.45;return d*1.1+n*.6-uB*2.05+.08;}`;
const burnScene=new THREE.Scene();
burnScene.add(new THREE.Mesh(quad,new THREE.ShaderMaterial({uniforms:BU,depthTest:false,depthWrite:false,transparent:true,
 blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.ZeroFactor,blendDst:THREE.OneMinusSrcAlphaFactor,
 blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneMinusSrcAlphaFactor,vertexShader:VQ,
 fragmentShader:`${BURN} void main(){float m=edge();gl_FragColor=vec4(0.,0.,0.,1.-smoothstep(-.004,.006,m));}`})));
const fireMesh=new THREE.Mesh(quad,new THREE.ShaderMaterial({uniforms:BU,depthTest:false,depthWrite:false,transparent:true,
 blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,vertexShader:VQ,
 fragmentShader:`${BURN} void main(){float m=edge();
  float a=smoothstep(-.004,.006,m),e=(1.-smoothstep(0.,.1,m))*a;
  vec3 fire=mix(vec3(.55,0.,.02),vec3(1.,.24,.05),e);fire=mix(fire,vec3(1.,.85,.55),pow(e,6.));
  float glow=exp(min(m,0.)*18.)*(1.-a);
  vec2 bp=vUv*vec2(uRes.x/uRes.y,1.)*60.;float r=h1(floor(bp));
  float em=step(.975,r)*smoothstep(.45,0.,length(fract(bp)-.5))*exp(-abs(m+.04)*16.)*(.55+.45*sin(uT*14.+r*60.));
  float al=clamp(pow(e,1.3)*.9+glow*.55+em,0.,1.);
  vec3 c=fire*pow(e,1.3)*1.7+vec3(.9,.06,.04)*glow*.55+vec3(1.,.55,.2)*em*1.4;
  gl_FragColor=vec4(c,al);}`}));
const fireScene=new THREE.Scene();fireScene.add(fireMesh);

/* ---------- the ribbon ---------- */
const IMGS=(Array.isArray(window.RIBBON)&&window.RIBBON.length?window.RIBBON:['brusok','mirra','kvadrat','plast'].map(n=>`assets/${n}.webp`)).slice(0,16);
const NI=IMGS.length,TILES=NI*Math.max(1,Math.round(10/NI));
const P=t=>new THREE.Vector3(5.4*Math.sin(t),2.3*Math.sin(2*t),3.4*Math.cos(t));
const SEG=weak?300:540,WIDTH=1.72,PW=6;
const lens=[0];for(let i=1;i<=SEG;i++)lens[i]=lens[i-1]+P((i/SEG)*Math.PI*2).distanceTo(P(((i-1)/SEG)*Math.PI*2));
const up=new THREE.Vector3(.12,1,.2).normalize();
const S=[];
for(let i=0;i<=SEG;i++){
 const t=(i/SEG)*Math.PI*2,p=P(t),tan=P(t+.001).sub(P(t-.001)).normalize();
 const side=new THREE.Vector3().crossVectors(tan,up).normalize();side.applyAxisAngle(tan,t+.4);
 S.push({p,side,n:new THREE.Vector3().crossVectors(side,tan).normalize(),u:lens[i]/lens[SEG]});
}
const Q=(i,s)=>S[i].p.clone().addScaledVector(S[i].side,(s-.5)*WIDTH);
const pos=[],nor=[],uv=[],idx=[];
for(let i=0;i<=SEG;i++)for(let j=0;j<=PW;j++){const p=Q(i,j/PW),n=S[i].n;pos.push(p.x,p.y,p.z);nor.push(n.x,n.y,n.z);uv.push(S[i].u,j/PW)}
for(let i=0;i<SEG;i++)for(let j=0;j<PW;j++){const a=i*(PW+1)+j,b=a+PW+1;idx.push(a,b,a+1,b,b+1,a+1)}
const geo=new THREE.BufferGeometry();
geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);

/* hit points: where the cursor touched, with strength in w */
const HITS=Array.from({length:8},()=>new THREE.Vector4(0,0,0,0));
const RAD=1.9;
const KFN=`float kAt(vec3 p){float k=0.;for(int i=0;i<8;i++){float w=uH[i].w*(1.-smoothstep(.15,${RAD.toFixed(2)},length(p-uH[i].xyz)));k=max(k,w);}return k*k*(3.-2.*k);}
 float sand(vec2 uv){vec2 g=vec2(uv.x*150.,uv.y*8.6);return .62*ns(g*1.3)+.38*h1(floor(g*7.));}`;
const TEX=`vec3 shot(vec2 uv,bool front){float tl=fract(uv.x)*${TILES}.0+uFlow;float id=mod(floor(tl),${NI}.),uu=fract(tl);if(!front)uu=1.-uu;
  return texture2D(uTex,vec2((id+clamp(uu,.002,.998))/${NI}.,uv.y)).rgb;}`;
const U={uTex:{value:null},uFlow:{value:0},uReady:{value:0},uH:{value:HITS},uT:{value:0}};
const mat=new THREE.ShaderMaterial({uniforms:U,side:THREE.DoubleSide,transparent:true,
 vertexShader:`varying vec2 vUv;varying vec3 vN,vV,vP;
 void main(){vUv=uv;vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;vN=normalMatrix*normal;gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform sampler2D uTex;uniform float uFlow,uReady;uniform vec4 uH[8];varying vec2 vUv;varying vec3 vN,vV,vP;
 ${NOISE}${KFN}${TEX}
 void main(){
  float k=kAt(vP),s=sand(vUv);
  if(s<k*1.4-.02)discard;
  float uu=fract(fract(vUv.x)*${TILES}.0+uFlow),vv=vUv.y;
  vec3 c=shot(vUv,gl_FrontFacing);c=mix(vec3(.11),c,uReady);
  float lum=dot(c,vec3(.299,.587,.114));c=vec3(lum)*vec3(1.,.96,.94);
  vec3 n=normalize(vN),v=normalize(vV);if(!gl_FrontFacing)n=-n;
  float f=max(dot(n,v),0.);c*=.3+.85*pow(f,.8);
  c+=vec3(1.,.93,.9)*pow(max(dot(n,normalize(v+normalize(vec3(-.4,.8,.5)))),0.),48.)*.3;
  float gap=step(.012,uu)*step(uu,.988)*step(.008,vv)*step(vv,.992);c=mix(vec3(.02),c,gap);
  /* the crumbling edge glows like a cooling ember */
  float e=1.-smoothstep(0.,.09,s-(k*1.4-.02));c+=vec3(1.,.28,.1)*e*step(.02,k)*1.4;
  gl_FragColor=vec4(c,1.-smoothstep(13.,22.,length(vV)));
  #include <colorspace_fragment>
 }`});
root.add(new THREE.Mesh(geo,mat));

/* sand: grains spread over the ribbon, seen only where it has crumbled; they blow downwind and fall */
const NP=weak?16000:50000,gp=[],gu=[],gr=[];
for(let k=0;k<NP;k++){const i=Math.floor(Math.random()*SEG),f=Math.random(),s=Math.random();
 const a=Q(i,s),b=Q(i+1,s),p=a.lerp(b,f);gp.push(p.x,p.y,p.z);gu.push(S[i].u+(S[i+1].u-S[i].u)*f,s);
 gr.push(Math.random(),Math.random(),Math.random(),Math.random())}
const sg=new THREE.BufferGeometry();
sg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));sg.setAttribute('aUv',new THREE.Float32BufferAttribute(gu,2));sg.setAttribute('aR',new THREE.Float32BufferAttribute(gr,4));
const sandMat=new THREE.ShaderMaterial({uniforms:Object.assign({uPr:{value:1}},U),transparent:true,depthWrite:false,
 vertexShader:`uniform sampler2D uTex;uniform float uFlow,uT,uPr;uniform vec4 uH[8];attribute vec2 aUv;attribute vec4 aR;varying vec3 vC;varying float vA;
 ${NOISE}${KFN}${TEX}
 void main(){
  float k=kAt(position),s=sand(aUv),go=k*1.4-.02-s;
  if(go<=0.){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}
  float d=clamp(go*2.2,0.,1.);
  vec3 wind=normalize(vec3(1.,.35,-.3));
  vec3 p=position+wind*d*(1.1+aR.x*4.2)+vec3(0.,-1.,0.)*d*d*(.8+aR.y*2.6);
  p+=vec3(sin(uT*1.7+aR.z*40.),cos(uT*1.3+aR.w*37.),sin(uT*1.1+aR.x*29.))*.12*d;
  vec3 c=shot(aUv,false);float lum=dot(c,vec3(.299,.587,.114));
  vC=mix(vec3(lum)*vec3(1.,.95,.92),vec3(1.,.42,.25),smoothstep(.55,1.,d)*.6);
  vA=(1.-smoothstep(.75,1.,d))*(.65+.35*aR.w);
  vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
  gl_PointSize=(1.7+aR.z*2.6)*uPr*(9./-mv.z);
 }`,
 fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;if(dot(q,q)>.25)discard;gl_FragColor=vec4(vC,vA);
  #include <colorspace_fragment>
 }`});
const grains=new THREE.Points(sg,sandMat);grains.frustumCulled=false;root.add(grains);

/* a coarse copy of the ribbon, only for finding where the cursor points */
const pp=[],pi=[];const STEP=3;
for(let i=0,k=0;i<=SEG;i+=STEP,k++){[0,1].forEach(j=>{const p=Q(i,j);pp.push(p.x,p.y,p.z)});if(i+STEP<=SEG){const a=k*2;pi.push(a,a+1,a+2,a+1,a+3,a+2)}}
const pgeo=new THREE.BufferGeometry();pgeo.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));pgeo.setIndex(pi);
const proxy=new THREE.Mesh(pgeo,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));proxy.visible=false;root.add(proxy);

/* atlas of the screenshots in one row, cropped to 16:10 */
(async()=>{
 const imgs=await Promise.all(IMGS.map(src=>new Promise(res=>{const i=new Image();i.decoding='async';i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})));
 const max=Math.min(r.capabilities.maxTextureSize||4096,weak?4096:8192);
 const cw=Math.max(160,Math.min(weak?480:800,Math.floor(max/NI))),ch=Math.round(cw*.625);
 const c=document.createElement('canvas');c.width=cw*NI;c.height=ch;
 const g=c.getContext('2d');g.fillStyle='#1c1c1f';g.fillRect(0,0,c.width,ch);
 imgs.forEach((im,i)=>{if(!im)return;const k=Math.max(cw/im.width,ch/im.height),sw=cw/k,sh=ch/k;g.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,i*cw,0,cw,ch)});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=r.capabilities.getMaxAnisotropy();
 U.uTex.value=t;U.uReady.value=1;kick();
})();

let aspect=1;
function size(){const w=host.clientWidth,h=host.clientHeight;r.setSize(w,h,false);cam.aspect=aspect=w/h;cam.updateProjectionMatrix();
 const k=Math.min(.5,640/Math.max(w,1));rt.setSize(Math.max(2,Math.round(w*k)),Math.max(2,Math.round(h*k)));
 SU.uRes.value.set(w,h);SU.uWide.value=w/h>1.05?1:0;sandMat.uniforms.uPr.value=r.getPixelRatio()*Math.min(1.4,h/800)}
new ResizeObserver(size).observe(host);size();

/* pointer */
let mx=0,my=0,ax=0,ay=0,flow=0,lastY=scrollY;
const ndc=new THREE.Vector2(),ray=new THREE.Raycaster();
let over=false,touch=false,touchT=0;
function point(e){
 const b=host.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
 over=x>=0&&y>=0&&x<=b.width&&y<=b.height&&BU.uB.value<.05;
 ndc.set(x/b.width*2-1,-(y/b.height)*2+1);
 touch=e.pointerType!=='mouse';if(touch)touchT=performance.now();
 if(over)kick();
}
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;point(e)},{passive:true});
addEventListener('pointerdown',point,{passive:true});
document.addEventListener('mouseout',e=>{if(!e.relatedTarget)over=false});

let head=-1;const lp=new THREE.Vector3();
function crumble(now,dt){
 let hit=null;
 if(over&&(!touch||now-touchT<450)){root.updateMatrixWorld();ray.setFromCamera(ndc,cam);const h=ray.intersectObject(proxy,false)[0];if(h)hit=root.worldToLocal(lp.copy(h.point))}
 if(hit){const H=head>=0?HITS[head]:null;
  if(!H||Math.hypot(H.x-hit.x,H.y-hit.y,H.z-hit.z)>.3){let mi=0;HITS.forEach((v,i)=>{if(v.w<HITS[mi].w)mi=i});head=mi;HITS[mi].set(hit.x,hit.y,hit.z,0)}}
 else head=-1;
 let live=false;
 HITS.forEach((v,i)=>{if(i===head)v.w+=(1-v.w)*Math.min(1,dt*16);else v.w=Math.max(0,v.w-dt*.32);if(v.w>0)live=true});
 return live||head>=0;
}

/* progress through the pinned first block, 0..1 */
const prog=()=>{const b=duo.getBoundingClientRect(),span=duo.offsetHeight-innerHeight;return span>0?Math.max(0,Math.min(1,-b.top/span)):0};
let running=true,raf=0,t0=performance.now(),last=t0,slow=0,count=0,gone=false,lastDraw=0;
function frame(now){
 raf=0;if(weak&&now-lastDraw<33){if(running&&!document.hidden)raf=requestAnimationFrame(frame);return}
 lastDraw=now;const dt=Math.min((now-last)/1000,.05);last=now;const t=(now-t0)/1000;
 if(++count<90)slow+=dt;else if(count===90&&slow/90>.03&&r.getPixelRatio()>1){r.setPixelRatio(1);size()}
 const q=prog(),burn=reduce?(q>.3?1:0):THREE.MathUtils.smoothstep(q,.04,.36),p=Math.min(1,q/.36);
 BU.uB.value=burn;
 const out=burn>=.999;
 if(out!==gone){gone=out;r.domElement.style.visibility=out?'hidden':''}
 if(!out){
  flow+=reduce?0:dt*.16+Math.abs(scrollY-lastY)*.0006;
  U.uFlow.value=-flow;U.uT.value=t;
  const wide=aspect>1.05;
  ax+=(mx-ax)*.05;ay+=(my-ay)*.05;
  root.position.set(wide?3.1:0,wide?.55:1.7,0);root.scale.setScalar(wide?.92:.56);
  root.rotation.set(.32+ay*.3+p*.5,(reduce?.2:t*.05)+ax*.5+p*.7,-.14);
  cam.position.set(0,0,THREE.MathUtils.lerp(14.5,9,p*p));
  crumble(now,dt);
  SU.uT.value=reduce?8:t;SU.uM.value.set(ax*2,-ay*2);
  r.setRenderTarget(rt);r.render(silkScene,flat);r.setRenderTarget(null);
  r.clear();r.render(outScene,flat);r.render(scene,cam);
  if(burn>0){r.render(burnScene,flat);r.render(fireScene,flat)}
 }
 lastY=scrollY;
 if(running&&!document.hidden&&!out&&!reduce)raf=requestAnimationFrame(frame);
}
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
new IntersectionObserver(e=>{running=e[0].isIntersecting;if(running)kick()}).observe(host);
document.addEventListener('visibilitychange',kick);
addEventListener('scroll',kick,{passive:true});
kick();
