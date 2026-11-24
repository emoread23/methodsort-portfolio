// Фон: волнующееся «поле света» из частиц + мягкая туманность.
// Камера плавно летит над полем по мере прокрутки.
import * as THREE from 'three';

const canvas = document.getElementById('bg');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 760;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight, false);
renderer.setClearColor(0x05060a, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);

// ---- Поле частиц ----
const COLS = mobile ? 150 : 260, ROWS = mobile ? 110 : 180;
const W = 90, D = 70;
const count = COLS * ROWS;
const pos = new Float32Array(count * 3);
const seed = new Float32Array(count);
let k = 0;
for (let z = 0; z < ROWS; z++) {
  for (let x = 0; x < COLS; x++) {
    pos[k * 3] = (x / (COLS - 1) - 0.5) * W + (Math.random() - 0.5) * 0.25;
    pos[k * 3 + 1] = 0;
    pos[k * 3 + 2] = -(z / (ROWS - 1)) * D + 8 + (Math.random() - 0.5) * 0.25;
    seed[k] = Math.random();
    k++;
  }
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));

const uniforms = {
  uTime: { value: 0 },
  uScroll: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uPixel: { value: renderer.getPixelRatio() },
  uTintA: { value: new THREE.Color('#9fb8ff') },
  uTintB: { value: new THREE.Color('#d9b8ff') },
};

const fieldMat = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: /* glsl */`
    uniform float uTime, uScroll, uPixel;
    uniform vec2 uMouse;
    attribute float seed;
    varying float vAlpha;
    varying float vHeight;
    varying float vSeed;

    // 2D simplex noise (Ashima)
    vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main(){
      vec3 p = position;
      float t = uTime * 0.12;
      float n = snoise(p.xz * 0.045 + vec2(t, t * 0.6)) * 2.4
              + snoise(p.xz * 0.11 - vec2(t * 1.3, 0.0)) * 0.7;
      // рябь от курсора
      float md = distance(p.xz, vec2(uMouse.x * 26.0, uMouse.y * 10.0 - 10.0));
      n += sin(md * 0.9 - uTime * 2.2) * exp(-md * 0.12) * 0.9;
      p.y = n;
      vHeight = n;
      vSeed = seed;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float twinkle = 0.55 + 0.45 * sin(uTime * (1.0 + seed * 2.5) + seed * 40.0);
      float size = (1.6 + seed * 2.6 + max(n, 0.0) * 0.9) * twinkle;
      gl_PointSize = size * uPixel * (30.0 / -mv.z);
      float fog = smoothstep(70.0, 8.0, -mv.z);
      float near = smoothstep(0.5, 6.0, -mv.z);
      vAlpha = fog * near * (0.5 + 0.5 * twinkle) * 1.25;
    }
  `,
  fragmentShader: /* glsl */`
    uniform vec3 uTintA, uTintB;
    varying float vAlpha, vHeight, vSeed;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float core = smoothstep(0.5, 0.0, d);
      float glow = pow(core, 2.6);
      vec3 col = mix(uTintA, uTintB, smoothstep(-1.5, 2.5, vHeight + vSeed));
      col = mix(col, vec3(1.0), glow * 0.7);
      gl_FragColor = vec4(col, glow * vAlpha);
      if (gl_FragColor.a < 0.003) discard;
    }
  `,
});
const field = new THREE.Points(geo, fieldMat);
scene.add(field);

// ---- Парящая пыль ----
const DUST = mobile ? 500 : 1100;
const dPos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dPos[i * 3] = (Math.random() - 0.5) * 80;
  dPos[i * 3 + 1] = Math.random() * 26 + 1;
  dPos[i * 3 + 2] = -Math.random() * 70 + 8;
}
const dGeo = new THREE.BufferGeometry();
dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
const dustMat = new THREE.ShaderMaterial({
  uniforms,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: /* glsl */`
    uniform float uTime, uPixel;
    varying float vA;
    void main(){
      vec3 p = position;
      p.y += sin(uTime * 0.25 + p.x * 0.3) * 0.8;
      p.x += cos(uTime * 0.18 + p.z * 0.2) * 0.8;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uPixel * (40.0 / -mv.z);
      vA = smoothstep(60.0, 5.0, -mv.z) * (0.4 + 0.6 * fract(sin(dot(p.xz, vec2(12.9, 78.2))) * 43758.5));
    }`,
  fragmentShader: /* glsl */`
    varying float vA;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      float a = pow(smoothstep(0.5, 0.0, d), 3.0) * vA * 0.6;
      gl_FragColor = vec4(vec3(0.92, 0.94, 1.0), a);
    }`,
});
scene.add(new THREE.Points(dGeo, dustMat));

// ---- Туманность за полем ----
const nebMat = new THREE.ShaderMaterial({
  uniforms,
  transparent: true, depthWrite: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
    uniform float uTime;
    uniform vec3 uTintA, uTintB;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
    float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*n(p); p*=2.0; a*=0.5; } return v; }
    void main(){
      vec2 uv = vUv;
      float t = uTime * 0.02;
      float f = fbm(uv * 3.0 + vec2(t, -t * 0.5) + fbm(uv * 2.0 - t));
      float band = smoothstep(0.15, 0.55, uv.y) * smoothstep(1.0, 0.45, uv.y);
      vec3 col = mix(uTintA, uTintB, f) * pow(f, 2.2) * band;
      gl_FragColor = vec4(col * 0.55, 1.0);
    }`,
});
const neb = new THREE.Mesh(new THREE.PlaneGeometry(260, 110), nebMat);
neb.position.set(0, 22, -90);
scene.add(neb);
neb.renderOrder = -1;

// ---- Камера по скроллу ----
// Ключевые точки: [scroll 0..1] -> позиция камеры, точка взгляда
const keys = [
  { at: 0.00, pos: [0, 4.2, 14], look: [0, 1.5, -20] },
  { at: 0.30, pos: [6, 9, 4],    look: [-2, 0, -26] },
  { at: 0.65, pos: [-5, 16, -6], look: [2, 0, -34] },
  { at: 1.00, pos: [0, 5, -16],  look: [0, 3, -60] },
];
const camPos = new THREE.Vector3(...keys[0].pos);
const camLook = new THREE.Vector3(...keys[0].look);
const tPos = new THREE.Vector3(), tLook = new THREE.Vector3();
const smooth = x => x * x * (3 - 2 * x);

function sampleKeys(s) {
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (s <= b.at) {
      const u = smooth((s - a.at) / (b.at - a.at));
      tPos.set(...a.pos).lerp(new THREE.Vector3(...b.pos), u);
      tLook.set(...a.look).lerp(new THREE.Vector3(...b.look), u);
      return;
    }
  }
}

let scroll = 0, mouse = { x: 0, y: 0 }, mouseS = { x: 0, y: 0 };
window.__bgScroll = v => { scroll = v; };
addEventListener('pointermove', e => {
  mouse.x = e.clientX / innerWidth * 2 - 1;
  mouse.y = e.clientY / innerHeight * 2 - 1;
});
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

// Цвет поля меняется по секциям
const tints = [
  ['#9fb8ff', '#d9b8ff'],
  ['#8fd3ff', '#9cffd0'],
  ['#c3a6ff', '#ffb8d9'],
  ['#9fb8ff', '#ffffff'],
];
const cA = new THREE.Color(), cB = new THREE.Color();

const clock = new THREE.Clock();
let visible = true;
document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

function frame() {
  requestAnimationFrame(frame);
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  uniforms.uTime.value += reduce ? 0 : dt;

  mouseS.x += (mouse.x - mouseS.x) * 0.04;
  mouseS.y += (mouse.y - mouseS.y) * 0.04;
  uniforms.uMouse.value.set(mouseS.x, mouseS.y);

  sampleKeys(scroll);
  tPos.x += mouseS.x * 1.2; tPos.y -= mouseS.y * 0.6;
  camPos.lerp(tPos, 0.05);
  camLook.lerp(tLook, 0.05);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  const seg = Math.min(tints.length - 1.001, scroll * (tints.length - 1));
  const i = Math.floor(seg), f = smooth(seg - i);
  cA.set(tints[i][0]).lerp(new THREE.Color(tints[i + 1][0]), f);
  cB.set(tints[i][1]).lerp(new THREE.Color(tints[i + 1][1]), f);
  uniforms.uTintA.value.lerp(cA, 0.05);
  uniforms.uTintB.value.lerp(cB, 0.05);

  renderer.render(scene, camera);
}
frame();
