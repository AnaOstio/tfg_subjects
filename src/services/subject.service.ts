import { Subject } from '../models/subject.model';
import { Types } from 'mongoose';

export const createSubject = async (data: any) => {
    const subject = new Subject(data);
    return await subject.save();
};

export const getSubjects = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const filter = { status: { $ne: 'deleted' } };
    const [subjects, total] = await Promise.all([
        Subject.find(filter).skip(skip).limit(limit),
        Subject.countDocuments(filter)
    ]);
    return {
        data: subjects,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

export const getSubjectById = async (id: string) => {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Subject.findById(id);
};

export const getSubjectsByMemoryId = async (titleMemoryId: string) => {
    if (!Types.ObjectId.isValid(titleMemoryId)) return [];
    return await Subject.find({ titleMemoryId });
};

export const updateSubject = async (id: string, update: any) => {
    return await Subject.findByIdAndUpdate(id, update, { new: true });
};

export const deleteSubject = async (id: string) => {
    return await Subject.findByIdAndDelete(id);
};

export const replaceSkills = async (newOutcomeId: string, oldOutcomeIds: string[]) => {
    if (!newOutcomeId || !oldOutcomeIds?.length) {
        throw new Error('Debes indicar newOutcomeId y al menos un oldOutcomeId');
    }

    const renameMap: Record<string, string> = {};
    for (const oldId of oldOutcomeIds) {
        renameMap[`skills.${oldId}`] = `skills.${newOutcomeId}`;
    }

    const filter = {
        $or: oldOutcomeIds.map(id => ({ [`skills.${id}`]: { $exists: true } }))
    };

    return await Subject.updateMany(filter, { $rename: renameMap }).exec();
}

export const replaceOutcomes = async (newOutcomeId: string, oldOutcomeIds: string[]) => {
    if (!newOutcomeId || !oldOutcomeIds?.length) {
        throw new Error('Debes proporcionar newOutcomeId y al menos un oldOutcomeId');
    }

    const newOid = new Types.ObjectId(newOutcomeId);
    const oldOids = oldOutcomeIds.map(id => new Types.ObjectId(id));

    // Solo los documentos que contengan al menos uno de los antiguos
    const filter = { learningsOutcomes: { $in: oldOids } };

    // Uso de arrayFilters para reemplazar en línea cada elemento coincidente
    return Subject.updateMany(
        filter,
        { $set: { 'learningsOutcomes.$[elem]': newOid } },
        {
            arrayFilters: [
                { 'elem': { $in: oldOids } }
            ]
        }
    ).exec();
}