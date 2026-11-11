/* Between "about" and the works: grey smoke and a bird made of white flame.
   Scroll brings it in from the corner, it grows, then bursts into light that turns into the works section. */
import * as THREE from 'three';

const sec=document.querySelector('.bird');
if(sec){
const stick=sec.querySelector('.bird-stick'),txt=sec.querySelector('.bird-t'),wh=sec.querySelector('.bird-w');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const weak=(navigator.hardwareConcurrency||8)<=4||innerWidth<700;
const r=new THREE.WebGLRenderer({antialias:false,alpha:false});
r.setPixelRatio(Math.min(devicePixelRatio,weak?1:1.5));r.setClearColor(0x000000,1);r.autoClear=false;
r.domElement.className='gl';stick.prepend(r.domElement);
const flat=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.PlaneGeometry(2,2);

/* smoke */
const SU={uT:{value:0},uA:{value:1},uB:{value:new THREE.Vector2(-.6,-.4)},uM:{value:new THREE.Vector2()},uF:{value:0},uG:{value:0}};
const smoke=new THREE.Mesh(quad,new THREE.ShaderMaterial({uniforms:SU,depthTest:false,depthWrite:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`varying vec2 vUv;uniform float uT,uA,uF,uG;uniform vec2 uB,uM;
 float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*ns(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
 void main(){
  vec2 p=(vUv-.5)*2.;p.x*=uA;
  vec2 m=uM;m.x*=uA;float md=length(p-m);p+=(p-m)*.18*exp(-md*2.);
  float t=uT*.06;
  vec2 q=vec2(fbm(p*.8+vec2(t,0.)),fbm(p*.8+vec2(4.2,1.3)-t*.7));
  float f=fbm(p*.9+q*2.2+vec2(-t*.6,t*.3));
  float c=smoothstep(.25,.95,f)*.55+.05;
  vec2 b=uB;b.x*=uA;float bd=length(p-b);
  c+=exp(-bd*1.6)*.28*uG;
  c*=1.-.55*smoothstep(.6,1.8,length(p*vec2(.7,1.)));
  c+=(h1(vUv*900.+fract(uT*7.)*50.)-.5)*.05;
  gl_FragColor=vec4(vec3(c)*uF,1.);
 }`}));
const bg=new THREE.Scene();bg.add(smoke);

/* the bird: drawn once on a canvas, every bright pixel becomes a spark */
function shape(){
 const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
 g.fillStyle='#fff';g.strokeStyle='#fff';g.lineCap='round';
 const curve=(x0,y0,cx,cy,x1,y1,w0,w1)=>{const n=26;for(let i=0;i<n;i++){const t=i/n,t2=(i+1)/n;
   const P=t=>[(1-t)*(1-t)*x0+2*(1-t)*t*cx+t*t*x1,(1-t)*(1-t)*y0+2*(1-t)*t*cy+t*t*y1];
   const a=P(t),b=P(t2);g.lineWidth=w0+(w1-w0)*t;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}};
 /* body, head, neck */
 g.beginPath();g.ellipse(256,268,26,52,0,0,7);g.fill();
 curve(256,230,252,200,262,182,20,13);g.beginPath();g.arc(264,176,13,0,7);g.fill();
 curve(272,174,284,172,292,178,5,1);
 /* wings: feathers fanning up and out, curling like flames */
 [-1,1].forEach(s=>{
  for(let i=0;i<11;i++){const a=(-.05+i*.13),L=150+Math.sin(i*.7)*30-i*4;
   const x0=256+s*18,y0=245,x1=x0+s*Math.cos(a)*L*1.25,y1=y0-Math.sin(a)*L*1.05-40;
   curve(x0,y0,x0+s*L*.55,y0+10-i*6,x1,y1,24-i*1.2,2)}
  for(let i=0;i<7;i++){const x0=256+s*30,y0=262,a=.25+i*.16;curve(x0,y0,x0+s*90,y0-30+i*4,x0+s*(150-i*8),y0-90*a-20,14,1.5)}
 });
 /* tail of flames */
 for(let i=0;i<9;i++){const dx=(i-4)*14;curve(256+dx*.3,300,256+dx*1.4,380,256+dx*2.2+Math.sin(i)*20,450+Math.cos(i*1.7)*30,16-Math.abs(i-4)*1.5,1.5)}
 const d=g.getImageData(0,0,S,S).data,pts=[];
 for(let y=0;y<S;y+=2)for(let x=0;x<S;x+=2){if(d[(y*S+x)*4+3]>40&&Math.random()<(weak?.5:.95))pts.push((x-S/2)/(S/2),-(y-S/2)/(S/2))}
 return pts;
}
const pts=shape(),N=pts.length/2;
const rnd=new Float32Array(N*4);for(let i=0;i<rnd.length;i++)rnd[i]=Math.random();
const pg=new THREE.BufferGeometry();
pg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(N*3),3));
pg.setAttribute('aP',new THREE.Float32BufferAttribute(pts,2));pg.setAttribute('aR',new THREE.Float32BufferAttribute(rnd,4));
const BU={uT:{value:0},uA:{value:1},uPos:{value:new THREE.Vector2()},uS:{value:.5},uBurst:{value:0},uPr:{value:1},uTilt:{value:0},uVis:{value:0},uFlap:{value:0},uAmp:{value:1},uBank:{value:0}};
const birdMat=new THREE.ShaderMaterial({uniforms:BU,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`attribute vec2 aP;attribute vec4 aR;uniform float uT,uA,uS,uBurst,uPr,uTilt,uVis,uFlap,uAmp,uBank;uniform vec2 uPos;varying float vA;
 void main(){
  vec2 p=aP;float ax=abs(p.x);
  float wing=smoothstep(.08,.55,ax)*step(p.y,.9);
  /* the wing tips lag behind the shoulders; on the downstroke the wings fold in a little and the body lifts */
  float flap=sin(uFlap-ax*2.4);
  p.y+=flap*.34*uAmp*wing*ax;p.x*=1.-max(0.,-flap)*.22*wing*uAmp;
  p.y+=-cos(uFlap)*.035*uAmp*(1.-wing);
  /* banking: the body turns, the near wing drops and the whole bird looks narrower */
  p.y+=p.x*uBank*.35;p.x*=1.-abs(uBank)*.3;
  float life=fract(uT*(.35+aR.x*.5)+aR.y);
  float ember=step(.86,aR.z);
  p.y+=life*(.05+aR.w*.06)+ember*life*.45;
  p.x+=sin(uT*2.+aR.w*30.)*(.012+ember*life*.08);
  float c=cos(uTilt),s=sin(uTilt);p=mat2(c,s,-s,c)*p;
  vec2 dir=normalize(aP+vec2(.001,.003))*(.6+aR.x*2.4);
  p+=dir*uBurst*uBurst*2.2+vec2(sin(aR.w*40.),cos(aR.y*40.))*uBurst*.4;
  vec2 sp=uPos+p*uS;
  gl_Position=vec4(sp.x/uA,sp.y,0.,1.);
  float core=1.-smoothstep(0.,.5,length(aP*vec2(1.,.7)));
  vA=(1.-life*.85)*(.35+core*.5)*(1.-ember*.4)*uVis*(1.-uBurst*.7);
  gl_PointSize=(1.4+aR.z*2.4+core*2.)*uPr*(uS/.55)*(1.-life*.5);
 }`,
 fragmentShader:`varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q);if(d>.25)discard;gl_FragColor=vec4(vec3(1.,.97,.94)*vA*(1.-d*3.),1.);}`});
const birdScene=new THREE.Scene();const birdPts=new THREE.Points(pg,birdMat);birdPts.frustumCulled=false;birdScene.add(birdPts);

function size(){const w=stick.clientWidth,h=stick.clientHeight;r.setSize(w,h,false);SU.uA.value=BU.uA.value=w/h;BU.uPr.value=r.getPixelRatio()*Math.min(1.5,h/760)}
new ResizeObserver(size).observe(stick);size();

let mx=0,my=0,ax=0,ay=0;
addEventListener('pointermove',e=>{const b=stick.getBoundingClientRect();mx=((e.clientX-b.left)/b.width-.5)*2;my=-((e.clientY-b.top)/b.height-.5)*2},{passive:true});
const ss=(a,b,x)=>Math.max(0,Math.min(1,(x-a)/(b-a))),sm=(a,b,x)=>{const t=ss(a,b,x);return t*t*(3-2*t)};
const prog=()=>{const b=sec.getBoundingClientRect(),span=sec.offsetHeight-innerHeight;return span>0?Math.max(0,Math.min(1,-b.top/span)):0};

let on=false,raf=0,t0=performance.now(),last=t0;
/* flight: the bird chases a target that drifts along a wandering path, so it accelerates, turns and banks like a living thing.
   It flaps hard when it climbs, glides on the way down. */
let bx=null,by=0,vx=0,vy=0,phase=0,amp=1,tilt=0,bank=0;
function frame(now){
 raf=0;const dt=Math.min(.05,(now-last)/1000);last=now;const t=(now-t0)/1000,q=prog(),A=SU.uA.value;
 ax+=(mx-ax)*.04;ay+=(my-ay)*.04;
 const fin=Math.max(.85,sm(0,.05,q)),fly=sm(0,.6,q),burst=sm(.74,.92,q),white=sm(.8,.97,q);
 const narrow=A<1,W=narrow?A*.55:A*.62;
 /* the route: across the screen with scroll, plus loops and dips in time */
 const baseX=(-W*.9)+(W*1.5)*fly,baseY=-.2+Math.sin(fly*Math.PI)*.25;
 const tx=baseX+Math.sin(t*.42)*W*.28+Math.sin(t*1.07+1.3)*W*.08+ax*.12;
 const ty=baseY+Math.sin(t*.63+.7)*.22+Math.sin(t*1.31)*.06+ay*.08;
 if(bx===null){bx=tx;by=ty}
 const k=reduce?50:3.2,damp=Math.pow(.18,dt);
 vx=(vx+(tx-bx)*k*dt)*damp;vy=(vy+(ty-by)*k*dt)*damp;bx+=vx*dt*2.2;by+=vy*dt*2.2;
 const climb=Math.max(-1,Math.min(1,vy*3));
 const targetAmp=burst>0?1.2:Math.max(.25,Math.min(1.15,.62+climb*.7));
 amp+=(targetAmp-amp)*Math.min(1,dt*3);
 phase+=dt*(reduce?0:(5.2+Math.max(0,climb)*7+amp*2));
 tilt+=((-vx*.55)-tilt)*Math.min(1,dt*4);bank+=((Math.max(-.7,Math.min(.7,vx*1.6)))-bank)*Math.min(1,dt*3);
 BU.uPos.value.set(bx,by);
 BU.uS.value=((narrow?.46:.4)+fly*(narrow?.14:.2))*(1+Math.sin(t*.37)*.07)+burst*.2;
 BU.uT.value=reduce?2:t;BU.uFlap.value=phase;BU.uAmp.value=amp;BU.uBank.value=bank;
 BU.uBurst.value=burst;BU.uVis.value=fin;BU.uTilt.value=tilt;
 SU.uT.value=reduce?2:t;SU.uB.value.set(bx/A,by);SU.uM.value.set(ax,ay);SU.uF.value=fin;SU.uG.value=fin*(1-burst*.5);
 r.clear();r.render(bg,flat);r.render(birdScene,flat);
 txt.classList.toggle('on',q>.3&&q<.86);
 wh.style.opacity=white.toFixed(3);
 if(on&&!document.hidden&&!reduce)raf=requestAnimationFrame(frame);
}
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
new IntersectionObserver(e=>{on=e[0].isIntersecting;if(on)kick()}).observe(sec);
addEventListener('scroll',()=>{if(on)kick()},{passive:true});
document.addEventListener('visibilitychange',kick);
}
