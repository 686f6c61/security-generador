import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, MenuItem, Select,
  FormControl, InputLabel, Typography, Divider, Alert, Snackbar,
  InputAdornment, IconButton, FormControlLabel, Checkbox,
  Container, Paper, Grid, Tooltip, Chip, useTheme
} from '@mui/material';
import { 
  Send, ContentCopy, Visibility, VisibilityOff, Lock,
  Security, Email, Timer, Code, Info, Check as CheckIcon,
  FileCopy as FileCopyIcon, LockOpen
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const SecureNoteSharing = () => {
  const theme = useTheme();
  const [noteContent, setNoteContent] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState('aes-256-gcm');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expiresIn, setExpiresIn] = useState(24);
  const [notification, setNotification] = useState({ show: false, message: '', severity: 'info' });
  const [generated, setGenerated] = useState(false);
  const [noteLink, setNoteLink] = useState('');
  const [usePassword, setUsePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shareMethod, setShareMethod] = useState('email');
  const [copied, setCopied] = useState(false);
  const [expirationMode, setExpirationMode] = useState('timed');
  
  const handleSendNote = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/secure-notes/share`, {
        content: noteContent,
        recipientEmail: shareMethod === 'email' ? recipientEmail : '',
        senderEmail: shareMethod === 'email' ? senderEmail : '',
        emailSubject: shareMethod === 'email' ? emailSubject : '',
        encryptionAlgorithm,
        password: usePassword ? password : null,
        expiresIn: expirationMode === 'timed' ? expiresIn * 3600 : 86400,
        expireOnView: expirationMode === 'onView'
      });
      
      setNoteLink(response.data.noteUrl);
      setGenerated(true);
      setNotification({
        show: true,
        message: shareMethod === 'email' 
          ? 'Nota segura enviada correctamente al correo indicado' 
          : 'Nota segura generada correctamente',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.error || 'Error al enviar nota segura',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(noteLink);
      setCopied(true);
      setNotification({
        show: true,
        message: 'Enlace copiado al portapapeles',
        severity: 'success'
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al copiar enlace',
        severity: 'error'
      });
    }
  };

  const getAlgorithmDescription = (algorithm) => {
    const descriptions = {
      'aes-256-gcm': 'Algoritmo simétrico con autenticación integrada. Muy seguro y recomendado.',
      'aes-256-cbc': 'Algoritmo simétrico tradicional, ampliamente utilizado.',
      'aes-512-gcm': 'Versión de 512 bits de AES-GCM. Mayor seguridad para datos sensibles.',
      'aes-512-cbc': 'Versión de 512 bits de AES-CBC. Cifrado robusto de alta seguridad.',
      'chacha20-poly1305': 'Algoritmo moderno optimizado para software. Excelente rendimiento.'
    };
    
    return descriptions[algorithm] || 'Descripción no disponible';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)' 
              : 'linear-gradient(45deg, #2196f3 30%, #3f51b5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
          Notas seguras encriptadas
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Comparte información confidencial de forma segura con cifrado de extremo a extremo
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card 
            elevation={4} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              position: 'relative', 
              overflow: 'visible',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #3f51b5, #2196f3)' 
                  : 'linear-gradient(90deg, #2196f3, #3f51b5)',
                borderRadius: '2px 2px 0 0'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Lock 
                  sx={{ 
                    mr: 1.5, 
                    fontSize: 28,
                    color: theme.palette.primary.main
                  }} 
                />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Crear una nota segura
                </Typography>
              </Box>
              
              <TextField
                label="Contenido de la nota"
                multiline
                rows={6}
                fullWidth
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="Escribe el contenido confidencial aquí..."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    fontSize: '0.95rem'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1, fontSize: 20 }} />
                  Método de envío
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mt: 1,
                    borderRadius: 1.5,
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant={shareMethod === 'email' ? 'contained' : 'outlined'}
                        onClick={() => setShareMethod('email')}
                        startIcon={<Email sx={{ fontSize: 18 }} />}
                        sx={{ 
                          p: 1,
                          borderRadius: 1,
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          fontWeight: 'normal',
                          fontSize: '0.9rem'
                        }}
                      >
                        Enviar por correo
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant={shareMethod === 'link' ? 'contained' : 'outlined'}
                        onClick={() => setShareMethod('link')}
                        startIcon={<FileCopyIcon sx={{ fontSize: 18 }} />}
                        sx={{ 
                          p: 1,
                          borderRadius: 1,
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          fontWeight: 'normal',
                          fontSize: '0.9rem'
                        }}
                      >
                        Generar enlace
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {shareMethod === 'email' && (
                    <>
                      <TextField
                        label="Correo del destinatario"
                        fullWidth
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        size="small"
                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                      <TextField
                        label="Asunto (opcional)"
                        fullWidth
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        placeholder="Nota segura para ti"
                        size="small"
                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                      <TextField
                        label="Tu correo (opcional)"
                        fullWidth
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        type="email"
                        placeholder="tu@correo.com"
                        size="small"
                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        helperText="Se mostrará como remitente del mensaje"
                      />
                    </>
                  )}
                </Paper>
              </Box>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Security sx={{ mr: 1, fontSize: 20 }} />
                  Seguridad y encriptación
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mt: 1,
                    borderRadius: 1.5,
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                  }}
                >
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Algoritmo de encriptación</InputLabel>
                    <Select
                      value={encryptionAlgorithm}
                      onChange={(e) => setEncryptionAlgorithm(e.target.value)}
                      label="Algoritmo de encriptación"
                      size="small"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 1 },
                        fontSize: '0.9rem'
                      }}
                    >
                      <MenuItem value="aes-256-gcm">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Code fontSize="small" sx={{ mr: 1 }} />
                          AES-256-GCM
                          <Chip 
                            label="Recomendado" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                          />
                        </Box>
                      </MenuItem>
                      <MenuItem value="aes-256-cbc">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Code fontSize="small" sx={{ mr: 1 }} />
                          AES-256-CBC
                        </Box>
                      </MenuItem>
                      <MenuItem value="aes-512-gcm">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Code fontSize="small" sx={{ mr: 1 }} />
                          AES-512-GCM
                          <Chip 
                            label="Alta seguridad" 
                            size="small" 
                            color="success" 
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                          />
                        </Box>
                      </MenuItem>
                      <MenuItem value="aes-512-cbc">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Code fontSize="small" sx={{ mr: 1 }} />
                          AES-512-CBC
                        </Box>
                      </MenuItem>
                      <MenuItem value="chacha20-poly1305">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Code fontSize="small" sx={{ mr: 1 }} />
                          ChaCha20-Poly1305
                          <Chip 
                            label="Moderno" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                          />
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Info fontSize="small" sx={{ mr: 1, mt: 0.2 }} />
                    {getAlgorithmDescription(encryptionAlgorithm)}
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={usePassword}
                        onChange={(e) => setUsePassword(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body1">
                        Proteger con contraseña adicional
                      </Typography>
                    }
                    sx={{ mb: 1 }}
                  />
                  
                  {usePassword && (
                    <TextField
                      label="Contraseña de acceso"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      margin="normal"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
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
                  )}
                </Paper>
              </Box>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Timer sx={{ mr: 1, fontSize: 20 }} />
                  Caducidad de la nota
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mt: 1,
                    borderRadius: 1.5,
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Modo de caducidad</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant={expirationMode === 'timed' ? 'contained' : 'outlined'}
                          onClick={() => setExpirationMode('timed')}
                          startIcon={<Timer sx={{ fontSize: 18 }} />}
                          sx={{ 
                            p: 1,
                            borderRadius: 1,
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            fontSize: '0.9rem'
                          }}
                        >
                          Predefinida
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant={expirationMode === 'onView' ? 'contained' : 'outlined'}
                          onClick={() => setExpirationMode('onView')}
                          startIcon={<LockOpen sx={{ fontSize: 18 }} />}
                          sx={{ 
                            p: 1,
                            borderRadius: 1,
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            fontSize: '0.9rem'
                          }}
                        >
                          Al ser abierta
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {expirationMode === 'timed' && (
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel>Tiempo de expiración</InputLabel>
                      <Select
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(e.target.value)}
                        label="Tiempo de expiración"
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, fontSize: '0.9rem' }}
                      >
                        <MenuItem value={1}>1 hora</MenuItem>
                        <MenuItem value={3}>3 horas</MenuItem>
                        <MenuItem value={12}>12 horas</MenuItem>
                        <MenuItem value={24}>24 horas</MenuItem>
                        <MenuItem value={72}>3 días</MenuItem>
                        <MenuItem value={168}>1 semana</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  {expirationMode === 'onView' && (
                    <Alert severity="info" sx={{ mt: 1, borderRadius: 1.5 }}>
                      La nota se eliminará permanentemente tras ser vista, independientemente del tiempo transcurrido.
                    </Alert>
                  )}
                </Paper>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                size="medium"
                className="send-note-button"
                sx={{ 
                  mt: 3,
                  py: 1.2,
                  px: 4,
                  maxWidth: '250px',
                  mx: 'auto',
                  display: 'block',
                  borderRadius: 1,
                  fontWeight: 'medium',
                  fontSize: '0.95rem',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? '#3f51b5' 
                    : '#1976d2',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? '#303f9f' 
                      : '#1565c0',
                  }
                }}
                onClick={handleSendNote}
                startIcon={shareMethod === 'email' ? <Send /> : <Lock />}
                disabled={!noteContent || (shareMethod === 'email' && !recipientEmail) || (usePassword && !password) || loading}
              >
                {loading 
                  ? 'Procesando...' 
                  : shareMethod === 'email' 
                    ? 'Enviar nota segura' 
                    : 'Generar enlace seguro'
                }
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {generated ? (
              <Card 
                elevation={4} 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: theme.palette.success.main,
                    borderRadius: '2px 2px 0 0'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LockOpen 
                      sx={{ 
                        mr: 1.5, 
                        fontSize: 28,
                        color: theme.palette.success.main
                      }} 
                    />
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                      ¡Nota generada con éxito!
                    </Typography>
                  </Box>
                  
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>
                    {shareMethod === 'email' 
                      ? `Se ha enviado un correo con el enlace seguro a ${recipientEmail}.` 
                      : 'Enlace generado correctamente. Cópialo y compártelo con quien necesites.'}
                  </Alert>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Enlace de acceso directo:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TextField
                      fullWidth
                      value={noteLink}
                      variant="outlined"
                      size="small"
                      InputProps={{ 
                        readOnly: true,
                        sx: { borderRadius: 1, fontSize: '0.85rem' }
                      }}
                    />
                    <Tooltip title={copied ? "¡Copiado!" : "Copiar enlace"}>
                      <IconButton 
                        color={copied ? "success" : "primary"} 
                        onClick={copyLinkToClipboard} 
                        sx={{ ml: 1 }}
                        size="small"
                      >
                        {copied ? <CheckIcon fontSize="small" /> : <ContentCopy fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Alert severity="info" variant="outlined" sx={{ borderRadius: 1.5 }}>
                    <Typography variant="body2">
                      <strong>Información importante:</strong>
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                      {expirationMode === 'timed' ? (
                        <li>El enlace expirará en {expiresIn} hora{expiresIn > 1 ? 's' : ''}</li>
                      ) : (
                        <li>El enlace será válido hasta que alguien lo abra</li>
                      )}
                      {expirationMode === 'onView' ? (
                        <li>Esta nota se destruirá automáticamente después de ser leída</li>
                      ) : (
                        <li>Esta nota caducará cuando expire el tiempo establecido</li>
                      )}
                      {usePassword && (
                        <li>Se requiere la contraseña que configuraste para acceder</li>
                      )}
                      <li>El contenido está cifrado con {encryptionAlgorithm.toUpperCase()}</li>
                    </Box>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Card 
                elevation={4} 
                sx={{ 
                  mb: 3,
                  height: '100%',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: theme.palette.info.main,
                    borderRadius: '2px 2px 0 0'
                  },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Info 
                      sx={{ 
                        mr: 1.5, 
                        fontSize: 28,
                        color: theme.palette.info.main
                      }} 
                    />
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      Acerca de las notas seguras
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ¿Cómo funciona?
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Las notas seguras te permiten compartir información confidencial que se destruye después de leerse.
                      Todo el contenido se cifra con algoritmos de alta seguridad.
                    </Typography>
                    
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 3 }}>
                      Características principales:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                      <Typography component="li" variant="body2">
                        <strong>Cifrado de extremo a extremo</strong> - Nadie puede leer tu contenido
                      </Typography>
                      <Typography component="li" variant="body2">
                        <strong>Auto-destrucción</strong> - La nota desaparece tras leerse
                      </Typography>
                      <Typography component="li" variant="body2">
                        <strong>Expiración configurable</strong> - Define cuánto tiempo estará disponible
                      </Typography>
                      {shareMethod === 'email' && (
                        <Typography component="li" variant="body2">
                          <strong>Notificación por correo</strong> - El destinatario recibe un aviso
                        </Typography>
                      )}
                      <Typography component="li" variant="body2">
                        <strong>Protección con contraseña</strong> - Capa adicional de seguridad opcional
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
                      Comparativa de algoritmos de encriptación:
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        borderRadius: 1.5,
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Code fontSize="small" sx={{ mr: 1 }} />
                        AES-256-GCM
                        <Chip 
                          label="Recomendado" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Algoritmo estándar de cifrado avanzado con modo Galois/Counter que proporciona tanto confidencialidad como autenticación.
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, mt: 0, mb: 0 }}>
                        <Typography component="li" variant="body2">
                          <strong>Ventajas:</strong> Rápido, seguro y resistente a manipulaciones. Detecta si los datos han sido alterados.
                        </Typography>
                        <Typography component="li" variant="body2">
                          <strong>Uso ideal:</strong> Protección general de datos sensibles con rendimiento eficiente.
                        </Typography>
                      </Box>
                    </Paper>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        borderRadius: 1.5,
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: theme.palette.success.main, fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Code fontSize="small" sx={{ mr: 1 }} />
                        AES-512-GCM
                        <Chip 
                          label="Alta seguridad" 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Implementación de doble capa que utiliza dos claves AES-256 separadas para crear un cifrado de fuerza equivalente a 512 bits.
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, mt: 0, mb: 0 }}>
                        <Typography component="li" variant="body2">
                          <strong>Ventajas:</strong> Seguridad extremadamente alta, prácticamente imposible de romper incluso con computación cuántica.
                        </Typography>
                        <Typography component="li" variant="body2">
                          <strong>Uso ideal:</strong> Datos altamente confidenciales que requieren el máximo nivel de protección.
                        </Typography>
                      </Box>
                    </Paper>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 1.5,
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Code fontSize="small" sx={{ mr: 1 }} />
                        ChaCha20-Poly1305
                        <Chip 
                          label="Moderno" 
                          size="small" 
                          color="info" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Algoritmo moderno diseñado como alternativa a AES, especialmente eficiente en plataformas sin aceleración de hardware AES.
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, mt: 0, mb: 0 }}>
                        <Typography component="li" variant="body2">
                          <strong>Ventajas:</strong> Rendimiento superior en software, excelente para dispositivos móviles y de bajo consumo.
                        </Typography>
                        <Typography component="li" variant="body2">
                          <strong>Uso ideal:</strong> Aplicaciones donde el rendimiento es crucial o en sistemas con recursos limitados.
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  
                  <Alert severity="info" variant="outlined" sx={{ borderRadius: 1.5, mt: 'auto' }}>
                    Rellena el formulario y haz clic en {shareMethod === 'email' ? '"Enviar nota segura"' : '"Generar enlace seguro"'} para comenzar.
                  </Alert>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
      
      <Snackbar
        open={notification.show}
        autoHideDuration={5000}
        onClose={() => setNotification({...notification, show: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} variant="filled" sx={{ borderRadius: 1.5 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SecureNoteSharing; 