# Security(B) - Suite de Seguridad Digital

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Giphy-FF6666?style=for-the-badge&logo=giphy&logoColor=white" alt="Giphy"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios"/>
  <img src="https://img.shields.io/badge/Crypto-0078D7?style=for-the-badge&logo=crypto&logoColor=white" alt="Crypto"/>
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm"/>
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"/>
</div>

Security(B) es una suite completa de herramientas de seguridad digital implementada con React y Material UI en el frontend y Node.js con Express en el backend. La plataforma ofrece múltiples servicios de seguridad integrados:

<div align="center">
  <img src="public/img/home.png" alt="Página principal del generador de contraseñas" width="800"/>
  <p><em>Página principal de Security(B) - generadordepasswords.com</em></p>
</div>

- **Generador avanzado de contraseñas seguras**: Crea contraseñas complejas y personalizadas con entropía medible
- **Sistema de notas seguras encriptadas**: Comparte información confidencial con cifrado de extremo a extremo
- **Generador interactivo con GIFs**: Función especial que utiliza la interacción con GIFs para crear contraseñas únicas
- **Medición de entropía y seguridad**: Análisis en tiempo real de la fortaleza de contraseñas

Todas las operaciones de encriptación utilizan algoritmos de nivel militar (AES-256-GCM, AES-512) y están diseñadas siguiendo las mejores prácticas de seguridad.

## Entropía y seguridad de contraseñas

La **entropía** es una medida matemática de la aleatoriedad o imprevisibilidad de una contraseña. En criptografía, se expresa en bits y es crucial para evaluar la resistencia de una contraseña contra ataques de fuerza bruta.

### Fórmula de entropía

La entropía de una contraseña se calcula mediante la siguiente fórmula:

```
Entropía = L × log₂(R)
```

Donde:
- **L** = Longitud de la contraseña (número de caracteres)
- **R** = Rango de caracteres posibles (tamaño del conjunto)
- **log₂** = Logaritmo en base 2

Por ejemplo, para una contraseña de 14 caracteres usando letras minúsculas (26), mayúsculas (26), números (10) y símbolos especiales (32):
```
Entropía = 14 × log₂(94) ≈ 14 × 6.55 ≈ 91.7 bits
```

### Niveles de seguridad según la entropía

| Nivel | Rango de entropía | Tiempo de crackeo* | Recomendación |
|-------|-------------------|-------------------|---------------|
| **Muy débil** | < 28 bits | Segundos a minutos | Nunca usar para cuentas importantes |
| **Débil** | 28-35 bits | Minutos a horas | Insuficiente para la mayoría de propósitos |
| **Razonable** | 36-59 bits | Días a meses | Aceptable para cuentas de bajo riesgo |
| **Fuerte** | 60-127 bits | Años a décadas | Recomendado para cuentas importantes |
| **Muy fuerte** | ≥ 128 bits | Siglos o más | Ideal para información crítica o sensible |

_*Estimado con hardware moderno (≈1 billón de intentos/segundo)_

### Comparación de tipos de contraseñas

- **Contraseña simple (8 caracteres, solo minúsculas):** 
  - 8 × log₂(26) ≈ 37.6 bits → **Razonable**
  
- **Contraseña de 14 caracteres (minúsculas, mayúsculas, números):**
  - 14 × log₂(62) ≈ 83.4 bits → **Fuerte**
  
- **Contraseña de 4 palabras aleatorias separadas:**
  - Usando diccionario de 8000 palabras: log₂(8000⁴) ≈ 52 bits → **Razonable**

## Generador de Contraseñas Tradicional

El generador de contraseñas tradicional permite crear contraseñas altamente seguras y personalizables con múltiples opciones.

<div align="center">
  <img src="public/img/generador-passswords.png" alt="Generador de contraseñas tradicional" width="800"/>
  <p><em>Generador de contraseñas tradicional con opciones avanzadas de configuración</em></p>
</div>

### Características principales:
- Generación de contraseñas basadas en movimientos del ratón para mayor aleatoriedad
- Longitud personalizable (14-100 caracteres)
- Inclusión configurable de minúsculas, mayúsculas, números, símbolos, brackets y caracteres high ANSI
- Opción para generar contraseñas basadas en palabras aleatorias
- Evaluación en tiempo real de la fortaleza de la contraseña
- Cálculo de entropía y tiempo estimado de crackeo

## Generador con GIFs - Entropía Amazing

Nuestro innovador método "Entropía Amazing" amplía el concepto tradicional de entropía incorporando fuentes únicas de aleatoriedad a través de la interacción con GIFs.

<div align="center">
  <img src="public/img/gif-password.png" alt="Generador basado en GIFs" width="800"/>
  <p><em>Generador innovador basado en GIFs con la API de Giphy</em></p>
</div>

Esta técnica proporciona una capa adicional de seguridad y es especialmente resistente a ataques basados en diccionarios o patrones, ya que incorpora elementos biométricos indirectos (patrones de movimiento del ratón) y preferencias personales.

### Fórmula de entropía Amazing

La entropía total cuando se usa el generador basado en GIFs se calcula mediante:

```
Entropía Amazing = E_gif + E_interact + E_mouse + E_time
```

Donde:
- **E_gif**: Entropía derivada de los GIFs seleccionados (≈ 10 bits por GIF)
- **E_interact**: Entropía de las interacciones del usuario (me gusta/no me gusta)
- **E_mouse**: Entropía de los movimientos del ratón
- **E_time**: Entropía basada en timestamps

### Funcionamiento:
1. Introduce un término de búsqueda para encontrar GIFs
2. Interactúa con los GIFs (me gusta/no me gusta)
3. El sistema captura estos datos más los movimientos del ratón
4. Se genera una contraseña única con entropía significativamente mayor que los métodos tradicionales

## Sistema de Notas Seguras Encriptadas

El sistema de notas seguras permite compartir información confidencial con cifrado de extremo a extremo.

<div align="center">
  <img src="public/img/notas.png" alt="Sistema de notas seguras" width="800"/>
  <p><em>Sistema de notas seguras encriptadas con protección avanzada</em></p>
</div>

### Características principales:
- Cifrado de extremo a extremo mediante algoritmos avanzados
- Múltiples algoritmos disponibles (AES-256-GCM, AES-256-CBC, AES-512-GCM, AES-512-CBC, ChaCha20-Poly1305)
- Protección opcional con contraseña adicional
- Opción de auto-destrucción tras lectura
- Expiración configurable por tiempo

### Opciones de configuración para compartir notas:

<div align="center">
  <img src="public/img/share.png" alt="Compartir notas seguras" width="800"/>
  <p><em>Configuración de opciones para compartir notas seguras</em></p>
</div>

### Notificación por correo electrónico:

<div align="center">
  <img src="public/img/mail.png" alt="Notificación por correo" width="800"/>
  <p><em>Notificación por correo electrónico con enlace a la nota segura</em></p>
</div>

## Características generales de la plataforma

- **Interfaz de usuario intuitiva** con botones y chips para seleccionar opciones
- **Notificaciones visuales** para confirmación de acciones
- **Diseño responsivo** utilizando Material UI
- **Tema claro/oscuro** para mejorar la experiencia de usuario
- **Soporte para múltiples idiomas** (inglés, español)

## Estructura del proyecto

El proyecto está organizado en una arquitectura moderna con React en el frontend y Node.js/Express en el backend:

```
Security(B)/
├── public/                            # Archivos públicos
│   └── img/                           # Imágenes para el README
├── src/                               # Código fuente
│   ├── components/                    # Componentes React
│   │   ├── PasswordGenerator.js       # Generador principal
│   │   ├── GiphyPasswordGenerator.js  # Generador basado en GIFs
│   │   ├── SecureNoteSharing.js       # Creador de notas seguras
│   │   ├── AccessSecureNote.js        # Visualizador de notas seguras
│   │   └── ...                        # Otros componentes
│   ├── contexts/                      # Contextos de React
│   ├── hooks/                         # Hooks personalizados
│   ├── utils/                         # Utilidades y funciones
│   ├── App.js                         # Componente principal
│   └── index.js                       # Punto de entrada
├── backend/                           # Backend en Node.js
│   ├── server.js                      # Servidor Express
│   └── package.json                   # Dependencias backend
├── package.json                       # Dependencias frontend
└── manage.sh                          # Script para gestionar la aplicación
```

### Frontend

El frontend está desarrollado con React y Material UI, proporcionando una interfaz moderna e intuitiva:

- **`components/`**: Contiene todos los componentes React:
  - **`PasswordGenerator.js`**: Generador tradicional de contraseñas.
  - **`GiphyPasswordGenerator.js`**: Innovador generador que usa la API de Giphy.
  - **`SecureNoteSharing.js`**: Componente para crear y enviar notas seguras encriptadas.
  - **`AccessSecureNote.js`**: Componente para acceder y descifrar notas seguras.
  - **`EntropyExplanation.js`**: Explica el concepto de entropía.
  - **`BruteForceExplanation.js`**: Explica los ataques de fuerza bruta.

- **`contexts/`**: Contextos de React para gestionar estados globales como temas.

- **`hooks/`**: Hooks personalizados:
  - **`usePasswordGenerator`**: Lógica para generar contraseñas.

- **`utils/`**: Funciones utilitarias:
  - **`passwordGenerator.js`**: Algoritmos de generación de contraseñas.

### Backend

El backend proporciona servicios y APIs necesarios para la aplicación:

- **`server.js`**: Servidor Express con endpoints para:
  - Evaluar la fortaleza de contraseñas
  - Compartir contraseñas temporalmente
  - Obtener palabras aleatorias para contraseñas basadas en palabras
  - Gestionar notas seguras encriptadas
  - Enviar notificaciones por correo electrónico

### Script de gestión (`manage.sh`)

Un script bash para facilitar la gestión de la aplicación:
- Inicia/detiene el frontend y backend
- Monitorea el estado de los servicios
- Instala dependencias
- Compila la aplicación para producción

## Cómo usar

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/the00b/password-generador.git
   cd password-generador
   ```

2. **Configuración inicial:**
   - Crea un archivo `.env` en el directorio raíz con tu API key de Giphy y Resend:
     ```
     REACT_APP_GIPHY_API_KEY=tu_api_key_de_giphy
     RESEND_API_KEY=tu_api_key_de_resend
     EMAIL_FROM=tu_correo@ejemplo.com
     ```
   - Para obtener una API key de Giphy, regístrate en [developers.giphy.com](https://developers.giphy.com/)
   - Para obtener una API key de Resend, regístrate en [resend.com](https://resend.com/)

3. **Instala las dependencias:**
   ```bash
   ./manage.sh install
   ```

4. **Inicia la aplicación:**
   ```bash
   ./manage.sh start
   ```
   Esto iniciará tanto el servidor backend como la aplicación frontend.

5. **Usa el generador de contraseñas:**
   - Navega a `http://localhost:3000` en tu navegador.
   - Selecciona el tipo de generador (tradicional o basado en GIFs).
   - Configura las opciones de tu contraseña.
   - Copia la contraseña o compártela de forma segura.

6. **Usa el compartidor de notas seguras:**
   - Navega a `http://localhost:3000/secure-notes` en tu navegador.
   - Escribe el contenido de la nota que deseas compartir.
   - Configura las opciones de seguridad y envía la nota.
   - Comparte el enlace generado con el destinatario.

7. **Gestionar la aplicación:**
   - Para ver el estado: `./manage.sh status`
   - Para reiniciar: `./manage.sh restart`
   - Para detener: `./manage.sh stop`

## Dependencias

- **React**: Biblioteca para construir interfaces de usuario.
- **Material UI**: Librería de componentes para React.
- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor.
- **Express**: Framework web para Node.js.
- **Giphy API**: API para buscar y mostrar GIFs.
- **Axios**: Cliente HTTP para realizar peticiones.
- **Crypto**: Para la encriptación de notas seguras.
- **Resend**: Para el envío de correos electrónicos.
- **UUID**: Para generar identificadores únicos.

## Requisitos del sistema

- **Node.js** (v14 o superior)
- **npm** (v6 o superior)
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexión a Internet (para las APIs de Giphy y Resend)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/mejora-increible`)
3. Haz commit de tus cambios (`git commit -am 'Agrega una mejora increíble'`)
4. Sube la rama (`git push origin feature/mejora-increible`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## Contacto

Si tienes preguntas o comentarios, no dudes en abrir un issue en GitHub o contactar al autor.

---

## Integración con Supabase para Notas Seguras

El sistema de notas seguras utiliza [Supabase](https://supabase.com/) como base de datos persistente para almacenar las notas encriptadas. Esto permite un almacenamiento más confiable y escalable que las soluciones en memoria utilizadas anteriormente.

### Estructura de la Base de Datos

La tabla principal `secure_notes` tiene la siguiente estructura:

```sql
CREATE TABLE IF NOT EXISTS public.secure_notes (
  id UUID PRIMARY KEY,                           -- Identificador único de la nota
  encrypted_data JSONB NOT NULL,                 -- Datos encriptados y metadatos del algoritmo
  requires_password BOOLEAN DEFAULT false,       -- Indica si requiere contraseña adicional
  password_hash TEXT,                            -- Hash SHA-256 de la contraseña (si aplica)
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- Fecha/hora de expiración
  remaining_views INTEGER DEFAULT 1,             -- Número de visualizaciones restantes
  expire_on_view BOOLEAN DEFAULT false,          -- Si debe eliminarse al visualizarse
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Esta estructura permite:
- Almacenar datos encriptados en formato JSON con metadatos del algoritmo usado
- Configurar protecciones adicionales con contraseña
- Establecer diferentes políticas de caducidad (por tiempo o visualizaciones)
- Mantener información para auditoría (creación/actualización)

### Algoritmos de Encriptación

El sistema ofrece múltiples algoritmos de encriptación, cada uno con diferentes características:

#### 1. AES-256-GCM
- **Descripción**: Algoritmo estándar de cifrado avanzado con modo Galois/Counter que proporciona tanto confidencialidad como autenticación.
- **Ventajas**: Rápido, seguro y resistente a manipulaciones. Detecta si los datos han sido alterados.
- **Uso ideal**: Protección general de datos sensibles con rendimiento eficiente.

#### 2. AES-256-CBC
- **Descripción**: Algoritmo simétrico tradicional en modo Cipher Block Chaining.
- **Ventajas**: Ampliamente probado y compatible con la mayoría de sistemas.
- **Uso ideal**: Cuando se requiere compatibilidad con sistemas antiguos.

#### 3. AES-512-GCM
- **Descripción**: Implementación de doble capa que utiliza dos claves AES-256 separadas para crear un cifrado de fuerza equivalente a 512 bits.
- **Ventajas**: Seguridad extremadamente alta, prácticamente imposible de romper incluso con computación cuántica.
- **Uso ideal**: Datos altamente confidenciales que requieren el máximo nivel de protección.

#### 4. AES-512-CBC
- **Descripción**: Versión de doble capa del cifrado AES-256-CBC.
- **Ventajas**: Mayor fortaleza criptográfica manteniendo la compatibilidad del formato CBC.
- **Uso ideal**: Datos muy sensibles que requieren compatibilidad con sistemas que no soportan GCM.

#### 5. ChaCha20-Poly1305
- **Descripción**: Algoritmo moderno diseñado como alternativa a AES, especialmente eficiente en plataformas sin aceleración de hardware AES.
- **Ventajas**: Rendimiento superior en software, excelente para dispositivos móviles y de bajo consumo.
- **Uso ideal**: Aplicaciones donde el rendimiento es crucial o en sistemas con recursos limitados.

