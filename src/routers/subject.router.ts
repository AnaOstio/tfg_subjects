import { Router } from 'express';
import { changeStatus, create, createFromFiles, deleteSubject, getAll, getById, getByTitleMemory, update } from '../controllers/subject.controller';
import { uploadMemory } from '../config/upload';

const router = Router();

/**
 * @openapi
 * /subjects:
 *   post:
 *     tags:
 *       - Subjects
 *     summary: Crear un nuevo subject
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubjectInput'
 *     responses:
 *       201:
 *         description: Subject creado satisfactoriamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Petición incorrecta (validación fallida)
 *       401:
 *         description: Token faltante
 *       403:
 *         description: Token inválido o usuario no propietario
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', create);

/**
 * @openapi
 * /subjects:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Obtener todos los subjects con paginación
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista paginada de subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subject'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getAll);

/**
 * @openapi
 * /subjects/{id}:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Obtener un subject por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subject
 *     responses:
 *       200:
 *         description: Subject encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Subject no encontrado
 */
router.get('/:id', getById);

/**
 * @openapi
 * /subjects/by-memory/{titleMemoryId}:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Obtener todos los subjects de una titleMemory
 *     parameters:
 *       - in: path
 *         name: titleMemoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la titleMemory
 *     responses:
 *       200:
 *         description: Lista de subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 */
router.get('/by-memory/:titleMemoryId', getByTitleMemory);

/**
 * @openapi
 * /subjects/{id}:
 *   put:
 *     tags:
 *       - Subjects
 *     summary: Actualizar un subject existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubjectInput'
 *     responses:
 *       200:
 *         description: Subject actualizado satisfactoriamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Petición incorrecta (validación fallida)
 *       401:
 *         description: Token faltante
 *       403:
 *         description: Token inválido o no autorizado
 *       404:
 *         description: Subject no encontrado
 */
router.put('/:id', update);

/**
 * @openapi
 * /subjects/{id}:
 *   delete:
 *     tags:
 *       - Subjects
 *     summary: Eliminar un subject por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subject
 *     responses:
 *       204:
 *         description: Subject eliminado satisfactoriamente
 *       401:
 *         description: Token faltante
 *       403:
 *         description: Token inválido o no autorizado
 *       404:
 *         description: Subject no encontrado
 */
router.delete('/:id', deleteSubject);

router.put('/change-status/:titleMemoryId', changeStatus)

router.post('/from-file', uploadMemory.array('files'), createFromFiles)

export default router;