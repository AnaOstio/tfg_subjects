import axios from 'axios';

const SKILLS_SERVICE_URL = process.env.SKILLS_SERVICE_URL || 'http://localhost:3001';

export const validateSkills = async (skillIds: string[]): Promise<boolean> => {
    try {
        const response = await axios.post(`${SKILLS_SERVICE_URL}/skills/validate`, { skillIds });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export const validateLearningOutcomes = async (learningOutcomesIds: string[]): Promise<boolean> => {
    try {
        const response = await axios.post(`${SKILLS_SERVICE_URL}/learning-outcomes/validate`, { learningOutcomesIds });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export const getSkillsByIds = async (skillIds: string[]): Promise<any[]> => {
    try {
        const response = await axios.post(`${SKILLS_SERVICE_URL}/api/skills/getAll`, { skillIds });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching skills');
    }
}

export const getLearningOutcomesByIds = async (learningOutcomesIds: string[]): Promise<any[]> => {
    try {
        const response = await axios.post(`${SKILLS_SERVICE_URL}/api/learning-outcomes/getAll`, { learningOutcomesIds });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching learning outcomes');
    }
}
