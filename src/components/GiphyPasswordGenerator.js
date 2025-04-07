import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  Fade,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsSuggestIcon,
  Search as SearchIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import axios from 'axios';
import { generatePassword, evaluatePasswordStrength } from '../utils/passwordGenerator';
import PasswordShareModal from './PasswordShareModal';

// API key de Giphy desde variables de entorno
const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY;
const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search';

const GiphyPasswordGenerator = ({ onPasswordGenerated }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('random');
  const [gifs, setGifs] = useState([]);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [entropyData, setEntropyData] = useState([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', severity: 'success' });
  const mouseMovements = useRef([]);
  const gifRef = useRef(null);
  const [favoriteGif, setFavoriteGif] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [numGifsToShow, setNumGifsToShow] = useState(5); // Valor predeterminado: 5 GIFs
  
  // Opciones de la contraseña
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    useLowercase: true,
    useUppercase: true,
    useNumbers: true,
    useSymbols: true,
    useBrackets: false,
    useHighAnsi: false
  });

  // Información de la fortaleza de la contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    entropy: 0,
    strength: 'Sin calcular',
    crackTime: 'N/A'
  });

  // Estadísticas de entropía recopilada
  const [entropyStats, setEntropyStats] = useState({
    mouseMovements: 0,
    patternComplexity: 0,
    gifEntropy: 0,
    preferenceEntropy: 0,
    totalEntropy: 0
  });

  // Cargar GIFs solo cuando se haga clic en buscar, no con cada cambio de searchTerm
  useEffect(() => {
    // Solo cargar GIFs al inicio, no con cada cambio de searchTerm
    if (gifs.length === 0) {
      fetchGifs();
    }
  }, []);

  // Evaluar la fortaleza de la contraseña cuando cambie
  useEffect(() => {
    if (generatedPassword) {
      const strength = evaluatePasswordStrength(generatedPassword);
      setPasswordStrength(strength);
    }
  }, [generatedPassword]);

  // Abrir modal para compartir
  const handleOpenShareModal = () => {
    if (generatedPassword) {
      setShareModalOpen(true);
    } else {
      setNotification({
        show: true,
        message: 'Primero debes generar una contraseña',
        severity: 'warning'
      });
    }
  };

  // Cerrar modal para compartir
  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };

  // Manejar cambio en número de GIFs a mostrar
  const handleNumGifsChange = (event, newValue) => {
    setNumGifsToShow(newValue);
    // Si estamos en un índice mayor que el nuevo máximo, reiniciar
    if (currentGifIndex > 0 && currentGifIndex >= newValue) {
      setCurrentGifIndex(0);
      setEntropyData([]);
      mouseMovements.current = [];
    }
  };

  // Función para buscar GIFs en la API de Giphy
  const fetchGifs = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      // Solicitamos algunos GIFs adicionales por si acaso
      const limit = Math.min(numGifsToShow + 5, 25);
      
      const response = await axios.get(GIPHY_API_URL, {
        params: {
          api_key: GIPHY_API_KEY,
          q: searchTerm,
          limit: limit,
          rating: 'g',
          random_id: Date.now() // Añadido para obtener resultados más variados
        }
      });
      
      if (response.data.data.length > 0) {
        setGifs(response.data.data);
        setCurrentGifIndex(0);
        setEntropyData([]);
        mouseMovements.current = [];
      } else {
        setNotification({
          show: true,
          message: 'No se encontraron GIFs con ese término. Prueba con otro.',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error al obtener GIFs:', error);
      setNotification({
        show: true,
        message: 'Error al cargar GIFs. Inténtalo de nuevo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en las opciones de contraseña
  const handlePasswordOptionChange = (option, value) => {
    setPasswordOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Manejar el movimiento del ratón sobre el GIF
  const handleMouseMove = (e) => {
    if (!gifRef.current || currentGifIndex >= numGifsToShow) return;
    
    const rect = gifRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 100);
    
    // Guardamos posición relativa del ratón (0-100)
    mouseMovements.current.push({ x, y, timestamp: Date.now() });
  };

  // Manejar la reacción al GIF actual (me gusta/no me gusta)
  const handleReaction = (liked) => {
    if (currentGifIndex >= numGifsToShow) return;
    
    const gifData = gifs[currentGifIndex];
    const averagePosition = calculateAveragePosition();
    
    // Si al usuario le gustó este GIF, guardarlo como posible favorito para mostrar al final
    if (liked && (!favoriteGif || Math.random() > 0.5)) {
      setFavoriteGif(gifData);
    }
    
    // Añadir datos de entropía basados en las reacciones y movimientos
    setEntropyData(prev => [
      ...prev, 
      {
        id: gifData.id,
        liked,
        mousePattern: averagePosition,
        timestamp: Date.now()
      }
    ]);
    
    // Incrementar el índice del GIF o generar la contraseña si es el último
    if (currentGifIndex < numGifsToShow - 1) {
      setCurrentGifIndex(prev => prev + 1);
      mouseMovements.current = []; // Reiniciar movimientos para el siguiente GIF
    } else {
      generatePasswordFromEntropy();
    }
  };

  // Calcular la posición promedio del ratón
  const calculateAveragePosition = () => {
    if (mouseMovements.current.length === 0) return { x: 50, y: 50 };
    
    const sum = mouseMovements.current.reduce(
      (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
      { x: 0, y: 0 }
    );
    
    return {
      x: Math.floor(sum.x / mouseMovements.current.length),
      y: Math.floor(sum.y / mouseMovements.current.length)
    };
  };

  // Calcular las estadísticas de entropía
  const calculateEntropyStats = (entropyString, entropyHash) => {
    // Cada clic/decisión aporta aproximadamente 1 bit de entropía (decisión binaria)
    const preferenceEntropy = entropyData.length;
    
    // Cada GIF tiene un ID único, aporta aprox. 8-12 bits por GIF
    const gifEntropy = entropyData.length * 10;
    
    // Los patrones de movimiento del ratón aportan entropía adicional
    // Estimación aproximada basada en la cantidad y variedad de movimientos
    const totalMouseMovements = entropyData.reduce((total, data) => {
      const movementsPerGif = data.mousePattern.x !== 50 || data.mousePattern.y !== 50 ? 20 : 0;
      return total + movementsPerGif;
    }, 0);
    
    // Complejidad del patrón (varianza en las posiciones)
    const positions = entropyData.map(data => data.mousePattern);
    const uniquePositions = new Set(positions.map(pos => `${pos.x},${pos.y}`)).size;
    const patternComplexity = uniquePositions * 4;
    
    // Entropía total estimada (simplificada)
    const totalEntropy = preferenceEntropy + gifEntropy + totalMouseMovements + patternComplexity;
    
    setEntropyStats({
      mouseMovements: totalMouseMovements,
      patternComplexity,
      gifEntropy,
      preferenceEntropy,
      totalEntropy
    });
    
    return totalEntropy;
  };

  // Generar la contraseña basada en datos de entropía recopilados
  const generatePasswordFromEntropy = () => {
    // Combinar datos de entropía para crear semilla para el generador
    const entropyString = entropyData.map(data => 
      `${data.id}|${data.liked ? 1 : 0}|${data.mousePattern.x},${data.mousePattern.y}|${data.timestamp}`
    ).join('&');
    
    // Crear un hash básico de la cadena de entropía
    let entropyHash = 0;
    for (let i = 0; i < entropyString.length; i++) {
      entropyHash = ((entropyHash << 5) - entropyHash) + entropyString.charCodeAt(i);
      entropyHash |= 0; // Convertir a entero de 32 bits
    }
    
    // Calcular estadísticas de entropía
    calculateEntropyStats(entropyString, entropyHash);
    
    // Usar el hash como semilla para el generador de contraseñas
    // junto con las opciones personalizadas del usuario
    const options = {
      ...passwordOptions,
      // Si no se especifica longitud, usar entre 16-24 caracteres
      length: passwordOptions.length || (16 + Math.abs(entropyHash % 8))
    };
    
    // Generar la contraseña
    const password = generatePassword(options, entropyString);
    setGeneratedPassword(password);
    setCustomPassword(password);
    setShowResult(true);
  };

  // Manejar la edición manual de la contraseña
  const handlePasswordEdit = () => {
    setEditingPassword(true);
  };

  // Guardar la contraseña editada manualmente
  const handleSavePassword = () => {
    setGeneratedPassword(customPassword);
    setEditingPassword(false);
  };

  // Copiar la contraseña al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopying(true);
      setTimeout(() => {
        setCopying(false);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }, 500);
      
      // Notificar al componente padre sobre la contraseña generada
      if (onPasswordGenerated) {
        onPasswordGenerated(generatedPassword);
      }
      
      setNotification({
        show: true,
        message: '¡Contraseña copiada al portapapeles!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al copiar:', error);
      setNotification({
        show: true,
        message: 'No se pudo copiar la contraseña',
        severity: 'error'
      });
    }
  };

  // Comenzar una nueva sesión de generación
  const handleReset = () => {
    setShowResult(false);
    setCurrentGifIndex(0);
    setEntropyData([]);
    mouseMovements.current = [];
    fetchGifs();
  };

  // Cerrar notificaciones
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Obtener el nombre de una fortaleza con color correspondiente
  const getStrengthColor = (strength) => {
    if (!strength) return 'primary';
    
    const strengthLower = strength.toLowerCase();
    if (strengthLower.includes('muy débil')) return 'error';
    if (strengthLower.includes('débil')) return 'error';
    if (strengthLower.includes('razonable')) return 'warning';
    if (strengthLower.includes('fuerte') && !strengthLower.includes('muy')) return 'success';
    if (strengthLower.includes('muy fuerte')) return 'success';
    
    return 'primary';
  };

  // Manejar cambio en el campo de búsqueda sin búsqueda automática
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejar la tecla Enter en el campo de búsqueda
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchGifs();
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2, maxWidth: '900px', mx: 'auto' }}>
      {!showResult ? (
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.primary.main, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography variant="h6">
                Generador con GIFs ({currentGifIndex + 1}/{numGifsToShow})
              </Typography>
            </Box>
            
            {/* Explicación siempre visible */}
            <Box 
              sx={{ 
                px: 3, 
                py: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                <InfoIcon fontSize="small" color="info" sx={{ mt: 0.3 }} />
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  Este generador crea contraseñas únicas combinando:
                </Typography>
              </Box>
              
              <Grid container spacing={1} sx={{ ml: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', display: 'inline-block' }} />
                    <strong>Hash único de GIFs</strong> - Entropía externa
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', display: 'inline-block' }} />
                    <strong>Movimientos del ratón</strong> - Patrones únicos
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', display: 'inline-block' }} />
                    <strong>Tus preferencias</strong> - Me gusta/No me gusta
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', display: 'inline-block' }} />
                    <strong>Marcas de tiempo</strong> - Momentos precisos
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ px: 3, pb: 3, pt: 2 }}>
              {/* Opciones de la contraseña - Simplificadas */}
              <Accordion 
                defaultExpanded
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsSuggestIcon fontSize="small" color="primary" />
                    <Typography variant="body1">Configuración de la contraseña</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Número de GIFs a mostrar */}
                  <Box sx={{ mb: 2 }}>
                    <Typography id="gifs-number-slider" gutterBottom fontSize="0.9rem">
                      Número de GIFs: {numGifsToShow}
                    </Typography>
                    <Slider
                      aria-labelledby="gifs-number-slider"
                      value={numGifsToShow}
                      onChange={handleNumGifsChange}
                      min={3}
                      max={15}
                      step={1}
                      marks={[
                        { value: 3, label: '3' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' },
                        { value: 15, label: '15' }
                      ]}
                      size="small"
                      sx={{ maxWidth: '500px' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Más GIFs = mayor entropía pero más tiempo
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                
                  <Box sx={{ mt: 1 }}>
                    <Typography id="password-length-slider" gutterBottom fontSize="0.9rem">
                      Longitud: {passwordOptions.length} caracteres
                    </Typography>
                    <Slider
                      aria-labelledby="password-length-slider"
                      value={passwordOptions.length}
                      onChange={(e, newValue) => handlePasswordOptionChange('length', newValue)}
                      min={8}
                      max={64}
                      step={1}
                      marks={[
                        { value: 8, label: '8' },
                        { value: 16, label: '16' },
                        { value: 32, label: '32' },
                        { value: 64, label: '64' }
                      ]}
                      size="small"
                      sx={{ maxWidth: '500px' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Tipos de caracteres:
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6} sm={4}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={passwordOptions.useLowercase} 
                              onChange={(e) => handlePasswordOptionChange('useLowercase', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Minúsculas (a-z)</Typography>}
                        />
                      </FormGroup>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={passwordOptions.useUppercase} 
                              onChange={(e) => handlePasswordOptionChange('useUppercase', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Mayúsculas (A-Z)</Typography>}
                        />
                      </FormGroup>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={passwordOptions.useNumbers} 
                              onChange={(e) => handlePasswordOptionChange('useNumbers', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Números (0-9)</Typography>}
                        />
                      </FormGroup>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={passwordOptions.useSymbols} 
                              onChange={(e) => handlePasswordOptionChange('useSymbols', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Símbolos (!@#$%)</Typography>}
                        />
                      </FormGroup>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={passwordOptions.useBrackets} 
                              onChange={(e) => handlePasswordOptionChange('useBrackets', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Paréntesis ([]{})</Typography>}
                        />
                      </FormGroup>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={passwordOptions.useHighAnsi} 
                              onChange={(e) => handlePasswordOptionChange('useHighAnsi', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Caracteres (ñÑáéí)</Typography>}
                        />
                      </FormGroup>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              {/* Selección de GIFs - Versión mejorada con búsqueda solo al hacer clic */}
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={7}>
                  <TextField
                    fullWidth
                    label="Tema para los GIFs"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    onKeyDown={handleSearchKeyDown}
                    disabled={loading}
                    placeholder="Escribe un tema y pulsa buscar"
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={fetchGifs}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                    size="medium"
                  >
                    {loading ? 'Cargando...' : 'Buscar GIFs'}
                  </Button>
                </Grid>
              </Grid>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Observa cada GIF y decide si te gusta o no. Tus movimientos y preferencias crearán una contraseña única.
              </Typography>
              
              {/* Visualización de GIF actual */}
              {gifs.length > 0 && (
                <Box 
                  sx={{ 
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 3px 5px'
                  }}
                >
                  <Paper
                    elevation={0}
                    ref={gifRef}
                    sx={{ 
                      width: '100%', 
                      height: 300,
                      backgroundImage: `url(${gifs[currentGifIndex]?.images?.original?.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onMouseMove={handleMouseMove}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                        color: 'white',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body2">
                        {gifs[currentGifIndex]?.title || 'GIF sin título'}
                      </Typography>
                    </Box>
                  </Paper>
                  
                  <Tooltip 
                    title="Mueve el ratón sobre el GIF para generar más entropía" 
                    placement="top"
                    arrow
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        p: 0.5,
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <HelpIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                  
                  {/* Botones de reacción */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 2,
                      gap: { xs: 1, sm: 3 }
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ThumbDownIcon />}
                      onClick={() => handleReaction(false)}
                      sx={{ minWidth: 100, flex: 1, maxWidth: 150 }}
                    >
                      No me gusta
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleReaction(true)}
                      sx={{ minWidth: 100, flex: 1, maxWidth: 150 }}
                    >
                      Me gusta
                    </Button>
                  </Box>
                  
                  {/* Indicador de progreso */}
                  <Box sx={{ mt: 3 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(currentGifIndex / numGifsToShow) * 100} 
                      sx={{ height: 5, borderRadius: 5, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {currentGifIndex} GIFs evaluados
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {numGifsToShow - currentGifIndex} restantes
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Fade in={showResult}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                <Typography variant="h5" gutterBottom fontWeight="medium">
                  ¡Contraseña generada!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Basada en tus interacciones con {numGifsToShow} GIFs sobre "{searchTerm}"
                </Typography>
              </Box>
              
              {/* Contraseña generada */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  position: 'relative',
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {editingPassword ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      variant="outlined"
                      autoFocus
                      sx={{ fontFamily: 'monospace' }}
                    />
                    <IconButton 
                      color="primary" 
                      onClick={handleSavePassword}
                      sx={{ bgcolor: 'action.selected' }}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        flexGrow: 1, 
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {generatedPassword}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar contraseña">
                        <IconButton onClick={handlePasswordEdit} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={copied ? "¡Copiado!" : "Copiar contraseña"}>
                        <IconButton 
                          onClick={copyToClipboard} 
                          color={copied ? "success" : "primary"}
                          size="small"
                        >
                          {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </Paper>
              
              {/* GIF Favorito - "Guiño" */}
              {favoriteGif && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Un GIF que te gustó:
                  </Typography>
                  <Box
                    sx={{
                      height: 150,
                      borderRadius: 2,
                      overflow: 'hidden',
                      maxWidth: 300,
                      margin: '0 auto',
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundImage: `url(${favoriteGif?.images?.fixed_height?.url || favoriteGif?.images?.original?.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>
              )}
              
              {/* Información básica de la contraseña */}
              <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.03)', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Fortaleza:</Typography>
                    <Chip 
                      label={passwordStrength.strength}
                      size="small"
                      color={getStrengthColor(passwordStrength.strength)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Entropía:</Typography>
                    <Typography variant="body2" fontWeight="medium">{passwordStrength.entropy} bits</Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Longitud:</Typography>
                    <Typography variant="body2" fontWeight="medium">{generatedPassword.length} caracteres</Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Tiempo de descifrado:</Typography>
                    <Typography variant="body2" fontWeight="medium">{passwordStrength.crackTime}</Typography>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Detalles de la entropía generada */}
              <Accordion sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon fontSize="small" color="info" />
                    <Typography variant="body2">Detalles de la entropía generada</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fuentes de entropía utilizadas:
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        • <strong>GIFs:</strong> ~{entropyStats.gifEntropy} bits
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        • <strong>Preferencias:</strong> ~{entropyStats.preferenceEntropy} bits
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        • <strong>Movimientos:</strong> ~{entropyStats.mouseMovements} bits
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        • <strong>Patrón:</strong> ~{entropyStats.patternComplexity} bits
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="body2" fontWeight="medium">
                    Total aproximado: ~{entropyStats.totalEntropy} bits
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              {/* Botones de acción */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  size="medium"
                >
                  Generar otra
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ShareIcon />}
                  onClick={handleOpenShareModal}
                  size="medium"
                >
                  Compartir
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (onPasswordGenerated) {
                      onPasswordGenerated(generatedPassword);
                      setNotification({
                        show: true,
                        message: 'Contraseña aplicada correctamente',
                        severity: 'success'
                      });
                    }
                  }}
                  size="medium"
                >
                  Usar esta contraseña
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}
      
      {/* Modal para compartir */}
      <PasswordShareModal
        open={shareModalOpen}
        onClose={handleCloseShareModal}
        password={generatedPassword}
      />
      
      <Snackbar 
        open={notification.show} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GiphyPasswordGenerator; 