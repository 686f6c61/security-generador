/**
 * Generador de contraseñas seguras
 * Permite crear contraseñas aleatorias basadas en diferentes opciones
 * y utilizando datos de entropía adicionales como semilla
 */

// Conjuntos de caracteres para la generación de contraseñas
const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*-_=+',
  brackets: '[]{}()<>',
  highAnsi: 'ÁÉÍÓÚÑÜáéíóúñüç±¥µ€£¢'
};

/**
 * Genera una contraseña segura basada en las opciones proporcionadas
 * @param {Object} options - Opciones de generación
 * @param {number} options.length - Longitud de la contraseña
 * @param {boolean} options.useLowercase - Incluir letras minúsculas
 * @param {boolean} options.useUppercase - Incluir letras mayúsculas
 * @param {boolean} options.useNumbers - Incluir números
 * @param {boolean} options.useSymbols - Incluir símbolos
 * @param {boolean} options.useBrackets - Incluir paréntesis y corchetes
 * @param {boolean} options.useHighAnsi - Incluir caracteres especiales
 * @param {string} [entropy] - Datos adicionales de entropía como semilla
 * @returns {string} Contraseña generada
 */
export const generatePassword = (options, entropy = '') => {
  // Validar opciones
  const length = Math.max(8, options.length || 16);
  
  // Crear conjunto de caracteres a utilizar
  let characterSet = '';
  if (options.useLowercase) characterSet += CHARACTER_SETS.lowercase;
  if (options.useUppercase) characterSet += CHARACTER_SETS.uppercase;
  if (options.useNumbers) characterSet += CHARACTER_SETS.numbers;
  if (options.useSymbols) characterSet += CHARACTER_SETS.symbols;
  if (options.useBrackets) characterSet += CHARACTER_SETS.brackets;
  if (options.useHighAnsi) characterSet += CHARACTER_SETS.highAnsi;
  
  // Si no se seleccionó ningún conjunto, usar lowercase por defecto
  if (characterSet.length === 0) {
    characterSet = CHARACTER_SETS.lowercase;
  }
  
  // Generar contraseña
  let password = '';
  let seedValue = createSeedFromEntropy(entropy);
  
  for (let i = 0; i < length; i++) {
    // Generar número pseudoaleatorio usando la semilla y la posición actual
    seedValue = (seedValue * 9301 + 49297) % 233280;
    const randomValue = seedValue / 233280;
    
    // Seleccionar carácter aleatorio basado en el conjunto
    const randomIndex = Math.floor(randomValue * characterSet.length);
    password += characterSet[randomIndex];
  }
  
  // Asegurar que la contraseña incluye al menos un carácter de cada conjunto seleccionado
  const ensureCharacterSets = [
    { condition: options.useLowercase, set: CHARACTER_SETS.lowercase },
    { condition: options.useUppercase, set: CHARACTER_SETS.uppercase },
    { condition: options.useNumbers, set: CHARACTER_SETS.numbers },
    { condition: options.useSymbols, set: CHARACTER_SETS.symbols },
    { condition: options.useBrackets, set: CHARACTER_SETS.brackets },
    { condition: options.useHighAnsi, set: CHARACTER_SETS.highAnsi }
  ];
  
  // Reemplazar caracteres para asegurar que todos los tipos requeridos están presentes
  ensureCharacterSets.forEach(({ condition, set }, index) => {
    if (condition && set.length > 0) {
      // Posición a reemplazar basada en el índice del conjunto
      const position = (index * 83) % password.length;
      // Carácter aleatorio del conjunto requerido
      const randomIndex = Math.floor((seedValue + index) % set.length);
      
      // Reemplazar el carácter en la posición calculada
      password = 
        password.substring(0, position) + 
        set[randomIndex] + 
        password.substring(position + 1);
    }
  });
  
  return password;
};

/**
 * Crea una semilla numérica a partir de una cadena de entropía
 * @param {string} entropyString - Cadena de entropía
 * @returns {number} Valor numérico para usar como semilla
 */
const createSeedFromEntropy = (entropyString) => {
  // Si no hay entropía, usar la fecha actual
  if (!entropyString) {
    return Date.now();
  }
  
  // Crear una semilla hash simple basada en la cadena de entropía
  let seed = 0;
  for (let i = 0; i < entropyString.length; i++) {
    // Algoritmo simple de hash
    seed = ((seed << 5) - seed) + entropyString.charCodeAt(i);
    seed |= 0; // Convertir a entero de 32 bits
  }
  
  // Asegurarse de que la semilla sea positiva
  return Math.abs(seed);
};

/**
 * Evalúa la fortaleza de una contraseña
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} Resultado de la evaluación incluyendo entropía y fortaleza
 */
export const evaluatePasswordStrength = (password) => {
  if (!password) return { entropy: 0, strength: 'Sin calcular', crackTime: 'N/A' };
  
  // Calcular el conjunto de caracteres efectivo
  let charSetSize = 0;
  if (/[a-z]/.test(password)) charSetSize += 26;
  if (/[A-Z]/.test(password)) charSetSize += 26;
  if (/[0-9]/.test(password)) charSetSize += 10;
  if (/[!@#$%^&*\-_=+]/.test(password)) charSetSize += 16;
  if (/[\[\]{}()<>]/.test(password)) charSetSize += 8;
  if (/[ÁÉÍÓÚÑÜáéíóúñüç±¥µ€£¢]/.test(password)) charSetSize += 16;
  
  // Si no se detectó ningún conjunto específico, asumir 26 caracteres
  if (charSetSize === 0) charSetSize = 26;
  
  // Calcular la entropía: log2(conjuntoCaracteres^longitud)
  const entropy = Math.log2(Math.pow(charSetSize, password.length));
  
  // Determinar la fortaleza según la entropía
  let strength;
  if (entropy < 28) strength = 'Muy débil';
  else if (entropy < 36) strength = 'Débil';
  else if (entropy < 60) strength = 'Razonable';
  else if (entropy < 128) strength = 'Fuerte';
  else strength = 'Muy fuerte';
  
  // Estimar tiempo aproximado para descifrar por fuerza bruta (valores muy aproximados)
  // Asumiendo 1 billón de intentos por segundo (computadora potente/cluster)
  const attemptsPerSecond = 1e12;
  const seconds = Math.pow(2, entropy) / attemptsPerSecond;
  
  // Formatear el tiempo de descifrado estimado
  let crackTime;
  if (seconds < 60) crackTime = 'menos de un minuto';
  else if (seconds < 3600) crackTime = `${Math.floor(seconds / 60)} minutos`;
  else if (seconds < 86400) crackTime = `${Math.floor(seconds / 3600)} horas`;
  else if (seconds < 31536000) crackTime = `${Math.floor(seconds / 86400)} días`;
  else if (seconds < 31536000 * 100) crackTime = `${Math.floor(seconds / 31536000)} años`;
  else if (seconds < 31536000 * 1000) crackTime = 'siglos';
  else crackTime = 'prácticamente irrompible';
  
  return {
    entropy: entropy.toFixed(2),
    strength,
    crackTime
  };
}; 