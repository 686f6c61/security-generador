import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PasswordGenerator from './components/PasswordGenerator';
import EntropyExplanation from './components/EntropyExplanation';
import BruteForceExplanation from './components/BruteForceExplanation';
import PasswordTips from './components/PasswordTips';
import AccessSharedPassword from './components/AccessSharedPassword';
import GiphyPasswordGenerator from './components/GiphyPasswordGenerator';
import SecureNoteSharing from './components/SecureNoteSharing';
import AccessSecureNote from './components/AccessSecureNote';

function App() {
  const { theme } = useTheme();

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header />
      <main style={{ flex: 1, padding: '20px 0' }}>
        <Routes>
          <Route path="/" element={<PasswordGenerator />} />
          <Route path="/entropia" element={<EntropyExplanation />} />
          <Route path="/fuerza-bruta" element={<BruteForceExplanation />} />
          <Route path="/consejos" element={<PasswordTips />} />
          <Route path="/shared/:id" element={<AccessSharedPassword />} />
          <Route path="/giphy-generator" element={<GiphyPasswordGenerator />} />
          
          {/* Nuevas rutas para notas seguras */}
          <Route path="/secure-notes" element={<SecureNoteSharing />} />
          <Route path="/secure-notes/:id" element={<AccessSecureNote />} />
          
          {/* Redirigir /api/share/:id a /shared/:id para manejar URLs de API */}
          <Route path="/api/share/:id" element={<Navigate replace to={window.location.pathname.replace('/api/share', '/shared') + window.location.hash} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App; 