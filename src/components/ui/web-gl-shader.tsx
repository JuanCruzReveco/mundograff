"use client"

import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export default function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const refs: any = {}

    const vertexShader = `
      precision highp float;
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    // REGLA 1: CAÍDA VERTICAL (Auroras)
    // REGLA 3: PALETA DE COLORES
    // REGLA 4: MEZCLA LUMINOSA SIN SATURAR A BLANCO
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float distortion;

      // Calcula el haz de luz vertical curvo
      float calculateVerticalBeam(vec2 p, float t, float freq, float amp, float phase, float thickness) {
          // Curvatura sobre el eje Y. Al sumar 't' se desliza hacia abajo
          float waveX = sin(p.y * freq + t + phase) * amp;
          waveX += cos(p.y * freq * 1.5 - t * 0.5) * (amp * 0.3); 
          
          float dist = abs(p.x - waveX);
          
          // Glow difuso premium estilo aurora (decay exponencial suave)
          return pow(thickness / (dist + thickness), 1.4);
      }

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        // Sutil distorsión de lente (aberración esférica mínima)
        float d = length(p) * distortion;
        vec2 distortedP = p * (1.0 + d);

        // PROTECCIÓN CENTRAL: Atenuamos la luz en el centro para que el texto resalte
        float centerDist = length(vec2(p.x * 1.5, p.y * 0.8));
        float protectionWaves = smoothstep(0.1, 1.5, centerDist);
        float waveOpacity = mix(0.3, 1.0, protectionWaves);

        // Paleta de la Marca (Normalizada a vec3)
        vec3 crimson = vec3(0.620, 0.0, 0.169);   // #9E002B
        vec3 orange  = vec3(1.0, 0.353, 0.0);     // #FF5A00
        vec3 teal    = vec3(0.0, 0.557, 0.478);   // #008E7A
        vec3 violet  = vec3(0.478, 0.133, 0.357); // #7A225B

        // REGLA 2: VELOCIDAD ELEGANTE Y LENTA
        float t = time * 0.15; 

        // Generación de los 4 haces de luz entrelazados
        float b1 = calculateVerticalBeam(distortedP, t * 1.2, 1.2, 0.4, 0.0, 0.015) * waveOpacity;
        float b2 = calculateVerticalBeam(distortedP, t * 0.9, 1.8, 0.5, 2.0, 0.025) * waveOpacity;
        float b3 = calculateVerticalBeam(distortedP, t * 1.5, 1.0, 0.3, 4.0, 0.018) * waveOpacity;
        float b4 = calculateVerticalBeam(distortedP, t * 1.1, 2.2, 0.4, 1.5, 0.012) * waveOpacity;

        // Fondo Negro Puro
        vec3 finalColor = vec3(0.0);

        // Suma Aditiva de Colores (Luces Cruzadas)
        finalColor += crimson * b1 * 1.2;
        finalColor += orange * b2 * 1.0;
        finalColor += teal * b3 * 1.5;
        finalColor += violet * b4 * 1.3;

        // Tone Mapping Exponencial (Soft Clamp)
        // Evita que los cruces se quemen a blanco puro, conservando el color como tintas luminosas
        finalColor = 1.0 - exp(-finalColor * 1.2);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      refs.renderer.setPixelRatio(window.devicePixelRatio)
      
      // REGLA 5: FONDO NEGRO PURO
      refs.renderer.setClearColor(new THREE.Color(0x000000))

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [window.innerWidth, window.innerHeight] },
        time: { value: 0.0 },
        distortion: { value: 0.03 },
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
        // Avance sutil para mayor elegancia
        refs.uniforms.time.value += 0.01 
      }
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return
      const width = window.innerWidth
      const height = window.innerHeight
      refs.renderer.setSize(width, height, false)
      refs.uniforms.resolution.value = [width, height]
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener("resize", handleResize)
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
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block -z-10 pointer-events-none"
    />
  )
}