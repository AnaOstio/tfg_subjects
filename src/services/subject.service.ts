import mongoose from 'mongoose';
import { IPaginatedResult, ISubjectCreate, ISubjectQuery } from '../interfaces/subject.interfaces';
import Subject, { ISubject } from '../models/subject.model';
import { validateLearningOutcomes, validateSkills } from './skillsLearningOutcome.service';

export const createSubject = async (subjectData: ISubjectCreate): Promise<ISubject> => {
    // Validar skills
    const skillIds = subjectData.skills.map(skill => skill.skillId);
    const areSkillsValid = await validateSkills(skillIds);
    if (!areSkillsValid) {
        throw new Error('Algunas skills no son válidas');
    }

    // Validar learning outcomes
    const areOutcomesValid = await validateLearningOutcomes(subjectData.learningOutcomes);
    if (!areOutcomesValid) {
        throw new Error('Algunos learning outcomes no son válidos');
    }

    const subject = new Subject({
        ...subjectData,
        titleCode: subjectData.titleCode || 1
    });

    return await subject.save();
};

export const getSubjectsByUser = async (userId: string): Promise<ISubject[]> => {
    return await Subject.find({ userId }).exec();
};

export const getSubjectById = async (id: string, userId: string): Promise<ISubject | null> => {
    return await Subject.findOne({ _id: id, userId }).exec();
};

export const updateSubject = async (id: string, userId: string, updateData: Partial<ISubjectCreate>): Promise<ISubject | null> => {
    if (updateData.skills) {
        const skillIds = updateData.skills.map(skill => skill.skillId);
        const areSkillsValid = await validateSkills(skillIds);
        if (!areSkillsValid) {
            throw new Error('Algunas skills no son válidas');
        }
    }

    if (updateData.learningOutcomes) {
        const areOutcomesValid = await validateLearningOutcomes(updateData.learningOutcomes);
        if (!areOutcomesValid) {
            throw new Error('Algunos learning outcomes no son válidos');
        }
    }

    return await Subject.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
    ).exec();
};

export const getAllSubjects = async (query: ISubjectQuery): Promise<IPaginatedResult<ISubject>> => {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        Subject.find().skip(skip).limit(limit),
        Subject.countDocuments()
    ]);

    return { data, total, page, limit };
};

export const getSubjectsByTitleOrCode = async (search: string, query: ISubjectQuery): Promise<IPaginatedResult<ISubject>> => {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = {
        $or: [
            { titleCode: { $regex: search, $options: 'i' } },
            { centers: { $in: [new RegExp(search, 'i')] } },
            { universities: { $in: [new RegExp(search, 'i')] } }
        ]
    };

    const [data, total] = await Promise.all([
        Subject.find(filter).skip(skip).limit(limit),
        Subject.countDocuments(filter)
    ]);

    return { data, total, page, limit };
};

export const bulkCreateSubjects = async (subjectsData: ISubjectCreate[]): Promise<ISubject[]> => {
    // Validación batch de skills y learning outcomes
    const allSkillIds = subjectsData.flatMap(subject =>
        subject.skills.map(skill => skill.skillId)
    );
    const allOutcomeIds = subjectsData.flatMap(subject =>
        subject.learningOutcomes
    );

    const [areSkillsValid, areOutcomesValid] = await Promise.all([
        validateSkills(allSkillIds),
        validateLearningOutcomes(allOutcomeIds)
    ]);

    if (!areSkillsValid || !areOutcomesValid) {
        throw new Error('Algunas skills o learning outcomes no son válidas');
    }

    // Asegurar que titleCode tenga un valor por defecto
    const subjectsWithDefaults = subjectsData.map(subject => ({
        ...subject,
        titleCode: subject.titleCode || 1, // Valor por defecto
        userId: new mongoose.Types.ObjectId(subject.userId) // Asegurar ObjectId
    }));

    const result = await Subject.insertMany(subjectsWithDefaults);
    return result as unknown as ISubject[];
};

export const deleteSubject = async (id: string, userId: string): Promise<boolean> => {
    const result = await Subject.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
};