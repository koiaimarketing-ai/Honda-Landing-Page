/* ============================================================
   FloatingLines — vanilla port of the React Bits component
   (https://reactbits.dev). Same Three.js WebGL shader, no React,
   no build step. Loads three from a CDN import map (see index.html).

   Differences from the React version, all deliberate for a static,
   content-over-background use:
   - init/dispose are a plain function, not a hook
   - pointer tracking is on window (not the canvas) so the effect can
     sit behind page content with pointer-events:none and still react
     to the mouse without blocking clicks
   - respects prefers-reduced-motion (renders one static frame)
   Shaders are copied verbatim from the component source.
============================================================ */
import {
  Clock, Mesh, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, Vector2, Vector3, WebGLRenderer
} from 'three';

const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

uniform float globalRotate;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];

    gradientColor = mix(c1, c2, f);
  }

  return gradientColor * 0.5;
}

  float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius); // radial falloff around cursor
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  // tilt the whole field so the flow runs at a chosen angle
  baseUv = baseUv * rotate(globalRotate);

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);

  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex) {
  let value = String(hex).trim();
  if (value.startsWith('#')) value = value.slice(1);
  let r = 255, g = 255, b = 255;
  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }
  return new Vector3(r / 255, g / 255, b / 255);
}

export function initFloatingLines(container, options = {}) {
  const opts = {
    linesGradient: undefined,
    enabledWaves: ['top', 'middle', 'bottom'],
    lineCount: [6],
    lineDistance: [5],
    topWavePosition: undefined,
    middleWavePosition: undefined,
    bottomWavePosition: { x: 2.0, y: -0.7, rotate: -1 },
    animationSpeed: 1,
    interactive: true,
    bendRadius: 5.0,
    bendStrength: -0.5,
    mouseDamping: 0.05,
    parallax: true,
    parallaxStrength: 0.2,
    mixBlendMode: 'screen',
    /* scrollDrive: anchor the field to the DOCUMENT — drive the shader's
       offset from window.scrollY instead of the mouse, so one fixed
       canvas renders a single continuous field that flows top→bottom of
       the whole page (the line ducks behind opaque sections and
       re-emerges aligned). */
    scrollDrive: false,
    scrollStrength: 1,
    globalRotate: 0,   // radians; tilt the whole field's flow direction
    ...options,
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getLineCount = (waveType) => {
    if (typeof opts.lineCount === 'number') return opts.lineCount;
    if (!opts.enabledWaves.includes(waveType)) return 0;
    const index = opts.enabledWaves.indexOf(waveType);
    return opts.lineCount[index] ?? 6;
  };
  const getLineDistance = (waveType) => {
    if (typeof opts.lineDistance === 'number') return opts.lineDistance;
    if (!opts.enabledWaves.includes(waveType)) return 0.1;
    const index = opts.enabledWaves.indexOf(waveType);
    return opts.lineDistance[index] ?? 0.1;
  };

  const topLineCount = opts.enabledWaves.includes('top') ? getLineCount('top') : 0;
  const middleLineCount = opts.enabledWaves.includes('middle') ? getLineCount('middle') : 0;
  const bottomLineCount = opts.enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;

  const topLineDistance = opts.enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
  const middleLineDistance = opts.enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
  const bottomLineDistance = opts.enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;

  const targetMouse = new Vector2(-1000, -1000);
  const currentMouse = new Vector2(-1000, -1000);
  let targetInfluence = 0, currentInfluence = 0;
  const targetParallax = new Vector2(0, 0);
  const currentParallax = new Vector2(0, 0);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.z = 1;

  /* Create the canvas + context ourselves and hand the context to Three.
     Letting Three probe getContext('webgl2') then getContext('webgl') on
     the same canvas triggers "Canvas has an existing context of a
     different type" and the renderer fails (blank section). Grabbing one
     context up front avoids the re-probe. Fail soft to a no-op disposer
     if no context is available. */
  let renderer;
  try {
    const glCanvas = document.createElement('canvas');
    const ctxAttrs = { antialias: true, alpha: false, preserveDrawingBuffer: false };
    const gl = glCanvas.getContext('webgl2', ctxAttrs) || glCanvas.getContext('webgl', ctxAttrs);
    if (!gl) return function noop() {};
    renderer = new WebGLRenderer({ canvas: glCanvas, context: gl, antialias: true, alpha: false });
  } catch (e) {
    return function noop() {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);
  container.style.mixBlendMode = opts.mixBlendMode;

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new Vector3(1, 1, 1) },
    animationSpeed: { value: opts.animationSpeed },
    enableTop: { value: opts.enabledWaves.includes('top') },
    enableMiddle: { value: opts.enabledWaves.includes('middle') },
    enableBottom: { value: opts.enabledWaves.includes('bottom') },
    topLineCount: { value: topLineCount },
    middleLineCount: { value: middleLineCount },
    bottomLineCount: { value: bottomLineCount },
    topLineDistance: { value: topLineDistance },
    middleLineDistance: { value: middleLineDistance },
    bottomLineDistance: { value: bottomLineDistance },
    topWavePosition: { value: new Vector3(opts.topWavePosition?.x ?? 10.0, opts.topWavePosition?.y ?? 0.5, opts.topWavePosition?.rotate ?? -0.4) },
    middleWavePosition: { value: new Vector3(opts.middleWavePosition?.x ?? 5.0, opts.middleWavePosition?.y ?? 0.0, opts.middleWavePosition?.rotate ?? 0.2) },
    bottomWavePosition: { value: new Vector3(opts.bottomWavePosition?.x ?? 2.0, opts.bottomWavePosition?.y ?? -0.7, opts.bottomWavePosition?.rotate ?? 0.4) },
    iMouse: { value: new Vector2(-1000, -1000) },
    interactive: { value: opts.interactive },
    bendRadius: { value: opts.bendRadius },
    bendStrength: { value: opts.bendStrength },
    bendInfluence: { value: 0 },
    parallax: { value: opts.parallax },
    parallaxStrength: { value: opts.parallaxStrength },
    parallaxOffset: { value: new Vector2(0, 0) },
    lineGradient: { value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)) },
    lineGradientCount: { value: 0 },
    globalRotate: { value: opts.globalRotate || 0 },
  };

  if (opts.linesGradient && opts.linesGradient.length > 0) {
    const stops = opts.linesGradient.slice(0, MAX_GRADIENT_STOPS);
    uniforms.lineGradientCount.value = stops.length;
    stops.forEach((hex, i) => {
      const c = hexToVec3(hex);
      uniforms.lineGradient.value[i].set(c.x, c.y, c.z);
    });
  }

  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  scene.add(mesh);

  /* Expose live uniforms so an in-page control panel can tune this field
     in real time (see the hero slider panel in index.html). */
  container.__flUniforms = uniforms;

  const clock = new Clock();
  let active = true;
  let visible = true;

  const setSize = () => {
    if (!active) return;
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height, false);
    uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
  };
  setSize();

  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => {
        if (!active) return;
        setSize();
        if (reduceMotion) renderer.render(scene, camera);
      })
    : null;
  if (ro) ro.observe(container);

  /* Only run the render loop while the host is on (or near) screen.
     With several shader canvases on one page this keeps idle sections
     off the GPU. */
  const io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible && active && !reduceMotion && raf === 0) loop();
      }, { rootMargin: '150px' })
    : null;
  if (io) io.observe(container);

  /* Pointer on window so content above (pointer-events:none overlay)
     stays clickable while the field still bends toward the cursor. */
  const handlePointerMove = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    const dpr = renderer.getPixelRatio();
    targetMouse.set(x * dpr, (rect.height - y) * dpr);
    targetInfluence = inside ? 1.0 : 0.0;
    if (opts.parallax && inside) {
      const offsetX = (x - rect.width / 2) / rect.width;
      const offsetY = -(y - rect.height / 2) / rect.height;
      targetParallax.set(offsetX * opts.parallaxStrength, offsetY * opts.parallaxStrength);
    }
  };
  if (opts.interactive) window.addEventListener('pointermove', handlePointerMove, { passive: true });

  const renderFrame = () => {
    uniforms.iTime.value = clock.getElapsedTime();
    if (opts.interactive) {
      currentMouse.lerp(targetMouse, opts.mouseDamping);
      uniforms.iMouse.value.copy(currentMouse);
      currentInfluence += (targetInfluence - currentInfluence) * opts.mouseDamping;
      uniforms.bendInfluence.value = currentInfluence;
    }
    if (opts.scrollDrive) {
      /* anchor the field to the page: shift the shader's y offset by
         scroll so the same field position stays glued to the document */
      const H = container.clientHeight || 1;
      const sy = window.scrollY || window.pageYOffset || 0;
      targetParallax.set(0, sy * (2.0 / H) * opts.scrollStrength);
    }
    if (opts.parallax) {
      currentParallax.lerp(targetParallax, opts.scrollDrive ? 0.2 : opts.mouseDamping);
      uniforms.parallaxOffset.value.copy(currentParallax);
    }
    renderer.render(scene, camera);
  };

  let raf = 0;
  const loop = () => {
    if (!active || !visible) { raf = 0; return; }
    renderFrame();
    raf = requestAnimationFrame(loop);
  };
  if (reduceMotion) {
    renderer.render(scene, camera); /* one static frame, no loop */
  } else {
    loop();
  }

  return function dispose() {
    active = false;
    cancelAnimationFrame(raf);
    raf = 0;
    container.__flUniforms = null;
    if (ro) ro.disconnect();
    if (io) io.disconnect();
    if (opts.interactive) window.removeEventListener('pointermove', handlePointerMove);
    mesh.geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  };
}

/* Auto-init: every .floating-lines-container gets a DIM Honda config —
   deep brand reds on black, a single calm middle wave, fewer, wider
   lines so it reads as a subtle premium glow, not red fog. Overall
   dimming is done with container opacity (per section, in CSS) so the
   thin bright line cores stay crisp while the field stays quiet.
   Per-element overrides via data-fl-* attributes. */
function configFor(host) {
  const d = host.dataset;
  /* Per-section flow angle (data-fl-angle, radians) tilts the whole
     field. Hero uses ~top-left→bottom-right. middleWavePosition adds the
     curl/offset. */
  const middleWavePosition = {
    x: d.flX !== undefined ? Number(d.flX) : 0,
    y: d.flY !== undefined ? Number(d.flY) : 0,
    rotate: d.flRotate !== undefined ? Number(d.flRotate) : 0.4,
  };
  return {
    /* colour + dim untouched per user: brand reds, dimmed in CSS */
    linesGradient: (d.flGradient ? d.flGradient.split(',') : ['#E40521', '#6a0c16', '#240609']),
    enabledWaves: ['middle'],
    lineCount: d.flLines ? Number(d.flLines) : 8,      // fewer, cleaner
    lineDistance: [d.flDistance ? Number(d.flDistance) : 16],
    middleWavePosition,
    globalRotate: d.flAngle !== undefined ? Number(d.flAngle) : 0,
    bendRadius: 10.5,
    bendStrength: 2.5,
    animationSpeed: d.flSpeed ? Number(d.flSpeed) : 1.6, // faster turn
    interactive: false,   // mouse interaction closed
    parallax: true,
    parallaxStrength: 0.16,
    scrollDrive: d.flScroll !== undefined,
    scrollStrength: d.flScrollStrength ? Number(d.flScrollStrength) : 1,
    mixBlendMode: 'screen',
  };
}

/* Lazy init/dispose: a section's WebGL context is created only when it
   scrolls near the viewport and destroyed when it leaves. This keeps at
   most ~1 live context on screen at a time, so the browser never runs
   out of WebGL contexts (the cause of sections coming up blank). */
function bootstrap() {
  const hosts = [...document.querySelectorAll('.floating-lines-container')];
  if (!hosts.length) return;
  const disposers = new Map();

  if (typeof IntersectionObserver === 'undefined') {
    hosts.forEach((h) => initFloatingLines(h, configFor(h)));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const host = e.target;
      if (e.isIntersecting) {
        if (!disposers.has(host)) {
          disposers.set(host, initFloatingLines(host, configFor(host)));
        }
      } else {
        const d = disposers.get(host);
        if (d) { d(); disposers.delete(host); }
      }
    });
  }, { rootMargin: '250px 0px' });

  hosts.forEach((h) => io.observe(h));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
