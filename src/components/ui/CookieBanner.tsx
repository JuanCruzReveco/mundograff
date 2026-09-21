import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Al montarse, verificamos si ya existe la cookie en localStorage
    const cookiesAccepted = localStorage.getItem('mundograff_cookies_accepted');
    if (!cookiesAccepted) {
      // Usamos un pequeño timeout para que la animación de entrada no ocurra inmediatamente
      // sino un ratito después de cargar la página, lo que es menos invasivo.
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mundograff_cookies_accepted', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm md:w-96"
        >
          <div className="flex flex-col gap-4 bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 mb-1">
              {/* Icono sutil de cookie */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 dark:text-neutral-400">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                <path d="M8.5 8.5v.01"/>
                <path d="M16 12.5v.01"/>
                <path d="M12 16v.01"/>
                <path d="M11 11.5v.01"/>
              </svg>
              <h3 className="text-[#0C1C47] dark:text-white font-bold text-sm tracking-wide">Política de Privacidad</h3>
            </div>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              Utilizamos cookies para mejorar tu experiencia y analizar el tráfico de nuestra web. Al continuar navegando, aceptas nuestra Política de Privacidad.
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <a 
                href="/privacidad" 
                className="text-sm text-neutral-300 hover:text-[#0C1C47] dark:text-white underline-offset-4 hover:underline transition-colors font-sans"
              >
                Leer más
              </a>
              
              <button
                onClick={handleAccept}
                className="px-5 py-2 text-sm font-bold bg-[#FF5A00] text-[#0C1C47] dark:text-white rounded-lg hover:bg-[#E65000] transition-colors shadow-[0_0_15px_rgba(255,90,0,0.3)] hover:shadow-[0_0_20px_rgba(255,90,0,0.5)] active:scale-95"
              >
                Aceptar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
