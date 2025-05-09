import { Document } from 'mongoose';
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