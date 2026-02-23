import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

function RegisterFallback() {
    return (
        <div className="cultural-bg min-h-screen flex items-center justify-center p-4">
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Loading...</div>
                <p style={{ color: 'var(--text-muted)' }}>Preparing registration form</p>
            </div>
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




