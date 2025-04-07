import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { GitHub, GifBox } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        bgcolor: 'primary.main', 
        color: 'white',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={3} 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              Genera contraseñas seguras con ❤️ por generadordepasswords.com en {currentYear}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              generadordepasswords.com con medición de entropía
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Box>
              <IconButton color="inherit" aria-label="GitHub" component={Link} href="https://github.com/the00b" target="_blank">
                <GitHub />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              ¿Encontraste un bug? <Link href="https://github.com/the00b" color="inherit" underline="hover" target="_blank">Reportar en GitHub</Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 