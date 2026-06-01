import api from './api.service';

const login = async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // User info is also in response.data.user
    }
    return response.data;
};

const register = async (userData) => {
    return await api.post('/auth/register', userData);
};

const logout = () => {
    localStorage.removeItem('token');
};

const getProfile = async () => {
    return await api.get('/auth/profile');
};

const updateProfile = async (userData) => {
    return await api.put('/auth/profile', userData);
};

export default { login, register, logout, getProfile, updateProfile };
