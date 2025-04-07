import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import {
  Security as SecurityIcon,
  ContentPaste as ContentPasteIcon,
  Book as BookIcon,
  Shuffle as ShuffleIcon,
  FlipToBack as FlipToBackIcon,
  Memory as MemoryIcon
} from '@mui/icons-material';

const BruteForceExplanation = () => {
  const theme = useTheme();
  
  const AttackCard = ({ title, icon, children }) => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        my: 2,
        borderRadius: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <Box component="span" sx={{ ml: 1 }}>
          {title}
        </Box>
      </Typography>
      <Typography variant="body1">
        {children}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold', my: 3 }}>
        <SecurityIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
        Ataques de fuerza bruta y sus variantes
      </Typography>

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body1" paragraph>
            Los ataques de fuerza bruta son métodos empleados para descifrar contraseñas mediante prueba y error. Estos ataques han evolucionado a lo largo del tiempo, dando lugar a variantes cada vez más sofisticadas. Entender cómo funcionan estos ataques es fundamental para comprender la importancia de utilizar contraseñas seguras.
          </Typography>

          <AttackCard 
            title="Ataque de fuerza bruta clásico" 
            icon={<SecurityIcon color="primary" />}
          >
            Un ataque de fuerza bruta es un método de descifrado de contraseñas que consiste en probar sistemáticamente todas las combinaciones posibles de caracteres hasta encontrar la correcta. Aunque es un método garantizado para encontrar cualquier contraseña, puede ser extremadamente lento para contraseñas largas y complejas. Por ejemplo, una contraseña de 8 caracteres que use letras mayúsculas, minúsculas y números tendría 62⁸ (218 billones) de combinaciones posibles.
          </AttackCard>

          <AttackCard 
            title="Credential Stuffing" 
            icon={<ContentPasteIcon color="primary" />}
          >
            El credential stuffing es una técnica que utiliza pares de nombres de usuario y contraseñas filtrados de una brecha de seguridad para intentar acceder a otras cuentas. Este método explota la tendencia de los usuarios a reutilizar las mismas credenciales en múltiples sitios. Según estudios recientes, más del 65% de los usuarios reutilizan la misma contraseña en varios servicios, lo que hace que esta técnica sea sorprendentemente efectiva.
          </AttackCard>

          <AttackCard 
            title="Ataque de diccionario" 
            icon={<BookIcon color="primary" />}
          >
            Un ataque de diccionario utiliza una lista predefinida de palabras y frases comunes para intentar adivinar la contraseña. Es más rápido que la fuerza bruta pura, pero menos exhaustivo. Es especialmente efectivo contra contraseñas que utilizan palabras comunes. Los diccionarios modernos para estos ataques pueden contener millones de palabras, incluyendo palabras de jerga, referencias culturales y variaciones comunes (como reemplazar 'a' por '@').
          </AttackCard>

          <AttackCard 
            title="Ataques híbridos de fuerza bruta" 
            icon={<ShuffleIcon color="primary" />}
          >
            Los ataques híbridos combinan elementos de los ataques de diccionario y de fuerza bruta. Pueden comenzar con palabras de un diccionario y luego aplicar transformaciones comunes (como añadir números al final) o combinar palabras del diccionario con secuencias de caracteres generadas por fuerza bruta. Por ejemplo, si saben que muchos usuarios añaden su año de nacimiento al final de una palabra, probarán combinaciones como "password1990" o "princess2000".
          </AttackCard>

          <AttackCard 
            title="Ataques de fuerza bruta inversos" 
            icon={<FlipToBackIcon color="primary" />}
          >
            En lugar de intentar descifrar una contraseña específica, los ataques de fuerza bruta inversos generan hashes de contraseñas comunes y los comparan con una base de datos de hashes robados. Este método es eficaz para descifrar múltiples contraseñas simultáneamente si se tiene acceso a una base de datos de hashes. Las "tablas arcoíris" son un ejemplo de esta técnica, donde se calculan previamente millones de hashes para hacer búsquedas rápidas.
          </AttackCard>

          <AttackCard 
            title="Aceleración de fuerza bruta por GPU" 
            icon={<MemoryIcon color="primary" />}
          >
            La aceleración por GPU utiliza el poder de procesamiento de las tarjetas gráficas para realizar ataques de fuerza bruta mucho más rápidamente que con CPUs tradicionales. Las GPUs son particularmente eficientes en realizar múltiples cálculos simples en paralelo, lo que las hace ideales para probar un gran número de combinaciones de contraseñas rápidamente. Una GPU moderna puede probar miles de millones de contraseñas por segundo, lo que hace que las contraseñas cortas o débiles sean extremadamente vulnerables.
          </AttackCard>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" color="primary" gutterBottom>
            Factores que influyen en el tiempo de craqueo
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">Longitud de la contraseña</Typography>
                <Typography variant="body2">
                  Cada carácter adicional multiplica exponencialmente el número de posibles combinaciones. Una contraseña de 8 caracteres puede ser crackeada en horas o días, mientras que una de 12 caracteres podría llevar años o siglos con el mismo conjunto de caracteres.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">Complejidad del conjunto de caracteres</Typography>
                <Typography variant="body2">
                  Usar una mezcla de letras mayúsculas, minúsculas, números y símbolos aumenta significativamente la complejidad. Un conjunto de 95 caracteres en lugar de solo 26 letras minúsculas multiplica enormemente las posibilidades.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">Poder computacional del atacante</Typography>
                <Typography variant="body2">
                  Los tiempos de craqueo se calculan basándose en el hardware disponible. Una granja de GPUs o un supercomputador puede reducir drásticamente el tiempo necesario para romper una contraseña.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">Predictibilidad</Typography>
                <Typography variant="body2">
                  Las contraseñas que siguen patrones comunes (como usar palabras del diccionario con sustituciones simples) son más fáciles de crackear incluso si son largas, ya que los atacantes optimizan sus algoritmos para probar primero las combinaciones más probables.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body1">
              La mejor defensa contra estos ataques es utilizar contraseñas largas, aleatorias y únicas para cada servicio. Los gestores de contraseñas son una excelente herramienta para generar y almacenar de forma segura contraseñas complejas sin necesidad de memorizarlas todas. Además, siempre que sea posible, es recomendable activar la autenticación de dos factores (2FA) como capa adicional de seguridad.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BruteForceExplanation; 