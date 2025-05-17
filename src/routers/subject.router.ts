import { Router } from 'express';
import { createSubjectController } from '../controllers/subject.controller';

const router = Router();

router.post('/', createSubjectController);

export default router;
