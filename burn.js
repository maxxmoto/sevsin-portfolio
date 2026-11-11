/* Between sections: a dark sheet of paper lies over the join and burns away as you scroll,
   with a glowing crumbling edge, charred margin and sparks. One small canvas per join. */
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const VS='attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
const FS=`precision highp float;varying vec2 v;uniform float p,t,asp;
float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fb(vec2 q){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(q);q=q*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
 vec2 q=v*vec2(asp,1.);
 float nn=fb(q*3.2+vec2(0.,t*.05));
 /* the sheet burns from the bottom edge upwards and from a few holes */
 float m=v.y*1.1+nn*.75-p*2.1+.15;
 float hole=fb(q*1.6+7.)-.15-p*.9;m=min(m,hole*1.6+.5);
 float a=smoothstep(-.004,.006,m);
 float e=(1.-smoothstep(0.,.08,m))*a;
 float ch=1.-smoothstep(0.,.22,m);
 /* paper: dark, with fibres */
 vec3 paper=vec3(.085,.07,.068)+(fb(q*18.)-.5)*.03+(h(floor(q*400.))-.5)*.02;
 paper*=1.-ch*.85;
 vec3 fire=mix(vec3(.6,.02,.02),vec3(1.,.3,.06),e);fire=mix(fire,vec3(1.,.85,.55),pow(e,5.));
 vec3 c=paper+fire*pow(e,1.2)*1.9;
 float glow=exp(min(m,0.)*20.)*(1.-a)*step(.001,p);
 vec2 sp=q*70.;float r=h(floor(sp));
 float em=step(.97,r)*smoothstep(.45,0.,length(fract(sp)-.5))*exp(-abs(m+.05)*14.)*(.5+.5*sin(t*13.+r*60.))*step(.001,p)*step(p,.995);
 float al=clamp(a+glow*.5+em,0.,1.);
 vec3 rgb=c*a+vec3(.95,.12,.05)*glow*.5+vec3(1.,.6,.25)*em*1.5;
 /* fade the sheet into the page at the top and bottom edge of the strip */
 float edge=smoothstep(0.,.12,v.y)*smoothstep(1.,.88,v.y);
 gl_FragColor=vec4(rgb,al)*edge;
}`;
document.querySelectorAll('.burn').forEach(el=>{
 const cv=document.createElement('canvas');el.append(cv);
 const gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});if(!gl){el.remove();return}
 const sh=(ty,s)=>{const o=gl.createShader(ty);gl.shaderSource(o,s);gl.compileShader(o);return o};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){el.remove();return}gl.useProgram(pr);
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const al=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
 const U={p:gl.getUniformLocation(pr,'p'),t:gl.getUniformLocation(pr,'t'),asp:gl.getUniformLocation(pr,'asp')};
 const size=()=>{const k=Math.min(devicePixelRatio,1.25)*.6;cv.width=Math.max(2,cv.clientWidth*k|0);cv.height=Math.max(2,cv.clientHeight*k|0);gl.viewport(0,0,cv.width,cv.height);gl.uniform1f(U.asp,cv.clientWidth/Math.max(1,cv.clientHeight))};
 new ResizeObserver(size).observe(cv);size();
 let on=false,raf=0;const t0=performance.now();
 const draw=now=>{raf=0;const r=cv.getBoundingClientRect(),H=innerHeight;
  /* 0 when the strip enters at the bottom, 1 when its middle reaches the upper third */
  const p=reduce?1:Math.max(0,Math.min(1,(H-r.top)/(H*.75+r.height*.2)));
  gl.uniform1f(U.p,p);gl.uniform1f(U.t,(now-t0)/1000);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
  if(on&&!reduce&&p<1)raf=requestAnimationFrame(draw)};
 new IntersectionObserver(e=>{on=e[0].isIntersecting;if(on&&!raf)raf=requestAnimationFrame(draw)}).observe(cv);
 addEventListener('scroll',()=>{if(on&&!raf)raf=requestAnimationFrame(draw)},{passive:true});
});
