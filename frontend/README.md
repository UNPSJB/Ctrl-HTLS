# Ctrl-HTLS - Frontend

Este directorio aloja la aplicación cliente (interfaz de usuario) del sistema **Ctrl-HTLS**, desarrollada para el proyecto final de la asignatura "Desarrollo".

---

## 🏗️ Arquitectura y Tecnologías

El frontend fue inicializado utilizando **Vite** junto con **React**, lo que nos garantiza tiempos de compilación y carga ultrarrápidos, además de una experiencia de desarrollo sumamente fluida gracias al Hot Module Replacement (HMR).

### Principales Tecnologías Utilizadas
- **React 18:** Construcción de interfaces reactivas y dinámicas mediante componentes funcionales y Hooks personalizados.
- **Vite:** Herramienta moderna de compilación y servidor local de desarrollo.
- **Tailwind CSS:** Framework de CSS utilitario utilizado para construir y estructurar todos los componentes de la interfaz. Nos permitió estandarizar un diseño responsivo, corporativo y coherente, soportando nativamente modos claros y oscuros.
- **React Router DOM:** Manejo del enrutamiento de la SPA (Single Page Application), permitiendo una navegación instantánea entre los diferentes módulos (Admin y Vendor) sin recargar la página.
- **React Hook Form:** Librería encargada del manejo eficiente, control de estados y validación de formularios complejos, optimizando los re-renderizados.
- **Axios:** Cliente HTTP configurado mediante una instancia centralizada para inyectar automáticamente los tokens de autenticación JWT y manejar errores globalmente.
- **React Hot Toast:** Sistema estandarizado de notificaciones interactivas para brindar feedback inmediato al usuario tras realizar acciones (pagos exitosos, errores de sistema, validaciones).

## 📁 Estructura del Proyecto

La arquitectura de carpetas está orientada a módulos funcionales (Domain-Driven), lo que nos permite mantener el código altamente escalable y organizado a medida que el proyecto crece:

- `src/api/`: Configuraciones e instancias de cliente (Axios).
- `src/components/`: Componentes de interfaz (UI) reutilizables (Botones, Inputs, Formularios, Modales, Loaders) compartidos a lo largo de toda la aplicación.
- `src/context/`: Contextos globales que manejan estados complejos (Autenticación de sesión, Carrito de Reservas, Búsqueda unificada, etc).
- `src/modules/`: Lógica central dividida en los dos dominios principales del sistema:
  - `admin/`: Rutas, tablas de gestión y formularios exclusivos para el panel gerencial.
  - `vendor/`: Interfaz para el flujo de atención al público, gestión del cliente, selección de hoteles y la pantalla final de checkout (Caja).
- `src/utils/`: Archivos de utilidad, como formateadores de moneda, utilidades de fecha y constantes globales de reglas de validación.

## 🚀 Inicio Rápido

Para desplegar la aplicación cliente localmente:

1. Asegúrate de tener **Node.js** instalado (versión 20 o superior recomendada).
2. Abre tu terminal en el directorio `/frontend` y ejecuta la instalación de dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en la URL indicada por consola (generalmente `http://localhost:5173`).
