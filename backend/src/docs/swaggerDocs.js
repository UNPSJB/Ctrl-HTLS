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
