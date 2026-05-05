# Ctrl-HTLS - Sistema de Gestión de Hoteles

Proyecto final para la asignatura **Desarrollo de Software**. 

El **Centro Hotelero Buena Vista** es una organización que nuclea y centraliza la venta de estadías de una extensa red de hoteles.

---

## 📖 Descripción del Proyecto

Ctrl-HTLS es una plataforma web integral diseñada para administrar de manera eficiente la oferta y venta de servicios hoteleros. El sistema proporciona un entorno de gestión robusto dividido en dos grandes módulos, adaptados a los roles específicos de los usuarios de la organización:

- **🛒 Módulo de Ventas:** Orientado a la atención al cliente y comercialización. 
  - **Sistema Avanzado de Búsqueda:** Cuenta con un motor de búsqueda complejo y responsivo que permite filtrar alojamientos por jerarquía de locaciones (País > Provincia > Ciudad), rangos de fechas dinámicos y capacidad de pasajeros. La interfaz se adapta inteligentemente entre un modo expandido (para la búsqueda inicial) y un modo compacto (para refinar resultados rápidamente).
  - **Gestión de Reservas Flexibles:** El vendedor tiene la libertad de alquilar habitaciones individuales, paquetes turísticos completos, o combinaciones de ambos. Además, este proceso se puede repetir de manera continua, permitiendo armar carritos de reserva que involucren múltiples hoteles simultáneamente.
  - **Precios Dinámicos por Temporada:** El sistema de costeo calcula en tiempo real el valor de las estadías dependiendo del calendario del hotel. Los hoteles configuran temporadas altas (que aplican aumentos de tarifa), temporadas bajas (que aplican descuentos), o periodos sin temporada (donde se mantiene el precio normal). También se calculan automáticamente descuentos por cantidad de habitaciones.
  - **Checkout y Pagos:** Permite registrar clientes nuevos o buscar existentes, y procesar un flujo de pago completo con opciones de efectivo, tarjeta de crédito, cobros mixtos, integrando un sistema automático de fidelización y recompensas por puntos.

- **⚙️ Módulo de Administración:** Orientado a la gestión operativa y gerencial. Permite administrar de forma centralizada y estructurada los hoteles asociados, configurar sus temporadas y precios, mantener la jerarquía de locaciones geográficas, crear paquetes turísticos, gestionar tarifas, administrar la cartera de clientes, y controlar al propio personal (alta, baja y modificación de vendedores y administradores).

El objetivo primordial de esta aplicación es modernizar, unificar y agilizar el proceso de reservas hoteleras que antes se hacía de manera manual, brindando una experiencia de usuario rápida y fluida, al tiempo que se garantiza la seguridad e integridad de las transacciones comerciales de la organización.

## 📚 Documentación Técnica Adicional

Para conocer los detalles profundos de la arquitectura y el stack tecnológico utilizado en cada capa de la aplicación, por favor consulta los siguientes documentos:

- 🎨 **[Documentación del Frontend (Cliente)](./frontend/README.md):** Detalla la arquitectura basada en React, Vite, Tailwind CSS y la estructura orientada a dominios.
- ⚙️ **[Documentación del Backend (Servidor)](./backend/README.md):** Detalla la API REST, configuración de Node.js, Express, Sequelize y la base de datos PostgreSQL.

---

## 👥 Equipo de Desarrollo

- [Galiano Valle, Carlos Oscar](https://github.com/Cachi1997)
- [Montes, Adriel Agustin](https://github.com/Adriel-M-A)
- [Pavez, Pablo Andres](https://github.com/pablopavez)

## 🛠️ Stack Tecnológico Resumido

- **Backend:** Node.js, Express, Sequelize ORM, PostgreSQL, JWT & bcrypt.
- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, React Hook Form, Axios.

## 🚀 Instalación y Ejecución Local

Para correr el proyecto en un entorno local para su evaluación:

1. Clonar el repositorio.
2. **Base de Datos:** Asegurarse de tener una instancia local de PostgreSQL en ejecución.
3. **Backend:** Navegar a la carpeta `/backend`, configurar el archivo de variables de entorno (`.env`), instalar dependencias (`npm install`) y ejecutar el servidor con `npm run dev`.
4. **Frontend:** Navegar a la carpeta `/frontend`, instalar dependencias (`npm install`) y levantar la interfaz con `npm run dev`.
