import React, { useEffect, useState, useRef } from 'react';
import dataService from '../services/data.service';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Certificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const certificateRef = useRef(null);
    const [activeCert, setActiveCert] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const res = await dataService.getMyRegistrations();
                // Filter only attended events
                const attended = res.data.filter(r => r.status === 'Attended');
                setCertificates(attended);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    const handleDownloadPDF = async (cert) => {
        setActiveCert(cert);
        setIsGenerating(true);
        
        // Wait for state update and render
        setTimeout(async () => {
            try {
                const element = certificateRef.current;
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`Certificate_${cert.event?.title.replace(/\s+/g, '_')}.pdf`);
            } catch (err) {
                console.error("PDF Generation failed:", err);
                alert("Failed to generate PDF. Please try again.");
            } finally {
                setIsGenerating(false);
                setActiveCert(null);
            }
        }, 500);
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#7c3aed', fontWeight: 'bold' }}>Loading Certificates...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '0.75rem' }}>Awards & Recognitions</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Celebrate your achievements and download your official participation certificates.</p>
            </div>

            {certificates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#fff', borderRadius: '2rem', border: '2px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏅</div>
                    <h3 style={{ color: '#1e1b4b', fontSize: '1.4rem', fontWeight: '800' }}>No Certificates Yet</h3>
                    <p style={{ color: '#64748b', maxWidth: '400px', margin: '0.5rem auto 2rem' }}>You'll receive a digital certificate for every event you successfully attend.</p>
                    <button onClick={() => window.location.href = '/events'} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Browse Events</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {certificates.map(cert => (
                        <div key={cert._id} style={{ 
                            background: '#fff', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center', 
                            border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative', overflow: 'hidden'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: '#f5f3ff' }} />
                            
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', position: 'relative' }}>📜</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '0.75rem' }}>Certificate of Excellence</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Verified participation in <strong style={{ color: '#7c3aed' }}>{cert.event?.title}</strong>
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '1rem', marginBottom: '2rem' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Issued On</div>
                                    <div style={{ fontSize: '0.85rem', color: '#1e1b4b', fontWeight: '700' }}>{new Date(cert.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                                <div style={{ width: '1px', background: '#e2e8f0' }} />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Type</div>
                                    <div style={{ fontSize: '0.85rem', color: '#1e1b4b', fontWeight: '700' }}>{cert.event?.eventType || 'Workshop'}</div>
                                </div>
                            </div>

                            <button 
                                className="download-btn"
                                onClick={() => handleDownloadPDF(cert)} 
                                disabled={isGenerating}
                                style={{ 
                                    width: '100%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', 
                                    border: 'none', padding: '1rem', borderRadius: '0.875rem', fontWeight: '800', 
                                    fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 8px 20px rgba(124,58,237,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                {isGenerating && activeCert?._id === cert._id ? 'Generating PDF...' : (
                                    <><span>📥</span> Download PDF Certificate</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* HIDDEN CERTIFICATE TEMPLATE FOR RENDERING */}
            <div style={{ position: 'fixed', top: '-5000px', left: '-5000px' }}>
                {activeCert && (
                    <div ref={certificateRef} style={{ 
                        width: '1122px', height: '793px', background: '#fff', position: 'relative', 
                        padding: '60px', boxSizing: 'border-box', border: '25px solid #1e1b4b',
                        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                    }}>
                        {/* Decorative Border */}
                        <div style={{ position: 'absolute', inset: '10px', border: '2px solid #7c3aed' }} />
                        <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '3rem' }}>🎓</div>
                        <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '3rem' }}>🛡️</div>

                        <div style={{ textAlign: 'center', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ fontSize: '4.5rem', fontWeight: '900', color: '#1e1b4b', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Certificate</div>
                            <div style={{ fontSize: '1.8rem', color: '#7c3aed', fontWeight: '700', marginBottom: '40px', letterSpacing: '4px', textTransform: 'uppercase' }}>of Participation</div>
                            
                            <div style={{ fontSize: '1.4rem', color: '#64748b', marginBottom: '15px' }}>This digital award is proudly presented to</div>
                            <div style={{ fontSize: '3.8rem', fontWeight: '900', color: '#1e1b4b', borderBottom: '3px solid #7c3aed', padding: '0 40px', display: 'inline-block', marginBottom: '40px', fontFamily: 'serif' }}>
                                {user?.name || 'Student Name'}
                            </div>
                            
                            <div style={{ fontSize: '1.4rem', color: '#64748b', maxWidth: '800px', lineHeight: '1.6' }}>
                                for their exceptional participation and completion of the workshop titled
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e1b4b', margin: '20px 0' }}>
                                "{activeCert.event?.title}"
                            </div>
                            
                            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>
                                held on <strong style={{ color: '#1e1b4b' }}>{new Date(activeCert.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: '80px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '200px', borderBottom: '1px solid #1e1b4b', marginBottom: '10px' }} />
                                    <div style={{ fontWeight: '800', color: '#1e1b4b' }}>Portal Director</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Technical Authority</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '5px' }}>💎</div>
                                    <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: '800' }}>VERIFIED DIGITAL AWARD</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {activeCert._id.toUpperCase()}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '200px', borderBottom: '1px solid #1e1b4b', marginBottom: '10px' }} />
                                    <div style={{ fontWeight: '800', color: '#1e1b4b' }}>Event Organizer</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>College Event Hub</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .download-btn:hover {
                    transform: translateY(-2px);
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
                    box-shadow: 0 12px 25px rgba(124,58,237,0.3) !important;
                }
                .download-btn:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default Certificates;

