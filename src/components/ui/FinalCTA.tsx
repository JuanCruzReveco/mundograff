import React, { useRef, useEffect } from 'react';

// Reusable Shader Background Hook
const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const pointersRef = useRef<PointerHandler | null>(null);

  // WebGL Renderer class
  class WebGLRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private vs: WebGLShader | null = null;
    private fs: WebGLShader | null = null;
    private buffer: WebGLBuffer | null = null;
    private scale: number;
    private shaderSource: string;
    private mouseMove = [0, 0];
    private mouseCoords = [0, 0];
    private pointerCoords = [0, 0];
    private nbrOfPointers = 0;

    private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    constructor(canvas: HTMLCanvasElement, scale: number) {
      this.canvas = canvas;
      this.scale = scale;
      this.gl = canvas.getContext('webgl2')!;
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
      this.shaderSource = defaultShaderSource;
    }

    updateShader(source: string) {
      this.reset();
      this.shaderSource = source;
      this.setup();
      this.init();
    }

    updateMove(deltas: number[]) {
      this.mouseMove = deltas;
    }

    updateMouse(coords: number[]) {
      this.mouseCoords = coords;
    }

    updatePointerCoords(coords: number[]) {
      this.pointerCoords = coords;
    }

    updatePointerCount(nbr: number) {
      this.nbrOfPointers = nbr;
    }

    updateScale(scale: number) {
      this.scale = scale;
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }

    compile(shader: WebGLShader, source: string) {
      const gl = this.gl;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        console.error('Shader compilation error:', error);
      }
    }

    test(source: string) {
      let result = null;
      const gl = this.gl;
      const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        result = gl.getShaderInfoLog(shader);
      }
      gl.deleteShader(shader);
      return result;
    }

    reset() {
      const gl = this.gl;
      if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
        if (this.vs) {
          gl.detachShader(this.program, this.vs);
          gl.deleteShader(this.vs);
        }
        if (this.fs) {
          gl.detachShader(this.program, this.fs);
          gl.deleteShader(this.fs);
        }
        gl.deleteProgram(this.program);
      }
    }

    setup() {
      const gl = this.gl;
      this.vs = gl.createShader(gl.VERTEX_SHADER)!;
      this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      this.compile(this.vs, this.vertexSrc);
      this.compile(this.fs, this.shaderSource);
      this.program = gl.createProgram()!;
      gl.attachShader(this.program, this.vs);
      gl.attachShader(this.program, this.fs);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(this.program));
      }
    }

    init() {
      const gl = this.gl;
      const program = this.program!;
      
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      (program as any).resolution = gl.getUniformLocation(program, 'resolution');
      (program as any).time = gl.getUniformLocation(program, 'time');
      (program as any).move = gl.getUniformLocation(program, 'move');
      (program as any).touch = gl.getUniformLocation(program, 'touch');
      (program as any).pointerCount = gl.getUniformLocation(program, 'pointerCount');
      (program as any).pointers = gl.getUniformLocation(program, 'pointers');
    }

    render(now = 0) {
      const gl = this.gl;
      const program = this.program;
      
      if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

      // Asegurar el negro puro
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      
      gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
      gl.uniform1f((program as any).time, now * 1e-3);
      gl.uniform2f((program as any).move, ...this.mouseMove);
      gl.uniform2f((program as any).touch, ...this.mouseCoords);
      gl.uniform1i((program as any).pointerCount, this.nbrOfPointers);
      gl.uniform2fv((program as any).pointers, this.pointerCoords);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  // Pointer Handler class
  class PointerHandler {
    private scale: number;
    private active = false;
    private pointers = new Map<number, number[]>();
    private lastCoords = [0, 0];
    private moves = [0, 0];

    constructor(element: HTMLCanvasElement, scale: number) {
      this.scale = scale;
      
      const map = (element: HTMLCanvasElement, scale: number, x: number, y: number) => 
        [x * scale, element.height - y * scale];

      element.addEventListener('pointerdown', (e) => {
        this.active = true;
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
      });

      element.addEventListener('pointerup', (e) => {
        if (this.count === 1) {
          this.lastCoords = this.first;
        }
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });

      element.addEventListener('pointerleave', (e) => {
        if (this.count === 1) {
          this.lastCoords = this.first;
        }
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });

      element.addEventListener('pointermove', (e) => {
        if (!this.active) return;
        this.lastCoords = [e.clientX, e.clientY];
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
        this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
      });
    }

    getScale() {
      return this.scale;
    }

    updateScale(scale: number) {
      this.scale = scale;
    }

    get count() {
      return this.pointers.size;
    }

    get move() {
      return this.moves;
    }

    get coords() {
      return this.pointers.size > 0 
        ? Array.from(this.pointers.values()).flat() 
        : [0, 0];
    }

    get first() {
      return this.pointers.values().next().value || this.lastCoords;
    }
  }

  const resize = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    if (rendererRef.current) {
      rendererRef.current.updateScale(dpr);
    }
  };

  const loop = (now: number) => {
    if (!rendererRef.current || !pointersRef.current) return;
    
    rendererRef.current.updateMouse(pointersRef.current.first);
    rendererRef.current.updatePointerCount(pointersRef.current.count);
    rendererRef.current.updatePointerCoords(pointersRef.current.coords);
    rendererRef.current.updateMove(pointersRef.current.move);
    rendererRef.current.render(now);
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    
    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);
    
    rendererRef.current.setup();
    rendererRef.current.init();
    
    resize();
    
    if (rendererRef.current.test(defaultShaderSource) === null) {
      rendererRef.current.updateShader(defaultShaderSource);
    }
    
    loop(0);
    
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.reset();
      }
    };
  }, []);

  return canvasRef;
};

const defaultShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T (time * 0.5)
#define R resolution
#define MN min(R.x, R.y)

float hash(vec2 p) {
    p = fract(p * vec2(12.9898, 78.233));
    p += dot(p, p + 34.56);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    mat2 m = mat2(1.6,  1.2, -1.2,  1.6);
    // OPTIMIZATION: Reduced from 6 to 3 octaves to save GPU cycles
    for(int i = 0; i < 3; i++){
        f += amp * noise(p);
        p *= m;
        amp *= 0.5;
    }
    return f;
}

float meteor(vec2 uv, vec2 p, float t, float speed) {
    float x = p.x + t * speed;
    x = fract((x + 3.0) / 6.0) * 6.0 - 3.0;
    vec2 pos = vec2(x, p.y);
    
    vec2 d = uv - pos;
    float core = exp(-length(vec2(d.x * 5.0, d.y * 40.0)) * 12.0);
    float tail = 0.0;
    if (d.x < 0.0) {
        tail = exp(-length(vec2(d.x * 0.8, d.y * 60.0)) * 4.0) * exp(d.x * 2.5);
    }
    return core + tail * 0.6;
}

void main(void) {
    // Coordenadas base
    vec2 baseUV = (FC - 0.5 * R) / R.y;
    vec2 origUV = (FC - 0.5 * R) / MN;
    
    // 1. Tormenta de Arena (Nubes)
    vec2 cloudUV = baseUV * 1.5 + vec2(T * 0.15, T * 0.05);
    float n1 = fbm(cloudUV);
    float n2 = fbm(cloudUV * 2.0 - vec2(T * 0.2));
    float storm = fbm(cloudUV + n1 + n2);
    
    // Paleta MundoGraff adaptada a la tormenta
    vec3 darkColor = vec3(0.05, 0.02, 0.0);
    vec3 crimson = vec3(0.620, 0.0, 0.169); // #9E002B
    vec3 orange = vec3(1.0, 0.353, 0.0);    // #FF5A00
    vec3 yellow = vec3(1.0, 0.635, 0.0);    // #FFA200
    
    vec3 bg = mix(darkColor, crimson, storm * 0.8);
    bg = mix(bg, orange, pow(storm, 2.0) * 0.9);
    bg = mix(bg, yellow, pow(storm, 4.0) * 0.5);

    // 2. Luces que Viajan (Meteors/Shooting Stars)
    vec3 meteors = vec3(0.0);
    // OPTIMIZATION: Reduced from 15 to 6 meteors to save GPU cycles
    for(float i = 0.0; i < 6.0; i++) {
        float h1 = hash(vec2(i, i * 1.1));
        float h2 = hash(vec2(i * 2.2, i));
        float h3 = hash(vec2(i * 3.3, i * 4.4));
        
        float y = (h1 * 2.0 - 1.0) * 1.2;
        float speed = 0.6 + h2 * 1.8;
        float offset = h3 * 20.0;
        
        float m = meteor(baseUV, vec2(0.0, y), T + offset, speed);
        
        vec3 mColor = mix(vec3(1.0, 0.95, 0.8), orange, h1 * 0.7);
        meteors += m * mColor * (0.6 + h2 * 0.8);
    }

    // 3. Estrellas originales que se enlazan (Dancing Lights)
    // --- 3. Dancing Nodes & Links ---
    float NUM_NODES = 6.0; // OPTIMIZATION: Reduced from 12 to 6
    vec3 nodesCol = vec3(0.0);
    origUV *= 1.0 - 0.3 * (sin(T * 0.2) * 0.5 + 0.5);
    
    for (float i = 1.0; i < NUM_NODES; i++) {
        origUV += 0.1 * cos(i * vec2(0.1 + 0.01 * i, 0.8) + i * i + T * 0.5 + 0.1 * origUV.x);
        vec2 p = origUV;
        float d = length(p);
        
        float mixFactor = (sin(i * 1.5 + T) * 0.5) + 0.5;
        vec3 waveColor = mix(crimson, orange, mixFactor);
        
        nodesCol += 0.0025 / d * waveColor;
        float b = noise(i + p + storm * 1.731);
        nodesCol += 0.003 * b / length(max(p, vec2(b * p.x * 0.02, p.y))) * waveColor;
    }

    // Combinar Todo (Nubes + Meteoros + Nodos enlazados)
    vec3 col = bg + meteors + nodesCol;
    
    // Viñeta para oscurecer los bordes
    float vignette = 1.0 - smoothstep(0.4, 1.8, length(baseUV));
    col *= vignette;
    
    O = vec4(col, 1.0);
}`;

import { motion, useScroll, useTransform } from 'framer-motion';

const FinalCTA: React.FC = () => {
  const canvasRef = useShaderBackground();
  const containerRef = useRef<HTMLElement>(null);

  // Animación de "encaje" como video (Framer Motion)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <section ref={containerRef} id="cta-final" className="relative w-full h-[100dvh] bg-white dark:bg-black flex items-center justify-center overflow-hidden snap-center">
      
      {/* Contenedor Animado que hace el efecto "Encaje de Video" */}
      <motion.div 
        style={{ scale, borderRadius }}
        className="relative w-full h-full overflow-hidden flex items-center justify-center"
      >
        {/* Canvas WebGL Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover touch-none pointer-events-none"
          style={{ background: 'black' }}
        />
        
        {/* Degradado superior para fundir el borde del video suavemente con el fondo */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
        
        {/* Degradado inferior para transición suave hacia el Footer */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-[#0C1C47] dark:text-white px-6">
          
          {/* Luz NEÓN Xenón (Exclusiva de Dark Mode a pedido del usuario) optimizada sin CSS blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] max-w-sm h-[80px] hidden dark:block bg-[radial-gradient(ellipse_at_center,_rgba(0,229,255,0.4)_0%,_transparent_70%)] pointer-events-none rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-3xl h-[200px] hidden dark:block bg-[radial-gradient(ellipse_at_center,_rgba(0,142,122,0.2)_0%,_transparent_70%)] pointer-events-none rounded-full" />

          {/* Trust Badge "Piola" */}
          <div className="mb-10">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-[#FF5A00]/30 rounded-full text-sm shadow-[0_0_15px_rgba(255,90,0,0.15)] transition-all hover:border-[#FF5A00]/60 hover:shadow-[0_0_20px_rgba(255,90,0,0.25)]">
                {/* Pulsing Dot */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF5A00]"></span>
                </span>
                <span className="text-neutral-200 tracking-widest font-bold uppercase text-xs md:text-sm">
                  3 Generaciones de Oficio Gráfico
                </span>
              </div>
          </div>

          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Main Heading */}
            <div className="space-y-2 leading-tight">
              <h2 className="text-5xl md:text-7xl font-heading font-bold text-white tracking-tight drop-shadow-md">
                ¿Listo para potenciar
              </h2>
              <h2 className="text-5xl md:text-7xl font-heading font-black bg-gradient-to-r from-[#9E002B] to-[#FF5A00] bg-clip-text text-transparent drop-shadow-lg pb-2">
                la imagen de tu marca?
              </h2>
            </div>
            
            {/* Subtitle */}
            <div className="max-w-2xl mx-auto pt-4 pb-8">
              <p className="text-lg md:text-xl text-neutral-300 font-sans leading-relaxed">
                Contactanos hoy mismo y transformemos tus ideas en cartelería e impresiones de alto impacto.
              </p>
            </div>
            
            {/* Botón Idéntico al Navbar */}
            <div className="flex justify-center mt-6">
              <a
                href="https://wa.me/542615109808?text=Hola%20MundoGraff,%20quisiera%20pedir%20un%20presupuesto"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#FF5A00] hover:bg-[#FFA200] text-black font-heading font-extrabold text-lg px-10 py-5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,90,0,0.5)] hover:shadow-[0_0_30px_rgba(255,162,0,0.7)] hover:scale-105"
              >
                <span>SOLICITAR PRESUPUESTO</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-[#000000]">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
