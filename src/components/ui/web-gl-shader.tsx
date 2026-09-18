"use client"

import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export default function WebGLShader({ className = "absolute inset-0 w-full h-full block -z-10 pointer-events-none" }: { className?: string }) {
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

      // REGLA 1: DENSIDAD DE HACES (Rieles/Lluvia digital)
      // Genera un haz vertical que cae (con una variación micro-onda horizontal)
      float calculateRain(vec2 p, float xPos, float width, float yFreq, float speed, float phase, float t) {
          // Micro ondulación en el eje X para darle organicidad sin perder la rectitud
          float waveX = xPos + sin(p.y * 1.5 + phase) * 0.015;
          float dist = abs(p.x - waveX);
          
          // Glow difuso lateral
          float hGlow = pow(width / (dist + width), 1.6);
          
          // REGLA 3: CAÍDA (sumamos 't * speed' al eje Y para que caiga)
          float vPattern = sin(p.y * yFreq + t * speed + phase);
          // Agudizar los picos de luz (focos luminosos cayendo)
          vPattern = pow(vPattern * 0.5 + 0.5, 3.0);
          
          return hGlow * vPattern;
      }

      void main() {
        // Coordenadas normalizadas, ajustadas a la relación de aspecto del contenedor
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / max(resolution.x, resolution.y);

        // REGLA 2: PALETA DE COLORES (Mayoría Fría, Acentos Cálidos)
        vec3 teal        = vec3(0.000, 0.557, 0.478); // #008E7A
        vec3 ultramarine = vec3(0.165, 0.294, 0.612); // #2A4B9C (Versión brillante)
        vec3 violet      = vec3(0.478, 0.133, 0.357); // #7A225B
        vec3 crimson     = vec3(0.620, 0.000, 0.169); // #9E002B
        vec3 orange      = vec3(1.000, 0.353, 0.000); // #FF5A00

        // REGLA 3: VELOCIDAD MEDIA-LENTA
        float t = time * 0.25;

        vec3 finalColor = vec3(0.0);

        // === 75% HACES FRÍOS (8 haces) ===
        // p, xPos, width, yFreq, speed, phase, time
        finalColor += teal        * calculateRain(p, -0.85, 0.010, 4.0, 1.2, 0.0, t);
        finalColor += ultramarine * calculateRain(p, -0.65, 0.015, 2.5, 0.9, 1.5, t);
        finalColor += violet      * calculateRain(p, -0.40, 0.008, 5.0, 1.6, 3.2, t);
        finalColor += teal        * calculateRain(p, -0.20, 0.012, 3.0, 1.1, 5.1, t);
        
        finalColor += ultramarine * calculateRain(p,  0.15, 0.010, 4.5, 1.3, 2.4, t);
        finalColor += violet      * calculateRain(p,  0.35, 0.018, 2.0, 0.8, 4.7, t);
        finalColor += teal        * calculateRain(p,  0.60, 0.014, 3.5, 1.4, 0.8, t);
        finalColor += ultramarine * calculateRain(p,  0.80, 0.009, 5.5, 1.7, 6.3, t);

        // === 25% HACES CÁLIDOS (2 haces) - Acentos sutiles vibrantes ===
        // Multiplicamos por 0.8 y 0.7 para que no dominen la mezcla fría
        finalColor += crimson * calculateRain(p, -0.55, 0.011, 3.2, 1.5, 4.2, t) * 0.85;
        finalColor += orange  * calculateRain(p,  0.50, 0.007, 6.0, 2.0, 1.1, t) * 0.75;

        // PROTECCIÓN DE TEXTURA CENTRAL (Para facilitar la lectura del texto)
        float centerDist = length(vec2(p.x * 1.5, p.y * 0.6));
        float textProtection = smoothstep(0.2, 1.5, centerDist);
        finalColor *= mix(0.3, 1.0, textProtection); // 30% de intensidad en el centro

        // REGLA 4: TONE MAPPING / MEZCLA ADITIVA (Soft Clamp)
        // Evita que los colores se vuelvan blanco puro al cruzarse, manteniendo pureza
        finalColor = 1.0 - exp(-finalColor * 1.5);

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
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}