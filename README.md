# Proyecto Tesis: Editor y Generador Automático de Tesis

> Una plataforma web para escribir, organizar y exportar tu tesis en formato LaTeX, sin necesidad de saber LaTeX.

---

## ¿Qué hace este sistema?

Esta aplicación permite a un estudiante o investigador redactar su tesis completa desde el navegador. El contenido se guarda automáticamente en la nube (Firebase) mientras se escribe. Al terminar, el sistema genera automáticamente un documento LaTeX (.tex) listo para ser compilado como PDF, ya sea en una herramienta como **Overleaf** o en una instalación local de LaTeX.

**No necesitas conocimientos de LaTeX para usarlo.** Todo se maneja desde una interfaz visual.

---

## Tecnologías utilizadas

| Tecnología | Para qué se usa |
|---|---|
| **React 18** | Interfaz de usuario interactiva |
| **Vite** | Servidor de desarrollo rápido y empaquetado |
| **Firebase Auth** | Registro e inicio de sesión de usuarios |
| **Firebase Firestore** | Base de datos en la nube para guardar la tesis |
| **Firebase Storage** | Almacenamiento de imágenes subidas |
| **JSZip** | Empaquetado del proyecto en un archivo `.zip` |
| **React Router** | Navegación entre páginas (login, editor) |

---

## Instalación paso a paso

Sigue estos pasos para ejecutar el proyecto en tu computadora:

### 1. Requisitos previos

Asegúrate de tener instalado:
- **Node.js** (versión 18 o superior). Puedes descargarlo en [nodejs.org](https://nodejs.org).
- Un proyecto de **Firebase** con los siguientes servicios activados:
  - **Authentication** → método Email/Password habilitado.
  - **Firestore Database** → base de datos creada.
  - **Storage** → bucket de almacenamiento habilitado.

### 2. Clonar e instalar dependencias

```bash
# Navegar a la carpeta del proyecto
cd Proyecto_tesis

# Instalar todas las librerías necesarias
npm install
```

### 3. Configurar Firebase

Abre el archivo `src/firebase.js` y reemplaza los valores de `firebaseConfig` con los datos de tu propio proyecto de Firebase (los encuentras en la consola de Firebase → Configuración del proyecto).

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

Esto abrirá la aplicación en `http://localhost:5173`.

### 5. Compilar para producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos estáticos listos para desplegar.

---

## Guía de uso del editor

### Paso 1: Crear una cuenta
Al abrir la app, verás la pantalla de **Login**. Haz clic en "Registrarse" para crear tu cuenta con correo y contraseña. Después de registrarte, serás redirigido al editor automáticamente.

### Paso 2: Llenar los metadatos de la portada
En la parte superior del editor encontrarás campos para:
- **Título de la tesis**
- **Nombre del autor**
- **Fecha**
- **Dedicatoria** (opcional)
- **Agradecimientos** (opcional)

Estos datos aparecerán en la portada del documento final generado.

### Paso 3: Escribir la Introducción y Conclusiones
Son secciones de texto libre. Escribe directamente en las áreas de texto asignadas. Puedes usar formato básico:
- `**texto**` → **negrita**
- `*texto*` → *cursiva*
- `[@clave]` → citación bibliográfica automática

### Paso 4: Agregar capítulos con bloques
El editor funciona por **bloques de contenido**. Cada capítulo puede contener múltiples bloques en el orden que desees. Los tipos de bloques disponibles son:

| Bloque | Cómo agregarlo | Qué genera en LaTeX |
|---|---|---|
| **Texto** | Botón `+ Texto` | Párrafo de texto |
| **Imagen** | Botón `+ Imagen` → selecciona archivo | `\begin{figure}` con pie de foto |
| **Tabla** | Botón `+ Tabla` → configura filas y columnas | `\begin{table}` con `\tabular` |
| **Ecuación** | Botón `+ Ecuación` → escribe LaTeX | `\begin{equation}` |

> Las imágenes se suben automáticamente a la nube (Firebase Storage). No se guardan en tu computadora.

### Paso 5: Gestionar referencias bibliográficas
En la sección **Referencias (BibTeX)** puedes:
- Escribir entradas BibTeX manualmente.
- Usar el botón `+ Referencia` para generar entradas con un formulario guiado (artículo, libro, conferencia).

Para citar en el texto, usa la sintaxis `[@clave_de_referencia]`.

### Paso 6: Exportar el documento

| Botón | Qué descarga |
|---|---|
| **Guardar Backup** | Un `.json` con toda la tesis guardada localmente |
| **Importar** | Carga un `.json` guardado previamente |
| **LaTeX** | Solo el archivo `thesis.tex` |
| **Exportar ZIP** | Un `.zip` con `thesis.tex`, `references.bib` e imágenes |

Para obtener el PDF final, importa el ZIP en **Overleaf** o compila localmente con `pdflatex`.

---

## Estructura de carpetas del proyecto

```
src/
├── App.jsx                    # Enrutamiento y protección de rutas
├── firebase.js                # Configuración de Firebase
├── app.css                    # Estilos globales
├── main.jsx                   # Punto de entrada de React
│
├── context/
│   └── AuthContext.jsx        # Gestión global de autenticación
│
├── pages/
│   ├── Login.jsx              # Página de inicio de sesión
│   ├── Register.jsx           # Página de registro
│   └── ThesisEditor.jsx       # Editor principal de la tesis
│
├── components/
│   └── ActionButton/          # Componente de botón reutilizable
│
└── utils/
    ├── latexExport.js         # Motor de conversión a LaTeX
    ├── fileDownload.js        # Descarga de archivos de texto
    ├── zipDownload.js         # Creación y descarga de ZIP
    └── imageUtils.js          # Conversión Base64 ↔ File
```

---

## Documentación detallada del código

### `src/App.jsx` — Enrutador principal

Define las rutas de la aplicación usando `react-router-dom`. Contiene el componente `PrivateRoute`, que actúa como "guardia": si el usuario no ha iniciado sesión, lo redirige automáticamente a `/login`. Las rutas disponibles son:

| Ruta | Componente | Acceso |
|---|---|---|
| `/login` | `Login.jsx` | Público |
| `/register` | `Register.jsx` | Público |
| `/` | `ThesisEditor.jsx` | Solo usuarios autenticados |

---

### `src/firebase.js` — Configuración de Firebase

Inicializa la conexión con Firebase y exporta tres objetos que el resto del código usa:
- `auth` → para autenticar usuarios.
- `db` → para leer y escribir en Firestore (base de datos).
- `storage` → para subir y descargar archivos (imágenes).

---

### `src/context/AuthContext.jsx` — Contexto de autenticación

Usa la **Context API de React** para compartir el estado de la sesión con toda la aplicación sin pasar props manualmente.

**Lo que hace:**
- Escucha en tiempo real si el usuario está conectado o no (`onAuthStateChanged`).
- Expone las funciones `login`, `register` y `logout`.
- Expone el objeto `user` (con nombre y correo del usuario activo).
- Mientras verifica la sesión inicial, muestra un estado de `loading` para evitar mostrar contenido antes de tiempo.

**Cómo usarlo en cualquier componente:**
```js
const { user, logout } = useAuth();
```

---

### `src/pages/ThesisEditor.jsx` — Editor principal

Este es el archivo más grande e importante del proyecto. Contiene toda la lógica del editor y se divide en las siguientes partes:

#### Modales de contenido
Son ventanas emergentes para crear contenido estructurado:

- **`TableModal`**: Formulario de 2 pasos. Primero se define el nombre y dimensiones (filas/columnas), luego se llenan las celdas. Permite también editar tablas existentes.
- **`EquationModal`**: Un área de texto donde se escribe código LaTeX para la ecuación (ej. `E = mc^2`). Soporta edición.
- **`ReferenceModal`**: Genera entradas BibTeX con un formulario. Detecta el tipo (artículo, libro, conferencia) y muestra los campos relevantes automáticamente.

#### `ErrorBoundary`
Un componente de clase de React que captura errores inesperados durante el renderizado y muestra un mensaje de error en lugar de una pantalla en blanco.

#### Estado de la tesis (`useState`)
El estado central que almacena toda la información del documento:
```js
meta         // Título, autor, fecha, dedicatoria, agradecimientos
intro        // Texto de la introducción
chapters     // Array de capítulos. Cada capítulo tiene un array de bloques
conclusions  // Texto de las conclusiones
bib          // Texto en formato BibTeX de las referencias
```

#### Carga desde Firebase (`useEffect` + Firestore)
Al iniciar, el editor consulta Firestore para recuperar la tesis guardada del usuario. Incluye **lógica de migración**: si los datos están en un formato antiguo (sin bloques), los convierte automáticamente al nuevo formato.

#### Auto-guardado (`useEffect` con debounce)
Cada vez que el usuario modifica algo, un temporizador de 3 segundos se reinicia. Cuando pasan 3 segundos sin cambios, la tesis se guarda automáticamente en Firestore. Esto evita sobrecargar la base de datos con cada tecla presionada.

#### Gestión de imágenes (`addImageToChapter`, `removeBlock`)
- **Subida**: La imagen se sube a Firebase Storage bajo la ruta `users/{uid}/{timestamp}_{nombre_archivo}`. Se guarda la URL pública y el path de Storage en el bloque.
- **Borrado**: Se elimina primero de Storage (usando `deleteObject`) y luego del estado local.

#### Exportación

| Función | Descripción |
|---|---|
| `exportJSON()` | Serializa el estado completo a un archivo `.json` |
| `importJSON()` | Carga un `.json` previo y restaura el estado |
| `exportTEX()` | Llama a `buildTex()` y descarga el `.tex` resultante |
| `exportBIB()` | Descarga el contenido de `bib` como `.bib` |
| `exportZIP()` | Genera el `.tex`, descarga imágenes remotas con `fetch()` y empaqueta todo en un `.zip` |

#### Funciones de edición de bloques

| Función | Qué hace |
|---|---|
| `addChapter()` | Agrega un capítulo nuevo con un bloque de texto vacío |
| `removeChapter(idx)` | Elimina un capítulo por índice |
| `updateChapter(idx, field, val)` | Actualiza un campo del capítulo (ej. el título) |
| `updateBlock(chIdx, blockId, field, val)` | Actualiza un campo de un bloque específico |
| `updateBlockData(chIdx, blockId, newData)` | Reemplaza múltiples campos de un bloque de una sola vez |
| `insertTextBlock(chIdx)` | Agrega un bloque de texto vacío al final del capítulo |
| `insertTable(data)` | Inserta o actualiza una tabla en el capítulo activo |
| `insertEquation(data)` | Inserta o actualiza una ecuación en el capítulo activo |
| `insertReference(bib)` | Concatena una nueva entrada BibTeX al estado `bib` |

---

### `src/utils/latexExport.js` — Motor de conversión LaTeX

Este archivo transforma los datos JSON de la tesis en un documento LaTeX completo. Es el corazón del sistema de exportación.

#### `escapeLatex(texto)`
Escapa caracteres especiales de LaTeX para evitar errores de compilación. Por ejemplo, `#` se convierte en `\#` y `%` en `\%`.

#### `mdToLatex(texto)`
Convierte formato Markdown básico a LaTeX:

| Markdown | LaTeX generado |
|---|---|
| `**negrita**` | `\textbf{negrita}` |
| `*cursiva*` | `\textit{cursiva}` |
| `` `código` `` | `\texttt{código}` |
| `[texto](url)` | `\href{url}{texto}` |
| `- elemento` | `\item elemento` (dentro de `itemize`) |
| `[@clave]` | `\autocite{clave}` |

#### `renderSection(seccion)`
Función recursiva que convierte una sección del documento en LaTeX. Detecta el nivel (`\section`, `\subsection`, etc.) y si la sección es no numerada (`\section*`).

Para cada bloque dentro de la sección, genera el entorno LaTeX correspondiente:
- **Texto** → párrafo con conversión Markdown
- **Imagen** → `\begin{figure}...\end{figure}`
- **Tabla** → `\begin{table}...\end{table}` con celdas separadas por `&`
- **Ecuación** → `\begin{equation}...\end{equation}`

También procesa secciones anidadas (capítulos dentro de la sección de capítulos).

#### `DEFAULT_TEMPLATE`
Una plantilla LaTeX completa que incluye todos los paquetes necesarios:
- `geometry` → márgenes de página
- `babel` → soporte en español
- `hyperref` → hipervínculos en el PDF
- `graphicx` → inserción de imágenes
- `amsmath` → ecuaciones matemáticas
- `biblatex` → gestión de bibliografía con formato APA

La plantilla contiene marcadores especiales (`\VARtitle`, `\VARcontent`, etc.) que son reemplazados por los datos reales al exportar.

#### `buildTex(plantilla, tesis)`
Función principal que orquesta la exportación:
1. Toma la plantilla (o usa `DEFAULT_TEMPLATE` si no se da una).
2. Reemplaza los marcadores de metadatos (título, autor, fecha, dedicatoria, agradecimientos).
3. Renderiza todas las secciones llamando a `renderContent()`.
4. Devuelve el string completo del documento `.tex`.

---

### `src/utils/fileDownload.js` — Descarga de texto

Función sencilla que convierte un string (texto) en un archivo descargable en el navegador. Crea un `Blob` con el contenido, genera una URL temporal y simula un clic en un enlace de descarga invisible.

**Uso:**
```js
downloadText("thesis.tex", contenidoLaTeX);
```

---

### `src/utils/zipDownload.js` — Empaquetado ZIP

Usa la librería `JSZip` para crear un archivo `.zip` en memoria del navegador. Acepta un array de archivos (con nombre y contenido) y los comprime en un solo archivo descargable.

El contenido puede ser texto (`string`), binario (`ArrayBuffer`) o un archivo (`Blob`), lo que permite incluir tanto el `.tex` y `.bib` como las imágenes descargadas desde Firebase Storage.

**Estructura de entrada:**
```js
[
  { name: "thesis.tex", content: "..." },      // texto
  { name: "references.bib", content: "..." },  // texto
  { name: "images/foto.jpg", content: blob }   // binario
]
```

---

### `src/utils/imageUtils.js` — Utilidades de imagen

Dos funciones auxiliares para manipular archivos de imagen:
- **`fileToBase64(file)`**: Convierte un objeto `File` (como el que devuelve un `<input type="file">`) a una cadena Base64. Útil para previsualizar imágenes sin subirlas.
- **`base64ToFile(base64, nombre)`**: Hace lo inverso: convierte una cadena Base64 de vuelta a un objeto `File`. Útil para restaurar imágenes desde un backup JSON.

---

## Flujo completo de una exportación ZIP

Para entender cómo encajan todas las piezas, aquí está el proceso completo cuando el usuario hace clic en **"Exportar ZIP"**:

```
Usuario → clic en "Exportar ZIP"
    │
    ▼
exportZIP() en ThesisEditor.jsx
    │
    ├─ getExportSectionsForLatex()  → Prepara el array de secciones desde el estado
    │
    ├─ buildTex() en latexExport.js → Convierte secciones a código LaTeX completo
    │
    ├─ Para cada bloque de imagen:
    │    fetchImageBlob(url)         → Descarga la imagen desde Firebase Storage
    │
    └─ downloadZip() en zipDownload.js → Crea el .zip y lo descarga
         ├── thesis.tex
         ├── references.bib
         └── images/
              └── (archivos de imagen)
```

---

## Preguntas frecuentes

**¿El contenido se guarda si cierro el navegador?**
Sí. El auto-guardado sincroniza con Firestore cada 3 segundos de inactividad. Al volver a abrir la app e iniciar sesión, el editor recupera tu tesis automáticamente.

**¿Puedo trabajar sin internet?**
No. La aplicación requiere conexión para cargar y guardar datos en Firebase. El botón "Guardar Backup" te permite descargar una copia local como JSON para tenerla de respaldo.

**¿Cómo compilo el PDF?**
Usa el ZIP exportado en [Overleaf](https://overleaf.com): crea un proyecto nuevo → sube el ZIP. O compila localmente con `pdflatex` + `biber` si tienes LaTeX instalado.

**¿Por qué mis imágenes no aparecen al compilar localmente?**
Las imágenes se referencian por nombre de archivo. Al compilar, deben estar en una carpeta `images/` junto al archivo `thesis.tex`. El ZIP exportado ya incluye esta estructura.
