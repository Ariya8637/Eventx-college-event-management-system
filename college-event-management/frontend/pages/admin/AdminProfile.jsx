import React, { useEffect, useState } from 'react';
import authService from '../../services/auth.service';

const AdminProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await authService.getProfile();
            setUser(res.data);
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                department: res.data.department || ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await authService.updateProfile(formData);
            setUser(res.data);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="loading-spinner">Loading Profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Staff Profile</h2>

            <div className="card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-color)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 'bold', marginRight: '1.5rem'
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{user?.name}</h3>
                        <span className="badge badge-secondary" style={{ marginTop: '0.5rem' }}>Staff / Admin</span>
                    </div>
                    {!isEditing && (
                        <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input value={formData.email} disabled style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Administration" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">Save Changes</button>
                            <button type="button" className="btn-secondary" style={{ background: '#e5e7eb', color: 'black' }} onClick={() => { setIsEditing(false); setFormData({ ...formData, name: user.name, department: user.department }); }}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-details-view">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#666' }}>Email</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user?.email}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#666' }}>Department</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user?.department || 'Not Set'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProfile;
