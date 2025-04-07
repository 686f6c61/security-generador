/**
 * Utilidad para generar patrones visuales a partir de contraseñas
 * Convierte una contraseña en un patrón visual único y reproducible
 */

// Colores base para los patrones
const COLORS = [
  '#1976d2', // azul
  '#388e3c', // verde
  '#d32f2f', // rojo
  '#f57c00', // naranja
  '#7b1fa2', // púrpura
  '#00796b', // teal
  '#c2185b', // rosa
  '#fbc02d', // amarillo
  '#455a64', // azul grisáceo
  '#5d4037', // marrón
];

/**
 * Genera un color basado en un carácter
 * @param {string} char - Carácter para generar el color
 * @param {number} opacity - Opacidad del color (0-1)
 * @returns {string} - Color en formato rgba o hex
 */
export const getColorFromChar = (char, opacity = 1) => {
  const charCode = char.charCodeAt(0);
  const baseColor = COLORS[charCode % COLORS.length];
  
  if (opacity === 1) return baseColor;
  
  // Convertir hex a rgba
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Genera datos para un patrón de cuadrícula basado en la contraseña
 * @param {string} password - Contraseña para visualizar
 * @param {number} gridSize - Tamaño de la cuadrícula (ej: 5 para 5x5)
 * @returns {Array} - Matriz con datos de colores para la cuadrícula
 */
export const generateGridPattern = (password, gridSize = 5) => {
  if (!password || password === 'SIN CONTRASEÑA GENERADA' || password === 'Error al generar la contraseña') {
    return Array(gridSize).fill().map(() => Array(gridSize).fill(null));
  }
  
  // Crear matriz vacía
  const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
  
  // Semilla para pseudoaleatoriedad reproducible
  const seed = password.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Función seudo-aleatoria basada en la semilla
  const pseudoRandom = (max, index) => {
    const base = (seed + index * 13) % 10000 / 10000;
    return Math.floor(base * max);
  };
  
  // Llenar la cuadrícula con colores basados en la contraseña
  for (let i = 0; i < password.length; i++) {
    const row = pseudoRandom(gridSize, i);
    const col = pseudoRandom(gridSize, i + password.length);
    const char = password[i];
    
    // Determinar el color basado en el tipo de carácter
    let color = getColorFromChar(char);
    
    // Añadir variantes para categorías específicas
    if (/[A-Z]/.test(char)) {
      // Mayúsculas: más intensas
      color = getColorFromChar(char, 1.0);
    } else if (/[a-z]/.test(char)) {
      // Minúsculas: normal
      color = getColorFromChar(char, 0.8); 
    } else if (/[0-9]/.test(char)) {
      // Números: con patrón de puntos
      color = getColorFromChar(char, 0.7);
    } else {
      // Símbolos: con patrón de rayas
      color = getColorFromChar(char, 0.9);
    }
    
    // Guardar información detallada para renderizado
    grid[row][col] = {
      color,
      char,
      type: /[A-Z]/.test(char) ? 'uppercase' : 
            /[a-z]/.test(char) ? 'lowercase' :
            /[0-9]/.test(char) ? 'number' : 'symbol'
    };
  }
  
  return grid;
};

/**
 * Genera datos para un patrón de secuencia conectada
 * @param {string} password - Contraseña para visualizar
 * @param {number} gridSize - Tamaño de la cuadrícula (ej: 5 para 5x5)
 * @returns {Object} - Datos para dibujar el patrón conectado
 */
export const generateSequencePattern = (password, gridSize = 5) => {
  if (!password || password === 'SIN CONTRASEÑA GENERADA' || password === 'Error al generar la contraseña') {
    return { points: [], lines: [] };
  }
  
  // Semilla para pseudoaleatoriedad reproducible
  const seed = password.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Función seudo-aleatoria basada en la semilla
  const pseudoRandom = (max, index) => {
    const base = (seed + index * 17) % 10000 / 10000;
    return Math.floor(base * max);
  };
  
  const points = [];
  const lines = [];
  
  // Generar puntos para cada carácter
  for (let i = 0; i < password.length; i++) {
    const x = pseudoRandom(gridSize, i) + 0.5;
    const y = pseudoRandom(gridSize, i + password.length) + 0.5;
    const char = password[i];
    
    // Determinar el tamaño basado en el tipo de carácter
    let size = 0.4;
    if (/[A-Z]/.test(char)) size = 0.5;
    else if (/[0-9]/.test(char)) size = 0.35;
    else if (/[^A-Za-z0-9]/.test(char)) size = 0.45;
    
    points.push({
      x,
      y,
      color: getColorFromChar(char),
      size,
      char,
      type: /[A-Z]/.test(char) ? 'uppercase' : 
            /[a-z]/.test(char) ? 'lowercase' :
            /[0-9]/.test(char) ? 'number' : 'symbol'
    });
    
    // Conectar con el punto anterior
    if (i > 0) {
      lines.push({
        from: i - 1,
        to: i,
        color: getColorFromChar(char, 0.5)
      });
    }
  }
  
  return { points, lines };
};

/**
 * Genera un identificador visual único basado en la contraseña
 * Útil para verificación visual (similar a los identificadores visuales de SSH)
 * @param {string} password - Contraseña para generar el identificador
 * @param {number} numBlocks - Número de bloques de color
 * @returns {Array} - Array de colores para el identificador
 */
export const generateVisualFingerprint = (password, numBlocks = 6) => {
  if (!password || password === 'SIN CONTRASEÑA GENERADA' || password === 'Error al generar la contraseña') {
    return Array(numBlocks).fill('#e0e0e0');
  }
  
  // Crear un hash simple de la contraseña
  const hash = password.split('').reduce((acc, char, i) => {
    return acc + char.charCodeAt(0) * (i + 1);
  }, 0);
  
  const result = [];
  
  // Generar colores basados en diferentes secciones del hash
  for (let i = 0; i < numBlocks; i++) {
    const value = (hash + i * 127) % 1000;
    const index = value % COLORS.length;
    result.push(COLORS[index]);
  }
  
  return result;
}; 