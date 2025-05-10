import mongoose, { Document } from 'mongoose';
import { SubjectCharacter } from '../models/subject.model';

export interface ISkillCredit {
    skillId: string;
    hours: number;
}

export interface IDistributedCredits {
    [key: string]: number;
}

export interface ISubject extends Document {
    titleCode: number;
    universities: string[];
    centers: string[];
    academicLevel: string;
    branch: string;
    academicField: string;
    status: string;
    yearDelivery: number;
    totalCredits: number;
    distributedCredits: IDistributedCredits;
    skills: ISkillCredit[];
    learningOutcomes: string[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISubjectCreate {
    titleCode?: number;
    universities: string[];
    centers: string[];
    academicLevel: string;
    branch: string;
    academicField: string;
    status: string;
    yearDelivery: number;
    totalCredits: number;
    distributedCredits: IDistributedCredits;
    skills: ISkillCredit[];
    learningOutcomes: string[];
    userId: string;
}

export interface IPaginationOptions {
    page?: number;
    limit?: number;
}

export interface IPaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface ISubjectQuery extends IPaginationOptions {
    search?: string;
    userId?: string;
}

export interface ISubjectBulkCreate extends Omit<ISubjectCreate, 'userId'> {
    userId: mongoose.Types.ObjectId;
}