# Ctrl-HTLS — Backend

API REST del sistema de gestión hotelera Ctrl-HTLS. Desarrollada con **Node.js**, **Express** y **Sequelize** sobre **PostgreSQL**.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 18
- [PostgreSQL](https://www.postgresql.org/) (local o en la nube)

---

## Instalación

1. **Clonar el repositorio** (si aún no lo hiciste):

   ```bash
   git clone <url-del-repo>
   cd Ctrl-HTLS/backend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

---

## Configuración de entorno

1. **Crear el archivo `.env`** a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

2. **Editar `.env`** con tus credenciales. Ejemplo para base de datos local:

   ```env
   DB_PORT=5432
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=ctrl_htls
   DB_DIALECT=postgres

   JWT_SECRET=una_clave_secreta_muy_segura
   JWT_EXPIRES_IN=24h
   ```

   O usando una **URL de conexión en la nube**:

   ```env
   DB_URL=postgresql://user:pass@host:port/database

   JWT_SECRET=una_clave_secreta_muy_segura
   JWT_EXPIRES_IN=24h
   ```

---

## Inicialización

### Modo desarrollo (con recarga automática)

```bash
npm run dev
```

### Modo producción

```bash
node src/index.js
```

---

## Scripts útiles

| Comando        | Descripción                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Inicia el servidor con nodemon |
| `npm run lint` | Ejecuta ESLint sobre el código |

---

_(El puerto por defecto suele ser `3000` o el definido en la variable de entorno `PORT`.)_
