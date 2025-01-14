/**
 * @swagger
 * components:
 *   schemas:
 *     Pais:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Argentina"
 *         tipo:
 *           type: string
 *           enum: [pais]
 *           example: "pais"
 *     Provincia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Buenos Aires"
 *         tipo:
 *           type: string
 *           enum: [provincia]
 *           example: "provincia"
 *         paisId:
 *           type: integer
 *           example: 1
 *     Ciudad:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Buenos Aires"
 *         tipo:
 *           type: string
 *           enum: [ciudad]
 *           example: "ciudad"
 *         codigoPostal:
 *           type: string
 *           example: "1000"
 *         provinciaId:
 *           type: integer
 *           example: 1
 *     Empleado:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Juan"
 *         apellido:
 *           type: string
 *           example: "Pérez"
 *         email:
 *           type: string
 *           example: "juan.perez@example.com"
 *         rol:
 *           type: string
 *           enum: [administrador, vendedor, desarrollador]
 *           example: "administrador"
 *         password:
 *           type: string
 *           example: "password123"
 *         telefono:
 *           type: string
 *           example: "123456789"
 *         tipoDocumento:
 *           type: string
 *           enum: [dni, li, le, pasaporte]
 *           example: "dni"
 *         numeroDocumento:
 *           type: string
 *           example: "12345678"
 *         direccion:
 *           type: string
 *           example: "Calle Falsa 123"
 *         ciudadId:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /localidad:
 *   post:
 *     summary: Crea una nueva localidad (ciudad, provincia o país)
 *     tags: [Localidad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Pais'
 *               - $ref: '#/components/schemas/Provincia'
 *               - $ref: '#/components/schemas/Ciudad'
 *           examples:
 *             CrearCiudad:
 *               summary: Crear una ciudad
 *               value:
 *                 nombre: "Buenos Aires"
 *                 tipo: "ciudad"
 *                 codigoPostal: "1000"
 *                 provinciaId: 1
 *             CrearProvincia:
 *               summary: Crear una provincia
 *               value:
 *                 nombre: "Buenos Aires"
 *                 tipo: "provincia"
 *                 paisId: 1
 *             CrearPais:
 *               summary: Crear un país
 *               value:
 *                 nombre: "Argentina"
 *                 tipo: "pais"
 *     responses:
 *       201:
 *         description: Localidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Pais'
 *                 - $ref: '#/components/schemas/Provincia'
 *                 - $ref: '#/components/schemas/Ciudad'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El código postal es requerido para crear una ciudad"
 *       404:
 *         description: Localidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La provincia no existe"
 *       409:
 *         description: Conflicto en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La ciudad ya existe en esta provincia"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /localidad/{id}:
 *   put:
 *     summary: Actualiza una localidad existente (ciudad, provincia o país)
 *     tags: [Localidad]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la localidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Pais'
 *               - $ref: '#/components/schemas/Provincia'
 *               - $ref: '#/components/schemas/Ciudad'
 *           examples:
 *             ActualizarCiudad:
 *               summary: Actualizar una ciudad
 *               value:
 *                 nombre: "Buenos Aires"
 *                 tipo: "ciudad"
 *                 codigoPostal: "1000"
 *                 provinciaId: 1
 *             ActualizarProvincia:
 *               summary: Actualizar una provincia
 *               value:
 *                 nombre: "Buenos Aires"
 *                 tipo: "provincia"
 *                 paisId: 1
 *             ActualizarPais:
 *               summary: Actualizar un país
 *               value:
 *                 nombre: "Argentina"
 *                 tipo: "pais"
 *     responses:
 *       200:
 *         description: Localidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Pais'
 *                 - $ref: '#/components/schemas/Provincia'
 *                 - $ref: '#/components/schemas/Ciudad'
 *       404:
 *         description: Localidad no encontrada
 *       400:
 *         description: Error en la solicitud
 */

/**
 * @swagger
 * /localidad/{id}:
 *   delete:
 *     summary: Elimina una localidad existente (ciudad, provincia o país)
 *     tags: [Localidad]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la localidad
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ciudad, provincia, pais]
 *         description: Tipo de la localidad (ciudad, provincia o país)
 *     responses:
 *       200:
 *         description: Localidad eliminada exitosamente
 *       404:
 *         description: Localidad no encontrada
 *       400:
 *         description: Error en la solicitud
 */

/**
 * @swagger
 * /paises:
 *   get:
 *     summary: Obtiene todos los países
 *     tags: [Localidad]
 *     responses:
 *       200:
 *         description: Lista de países
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pais'
 */

/**
 * @swagger
 * /paises/{id}:
 *   get:
 *     summary: Obtiene un país por su ID
 *     tags: [Localidad]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país
 *     responses:
 *       200:
 *         description: País obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pais'
 *       404:
 *         description: País no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "País no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /provincias/{paisId}:
 *   get:
 *     summary: Obtiene todas las provincias de un país
 *     tags: [Localidad]
 *     parameters:
 *       - in: path
 *         name: paisId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país
 *     responses:
 *       200:
 *         description: Lista de provincias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provincia'
 */

/**
 * @swagger
 * /ciudades/{provinciaId}:
 *   get:
 *     summary: Obtiene todas las ciudades de una provincia
 *     tags: [Localidad]
 *     parameters:
 *       - in: path
 *         name: provinciaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la provincia
 *     responses:
 *       200:
 *         description: Lista de ciudades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ciudad'
 */

/**
 * @swagger
 * /empleado:
 *   post:
 *     summary: Crea un nuevo empleado
 *     tags: [Empleado]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               email:
 *                 type: string
 *                 example: "juan.perez@example.com"
 *               rol:
 *                 type: string
 *                 enum: [administrador, vendedor, desarrollador]
 *                 example: "administrador"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               telefono:
 *                 type: string
 *                 example: "123456789"
 *               tipoDocumento:
 *                 type: string
 *                 enum: [dni, li, le, pasaporte]
 *                 example: "dni"
 *               numeroDocumento:
 *                 type: string
 *                 example: "12345678"
 *               direccion:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *               ciudadId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 nombre:
 *                   type: string
 *                   example: "Juan"
 *                 apellido:
 *                   type: string
 *                   example: "Pérez"
 *                 email:
 *                   type: string
 *                   example: "juan.perez@example.com"
 *                 rol:
 *                   type: string
 *                   example: "administrador"
 *                 telefono:
 *                   type: string
 *                   example: "123456789"
 *                 tipoDocumento:
 *                   type: string
 *                   example: "dni"
 *                 numeroDocumento:
 *                   type: string
 *                   example: "12345678"
 *                 direccion:
 *                   type: string
 *                   example: "Calle Falsa 123"
 *                 ciudadId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El email es requerido"
 *       409:
 *         description: Conflicto en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El email ya está registrado"
 *       404:
 *         description: Ciudad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La ciudad no existe"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
