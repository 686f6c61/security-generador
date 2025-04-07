import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const usePasswordGenerator = () => {
  // Estado para la contraseña
  const [password, setPassword] = useState('');
  
  // Estado para las configuraciones
  const [passwordOptions, setPasswordOptions] = useState({
    length: 14,
    useLowercase: true,
    useUppercase: true,
    useNumbers: true,
    useSymbols: true,
    useBrackets: false,
    useHighAnsi: false,
    useWords: false,
    wordCount: 3,
    language: 'es'
  });
  
  // Estado para la entropía y seguridad
  const [passwordStrength, setPasswordStrength] = useState({
    entropy: 0,
    strength: '',
    crackTime: ''
  });
  
  // Estado para notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: ''
  });
  
  // Estado para el mouse entropy collector
  const [entropy, setEntropy] = useState(0);
  const [lastGenerationTime, setLastGenerationTime] = useState(0);
  const GENERATION_INTERVAL = 100; // ms
  const REQUIRED_ENTROPY = 100;
  
  // Función para generar caracteres proporcionales
  const generateProportionalChars = useCallback((charset, count) => {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }, []);
  
  // Función para asegurar que todos los tipos de caracteres estén presentes
  const ensureSelectedOptionsIncluded = useCallback((pwd, options) => {
    const charsets = {
      useLowercase: 'abcdefghijklmnopqrstuvwxyz',
      useUppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      useNumbers: '0123456789',
      useSymbols: '!@#$%^&*',
      useBrackets: '[]{}()',
      useHighAnsi: '±¥µç'
    };

    let newPassword = pwd;
    
    for (let option in charsets) {
      if (options[option] && !new RegExp(`[${charsets[option]}]`).test(newPassword)) {
        let randomChar = charsets[option].charAt(Math.floor(Math.random() * charsets[option].length));
        let randomPosition = Math.floor(Math.random() * newPassword.length);
        newPassword = newPassword.substring(0, randomPosition) + randomChar + newPassword.substring(randomPosition + 1);
      }
    }
    
    return newPassword;
  }, []);
  
  // Función para generar una contraseña aleatoria basada en opciones
  const generatePassword = useCallback(async () => {
    try {
      const {
        length,
        useLowercase,
        useUppercase,
        useNumbers,
        useSymbols,
        useBrackets,
        useHighAnsi,
        useWords,
        wordCount,
        language
      } = passwordOptions;
      
      let charset = '';
      if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (useNumbers) charset += '0123456789';
      if (useSymbols) charset += '!@#$%^&*';
      if (useBrackets) charset += '[]{}()';
      if (useHighAnsi) charset += '±¥µç';
      
      // Verifica si hay caracteres disponibles (si no estamos en modo palabras)
      if (charset === '' && !useWords) {
        setPassword('SIN CONTRASEÑA GENERADA');
        setPasswordStrength({ entropy: 0, strength: '', crackTime: '' });
        return;
      }
      
      let generatedPassword = '';
      
      if (useWords) {
        try {
          // Obtener palabras aleatorias desde la API
          const response = await axios.get(`${API_URL}/random-words`, {
            params: { 
              count: wordCount,
              lang: language
            }
          });
          
          const words = response.data;
          
          if (!words || words.length === 0) {
            throw new Error('No se obtuvieron palabras de la API');
          }
          
          generatedPassword = words.join('-=-');
          
          // Si la contraseña es muy corta, podemos añadir caracteres adicionales
          if (generatedPassword.length < length && charset) {
            const additionalChars = length - generatedPassword.length;
            generatedPassword += generateProportionalChars(charset, additionalChars);
          }
        } catch (error) {
          console.error('Error al obtener palabras aleatorias:', error);
          setPassword('Error al generar la contraseña');
          setPasswordStrength({ entropy: 0, strength: '', crackTime: '' });
          return;
        }
      } else {
        // Generar contraseña basada en caracteres
        generatedPassword = generateProportionalChars(charset, length);
      }
      
      // Asegurar que todos los tipos de caracteres estén incluidos
      const options = {
        useLowercase,
        useUppercase,
        useNumbers,
        useSymbols,
        useBrackets,
        useHighAnsi
      };
      
      generatedPassword = ensureSelectedOptionsIncluded(generatedPassword, options);
      
      // Establecer la contraseña generada
      setPassword(generatedPassword);
      
      // Calcular la entropía y fortaleza
      try {
        const response = await axios.post(`${API_URL}/password-strength`, {
          password: generatedPassword,
          options,
          isWordBased: useWords
        });
        
        setPasswordStrength({
          entropy: response.data.entropy,
          strength: response.data.strength,
          crackTime: response.data.crackTime
        });
      } catch (error) {
        console.error('Error al calcular la fuerza de la contraseña:', error);
      }
    } catch (error) {
      console.error('Error general al generar contraseña:', error);
      setPassword('Error al generar la contraseña');
      setPasswordStrength({ entropy: 0, strength: '', crackTime: '' });
    }
  }, [passwordOptions, generateProportionalChars, ensureSelectedOptionsIncluded]);
  
  // Copiar contraseña al portapapeles
  const copyPasswordToClipboard = useCallback(() => {
    if (password && password !== 'SIN CONTRASEÑA GENERADA' && password !== 'Error al generar la contraseña') {
      navigator.clipboard.writeText(password).then(() => {
        setNotification({
          show: true,
          message: '¡Contraseña copiada al portapapeles!'
        });
        
        // Ocultar la notificación después de 2 segundos
        setTimeout(() => {
          setNotification({
            show: false,
            message: ''
          });
        }, 2000);
      });
    }
  }, [password]);
  
  // Manejar el movimiento del mouse para generar entropía
  const handleMouseMove = useCallback((e) => {
    // Incrementar la entropía basada en el movimiento del mouse
    setEntropy(prev => prev + Math.abs(e.movementX) + Math.abs(e.movementY));
    
    const now = Date.now();
    if (entropy >= REQUIRED_ENTROPY && now - lastGenerationTime > GENERATION_INTERVAL) {
      generatePassword();
      setLastGenerationTime(now);
      setEntropy(0);
    }
  }, [entropy, generatePassword, lastGenerationTime]);
  
  // Actualizar configuraciones de la contraseña
  const updatePasswordOptions = useCallback((newOptions) => {
    setPasswordOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  // Generar contraseña cuando cambian las opciones
  useEffect(() => {
    generatePassword();
  }, [passwordOptions, generatePassword]);
  
  return {
    password,
    passwordOptions,
    passwordStrength,
    notification,
    generatePassword,
    copyPasswordToClipboard,
    handleMouseMove,
    updatePasswordOptions
  };
};

export default usePasswordGenerator; 