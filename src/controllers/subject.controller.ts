import e, { Request, Response } from 'express';
import {
    createSubject,
    getSubjects,
    getSubjectById,
    getSubjectsByMemoryId,
    updateSubject,
    deleteSubject as deleteSubjectService,
    replaceSkills,
    replaceOutcomes
} from '../services/subject.services';
import { validateToken } from '../services/auth.services';
import { validateTitleMemoryOwnership, validateSkills, validateLearningOutcomes, getTitleMemoryById } from '../services/titleMemory.services';
import { getLearningOutcomesByIds, getSkillsByIds } from '../services/skillsLearningOutcome.services';
import { Types } from 'mongoose';

export const create = async (req: Request, res: Response) => {
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

export const getAll = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const subjects = await getSubjects(page, limit);
    res.json(subjects);
};

export const getById = async (req: Request, res: Response) => {
    try {
        const subject = await getSubjectById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        const skills = subject.skills ? Array.from(subject.skills?.keys()) : [];
        const validSkills = await getSkillsByIds(skills);

        const learningsOutcomes = subject.learningsOutcomes;
        const validLearningOutcomes = await getLearningOutcomesByIds(learningsOutcomes.map(lo => lo.toString()));
        res.json({ subject, validSkills, validLearningOutcomes });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

export const getByTitleMemory = async (req: Request, res: Response) => {
    const subjects = await getSubjectsByMemoryId(req.params.titleMemoryId);
    res.json(subjects);
};

export const update = async (req: Request, res: Response) => {
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

export const deleteSubject = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const { isValid, userId } = await validateToken(token);
    if (!isValid || !userId) return res.status(403).json({ message: 'Invalid token' });

    const subject = await getSubjectById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.userId.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await deleteSubjectService(req.params.id);
    res.status(204).send();
};

export const changeStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const id = req.params.titleMemoryId;
    const subject = await getSubjectsByMemoryId(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const updatedSubject = await updateSubject(subject[0]._id.toString(), { status });
    res.json(updatedSubject);
};

export const createFromFiles = async (req: Request, res: Response) => {
    try {
        const auth = req.headers.authorization?.split(' ')[1];
        if (!auth) return res.status(401).json({ message: 'Token missing' });

        const { isValid, userId } = await validateToken(auth);
        if (!isValid || !userId) return res.status(403).json({ message: 'Invalid token' });

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const memoryId = req.body.memoryId;
        if (!memoryId) {
            return res.status(400).json({ message: 'Memory ID is required' });
        }

        // obtencion de la memoria
        const titleMemory = await getTitleMemoryById(memoryId);
        const learningOutcomes = titleMemory?.learningOutcomes || [];

        const subjects = [];
        for (const file of files) {
            const content = file.buffer.toString('utf-8');
            let jsonArray: any;

            try {
                jsonArray = JSON.parse(content);
            } catch (err) {
                return res.status(400).json({ message: 'Invalid JSON format in file', error: err });
            }

            for (const subjectData of jsonArray) {

                // Validate and set userId
                subjectData.userId = userId;

                // Validate titleMemory ownership
                const subjectSkills = Object.keys(subjectData.skills || {});
                const allExist = subjectSkills
                    .every(id => titleMemory.skills.some((skill: any) => skill._id === id));

                if (!allExist) {
                    return res.status(400).json({ message: 'Some skills do not exist in the title memory' });
                }

                const filtered = titleMemory.learningOutcomes.filter((outcome: any) =>
                    outcome.skills_id.every((id: any) => subjectSkills.includes(id))
                );

                subjectData.titleMemoryId = memoryId;
                subjectData.learningOutcomes = filtered.map((outcome: any) => new Types.ObjectId(outcome._id));

                const newSubject = await createSubject(subjectData);
                subjects.push(newSubject);
            }
        }
        res.status(201).json({ message: 'Subjects created successfully', subjects, count: subjects.length, memoryId });


    } catch (err) {
        res.status(500).json({ message: 'Error creating subjects from files', error: err });
    }
}

export const updateSkills = async (req: Request, res: Response) => {
    console.log('Updating skills...');
    const { lastSkill, newSkill } = req.body;
    if (!lastSkill || !newSkill) {
        return res.status(400).json({ message: 'Skills and titleMemoryId are required' });
    }

    console.log('Updating skills:', { lastSkill, newSkill });

    try {
        await replaceSkills(newSkill, lastSkill);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating skills', error });
    }

    res.json({ message: 'Skills validated successfully' });
}

export const updateOutcomes = async (req: Request, res: Response) => {
    console.log('Updating skills...');
    const { lastOutcomes, newOutcome } = req.body;
    if (!lastOutcomes || !newOutcome) {
        return res.status(400).json({ message: 'Skills and titleMemoryId are required' });
    }

    console.log('Updating skills:', { lastOutcomes, newOutcome });

    try {
        await replaceOutcomes(newOutcome, lastOutcomes);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating skills', error });
    }

    res.json({ message: 'Skills validated successfully' });
}