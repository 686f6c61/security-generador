import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Link,
  IconButton,
  Tooltip,
  InputAdornment,
  Paper,
  useTheme
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Check as CheckIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const PasswordShareModal = ({ open, onClose, password }) => {
  const theme = useTheme();

  // Estados
  const [expirationOption, setExpirationOption] = useState('1h');
  const [accessOption, setAccessOption] = useState('1');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Convertir opción de expiración a segundos
  const getExpirationInSeconds = () => {
    switch (expirationOption) {
      case '5m': return 5 * 60;
      case '15m': return 15 * 60;
      case '30m': return 30 * 60;
      case '1h': return 60 * 60;
      case '12h': return 12 * 60 * 60;
      case '24h': return 24 * 60 * 60;
      default: return 60 * 60; // 1 hora por defecto
    }
  };

  // Formatear tiempo para mostrar
  const formatExpiration = (option) => {
    switch (option) {
      case '5m': return '5 minutos';
      case '15m': return '15 minutos';
      case '30m': return '30 minutos';
      case '1h': return '1 hora';
      case '12h': return '12 horas';
      case '24h': return '24 horas';
      default: return '1 hora';
    }
  };

  // Manejar cambio de opción de expiración
  const handleExpirationChange = (event) => {
    setExpirationOption(event.target.value);
  };

  // Manejar cambio de opción de accesos
  const handleAccessChange = (event) => {
    setAccessOption(event.target.value);
  };

  // Manejar el cambio de nota
  const handleNoteChange = (event) => {
    setNote(event.target.value);
  };

  // Generar enlace compartido
  const generateShareLink = async () => {
    if (!password) {
      setError('No hay una contraseña para compartir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowProgress(true);

      const response = await axios.post(`${API_URL}/share`, {
        password,
        expiresIn: getExpirationInSeconds(),
        useCount: parseInt(accessOption),
        note
      });

      setShareUrl(response.data.shareUrl);
      setShowProgress(false);
    } catch (error) {
      console.error('Error al generar enlace:', error);
      setError('Error al generar el enlace compartido');
      setShowProgress(false);
    } finally {
      setLoading(false);
    }
  };

  // Copiar enlace al portapapeles
  const copyLinkToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Compartir enlace usando Web Share API si está disponible
  const shareLink = () => {
    if (shareUrl && navigator.share) {
      navigator.share({
        title: 'Contraseña segura compartida',
        text: note ? `Nota: ${note}` : 'Compartiendo una contraseña segura',
        url: shareUrl
      }).catch(error => {
        console.error('Error al compartir:', error);
      });
    } else {
      copyLinkToClipboard();
    }
  };

  // Resetear el modal
  const resetModal = () => {
    setExpirationOption('1h');
    setAccessOption('1');
    setNote('');
    setShareUrl(null);
    setError(null);
    setCopied(false);
    setShowProgress(false);
  };

  // Manejar cierre del modal
  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShareIcon sx={{ mr: 1 }} />
          Compartir Contraseña Segura
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!shareUrl ? (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Crea un enlace temporal para compartir tu contraseña de forma segura.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Tiempo de expiración
              </Typography>
              <FormControl fullWidth>
                <RadioGroup
                  row
                  value={expirationOption}
                  onChange={handleExpirationChange}
                >
                  <FormControlLabel value="5m" control={<Radio />} label="5 min" />
                  <FormControlLabel value="15m" control={<Radio />} label="15 min" />
                  <FormControlLabel value="30m" control={<Radio />} label="30 min" />
                  <FormControlLabel value="1h" control={<Radio />} label="1 hora" />
                  <FormControlLabel value="12h" control={<Radio />} label="12 horas" />
                  <FormControlLabel value="24h" control={<Radio />} label="24 horas" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                <VisibilityIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Número de accesos
              </Typography>
              <FormControl fullWidth>
                <RadioGroup
                  row
                  value={accessOption}
                  onChange={handleAccessChange}
                >
                  <FormControlLabel value="1" control={<Radio />} label="1 vez" />
                  <FormControlLabel value="2" control={<Radio />} label="2 veces" />
                  <FormControlLabel value="3" control={<Radio />} label="3 veces" />
                  <FormControlLabel value="5" control={<Radio />} label="5 veces" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Nota (opcional)"
                multiline
                rows={2}
                value={note}
                onChange={handleNoteChange}
                placeholder="Añade una nota para el destinatario"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.05)',
              borderRadius: 1,
              border: `1px solid ${theme.palette.primary.main}`
            }}>
              <Typography variant="body2" gutterBottom>
                <strong>Información de seguridad:</strong>
              </Typography>
              <Typography variant="body2">
                • La contraseña se cifrará con AES-256-GCM.
              </Typography>
              <Typography variant="body2">
                • El enlace expirará tras {formatExpiration(expirationOption)}.
              </Typography>
              <Typography variant="body2">
                • Solo se podrá acceder {accessOption} {parseInt(accessOption) === 1 ? 'vez' : 'veces'}.
              </Typography>
              <Typography variant="body2">
                • Los datos se eliminan del servidor tras la expiración.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Enlace generado con éxito! Compártelo con quien necesite acceder a tu contraseña.
            </Alert>

            <Typography variant="subtitle2" gutterBottom>
              Enlace temporal:
            </Typography>

            <Paper
              elevation={1}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                wordBreak: 'break-all'
              }}
            >
              <LinkIcon color="primary" sx={{ mr: 1, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {shareUrl}
              </Typography>
              <Tooltip title={copied ? "¡Copiado!" : "Copiar enlace"}>
                <IconButton onClick={copyLinkToClipboard} color={copied ? "success" : "primary"}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Paper>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Configuración:
              </Typography>
              <Typography variant="body2">
                • Expira en: {formatExpiration(expirationOption)}
              </Typography>
              <Typography variant="body2">
                • Accesos permitidos: {accessOption} {parseInt(accessOption) === 1 ? 'vez' : 'veces'}
              </Typography>
              {note && (
                <Typography variant="body2">
                  • Nota: {note}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Por seguridad, te recomendamos enviar el enlace por un canal seguro y comunicar por separado cualquier información adicional.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!shareUrl ? (
          <>
            <Button onClick={handleClose} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={generateShareLink}
              color="primary"
              variant="contained"
              disabled={loading}
              startIcon={loading && showProgress ? <CircularProgress size={20} /> : <ShareIcon />}
            >
              Generar Enlace
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">
              Cerrar
            </Button>
            <Button
              onClick={shareLink}
              color="primary"
              variant="contained"
              startIcon={<ShareIcon />}
            >
              Compartir Enlace
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PasswordShareModal; 