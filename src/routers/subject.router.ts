import { Router } from 'express';
import {
    createSubjectController,
    getSubjectsController,
    getSubjectByIdController,
    getSubjectsByMemoryIdController,
    updateSubjectController,
    deleteSubjectController
} from '../controllers/subject.controller';

const router = Router();

router.post('/', createSubjectController);
router.get('/', getSubjectsController);
router.get('/:id', getSubjectByIdController);
router.get('/by-memory/:titleMemoryId', getSubjectsByMemoryIdController);
router.put('/:id', updateSubjectController);
router.delete('/:id', deleteSubjectController);

export default router;
