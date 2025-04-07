import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Paper,
  Box,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Tooltip,
  Divider,
  IconButton,
  useTheme,
  Chip,
  Slider
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  Mouse as MouseIcon,
  Share as ShareIcon,
  Check as CheckIcon,
  Security as SecurityIcon,
  Timer as TimerIcon,
  SettingsSuggest as SettingsSuggestIcon,
  MoveDown as MoveDownIcon,
  Cached as CachedIcon
} from '@mui/icons-material';
import usePasswordGenerator from '../hooks/usePasswordGenerator';
import PasswordShareModal from './PasswordShareModal';

const PasswordGenerator = () => {
  const theme = useTheme();
  const {
    password,
    passwordOptions,
    passwordStrength,
    notification,
    generatePassword,
    copyPasswordToClipboard,
    handleMouseMove,
    updatePasswordOptions
  } = usePasswordGenerator();

  const [showWordOptions, setShowWordOptions] = useState(passwordOptions.useWords);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Función para manejar los cambios en los switches
  const handleSwitchChange = (option) => (event) => {
    let updates;
    
    if (option === 'useWords') {
      setShowWordOptions(event.target.checked);
      
      // Si activamos las palabras, desactivamos los caracteres
      if (event.target.checked) {
        updates = {
          useWords: true,
          useLowercase: false,
          useUppercase: false,
          useNumbers: false,
          useSymbols: false,
          useBrackets: false,
          useHighAnsi: false
        };
      } else {
        // Si desactivamos las palabras, activamos al menos lowercase
        updates = {
          useWords: false,
          useLowercase: true
        };
      }
    } else {
      // Si activamos cualquier otro switch, desactivamos las palabras
      if (event.target.checked && passwordOptions.useWords) {
        setShowWordOptions(false);
        updates = {
          [option]: event.target.checked,
          useWords: false
        };
      } else {
        updates = { [option]: event.target.checked };
      }
    }
    
    updatePasswordOptions(updates);
  };
  
  // Función para manejar los cambios numéricos
  const handleNumberChange = (option) => (event) => {
    const value = parseInt(event.target.value) || 0;
    
    if (option === 'length' && value < 14) {
      updatePasswordOptions({ [option]: 14 });
    } else if (option === 'wordCount' && (value < 1 || value > 10)) {
      updatePasswordOptions({ [option]: Math.min(Math.max(value, 1), 10) });
    } else {
      updatePasswordOptions({ [option]: value });
    }
  };
  
  // Manejador para el selector de idioma
  const handleLanguageChange = (event) => {
    updatePasswordOptions({ language: event.target.value });
  };
  
  // Clases para la fuerza de la contraseña
  const getStrengthClass = () => {
    const strength = passwordStrength.strength?.toLowerCase() || '';
    
    if (strength.includes('muy débil')) return 'strength-very-weak';
    if (strength.includes('débil')) return 'strength-weak';
    if (strength.includes('razonable')) return 'strength-reasonable';
    if (strength.includes('fuerte') && !strength.includes('muy')) return 'strength-strong';
    if (strength.includes('muy fuerte')) return 'strength-very-strong';
    
    return '';
  };

  // Obtener color según la fuerza de la contraseña
  const getStrengthColor = () => {
    const strength = passwordStrength.strength?.toLowerCase() || '';
    
    if (strength.includes('muy débil')) return 'error';
    if (strength.includes('débil')) return 'warning';
    if (strength.includes('razonable')) return 'info';
    if (strength.includes('fuerte') && !strength.includes('muy')) return 'success';
    if (strength.includes('muy fuerte')) return 'success';
    
    return 'primary';
  };
  
  // Función segura para obtener el color
  const getColorFromPalette = (colorName) => {
    // Si el color especificado existe en la paleta y tiene propiedad main, usarlo
    if (theme.palette[colorName]?.main) {
      return theme.palette[colorName].main;
    }
    // De lo contrario, usar un color de fallback seguro
    return theme.palette.primary.main;
  };
  
  // Manejar copiar con animación
  const handleCopy = () => {
    copyPasswordToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  // Abrir modal para compartir
  const handleOpenShareModal = () => {
    if (password && password !== 'SIN CONTRASEÑA GENERADA' && password !== 'Error al generar la contraseña') {
      setShareModalOpen(true);
    }
  };
  
  // Cerrar modal para compartir
  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };
  
  // Calcula si los switches de caracteres deben estar deshabilitados
  const areCharacterOptionsDisabled = passwordOptions.useWords;
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        align="center" 
        gutterBottom 
        color="primary" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' 
        }}
      >
        <LockIcon sx={{ fontSize: 36, mr: 1.5, color: theme.palette.primary.main }} />
        Generador de contraseñas seguras
      </Typography>
      
      {/* Panel de opciones */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ 
          backgroundColor: theme.palette.primary.main, 
          p: 1.5, 
          pl: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <SettingsSuggestIcon sx={{ color: 'white', mr: 1.5 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'medium' }}>
            Configuración de la contraseña
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <FormControl fullWidth variant="outlined" size="small">
                <Slider
                  value={passwordOptions.length}
                  onChange={handleNumberChange('length')}
                  aria-labelledby="password-length-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  min={4}
                  max={100}
                  sx={{ 
                    mx: 1,
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16
                    },
                    '& .MuiSlider-rail': {
                      height: 4
                    },
                    '& .MuiSlider-track': {
                      height: 4
                    }
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={8} md={9}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Tipo de caracteres
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { option: 'useLowercase', label: 'Minúsculas (a-z)' },
                  { option: 'useUppercase', label: 'Mayúsculas (A-Z)' },
                  { option: 'useNumbers', label: 'Números (0-9)' },
                  { option: 'useSymbols', label: 'Símbolos (!@#$)' }
                ].map(item => (
                  <Chip 
                    key={item.option}
                    label={item.label}
                    clickable
                    color={passwordOptions[item.option] ? 'primary' : 'default'}
                    variant={passwordOptions[item.option] ? 'filled' : 'outlined'}
                    onClick={() => updatePasswordOptions({ 
                      [item.option]: !passwordOptions[item.option],
                      ...(passwordOptions.useWords ? { useWords: false } : {})
                    })}
                    disabled={areCharacterOptionsDisabled}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Opciones adicionales */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Opciones adicionales
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label="Paréntesis ([]{})"
                  clickable
                  color={passwordOptions.useBrackets ? 'primary' : 'default'}
                  variant={passwordOptions.useBrackets ? 'filled' : 'outlined'}
                  onClick={() => updatePasswordOptions({ 
                    useBrackets: !passwordOptions.useBrackets,
                    ...(passwordOptions.useWords ? { useWords: false } : {})
                  })}
                  disabled={areCharacterOptionsDisabled}
                />
                <Chip 
                  label="Caracteres especiales (±¥µç)"
                  clickable
                  color={passwordOptions.useHighAnsi ? 'primary' : 'default'}
                  variant={passwordOptions.useHighAnsi ? 'filled' : 'outlined'}
                  onClick={() => updatePasswordOptions({ 
                    useHighAnsi: !passwordOptions.useHighAnsi,
                    ...(passwordOptions.useWords ? { useWords: false } : {})
                  })}
                  disabled={areCharacterOptionsDisabled}
                />
                <Chip 
                  label="Contraseña basada en palabras"
                  clickable
                  color={passwordOptions.useWords ? 'secondary' : 'default'}
                  variant={passwordOptions.useWords ? 'filled' : 'outlined'}
                  onClick={() => handleSwitchChange('useWords')({ target: { checked: !passwordOptions.useWords } })}
                />
              </Box>
            </Grid>
            
            {/* Opciones para el modo de palabras */}
            {showWordOptions && (
              <Grid item xs={12} container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <TextField
                      id="word-count"
                      label="Número de palabras"
                      type="number"
                      value={passwordOptions.wordCount}
                      onChange={handleNumberChange('wordCount')}
                      InputProps={{ inputProps: { min: 1, max: 10 } }}
                      helperText="Entre 1 y 10 palabras"
                      size="small"
                    />
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="language-select-label">Idioma</InputLabel>
                    <Select
                      labelId="language-select-label"
                      id="language-select"
                      value={passwordOptions.language}
                      onChange={handleLanguageChange}
                      label="Idioma"
                    >
                      <MenuItem value="es">🇪🇸 Español</MenuItem>
                      <MenuItem value="en">🇬🇧 Inglés</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      
      {/* Panel de generación */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3, 
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <MouseIcon sx={{ color: theme.palette.secondary.main, fontSize: 40, mb: 1 }} />
            <Typography variant="h6" align="center" color="secondary">
              Mueve el ratón para generar aleatoriedad
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 0.5, maxWidth: '80%' }}>
              El movimiento del ratón proporciona entropía adicional para crear contraseñas más seguras
            </Typography>
          </Box>
          
          <Box 
            className="password-generator-area"
            onMouseMove={handleMouseMove}
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(25, 118, 210, 0.03)',
              border: `2px dashed ${theme.palette.primary.main}`,
              borderRadius: 2,
              p: 4,
              mb: 3,
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(25, 118, 210, 0.05)',
                boxShadow: 'inset 0 0 10px rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '80px'
              }}
            >
              <MoveDownIcon 
                sx={{ 
                  color: theme.palette.primary.main, 
                  opacity: 0.6, 
                  fontSize: 40, 
                  animation: 'floatUpDown 2s infinite ease-in-out'
                }} 
              />
              <style>
                {`
                  @keyframes floatUpDown {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                  }
                `}
              </style>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3, position: 'relative' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ ml: 1 }}>
              Contraseña generada:
            </Typography>
            <Paper 
              elevation={2} 
              sx={{
                p: 2.5,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                fontFamily: 'monospace',
                fontSize: '1.4rem',
                textAlign: 'center',
                fontWeight: 'medium',
                color: theme.palette.text.primary,
                wordBreak: 'break-all'
              }}
            >
              {password || 'Mueve el ratón para generar una contraseña'}
              
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                display: 'flex' 
              }}>
                <Tooltip title={copied ? "¡Copiado!" : "Copiar al portapapeles"}>
                  <IconButton
                    onClick={handleCopy}
                    sx={{ 
                      bgcolor: copied ? 'success.main' : 'action.hover',
                      color: copied ? 'white' : theme.palette.text.primary,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: copied ? 'success.dark' : 'action.selected',
                      }
                    }}
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Box>
          
          {/* Información de la contraseña */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ ml: 1 }}>
              Fortaleza de la contraseña:
            </Typography>
            <Paper
              elevation={1}
              sx={{ 
                p: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    p: 1 
                  }}>
                    <SecurityIcon 
                      sx={{ 
                        color: getColorFromPalette(getStrengthColor()), 
                        fontSize: 40, 
                        mb: 1 
                      }}
                    />
                    <Typography variant="h6" align="center" gutterBottom>
                      {passwordStrength.strength || "Sin calcular"}
                    </Typography>
                    <Chip 
                      label={`${passwordStrength.entropy || "0"} bits`}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: getColorFromPalette(getStrengthColor()) }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <TimerIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Tiempo para crackear: <strong>{passwordStrength.crackTime || "Sin calcular"}</strong>
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {passwordStrength.entropy > 60 ? 
                        "Esta contraseña tiene buena entropía y será difícil de adivinar." : 
                        "Considera usar una contraseña más larga o con más tipos de caracteres."}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          
          {/* Acciones */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={generatePassword}
              startIcon={<CachedIcon />}
              size="medium"
              sx={{ 
                mr: 1, 
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 'medium',
                py: 0.75
              }}
            >
              Generar
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={handleCopy}
              startIcon={<CopyIcon />}
              size="medium"
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '0.9rem',
                py: 0.75
              }}
            >
              Copiar
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ShareIcon />}
              onClick={handleOpenShareModal}
              disabled={!password || password === 'SIN CONTRASEÑA GENERADA' || password === 'Error al generar la contraseña'}
              size="large"
              sx={{ 
                px: 3,
                boxShadow: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              Compartir
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Modal para compartir */}
      <PasswordShareModal 
        open={shareModalOpen} 
        onClose={handleCloseShareModal} 
        password={password}
      />
      
      {/* Notificación */}
      <Snackbar
        open={notification.show}
        autoHideDuration={2000} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PasswordGenerator; 