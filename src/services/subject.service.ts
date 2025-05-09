import { ISubjectCreate } from '../interfaces/subject.interfaces';
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

// export const deleteSubject = async (id: string, userId: string): Promise<ISubject | null> => {
//     return await Subject.findOneAndDelete({ _id: id, userId }).exec();
// };