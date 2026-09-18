"use client"

import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export default function WebGLShader({ className = "absolute inset-0 w-full h-full block -z-10 pointer-events-none", style }: { className?: string, style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const refs: any = {}

    const vertexShader = `
      precision highp float;
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      // REGLA 1: HACES ESTILO "PILL" (Sólidos, rectilíneos y nítidos)
      float calculatePill(vec2 p, float xPos, float width, float yFreq, float speed, float phase, float pillLength, float t) {
          float dist = abs(p.x - xPos);
          
          // REGLA 3: CAÍDA MÁS RÁPIDA
          // yPattern va de 0 a 1 y repite.
          float yPattern = fract(p.y * yFreq + t * speed + phase);
          
          // Crear forma de píldora: sólido en el centro, difuminado suave en las puntas para redondear
          float vPattern = smoothstep(0.0, 0.05, yPattern) * smoothstep(pillLength, pillLength - 0.05, yPattern);
          
          // Núcleo súper nítido y sólido
          float core = smoothstep(width, width * 0.7, dist) * vPattern;
          
          // Glow muy sutil para que no ensucie, preservando el aspecto rígido
          float glow = exp(-dist * 120.0) * vPattern * 0.4;
          
          return core + glow;
      }

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / max(resolution.x, resolution.y);

        vec3 teal        = vec3(0.000, 0.557, 0.478); // #008E7A
        vec3 ultramarine = vec3(0.165, 0.294, 0.612); // #2A4B9C
        vec3 violet      = vec3(0.478, 0.133, 0.357); // #7A225B
        vec3 crimson     = vec3(0.620, 0.000, 0.169); // #9E002B
        vec3 orange      = vec3(1.000, 0.353, 0.000); // #FF5A00
        vec3 amber       = vec3(1.000, 0.635, 0.000); // #FFA200 (Extra para variedad)

        // VELOCIDAD MÁS RÁPIDA
        float t = time * 0.8;

        vec3 finalColor = vec3(0.0);

        // === DISTRIBUCIÓN DE HACES (Mayor densidad a la derecha) ===
        // calculatePill(p, xPos, width, yFreq, speed, phase, pillLength, t)
        
        // Izquierda (Menos densa)
        finalColor += ultramarine * calculatePill(p, -0.85, 0.006, 1.5, 0.8, 0.0, 0.3, t);
        finalColor += teal        * calculatePill(p, -0.65, 0.008, 2.0, 1.2, 0.5, 0.4, t);
        finalColor += violet      * calculatePill(p, -0.40, 0.004, 1.8, 0.9, 0.2, 0.2, t);
        finalColor += crimson     * calculatePill(p, -0.25, 0.005, 2.5, 1.5, 0.8, 0.3, t) * 0.8;
        
        // Centro (Protegido, densidad baja)
        finalColor += teal        * calculatePill(p, -0.10, 0.007, 1.2, 0.7, 0.4, 0.3, t);
        finalColor += ultramarine * calculatePill(p,  0.15, 0.005, 1.6, 1.1, 0.9, 0.25, t);
        
        // Derecha (MUY densa, según requerimiento)
        finalColor += violet      * calculatePill(p,  0.30, 0.009, 1.4, 1.0, 0.1, 0.35, t);
        finalColor += teal        * calculatePill(p,  0.42, 0.005, 2.2, 1.6, 0.7, 0.2, t);
        finalColor += orange      * calculatePill(p,  0.55, 0.006, 1.8, 1.3, 0.3, 0.4, t) * 0.8;
        finalColor += ultramarine * calculatePill(p,  0.65, 0.008, 1.5, 0.9, 0.6, 0.3, t);
        finalColor += amber       * calculatePill(p,  0.72, 0.004, 2.8, 1.8, 0.2, 0.15, t) * 0.7;
        finalColor += teal        * calculatePill(p,  0.80, 0.007, 1.7, 1.1, 0.8, 0.45, t);
        finalColor += violet      * calculatePill(p,  0.88, 0.005, 2.0, 1.4, 0.5, 0.25, t);
        finalColor += ultramarine * calculatePill(p,  0.95, 0.006, 1.3, 0.8, 0.9, 0.3, t);
        finalColor += crimson     * calculatePill(p,  1.05, 0.008, 1.9, 1.2, 0.1, 0.35, t) * 0.8;

        // PROTECCIÓN DE TEXTURA CENTRAL (Atenúa el fondo tras el texto)
        float centerDist = length(vec2(p.x * 1.5, p.y * 0.6));
        float textProtection = smoothstep(0.2, 1.2, centerDist);
        finalColor *= mix(0.15, 1.0, textProtection); // 15% de opacidad en el centro

        // Tone Mapping (Soft Clamp)
        finalColor = 1.0 - exp(-finalColor * 1.2);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      refs.renderer.setPixelRatio(window.devicePixelRatio)
      
      // Fondo negro puro estricto
      refs.renderer.setClearColor(new THREE.Color(0x000000))

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [container.clientWidth, container.clientHeight] },
        time: { value: 0.0 },
      }

      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
      ]

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
      })

      refs.mesh = new THREE.Mesh(geometry, material)
      refs.scene.add(refs.mesh)

      handleResize()
    }

    const animate = () => {
      if (refs.uniforms) {
        refs.uniforms.time.value += 0.01 
      }
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms || !containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      refs.renderer.setSize(width, height, false)
      refs.uniforms.resolution.value = [width, height]
    }

    // Usar ResizeObserver para que se adapte siempre al padre (la sección)
    const resizeObserver = new ResizeObserver(() => handleResize())
    resizeObserver.observe(container)

    initScene()
    animate()

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      resizeObserver.disconnect()
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose()
        }
      }
      refs.renderer?.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className={className} style={style}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}