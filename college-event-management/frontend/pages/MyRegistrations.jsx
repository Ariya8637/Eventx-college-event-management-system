import React, { useEffect, useState } from 'react';
import dataService from '../services/data.service';
import { InvoiceViewer, generateInvoiceNumber } from '../components/PaymentInvoice';
import { useAuth } from '../context/AuthContext';

const MyRegistrations = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingInvoice, setViewingInvoice] = useState(null);

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        try {
            const res = await dataService.getMyRegistrations();
            setRegistrations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = (reg) => {
        const e = reg.event;
        if (!e) return;

        const fee = e.fee || 200;
        const platform = Math.round(fee * 0.1);
        const total = fee + platform;

        setViewingInvoice({
            invoiceNumber: generateInvoiceNumber(reg._id),
            studentName: user?.name,
            studentEmail: user?.email,
            eventTitle: e.title,
            eventDate: e.date,
            venue: e.venue || 'Main Auditorium',
            eventType: e.eventType,
            paymentDate: reg.createdAt || new Date(),
            paymentMethod: 'UPI',
            eventFee: fee,
            platformFee: platform,
            totalFee: total,
            transactionId: reg.ticketCode || 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            department: user?.department || 'Student'
        });
    };

    if (loading) return <div className="loading-spinner">Loading Registrations...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>My Registrations</h2>
                <p style={{ color: '#666' }}>Manage your event participation and check attendance status.</p>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #eee', borderRadius: '12px', background: '#fff' }}>
                {registrations.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                        <p>You haven't registered for any events yet.</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th style={thStyle}>Event Name</th>
                                    <th style={thStyle}>Date & Time</th>
                                    <th style={thStyle}>Venue</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Invoices</th>
                                    <th style={thStyle}>Attendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((reg, index) => (
                                    <tr key={reg._id} style={{ borderBottom: index !== registrations.length - 1 ? '1px solid #eee' : 'none' }}>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: '600', color: '#4c1d95' }}>{reg.event?.title || 'Unknown Event'}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            {reg.event?.date ? new Date(reg.event.date).toLocaleDateString() : '-'}
                                        </td>
                                        <td style={tdStyle}>{reg.event?.venue || '-'}</td>
                                        <td style={tdStyle}>
                                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                {reg.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button 
                                                onClick={() => handleViewInvoice(reg)}
                                                style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#d97706', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                                            >
                                                📄 View Invoice
                                            </button>
                                        </td>
                                        <td style={tdStyle}>
                                            {reg.status === 'Attended' ? (
                                                <span style={{ color: '#059669', fontWeight: '700' }}>Present ✅</span>
                                            ) : (
                                                <span style={{ color: '#6b7280' }}>Pending ⏳</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {viewingInvoice && (
                <InvoiceViewer 
                    invoiceData={viewingInvoice} 
                    onClose={() => setViewingInvoice(null)} 
                />
            )}
        </div>
    );
};


const thStyle = {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '1.2rem 1.5rem',
    color: '#374151',
    fontSize: '1rem'
};

export default MyRegistrations;
