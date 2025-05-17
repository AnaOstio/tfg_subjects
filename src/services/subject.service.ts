import { Subject } from '../models/subject.model';

export const createSubject = async (data: any) => {
    const subject = new Subject(data);
    return await subject.save();
};