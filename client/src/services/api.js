import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const saveProfile = async (profileData) => {
    try {
        const response = await api.post('/student/profile', profileData);
        return response.data;
    } catch (error) {
        console.error("Error saving profile:", error);
        throw error;
    }
};

export const updateProfile = async (id, updates) => {
    try {
        const response = await api.patch(`/student/profile/${id}`, updates);
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const getNextQuestion = async (currentProfile) => {
    try {
        const response = await api.post('/ai/next-question', { studentId: currentProfile });
        return response.data;
    } catch (error) {
        console.error("Error fetching next question:", error);
        throw error;
    }
}

export const getRecommendations = async (profileId) => {
    try {
        // Based on README: POST /api/ai/recommend
        // Usually needs profile data or ID. Assuming it might take the profile object or ID.
        // Let's assume it takes the profile object for now based on typical stateless AI APIs, 
        // or uses the ID if persisted. README says "Get ... recommendations", endpoints list `POST`.
        // I'll send the profile ID if I have it, or the whole profile.
        // Let's assume we send the profile ID if we saved it.
        const response = await api.post('/ai/recommend', { studentId: profileId });
        return response.data;
    } catch (error) {
        console.error("Error getting recommendations:", error);
        throw error;
    }
}

export const getRoadmap = async (profileId) => {
    try {
        const response = await api.post('/ai/roadmap', { studentId: profileId });
        return response.data;
    } catch (error) {
        console.error("Error getting roadmap:", error);
        throw error;
    }
}

export default api;
