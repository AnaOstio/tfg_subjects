import axios from 'axios';

const SKILLS_SERVICE_URL = process.env.SKILLS_SERVICE_URL || 'http://localhost:3001';

export const validateSkills = async (skillIds: string[]): Promise<boolean> => {
    try {
        const response = await axios.post(`${SKILLS_SERVICE_URL}/api/skills/validate`, { skillIds });
        return response.data.valid;
    } catch (error) {
        return false;
    }
};

export const validateLearningOutcomes = async (outcomeIds: string[]): Promise<boolean> => {
    try {
        const response = await axios.post(`${SKILLS_SERVICE_URL}/api/learning-outcomes/validate`, { outcomeIds });
        return response.data.valid;
    } catch (error) {
        return false;
    }
};