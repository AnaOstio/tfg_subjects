import { Schema, model, Types } from 'mongoose';

const subjectSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    type: { type: String, required: true },
    titleMemoryId: { type: Types.ObjectId, required: true },
    skills: { type: Map, of: Number },
    learningsOutcomes: [{ type: Types.ObjectId }],
    nature: { type: String },
    year: { type: Number },
    duration: { type: String },
    isKey: { type: Boolean },
    parentSubject: { type: String },
    activities: { type: Map, of: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    userId: { type: Types.ObjectId, required: true }
});

export const Subject = model('Subject', subjectSchema);
