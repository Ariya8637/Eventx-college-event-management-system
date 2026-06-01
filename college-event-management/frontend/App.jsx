import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import StudentDashboard from './pages/StudentDashboard';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import Certificates from './pages/Certificates';
import SavedEvents from './pages/SavedEvents';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminProfile from './pages/admin/AdminProfile';
import AttendanceManager from './pages/admin/AttendanceManager';
import EventManagement from './pages/admin/EventManagement';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import StudentNavbar from './components/StudentNavbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

// Layouts
const StudentLayout = ({ children }) => {
    return (
        <>
            <StudentNavbar />
            <div className="main-content" style={{ minHeight: '80vh', paddingBottom: '2rem' }}>
                {children}
            </div>
            <Footer />
        </>
    );
};

const AdminLayout = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <nav style={{
                background: 'white',
                padding: '1rem 2rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem'
            }}>
                <Link to="/admin/overview" style={{
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: '#4f46e5',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}>Eventx Admin</Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <NavLink to="/admin/overview" style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#4f46e5' : '#4b5563',
                        fontWeight: isActive ? '600' : 'normal'
                    })}>Overview</NavLink>
                    <NavLink to="/admin/events" style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#4f46e5' : '#4b5563',
                        fontWeight: isActive ? '600' : 'normal'
                    })}>Events</NavLink>
                    <NavLink to="/admin/attendance" style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#4f46e5' : '#4b5563',
                        fontWeight: isActive ? '600' : 'normal'
                    })}>Attendance</NavLink>
                    <NavLink to="/admin/profile" style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#4f46e5' : '#4b5563',
                        fontWeight: isActive ? '600' : 'normal'
                    })}>Profile</NavLink>
                    <button onClick={handleLogout} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#ef4444', fontWeight: '500', fontSize: '1rem'
                    }}>Logout</button>
                </div>
            </nav>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Events can be public or protected depending on requirements, 
            allowing public view for now but using Student Layout for consistency if logged in check handled gracefully */}
                {/* Events - Protected now as per requirement */}
                <Route path="/events" element={
                    <ProtectedRoute role="student">
                        <StudentLayout>
                            <Events />
                        </StudentLayout>
                    </ProtectedRoute>
                } />
                <Route path="/events/:id" element={
                    <ProtectedRoute role="student">
                        <StudentLayout>
                            <EventDetails />
                        </StudentLayout>
                    </ProtectedRoute>
                } />

                {/* Student Routes */}
                <Route path="/student/dashboard" element={
                    <ProtectedRoute role="student">
                        <StudentLayout>
                            <StudentDashboard />
                        </StudentLayout>
                    </ProtectedRoute>
                } />
                <Route path="/my-registrations" element={
                    <ProtectedRoute role="student">
                        <StudentLayout>
                            <MyRegistrations />
                        </StudentLayout>
                    </ProtectedRoute>
                } />
                <Route path="/saved-events" element={
                    <ProtectedRoute role="student">
                        <StudentLayout>
                            <SavedEvents />
                        </StudentLayout>
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute role="student">
                        <StudentLayout>
                            <Profile />
                        </StudentLayout>
                    </ProtectedRoute>
                } />
                <Route path="/certificates" element={
                    <ProtectedRoute role="student">
                        <StudentLayout>
                            <Certificates />
                        </StudentLayout>
                    </ProtectedRoute>
                } />


                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
                <Route path="/admin/overview" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout>
                            <AdminOverview />
                        </AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout>
                            <AdminProfile />
                        </AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/attendance" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout>
                            <AttendanceManager />
                        </AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout>
                            <EventManagement />
                        </AdminLayout>
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h2>404 - Page Not Found</h2><Link to="/">Go Home</Link></div>} />
            </Routes>
            <Chatbot />
        </Router>
    );
}

export default App;
