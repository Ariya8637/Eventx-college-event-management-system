import React, { useState, useRef } from 'react';

/**
 * Feature 5: Payment Success + Invoice System
 * - PaymentSuccessScreen: confirmation modal after payment
 * - InvoiceViewer: printable/downloadable invoice UI
 * - generateInvoiceNumber: deterministic invoice ID
 * No backend changes — purely frontend UI on top of existing payment flow.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────
export const generateInvoiceNumber = (registrationId) => {
    const raw = registrationId || Date.now().toString();
    const hash = raw.slice(-6).toUpperCase();
    return `INV-${new Date().getFullYear()}-${hash}`;
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// ─── Styles ────────────────────────────────────────────────────────────────
const S = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.5)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: '1rem',
    },
    modal: {
        background: '#fff', borderRadius: '1.25rem',
        width: '100%', maxWidth: '520px', overflow: 'hidden',
        boxShadow: '0 30px 70px rgba(0,0,0,0.2)',
        animation: 'modalIn 0.4s cubic-bezier(0.16,1,0.3,1)',
    },
    invoiceWrap: {
        background: '#fff', borderRadius: '1.25rem',
        width: '100%', maxWidth: '620px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        animation: 'modalIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        position: 'relative',
    },
    row: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '0.75rem 0',
        borderBottom: '1px dashed #f3f4f6',
        fontSize: '0.93rem',
    },
    btn: (variant = 'primary') => ({
        background: variant === 'primary'
            ? 'linear-gradient(135deg,#7c3aed,#6d28d9)'
            : variant === 'outline'
                ? 'transparent'
                : '#f3f4f6',
        color: variant === 'primary' ? '#fff' : variant === 'outline' ? '#7c3aed' : '#374151',
        border: variant === 'outline' ? '2px solid #7c3aed' : 'none',
        borderRadius: '0.7rem', padding: '0.75rem 1.5rem',
        cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
        flex: 1, transition: 'all 0.2s',
        boxShadow: variant === 'primary' ? '0 4px 14px rgba(124,58,237,0.3)' : 'none',
    }),
};

// ─── Invoice View (printable panel) ───────────────────────────────────────
const InvoiceViewer = ({ invoiceData, onClose }) => {
    const printRef = useRef();

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice ${invoiceData.invoiceNumber}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; color: #1e1b4b; margin: 0; padding: 2rem; }
                    .header { background: linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; padding:2rem; border-radius:0.75rem 0.75rem 0 0; }
                    .body { padding: 2rem; }
                    .row { display:flex; justify-content:space-between; padding:0.6rem 0; border-bottom:1px dashed #e5e7eb; font-size:0.95rem; }
                    .total-row { display:flex; justify-content:space-between; padding:1rem 0; font-size:1.2rem; font-weight:800; color:#7c3aed; }
                    .footer { background:#f5f3ff; padding:1.5rem; text-align:center; font-size:0.85rem; color:#6b7280; margin-top:1rem; border-radius:0 0 0.75rem 0.75rem; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2 style="margin:0">🎓 College Event Hub</h2>
                    <p style="margin:0.25rem 0 0;opacity:0.8">Event Registration Invoice</p>
                </div>
                <div class="body">
                    <div style="display:flex;justify-content:space-between;margin-bottom:2rem;padding-top:1rem">
                        <div><strong>Invoice No:</strong> ${invoiceData.invoiceNumber}<br/><strong>Date:</strong> ${new Date(invoiceData.paymentDate).toLocaleDateString('en-IN')}</div>
                        <div style="text-align:right"><strong>Status:</strong> <span style="color:green">✅ PAID</span><br/><strong>Method:</strong> ${invoiceData.paymentMethod?.toUpperCase() || 'UPI'}</div>
                    </div>
                    <h4 style="margin:0 0 1rem;color:#7c3aed;border-bottom:2px solid #ede9fe;padding-bottom:0.5rem">Bill To</h4>
                    <div class="row"><span>Name</span><strong>${invoiceData.studentName}</strong></div>
                    <div class="row"><span>Email</span><strong>${invoiceData.studentEmail}</strong></div>
                    ${invoiceData.department ? `<div class="row"><span>Department</span><strong>${invoiceData.department}</strong></div>` : ''}
                    <h4 style="margin:1.5rem 0 1rem;color:#7c3aed;border-bottom:2px solid #ede9fe;padding-bottom:0.5rem">Event Details</h4>
                    <div class="row"><span>Event</span><strong>${invoiceData.eventTitle}</strong></div>
                    <div class="row"><span>Type</span><strong>${invoiceData.eventType || 'Event'}</strong></div>
                    <div class="row"><span>Date</span><strong>${new Date(invoiceData.eventDate).toLocaleDateString('en-IN')}</strong></div>
                    <div class="row"><span>Venue</span><strong>${invoiceData.venue || 'College Campus'}</strong></div>
                    <h4 style="margin:1.5rem 0 1rem;color:#7c3aed;border-bottom:2px solid #ede9fe;padding-bottom:0.5rem">Payment Summary</h4>
                    <div class="row"><span>Registration Fee</span><span>₹${invoiceData.eventFee}</span></div>
                    <div class="row"><span>Platform Fee</span><span>₹${invoiceData.platformFee}</span></div>
                    <div class="total-row"><span>Total Paid</span><span>₹${invoiceData.totalFee}</span></div>
                    <div class="row"><span>Transaction ID</span><span>${invoiceData.transactionId}</span></div>
                </div>
                <div class="footer">Thank you for registering! For queries: events@college.edu | +91-XXXX-XXXX-XX</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const { invoiceNumber, studentName, studentEmail, eventTitle, eventDate, venue, eventType,
        paymentDate, paymentMethod, eventFee, platformFee, totalFee, transactionId, department } = invoiceData;

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={{ ...S.invoiceWrap, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }`}</style>

                {/* Invoice Header */}
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)', padding: '2rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                        <div>
                            <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem' }}>🎓 College Event Hub</h2>
                            <p style={{ margin: '0.25rem 0 0', opacity: 0.75, fontSize: '0.9rem' }}>Event Registration Invoice</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ background: '#22c55e', borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem', display: 'inline-block' }}>✅ PAID</div>
                            <div style={{ opacity: 0.75, fontSize: '0.82rem' }}>
                                {new Date(paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '2rem', fontSize: '0.85rem', opacity: 0.85, flexWrap: 'wrap' }}>
                        <span><strong>Invoice:</strong> {invoiceNumber}</span>
                        <span><strong>Txn ID:</strong> {transactionId}</span>
                        <span><strong>Method:</strong> {paymentMethod?.toUpperCase()}</span>
                    </div>
                </div>

                {/* Invoice Body */}
                <div style={{ padding: '1.75rem 2rem' }} ref={printRef}>
                    {/* Bill To + Event */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#fafafa', borderRadius: '0.75rem', padding: '1.1rem', border: '1px solid #f3f4f6' }}>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Bill To</div>
                            <div style={{ fontWeight: '800', color: '#1e1b4b', marginBottom: '0.2rem' }}>{studentName}</div>
                            <div style={{ fontSize: '0.87rem', color: '#6b7280' }}>{studentEmail}</div>
                            {department && <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.2rem' }}>{department}</div>}
                        </div>
                        <div style={{ background: '#f5f3ff', borderRadius: '0.75rem', padding: '1.1rem', border: '1px solid #ede9fe' }}>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Event</div>
                            <div style={{ fontWeight: '800', color: '#1e1b4b', marginBottom: '0.2rem', fontSize: '0.95rem' }}>{eventTitle}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                📅 {new Date(eventDate).toLocaleDateString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>📍 {venue}</div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div style={{ border: '1px solid #ede9fe', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#f5f3ff', padding: '0.75rem 1.25rem', fontSize: '0.78rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Payment Breakdown
                        </div>
                        <div style={{ padding: '0 1.25rem' }}>
                            <div style={S.row}>
                                <span style={{ color: '#6b7280' }}>Registration Fee</span>
                                <span style={{ color: '#1e1b4b', fontWeight: '600' }}>{formatCurrency(eventFee)}</span>
                            </div>
                            <div style={S.row}>
                                <span style={{ color: '#6b7280' }}>Platform Fee</span>
                                <span style={{ color: '#1e1b4b', fontWeight: '600' }}>{formatCurrency(platformFee)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', marginTop: '0.25rem' }}>
                                <span style={{ fontWeight: '800', color: '#1e1b4b', fontSize: '1rem' }}>Total Paid</span>
                                <span style={{ fontWeight: '900', color: '#7c3aed', fontSize: '1.3rem' }}>{formatCurrency(totalFee)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.85rem', color: '#15803d', textAlign: 'center', marginBottom: '1.25rem' }}>
                        ✅ Payment confirmed. This is your official registration receipt.
                        For support: <strong>events@college.edu</strong>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={S.btn('outline')} onClick={handlePrint}>
                            🖨️ Download / Print PDF
                        </button>
                        <button style={S.btn('secondary')} onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Payment Success Screen ────────────────────────────────────────────────
const PaymentSuccessScreen = ({ invoiceData, onViewInvoice, onClose }) => {
    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={{ ...S.modal, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} } @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }`}</style>

                {/* Confetti header */}
                <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', padding: '2.5rem 2rem 2rem', borderBottom: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '4rem', animation: 'checkPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) 0.2s both' }}>
                        🎉
                    </div>
                    <div style={{ background: '#22c55e', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.75rem auto', fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(34,197,94,0.35)', animation: 'checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.4s both' }}>
                        ✓
                    </div>
                    <h2 style={{ margin: '0.75rem 0 0.25rem', color: '#15803d', fontSize: '1.5rem' }}>Payment Successful!</h2>
                    <p style={{ margin: 0, color: '#16a34a', fontSize: '0.92rem' }}>
                        You're officially registered for <strong>{invoiceData.eventTitle}</strong>
                    </p>
                </div>

                {/* Summary */}
                <div style={{ padding: '1.75rem 2rem' }}>
                    <div style={{ background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: '0.875rem', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem' }}>
                            {[
                                { label: 'Invoice No', value: invoiceData.invoiceNumber },
                                { label: 'Amount Paid', value: `₹${invoiceData.totalFee}`, bold: true },
                                { label: 'Transaction ID', value: invoiceData.transactionId },
                                { label: 'Payment Method', value: invoiceData.paymentMethod?.toUpperCase() },
                                { label: 'Event Date', value: new Date(invoiceData.eventDate).toLocaleDateString('en-IN') },
                                { label: 'Venue', value: invoiceData.venue },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: item.bold ? '#7c3aed' : '#1e1b4b', fontWeight: item.bold ? '800' : '600', marginTop: '0.15rem' }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={S.btn('primary')} onClick={onViewInvoice}>
                            📄 View Invoice
                        </button>
                        <button style={S.btn('secondary')} onClick={onClose}>
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Payment Scanner Screen ───────────────────────────────────────────────
const PaymentScannerScreen = ({ invoiceData, onSuccess, onCancel }) => {
    const [scanned, setScanned] = useState(false);

    const handleMockPayment = () => {
        setScanned(true);
        setTimeout(() => {
            onSuccess();
        }, 1000); // Wait 1 second to show the green checkmark before redirecting
    };

    return (
        <div style={S.overlay} onClick={onCancel}>
            <div style={{ ...S.modal, width: '380px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <style>{`
                    @keyframes scanLine { 
                        0% { top: 0%; box-shadow: 0 0 15px rgba(124,58,237,0.8); } 
                        50% { top: 98%; box-shadow: 0 0 15px rgba(124,58,237,0.8); }
                        100% { top: 0%; box-shadow: 0 0 15px rgba(124,58,237,0.8); } 
                    }
                `}</style>
                <div style={{ padding: '2rem 1.5rem', background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.25rem' }}>Scan to Pay</h3>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.85rem' }}>Open your UPI app and scan the code below</p>
                </div>
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '220px', height: '220px', background: '#fff', borderRadius: '1rem', border: '2px solid #ede9fe', padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        
                        {/* Fake QR pattern */}
                        <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, #1e1b4b 25%, transparent 25%, transparent 75%, #1e1b4b 75%, #1e1b4b), repeating-linear-gradient(45deg, #1e1b4b 25%, #fff 25%, #fff 75%, #1e1b4b 75%, #1e1b4b)', backgroundSize: '14px 14px', backgroundPosition: '0 0, 7px 7px', opacity: scanned ? 0.2 : 0.85, transition: 'opacity 0.3s' }} />
                        
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    PAY
                                </span>
                            </div>
                        </div>

                        {!scanned && (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: '#7c3aed', animation: 'scanLine 2s infinite linear', zIndex: 10 }} />
                        )}
                        {scanned && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 20 }}>
                                <div style={{ width: '64px', height: '64px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', boxShadow: '0 4px 15px rgba(34,197,94,0.4)', animation: 'checkPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
                                    ✓
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div style={{ marginTop: '1.5rem', fontWeight: '900', color: '#1e1b4b', fontSize: '1.6rem' }}>
                        {formatCurrency(invoiceData.totalFee)}
                    </div>
                    
                    {!scanned ? (
                        <p style={{ color: '#7c3aed', fontWeight: '700', fontSize: '0.85rem', margin: '0.75rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed', animation: 'statusPulse 1.5s infinite' }} /> Waiting for you to pay...
                        </p>
                    ) : (
                        <p style={{ color: '#15803d', fontWeight: '800', fontSize: '0.9rem', margin: '0.75rem 0 0' }}>Payment Detected!</p>
                    )}

                    {!scanned && (
                        <button 
                            onClick={handleMockPayment} 
                            style={{ 
                                marginTop: '1.25rem', padding: '0.5rem 1rem', background: '#e0e7ff', color: '#4338ca', 
                                border: '1px dashed #6366f1', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#c7d2fe'}
                            onMouseLeave={e => e.currentTarget.style.background = '#e0e7ff'}
                        >
                            📱 [Test] Simulate App Payment
                        </button>
                    )}
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid #f3f4f6', background: '#f9fafb' }}>
                    <button style={{ ...S.btn('secondary'), width: '100%', padding: '0.75rem' }} onClick={onCancel} disabled={scanned}>
                        Cancel Transaction
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Combined Payment Flow Hook ────────────────────────────────────────────
/**
 * Usage in EventDetails.jsx (or any component):
 *
 *   import { usePaymentFlow } from '../components/PaymentInvoice';
 *   const { initiatePayment, PaymentUI } = usePaymentFlow();
 *
 *   // call initiatePayment() on "Pay & Register" click
 *   // render <PaymentUI /> anywhere
 */
export const usePaymentFlow = (invoiceData, onComplete) => {
    const [step, setStep] = useState(null); // null | 'scan' | 'success' | 'invoice'

    const initiatePayment = () => {
        return new Promise(resolve => {
            setStep('scan');
            resolve();
        });
    };

    const PaymentUI = () => {
        const handleClose = () => {
            setStep(null);
            if (onComplete) onComplete();
        };

        if (step === 'scan') return (
            <PaymentScannerScreen
                invoiceData={invoiceData}
                onSuccess={() => setStep('success')}
                onCancel={handleClose}
            />
        );
        if (step === 'success') return (
            <PaymentSuccessScreen
                invoiceData={invoiceData}
                onViewInvoice={() => setStep('invoice')}
                onClose={handleClose}
            />
        );
        if (step === 'invoice') return (
            <InvoiceViewer
                invoiceData={invoiceData}
                onClose={handleClose}
            />
        );
        return null;
    };

    return { initiatePayment, PaymentUI, step, setStep };
};

export { PaymentSuccessScreen, InvoiceViewer };
export default PaymentSuccessScreen;
