'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, ArrowRight, Loader2, ShieldCheck, Upload, Check, User, Briefcase, Camera, Music, Store, Utensils, Heart } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'Visitor', icon: User, label: 'Visitor' },
    { id: 'Artist', icon: Music, label: 'Artist' },
    { id: 'Stall Exhibitor', icon: Store, label: 'Exhibitor' },
    { id: 'Food Vendor', icon: Utensils, label: 'Food Vendor' },
    { id: 'Media', icon: Camera, label: 'Media' },
    { id: 'Volunteer', icon: Heart, label: 'Volunteer' },
    { id: 'Sponsor', icon: Briefcase, label: 'Sponsor' },
];

export default function RegisterForm() {
    const searchParams = useSearchParams();
    const initialType = searchParams.get('type') || 'Visitor';

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [registrationId, setRegistrationId] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<any>({
        fullName: '',
        email: '',
        phone: '',
        organization: '',
        category: initialType,
        attendanceDay: '',
        interests: [],
        referralSource: '',
        artForm: '',
        performanceType: 'Solo',
        groupSize: 1,
        portfolioUrl: '',
        performanceDescription: '',
        expectedHonorarium: '',
        companyName: '',
        industry: '',
        department: '',
        interestedAs: '',
        reasonForJoining: '',
        typeOfStall: '',
        productsToDisplay: '',
        stateCuisine: '',
        foodItems: '',
        mediaHouseName: '',
        mediaType: '',
        availability: [],
        preferredRole: '',
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.saaz-e-bharat.com/api';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (field: string, option: string) => {
        const currentOptions = [...formData[field]];
        if (currentOptions.includes(option)) {
            setFormData({ ...formData, [field]: currentOptions.filter(i => i !== option) });
        } else {
            setFormData({ ...formData, [field]: [...currentOptions, option] });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.phone || !file) {
                setError('Please fill all required fields and upload ID proof.');
                return;
            }
        }
        setError('');
        setStep(step + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (Array.isArray(formData[key])) {
                    dataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    dataToSend.append(key, formData[key]);
                }
            });
            if (file) dataToSend.append('document', file);

            const { data } = await axios.post(`${backendUrl}/registrations`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setRegistrationId(data.registrationId);
            setIsVerifying(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${backendUrl}/registrations/verify-otp`, {
                registrationId,
                otp
            });
            setSuccess(true);
            setIsVerifying(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="cultural-bg min-h-screen w-full flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="premium-card"
                    style={{
                        maxWidth: '650px',
                        width: '100%',
                        padding: 'var(--space-5) var(--space-4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        borderRadius: '32px',
                        boxShadow: '0 50px 100px -20px rgba(123, 36, 28, 0.12)',
                        border: '1px solid #F1E4D1',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '250px', height: '250px', background: 'var(--secondary)', opacity: 0.03, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '250px', height: '250px', background: 'var(--primary)', opacity: 0.03, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }}></div>

                    {/* Status Badge */}
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 24px',
                            background: '#FFFBEB',
                            border: '1px solid #FEF3C7',
                            borderRadius: '50px',
                            color: '#92400E',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            marginBottom: 'var(--space-4)',
                            zIndex: 2
                        }}
                    >
                        <span style={{ width: '8px', height: '8px', background: '#F59E0B', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2)' }}></span>
                        Application Under Review
                    </motion.div>

                    <h2 style={{ color: 'var(--primary)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-playfair)', zIndex: 2 }}>
                        Dhanyavad, {formData.fullName.split(' ')[0]}
                    </h2>

                    <div style={{ width: '60px', height: '3px', background: 'var(--secondary)', margin: '0 auto var(--space-4)', borderRadius: '2px', zIndex: 2 }}></div>

                    <p style={{ color: '#4A3728', lineHeight: 1.8, fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto var(--space-5)', opacity: 0.9, zIndex: 2 }}>
                        Your registration for <strong>Saaz-e-Bharat 2026</strong> has been recorded successfully. Our team is now reviewing your application details and documents.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: 'var(--space-5)',
                        position: 'relative',
                        zIndex: 2,
                        width: '100%'
                    }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #F1E4D1', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Category</div>
                            <div style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>{formData.category}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #F1E4D1', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Next Update</div>
                            <div style={{ fontSize: '1.1rem', color: '#4A3728', fontWeight: 600 }}>Within 48 Hours</div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #F1E4D1', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-5)', zIndex: 2, width: '100%' }}>
                        <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            A confirmation email has been dispatched to <strong>{formData.email}</strong>. Once approved, your official entry pass will be issued digitally.
                        </p>
                    </div>

                    <div style={{ zIndex: 2 }}>
                        <Link href="/">
                            <button className="btn-primary" style={{ width: 'auto', padding: '1rem 3rem', borderRadius: '50px', fontSize: '1rem', boxShadow: '0 15px 30px rgba(123, 36, 28, 0.2)' }}>
                                Return to Homepage
                            </button>
                        </Link>
                    </div>

                    <p style={{ marginTop: 'var(--space-4)', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.5px', zIndex: 2 }}>
                        Saaz-e-Bharat 2026 • Jawaharlal Nehru Stadium, Pragati Vihar, New Delhi, Delhi 110003
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="cultural-bg min-h-screen" style={{ padding: 'var(--space-4) var(--space-3)' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <Link href="/join-the-celebration" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: 'var(--space-5)', padding: '0.6rem 1.2rem', background: 'white', borderRadius: '100px', boxShadow: 'var(--shadow)', fontSize: 'var(--small)' }}>
                    <ArrowLeft size={18} /> Back to Categories
                </Link>

                <div style={{ marginBottom: 'var(--space-5)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{ width: '40px', height: '4px', background: step >= s ? 'var(--primary)' : '#E2E8F0', borderRadius: '2px', transition: 'all 0.3s' }} />
                        ))}
                    </div>
                    <motion.h1
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: 'var(--primary)', marginBottom: 'var(--space-3)' }}
                    >
                        {isVerifying ? 'Verify Identity' : step === 1 ? 'Basic Details' : `${formData.category} Information`}
                    </motion.h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {isVerifying ? "We've sent a code to your email." : step === 1 ? 'Start your journey with Saaz-e-Bharat.' : `Tell us more about your participation as a ${formData.category}.`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {isVerifying ? (
                        <motion.form key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleVerifyOtp} className="premium-card">
                            <div style={{ maxWidth: '450px', margin: '0 auto' }}>
                                <div style={{ width: '80px', height: '80px', background: '#FDF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
                                    <ShieldCheck size={40} color="var(--primary)" />
                                </div>
                                {error && <div className="error-alert">{error}</div>}
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="······"
                                        style={{ textAlign: 'center', fontSize: '2.5rem', letterSpacing: '8px', padding: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}
                                        maxLength={6}
                                    />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', marginTop: 'var(--space-5)' }} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Submit'}
                                </button>
                            </div>
                        </motion.form>
                    ) : step === 1 ? (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="premium-card">
                            {error && <div className="error-alert">{error}</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Required" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Required" />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number *</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Required" />
                                </div>
                                <div className="form-group">
                                    <label>Organization / Group Name</label>
                                    <input type="text" name="organization" value={formData.organization} onChange={handleChange} placeholder="Optional" />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ marginBottom: '1rem', display: 'block' }}>Registering As *</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                        {CATEGORIES.map(cat => {
                                            const Icon = cat.icon;
                                            const isActive = formData.category === cat.id;
                                            return (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                                    style={{
                                                        padding: '0.6rem 1rem',
                                                        borderRadius: '12px',
                                                        border: `2px solid ${isActive ? 'var(--primary)' : '#E2E8F0'}`,
                                                        background: isActive ? '#FDF2F2' : 'white',
                                                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <Icon size={16} />
                                                    {cat.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Valid ID Proof (Accepted: PDF, JPG, PNG | Max 10MB) *</label>
                                    <div
                                        onClick={() => document.getElementById('file-upload')!.click()}
                                        className="file-upload-zone"
                                    >
                                        <Upload size={30} color="#94A3B8" />
                                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{file ? file.name : 'Click to Upload Identity Document'}</div>
                                        <input id="file-upload" type="file" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 'var(--space-5)', textAlign: 'right' }}>
                                <button onClick={nextStep} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
                                    Next <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="premium-card">
                            {error && <div className="error-alert">{error}</div>}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                                {formData.category === 'Visitor' && (
                                    <>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ marginBottom: '1rem', display: 'block' }}>Which day will you attend? *</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                                                {['Day 1 (Invite Only – Official Pass Required)', 'Day 2 (Public Entry)', 'Day 3 (Public Entry & Summit Delegates)'].map(day => (
                                                    <div key={day} onClick={() => setFormData({ ...formData, attendanceDay: day })} className={`selection-card ${formData.attendanceDay === day ? 'active' : ''}`}>
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ marginBottom: '1rem', display: 'block' }}>Interested In *</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                                {['Cultural Performances', 'Tribal Dance', 'Handloom & Handicrafts', 'Bharat Ki Rasoi', 'Viksit Bharat Summit'].map(opt => (
                                                    <div key={opt} onClick={() => handleCheckboxChange('interests', opt)} className={`chip ${formData.interests.includes(opt) ? 'active' : ''}`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>How did you hear about us? *</label>
                                            <input type="text" name="referralSource" required value={formData.referralSource} onChange={handleChange} />
                                        </div>
                                    </>
                                )}

                                {formData.category === 'Artist' && (
                                    <>
                                        <div className="form-group">
                                            <label>Art Form *</label>
                                            <input type="text" name="artForm" required value={formData.artForm} onChange={handleChange} placeholder="e.g. Folk Dance" />
                                        </div>
                                        <div className="form-group">
                                            <label>Performance Type *</label>
                                            <select name="performanceType" value={formData.performanceType} onChange={handleChange} required>
                                                <option value="Solo">Solo</option>
                                                <option value="Group">Group</option>
                                            </select>
                                        </div>
                                        {formData.performanceType === 'Group' && (
                                            <div className="form-group">
                                                <label>Group Size</label>
                                                <input type="number" name="groupSize" value={formData.groupSize} onChange={handleChange} min={2} />
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Portfolio / Performance Link</label>
                                            <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://" />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>Short Description *</label>
                                            <textarea name="performanceDescription" rows={4} value={formData.performanceDescription} onChange={handleChange} required />
                                        </div>
                                    </>
                                )}

                                {formData.category === 'Sponsor' && (
                                    <>
                                        <div className="form-group">
                                            <label>Company Name *</label>
                                            <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Industry *</label>
                                            <input type="text" name="industry" required value={formData.industry} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Interest Level *</label>
                                            <select name="interestedAs" value={formData.interestedAs} onChange={handleChange} required>
                                                <option value="">Select Level</option>
                                                <option value="Title Sponsor">Title Sponsor</option>
                                                <option value="Co-Sponsor">Co-Sponsor</option>
                                                <option value="Associate Sponsor">Associate Sponsor</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>Reason for Joining *</label>
                                            <textarea name="reasonForJoining" rows={4} value={formData.reasonForJoining} onChange={handleChange} required />
                                        </div>
                                    </>
                                )}

                                {formData.category === 'Stall Exhibitor' && (
                                    <>
                                        <div className="form-group">
                                            <label>Type of Stall *</label>
                                            <input type="text" name="typeOfStall" required value={formData.typeOfStall} onChange={handleChange} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>Products *</label>
                                            <textarea name="productsToDisplay" rows={4} value={formData.productsToDisplay} onChange={handleChange} required />
                                        </div>
                                    </>
                                )}

                                {formData.category === 'Food Vendor' && (
                                    <>
                                        <div className="form-group">
                                            <label>Cuisine *</label>
                                            <input type="text" name="stateCuisine" required value={formData.stateCuisine} onChange={handleChange} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>Main Items *</label>
                                            <textarea name="foodItems" rows={4} value={formData.foodItems} onChange={handleChange} required />
                                        </div>
                                    </>
                                )}

                                {formData.category === 'Media' && (
                                    <>
                                        <div className="form-group">
                                            <label>Media House *</label>
                                            <input type="text" name="mediaHouseName" required value={formData.mediaHouseName} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Media Type *</label>
                                            <select name="mediaType" value={formData.mediaType} onChange={handleChange} required>
                                                <option value="">Select Type</option>
                                                <option value="Print">Print</option>
                                                <option value="Digital">Digital</option>
                                                <option value="TV">Television</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {formData.category === 'Volunteer' && (
                                    <>
                                        <div className="form-group">
                                            <label>Preferred Role *</label>
                                            <input type="text" name="preferredRole" required value={formData.preferredRole} onChange={handleChange} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ marginBottom: '1rem', display: 'block' }}>Availability *</label>
                                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                                {['Day 1', 'Day 2', 'Day 3'].map(day => (
                                                    <div key={day} onClick={() => handleCheckboxChange('availability', day)} className={`chip ${formData.availability.includes(day) ? 'active' : ''}`}>
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                <button type="button" onClick={prevStep} className="btn-secondary" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', background: '#F1F5F9', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                    Submit
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .premium-card { background: white; border-radius: 24px; border: 1px solid #F1E4D1; box-shadow: var(--shadow); }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                label { font-weight: bold; font-size: 0.75rem; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.2rem; }
                input, select, textarea { width: 100%; padding: 0.9rem; border-radius: 12px; border: 1px solid #E2E8F0; background: #F8FAFC; transition: all 0.2s; font-size: 0.95rem; color: var(--text); }
                input:focus, select:focus, textarea:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(123, 36, 28, 0.05); background: white; }
                .error-alert { background: #FEF2F2; color: var(--error); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid #FEE2E2; font-size: 0.9rem; font-weight: 500; }
                .file-upload-zone { padding: 2rem; background: #F8FAFC; border-radius: 16px; border: 2px dashed #CBD5E1; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 10px; }
                .file-upload-zone:hover { border-color: var(--primary); background: #FDF2F2; }
                .selection-card { padding: 1rem; border-radius: 12px; border: 1px solid #E2E8F0; background: white; cursor: pointer; transition: all 0.2s; font-weight: bold; color: var(--text-muted); font-size: 0.85rem; text-align: center; }
                .selection-card.active { border-color: var(--primary); background: #FDF2F2; color: var(--primary); }
                .chip { padding: 0.6rem 1.2rem; border-radius: 100px; border: 1px solid #E2E8F0; background: white; cursor: pointer; transition: all 0.2s; font-weight: 600; color: var(--text-muted); font-size: 0.8rem; }
                .chip.active { border-color: var(--primary); background: var(--primary); color: white; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                @media (max-width: 640px) {
                    .premium-card { padding: var(--space-4) var(--space-3); }
                    h1 { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
}
