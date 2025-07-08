import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import router from '../routers/subject.router';

import * as authSvc from '../services/auth.services';
import * as titleMemorySvc from '../services/titleMemory.services';
import * as subjectSvc from '../services/subject.services';
import * as sloSvc from '../services/skillsLearningOutcome.services';

jest.mock('../services/auth.services');
jest.mock('../services/titleMemory.services');
jest.mock('../services/subject.services');
jest.mock('../services/skillsLearningOutcome.services');

const app = express();
app.use(bodyParser.json());
app.use('/subjects', router);

const VALID_TOKEN = 'valid-token';
const USER_ID = 'user1';

beforeAll(() => {
    (authSvc.validateToken as jest.Mock).mockImplementation(async (token: string) => {
        if (token === VALID_TOKEN) return { isValid: true, userId: USER_ID };
        return { isValid: false, userId: null };
    });
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Rutas /subjects', () => {
    describe('POST /', () => {
        const payload = {
            code: 'C1', name: 'S', credits: 5, type: 'T',
            titleMemoryId: 'm1', skills: { s1: true }, learningsOutcomes: ['o1'],
            nature: 'N', year: 2025, duration: 10, isKey: false,
            parentSubject: null, activities: [], status: 'active'
        };

        it('→ 401 si falta token', async () => {
            const res = await request(app).post('/subjects').send(payload);
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ message: 'Token missing' });
        });

        it('→ 403 si token inválido', async () => {
            const res = await request(app)
                .post('/subjects')
                .set('Authorization', 'Bearer bad')
                .send(payload);
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: 'Invalid token' });
        });

        it('→ 403 si no es owner de titleMemory', async () => {
            (titleMemorySvc.validateTitleMemoryOwnership as jest.Mock)
                .mockResolvedValue(false);
            const res = await request(app)
                .post('/subjects')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(payload);
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: 'User not owner of titleMemory' });
        });

        it('→ 400 si skills inválidas', async () => {
            (titleMemorySvc.validateTitleMemoryOwnership as jest.Mock)
                .mockResolvedValue(true);
            (titleMemorySvc.validateSkills as jest.Mock)
                .mockResolvedValue(false);
            const res = await request(app)
                .post('/subjects')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(payload);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid skills for titleMemory' });
        });

        it('→ 400 si learning outcomes inválidos', async () => {
            (titleMemorySvc.validateTitleMemoryOwnership as jest.Mock)
                .mockResolvedValue(true);
            (titleMemorySvc.validateSkills as jest.Mock)
                .mockResolvedValue(true);
            (titleMemorySvc.validateLearningOutcomes as jest.Mock)
                .mockResolvedValue(false);
            const res = await request(app)
                .post('/subjects')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(payload);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid learning outcomes for titleMemory' });
        });

        it('→ 201 crea subject correctamente', async () => {
            (titleMemorySvc.validateTitleMemoryOwnership as jest.Mock)
                .mockResolvedValue(true);
            (titleMemorySvc.validateSkills as jest.Mock)
                .mockResolvedValue(true);
            (titleMemorySvc.validateLearningOutcomes as jest.Mock)
                .mockResolvedValue(true);
            const created = { _id: 'sub1', ...payload, userId: USER_ID };
            (subjectSvc.createSubject as jest.Mock).mockResolvedValue(created);

            const res = await request(app)
                .post('/subjects')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(payload);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(created);
        });

        it('→ 500 en error interno al crear', async () => {
            (titleMemorySvc.validateTitleMemoryOwnership as jest.Mock).mockResolvedValue(true);
            (titleMemorySvc.validateSkills as jest.Mock).mockResolvedValue(true);
            (titleMemorySvc.validateLearningOutcomes as jest.Mock).mockResolvedValue(true);
            (subjectSvc.createSubject as jest.Mock).mockRejectedValue(new Error('fail'));

            const res = await request(app)
                .post('/subjects')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(payload);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error creating subject');
        });
    });

    describe('GET /', () => {
        it('→ 200 con paginación por defecto', async () => {
            const fake = { data: ['a'], pagination: { page: 1, limit: 10, total: 1 } };
            (subjectSvc.getSubjects as jest.Mock).mockResolvedValue(fake);

            const res = await request(app).get('/subjects');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(fake);
            expect(subjectSvc.getSubjects).toHaveBeenCalledWith(1, 10);
        });
    });

    describe('GET /:id', () => {
        it('→ 200 con objeto enriquecido', async () => {
            const dbObj: any = {
                _id: 'sub1',
                skills: new Map([['s1', true]]),
                learningsOutcomes: [{ toString: () => 'o1' }],
                userId: USER_ID
            };
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(dbObj);
            (sloSvc.getSkillsByIds as jest.Mock).mockResolvedValue(['sk']);
            (sloSvc.getLearningOutcomesByIds as jest.Mock).mockResolvedValue(['lo']);

            const res = await request(app).get('/subjects/sub1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                subject: {
                    _id: 'sub1',
                    skills: {},
                    learningsOutcomes: [{}],
                    userId: 'user1'
                },
                validSkills: ['sk'],
                validLearningOutcomes: ['lo']
            });
        });

        it('→ 404 si no existe', async () => {
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(null);
            const res = await request(app).get('/subjects/none');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Subject not found' });
        });

        it('→ 500 en error interno', async () => {
            (subjectSvc.getSubjectById as jest.Mock).mockRejectedValue(new Error('boom'));
            const res = await request(app).get('/subjects/err');
            expect(res.status).toBe(500);
            expect(res.body.message).toEqual('Internal server error');
        });
    });

    describe('GET /by-memory/:titleMemoryId', () => {
        it('→ 200 lista de subjects', async () => {
            const list = [{ _id: 's1' }];
            (subjectSvc.getSubjectsByMemoryId as jest.Mock).mockResolvedValue(list);
            const res = await request(app).get('/subjects/by-memory/m1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(list);
        });
    });

    describe('PUT /update-skills', () => {
        it('→ 400 si faltan campos', async () => {
            const res = await request(app).put('/subjects/update-skills').send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Skills and titleMemoryId are required' });
        });

        it('→ 200 actualiza skills correctamente', async () => {
            (subjectSvc.replaceSkills as jest.Mock).mockResolvedValue(undefined);
            const res = await request(app)
                .put('/subjects/update-skills')
                .send({ lastSkill: ['s1'], newSkill: 'ns' });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Skills validated successfully' });
            expect(subjectSvc.replaceSkills).toHaveBeenCalledWith('ns', ['s1']);
        });

        it('→ 500 en error interno', async () => {
            (subjectSvc.replaceSkills as jest.Mock).mockRejectedValue(new Error());
            const res = await request(app)
                .put('/subjects/update-skills')
                .send({ lastSkill: ['s1'], newSkill: 'ns' });
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error updating skills');
        });
    });

    describe('PUT /update/outcomes', () => {
        it('→ 400 si faltan campos', async () => {
            const res = await request(app).put('/subjects/update/outcomes').send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Skills and titleMemoryId are required' });
        });

        it('→ 200 actualiza outcomes correctamente', async () => {
            (subjectSvc.replaceOutcomes as jest.Mock).mockResolvedValue(undefined);
            const res = await request(app)
                .put('/subjects/update/outcomes')
                .send({ lastOutcomes: ['o1'], newOutcome: 'no' });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Skills validated successfully' });
            expect(subjectSvc.replaceOutcomes).toHaveBeenCalledWith('no', ['o1']);
        });

        it('→ 500 en error interno', async () => {
            (subjectSvc.replaceOutcomes as jest.Mock).mockRejectedValue(new Error());
            const res = await request(app)
                .put('/subjects/update/outcomes')
                .send({ lastOutcomes: ['o1'], newOutcome: 'no' });
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error updating skills');
        });
    });

    describe('PUT /:id', () => {
        const updateBody = { name: 'New' };

        it('→ 401 si falta token', async () => {
            const res = await request(app).put('/subjects/1').send(updateBody);
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ message: 'Token missing' });
        });

        it('→ 403 si token inválido', async () => {
            const res = await request(app)
                .put('/subjects/1')
                .set('Authorization', 'Bearer bad')
                .send(updateBody);
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: 'Invalid token' });
        });

        it('→ 404 si subject no existe', async () => {
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(null);
            const res = await request(app)
                .put('/subjects/1')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(updateBody);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Subject not found' });
        });

        it('→ 403 si no es owner', async () => {
            const subj = { _id: '1', userId: 'other' };
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(subj);
            const res = await request(app)
                .put('/subjects/1')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(updateBody);
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: 'Unauthorized' });
        });

        it('→ 200 actualiza correctamente', async () => {
            const subj = { _id: '1', userId: USER_ID };
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(subj);
            (subjectSvc.updateSubject as jest.Mock).mockResolvedValue({ ...subj, ...updateBody });

            const res = await request(app)
                .put('/subjects/1')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .send(updateBody);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ ...subj, ...updateBody });
        });
    });

    describe('DELETE /:id', () => {
        it('→ 401 si falta token', async () => {
            const res = await request(app).delete('/subjects/1');
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ message: 'Token missing' });
        });

        it('→ 403 si token inválido', async () => {
            const res = await request(app)
                .delete('/subjects/1')
                .set('Authorization', 'Bearer bad');
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: 'Invalid token' });
        });

        it('→ 404 si subject no existe', async () => {
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(null);
            const res = await request(app)
                .delete('/subjects/1')
                .set('Authorization', `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Subject not found' });
        });

        it('→ 403 si no es owner', async () => {
            const subj = { _id: '1', userId: 'other' };
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(subj);
            const res = await request(app)
                .delete('/subjects/1')
                .set('Authorization', `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: 'Unauthorized' });
        });

        it('→ 204 elimina correctamente', async () => {
            const subj = { _id: '1', userId: USER_ID };
            (subjectSvc.getSubjectById as jest.Mock).mockResolvedValue(subj);
            (subjectSvc.deleteSubject as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app)
                .delete('/subjects/1')
                .set('Authorization', `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(204);
            expect(res.text).toBe('');
        });
    });

    describe('PUT /change-status/:titleMemoryId', () => {
        it('→ 404 si no hay subjects para la memoria', async () => {
            (subjectSvc.getSubjectsByMemoryId as jest.Mock).mockResolvedValue(null);
            const res = await request(app).put('/subjects/change-status/m1').send({ status: 'x' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Subject not found' });
        });

        it('→ 200 actualiza estado del primer subject', async () => {
            const list = [{ _id: 's1', status: 'old' }];
            (subjectSvc.getSubjectsByMemoryId as jest.Mock).mockResolvedValue(list);
            (subjectSvc.updateSubject as jest.Mock).mockResolvedValue({ _id: 's1', status: 'new' });

            const res = await request(app)
                .put('/subjects/change-status/m1')
                .send({ status: 'new' });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ _id: 's1', status: 'new' });
            expect(subjectSvc.updateSubject).toHaveBeenCalledWith('s1', { status: 'new' });
        });
    });

    describe('POST /from-file', () => {
        const goodSubject = {
            code: 'C', name: 'N', credits: 1, type: 'T',
            titleMemoryId: 'm1', skills: { s1: true }, learningsOutcomes: [],
            nature: 'x', year: 2025, duration: 1, isKey: false,
            parentSubject: null, activities: [], status: 'active'
        };

        beforeEach(() => {
            (authSvc.validateToken as jest.Mock).mockResolvedValue({ isValid: true, userId: USER_ID });
            (titleMemorySvc.getTitleMemoryById as jest.Mock).mockResolvedValue({
                _id: 'm1',
                skills: [{ _id: 's1' }],
                learningOutcomes: []
            });
        });

        it('→ 401 si falta token', async () => {
            const res = await request(app).post('/subjects/from-file');
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ message: 'Token missing' });
        });

        it('→ 400 si no hay files', async () => {
            const res = await request(app)
                .post('/subjects/from-file')
                .set('Authorization', `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'No files uploaded' });
        });

        it('→ 400 si falta memoryId', async () => {
            const buf = Buffer.from(JSON.stringify([goodSubject]));
            const res = await request(app)
                .post('/subjects/from-file')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .attach('files', buf, 'subj.json');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Memory ID is required' });
        });

        it('→ 400 si JSON inválido', async () => {
            const buf = Buffer.from('not json');
            const res = await request(app)
                .post('/subjects/from-file')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .field('memoryId', 'm1')
                .attach('files', buf, 'bad.json');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid JSON format in file');
        });

        it('→ 400 si skills no existen en titleMemory', async () => {
            const subjArr = [{ ...goodSubject, skills: { bad: true } }];
            const buf = Buffer.from(JSON.stringify(subjArr));
            const res = await request(app)
                .post('/subjects/from-file')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .field('memoryId', 'm1')
                .attach('files', buf, 'bad.json');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Some skills do not exist in the title memory' });
        });

        it('→ 201 crea subjects desde archivos', async () => {
            const subjArr = [goodSubject, goodSubject];
            const buf = Buffer.from(JSON.stringify(subjArr));
            (subjectSvc.createSubject as jest.Mock)
                .mockImplementation(async subj => ({ ...subj, _id: 'new' }));

            const res = await request(app)
                .post('/subjects/from-file')
                .set('Authorization', `Bearer ${VALID_TOKEN}`)
                .field('memoryId', 'm1')
                .attach('files', buf, 'good.json');
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('subjects');
            expect(res.body.subjects).toHaveLength(2);
            expect(res.body).toMatchObject({ count: 2, memoryId: 'm1' });
        });
    });
});