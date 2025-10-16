
  # Content Studio Wireframe

  This is a code bundle for Content Studio Wireframe. The original project is available at https://www.figma.com/design/lMkLxUaRIcU37GhQJfQPuw/Content-Studio-Wireframe.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.


  🔐 Autenticación, Chat y Audio – Estado Final
✅ Integración completada

Autenticación (Firebase Auth)

Se implementó AuthProvider (src/contexts/AuthContext.tsx) que centraliza el manejo de sesión e ID tokens en toda la aplicación.

Los componentes AuthControls y Header permiten iniciar, cambiar o cerrar sesión y actualizan el contexto global.

El idToken se propaga automáticamente a ChatSDK, useChat y AudioWorkbench, habilitando comunicación segura con las funciones de Firebase.

Chats (Backend real)

ChatModuleUpdated y useChat migraron al backend real (/api/chat), eliminando el modo de demostración.

Se agregó ModuleChatPanel como componente reutilizable para integrar el chat en otros módulos (Posts, Videos, Podcasts, Stories).

Se incorporó AuthRequiredNotice para controlar accesos a usuarios no autenticados.

Audio

AudioWorkbench y useAudio ahora dependen del login y muestran avisos cuando el token no está disponible.

convert.ts usa child_process.spawn dinámicamente para ejecutar FFmpeg solo en entornos Node.

Funciones audioSynthesize y audioTranscribe validadas correctamente en producción.

Build y despliegue

npm run build completado sin errores (Vite solo advierte por child_process y tamaño de chunks).

Despliegue exitoso en Firebase Hosting y Functions.

⚙️ Pendiente

Validar manualmente autenticado:
Probar el flujo completo (Chat Maestro + Audio) con una sesión real de Firebase y tokens válidos.

Migrar módulos de contenido:
Sustituir chats simulados en Posts, Videos, Podcasts y Stories para usar ModuleChatPanel y useChat.

Conversión de audio en navegador (opcional):
Si se requiere soporte client-side, reemplazar FFmpeg por una versión WebAssembly o librería nativa de navegador (por ejemplo, ffmpeg.wasm o Web Audio API).