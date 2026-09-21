/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta de colores oficial de MundoGraff (Vibrante)
        'mundo-carmesi': '#9E002B',   // Carmesí premium protagonista
        'mundo-coral': '#FF3C1A',     // Coral encendido
        'mundo-naranja': '#FF5A00',   // Naranja vibrante de alto impacto
        'mundo-amarillo': '#FFA200',  // Amarillo/Ámbar de alta visibilidad
        'mundo-fondo': '#FFFFFF',     // Blanco de alta vibranza
        'mundo-fondo-leve': '#F9FAFB', // Gris ultra sutil para secciones
        'mundo-teal': '#008E7A',      // Verde azulado/teal de impresión
        'mundo-azul': '#0C1C47',      // Azul ultramar/oscuro
        'mundo-violeta': '#7A225B',   // Violeta para sombras/transiciones
        'mundo-oscuro': '#111827',    // Gris oscuro/carbón para lectura y footer
      },
      fontFamily: {
        'sans': ['"Momo Trust Display"', 'sans-serif'],
        'heading': ['"Momo Trust Display"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}