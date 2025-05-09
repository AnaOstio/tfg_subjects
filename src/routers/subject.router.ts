import { Router } from 'express';
import {
    createSubjectController,
    getSubjectsController,
    getSubjectController,
    updateSubjectController,
    // deleteSubjectController
} from '../controllers/subject.controller';

const router = Router();

router.post('/', createSubjectController);
router.get('/', getSubjectsController);
router.get('/:id', getSubjectController);
router.put('/:id', updateSubjectController);
// router.delete('/:id', deleteSubjectController);

export default router;