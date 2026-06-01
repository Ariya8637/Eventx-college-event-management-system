import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login(formData.email, formData.password, formData.role);
            login(response.user, response.token);

            if (response.user.role === 'admin') {
                navigate('/admin/overview');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="form-container">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>Welcome Back</h2>
            {error && <div className="badge badge-warning" style={{ marginBottom: '1rem', display: 'block', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="role"
                            value="student"
                            checked={formData.role === 'student'}
                            onChange={() => { setFormData({ ...formData, role: 'student' }); setError(''); }}
                        />
                        Student
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="role"
                            value="admin"
                            checked={formData.role === 'admin'}
                            onChange={() => { setFormData({ ...formData, role: 'admin' }); setError(''); }}
                        />
                        Staff (Admin)
                    </label>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(''); }}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">Login</button>
            </form>
            {formData.role === 'student' && (
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--primary-color)' }}>Register here</a>
                </p>
            )}
        </div>
    );
};

export default Login;
