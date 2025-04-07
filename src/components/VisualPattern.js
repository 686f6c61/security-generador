import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs, 
  Tab,
  useTheme
} from '@mui/material';
import { 
  GridView as GridIcon, 
  Timeline as TimelineIcon, 
  Fingerprint as FingerprintIcon 
} from '@mui/icons-material';
import { 
  generateGridPattern, 
  generateSequencePattern, 
  generateVisualFingerprint 
} from '../utils/visualPatternGenerator';

// Componente que renderiza el patrón de cuadrícula
const GridPattern = ({ password, gridSize = 5 }) => {
  const theme = useTheme();
  const grid = generateGridPattern(password, gridSize);
  const cellSize = 100 / gridSize;

  return (
    <Box 
      sx={{ 
        width: '100%', 
        aspectRatio: '1/1',
        backgroundColor: theme.palette.background.default,
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      {grid.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <Box
            key={`${rowIndex}-${colIndex}`}
            sx={{
              position: 'absolute',
              top: `${rowIndex * cellSize}%`,
              left: `${colIndex * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              backgroundColor: cell ? cell.color : 'transparent',
              opacity: cell ? 1 : 0,
              transition: 'background-color 0.3s, opacity 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.getContrastText(cell?.color || theme.palette.background.paper),
              fontSize: '0.7rem',
              userSelect: 'none'
            }}
          >
            {cell && (
              <Typography variant="caption" fontWeight="bold">
                {cell.char}
              </Typography>
            )}
          </Box>
        ))
      ))}
    </Box>
  );
};

// Componente que renderiza el patrón de secuencia
const SequencePattern = ({ password, gridSize = 5 }) => {
  const theme = useTheme();
  const { points, lines } = generateSequencePattern(password, gridSize);
  
  return (
    <Box 
      sx={{ 
        width: '100%', 
        aspectRatio: '1/1',
        backgroundColor: theme.palette.background.default,
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${gridSize} ${gridSize}`}>
        {/* Líneas de conexión */}
        {lines.map((line, index) => {
          const fromPoint = points[line.from];
          const toPoint = points[line.to];
          return (
            <line
              key={`line-${index}`}
              x1={fromPoint.x}
              y1={fromPoint.y}
              x2={toPoint.x}
              y2={toPoint.y}
              stroke={line.color}
              strokeWidth="0.1"
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Puntos */}
        {points.map((point, index) => (
          <g key={`point-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={point.size}
              fill={point.color}
            />
            <text
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={theme.palette.getContrastText(point.color)}
              fontSize="0.3"
              fontWeight="bold"
            >
              {point.char}
            </text>
          </g>
        ))}
      </svg>
    </Box>
  );
};

// Componente que renderiza la huella visual
const VisualFingerprint = ({ password, numBlocks = 6 }) => {
  const theme = useTheme();
  const colors = generateVisualFingerprint(password, numBlocks);
  
  return (
    <Box 
      sx={{ 
        width: '100%',
        p: 2,
        backgroundColor: theme.palette.background.default,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Typography variant="subtitle1" color="text.secondary" align="center">
        Huella Visual Única
      </Typography>
      
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', gap: 1 }}>
        {colors.map((color, index) => (
          <Box
            key={`block-${index}`}
            sx={{
              width: `${100 / numBlocks - 2}%`,
              aspectRatio: '1/1.5',
              backgroundColor: color,
              borderRadius: 1,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        ))}
      </Box>
      
      <Typography variant="caption" color="text.secondary" align="center">
        Esta secuencia de colores es única para tu contraseña
      </Typography>
    </Box>
  );
};

// Componente principal que integra todos los patrones
const VisualPattern = ({ password }) => {
  const [tabValue, setTabValue] = React.useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden' }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        aria-label="Tipos de patrones visuales"
      >
        <Tab icon={<GridIcon />} label="Cuadrícula" id="tab-0" aria-controls="tabpanel-0" />
        <Tab icon={<TimelineIcon />} label="Secuencia" id="tab-1" aria-controls="tabpanel-1" />
        <Tab icon={<FingerprintIcon />} label="Huella" id="tab-2" aria-controls="tabpanel-2" />
      </Tabs>
      
      <Box sx={{ p: 2 }}>
        <div
          role="tabpanel"
          hidden={tabValue !== 0}
          id={`tabpanel-0`}
          aria-labelledby={`tab-0`}
        >
          {tabValue === 0 && <GridPattern password={password} />}
        </div>
        
        <div
          role="tabpanel"
          hidden={tabValue !== 1}
          id={`tabpanel-1`}
          aria-labelledby={`tab-1`}
        >
          {tabValue === 1 && <SequencePattern password={password} />}
        </div>
        
        <div
          role="tabpanel"
          hidden={tabValue !== 2}
          id={`tabpanel-2`}
          aria-labelledby={`tab-2`}
        >
          {tabValue === 2 && <VisualFingerprint password={password} />}
        </div>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 2, display: 'block' }}>
        Esta representación visual te ayuda a identificar y recordar mejor tu contraseña. El mismo patrón siempre representa la misma contraseña.
      </Typography>
    </Paper>
  );
};

export default VisualPattern; 