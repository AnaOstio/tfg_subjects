import { Router } from 'express';
import {
    createSubjectController,
    getSubjectsController,
    getSubjectController,
    updateSubjectController,
    getAllSubjectsController,
    getSubjectsByTitleOrCodeController,
    bulkCreateSubjectsController,
    deleteSubjectController,
} from '../controllers/subject.controller';

const router = Router();

router.post('/', createSubjectController);
router.get('/', getAllSubjectsController);
router.get('/search', getSubjectsByTitleOrCodeController);
router.get('/user', getSubjectsController);
router.get('/:id', getSubjectController);
router.post('/bulk', bulkCreateSubjectsController);
router.put('/:id', updateSubjectController);
router.delete('/:id', deleteSubjectController);

export default router;