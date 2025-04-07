import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Link,
  useTheme
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  TextFields as TextFieldsIcon,
  Dialpad as DialpadIcon,
  PersonOutline as PersonIcon,
  Block as BlockIcon,
  Update as UpdateIcon,
  Key as KeyIcon,
  Storage as StorageIcon,
  Fingerprint as FingerprintIcon,
  VerifiedUser as VerifiedUserIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';

const PasswordTips = () => {
  const theme = useTheme();

  const TipSection = ({ title, icon, children }) => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
        {React.cloneElement(icon, { sx: { mr: 1 } })}
        {title}
      </Typography>
      {children}
    </Paper>
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold', my: 3 }}>
        <LockIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
        Consejos para crear contraseñas seguras
      </Typography>

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body1" paragraph>
            La creación de contraseñas seguras es fundamental para proteger tus cuentas en línea. Aquí encontrarás consejos prácticos para crear y gestionar contraseñas que sean difíciles de adivinar o descifrar.
          </Typography>

          <TipSection title="Principios básicos para contraseñas seguras" icon={<KeyIcon />}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TextFieldsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Usa una combinación de letras mayúsculas y minúsculas"
                  secondary="La variación de capitalización añade complejidad a tu contraseña."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DialpadIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Incluye números y símbolos"
                  secondary="Añadir caracteres especiales como @, #, %, $ aumenta significativamente la seguridad."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Evita usar información personal"
                  secondary="Fechas de nacimiento, nombres de mascotas o cualquier información que pueda ser conocida o adivinada fácilmente."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BlockIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="No reutilices contraseñas en diferentes sitios"
                  secondary="Si un sitio sufre una brecha de seguridad, todas tus cuentas estarían en riesgo."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <UpdateIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Cambia tus contraseñas regularmente"
                  secondary="Especialmente para cuentas críticas como bancos o correo electrónico principal."
                />
              </ListItem>
            </List>
          </TipSection>

          <TipSection title="Técnicas avanzadas para contraseñas seguras" icon={<VpnKeyIcon />}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Método de frase de contraseña
                  </Typography>
                  <Typography variant="body2">
                    Usa una frase completa fácil de recordar pero difícil de adivinar. Por ejemplo: "¡ElGatoDeJuliaComió3PecesDePlata!" es más segura y fácil de recordar que una cadena de caracteres aleatorios más corta.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Sistema de reglas personales
                  </Typography>
                  <Typography variant="body2">
                    Crea un sistema de reglas personales para transformar algo familiar en una contraseña segura. Por ejemplo, toma las primeras letras de cada palabra de tu canción favorita y añade números y símbolos.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Contraseñas de varios factores
                  </Typography>
                  <Typography variant="body2">
                    Combina diferentes tipos de información: un lugar, una fecha importante para ti (pero no obvia), un objeto, un color... y añade simbolos entre ellos. Por ejemplo: "Madrid*2011^Libro!Rojo".
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Base + Variación
                  </Typography>
                  <Typography variant="body2">
                    Crea una "base" de contraseña fuerte y añade una variación específica para cada sitio. Por ejemplo: "B@seSeg2ra!FB" para Facebook y "B@seSeg2ra!TW" para Twitter.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TipSection>

          <TipSection title="Gestión de contraseñas" icon={<StorageIcon />}>
            <Typography variant="body2" paragraph>
              La mejor solución para manejar múltiples contraseñas complejas es utilizar un gestor de contraseñas. Estas aplicaciones te permiten:
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
                  <Typography variant="subtitle1" gutterBottom color="primary">Ventajas:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Almacenar contraseñas con cifrado seguro" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Generar contraseñas complejas aleatorias" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Autocompletar formularios de inicio de sesión" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Sincronizar entre dispositivos" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Auditar la seguridad de tus contraseñas" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
                  <Typography variant="subtitle1" gutterBottom color="primary">Gestores recomendados:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Bitwarden (código abierto y gratuito)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="1Password (excelente interfaz de usuario)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="KeePass (offline y código abierto)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="LastPass (fácil de usar)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Dashlane (incluye VPN)" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TipSection>

          <TipSection title="Seguridad adicional: Autenticación de dos factores (2FA)" icon={<FingerprintIcon />}>
            <Typography variant="body2" paragraph>
              Incluso la mejor contraseña puede ser comprometida. La autenticación de dos factores añade una capa adicional de seguridad al requerir una segunda forma de verificación además de tu contraseña.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Tipos de 2FA:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="SMS o llamadas telefónicas" 
                        secondary="Código enviado a tu teléfono (menos seguro pero mejor que nada)" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Aplicaciones de autenticación" 
                        secondary="Google Authenticator, Microsoft Authenticator, Authy" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Llaves de seguridad físicas" 
                        secondary="YubiKey, Google Titan, otras llaves FIDO2" 
                      />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                    borderLeft: '4px solid #4caf50',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <VerifiedUserIcon sx={{ mr: 1, color: '#4caf50' }} />
                    Recomendación de seguridad
                  </Typography>
                  <Typography variant="body2">
                    Activa la autenticación de dos factores en todas tus cuentas importantes (email, redes sociales, banca, almacenamiento en la nube). Preferiblemente usa aplicaciones de autenticación en lugar de SMS, ya que son más seguras contra los ataques de SIM swapping.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </TipSection>

          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<LockIcon />}
              component={Link}
              href="/"
              sx={{ mr: 2 }}
            >
              Ir al Generador
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              href="https://es.wikipedia.org/wiki/Seguridad_de_contrase%C3%B1a"
              target="_blank"
            >
              Más información sobre seguridad
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PasswordTips; 