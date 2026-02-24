'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Search, Filter, RefreshCw, Loader2, Download, X as XIcon, FileSpreadsheet, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailItem = ({ label, value }: { label: string, value: any }) => (
    <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
        <p style={{ margin: 0, color: '#1E293B', fontWeight: 500, fontSize: '0.95rem' }}>{value || 'N/A'}</p>
    </div>
);

interface Registration {
    _id: string;
    fullName?: string;
    artistName?: string;
    email: string;
    phone: string;
    category: string;
    status: string;
    attendanceDay?: string;
    createdAt: string;
    documentUrl?: string;
    city?: string;
    organization?: string;
    [key: string]: any;
}

function RegistrationsAdmin() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', search: '', attendanceDay: '', status: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

    // Export Modal State
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportRange, setExportRange] = useState({ from: 1, to: 100, category: '' });
    const [exportLoading, setExportLoading] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.saaz-e-bharat.com/api';

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${backendUrl}/registrations`, {
                params: filter,
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistrations(data.registrations);
        } catch (err) {
            console.error('Failed to fetch registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = localStorage.getItem('adminUser');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                setUserRole(parsed.role);
            } catch (e) {
                console.error('Failed to parse admin user');
            }
        }
    }, []);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this registration? The participant will receive a confirmation email.')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(`${backendUrl}/registrations/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            setSelectedRegistration(null);
            alert('Registration approved successfully!');
        } catch (err) {
            alert('Failed to approve registration');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason === null) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(`${backendUrl}/registrations/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            setSelectedRegistration(null);
            alert('Registration rejected.');
        } catch (err) {
            alert('Failed to reject registration');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('WARNING: Are you sure you want to PERMANENTLY DELETE this registration? This action cannot be undone.')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${backendUrl}/registrations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            setSelectedRegistration(null);
            alert('Registration deleted successfully');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete registration');
            fetchData(); // Sync list if it was already deleted
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportCsv = async () => {
        setExportLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${backendUrl}/registrations/export`, {
                params: exportRange,
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Saaz_e_Bharat_Registrations_${exportRange.category || 'All'}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setShowExportModal(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Export failed. Ensure data exists in this range.');
        } finally {
            setExportLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return { color: '#10B981', bg: '#DCFCE7' };
            case 'rejected': return { color: '#EF4444', bg: '#FEE2E2' };
            default: return { color: '#F59E0B', bg: '#FEF3C7' };
        }
    };

    return (
        <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#1E293B', fontFamily: 'Playfair Display', fontWeight: 900 }}>Registration Management</h1>
                    <p style={{ color: '#64748B' }}>Review and verify applications for the Saaz-e-Bharat event.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowExportModal(true)}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', background: '#1E293B', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(30, 41, 59, 0.15)' }}
                    >
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="btn-gold" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#F8FAFC', color: '#7B241C', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, border: '1px solid #E2E8F0' }} onClick={fetchData}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh List
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '1.5rem',
                marginBottom: '2rem',
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or city..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }}
                    />
                </div>
                <select
                    value={filter.category}
                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                    style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', minWidth: '180px' }}
                >
                    <option value="">All Categories</option>
                    {['Visitor', 'Artist', 'Stall Exhibitor', 'Food Vendor', 'Media', 'Volunteer', 'Sponsor'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={(filter as any).status || ''}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value } as any)}
                    style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', minWidth: '150px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="pending_review">Needs Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select
                    value={filter.attendanceDay}
                    onChange={(e) => setFilter({ ...filter, attendanceDay: e.target.value })}
                    style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', minWidth: '150px' }}
                >
                    <option value="">All Days</option>
                    <option value="Day 1">Day 1</option>
                    <option value="Day 2">Day 2</option>
                    <option value="Day 3">Day 3</option>
                </select>
            </div>

            <div className="premium-card" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ padding: '1.2rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>PARTICIPANT</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>CATEGORY</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>STATUS</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>VISITING DAY</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>REGISTRATION DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} color="#7B241C" /></td></tr>
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>No verified registrations found.</td></tr>
                            ) : registrations.map((reg: any) => (
                                <tr key={reg._id} style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => setSelectedRegistration(reg)} className="table-row-hover">
                                    <td style={{ padding: '1.2rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>{reg.fullName || 'Participant'}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{reg.email} • {reg.phone}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7B241C', background: '#FDF2F2', padding: '4px 12px', borderRadius: '100px' }}>{reg.category}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            padding: '4px 10px',
                                            borderRadius: '100px',
                                            textTransform: 'uppercase',
                                            color: getStatusColor(reg.status).color,
                                            background: getStatusColor(reg.status).bg
                                        }}>
                                            {reg.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: '#1E293B',
                                            background: '#F1F5F9',
                                            padding: '4px 12px',
                                            borderRadius: '100px'
                                        }}>
                                            {reg.attendanceDay || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: '#64748B', fontSize: '0.85rem' }}>
                                        {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Detail Modal */}
            <AnimatePresence>
                {selectedRegistration && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            style={{ background: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: '2rem 2.5rem', background: '#7B241C', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, opacity: 0.8 }}>Review Application</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '100px' }}>ID: {selectedRegistration._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'Playfair Display' }}>{selectedRegistration.fullName || selectedRegistration.artistName || 'Participant Profile'}</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#DCFCE7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }}></span>
                                        OTP Verified
                                    </div>
                                    {userRole === 'super_admin' && (
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => handleDelete(selectedRegistration._id)}
                                            style={{ background: '#EF4444', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                                            title="Delete Registration"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedRegistration(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}><XIcon size={24} /></button>
                                </div>
                            </div>

                            <div style={{ padding: '2.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                <section>
                                    <h3 style={{ fontSize: '0.9rem', color: '#7B241C', textTransform: 'uppercase', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px', marginBottom: '1.5rem', fontWeight: 800 }}>Profile Information</h3>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <DetailItem label="Full Name" value={selectedRegistration.fullName} />
                                        <DetailItem label="Email Identity" value={selectedRegistration.email} />
                                        <DetailItem label="Contact Number" value={selectedRegistration.phone} />
                                        <DetailItem label="Current City" value={selectedRegistration.city} />
                                        <DetailItem label="Organization" value={selectedRegistration.organization || 'Individual'} />
                                        <div style={{ marginTop: '1rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Status</p>
                                            <span style={{
                                                display: 'inline-block',
                                                marginTop: '5px',
                                                fontSize: '0.8rem',
                                                fontWeight: 800,
                                                padding: '4px 12px',
                                                borderRadius: '100px',
                                                textTransform: 'uppercase',
                                                color: getStatusColor(selectedRegistration.status).color,
                                                background: getStatusColor(selectedRegistration.status).bg
                                            }}>
                                                {selectedRegistration.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '0.9rem', color: '#7B241C', textTransform: 'uppercase', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px', marginBottom: '1.5rem', fontWeight: 800 }}>Dynamic Credentials</h3>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <DetailItem label="Registered Category" value={selectedRegistration.category} />
                                        {selectedRegistration.category === 'Visitor' && (
                                            <>
                                                <DetailItem label="Attendance Schedule" value={selectedRegistration.attendanceDay} />
                                                <DetailItem label="Interests" value={Array.isArray(selectedRegistration.interests) ? selectedRegistration.interests.join(', ') : selectedRegistration.interests} />
                                                <DetailItem label="Marketing Channel" value={selectedRegistration.referralSource} />
                                            </>
                                        )}
                                        {selectedRegistration.category === 'Artist' && (
                                            <>
                                                <DetailItem label="Verified Art Form" value={selectedRegistration.artForm} />
                                                <DetailItem label="Performance Mode" value={selectedRegistration.performanceType} />
                                                {selectedRegistration.performanceType === 'Group' && <DetailItem label="Group Strength" value={selectedRegistration.groupSize} />}
                                                <DetailItem label="Cultural Narrative" value={selectedRegistration.performanceDescription} />
                                                {selectedRegistration.portfolioUrl && (
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Vidual Portfolio / Performance</p>
                                                        <a href={selectedRegistration.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#7B241C', textDecoration: 'underline', fontSize: '0.95rem', fontWeight: 600 }}>Launch External Link</a>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {selectedRegistration.category === 'Sponsor' && (
                                            <>
                                                <DetailItem label="Enterprise Name" value={selectedRegistration.companyName} />
                                                <DetailItem label="Business Industry" value={selectedRegistration.industry} />
                                                <DetailItem label="Functional Department" value={selectedRegistration.department} />
                                                <DetailItem label="Sponsorship Tier Interest" value={selectedRegistration.interestedAs} />
                                                <DetailItem label="Strategic Alignment" value={selectedRegistration.reasonForJoining} />
                                            </>
                                        )}
                                    </div>
                                </section>

                                <section style={{ gridColumn: 'span 2' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: '#7B241C', textTransform: 'uppercase', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px', marginBottom: '1.5rem', fontWeight: 800 }}>Document Intelligence & Verification</h3>
                                    {selectedRegistration.documentUrl ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', background: '#F8FAFC', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                            <div style={{ background: 'white', padding: '10px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {selectedRegistration.documentUrl.toLowerCase().endsWith('.pdf') ? (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <FileSpreadsheet size={48} color="#7B241C" />
                                                        <p style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>PDF Document</p>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={selectedRegistration.documentUrl.startsWith('data:') ? selectedRegistration.documentUrl : `${backendUrl.replace('/api', '')}${selectedRegistration.documentUrl}`}
                                                        alt="ID Proof"
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                        onError={(e: any) => e.target.src = 'https://placehold.co/400x300?text=Identity+Proof'}
                                                    />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#1E293B' }}>Identity Verification Required</p>
                                                <p style={{ margin: '8px 0 20px', color: '#64748B', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                                    Please carefully inspect the provided ID (Aadhar, PAN, or Passport).
                                                    Verify that the name matches <strong>{selectedRegistration.fullName}</strong>.
                                                </p>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <a
                                                        href={selectedRegistration.documentUrl.startsWith('data:') ? selectedRegistration.documentUrl : `${backendUrl.replace('/api', '')}${selectedRegistration.documentUrl}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ padding: '0.8rem 1.5rem', background: 'white', color: '#1E293B', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        View Full Proof
                                                    </a>

                                                    {selectedRegistration.status === 'pending_review' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(selectedRegistration._id)}
                                                                disabled={actionLoading}
                                                                style={{ padding: '0.8rem 1.5rem', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                            >
                                                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Approve & Confirm'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(selectedRegistration._id)}
                                                                disabled={actionLoading}
                                                                style={{ padding: '0.8rem 1.5rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                            >
                                                                Reject Access
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ background: '#FEE2E2', padding: '2rem', borderRadius: '24px', color: '#B91C1C', textAlign: 'center', border: '1px dashed #EF4444' }}>
                                            <p style={{ fontWeight: 800, marginBottom: '10px' }}>MISSING IDENTITY PROOF</p>
                                            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>This application was submitted without a verification document. It is highly recommended to reject this entry.</p>
                                            <button onClick={() => handleReject(selectedRegistration._id)} style={{ padding: '0.8rem 2rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Reject Immediately</button>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Export Selection Modal */}
            <AnimatePresence>
                {showExportModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            style={{ background: 'white', padding: '2.5rem', borderRadius: '30px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#F1F5F9', padding: '10px', borderRadius: '12px' }}><FileSpreadsheet size={24} color="#1E293B" /></div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Playfair Display', color: '#1E293B' }}>Export Data</h2>
                                </div>
                                <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><XIcon size={24} /></button>
                            </div>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Cultural Category</label>
                                    <select
                                        value={exportRange.category}
                                        onChange={(e) => setExportRange({ ...exportRange, category: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }}
                                    >
                                        <option value="">All Categories</option>
                                        {['Visitor', 'Artist', 'Stall Exhibitor', 'Food Vendor', 'Media', 'Volunteer', 'Sponsor'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Start Date</label>
                                        <input
                                            type="date"
                                            value={(exportRange as any).startDate || ''}
                                            onChange={(e) => setExportRange({ ...exportRange, startDate: e.target.value } as any)}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>End Date</label>
                                        <input
                                            type="date"
                                            value={(exportRange as any).endDate || ''}
                                            onChange={(e) => setExportRange({ ...exportRange, endDate: e.target.value } as any)}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>From (Serial No)</label>
                                        <input
                                            type="number"
                                            value={exportRange.from}
                                            onChange={(e) => setExportRange({ ...exportRange, from: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>To (Serial No)</label>
                                        <input
                                            type="number"
                                            value={exportRange.to}
                                            onChange={(e) => setExportRange({ ...exportRange, to: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleExportCsv}
                                disabled={exportLoading}
                                style={{
                                    width: '100%',
                                    marginTop: '2.5rem',
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: '#7B241C',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 20px rgba(123, 36, 28, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                {exportLoading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                {exportLoading ? 'Generating Sheet...' : 'Download CSV Report'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .table-row-hover:hover { background: #F8FAFC; }
            `}</style>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegistrationsAdmin />
        </Suspense>
    );
}
