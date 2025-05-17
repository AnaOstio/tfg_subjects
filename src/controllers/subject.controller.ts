import { Request, Response } from 'express';
import {
    createSubject,
    getSubjects,
    getSubjectById,
    getSubjectsByMemoryId,
    updateSubject,
    deleteSubject
} from '../services/subject.service';
import { validateToken } from '../services/auth.service';
import { validateTitleMemoryOwnership, validateSkills, validateLearningOutcomes } from '../services/titleMemory.service';

export const createSubjectController = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const { isValid, userId } = await validateToken(token);
    if (!isValid || !userId) return res.status(403).json({ message: 'Invalid token' });

    const {
        code, name, credits, type, titleMemoryId, skills = {}, learningsOutcomes = [],
        nature, year, duration, isKey, parentSubject, activities, status
    } = req.body;

    const isOwner = await validateTitleMemoryOwnership(titleMemoryId, userId);
    if (!isOwner) return res.status(403).json({ message: 'User not owner of titleMemory' });

    const validSkills = await validateSkills(titleMemoryId, Object.keys(skills));
    if (!validSkills) return res.status(400).json({ message: 'Invalid skills for titleMemory' });

    const validLO = await validateLearningOutcomes(titleMemoryId, learningsOutcomes);
    if (!validLO) return res.status(400).json({ message: 'Invalid learning outcomes for titleMemory' });

    try {
        const newSubject = await createSubject({
            code, name, credits, type, titleMemoryId, skills, learningsOutcomes,
            nature, year, duration, isKey, parentSubject, activities, status, userId
        });
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(500).json({ message: 'Error creating subject', error: err });
    }
};

export const getSubjectsController = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const subjects = await getSubjects(page, limit);
    res.json(subjects);
};

export const getSubjectByIdController = async (req: Request, res: Response) => {
    const subject = await getSubjectById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
};

export const getSubjectsByMemoryIdController = async (req: Request, res: Response) => {
    const subjects = await getSubjectsByMemoryId(req.params.titleMemoryId);
    res.json(subjects);
};

export const updateSubjectController = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const { isValid, userId } = await validateToken(token);
    if (!isValid || !userId) return res.status(403).json({ message: 'Invalid token' });

    const subject = await getSubjectById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.userId.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    const updated = await updateSubject(req.params.id, req.body);
    res.json(updated);
};

export const deleteSubjectController = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const { isValid, userId } = await validateToken(token);
    if (!isValid || !userId) return res.status(403).json({ message: 'Invalid token' });

    const subject = await getSubjectById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.userId.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await deleteSubject(req.params.id);
    res.status(204).send();
};
