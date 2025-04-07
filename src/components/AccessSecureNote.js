import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  CircularProgress, Alert, Paper, Divider, InputAdornment,
  IconButton, Snackbar, useTheme, alpha, Container
} from '@mui/material';
import { 
  Visibility, VisibilityOff, ContentCopy, Lock, 
  LockOpen, Security, Timer, Shield, DeleteOutline
} from '@mui/icons-material';
import axios from 'axios';

// Si está usando axios, corregir la URL de la API
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const AccessSecureNote = () => {
  const theme = useTheme();
  const { id } = useParams();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [remainingViews, setRemainingViews] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', severity: 'info' });
  
  // Extraer clave de descifrado del hash de la URL si existe
  const decryptionKey = location.hash.substring(1);
  
  // Verificar existencia y estado del enlace
  useEffect(() => {
    const checkNoteStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/secure-notes/${id}`);
        setNoteData(response.data);
        setRemainingViews(response.data.remainingViews);
        
        // Si hay clave en la URL y la nota no requiere contraseña adicional, descifrar automáticamente
        if (decryptionKey && !response.data.requiresPassword) {
          await decryptNote(decryptionKey);
        }
      } catch (error) {
        console.error('Error al verificar nota:', error);
        setError(error.response?.data?.error || 'Error al acceder a la nota');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      checkNoteStatus();
    }
  }, [id, decryptionKey]);
  
  // Función para solicitar descifrado de la nota
  const decryptNote = async (key = null) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/secure-notes/${id}/decrypt`, {
        password: password,
        decryptionKey: key || decryptionKey
      });
      
      setDecryptedContent(response.data.content);
      setRemainingViews(response.data.remainingViews);
      
      // Almacenar información del remitente y asunto si está disponible
      if (response.data.senderEmail || response.data.emailSubject) {
        setNoteData(prevData => ({
          ...prevData,
          senderEmail: response.data.senderEmail,
          emailSubject: response.data.emailSubject
        }));
      }
    } catch (error) {
      console.error('Error al descifrar:', error);
      setError(error.response?.data?.error || 'Error al descifrar la nota');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para copiar el contenido
  const copyContent = async () => {
    if (decryptedContent) {
      try {
        await navigator.clipboard.writeText(decryptedContent);
        setNotification({
          show: true,
          message: 'Contenido copiado al portapapeles',
          severity: 'success'
        });
      } catch (err) {
        setNotification({
          show: true,
          message: 'Error al copiar el contenido',
          severity: 'error'
        });
      }
    }
  };
  
  // Añadir un nuevo método para eliminar la nota
  const deleteNote = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/secure-notes/${id}`);
      
      if (response.data.success) {
        setNotification({
          show: true,
          message: 'Nota eliminada correctamente',
          severity: 'success'
        });
        
        // Establecer remainingViews a 0 para mostrar mensaje de eliminación
        setRemainingViews(0);
        setNoteData({...noteData, expireOnView: true});
      }
    } catch (error) {
      console.error('Error al eliminar la nota:', error);
      setNotification({
        show: true,
        message: error.response?.data?.error || 'Error al eliminar la nota',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !noteData) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '70vh' 
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 500, color: 'text.secondary' }}>
          Verificando nota...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box 
          sx={{ 
            textAlign: 'center',
            p: 6,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            bgcolor: alpha(theme.palette.error.light, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          <Typography variant="h4" color="error.main" gutterBottom sx={{ fontWeight: 'bold' }}>
            No se pudo acceder a la nota
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {error}
          </Typography>
          <Shield sx={{ fontSize: 60, color: alpha(theme.palette.error.main, 0.5), mb: 2 }} />
        </Box>
      </Container>
    );
  }
  
  const noteExpireInfo = noteData?.expireOnView 
    ? "Esta nota se eliminará permanentemente después de ser vista" 
    : `Caducidad: ${new Date(noteData?.expiresAt).toLocaleString()}`;
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 4, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{
            p: 2,
            borderRadius: '50%',
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Lock sx={{ fontSize: 40 }} />
        </Box>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Nota segura
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Esta nota ha sido encriptada para proteger su contenido
        </Typography>
      </Box>
      
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        {!decryptedContent ? (
          <>
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                Esta nota está encriptada
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Alert 
                severity="info" 
                variant="outlined"
                icon={<Timer fontSize="inherit" />}
                sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.light, 0.1),
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
              >
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {noteData?.requiresPassword
                      ? 'Esta nota requiere una contraseña para ser visualizada'
                      : 'Haz clic en "Descifrar" para ver el contenido de la nota'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {noteExpireInfo}
                  </Typography>
                </Box>
              </Alert>
              
              {noteData?.requiresPassword && (
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    mb: 4, 
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Introduce la contraseña para acceder
                  </Typography>
                  
                  <TextField
                    label="Contraseña"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="dense"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    size="small"
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        transition: '0.3s',
                        fontSize: '0.95rem',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 1.5
                        }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Paper>
              )}
              
              <Button
                variant="contained"
                color="primary"
                size="medium"
                sx={{ 
                  mt: 2,
                  py: 1,
                  px: 3,
                  maxWidth: '200px',
                  mx: 'auto',
                  borderRadius: 1,
                  fontSize: '0.95rem',
                  fontWeight: 'medium',
                  textTransform: 'none',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  transition: '0.3s',
                  color: '#ffffff',
                  '&:hover': {
                    boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
                onClick={() => decryptNote()}
                disabled={noteData?.requiresPassword && !password}
                startIcon={<LockOpen />}
              >
                Descifrar nota
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: alpha(theme.palette.success.main, 0.1),
                borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.success.dark
                }}
              >
                <LockOpen sx={{ mr: 1.5, color: theme.palette.success.main }} />
                Nota descifrada correctamente
              </Typography>
              
              <Box>
                <Button
                  startIcon={<ContentCopy fontSize="small" />}
                  onClick={copyContent}
                  variant="outlined"
                  color="success"
                  size="small"
                  sx={{ 
                    borderRadius: 1,
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.85rem',
                    mr: 1
                  }}
                >
                  Copiar
                </Button>
                
                <Button
                  startIcon={<DeleteOutline fontSize="small" />}
                  onClick={deleteNote}
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ 
                    borderRadius: 1,
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.85rem'
                  }}
                >
                  Eliminar nota
                </Button>
              </Box>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              {noteData?.emailSubject && (
                <Box 
                  sx={{ 
                    mb: 3, 
                    pb: 2, 
                    borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'medium', mb: 1 }}>
                    {noteData.emailSubject}
                  </Typography>
                  
                  {noteData.senderEmail && (
                    <Typography variant="body2" color="text.secondary">
                      De: {noteData.senderEmail}
                    </Typography>
                  )}
                </Box>
              )}

              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  backgroundColor: alpha(theme.palette.grey[900], 0.03),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                  borderRadius: 3,
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.95rem',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  mb: 3,
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
              >
                {decryptedContent}
              </Paper>
              
              {remainingViews !== null && remainingViews === 0 && noteData?.expireOnView && (
                <Alert 
                  severity="warning" 
                  variant="filled"
                  sx={{ 
                    mb: 3,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2">
                    Esta nota ha sido eliminada y no estará disponible en futuras visitas.
                  </Typography>
                </Alert>
              )}
              
              {noteData && (
                <Alert 
                  severity="info" 
                  variant="outlined"
                  icon={<Timer fontSize="inherit" />}
                  sx={{ 
                    mt: 2, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                  }}
                >
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {noteExpireInfo}
                    </Typography>
                    {noteData.requiresPassword && (
                      <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <Lock sx={{ mr: 1, fontSize: '0.9rem' }} />
                        Esta nota está protegida con contraseña
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}
            </CardContent>
          </>
        )}
      </Card>
      
      <Snackbar
        open={notification.show}
        autoHideDuration={3000}
        onClose={() => setNotification({...notification, show: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={notification.severity} 
          variant="filled"
          sx={{ 
            boxShadow: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': { 
              fontSize: '1.2rem',
              alignItems: 'center' 
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccessSecureNote; 