'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RegisterForm from './RegisterForm';

function RegisterFallback() {
    return (
        <div className="cultural-bg min-h-screen flex items-center justify-center p-4">
            <div style={{ textAlign: 'center' }}>
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto var(--space-3)' }} size={48} />
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Preparing your registration journey...</p>
            </div>
            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}      

export default function Register() {
    return (
        <Suspense fallback={<RegisterFallback />}>
            <RegisterForm />
        </Suspense>
    );
}




