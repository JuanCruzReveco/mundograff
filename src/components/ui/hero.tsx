import WebGLShader from "./web-gl-shader.tsx";
import { LiquidButton } from "./liquid-glass-button.tsx";

export default function HeroReact() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden min-h-[90vh]">
      <WebGLShader /> 
      
      {/* Contenedor limpio, sin bordes grises y priorizando legibilidad */}
      <div className="relative p-4 w-full mx-auto max-w-4xl z-10">
        <main className="relative py-12 flex flex-col items-center">
          
          <h1 className="mb-4 text-[#0C1C47] dark:text-white text-center text-6xl font-heading font-extrabold tracking-tighter md:text-[clamp(2.5rem,8vw,6rem)] drop-shadow-lg">
            Design is Everything
          </h1>
          
          <p className="text-slate-300 px-6 text-center text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-medium leading-relaxed drop-shadow">
            Unleashing creativity through bold visuals, seamless interfaces, and limitless possibilities.
          </p>
          
          <div className="my-8 flex items-center justify-center gap-2 bg-[#050B1A]/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5A00] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF5A00]"></span>
            </span>
            <p className="text-xs font-semibold text-[#FF5A00] uppercase tracking-wide">
              Servicios Activos
            </p>
          </div>
            
          <div className="flex justify-center mt-2"> 
            <LiquidButton 
              size="xl"
              className="bg-gradient-to-r from-[#9E002B] to-[#FF5A00] text-[#0C1C47] dark:text-white border-0 shadow-xl shadow-[#FF5A00]/20 font-heading font-extrabold uppercase tracking-widest px-10 hover:shadow-[#FF5A00]/40"
            >
              Pedir Presupuesto
            </LiquidButton> 
          </div> 
          
        </main>
      </div>
    </div>
  )
}
