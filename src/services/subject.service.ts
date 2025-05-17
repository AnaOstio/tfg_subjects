import { Subject } from '../models/subject.model';
import { Types } from 'mongoose';

export const createSubject = async (data: any) => {
    const subject = new Subject(data);
    return await subject.save();
};

export const getSubjects = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const [subjects, total] = await Promise.all([
        Subject.find().skip(skip).limit(limit),
        Subject.countDocuments()
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
