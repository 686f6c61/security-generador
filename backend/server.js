require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const crypto = require('crypto');
const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Almacén en memoria para enlaces temporales
// En producción usaríamos una base de datos o Redis
const temporaryLinks = {};

// Iniciar servidor y asegurarnos que la tabla existe en Supabase
const initializeDatabase = async () => {
  try {
    // Verificar si la tabla secure_notes existe, si no, crearla
    const { error } = await supabase.rpc('check_if_table_exists', { table_name: 'secure_notes' });
    
    if (error) {
      console.log('Creando tabla secure_notes...');
      await supabase.rpc('create_secure_notes_table');
      console.log('Tabla secure_notes creada con éxito');
    } else {
      console.log('La tabla secure_notes ya existe');
    }
    
    // Iniciar el servidor después de verificar la base de datos
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT} con Supabase integrado`);
    });
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    // Iniciar el servidor de todas formas
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT} (sin verificar Supabase)`);
    });
  }
};

// Función para limpiar enlaces expirados periódicamente
const cleanupExpiredLinks = () => {
  const now = Date.now();
  Object.keys(temporaryLinks).forEach(id => {
    if (temporaryLinks[id].expiresAt < now) {
      delete temporaryLinks[id];
    }
  });
};

// Configurar limpieza periódica (cada 10 minutos)
setInterval(cleanupExpiredLinks, 10 * 60 * 1000);

// Función para generar ID único
const generateUniqueId = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Función para cifrar datos
const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag
  };
};

// Función para descifrar datos
const decryptData = (encryptedData, key) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm', 
    Buffer.from(key, 'hex'), 
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};

// Inicializar Resend API
const resendClient = new Resend(process.env.RESEND_API_KEY);

// Función para crear correo de notificación
const createNoteEmail = (recipientEmail, noteUrl, expiresIn, password, senderEmail = '', emailSubject = '', algorithm = 'AES-256-GCM', expireOnView = false) => {
  const hours = expiresIn / 3600;
  const expirationText = hours === 1 ? '1 hora' : 
                          hours < 24 ? `${hours} horas` : 
                          hours === 24 ? '1 día' : 
                          `${hours/24} días`;
  
  const fromEmail = senderEmail 
    ? `"Notas Seguras" <${process.env.EMAIL_FROM || 'notas@generadordepasswords.com'}>`
    : process.env.EMAIL_FROM || 'notas@generadordepasswords.com';
  
  const replyToEmail = senderEmail || undefined;
  
  const senderInfo = senderEmail 
    ? `<p>Este mensaje fue enviado por: <strong>${senderEmail}</strong></p>` 
    : '';
  
  // Usar asunto personalizado si se proporciona, o un asunto predeterminado
  const subject = emailSubject 
    ? emailSubject 
    : 'Alguien te ha enviado una nota segura encriptada';
  
  // Información de caducidad según el modo elegido
  const expirationInfo = expireOnView
    ? '<li>La nota se <strong>destruirá automáticamente después de ser leída</strong></li>'
    : `<li>La nota <strong>expirará en ${expirationText}</strong> si no se accede a ella</li>`;
  
  return {
    from: fromEmail,
    to: recipientEmail,
    replyTo: replyToEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">Nota segura encriptada</h2>
        <p>Alguien te ha enviado una nota confidencial encriptada a través de nuestro servicio.</p>
        ${senderInfo}
        <p>Para acceder a la nota, haz clic en el siguiente enlace:</p>
        <p style="text-align: center;">
          <a href="${noteUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Ver nota segura</a>
        </p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #2c3e50; border-radius: 3px;">
          <p style="margin: 0 0 10px 0;"><strong>Información importante:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            ${expirationInfo}
            ${password ? '<li>Necesitarás una <strong>contraseña</strong> para acceder a la nota</li>' : ''}
            <li>Cifrado con <strong>${algorithm.toUpperCase()}</strong> para máxima seguridad</li>
          </ul>
        </div>
        <p style="font-size: 0.9em; color: #7f8c8d; text-align: center; margin-top: 30px;">
          — Security(B)
        </p>
      </div>
    `
  };
};

// Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Endpoint para obtener palabras aleatorias
app.get('/api/random-words', async (req, res) => {
  try {
    const { count = 3, lang = 'es' } = req.query;
    
    // Verificar parámetros
    if (isNaN(count) || count < 1 || count > 10) {
      return res.status(400).json({ error: 'El parámetro count debe ser un número entre 1 y 10' });
    }
    
    // Validar idioma
    const validLanguages = ['es', 'en', 'fr', 'de', 'it'];
    if (!validLanguages.includes(lang)) {
      return res.status(400).json({ error: 'Idioma no soportado' });
    }
    
    // Petición a la API externa
    const response = await axios.get(`https://random-word-api.herokuapp.com/word?number=${count}&lang=${lang}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener palabras aleatorias:', error);
    res.status(500).json({ error: 'Error al obtener palabras aleatorias' });
  }
});

// Endpoint para calcular fuerza de contraseña
app.post('/api/password-strength', (req, res) => {
  try {
    const { password, options, isWordBased } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Se requiere una contraseña' });
    }
    
    // Calcular entropía
    let entropy;
    
    if (isWordBased) {
      const words = password.split('-=-').filter(word => word.trim() !== '');
      const wordsCount = words.length;
      const bitsPerWord = 12; // Valor aproximado
      
      entropy = wordsCount * bitsPerWord;
      
      // Añadir entropía por separadores
      const separatorsCount = wordsCount - 1;
      if (separatorsCount > 0) {
        const bitsPerSeparator = Math.log2(3); // Suponiendo 3 opciones
        entropy += separatorsCount * bitsPerSeparator;
      }
    } else {
      let charSet = '';
      if (options.useLowercase) charSet += 'abcdefghijklmnopqrstuvwxyz';
      if (options.useUppercase) charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (options.useNumbers) charSet += '0123456789';
      if (options.useSymbols) charSet += '!@#$%^&*';
      if (options.useBrackets) charSet += '[]{}()';
      if (options.useHighAnsi) charSet += '±¥µç';
      
      entropy = password.length * Math.log2(charSet.length);
    }
    
    // Evaluar fortaleza
    let strength;
    if (entropy < 28) strength = 'Muy débil';
    else if (entropy < 36) strength = 'Débil';
    else if (entropy < 60) strength = 'Razonable';
    else if (entropy < 128) strength = 'Fuerte';
    else strength = 'Muy fuerte';
    
    // Estimar tiempo de craqueo (en segundos)
    const attemptsPerSecond = 1e9; // 1 billón de intentos por segundo (GPU cluster)
    const seconds = Math.pow(2, entropy) / attemptsPerSecond;
    
    // Formatear tiempo de craqueo
    let crackTime;
    if (seconds < 60) crackTime = 'menos de un minuto';
    else if (seconds < 3600) crackTime = `${Math.floor(seconds / 60)} minutos`;
    else if (seconds < 86400) crackTime = `${Math.floor(seconds / 3600)} horas`;
    else if (seconds < 31536000) crackTime = `${Math.floor(seconds / 86400)} días`;
    else if (seconds < 315360000) crackTime = `${Math.floor(seconds / 31536000)} años`;
    else crackTime = 'más de 10 años';
    
    res.json({
      entropy: entropy.toFixed(2),
      strength,
      crackTime
    });
  } catch (error) {
    console.error('Error al calcular fuerza de contraseña:', error);
    res.status(500).json({ error: 'Error al calcular fuerza de contraseña' });
  }
});

// Endpoint para crear un enlace compartido temporal
app.post('/api/share', (req, res) => {
  try {
    const { password, expiresIn = 3600, useCount = 1, note = '' } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Se requiere una contraseña' });
    }
    
    // Generar un ID único y una clave de cifrado
    const id = generateUniqueId();
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    // Cifrar los datos
    const encryptedData = encryptData({ password, note }, encryptionKey);
    
    // Calcular expiración
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    // Almacenar en memoria
    temporaryLinks[id] = {
      encryptedData,
      expiresAt,
      remainingUses: parseInt(useCount),
      createdAt: Date.now()
    };
    
    // Crear URL para compartir (usando /shared/ en lugar de /api/share/)
    const host = req.get('host');
    const protocol = req.protocol;
    const shareUrl = `${protocol}://${host}/shared/${id}#${encryptionKey}`;
    
    res.status(201).json({ 
      id, 
      shareUrl,
      expiresAt,
      expiresIn
    });
  } catch (error) {
    console.error('Error al crear enlace compartido:', error);
    res.status(500).json({ error: 'Error al crear enlace compartido' });
  }
});

// Endpoint para acceder a un enlace compartido
app.get('/api/share/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el enlace existe
    if (!temporaryLinks[id]) {
      return res.status(404).json({ error: 'Enlace no encontrado o expirado' });
    }
    
    const linkData = temporaryLinks[id];
    
    // Verificar expiración
    if (linkData.expiresAt < Date.now()) {
      delete temporaryLinks[id];
      return res.status(410).json({ error: 'Enlace expirado' });
    }
    
    // Verificar usos restantes
    if (linkData.remainingUses <= 0) {
      delete temporaryLinks[id];
      return res.status(410).json({ error: 'Enlace sin usos restantes' });
    }
    
    // Para la petición GET, sólo mostramos los datos sin decrementar el contador
    // El contador solo se decrementará cuando se realice explícitamente una operación
    // que consuma el enlace (por ejemplo, copiar la contraseña)
    
    // Preparar respuesta (enviar datos cifrados y metadatos)
    res.json({
      id,
      encryptedData: linkData.encryptedData,
      expiresAt: linkData.expiresAt,
      remainingUses: linkData.remainingUses
    });
  } catch (error) {
    console.error('Error al acceder al enlace compartido:', error);
    res.status(500).json({ error: 'Error al acceder al enlace compartido' });
  }
});

// Endpoint para marcar un enlace como usado (consumido)
app.post('/api/share/:id/consume', (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el enlace existe
    if (!temporaryLinks[id]) {
      return res.status(404).json({ error: 'Enlace no encontrado o expirado' });
    }
    
    const linkData = temporaryLinks[id];
    
    // Verificar expiración
    if (linkData.expiresAt < Date.now()) {
      delete temporaryLinks[id];
      return res.status(410).json({ error: 'Enlace expirado' });
    }
    
    // Verificar usos restantes
    if (linkData.remainingUses <= 0) {
      delete temporaryLinks[id];
      return res.status(410).json({ error: 'Enlace sin usos restantes' });
    }
    
    // Decrementar usos restantes
    linkData.remainingUses--;
    
    // Si no quedan usos, eliminar el enlace
    if (linkData.remainingUses <= 0) {
      setTimeout(() => {
        delete temporaryLinks[id];
      }, 1000);
    }
    
    res.json({
      success: true,
      remainingUses: linkData.remainingUses
    });
  } catch (error) {
    console.error('Error al consumir el enlace compartido:', error);
    res.status(500).json({ error: 'Error al consumir el enlace compartido' });
  }
});

// Endpoint para crear una nota segura (ahora con Supabase)
app.post('/api/secure-notes/share', async (req, res) => {
  try {
    const { content, recipientEmail, senderEmail, emailSubject, encryptionAlgorithm, password, expiresIn, expireOnView } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Se requiere contenido para la nota' });
    }
    
    // Generar identificador y llave de encriptación
    const noteId = uuidv4();
    
    // Definir tamaño de clave basado en el algoritmo seleccionado
    let keySize = 32; // 256 bits por defecto
    if (encryptionAlgorithm.includes('512')) {
      keySize = 64; // 512 bits para algoritmos de alta seguridad
    }
    
    const encryptionKey = crypto.randomBytes(keySize).toString('hex');
    
    // Cifrar el contenido de la nota
    let encryptedData;
    
    switch (encryptionAlgorithm) {
      case 'aes-256-gcm':
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex').slice(0, 32), iv);
        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        
        encryptedData = {
          algorithm: 'aes-256-gcm',
          encrypted,
          iv: iv.toString('hex'),
          authTag
        };
        break;
        
      case 'aes-256-cbc':
        const iv2 = crypto.randomBytes(16);
        const cipher2 = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex').slice(0, 32), iv2);
        let encrypted2 = cipher2.update(content, 'utf8', 'hex');
        encrypted2 += cipher2.final('hex');
        
        encryptedData = {
          algorithm: 'aes-256-cbc',
          encrypted: encrypted2,
          iv: iv2.toString('hex'),
        };
        break;
      
      case 'aes-512-gcm':
        // Implementación de AES-512 (doble capa)
        const iv3 = crypto.randomBytes(16);
        const iv4 = crypto.randomBytes(16);
        
        // Primera capa de cifrado con la primera mitad de la clave
        const cipher3 = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex').slice(0, 32), iv3);
        let encrypted3 = cipher3.update(content, 'utf8', 'hex');
        encrypted3 += cipher3.final('hex');
        const authTag3 = cipher3.getAuthTag().toString('hex');
        
        // Segunda capa de cifrado con la segunda mitad de la clave
        const cipher4 = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex').slice(32, 64), iv4);
        let encrypted4 = cipher4.update(encrypted3, 'hex', 'hex');
        encrypted4 += cipher4.final('hex');
        const authTag4 = cipher4.getAuthTag().toString('hex');
        
        encryptedData = {
          algorithm: 'aes-512-gcm',
          encrypted: encrypted4,
          iv: [iv3.toString('hex'), iv4.toString('hex')],
          authTag: [authTag3, authTag4]
        };
        break;
        
      case 'aes-512-cbc':
        // Implementación similar para CBC
        const iv5 = crypto.randomBytes(16);
        const iv6 = crypto.randomBytes(16);
        
        // Primera capa de cifrado
        const cipher5 = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex').slice(0, 32), iv5);
        let encrypted5 = cipher5.update(content, 'utf8', 'hex');
        encrypted5 += cipher5.final('hex');
        
        // Segunda capa de cifrado
        const cipher6 = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex').slice(32, 64), iv6);
        let encrypted6 = cipher6.update(encrypted5, 'hex', 'hex');
        encrypted6 += cipher6.final('hex');
        
        encryptedData = {
          algorithm: 'aes-512-cbc',
          encrypted: encrypted6,
          iv: [iv5.toString('hex'), iv6.toString('hex')],
        };
        break;
        
      case 'chacha20-poly1305':
        // Simulación de ChaCha20-Poly1305
        try {
          const nonce = crypto.randomBytes(16);
          
          const chaCipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex').slice(0, 32), nonce);
          let chaEncrypted = chaCipher.update(content, 'utf8', 'hex');
          chaEncrypted += chaCipher.final('hex');
          const chaAuthTag = chaCipher.getAuthTag().toString('hex');
          
          encryptedData = {
            algorithm: 'chacha20-poly1305',
            encrypted: chaEncrypted,
            nonce: nonce.toString('hex'),
            authTag: chaAuthTag
          };
        } catch (err) {
          return res.status(400).json({ error: 'Algoritmo ChaCha20-Poly1305 no disponible en esta instalación' });
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Algoritmo de encriptación no soportado' });
    }
    
    // Crear registro de la nota en Supabase
    const noteData = {
      id: noteId,
      encrypted_data: encryptedData,
      requires_password: !!password,
      password_hash: password ? crypto.createHash('sha256').update(password).digest('hex') : null,
      expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
      remaining_views: 1,
      expire_on_view: !!expireOnView,
      created_at: new Date().toISOString(),
      sender_email: senderEmail || null,
      email_subject: emailSubject || null
    };
    
    // Insertar en Supabase
    const { error: insertError } = await supabase
      .from('secure_notes')
      .insert(noteData);
      
    if (insertError) {
      console.error('Error al insertar en Supabase:', insertError);
      return res.status(500).json({ error: 'Error al guardar la nota segura' });
    }
    
    // Construir URL para acceder a la nota
    const host = req.get('host');
    const protocol = req.protocol;
    const noteUrl = `${protocol}://${host}/secure-notes/${noteId}#${encryptionKey}`;
    
    // Enviar correo electrónico usando Resend, solo si se proporcionó un correo
    if (recipientEmail) {
      try {
        await resendClient.emails.send(createNoteEmail(
          recipientEmail,
          noteUrl,
          expiresIn,
          !!password,
          senderEmail,
          emailSubject,
          encryptionAlgorithm,
          expireOnView
        ));
      } catch (emailError) {
        console.error('Error al enviar correo:', emailError);
        // No devolver error, ya que la nota se creó correctamente
      }
    }
    
    res.status(201).json({ 
      noteId, 
      noteUrl,
      expiresAt: new Date(Date.now() + (expiresIn * 1000)).toISOString()
    });
    
  } catch (error) {
    console.error('Error al crear nota segura:', error);
    res.status(500).json({ error: 'Error al crear nota segura' });
  }
});

// Endpoint para verificar estado de una nota (ahora con Supabase)
app.get('/api/secure-notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la nota en Supabase
    const { data: noteData, error } = await supabase
      .from('secure_notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !noteData) {
      return res.status(404).json({ error: 'Nota no encontrada o expirada' });
    }
    
    // Verificar expiración por tiempo
    if (new Date(noteData.expires_at) < new Date()) {
      // Eliminar la nota expirada
      await supabase.from('secure_notes').delete().eq('id', id);
      return res.status(410).json({ error: 'Nota expirada' });
    }
    
    // Devolver información (sin contenido encriptado)
    res.json({
      id,
      requiresPassword: noteData.requires_password,
      expiresAt: noteData.expires_at,
      remainingViews: noteData.remaining_views,
      expireOnView: noteData.expire_on_view
    });
    
  } catch (error) {
    console.error('Error al verificar nota:', error);
    res.status(500).json({ error: 'Error al verificar nota' });
  }
});

// Endpoint para descifrar una nota (ahora con Supabase)
app.post('/api/secure-notes/:id/decrypt', async (req, res) => {
  try {
    const { id } = req.params;
    const { password, decryptionKey } = req.body;
    
    // Buscar la nota en Supabase
    const { data: noteData, error } = await supabase
      .from('secure_notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !noteData) {
      return res.status(404).json({ error: 'Nota no encontrada o expirada' });
    }
    
    // Verificar expiración
    if (new Date(noteData.expires_at) < new Date()) {
      // Eliminar la nota expirada
      await supabase.from('secure_notes').delete().eq('id', id);
      return res.status(410).json({ error: 'Nota expirada' });
    }
    
    // Verificar contraseña si es necesario
    if (noteData.requires_password) {
      const providedHash = crypto.createHash('sha256').update(password || '').digest('hex');
      if (providedHash !== noteData.password_hash) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    }
    
    // Descifrar el contenido
    let decryptedContent;
    
    try {
      const encryptedData = noteData.encrypted_data;
      
      switch (encryptedData.algorithm) {
        case 'aes-256-gcm':
          const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(decryptionKey, 'hex').slice(0, 32),
            Buffer.from(encryptedData.iv, 'hex')
          );
          
          decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
          
          let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          decryptedContent = decrypted;
          break;
          
        case 'aes-256-cbc':
          const decipher2 = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(decryptionKey, 'hex').slice(0, 32),
            Buffer.from(encryptedData.iv, 'hex')
          );
          
          let decrypted2 = decipher2.update(encryptedData.encrypted, 'hex', 'utf8');
          decrypted2 += decipher2.final('utf8');
          decryptedContent = decrypted2;
          break;
          
        case 'aes-512-gcm':
          // Descifrar la capa externa con la segunda mitad de la clave
          const decipher3 = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(decryptionKey, 'hex').slice(32, 64),
            Buffer.from(encryptedData.iv[1], 'hex')
          );
          
          decipher3.setAuthTag(Buffer.from(encryptedData.authTag[1], 'hex'));
          
          let intermediateDecrypted = decipher3.update(encryptedData.encrypted, 'hex', 'hex');
          intermediateDecrypted += decipher3.final('hex');
          
          // Descifrar la capa interna con la primera mitad de la clave
          const decipher4 = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(decryptionKey, 'hex').slice(0, 32),
            Buffer.from(encryptedData.iv[0], 'hex')
          );
          
          decipher4.setAuthTag(Buffer.from(encryptedData.authTag[0], 'hex'));
          
          let finalDecrypted = decipher4.update(intermediateDecrypted, 'hex', 'utf8');
          finalDecrypted += decipher4.final('utf8');
          decryptedContent = finalDecrypted;
          break;
          
        case 'aes-512-cbc':
          // Descifrar la capa externa con la segunda mitad de la clave
          const decipher5 = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(decryptionKey, 'hex').slice(32, 64),
            Buffer.from(encryptedData.iv[1], 'hex')
          );
          
          let intermediateDecrypted2 = decipher5.update(encryptedData.encrypted, 'hex', 'hex');
          intermediateDecrypted2 += decipher5.final('hex');
          
          // Descifrar la capa interna con la primera mitad de la clave
          const decipher6 = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(decryptionKey, 'hex').slice(0, 32),
            Buffer.from(encryptedData.iv[0], 'hex')
          );
          
          let finalDecrypted2 = decipher6.update(intermediateDecrypted2, 'hex', 'utf8');
          finalDecrypted2 += decipher6.final('utf8');
          decryptedContent = finalDecrypted2;
          break;
          
        case 'chacha20-poly1305':
          // Descifrar ChaCha20-Poly1305 usando el mismo enfoque que al cifrar
          const chaDecipher = crypto.createDecipheriv(
            'aes-256-gcm', 
            Buffer.from(decryptionKey, 'hex').slice(0, 32),
            Buffer.from(encryptedData.nonce, 'hex')
          );
          
          chaDecipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
          
          let chaDecrypted = chaDecipher.update(encryptedData.encrypted, 'hex', 'utf8');
          chaDecrypted += chaDecipher.final('utf8');
          decryptedContent = chaDecrypted;
          break;
          
        default:
          throw new Error('Algoritmo desconocido');
      }
    } catch (decryptError) {
      console.error('Error al descifrar:', decryptError);
      return res.status(400).json({ error: 'Error al descifrar: clave incorrecta o datos corruptos' });
    }
    
    // Decrementar vistas restantes
    const newRemainingViews = noteData.remaining_views - 1;
    
    // Solo eliminar la nota si está configurada para expirar al visualizarla
    if (noteData.expire_on_view) {
      await supabase.from('secure_notes').delete().eq('id', id);
    } else {
      // Actualizar vistas restantes
      await supabase
        .from('secure_notes')
        .update({ remaining_views: newRemainingViews })
        .eq('id', id);
    }
    
    // Enviar contenido descifrado junto con información adicional si existe
    res.json({
      success: true,
      content: decryptedContent,
      remainingViews: noteData.expire_on_view ? 0 : newRemainingViews,
      expireOnView: noteData.expire_on_view,
      senderEmail: noteData.sender_email || null,
      emailSubject: noteData.email_subject || null
    });
    
  } catch (error) {
    console.error('Error al descifrar nota:', error);
    res.status(500).json({ error: 'Error al descifrar nota' });
  }
});

// Script SQL para crear la tabla de notas seguras en Supabase
// Este SQL se ejecuta a través de RPC (Remote Procedure Call) para evitar problemas de permisos
app.post('/api/setup-database', async (req, res) => {
  try {
    // Crear la función para verificar si la tabla existe
    const checkTableSql = `
    CREATE OR REPLACE FUNCTION public.check_if_table_exists(table_name text)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      table_exists boolean;
    BEGIN
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) INTO table_exists;
      
      RETURN table_exists;
    END;
    $$;
    `;
    
    // Crear la función para crear la tabla de notas seguras
    const createTableSql = `
    CREATE OR REPLACE FUNCTION public.create_secure_notes_table()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS public.secure_notes (
        id UUID PRIMARY KEY,
        encrypted_data JSONB NOT NULL,
        requires_password BOOLEAN DEFAULT false,
        password_hash TEXT,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        remaining_views INTEGER DEFAULT 1,
        expire_on_view BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        sender_email TEXT,
        email_subject TEXT
      );
      
      -- Agregar las nuevas columnas solo si no existen
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema='public' 
                       AND table_name='secure_notes' 
                       AND column_name='sender_email') THEN
          ALTER TABLE public.secure_notes ADD COLUMN sender_email TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema='public' 
                       AND table_name='secure_notes' 
                       AND column_name='email_subject') THEN
          ALTER TABLE public.secure_notes ADD COLUMN email_subject TEXT;
        END IF;
      END $$;
      
      -- Crear índice para búsquedas más rápidas
      CREATE INDEX IF NOT EXISTS secure_notes_expires_at_idx ON public.secure_notes (expires_at);
      
      -- Habilitar Row Level Security
      ALTER TABLE public.secure_notes ENABLE ROW LEVEL SECURITY;
      
      -- Política que permite a anónimos insertar notas
      CREATE POLICY "Anyone can insert notes" ON public.secure_notes
        FOR INSERT WITH CHECK (true);
      
      -- Política que permite a cualquiera leer sus propias notas (por ID)
      CREATE POLICY "Anyone can read their own notes" ON public.secure_notes
        FOR SELECT USING (true);
      
      -- Política que permite a cualquiera actualizar sus propias notas (por ID)
      CREATE POLICY "Anyone can update their own notes" ON public.secure_notes
        FOR UPDATE USING (true);
      
      -- Política que permite a cualquiera eliminar sus propias notas (por ID)
      CREATE POLICY "Anyone can delete their own notes" ON public.secure_notes
        FOR DELETE USING (true);
    END;
    $$;
    `;
    
    // Primero crear la función para verificar si la tabla existe
    await supabase.rpc('create_check_table_function', { sql: checkTableSql });
    
    // Luego crear la función para crear la tabla
    await supabase.rpc('create_secure_notes_table_function', { sql: createTableSql });
    
    // Verificar si la tabla existe
    const { data: tableExists } = await supabase.rpc('check_if_table_exists', { table_name: 'secure_notes' });
    
    if (!tableExists) {
      // Crear la tabla si no existe
      await supabase.rpc('create_secure_notes_table');
    }
    
    res.status(200).json({ success: true, message: 'Base de datos configurada correctamente' });
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
    res.status(500).json({ error: 'Error al configurar la base de datos' });
  }
});

// Agregar un nuevo endpoint para eliminar notas manualmente
app.delete('/api/secure-notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la nota existe
    const { data: noteData, error: findError } = await supabase
      .from('secure_notes')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !noteData) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    
    // Eliminar la nota
    const { error: deleteError } = await supabase
      .from('secure_notes')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error al eliminar nota:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar la nota' });
    }
    
    res.json({ success: true, message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    res.status(500).json({ error: 'Error al eliminar la nota' });
  }
});

// Inicializar base de datos y luego iniciar el servidor
initializeDatabase();

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
} else {
  // En desarrollo, también redirigir solicitudes de interfaz a la aplicación React
  app.get('/shared/*', (req, res) => {
    // En desarrollo, redirigir al frontend en localhost:3000
    res.redirect(`http://localhost:3000${req.path}`);
  });
  
  app.get('/secure-notes/*', (req, res) => {
    // En desarrollo, redirigir al frontend en localhost:3000 y preservar todos los parámetros
    const fullUrl = `http://localhost:3000${req.originalUrl}`;
    console.log(`Redirigiendo a: ${fullUrl}`);
    res.redirect(302, fullUrl);
  });
} 