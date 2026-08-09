import React, { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout';
import { HomePage } from './pages/HomePage';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/AuthPages';
import { CreateDuelRoomPage, JoinDuelRoomPage, DuelRoomPage } from './pages/DuelPages';
import { ReportBugPage, ContactPage, FAQPage } from './pages/SupportPages';

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/create-duel" element={<CreateDuelRoomPage />} />
        <Route path="/join-duel" element={<JoinDuelRoomPage />} />
        <Route path="/room/:roomCode" element={<DuelRoomPage />} />
        <Route path="/support/report-bug" element={<ReportBugPage />} />
        <Route path="/support/contact" element={<ContactPage />} />
        <Route path="/support/faqs" element={<FAQPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export function AppLayout() {
  const glowRef = useRef(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let animationFrame;

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const animate = () => {
      x += (mouseX - x) * 0.12;
      y += (mouseY - y) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.left = `${x}px`;
        glowRef.current.style.top = `${y}px`;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <main className="page-shell">
      <div ref={glowRef} className="cursor-glow" />
      <div className="noise" />
      <Navbar />
      <AnimatedRoutes />
    </main>
  );
}
