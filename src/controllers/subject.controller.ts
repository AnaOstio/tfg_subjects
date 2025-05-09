import { Request, Response } from 'express';
import { validateToken } from '../services/auth.service';
import {
    createSubject,
    getSubjectsByUser,
    getSubjectById,
    updateSubject,
    // deleteSubject
} from '../services/subject.service';
import { ISubjectCreate } from '../interfaces/subject.interfaces';

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

// export const deleteSubjectController = async (req: Request, res: Response) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) {
//             return res.status(401).json({ message: 'No token provided' });
//         }

//         const { isValid, userId } = await validateToken(token);
//         if (!isValid || !userId) {
//             return res.status(401).json({ message: 'Invalid token' });
//         }

//         const subject = await deleteSubject(req.params.id, userId);
//         if (!subject) {
//             return res.status(404).json({ message: 'Subject not found' });
//         }
//         res.status(200).json({ message: 'Subject deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: (error as Error).message });
//     }
// };