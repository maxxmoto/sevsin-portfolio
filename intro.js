/* First screen: a loader that counts real progress, then a tilted wall of the work screenshots
   that burns away from the middle with a glowing edge and reveals the page underneath.
   Full version once per tab session, a short burn on later visits. */
const D=document.documentElement;
const full=D.classList.contains('intro'),short=D.classList.contains('intro-short');
const box=document.getElementById('ic'),num=document.getElementById('ldN');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let gl=null;
function finish(){
 D.classList.add('go','ld-done','done');
 try{sessionStorage.setItem('stepan-intro','1')}catch(e){}
 try{gl&&gl.getExtension('WEBGL_lose_context')?.loseContext()}catch(e){}
 box&&box.remove();
}
if((full||short)&&box)run().catch(e=>{console.warn('intro',e);finish()});else if(full||short)finish();

async function run(){
 const srcs=(Array.isArray(window.RIBBON)?window.RIBBON:[]).slice(0,12);
 const total=srcs.length+1;let done=0;
 const imgs=Promise.all(srcs.map(s=>new Promise(res=>{const i=new Image();i.decoding='async';
  i.onload=()=>{done++;res(i)};i.onerror=()=>{done++;res(null)};i.src=s})));
 (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>done++,()=>done++);

 const cv=document.createElement('canvas');box.append(cv);
 gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});

 if(full)await count(()=>done/total);
 else await Promise.race([imgs,wait(2500)]);
 if(!gl){D.classList.add('ld-done');await wait(700);return finish()}

 const draw=setup(await Promise.race([imgs,wait(100)]).then(v=>v||[]));
 const t0=performance.now();let burn=0,fade=full?1:0,raf=0,on=true;
 const loop=now=>{const t=(now-t0)/1000;if(!full)fade=Math.min(1,t/.35);draw(t,burn,fade);if(on)raf=requestAnimationFrame(loop)};
 raf=requestAnimationFrame(loop);

 if(full){await wait(200);shatter();D.classList.add('ld-done');await wait(1700)}else await wait(450);
 box.classList.add('clear');
 const dur=full?2100:1400,b0=performance.now();let shown=false;
 await new Promise(res=>{const step=now=>{const k=Math.min(1,(now-b0)/dur);burn=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  if(!shown&&k>.38){shown=true;D.classList.add('go')}
  if(k<1)requestAnimationFrame(step);else res()};requestAnimationFrame(step)});
 on=false;cancelAnimationFrame(raf);
 finish();
}

/* when loading is done the word, the counter and the signature fall apart into glowing sand that blows away */
function shatter(){
 const els=[...document.querySelectorAll('.ld-w span,#ldN,.ld-c i,.ld-sig')];if(!els.length)return;
 const W=innerWidth,H=innerHeight,k=Math.min(devicePixelRatio||1,1.5);
 const off=document.createElement('canvas');off.width=W;off.height=H;const o=off.getContext('2d');o.fillStyle='#fff';o.textBaseline='alphabetic';
 els.forEach(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);o.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m=o.measureText(e.textContent);const asc=m.actualBoundingBoxAscent||parseFloat(cs.fontSize)*.8,desc=m.actualBoundingBoxDescent||0;
  o.fillText(e.textContent,r.left+(r.width-m.width)/2,r.top+(r.height+asc-desc)/2)});
 const d=o.getImageData(0,0,W,H).data,P=[];const step=W<700?3:4;
 for(let y=0;y<H;y+=step)for(let x=0;x<W;x+=step){if(d[(y*W+x)*4+3]>120)P.push({x,y,vx:(Math.random()-.5)*1.2,vy:(Math.random()-.5)*1.2,r:Math.random(),s:.9+Math.random()*1.6,del:(x/W)*260+Math.random()*120})}
 els.forEach(e=>e.style.visibility='hidden');
 const cv=document.createElement('canvas');cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:101;pointer-events:none';cv.width=W*k;cv.height=H*k;document.body.append(cv);
 const g=cv.getContext('2d');g.scale(k,k);const t0=performance.now(),cx=W/2,cy=H/2;
 const f=now=>{const t=now-t0;g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';let alive=0;
  for(const p of P){const lt=t-p.del;if(lt<0){g.fillStyle='rgba(255,255,255,.9)';g.fillRect(p.x,p.y,p.s,p.s);alive++;continue}
   const u=lt/1400;if(u>1)continue;alive++;
   const ax=(p.x-cx)/W*.06+.02,ay=-.035-(p.r*.03);p.vx+=ax+Math.sin(lt*.004+p.r*20)*.05;p.vy+=ay;p.x+=p.vx;p.y+=p.vy;
   const a=(1-u)*(1-u),rr=255,gg=Math.round(255*(1-Math.min(1,u*2.2))*.9+30*(1-u)),bb=Math.round(255*(1-Math.min(1,u*3)));
   g.fillStyle=`rgba(${rr},${gg},${bb},${a.toFixed(3)})`;g.fillRect(p.x,p.y,p.s*(1-u*.5),p.s*(1-u*.5))}
  if(alive)requestAnimationFrame(f);else cv.remove()};
 requestAnimationFrame(f);
}

/* the number creeps up with the real progress, but never faster than ~1.7 s in all */
function count(real){
 return new Promise(res=>{const t0=performance.now();let v=0;
  const step=now=>{const el=now-t0;let r=Math.min(1,real());if(el>7000)r=1;
   const cap=Math.min(100,el/1700*100),target=Math.min(r*100,cap);
   v+=(target-v)*.12;if(target-v<.6)v=target;
   if(num)num.textContent=Math.floor(v>=99.5&&r>=1?100:v);
   if(r>=1&&v>=99.5)return res();
   requestAnimationFrame(step)};requestAnimationFrame(step)});
}

function setup(images){
 const cv=gl.canvas;
 const N=Math.max(1,images.filter(Boolean).length);
 /* atlas: every screenshot cropped to 16:10, side by side, power-of-two so it can be mipmapped */
 const max=Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096,innerWidth<700?2048:4096);
 const at=document.createElement('canvas');at.width=max;at.height=max/4;
 const g=at.getContext('2d'),cw=at.width/N,ch=at.height;g.fillStyle='#222';g.fillRect(0,0,at.width,ch);
 images.filter(Boolean).forEach((im,i)=>{const k=Math.max(1.6/im.width,1/im.height),sw=1.6/k,sh=1/k;
  g.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,i*cw,0,cw,ch)});

 const vs='attribute vec2 a;varying vec2 vUv;void main(){vUv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
 const fs=`precision highp float;varying vec2 vUv;uniform sampler2D uTex;uniform float uN,uT,uB,uA,uF;
 float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*ns(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
 void main(){
  vec2 p=(vUv-.5)*vec2(uA,1.)*2.;
  vec3 rd=normalize(vec3(p,-1.9));
  float tx=-.52,ty=.3,cx=cos(tx),sx=sin(tx),cy=cos(ty),sy=sin(ty);
  vec3 N=vec3(0.,-sx,cx),V=vec3(0.,cx,sx);
  N=vec3(N.z*sy,N.y,N.z*cy);V=vec3(V.z*sy,V.y,V.z*cy);vec3 U=vec3(cy,0.,-sy);
  vec3 c0=vec3(0.,0.,-(2.7-uT*.07));
  float t=dot(c0,N)/dot(rd,N);
  vec3 hp=rd*t-c0;
  vec2 q=vec2(dot(hp,U),dot(hp,V));
  float ca=cos(.62),sa=sin(.62);q=mat2(ca,sa,-sa,ca)*q;
  vec2 cs=vec2(1.28,.8);
  float row=floor(q.y/cs.y);
  q.x+=uT*.08*(mod(row,2.)<.5?1.:-1.)+row*.41;
  vec2 id=floor(q/cs),f=fract(q/cs);
  float k=floor(h1(id*1.37+.5)*uN);
  vec2 gp=vec2(.035,.055);
  float inside=step(gp.x,f.x)*step(f.x,1.-gp.x)*step(gp.y,f.y)*step(f.y,1.-gp.y);
  vec2 tf=clamp((f-gp)/(1.-2.*gp),.003,.997);
  vec3 col=texture2D(uTex,vec2((k+tf.x)/uN,1.-tf.y)).rgb;
  float lum=dot(col,vec3(.299,.587,.114));
  col=vec3(lum)*vec3(1.,.97,.95)*(.45+.6*h1(id+7.1));
  col=mix(vec3(.02),col,inside);
  col*=smoothstep(1.9,.25,length(p*vec2(.62,1.)));
  col*=smoothstep(12.,3.5,t);
  if(t<0.)col=vec3(0.);
  vec2 bp=vUv*vec2(uA,1.);
  float n=fbm(bp*2.6+vec2(0.,uT*.1));
  float d=abs(dot(vUv-.5,vec2(-.7071,.7071)))*1.45;
  float m=d*1.15+n*.55-uB*2.05+.1;
  float a=smoothstep(-.004,.006,m);
  float e=(1.-smoothstep(0.,.1,m))*a;
  col*=1.-.85*(1.-smoothstep(0.,.24,m));
  vec3 fire=mix(vec3(.55,0.,.02),vec3(1.,.22,.04),e);
  fire=mix(fire,vec3(1.,.82,.5),pow(e,5.));
  col+=fire*pow(e,1.3)*1.8;
  float glow=exp(min(m,0.)*14.)*(1.-a)*step(.001,uB);
  vec2 sp=bp*55.;vec2 si=floor(sp);float r=h1(si);
  float em=step(.972,r)*smoothstep(.45,0.,length(fract(sp)-.5))*exp(-abs(m+.05)*16.)*(.55+.45*sin(uT*14.+r*60.))*step(.001,uB);
  float al=a+(1.-a)*min(1.,glow*.8+em);
  vec3 rgb=col*a+vec3(.92,.05,.04)*glow*.8*(1.-a)+vec3(1.,.55,.2)*em*1.6;
  gl_FragColor=vec4(rgb,al)*uF;
 }`;
 const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');
 gl.useProgram(pr);
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,at);
 gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
 const U={};['uTex','uN','uT','uB','uA','uF'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
 gl.uniform1i(U.uTex,0);gl.uniform1f(U.uN,N);
 const dpr=Math.min(devicePixelRatio||1,innerWidth<700?1.25:1.5);
 const size=()=>{cv.width=Math.round(innerWidth*dpr);cv.height=Math.round(innerHeight*dpr);gl.viewport(0,0,cv.width,cv.height)};
 size();addEventListener('resize',size);
 return (t,b,f)=>{gl.uniform1f(U.uT,t);gl.uniform1f(U.uB,b);gl.uniform1f(U.uF,f);gl.uniform1f(U.uA,cv.width/cv.height);gl.drawArrays(gl.TRIANGLES,0,3)};
}
