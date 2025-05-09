import mongoose, { Document, Schema } from 'mongoose';

export enum SubjectCharacter {
    OPTATIVA = 'Optativa',
    OBLIGATORIA = 'Obligatoria',
    TRABAJO_FIN_CARRERA = 'Trabajo Fin de Carrera',
    FORMACION_BASICA = 'Formación básica',
    PRACTICAS_EXTERNAS = 'Prácticas Externas'
}

export interface ISkillCredit {
    skillId: mongoose.Types.ObjectId;
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
    learningOutcomes: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SubjectSchema: Schema = new Schema({
    titleCode: { type: Number, default: 1, required: true },
    universities: { type: [String], required: true },
    centers: { type: [String], required: true },
    academicLevel: { type: String, required: true },
    branch: { type: String, required: true },
    academicField: { type: String, required: true },
    status: { type: String, required: true },
    yearDelivery: { type: Number, required: true },
    totalCredits: { type: Number, required: true },
    distributedCredits: {
        type: Map,
        of: Number,
        required: true
    },
    skills: [{
        skillId: { type: Schema.Types.ObjectId, required: true },
        hours: { type: Number, required: true }
    }],
    learningOutcomes: [{ type: Schema.Types.ObjectId, required: true }],
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISubject>('Subject', SubjectSchema);