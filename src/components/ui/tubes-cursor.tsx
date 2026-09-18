import React, { useEffect, useRef } from 'react';

export default function TubesCursor() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  // REGLA 4: BLOQUEO DEL RANDOMIZADOR
  // Array estricto con la paleta de alto impacto de MundoGraff
  const brandColors = ["#9E002B", "#FF5A00", "#FFA200", "#008E7A", "#7A225B"];

  const randomColors = (count) => {
    return new Array(count).fill(0).map(() => {
      const randomIndex = Math.floor(Math.random() * brandColors.length);
      return brandColors[randomIndex];
    });
  };

  // REGLA 6: Mantener useEffect, setTimeout y dispose()
  useEffect(() => {
    const initTimer = setTimeout(() => {
      import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')
        .then(module => {
          const TubesCursorComponent = module.default;
          
          if (canvasRef.current) {
            const app = TubesCursorComponent(canvasRef.current, {
              tubes: {
                // REGLA 3: COLORES DE LOS TUBOS (BRANDING ESTRICTO)
                colors: ["#9E002B", "#FF5A00", "#FFA200"],
                lights: {
                  intensity: 200,
                  colors: ["#008E7A", "#7A225B", "#FF5A00"]
                }
              }
            });
            appRef.current = app;
          }
        })
        .catch(err => console.error("Failed to load TubesCursor module:", err));
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (appRef.current && typeof appRef.current.dispose === 'function') {
        appRef.current.dispose();
      }
    };
  }, []);

  const handleClick = () => {
    if (appRef.current) {
      const newTubeColors = randomColors(3);
      const newLightColors = randomColors(4);
      
      appRef.current.tubes.setColors(newTubeColors);
      appRef.current.tubes.setLightsColors(newLightColors);
    }
  };

  return (
    // REGLA 1: ADAPTACIÓN AL FONDO NEGRO PURO CON FUNDIDO
    <div
      onClick={handleClick}
      className="relative min-h-[90vh] w-full bg-black overflow-hidden cursor-pointer flex flex-col items-center justify-center"
    >
      {/* Canvas 3D de Tubos */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />
      
      {/* MÁSCARAS DE FUNDIDO (ELIMINAN CORTES RECTOS EN EL CANVAS) */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black to-transparent pointer-events-none z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10"></div>
      
      {/* REGLA 5: CONTENIDO DEL HERO y REGLA 2: TIPOGRAFÍA Y CONTRASTE */}
      <div className="relative z-20 flex flex-col items-center justify-center gap-6 px-4 text-center pointer-events-none">
        
        <h1 className="m-0 p-0 text-6xl md:text-[clamp(4rem,8vw,8rem)] font-heading font-extrabold uppercase leading-none tracking-tighter drop-shadow-lg">
          <span className="text-white">MUNDO</span> <span className="bg-gradient-to-br from-[#FF5A00] to-[#FFA200] text-transparent bg-clip-text drop-shadow-[0_2px_15px_rgba(255,90,0,0.4)]">GRAFF</span>
        </h1>
        
        {/* REGLA 3: TEXTOS LIMPIOS Y MATES */}
        <p className="m-0 p-0 text-neutral-400 text-lg md:text-2xl font-sans font-medium max-w-2xl drop-shadow">
          Soluciones integrales en cartelería comercial, papelería y ploteos de alta definición.
        </p>

        {/* Indicador de Scroll → Sección Servicios */}
        <a href="#servicios" className="mt-12 flex flex-col items-center gap-2 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity duration-300 group">
          <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-white/40 group-hover:text-white/60 transition-colors duration-300">
            Descubrí nuestros servicios
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF5A00] animate-bounce">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
