import React from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Divider,
  Paper,
  Grid,
  useTheme
} from '@mui/material';
import { Functions as FunctionsIcon } from '@mui/icons-material';

const EntropyExplanation = () => {
  const theme = useTheme();

  const Formula = ({ children }) => (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        my: 3,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        borderRadius: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }}
    >
      {children}
    </Paper>
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold', my: 3 }}>
        <FunctionsIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
        ¿Qué es la entropía de una contraseña?
      </Typography>

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body1" paragraph>
            La entropía de una contraseña es una medida de su fortaleza o imprevisibilidad. En el contexto de la seguridad informática, la entropía se expresa en bits y representa la cantidad de información o aleatoriedad contenida en una contraseña.
          </Typography>

          <Typography variant="body1" paragraph>
            Una contraseña con alta entropía es más difícil de adivinar o descifrar mediante ataques de fuerza bruta o de diccionario. La entropía se calcula utilizando la siguiente fórmula:
          </Typography>

          <Formula>
            <Typography variant="h6" align="center" gutterBottom>
              E = L × log<sub>2</sub>(R)
            </Typography>
            <Typography variant="body1">
              Donde:
            </Typography>
            <Box component="ul" sx={{ pl: 4 }}>
              <li><Typography component="span" sx={{ fontWeight: 'bold' }}>E</Typography> es la entropía en bits</li>
              <li><Typography component="span" sx={{ fontWeight: 'bold' }}>L</Typography> es la longitud de la contraseña</li>
              <li><Typography component="span" sx={{ fontWeight: 'bold' }}>R</Typography> es el tamaño del conjunto de caracteres posibles</li>
            </Box>
          </Formula>

          <Typography variant="body1" paragraph>
            Por ejemplo, para una contraseña de 8 caracteres que utiliza letras minúsculas y mayúsculas (52 caracteres) y números (10 caracteres), el cálculo sería:
          </Typography>

          <Formula>
            <Typography variant="body1" align="center">
              E = 8 × log<sub>2</sub>(62) ≈ 47.6 bits
            </Typography>
          </Formula>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" color="primary" gutterBottom>
            Cálculo para contraseñas basadas en palabras
          </Typography>

          <Typography variant="body1" paragraph>
            En el caso de contraseñas basadas en palabras, el cálculo es ligeramente diferente. Se utiliza el tamaño del diccionario en lugar del conjunto de caracteres:
          </Typography>

          <Formula>
            <Typography variant="h6" align="center" gutterBottom>
              E = N × log<sub>2</sub>(D)
            </Typography>
            <Typography variant="body1">
              Donde:
            </Typography>
            <Box component="ul" sx={{ pl: 4 }}>
              <li><Typography component="span" sx={{ fontWeight: 'bold' }}>N</Typography> es el número de palabras en la contraseña</li>
              <li><Typography component="span" sx={{ fontWeight: 'bold' }}>D</Typography> es el tamaño del diccionario</li>
            </Box>
          </Formula>

          <Typography variant="body1" paragraph>
            Por ejemplo, si usamos 4 palabras de un diccionario de 10,000 palabras, la entropía sería:
          </Typography>

          <Formula>
            <Typography variant="body1" align="center">
              E = 4 × log<sub>2</sub>(10,000) ≈ 4 × 13.29 ≈ 53.2 bits
            </Typography>
          </Formula>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" color="primary" gutterBottom>
            Interpretación de los valores de entropía
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" className="strength-very-weak">Muy débil</Typography>
                <Typography variant="body2">Menos de 28 bits</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 124, 0, 0.2)' : 'rgba(245, 124, 0, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" className="strength-weak">Débil</Typography>
                <Typography variant="body2">28-35 bits</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(251, 192, 45, 0.2)' : 'rgba(251, 192, 45, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" className="strength-reasonable">Razonable</Typography>
                <Typography variant="body2">36-59 bits</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.2)' : 'rgba(56, 142, 60, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" className="strength-strong">Fuerte</Typography>
                <Typography variant="body2">60-127 bits</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" className="strength-very-strong">Muy fuerte</Typography>
                <Typography variant="body2">128 bits o más</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              Una mayor entropía indica una contraseña más segura. En general, se recomienda una entropía mínima de 60 bits para una seguridad adecuada, aunque para información altamente sensible, se pueden requerir valores más altos (80-100 bits).
            </Typography>
            <Typography variant="body1">
              Recuerda que, incluso con alta entropía, las contraseñas no deben reutilizarse entre diferentes servicios, ya que una filtración en un sitio puede comprometer todas tus cuentas que utilicen la misma contraseña.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EntropyExplanation; 