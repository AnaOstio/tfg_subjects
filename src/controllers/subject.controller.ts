import { Request, Response } from 'express';
import { validateToken } from '../services/auth.service';
import {
    createSubject,
    getSubjectsByUser,
    getSubjectById,
    updateSubject,
    bulkCreateSubjects,
    deleteSubject,
    getSubjectsByTitleOrCode,
    getAllSubjects,
    // deleteSubject
} from '../services/subject.service';
import { ISubjectCreate, ISubjectQuery } from '../interfaces/subject.interfaces';

export const createSubjectController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { isValid, userId } = await validateToken(token);
        if (!isValid || !userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const subjectData: ISubjectCreate = {
            ...req.body,
            userId
        };

        const subject = await createSubject(subjectData);
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getSubjectsController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { isValid, userId } = await validateToken(token);
        if (!isValid || !userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const subjects = await getSubjectsByUser(userId);
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getSubjectController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { isValid, userId } = await validateToken(token);
        if (!isValid || !userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const subject = await getSubjectById(req.params.id, userId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateSubjectController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { isValid, userId } = await validateToken(token);
        if (!isValid || !userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const subject = await updateSubject(req.params.id, userId, req.body);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json(subject);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getAllSubjectsController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { isValid } = await validateToken(token);
        if (!isValid) return res.status(401).json({ message: 'Invalid token' });

        const result = await getAllSubjects(req.query as ISubjectQuery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getSubjectsByTitleOrCodeController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { isValid } = await validateToken(token);
        if (!isValid) return res.status(401).json({ message: 'Invalid token' });

        const search = req.query.search as string;
        if (!search) return res.status(400).json({ message: 'Search parameter is required' });

        const result = await getSubjectsByTitleOrCode(search, req.query as ISubjectQuery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const bulkCreateSubjectsController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { isValid, userId } = await validateToken(token);
        if (!isValid || !userId) return res.status(401).json({ message: 'Invalid token' });

        const subjectsData = req.body.map((subject: ISubjectCreate) => ({
            ...subject,
            userId
        }));

        const result = await bulkCreateSubjects(subjectsData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteSubjectController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { isValid, userId } = await validateToken(token);
        if (!isValid || !userId) return res.status(401).json({ message: 'Invalid token' });

        const success = await deleteSubject(req.params.id, userId);
        if (!success) return res.status(404).json({ message: 'Subject not found or not owned by user' });

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};