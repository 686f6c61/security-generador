import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  TextField,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  LockOpen as LockOpenIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const AccessSharedPassword = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener la clave del fragmento de URL (después del #)
  const encryptionKey = location.hash.substring(1) || '';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  
  useEffect(() => {
    // Función para obtener y descifrar la contraseña
    const fetchAndDecryptPassword = async () => {
      if (!id) {
        setError('Enlace inválido');
        setLoading(false);
        return;
      }
      
      if (!encryptionKey) {
        setError('Clave de descifrado no encontrada');
        setLoading(false);
        return;
      }
      
      try {
        // Obtener datos cifrados
        const response = await axios.get(`${API_URL}/share/${id}`);
        setPasswordData(response.data);
        
        // Descifrar los datos
        try {
          const decrypted = await decryptData(response.data.encryptedData, encryptionKey);
          setDecryptedData(decrypted);
          
          // Calcular tiempo restante
          if (response.data.expiresAt) {
            const timeRemaining = Math.max(0, response.data.expiresAt - Date.now());
            setRemainingTime(formatRemainingTime(timeRemaining));
          }
        } catch (decryptError) {
          console.error('Error al descifrar:', decryptError);
          setError('No se pudo descifrar la contraseña. La clave puede ser incorrecta.');
        }
      } catch (error) {
        console.error('Error al obtener la contraseña compartida:', error);
        if (error.response && error.response.status === 404) {
          setError('Enlace no encontrado o expirado');
        } else if (error.response && error.response.status === 410) {
          setError(error.response.data.error || 'Este enlace ya ha sido utilizado o ha expirado');
        } else {
          setError('Error al acceder a la contraseña compartida');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndDecryptPassword();
  }, [id, encryptionKey]);
  
  // Actualizar el tiempo restante cada segundo
  useEffect(() => {
    if (!passwordData || !passwordData.expiresAt) return;
    
    const timer = setInterval(() => {
      const timeRemaining = Math.max(0, passwordData.expiresAt - Date.now());
      setRemainingTime(formatRemainingTime(timeRemaining));
      
      if (timeRemaining <= 0) {
        clearInterval(timer);
        // Opcionalmente, recargar para mostrar que ha expirado
        setError('Este enlace ha expirado');
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [passwordData]);
  
  // Función para descifrar datos
  const decryptData = async (encryptedData, key) => {
    try {
      // Convertir datos de hexadecimal a ArrayBuffer
      const iv = hexToArrayBuffer(encryptedData.iv);
      const encryptedContent = hexToArrayBuffer(encryptedData.encrypted);
      const authTag = hexToArrayBuffer(encryptedData.authTag);
      
      // Combinar el contenido cifrado y el authTag para AES-GCM
      const encryptedBuffer = concatenateArrayBuffers(encryptedContent, authTag);
      
      // Derivar clave de cifrado a partir de la clave hexadecimal
      const cryptoKey = await generateKeyFromHex(key);
      
      // Descifrar usando la API Web Crypto
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        encryptedBuffer
      );
      
      // Convertir resultado a texto y parsearlo como JSON
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedBuffer);
      
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error('Error de descifrado:', error);
      throw new Error('Error al descifrar datos');
    }
  };
  
  // Función para convertir hexadecimal a ArrayBuffer
  const hexToArrayBuffer = (hexString) => {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes.buffer;
  };
  
  // Función para concatenar ArrayBuffers
  const concatenateArrayBuffers = (buffer1, buffer2) => {
    const array1 = new Uint8Array(buffer1);
    const array2 = new Uint8Array(buffer2);
    const result = new Uint8Array(array1.length + array2.length);
    result.set(array1);
    result.set(array2, array1.length);
    return result.buffer;
  };
  
  // Función para generar la clave criptográfica a partir de la clave hexadecimal
  const generateKeyFromHex = async (hexKey) => {
    // Convertir clave de hexadecimal a ArrayBuffer
    const keyData = hexToArrayBuffer(hexKey);
    
    // Importar clave para su uso con AES-GCM
    return await window.crypto.subtle.importKey(
      'raw', 
      keyData, 
      { name: 'AES-GCM', length: 256 }, 
      false, 
      ['decrypt']
    );
  };
  
  // Formatear tiempo restante
  const formatRemainingTime = (milliseconds) => {
    if (milliseconds <= 0) return 'Expirado';
    
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // Copiar la contraseña al portapapeles
  const copyToClipboard = async () => {
    if (decryptedData && decryptedData.password) {
      try {
        await navigator.clipboard.writeText(decryptedData.password);
        setCopied(true);
        
        // Consumir un uso del enlace
        if (id) {
          try {
            await axios.post(`${API_URL}/share/${id}/consume`);
            // Actualizar el contador de usos restantes mostrado
            if (passwordData) {
              setPasswordData(prev => ({
                ...prev, 
                remainingUses: prev.remainingUses > 0 ? prev.remainingUses - 1 : 0
              }));
            }
          } catch (error) {
            console.error('Error al consumir el enlace:', error);
            // No mostrar error al usuario para no interrumpir su experiencia
          }
        }
        
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error al copiar:', error);
        setError('No se pudo copiar la contraseña');
      }
    }
  };
  
  // Volver a la página principal
  const handleGoToGenerator = () => {
    navigate('/');
  };
  
  // Mostrar u ocultar la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Renderizar diferentes estados de la UI
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="h6">Accediendo a la contraseña compartida...</Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <WarningIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error">
              Error al acceder
            </Typography>
            <Typography variant="body1" paragraph>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoToGenerator}
              sx={{ mt: 2 }}
            >
              Ir al Generador
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LockOpenIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" color="primary">
              Contraseña Compartida
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Esta contraseña fue compartida de forma segura. Podrás acceder a ella {passwordData?.remainingUses || 0} {passwordData?.remainingUses === 1 ? 'vez más' : 'veces más'}.
          </Alert>
          
          <Typography variant="subtitle1" gutterBottom>
            Contraseña:
          </Typography>
          
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                fontFamily: 'monospace',
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {showPassword ? decryptedData?.password : '•'.repeat(decryptedData?.password?.length || 12)}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                <IconButton onClick={togglePasswordVisibility} color="primary">
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={copied ? "¡Copiado!" : "Copiar contraseña"}>
                <IconButton onClick={copyToClipboard} color={copied ? "success" : "primary"}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
          
          {decryptedData?.note && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <NotesIcon fontSize="small" sx={{ mr: 1 }} />
                Nota:
              </Typography>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 243, 224, 0.5)',
                  borderLeft: `4px solid ${theme.palette.warning.main}`,
                }}
              >
                <Typography variant="body1">
                  {decryptedData.note}
                </Typography>
              </Paper>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Expira en: {remainingTime}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoToGenerator}
            >
              Ir al Generador
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AccessSharedPassword; 