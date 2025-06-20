import axios from 'axios';

const TITLE_MEMORY_SERVICE_URL = process.env.TITLE_MEMORY_SERVICE_URL || 'http://localhost:3003';

// Este de aqui deberia de ir a permisos jajajjaj
export const validateTitleMemoryOwnership = async (titleMemoryId: string, userId: string): Promise<boolean> => {
    try {
        const response = await axios.post(`${TITLE_MEMORY_SERVICE_URL}/api/title-memories/check-title`, {
            titleMemoryId,
            userId
        });
        return response.status === 200;
    } catch {
        return false;
    }
};

export const validateSkills = async (titleMemoryId: string, skills: string[]): Promise<boolean> => {
    try {
        const response = await axios.post(`${TITLE_MEMORY_SERVICE_URL}/api/title-memories/validate-skills`, {
            titleMemoryId,
            skills
        });
        return response.status === 200;
    } catch {
        return false;
    }
};

export const validateLearningOutcomes = async (titleMemoryId: string, learningOutcomes: string[]): Promise<boolean> => {
    try {
        const response = await axios.post(`${TITLE_MEMORY_SERVICE_URL}/api/title-memories/validate-lerning-outcomes`, {
            titleMemoryId,
            learningOutcomes
        });
        return response.status === 200;
    } catch {
        return false;
    }
};
