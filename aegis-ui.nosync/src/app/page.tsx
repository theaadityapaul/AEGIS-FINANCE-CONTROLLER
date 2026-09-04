'use client';
import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import BrutalistAssetUploader from '@/components/ui/BrutalistAssetUploader';
import GlobalAssistant from '@/components/ui/GlobalAssistant';
import DataUploader from '@/components/ui/DataUploader';
import CustomCursor from '@/components/ui/CustomCursor';
import ReconciliationCanvas from '@/components/ui/ReconciliationCanvas';
import AgentTerminal from '@/components/ui/AgentTerminal';
import CashForecaster from '@/components/ui/CashForecaster';
import TaxMatrix from '@/components/ui/TaxMatrix';
import FluidBackground from '@/components/3d/FluidBackground';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export default function BrutalistDeck() {
  const [auditData, setAuditData] = useState<any>(null);
  const [gsapReady, setGsapReady] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  
  // Auth states
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  const stage0Ref = useRef<HTMLDivElement>(null); 
  const stage1Ref = useRef<HTMLDivElement>(null); 
  const stage2Ref = useRef<HTMLDivElement>(null); 
  const stage3Ref = useRef<HTMLDivElement>(null); 

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError('');

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAuthenticated(true);
      setAuditData({ 
        results: [
          { id: '1', match_type: 'VERIFIED_MATCH', name: 'Neon Permanent Sync', status: 'verified' }
        ] 
      });
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && landingRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.stagger-text', {
          y: 100,
          opacity: 0,
          skewY: 10,
          duration: 1.2,
          stagger: 0.1,
          ease: 'expo.out',
          delay: 0.2
        });
        
        gsap.fromTo('.brutal-border', 
          { scaleX: 0 }, 
          { scaleX: 1, duration: 1.5, ease: 'expo.inOut', stagger: 0.2 }
        );
      }, landingRef);
      return () => ctx.revert();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => setGsapReady(true), 500); 
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!trackRef.current || !gsapReady) return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5, 
          snap: {
            snapTo: "labels", 
            duration: { min: 0.2, max: 0.5 },
            delay: 0.05, 
            ease: 'expo.out' 
          },
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.20) setActiveStage(0);
            else if (p >= 0.20 && p < 0.50) setActiveStage(1);
            else if (p >= 0.50 && p < 0.80) setActiveStage(2);
            else setActiveStage(3);
          }
        },
      });

      tl.addLabel('stage0').to({}, { duration: 2 }) 
        .addLabel('trans1')
        .to(stage0Ref.current, { scale: 0.8, opacity: 0, filter: 'contrast(200%) blur(5px)', duration: 1.5, ease: 'expo.inOut' }, 'trans1')
        .fromTo(stage1Ref.current, 
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', yPercent: 50 }, 
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', yPercent: 0, duration: 1.5, ease: 'expo.inOut' }, 'trans1')
        .addLabel('stage1').to({}, { duration: 2 }) 
        .addLabel('trans2')
        .to(stage1Ref.current, { xPercent: -100, skewX: 10, opacity: 0, duration: 1.5, ease: 'power4.in' }, 'trans2')
        .fromTo(stage2Ref.current, 
          { xPercent: 100, skewX: -10, opacity: 0 }, 
          { xPercent: 0, skewX: 0, opacity: 1, duration: 1.5, ease: 'back.out(2)' }, 'trans2')
        .addLabel('stage2').to({}, { duration: 2 }) 
        .addLabel('trans3')
        .to(stage2Ref.current, { scale: 1.5, opacity: 0, duration: 1.5, ease: 'expo.in' }, 'trans3')
        .fromTo(stage3Ref.current, 
          { scale: 0.5, opacity: 0, rotationX: 45 }, 
          { scale: 1, opacity: 1, rotationX: 0, duration: 1.5, ease: 'bounce.out' }, 'trans3')
        .addLabel('stage3').to({}, { duration: 2 }); 

    }, trackRef);

    return () => ctx.revert();
  }, [gsapReady]);

  const executeScrollJump = (stageIndex: number) => {
    const targetY = (stageIndex / 3) * (document.body.scrollHeight - window.innerHeight);
    gsap.to(window, {
      scrollTo: targetY,
      duration: 1.2,
      ease: 'expo.inOut'
    });
  };

  return (
    <div className="relative bg-[#050506] text-[#e0e0e0] font-mono">
      <CustomCursor />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FluidBackground activeStage={isAuthenticated ? activeStage : 1} />
      </div>

      {!isAuthenticated ? (
        <main ref={landingRef} className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center z-10 p-4">
          
          <div className="absolute top-12 left-12 brutal-border origin-left w-1/4 h-[3px] bg-[#ff003c]" />
          <div className="absolute bottom-12 right-12 brutal-border origin-right w-1/4 h-[3px] bg-[#ccff00]" />
          
          <div className="absolute top-12 right-12 text-[10px] uppercase tracking-[0.3em] text-[#ff003c] font-black text-right stagger-text hidden md:block">
            NEON_DB PERMANENT STORAGE <br/> TENBIN_LABS_SYSTEM
          </div>

          <div className="z-10 flex flex-col items-center text-center max-w-md w-full">
            <div className="overflow-hidden mb-2">
              <p className="stagger-text text-[10px] uppercase tracking-[0.5em] text-[#ff003c] font-black">
                {isRegistering ? 'Register Operator Account' : 'System Locked // Enter Credentials'}
              </p>
            </div>
            
            <div className="overflow-hidden mb-1">
              <h1 className="stagger-text text-6xl md:text-8xl font-black tracking-tighter uppercase text-white flex drop-shadow-[0_0_30px_rgba(255,0,60,0.2)]">
                A<span className="text-[#ff003c]">E</span>GIS
              </h1>
            </div>

            {/* Dynamic Sign Up / Login Form */}
            <form onSubmit={handleAuthSubmit} className="w-full bg-black/80 border-[2px] border-[#ff003c]/40 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(255,0,60,0.1)] mt-4 stagger-text space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-1">Operator Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@aegis.system"
                  className="w-full bg-[#050506] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff003c]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-1">Access Key (Password)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#050506] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff003c]"
                />
              </div>

              {authError && (
                <p className="text-[10px] text-[#ff003c] uppercase tracking-wider">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authenticating}
                className="w-full bg-[#ff003c] hover:bg-[#ff003c]/80 text-black font-black text-xs uppercase tracking-widest py-3 transition-colors cursor-pointer disabled:opacity-50"
              >
                {authenticating ? 'Processing...' : isRegistering ? 'Register & Store Permanently' : 'Initialize Session'}
              </button>

              <div className="text-center pt-2 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[10px] uppercase tracking-wider text-[#888] hover:text-white transition-colors cursor-pointer"
                >
                  {isRegistering ? 'Already registered? Sign In' : 'New operator? Create an account'}
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <>
          <div ref={trackRef} className="w-full h-[500vh]" />

          {gsapReady && <GlobalAssistant onNavigate={executeScrollJump} activeStage={activeStage} />}

          {/* BRUTALIST ASSET UPLOADER MODAL */}
          {isUploaderOpen && (
            <BrutalistAssetUploader 
              onAssetUploaded={(data) => {
                if (data?.results) setAuditData(data);
              }}
              onClose={() => setIsUploaderOpen(false)}
            />
          )}

          <main ref={containerRef} className="fixed inset-0 w-screen h-screen overflow-hidden z-10 pointer-events-none">
            
            {/* STAGE 0: Reconciliation Core (Contains smaller Inject Asset button) */}
            <div 
              ref={stage0Ref} 
              className={`absolute inset-0 z-10 flex items-center justify-center p-8 origin-center ${activeStage === 0 ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <div className="w-full h-full border-[3px] border-[#333] bg-transparent flex flex-col p-8 relative overflow-hidden">
                
                {/* Header with Title and Smaller Integrated Inject Button */}
                <div className="z-20 mb-6 flex justify-between items-start bg-black/80 backdrop-blur-xl border border-[#333] p-6 shadow-2xl">
                  <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-[#fff]">Recon<span className="text-[#ccff00]">_</span>Core</h1>
                    <p className="mt-1 text-xs uppercase tracking-widest text-[#666]">Click fields to trigger sharp vector links.</p>
                  </div>
                  
                  {/* Smaller Compact Inject Button inside Stage 0 Header */}
                  <button 
                    onClick={() => setIsUploaderOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-black border-[2px] border-[#ff003c] hover:bg-[#ff003c] text-[#ff003c] hover:text-black transition-colors shadow-[3px_3px_0px_rgba(255,0,60,0.3)] cursor-pointer self-center"
                  >
                    <span className="text-[10px] uppercase tracking-widest font-black">Inject Asset</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 w-full flex items-center justify-center z-10 transform scale-95">
                  <ReconciliationCanvas data={auditData?.results || []} />
                </div>
              </div>
            </div>

            {/* STAGE 1: Q&A Terminal */}
            <div 
              ref={stage1Ref} 
              style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }}
              className={`absolute inset-0 z-20 flex items-center justify-center p-8 origin-bottom ${activeStage === 1 ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <div className="w-full h-full border-[3px] border-[#ff003c] bg-transparent flex flex-col p-8 relative overflow-hidden">
                <div className="z-20 mb-8 bg-black/80 backdrop-blur-xl border border-[#ff003c] p-6 w-max shadow-2xl">
                  <h1 className="text-6xl font-black uppercase tracking-tighter text-[#ff003c]">Terminal_</h1>
                  <p className="mt-2 text-xs uppercase tracking-widest text-[#666]">Streaming raw sub-panel analysis.</p>
                </div>
                <div className="flex-1 w-full flex items-center justify-center z-10 transform scale-90">
                  <AgentTerminal />
                </div>
              </div>
            </div>

            {/* STAGE 2: Cash Forecaster */}
            <div 
              ref={stage2Ref} 
              className={`absolute inset-0 z-30 flex items-center justify-center p-8 opacity-0 ${activeStage === 2 ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <div className="w-full h-full border-[3px] border-[#00ffff] bg-transparent flex flex-col p-8 relative overflow-hidden">
                <div className="z-20 mb-8 bg-black/80 backdrop-blur-xl border border-[#00ffff] p-6 w-max shadow-2xl">
                  <h1 className="text-6xl font-black uppercase tracking-tighter text-[#00ffff]">Liquid<span className="text-white">_Vector</span></h1>
                  <p className="mt-2 text-xs uppercase tracking-widest text-[#666]">Expanding neon timeline trajectories.</p>
                </div>
                <div className="flex-1 w-full flex items-center justify-center z-10 transform scale-90">
                  <CashForecaster />
                </div>
              </div>
            </div>

            {/* STAGE 3: Tax Matcher */}
            <div 
              ref={stage3Ref} 
              className={`absolute inset-0 z-40 flex items-center justify-center p-8 opacity-0 origin-center ${activeStage === 3 ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <div className="w-full h-full border-[3px] border-[#fff] bg-transparent flex flex-col p-8 relative overflow-hidden">
                <div className="z-20 mb-8 bg-black/80 backdrop-blur-xl border border-[#fff] p-6 w-max shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                  <h1 className="text-6xl font-black uppercase tracking-tighter text-[#fff] bg-black inline-block px-4 py-2 border border-white">Matrix.</h1>
                  <p className="mt-4 text-xs uppercase tracking-widest text-[#666]">High-contrast snapping grid layout.</p>
                </div>
                <div className="flex-1 w-full flex items-center justify-center z-10 transform scale-90">
                  <TaxMatrix data={auditData?.results || []} />
                </div>
              </div>
            </div>

          </main>
        </>
      )}
    </div>
  );
}