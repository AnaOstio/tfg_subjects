import { Request, Response } from 'express';
import { createSubject } from '../services/subject.service';
import { validateToken } from '../services/auth.service';
import { validateTitleMemoryOwnership, validateSkills, validateLearningOutcomes } from '../services/titleMemory.service';

export const createSubjectController = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const { isValid, userId } = await validateToken(token);
    if (!isValid || !userId) return res.status(403).json({ message: 'Invalid token' });

    const {
        code,
        name,
        credits,
        type,
        titleMemoryId,
        skills,
        learningsOutcomes,
        nature,
        year,
        duration,
        isKey,
        parentSubject,
        activities,
        status
    } = req.body;

    // Check title memory belongs to user
    const isOwner = await validateTitleMemoryOwnership(titleMemoryId, userId);
    if (!isOwner) return res.status(403).json({ message: 'User not owner of titleMemory' });

    const skillIds = Object.keys(skills || {});
    const learningOutcomeIds = learningsOutcomes || [];

    const validSkills = await validateSkills(titleMemoryId, skillIds);
    if (!validSkills) return res.status(400).json({ message: 'Invalid skills for titleMemory' });

    const validLO = await validateLearningOutcomes(titleMemoryId, learningOutcomeIds);
    if (!validLO) return res.status(400).json({ message: 'Invalid learning outcomes for titleMemory' });

    try {
        const newSubject = await createSubject({
            code,
            name,
            credits,
            type,
            titleMemoryId,
            skills,
            learningsOutcomes,
            nature,
            year,
            duration,
            isKey,
            parentSubject,
            activities,
            status,
            userId
        });
        return res.status(201).json(newSubject);
    } catch (err) {
        return res.status(500).json({ message: 'Error creating subject', error: err });
    }
};
