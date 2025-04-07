# Diccionario de Lenguajes de Programación y Frameworks

![Version](https://img.shields.io/badge/versión-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Material UI](https://img.shields.io/badge/Material--UI-5.11.x-0081CB)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991)

Una aplicación para validar y crear stacks tecnológicos a partir de un diccionario curado de 225 lenguajes de programación y 300 frameworks de desarrollo de software. Ahora con descripciones generadas por GPT-3.5 Turbo.

![Vista previa de la aplicación](./docs/home.png)

## 🌟 Características

- **Validación de tecnologías**: Verifica si una tecnología está incluida en nuestro diccionario curado
- **Creación de stacks**: Añade tecnologías validadas a tu stack personalizado
- **Descripciones con IA**: Obtén descripciones automáticas de cada tecnología usando GPT-3.5 Turbo
- **Datos curiosos**: Cada tecnología incluye una curiosidad o dato interesante poco conocido
- **Enlaces a Wikipedia**: Accede a más información a través de enlaces automáticos a Wikipedia
- **Interfaz minimalista**: Diseño limpio y enfocado en la usabilidad
- **Sin autocompletado intrusivo**: Campo de texto simple sin desplegables automáticos
- **Respuesta visual**: Indicación clara mediante colores e iconos
- **Gestión del stack**: Elimina tecnologías individuales o limpia todo el stack
- **Exportación de datos**: Descarga descripciones en formato Markdown o texto plano

## 📋 Contenido del proyecto

- **Aplicación React**: Interfaz para validar y gestionar tu stack tecnológico
- **Base de datos CSV**: Listado curado de [225 lenguajes y 300 frameworks](./data/lenguajes_frameworks.csv) organizado por categorías
- **Integración con OpenAI**: Obtención de descripciones técnicas y curiosidades para cada tecnología
- **Script de inicio**: Script `iniciar.sh` para arrancar fácilmente la aplicación

## 📥 Descarga directa del diccionario

Puedes descargar directamente nuestro diccionario de lenguajes y frameworks desde estos enlaces:

- **[⬇️ Descargar CSV completo](https://raw.githubusercontent.com/686f6c61/diccionario-lenguajes-programacion-frameworks/main/data/lenguajes_frameworks.csv)** - Contiene 225 lenguajes y 300 frameworks organizados por categorías
- **[📊 Ver en GitHub](https://github.com/686f6c61/diccionario-lenguajes-programacion-frameworks/blob/main/data/lenguajes_frameworks.csv)** - Explorar el archivo en el repositorio

El diccionario está en formato CSV y puede ser importado en Excel, Google Sheets, o cualquier herramienta de procesamiento de datos.

## 🚀 Instalación

### Requisitos previos

- Node.js (versión 14 o superior)
- npm (versión 6 o superior)
- API key de OpenAI (opcional, para obtener descripciones)

### Pasos de instalación

1. Clona el repositorio:
```bash
git clone https://github.com/686f6c61/diccionario-lenguajes-programacion-frameworks.git
cd diccionario-lenguajes-programacion-frameworks
```

2. Instala las dependencias:
```bash
cd validador-tecnologias
npm install
```

O instala específicamente las dependencias requeridas:
```bash
npm install react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled papaparse openai dotenv react-markdown
```

3. Configura tu API key de OpenAI:
   - Crea un archivo `.env` en la carpeta `validador-tecnologias`
   - Añade tu API key de OpenAI:
   ```
   REACT_APP_OPENAI_API_KEY=tu_api_key_aqui
   ```
   - Puedes [obtener una API key de OpenAI aquí](https://platform.openai.com/api-keys)
   - Importante: La aplicación utilizará GPT-3.5 Turbo, asegúrate de que tu cuenta tenga acceso a este modelo
   - Recuerda que sin la API key, no podrás obtener descripciones ni curiosidades sobre las tecnologías

4. Inicia la aplicación:

Usando npm:
```bash
npm start
```

O usando el script proporcionado (recuerda que está dentro de la carpeta validador-tecnologias):
```bash
chmod +x validador-tecnologias/iniciar.sh  # Solo la primera vez para dar permisos de ejecución
./validador-tecnologias/iniciar.sh
```

La aplicación se abrirá automáticamente en [http://localhost:3000](http://localhost:3000).

## 🔍 Uso

1. **Buscar y validar tecnologías**:
   - Escribe el nombre de una tecnología o framework en el campo de texto
   - Haz clic en el botón "Validar" o presiona Enter
   - Verás un mensaje indicando si la tecnología está incluida en nuestro diccionario

2. **Crear tu stack tecnológico**:
   - Las tecnologías validadas correctamente se añaden automáticamente a tu stack
   - Cada tecnología aparecerá como una tarjeta en la sección "Stack tecnológico"
   - La aplicación obtendrá automáticamente una descripción técnica y una curiosidad para cada tecnología (requiere API key)
   - Verás la información organizada con iconos descriptivos
   - Puedes eliminar tecnologías individuales o limpiar todo el stack

3. **Descargar información de tecnologías**:
   - **Descargar tecnología individual**: 
     - Haz clic en el icono de descarga (💾) en cada tarjeta de tecnología
     - Elige el formato: Markdown (.md) o Texto plano (.txt)
   
   - **Descargar todo el stack**:
     - Haz clic en el botón "Descargar todo" en la sección "Stack tecnológico"
     - Elige el formato para todas las tecnologías: Markdown (.md) o Texto plano (.txt)
   
   - Los archivos descargados incluirán:
     - La descripción técnica completa
     - La curiosidad o dato interesante
     - Enlaces al sitio oficial y Wikipedia

4. **Acceder al diccionario completo**:
   - El archivo CSV completo está disponible en la carpeta [data/lenguajes_frameworks.csv](./data/lenguajes_frameworks.csv)
   - Contiene 225 lenguajes y 300 frameworks organizados por categorías

## 🤖 Modelo de OpenAI utilizado

Esta aplicación utiliza el modelo **GPT-3.5 Turbo** para generar:

- **Descripciones técnicas**: Información concisa (150-200 palabras) sobre cada tecnología que incluye propósito, características técnicas, ventajas y conceptos fundamentales.
- **Curiosidades**: Datos interesantes y poco conocidos sobre cada tecnología.
- **Enlaces relevantes**: URLs oficiales y enlaces a Wikipedia para facilitar el acceso a más información.

Configuración del modelo:
- **Temperatura**: 0.2 (para mantener respuestas consistentes y precisas)
- **Máximo de tokens**: 750 (suficiente para descripciones completas pero concisas)
- **Instrucciones al modelo**: Orientadas a proporcionar información técnicamente precisa y educativa

## 📁 Estructura del proyecto

```
diccionario-lenguajes-programacion-frameworks/
├── validador-tecnologias/      # Directorio principal de la aplicación
│   ├── README.md               # Este archivo
│   ├── .env                    # Archivo para API key de OpenAI (no incluido en repo)
│   ├── iniciar.sh              # Script para iniciar la aplicación
│   ├── package.json            # Dependencias y scripts
│   ├── data/                   # Datos del proyecto
│   │   └── lenguajes_frameworks.csv # Diccionario completo de tecnologías
│   ├── docs/                   # Documentación e imágenes
│   │   └── home.png            # Vista previa de la aplicación
│   ├── public/                 # Archivos estáticos
│   └── src/                    # Código fuente
│       ├── App.js              # Componente principal
│       ├── index.js            # Punto de entrada
│       ├── index.css           # Estilos globales
│       ├── components/         # Componentes React
│       │   └── TechnologyValidator.js # Validador de tecnologías
│       ├── services/           # Servicios externos
│       │   └── openai.js       # Integración con API de OpenAI
│       └── data/               # Datos para la aplicación
│           └── technologies.js # Procesamiento de tecnologías
```

## 📜 Script iniciar.sh

El script `iniciar.sh` permite arrancar la aplicación de forma rápida y sencilla:

```bash
./validador-tecnologias/iniciar.sh
```

Este script realiza las siguientes acciones:
1. Verifica que está en el directorio correcto
2. Instala las dependencias si no están instaladas
3. Inicia la aplicación en http://localhost:3000

## 🛠️ Tecnologías utilizadas

- **React**: Framework para la interfaz de usuario
- **Material-UI**: Componentes de diseño visual
- **OpenAI API**: Generación de descripciones con GPT-3.5 Turbo
- **PapaParse**: Procesamiento de archivos CSV
- **Node.js**: Entorno de ejecución JavaScript
- **React Markdown**: Renderizado de descripciones en formato Markdown

## 📊 Datos y estadísticas

El diccionario incluye:
- 225 lenguajes y tecnologías de programación
- 300 frameworks y librerías
- 29 categorías diferentes de tecnologías
- Datos curados y organizados manualmente

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes modificarlo y disfrutarlo libremente.

## 🔗 Enlaces

- [Repositorio GitHub](https://github.com/686f6c61/diccionario-lenguajes-programacion-frameworks)
- [Reportar un problema](https://github.com/686f6c61/diccionario-lenguajes-programacion-frameworks/issues)
- [Obtener API key de OpenAI](https://platform.openai.com/api-keys)
