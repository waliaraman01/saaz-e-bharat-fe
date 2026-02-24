'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Save,
    Image as ImageIcon,
    Type,
    Loader2,
    UploadCloud,
    Eye,
    EyeOff,
    Layout,
    Info,
    Award,
    Globe,
    Megaphone,
    AlertCircle,
    CheckCircle2,
    RefreshCcw,
    Zap,
    Clock,
    Mail
} from 'lucide-react';

export default function ContentCMS() {
    const [content, setContent] = useState<any[]>([]);
    const [originalContent, setOriginalContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [userRole, setUserRole] = useState('');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.saaz-e-bharat.com/api';
    const storageUrl = backendUrl.endsWith('/api') ? backendUrl.slice(0, -4) : backendUrl.replace(/\/api\/$/, '/').replace(/\/api$/, '');

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            try {
                const parsed = JSON.parse(adminUser);
                setUserRole(parsed.role);
            } catch (e) {
                console.error('Failed to parse admin user');
            }
        }
        fetchContent();
    }, []);

    useEffect(() => {
        const isDifferent = JSON.stringify(content) !== JSON.stringify(originalContent);
        setHasChanges(isDifferent);
    }, [content, originalContent]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/content`);
            setContent(JSON.parse(JSON.stringify(data)));
            setOriginalContent(JSON.parse(JSON.stringify(data)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const findValue = (key: string, defaultValue: any = '') => {
        const item = content.find(c => c.key === key);
        return item ? item.value : defaultValue;
    };

    const getFullUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;

        // Clean the path: remove redundant domain names or dots if they exist at the start
        let cleanPath = path;
        const domainVariants = [
            '.saaz-e-bharat.com',
            'saaz-e-bharat.com',
            'www.saaz-e-bharat.com',
            'api.saaz-e-bharat.com'
        ];

        for (const variant of domainVariants) {
            if (cleanPath.startsWith(variant)) {
                cleanPath = cleanPath.replace(variant, '');
                break;
            }
        }

        const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${storageUrl}${normalizedPath}`;
    };

    const isFieldModified = (key: string) => {
        const currentItem = content.find(c => c.key === key);
        const originalItem = originalContent.find(c => c.key === key);
        return JSON.stringify(currentItem?.value) !== JSON.stringify(originalItem?.value);
    };

    const handleValueChange = (key: string, value: any, section: string) => {
        const newContent = [...content];
        const index = newContent.findIndex(c => c.key === key);
        if (index > -1) {
            newContent[index].value = value;
        } else {
            newContent.push({ key, value, section });
        }
        setContent(newContent);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string, section: string) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        // Basic size validation (5MB for hero, 2MB for others)
        const isHero = section === 'hero';
        const maxSize = isHero ? 5 * 1024 * 1024 : 2 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(`File is too large. Max allowed for this section is ${isHero ? '5MB' : '2MB'}.`);
            return;
        }

        const formData = new FormData();
        formData.append('media', file);
        formData.append('key', key);
        formData.append('section', section);

        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            await axios.post(`${backendUrl}/content/media`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchContent();
        } catch (err) {
            alert('Failed to upload media. Please check server logs.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBatch = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('adminToken');
            await axios.post(`${backendUrl}/content/batch`, { entries: content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOriginalContent(JSON.parse(JSON.stringify(content)));
            setHasChanges(false);
            alert('Sync successful!');
        } catch (err) {
            alert('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    const discardChanges = () => {
        if (confirm('Discard all unsaved refinements?')) {
            setContent(JSON.parse(JSON.stringify(originalContent)));
        }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Loader2 className="animate-spin" size={48} color="#7B241C" /></div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display', color: '#1E293B', fontWeight: 900 }}>Narrative Center</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {userRole !== 'super_admin' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7B241C', fontSize: '0.85rem', fontWeight: 600, background: '#FEF2F2', padding: '0.6rem 1rem', borderRadius: '10px' }}>
                            <AlertCircle size={16} />
                            Read-Only Access
                        </div>
                    )}
                    {hasChanges && <button onClick={discardChanges} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Discard</button>}
                    <button
                        onClick={handleSaveBatch}
                        disabled={saving || !hasChanges || userRole !== 'super_admin'}
                        style={{
                            padding: '0.8rem 2.5rem',
                            borderRadius: '12px',
                            background: (hasChanges && userRole === 'super_admin') ? '#7B241C' : '#F1F5F9',
                            color: (hasChanges && userRole === 'super_admin') ? 'white' : '#94A3B8',
                            border: 'none',
                            cursor: (hasChanges && userRole === 'super_admin') ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                            boxShadow: (hasChanges && userRole === 'super_admin') ? '0 10px 20px rgba(123, 36, 28, 0.2)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Sync to Live
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '4rem' }}>
                {/* Immersive Hero Slider Section */}
                <SectionBlock title="Immersive Hero Slider" icon={Layout} enabledKey="hero_enabled" section="hero" findValue={findValue} handleValueChange={handleValueChange}>
                    <div style={{ display: 'grid', gap: '2.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {[1, 2, 3].map(n => (
                                <ImageUploadBox
                                    key={n}
                                    label={`IMAGE ${n}`}
                                    sizeHint="Recommended: 1920x1080px (Max 5MB)"
                                    value={findValue(`hero_image_${n}`)}
                                    getFullUrl={getFullUrl}
                                    onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, `hero_image_${n}`, 'hero')}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'end' }}>
                            <InputField label="Slider Speed (ms)" value={findValue('hero_slider_speed')} modified={isFieldModified('hero_slider_speed')} onChange={(v: any) => handleValueChange('hero_slider_speed', v, 'hero')} />
                            <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', marginBottom: '0.8rem' }}>
                                <Clock size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                                Recommended: 5000ms (5 seconds) for a premium experience.
                            </p>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <InputField label="Main Sacred Title" value={findValue('hero_title')} modified={isFieldModified('hero_title')} onChange={(v: any) => handleValueChange('hero_title', v, 'hero')} />
                            <InputField label="Hindi Subtitle" value={findValue('hero_subtitle')} modified={isFieldModified('hero_subtitle')} onChange={(v: any) => handleValueChange('hero_subtitle', v, 'hero')} />
                        </div>
                        <TextAreaField label="Evocative Tagline" value={findValue('hero_tagline')} modified={isFieldModified('hero_tagline')} onChange={(v: any) => handleValueChange('hero_tagline', v, 'hero')} />
                    </div>
                </SectionBlock>

                {/* Narrative (About) Section */}
                <SectionBlock title="Narrative (About)" icon={Info} enabledKey="about_enabled" section="about" findValue={findValue} handleValueChange={handleValueChange}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <InputField label="Section Heading" value={findValue('about_heading')} modified={isFieldModified('about_heading')} onChange={(v: any) => handleValueChange('about_heading', v, 'about')} />
                            <ImageUploadBox
                                label="PRIMARY STORY IMAGE"
                                sizeHint="Recommended: 1200x800px (Max 2MB)"
                                value={findValue('about_image')}
                                getFullUrl={getFullUrl}
                                onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'about_image', 'about')}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[1, 2, 3].map(n => <TextAreaField key={n} label={`Story Block ${n}`} rows={5} value={findValue(`about_p${n}`)} modified={isFieldModified(`about_p${n}`)} onChange={(v: any) => handleValueChange(`about_p${n}`, v, 'about')} />)}
                        </div>
                    </div>
                </SectionBlock>

                {/* Email Communications Section - Restricted to Super Admin */}
                {userRole === 'super_admin' && (
                    <SectionBlock title="Email Communications" icon={Mail} enabledKey="emails_enabled" section="email_template" findValue={findValue} handleValueChange={handleValueChange}>
                        <div style={{ display: 'grid', gap: '3rem' }}>
                            <div style={{ background: '#F0F9FF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #BAE6FD', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Zap size={24} color="#0284C7" />
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0369A1', lineHeight: 1.5 }}>
                                    Standard Placeholders: <strong>{'{name}'}</strong> (Participant Name), <strong>{'{category}'}</strong> (Registration Type), <strong>{'{otp}'}</strong> (Verification Code).
                                </p>
                            </div>

                            {/* Approval Template */}
                            <div style={{ padding: '2rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '1.1rem', color: '#7B241C', marginBottom: '1.5rem', fontWeight: 800 }}>1. CONFIRMATION EMAIL (POST-APPROVAL)</h3>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <InputField
                                        label="Subject Line"
                                        value={findValue('EMAIL_CONFIRM_SUBJECT', 'Namaste! Your Saaz-e-Bharat Registration is Confirmed')}
                                        modified={isFieldModified('EMAIL_CONFIRM_SUBJECT')}
                                        onChange={(v: any) => handleValueChange('EMAIL_CONFIRM_SUBJECT', v, 'email_template')}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <InputField
                                            label="Header Title"
                                            value={findValue('EMAIL_CONFIRM_TITLE', 'SAAZ-E-BHARAT')}
                                            modified={isFieldModified('EMAIL_CONFIRM_TITLE')}
                                            onChange={(v: any) => handleValueChange('EMAIL_CONFIRM_TITLE', v, 'email_template')}
                                        />
                                        <InputField
                                            label="Header Tagline"
                                            value={findValue('EMAIL_CONFIRM_TAGLINE', 'Virasat Se Vikas Tak')}
                                            modified={isFieldModified('EMAIL_CONFIRM_TAGLINE')}
                                            onChange={(v: any) => handleValueChange('EMAIL_CONFIRM_TAGLINE', v, 'email_template')}
                                        />
                                    </div>
                                    <TextAreaField
                                        label="Main Message Body"
                                        rows={5}
                                        value={findValue('EMAIL_CONFIRM_BODY', `It gives us immense joy to inform you that your application for <strong>Saaz-e-Bharat May 2026</strong> has been officially confirmed.`)}
                                        modified={isFieldModified('EMAIL_CONFIRM_BODY')}
                                        onChange={(v: any) => handleValueChange('EMAIL_CONFIRM_BODY', v, 'email_template')}
                                    />
                                </div>
                            </div>

                            {/* OTP & Verification Templates */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ padding: '2rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ fontSize: '1rem', color: '#1E293B', marginBottom: '1.5rem', fontWeight: 800 }}>2. IDENTITY VERIFICATION (OTP)</h3>
                                    <div style={{ display: 'grid', gap: '1.2rem' }}>
                                        <InputField label="OTP Subject" value={findValue('EMAIL_OTP_SUBJECT', 'Saaz-e-Bharat - Verify Your Identity')} modified={isFieldModified('EMAIL_OTP_SUBJECT')} onChange={(v: any) => handleValueChange('EMAIL_OTP_SUBJECT', v, 'email_template')} />
                                        <TextAreaField label="OTP Message" rows={3} value={findValue('EMAIL_OTP_BODY', 'To continue your registration, please verify your identity with the code below:')} modified={isFieldModified('EMAIL_OTP_BODY')} onChange={(v: any) => handleValueChange('EMAIL_OTP_BODY', v, 'email_template')} />
                                    </div>
                                </div>
                                <div style={{ padding: '2rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ fontSize: '1rem', color: '#1E293B', marginBottom: '1.5rem', fontWeight: 800 }}>3. RECEIPT ACKNOWLEDGEMENT</h3>
                                    <div style={{ display: 'grid', gap: '1.2rem' }}>
                                        <InputField label="Receipt Subject" value={findValue('EMAIL_RECEIPT_SUBJECT', 'Saaz-e-Bharat - Application Received')} modified={isFieldModified('EMAIL_RECEIPT_SUBJECT')} onChange={(v: any) => handleValueChange('EMAIL_RECEIPT_SUBJECT', v, 'email_template')} />
                                        <TextAreaField label="Receipt Message" rows={3} value={findValue('EMAIL_RECEIPT_BODY', 'Namaste {name}, your registration has been verified. Our team is now reviewing your information.')} modified={isFieldModified('EMAIL_RECEIPT_BODY')} onChange={(v: any) => handleValueChange('EMAIL_RECEIPT_BODY', v, 'email_template')} />
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Template */}
                            <div style={{ padding: '2rem', background: '#FFF7F7', borderRadius: '24px', border: '1px solid #FEE2E2' }}>
                                <h3 style={{ fontSize: '1.1rem', color: '#991B1B', marginBottom: '1.5rem', fontWeight: 800 }}>4. REJECTION NOTICE</h3>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <InputField
                                        label="Rejection Subject"
                                        value={findValue('EMAIL_REJECT_SUBJECT', 'Saaz-e-Bharat - Application Update')}
                                        modified={isFieldModified('EMAIL_REJECT_SUBJECT')}
                                        onChange={(v: any) => handleValueChange('EMAIL_REJECT_SUBJECT', v, 'email_template')}
                                    />
                                    <TextAreaField
                                        label="Rejection Main Content"
                                        rows={4}
                                        value={findValue('EMAIL_REJECT_BODY', 'Thank you for your interest. After review, we regret to inform you that we cannot proceed with your registration at this time.')}
                                        modified={isFieldModified('EMAIL_REJECT_BODY')}
                                        onChange={(v: any) => handleValueChange('EMAIL_REJECT_BODY', v, 'email_template')}
                                    />
                                </div>
                            </div>
                        </div>
                    </SectionBlock>
                )}


                {/* Pillars Section */}
                <SectionBlock title="Sacred Pillars" icon={Award} enabledKey="pillars_enabled" section="pillars" findValue={findValue} handleValueChange={handleValueChange}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} style={{ padding: '2rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <InputField label={`Pillar ${n} Title`} value={findValue(`pillar_${n}_title`)} modified={isFieldModified(`pillar_${n}_title`)} onChange={(v: any) => handleValueChange(`pillar_${n}_title`, v, 'pillars')} />
                                <TextAreaField label="Description" rows={4} value={findValue(`pillar_${n}_desc`)} modified={isFieldModified(`pillar_${n}_desc`)} onChange={(v: any) => handleValueChange(`pillar_${n}_desc`, v, 'pillars')} />
                            </div>
                        ))}
                    </div>
                </SectionBlock>
            </div>
            <style jsx>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function SectionBlock({ title, icon: Icon, enabledKey, section, children, findValue, handleValueChange }: any) {
    const enabled = findValue(enabledKey, true);
    return (
        <section style={{ background: 'white', padding: '3.5rem', borderRadius: '40px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{ background: '#FDF5E6', padding: '1rem', borderRadius: '16px', color: '#7B241C' }}><Icon size={28} /></div>
                    <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1E293B', fontFamily: 'Playfair Display' }}>{title}</span>
                </div>
                <button onClick={() => handleValueChange(enabledKey, !enabled, section)} style={{ padding: '0.8rem 1.5rem', borderRadius: '100px', border: 'none', cursor: 'pointer', background: enabled ? '#ECFDF5' : '#FEF2F2', color: enabled ? '#059669' : '#DC2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {enabled ? <CheckCircle2 size={18} /> : <div style={{ width: 18, height: 18, border: '2px solid currentColor', borderRadius: '50%' }} />}
                    {enabled ? 'Live' : 'Hidden'}
                </button>
            </div>
            {children}
        </section>
    );
}

function ImageUploadBox({ label, value, getFullUrl, onUpload, sizeHint }: any) {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [value]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>
                {sizeHint && <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>{sizeHint}</span>}
            </div>
            <div style={{
                position: 'relative',
                height: '220px',
                border: error ? '2px dashed #EF4444' : '2px dashed #E2E8F0',
                borderRadius: '24px',
                overflow: 'hidden',
                background: error ? '#FEF2F2' : '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
            }}>
                {value && !error ? (
                    <img
                        src={getFullUrl(value)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setError(true)}
                    />
                ) : (
                    <div style={{ textAlign: 'center', color: error ? '#EF4444' : '#CBD5E1' }}>
                        {error ? <AlertCircle size={48} style={{ marginBottom: '1rem' }} /> : <ImageIcon size={48} style={{ marginBottom: '1rem' }} />}
                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{error ? 'Image Failed to Load' : 'No Image Selected'}</p>
                        {error && <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>File may be missing or corrupted</p>}
                    </div>
                )}
                <label style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: '#1E293B', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    <UploadCloud size={18} /> Upload
                    <input type="file" hidden onChange={onUpload} accept="image/*" />
                </label>
            </div>
        </div>
    );
}

function InputField({ label, value, modified, onChange }: any) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '100%' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label} {modified && <span style={{ color: '#7B241C' }}>• Modified</span>}</label>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', border: modified ? '2px solid #7B241C' : '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#1E293B' }} />
        </div>
    );
}

function TextAreaField({ label, value, modified, onChange, rows = 4 }: any) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '100%' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label} {modified && <span style={{ color: '#7B241C' }}>• Modified</span>}</label>
            <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', border: modified ? '2px solid #7B241C' : '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', resize: 'none', fontSize: '1rem', lineHeight: 1.6, color: '#475569' }} />
        </div>
    );
}
