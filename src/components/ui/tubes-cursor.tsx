import React, { useEffect, useRef, useState } from 'react';

export default function TubesCursor() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [isDark, setIsDark] = useState(true);

  // Colores para Tema Oscuro (Alto Impacto / Neón original)
  const darkTubeColors = ["#9E002B", "#FF5A00", "#FFA200"];
  const darkLightColors = ["#008E7A", "#7A225B", "#FF5A00"];
  const darkBrandColors = [...darkTubeColors, ...darkLightColors];

  // TRUCO DE INVERSIÓN PARA TEMA CLARO:
  // Como el canvas 3D dibuja fondo negro duro, usamos CSS `invert` en la etiqueta <canvas> para que el fondo sea Blanco Puro.
  // Por lo tanto, le pasamos a ThreeJS los colores INVERTIDOS, para que al aplicar el filtro final se vean como queremos.
  // Queremos: Azul Oscuro (#0C1C47), Rosa Fluor (#FF0055), Azul Fluor (#0044FF)
  const lightTubeColors = ["#F3E3B8", "#00FFAA", "#FFBB00"]; // Se verán: #0C1C47, #FF0055, #0044FF
  // Queremos luces: Naranja (#FF5A00), Morado Fluor (#7700FF), Teal (#008E7A)
  const lightLightColors = ["#00A5FF", "#88FF00", "#FF7185"]; // Se verán: #FF5A00, #7700FF, #008E7A
  const lightBrandColors = [...lightTubeColors, ...lightLightColors];

  const randomColors = (count, isDarkMode) => {
    const palette = isDarkMode ? darkBrandColors : lightBrandColors;
    return new Array(count).fill(0).map(() => {
      const randomIndex = Math.floor(Math.random() * palette.length);
      return palette[randomIndex];
    });
  };

  useEffect(() => {
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        return document.documentElement.classList.contains("dark");
      }
      return true;
    };
    
    setIsDark(checkTheme());

    const observer = new MutationObserver(() => {
      const currentlyDark = checkTheme();
      setIsDark(currentlyDark);
      
      if (appRef.current && appRef.current.tubes) {
        appRef.current.tubes.setColors(currentlyDark ? darkTubeColors : lightTubeColors);
        appRef.current.tubes.setLightsColors(currentlyDark ? darkLightColors : lightLightColors);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    const initTimer = setTimeout(() => {
      import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')
        .then(module => {
          const TubesCursorComponent = module.default;
          
          if (canvasRef.current) {
            const currentDark = checkTheme();
            const app = TubesCursorComponent(canvasRef.current, {
              tubes: {
                colors: currentDark ? darkTubeColors : lightTubeColors,
                lights: {
                  intensity: currentDark ? 200 : 150, // Reducimos un poco la luminosidad interna en claro
                  colors: currentDark ? darkLightColors : lightLightColors
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
      observer.disconnect();
      if (appRef.current && typeof appRef.current.dispose === 'function') {
        appRef.current.dispose();
      }
    };
  }, []);

  const handleClick = () => {
    if (appRef.current) {
      const newTubeColors = randomColors(3, isDark);
      const newLightColors = randomColors(4, isDark);
      
      appRef.current.tubes.setColors(newTubeColors);
      appRef.current.tubes.setLightsColors(newLightColors);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative min-h-[90vh] w-full bg-white dark:bg-black overflow-hidden cursor-pointer flex flex-col items-center justify-center transition-colors duration-500"
    >
      {/* Canvas 3D de Tubos - Aplicamos INVERT en modo claro para asegurar fondo 100% blanco puro */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full dark:invert-0 invert transition-all duration-500" />
      
      {/* MÁSCARAS DE FUNDIDO */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white dark:from-black to-transparent pointer-events-none z-10 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-white dark:from-black via-white/80 dark:via-black/80 to-transparent pointer-events-none z-10 transition-colors duration-500"></div>
      
      <div className="relative z-20 flex flex-col items-center justify-center gap-6 px-4 text-center pointer-events-none">
        
        {/* Usamos drop-shadow blanco en modo claro para crear un halo que separe el texto de los tubos coloridos */}
        <h1 className="m-0 p-0 text-6xl md:text-[clamp(4rem,8vw,8rem)] font-heading font-extrabold uppercase leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,1)] dark:drop-shadow-none">
          <span className="text-[#0C1C47] dark:text-white">MUNDO</span> <span className="bg-gradient-to-br from-[#FF5A00] to-[#FFA200] text-transparent bg-clip-text drop-shadow-[0_2px_15px_rgba(255,90,0,0.3)] dark:drop-shadow-[0_2px_15px_rgba(255,90,0,0.4)]">GRAFF</span>
        </h1>
        
        <p className="m-0 p-0 text-[#0C1C47] dark:text-neutral-400 text-lg md:text-2xl font-sans font-bold md:font-medium max-w-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] dark:drop-shadow">
          Soluciones integrales en cartelería comercial, papelería y ploteos de alta definición.
        </p>

        <a 
          href="/#servicios" 
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById('servicios');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="mt-12 flex flex-col items-center gap-2 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity duration-300 group"
        >
          <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-bold text-[#0C1C47] dark:font-normal dark:text-white/40 group-hover:text-[#FF5A00] dark:group-hover:text-white/60 transition-colors duration-300">
            Descubrí nuestros servicios
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF5A00] animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] dark:drop-shadow-none">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </div>
    </div>
  );
}

