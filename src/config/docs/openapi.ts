/**
 * @openapi
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Unique subject code
 *         name:
 *           type: string
 *           description: Subject name
 *         credits:
 *           type: integer
 *           description: Number of credits
 *         type:
 *           type: string
 *           description: Type of subject
 *         titleMemoryId:
 *           type: string
 *           format: objectId
 *           description: Reference to the TitleMemory
 *         skills:
 *           type: object
 *           description: Map of skill IDs to proficiency levels
 *           additionalProperties:
 *             type: number
 *         learningsOutcomes:
 *           type: array
 *           description: Array of learning‐outcome IDs
 *           items:
 *             type: string
 *             format: objectId
 *         nature:
 *           type: string
 *           description: Nature of the subject
 *         year:
 *           type: integer
 *           description: Academic year
 *         duration:
 *           type: string
 *           description: Duration (e.g., "1 semester")
 *         isKey:
 *           type: boolean
 *           description: Whether this is a key subject
 *         parentSubject:
 *           type: string
 *           description: Code of the parent subject, if any
 *         activities:
 *           type: object
 *           description: Map of activity IDs to weights
 *           additionalProperties:
 *             type: number
 *         status:
 *           type: string
 *           enum:
 *             - active
 *             - inactive
 *           description: Current status
 *         userId:
 *           type: string
 *           format: objectId
 *           description: Owner user ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last-update timestamp
 *       required:
 *         - code
 *         - name
 *         - credits
 *         - type
 *         - titleMemoryId
 *         - userId
 *
 *     SubjectInput:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         credits:
 *           type: integer
 *         type:
 *           type: string
 *         titleMemoryId:
 *           type: string
 *           format: objectId
 *         skills:
 *           type: object
 *           additionalProperties:
 *             type: number
 *         learningsOutcomes:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *         nature:
 *           type: string
 *         year:
 *           type: integer
 *         duration:
 *           type: string
 *         isKey:
 *           type: boolean
 *         parentSubject:
 *           type: string
 *         activities:
 *           type: object
 *           additionalProperties:
 *             type: number
 *         status:
 *           type: string
 *           enum:
 *             - active
 *             - inactive
 *       required:
 *         - code
 *         - name
 *         - credits
 *         - type
 *         - titleMemoryId
 */
