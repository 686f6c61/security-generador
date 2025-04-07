import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Divider,
  useMediaQuery,
  Chip
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Functions as FunctionsIcon,
  Translate as TranslateIcon,
  Article as ArticleIcon,
  GifBox as GifBoxIcon,
  Lock as LockIcon,
  Apps as AppsIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  
  const handleLanguageMenu = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };
  
  const handleLanguageClose = () => {
    setLanguageAnchorEl(null);
  };
  
  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Separamos los ítems en categorías
  const functionalityItems = [
    { text: 'Generador', link: '/', icon: <SecurityIcon /> },
    { text: 'Generador con GIFs', link: '/giphy-generator', icon: <GifBoxIcon />, isNew: true },
    { text: 'Notas Seguras', link: '/secure-notes', icon: <LockIcon />, isNew: true },
  ];
  
  const infoItems = [
    { text: '¿Qué es la entropía?', link: '/entropia', icon: <FunctionsIcon /> },
    { text: 'Ataques de fuerza bruta', link: '/fuerza-bruta', icon: <InfoIcon /> },
    { text: 'Consejos de seguridad', link: '/consejos', icon: <ArticleIcon /> },
  ];
  
  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
        Security(B)
      </Typography>
      <Divider />
      
      {/* Sección de Funcionalidades */}
      <ListItem>
        <ListItemIcon><AppsIcon color="primary" /></ListItemIcon>
        <ListItemText primary={<Typography variant="subtitle2" color="primary">Funcionalidades</Typography>} />
      </ListItem>
      <List>
        {functionalityItems.map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.link}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
            {item.isNew && (
              <Chip
                label="Nuevo"
                color="secondary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* Sección de Información */}
      <ListItem>
        <ListItemIcon><HelpOutlineIcon color="primary" /></ListItemIcon>
        <ListItemText primary={<Typography variant="subtitle2" color="primary">Información</Typography>} />
      </ListItem>
      <List>
        {infoItems.map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.link}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="primary"
            />
          }
          label={darkMode ? "Modo oscuro" : "Modo claro"}
        />
      </Box>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                textDecoration: 'none',
                color: 'inherit',
                flexGrow: 1,
                fontWeight: 'bold'
              }}
            >
              Security(B)
            </Typography>
            
            {!isMobile && (
              <>
                {/* Sección de Funcionalidades */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/"
                    startIcon={<SecurityIcon />}
                  >
                    Generador
                  </Button>
                  
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/giphy-generator"
                    startIcon={<GifBoxIcon />}
                    sx={{ position: 'relative' }}
                  >
                    Generador con GIFs
                    <Chip
                      label="Nuevo"
                      color="secondary"
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -15,
                        fontSize: '0.6rem',
                        height: 20
                      }}
                    />
                  </Button>
                  
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/secure-notes"
                    startIcon={<LockIcon />}
                    sx={{ position: 'relative' }}
                  >
                    Notas Seguras
                    <Chip
                      label="Nuevo"
                      color="secondary"
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -15,
                        fontSize: '0.6rem',
                        height: 20
                      }}
                    />
                  </Button>
                </Box>
                
                {/* Separador visual */}
                <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)', height: 28 }} />
                
                {/* Sección de Información */}
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/entropia"
                    startIcon={<FunctionsIcon />}
                  >
                    Entropía
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/fuerza-bruta"
                    startIcon={<InfoIcon />}
                  >
                    Fuerza bruta
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/consejos"
                    startIcon={<ArticleIcon />}
                  >
                    Consejos
                  </Button>
                </Box>
              </>
            )}
            
            <IconButton
              color="inherit"
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              onClick={toggleDarkMode}
              edge="end"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <IconButton
              color="inherit"
              aria-label="Seleccionar idioma"
              onClick={handleLanguageMenu}
              edge="end"
              sx={{ ml: 1 }}
            >
              <TranslateIcon />
            </IconButton>
            <Menu
              id="language-menu"
              anchorEl={languageAnchorEl}
              keepMounted
              open={Boolean(languageAnchorEl)}
              onClose={handleLanguageClose}
            >
              <MenuItem onClick={handleLanguageClose}>🇪🇸 Español</MenuItem>
              <MenuItem onClick={handleLanguageClose}>🇬🇧 English</MenuItem>
              <MenuItem onClick={handleLanguageClose}>🇫🇷 Français</MenuItem>
              <MenuItem onClick={handleLanguageClose}>🇩🇪 Deutsch</MenuItem>
              <MenuItem onClick={handleLanguageClose}>🇮🇹 Italiano</MenuItem>
            </Menu>
            
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="abrir menú"
                edge="end"
                onClick={toggleDrawer(true)}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 