'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Award, Users, Globe, Loader2, Leaf, Menu, X } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function Home() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.saaz-e-bharat.com/api';
  const storageUrl = backendUrl.replace('/api', '');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/content`);
        setContent(data);
      } catch (err) {
        console.error('Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const findValue = (key: string, defaultValue: any = '') => {
    const item = content.find(c => c.key === key);
    if (!item || item.value === '' || item.value === null) return defaultValue;
    return item.value;
  };

  const isEnabled = (key: string) => findValue(key, true);

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${storageUrl}${path}`;
  };

  // Hero Image Slider Logic
  const heroImages = [
    findValue('hero_image_1'),
    findValue('hero_image_2'),
    findValue('hero_image_3')
  ].filter(img => img && img !== '');

  const sliderSpeed = parseInt(findValue('hero_slider_speed', '5000'));

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, sliderSpeed);

    return () => clearInterval(interval);
  }, [heroImages.length, sliderSpeed]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF5E6' }}>
        <Loader2 className="animate-spin" style={{ color: '#7B241C' }} size={48} />
      </div>
    );
  }

  return (
    <main className="cultural-bg" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Sticky Navigation Header */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(253, 245, 230, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(123, 36, 28, 0.1)'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7B241C', fontFamily: 'Playfair Display' }}>Saaz-e-Bharat</span>
        </Link>
        <div style={{ display: 'none', gap: '2.5rem' }} className="md-flex">
          <Link href="#about" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: 600 }}>About</Link>
          <Link href="#pillars" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: 600 }}>Pillars</Link>
          <Link href="#vision" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: 600 }}>Vision</Link>
          <Link href="/join-the-celebration" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>Get Invitation</button>
          </Link>
        </div>
        <button className="md-hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7B241C' }}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ position: 'fixed', top: '70px', left: 0, right: 0, background: '#FDF5E6', zIndex: 90, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '2px solid #7B241C' }}
          >
            <Link href="#about" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: '#7B241C', fontSize: '1.2rem', fontWeight: 700 }}>About</Link>
            <Link href="#pillars" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: '#7B241C', fontSize: '1.2rem', fontWeight: 700 }}>Pillars</Link>
            <Link href="#vision" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: '#7B241C', fontSize: '1.2rem', fontWeight: 700 }}>Vision</Link>
            <Link href="/join-the-celebration" onClick={() => setIsMenuOpen(false)}>
              <button className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Get Invitation</button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      {isEnabled('hero_enabled') && (
        <section style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#FDF5E6',
          overflow: 'hidden'
        }}>
          {/* Background Image Slider */}
          <AnimatePresence mode="wait">
            {heroImages.length > 0 ? (
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(rgba(253, 245, 230, 0.4), rgba(253, 245, 230, 0.2)), url(${getFullUrl(heroImages[currentImageIndex])})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0
                }}
              />
            ) : null}
          </AnimatePresence>

          {/* Dark Overlay for better text readability if no images or dark images */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(253, 245, 230, 0.5)', zIndex: 1 }}></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ maxWidth: '900px', width: '100%', position: 'relative', zIndex: 2 }}
          >
            <p style={{ color: '#9A7D0A', fontWeight: 800, letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1rem' }}>
              {findValue('hero_subtitle', 'भारत की जड़ें, भारत की पहचान')}
            </p>
            <h1 style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', marginBottom: '1.5rem', color: '#7B241C', fontFamily: 'Playfair Display', lineHeight: 1.1 }}>
              {findValue('hero_title', 'Saaz-e-Bharat')}
            </h1>
            <p style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#666', marginBottom: '3.5rem', fontStyle: 'italic', maxWidth: '700px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
              {findValue('hero_tagline', 'A cultural movement celebrating India’s tribal roots')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/join-the-celebration">
                <button className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', gap: '12px', display: 'flex', alignItems: 'center' }}>
                  Join the Celebration <ArrowRight size={22} />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Decorative Mandala SVG Background */}
          <div style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)', opacity: 0.05, pointerEvents: 'none', width: '400px', zIndex: 1 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: 'auto' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#7B241C" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#7B241C" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#7B241C" strokeWidth="0.5" />
              {[...Array(16)].map((_, i) => (
                <line key={i} x1="50" y1="50" x2={50 + 45 * Math.cos(i * Math.PI / 8)} y2={50 + 45 * Math.sin(i * Math.PI / 8)} stroke="#7B241C" strokeWidth="0.2" />
              ))}
            </svg>
          </div>
        </section>
      )}

      {/* About Section */}
      {isEnabled('about_enabled') && (
        <section id="about" style={{ padding: '10rem 2rem', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#7B241C', fontFamily: 'Playfair Display', marginBottom: '3rem', lineHeight: 1.2 }}>
                {findValue('about_heading', '🌿 About Saaz-e-Bharat')}
              </h2>
              <div style={{ color: '#444', fontSize: '1.15rem', lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p style={{ fontWeight: 700, color: '#1E293B', fontSize: '1.3rem', borderLeft: '4px solid #7B241C', paddingLeft: '1.5rem' }}>
                  {findValue('about_p1', '')}
                </p>
                <p>{findValue('about_p2', '')}</p>
                <p>{findValue('about_p3', '')}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ position: 'relative', height: '600px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.2)' }}
            >
              <img
                src={getFullUrl(findValue('about_image', 'https://images.unsplash.com/photo-1582310501220-dc4f8b227c2f?auto=format&fit=crop&q=80&w=1200'))}
                alt="India Cultural Heritage"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1582310501220-dc4f8b227c2f?auto=format&fit=crop&q=80&w=1200'}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(123, 36, 28, 0.4), transparent)' }}></div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Four Pillars Section */}
      {isEnabled('pillars_enabled') && (
        <section id="pillars" style={{ padding: '10rem 2rem', maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'Playfair Display', color: '#7B241C' }}>Our Sacred Pillars</h2>
            <div style={{ width: '100px', height: '4px', background: '#9A7D0A', margin: '1.5rem auto' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { key: 'pillar_1', icon: Shield, color: '#1F4E79' },
              { key: 'pillar_2', icon: Leaf, color: '#196F3D' },
              { key: 'pillar_3', icon: Globe, color: '#7B241C' },
              { key: 'pillar_4', icon: Award, color: '#9A7D0A' }
            ].map((pillar, idx) => (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="premium-card"
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 2rem' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${pillar.color}15`, color: pillar.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                  <pillar.icon size={36} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem', color: '#1E293B' }}>{findValue(`${pillar.key}_title`, 'Title')}</h3>
                <p style={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.95rem' }}>{findValue(`${pillar.key}_desc`, 'Description')}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Vision Section */}
      {isEnabled('vision_enabled') && (
        <section id="vision" style={{ padding: '10rem 2rem', background: '#7B241C', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontFamily: 'Playfair Display', marginBottom: '4rem' }}>
                {findValue('vision_heading', 'A National Movement with a Global Vision')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', fontSize: '1.3rem', opacity: 0.9, lineHeight: 1.8 }}>
                <p>{findValue('vision_p1', '')}</p>
                <p style={{ borderLeft: '5px solid #9A7D0A', paddingLeft: '2rem', textAlign: 'left', fontStyle: 'italic', background: 'rgba(255,255,255,0.05)', padding: '2rem' }}>
                  "{findValue('vision_p2', '')}"
                </p>
                <p>{findValue('vision_p3', '')}</p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {isEnabled('cta_enabled') && (
        <section style={{ padding: '10rem 2rem', textAlign: 'center' }}>
          <div className="premium-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '5rem 3rem', background: 'linear-gradient(135deg, #ffffff 0%, #FDF5E6 100%)', border: '1px solid rgba(154, 125, 10, 0.2)' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontFamily: 'Playfair Display', color: '#7B241C', marginBottom: '1.5rem' }}>
              {findValue('cta_text', 'Join the Celebration')}
            </h2>
            <p style={{ fontSize: '1.4rem', color: '#64748B', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem' }}>
              {findValue('cta_subtext', 'Be part of a movement that celebrates India’s living heritage')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/join-the-celebration">
                <button className="btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.4rem', boxShadow: '0 15px 35px rgba(123, 36, 28, 0.3)' }}>
                  Secure Your Invitation <ArrowRight style={{ marginLeft: '12px' }} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: '#1E293B', color: 'rgba(255,255,255,0.6)', padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'Playfair Display' }}>Saaz-e-Bharat</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 4rem', lineHeight: 1.8 }}>The Enterprise Event Platform for Saaz-e-Bharat is designed & developed for seamless management of India's most prestigious cultural gathering.</p>
        </div>
      </footer>

      <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .btn-primary {
                    background: #7B241C;
                    color: white;
                    border: none;
                    border-radius: 50px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-primary:hover {
                    filter: brightness(1.2);
                    transform: translateY(-3px);
                }
                
                .premium-card {
                    background: white;
                    border-radius: 40px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: all 0.4s ease;
                }
                .premium-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                }

                .md-flex { display: flex; }
                .md-hidden { display: none; }

                @media (max-width: 768px) {
                    .md-flex { display: none; }
                    .md-hidden { display: block; }
                }
            `}</style>
    </main>
  );
}
   







