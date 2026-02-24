'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Award, Users, Globe, Loader2, Leaf, Menu, X } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface ContentItem {
  key: string;
  value: any;
  section: string;
}

export default function Home() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.saaz-e-bharat.com/api';
  // Use a more robust way to get the base URL without /api at the end
  const storageUrl = backendUrl.endsWith('/api') ? backendUrl.slice(0, -4) : backendUrl.replace(/\/api\/$/, '/').replace(/\/api$/, '');

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
  }, [backendUrl]);

  const findValue = (key: string, defaultValue: any = '') => {
    const item = content.find(c => c.key === key);
    if (!item || item.value === undefined || item.value === null || item.value === '') return defaultValue;
    return item.value;
  };

  const isEnabled = (key: string) => findValue(key, true);

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
        padding: '0 var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(253, 245, 230, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(123, 36, 28, 0.1)',
        height: 'var(--nav-height)'
      }}>
        <Link href="/">
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-playfair)' }}>Saaz-e-Bharat</span>
        </Link>
        <div style={{ display: 'none', gap: 'var(--space-5)' }} className="md-flex">
          <Link href="#about" style={{ fontWeight: 'var(--fw-medium)' }}>About</Link>
          <Link href="#pillars" style={{ fontWeight: 'var(--fw-medium)' }}>Pillars</Link>
          <Link href="#vision" style={{ fontWeight: 'var(--fw-medium)' }}>Vision</Link>
          <Link href="/join-the-celebration">
            <button className="btn-primary">Get Invitation</button>
          </Link>
        </div>
        <button className="md-hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'fixed',
              top: 'var(--nav-height)',
              left: 0,
              right: 0,
              background: '#FDF5E6',
              zIndex: 90,
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              borderBottom: '2px solid var(--primary)'
            }}
          >
            <Link href="#about" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'var(--fw-bold)' }}>About</Link>
            <Link href="#pillars" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'var(--fw-bold)' }}>Pillars</Link>
            <Link href="#vision" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'var(--fw-bold)' }}>Vision</Link>
            <Link href="/join-the-celebration" onClick={() => setIsMenuOpen(false)}>
              <button className="btn-primary" style={{ width: '100%' }}>Get Invitation</button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ paddingTop: 'var(--nav-height)' }}>
        {/* Hero Section */}
        {isEnabled('hero_enabled') && (
          <section className="hero-section" style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'calc(var(--space-5) * 1.5) var(--space-4) var(--space-5)',
            background: 'var(--bg)',
            overflow: 'hidden'
          }}>
            {/* Cinematic Slider Area */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                width: 'min(1400px, 100%)',
                height: 'min(600px, 60vh)',
                position: 'relative',
                borderRadius: '40px',
                overflow: 'hidden',
                boxShadow: '0 40px 80px -15px rgba(0,0,0,0.15)',
                marginBottom: 'var(--space-5)',
                zIndex: 2
              }}
            >
              <AnimatePresence mode="wait">
                {heroImages.length > 0 ? (
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.1)), url(${getFullUrl(heroImages[currentImageIndex])})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : null}
              </AnimatePresence>

              {/* Overlay for depth */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))' }}></div>

              {/* Slider Dots */}
              {heroImages.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: 'var(--space-4)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '12px',
                  zIndex: 10
                }}>
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      style={{
                        width: currentImageIndex === idx ? '30px' : '10px',
                        height: '10px',
                        borderRadius: '10px',
                        background: currentImageIndex === idx ? 'var(--secondary)' : 'rgba(255,255,255,0.5)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Sacred Text Area (Below Slider) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 0.5,
                    staggerChildren: 0.2
                  }
                }
              }}
              style={{
                maxWidth: '900px',
                width: '100%',
                position: 'relative',
                zIndex: 2,
                textAlign: 'center'
              }}
            >
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                style={{
                  color: 'var(--secondary)',
                  fontWeight: 'var(--fw-bold)',
                  letterSpacing: '6px',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-3)',
                  fontSize: 'var(--small)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {findValue('hero_subtitle', 'भारत की जड़ें, भारत की पहचान')}
              </motion.p>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }
                }}
                style={{
                  marginBottom: 'var(--space-4)',
                  lineHeight: 1.1,
                  color: 'var(--primary)',
                  fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                  fontFamily: 'var(--font-playfair)',
                  fontWeight: 900
                }}
              >
                {findValue('hero_title', 'Saaz-e-Bharat')}
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 1 } }
                }}
                style={{
                  color: 'var(--text-muted)',
                  marginBottom: 'var(--space-5)',
                  fontStyle: 'italic',
                  maxWidth: '700px',
                  margin: '0 auto var(--space-5)',
                  fontSize: 'clamp(1.1rem, 2vw, 1.4rem)'
                }}
              >
                {findValue('hero_tagline', 'A cultural movement celebrating India’s tribal roots')}
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
                }}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <Link href="/join-the-celebration">
                  <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 10px 25px rgba(123, 36, 28, 0.3)' }}>
                    Join the Celebration <ArrowRight size={22} />
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Floating Decorative Mandala (Repositioned) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              style={{ position: 'absolute', bottom: '-10%', right: '-5%', opacity: 0.03, pointerEvents: 'none', width: '600px', zIndex: 1 }}
            >
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: 'auto' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="0.2" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="var(--primary)" strokeWidth="0.2" />
                {[...Array(24)].map((_, i) => (
                  <line key={i} x1="50" y1="50" x2={50 + 45 * Math.cos(i * Math.PI / 12)} y2={50 + 45 * Math.sin(i * Math.PI / 12)} stroke="var(--primary)" strokeWidth="0.1" />
                ))}
              </svg>
            </motion.div>

            {/* Animated Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              style={{ position: 'absolute', bottom: 'var(--space-3)', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '1px', height: '30px', background: 'linear-gradient(to bottom, var(--secondary), transparent)' }}
              />
            </motion.div>
          </section>
        )}

        {/* About Section */}
        {isEnabled('about_enabled') && (
          <section id="about" style={{ padding: 'var(--space-5) 0', background: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`, pointerEvents: 'none' }}></div>

            <div className="container about-grid-container" style={{ display: 'grid', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  background: 'rgba(123, 36, 28, 0.08)',
                  borderRadius: '100px',
                  marginBottom: 'var(--space-4)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  <div style={{ width: '12px', height: '2px', background: 'var(--secondary)' }}></div>
                  Our Heritage
                </div>

                <h2 style={{
                  color: 'var(--primary)',
                  marginBottom: 'var(--space-4)',
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontFamily: 'var(--font-playfair)',
                  fontWeight: 900,
                  lineHeight: 1.1
                }}>
                  {findValue('about_heading', 'About Saaz-e-Bharat').replace('🌿 ', '')}
                </h2>

                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  <p style={{
                    color: 'var(--primary)',
                    fontSize: '1.4rem',
                    fontFamily: 'var(--font-playfair)',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    opacity: 0.9,
                    borderLeft: '4px solid var(--secondary)',
                    paddingLeft: 'var(--space-4)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {findValue('about_p1', 'Saaz-e-Bharat is not just a festival — it is a cultural movement that reconnects India with its roots.')}
                  </p>
                  <p style={{ fontWeight: 400 }}>{findValue('about_p2', 'India’s true identity lives in its soil, in its forests, in its tribal communities — where art is not decoration, music is not performance, and culture is not history, but a way of life.')}</p>
                  <p style={{ opacity: 0.8, fontSize: '1rem' }}>{findValue('about_p3', 'Saaz-e-Bharat is an effort to revive, preserve, and celebrate this living heritage by bringing together the diverse tribal arts, folk traditions, music, crafts, and cuisines of Bharat under one shared platform.')}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ position: 'relative', width: '100%' }}
              >
                <div style={{
                  position: 'relative',
                  aspectRatio: '16/10',
                  borderRadius: '40px',
                  overflow: 'hidden',
                  boxShadow: '0 40px 100px -30px rgba(0,0,0,0.3)',
                  zIndex: 2,
                  background: '#FDF5E6', // Warm parchment background helps hide checkerboards
                }}>
                  <img
                    src={getFullUrl(findValue('about_image', 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?auto=format&fit=crop&q=80&w=1200'))}
                    alt="Saaz-e-Bharat Culture"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'contrast(1.1) brightness(1.02) sepia(0.1)', // Gently blends artifacts
                      mixBlendMode: 'multiply', // Blends out white/light-grey checkerboards into the warm background
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(123, 36, 28, 0.25), transparent 70%)' }}></div>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`, pointerEvents: 'none' }}></div>
                  <div style={{
                    position: 'absolute',
                    inset: '15px',
                    border: '1px solid rgba(154, 125, 10, 0.3)',
                    borderRadius: '25px',
                    pointerEvents: 'none',
                    zIndex: 3
                  }}></div>
                </div>

                <motion.div
                  animate={{
                    x: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) / 50,
                    y: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) / 50
                  }}
                  style={{ position: 'absolute', top: '-20px', right: '-20px', bottom: '20px', left: '20px', border: '1px solid var(--secondary)', borderRadius: '45px', zIndex: 1, opacity: 0.3, pointerEvents: 'none' }}
                />

                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  right: '40px',
                  width: '80px',
                  height: '80px',
                  background: 'var(--secondary)',
                  borderRadius: '20px',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 15px 30px rgba(154, 125, 10, 0.3)',
                  color: 'white'
                }}>
                  <Award size={32} />
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Four Pillars Section */}
        {isEnabled('pillars_enabled') && (
          <section id="pillars" style={{ padding: 'var(--space-5) 0', background: 'var(--bg)', position: 'relative' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  style={{ color: 'var(--secondary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: 'var(--small)' }}
                >
                  The Foundation
                </motion.span>
                <h2 style={{ color: 'var(--primary)', marginTop: 'var(--space-2)' }}>Our Sacred Pillars</h2>
                <div style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, transparent, var(--secondary), transparent)', margin: 'var(--space-3) auto' }}></div>
              </div>

              <div className="responsive-grid" style={{ gap: 'var(--space-4)' }}>
                {[
                  { key: 'pillar_1', icon: Shield, color: '#1F4E79', label: 'Conservation' },
                  { key: 'pillar_2', icon: Leaf, color: '#196F3D', label: 'Ecology' },
                  { key: 'pillar_3', icon: Globe, color: '#7B241C', label: 'Unity' },
                  { key: 'pillar_4', icon: Award, color: '#9A7D0A', label: 'Excellence' }
                ].map((pillar, idx) => (
                  <motion.div
                    key={pillar.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15, duration: 0.8 }}
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className="premium-card"
                    style={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: 'var(--space-5) var(--space-4)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '100px', height: '100px', background: pillar.color, opacity: 0.05, filter: 'blur(40px)', borderRadius: '50%' }}></div>
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '24px',
                      background: `linear-gradient(135deg, ${pillar.color}20, ${pillar.color}05)`,
                      color: pillar.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-4)',
                      boxShadow: `0 10px 20px ${pillar.color}15`
                    }}>
                      <pillar.icon size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-3)', color: 'var(--primary)' }}>
                      {findValue(`${pillar.key}_title`, pillar.label)}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, opacity: 0.9 }}>
                      {findValue(`${pillar.key}_desc`, 'Conserving the architectural and ritualistic grandeur of Indian tribal culture.')}
                    </p>
                    <div className="card-light" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Vision Section */}
        {isEnabled('vision_enabled') && (
          <section id="vision" style={{ padding: 'var(--space-5) 0', background: 'var(--primary)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '1000px',
                height: '1000px',
                background: 'radial-gradient(circle, rgba(154, 125, 10, 0.15) 0%, transparent 70%)',
                zIndex: 1,
                pointerEvents: 'none',
                x: mousePos.x - 500,
                y: mousePos.y - 500
              }}
            />

            <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                <div style={{ padding: 'var(--space-2) var(--space-4)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', display: 'inline-block', marginBottom: 'var(--space-4)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Future Forward
                </div>
                <h2 style={{ color: 'white', marginBottom: 'var(--space-4)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}>
                  {findValue('vision_heading', 'A National Movement with a Global Vision')}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: '1.25rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
                  <p>{findValue('vision_p1', 'Saaz-e-Bharat envisions a future where India\'s tribal heritage is not just preserved in museums, but celebrated as a living, breathing identity.')}</p>
                  <div style={{
                    position: 'relative',
                    padding: 'var(--space-5)',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    margin: 'var(--space-4) 0'
                  }}>
                    <div style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '4rem', opacity: 0.2, fontFamily: 'serif' }}>&ldquo;</div>
                    <p style={{ fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                      {findValue('vision_p2', 'Our mission is to bridge the gap between rural roots and urban modernity, creating a platform for tribal artists to shine globally.')}
                    </p>
                    <div style={{ position: 'absolute', bottom: '-20px', right: '20px', fontSize: '4rem', opacity: 0.2, fontFamily: 'serif' }}>&rdquo;</div>
                  </div>
                  <p>{findValue('vision_p3', 'Join us in building a legacy for the next generation.')}</p>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {isEnabled('cta_enabled') && (
          <section style={{ padding: 'var(--space-5) 0', position: 'relative' }}>
            <div className="container">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="premium-card"
                style={{
                  padding: 'var(--space-5) var(--space-4)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #FDF5E6 40%, #FFF9F0 100%)',
                  textAlign: 'center',
                  border: '2px solid rgba(154, 125, 10, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `url('https://www.transparenttextures.com/patterns/handmade-paper.png')`, pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--secondary)', opacity: 0.03, borderRadius: '50%', filter: 'blur(50px)' }}></div>

                <h2 style={{ color: 'var(--primary)', marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1, fontFamily: 'var(--font-playfair)', fontWeight: 900 }}>
                  {findValue('cta_text', 'Join the Celebration')}
                </h2>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: 'var(--space-5)', maxWidth: '650px', margin: '0 auto var(--space-5)', position: 'relative', zIndex: 1, lineHeight: 1.6 }}>
                  {findValue('cta_subtext', 'Be part of a national movement that celebrates the timeless soul of India through music, dance, and art.')}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                  <Link href="/join-the-celebration">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(123, 36, 28, 0.25)' }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary"
                      style={{ padding: '1.2rem 4rem', fontSize: '1.1rem', borderRadius: '100px', overflow: 'hidden', position: 'relative' }}
                    >
                      Secure Your Invitation <ArrowRight size={22} />
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', skewX: '-20deg' }}
                      />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{ background: '#0F172A', color: 'rgba(255,255,255,0.5)', padding: 'var(--space-5) 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-playfair)' }}>Saaz-e-Bharat</h2>
            <div style={{ width: '40px', height: '2px', background: 'var(--secondary)', margin: '0 auto var(--space-4)', opacity: 0.5 }}></div>
            <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.8, fontWeight: 300, letterSpacing: '0.5px' }}>
              The Official Digital Portal for Saaz-e-Bharat. Dedicated to the unsung heroes of India&apos;s tribal roots.
              <br />
              © 2026 Cultural Heritage Foundation. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .md-flex { display: flex; }
        .md-hidden { display: none; }

        .premium-card:hover .card-light {
          opacity: 1;
        }
        .card-light {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s;
          mix-blend-mode: soft-light;
          z-index: 0;
        }

        @media (max-width: 768px) {
          .md-flex { display: none; }
          .md-hidden { display: block; }
          .hero-section { min-height: auto; padding-bottom: calc(var(--space-5) * 3) !important; }
          .about-grid-container { grid-template-columns: 1fr !important; gap: var(--space-5) !important; }
        }
        @media (min-width: 769px) {
          .hero-section { min-height: calc(100vh - var(--nav-height)); }
          .about-grid-container { grid-template-columns: 1.2fr 0.8fr; gap: calc(var(--space-5) * 1.5); }
        }
      `}</style>
    </main>
  );
}








