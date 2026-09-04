'use client';
import React, { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type OperationalStage = 
  | 'HERO' // New Landing Stage
  | 'RECONCILIATION' 
  | 'SETTLEMENT_QA' 
  | 'CASH_FORECASTER' 
  | 'TAX_MATCHER';

interface PageOrchestratorProps {
  children: {
    background: (activeStage: OperationalStage) => React.ReactNode;
    hero: React.ReactNode;
    stage1: React.ReactNode; 
    stage2: React.ReactNode; 
    stage3: React.ReactNode; 
    stage4: React.ReactNode; 
  };
}

export default function PageOrchestrator({ children }: PageOrchestratorProps) {
  const [activeStage, setActiveStage] = useState<OperationalStage>('HERO');

  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!trackRef.current) return;

    const ctx = gsap.context(() => {
      // The timeline is divided into 4 perfect 1-second chunks (total duration: 4s)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, 
          snap: {
            snapTo: [0, 0.25, 0.5, 0.75, 1], // Mathematically perfect resting points
            duration: { min: 0.3, max: 0.8 },
            delay: 0.05,
            ease: 'power3.inOut'
          },
          onUpdate: (self) => {
            // Strictly control the active state based on math to prevent pointer-event blocking
            const progress = self.progress;
            if (progress < 0.125) setActiveStage('HERO');
            else if (progress >= 0.125 && progress < 0.375) setActiveStage('RECONCILIATION');
            else if (progress >= 0.375 && progress < 0.625) setActiveStage('SETTLEMENT_QA');
            else if (progress >= 0.625 && progress < 0.875) setActiveStage('CASH_FORECASTER');
            else setActiveStage('TAX_MATCHER');
          }
        },
      });

      // BLOCK 1: Hero -> Stage 1 (Time: 0s to 1s)
      tl.to(heroRef.current, { opacity: 0, scale: 1.1, duration: 0.5, ease: 'power2.inOut' }, 0)
        .fromTo(stage1Ref.current, { opacity: 0, scale: 0.9, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, 0.5);

      // BLOCK 2: Stage 1 -> Stage 2 (Time: 1s to 2s)
      tl.to(stage1Ref.current, { opacity: 0, scale: 0.95, filter: 'blur(10px)', duration: 0.5, ease: 'power2.inOut' }, 1)
        .fromTo(stage2Ref.current, { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 10 }, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 0.5, ease: 'power3.out' }, 1.5);

      // BLOCK 3: Stage 2 -> Stage 3 (Time: 2s to 3s)
      tl.to(stage2Ref.current, { clipPath: 'inset(0% 0% 100% 0%)', yPercent: -10, duration: 0.5, ease: 'power2.inOut' }, 2)
        .fromTo(stage3Ref.current, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }, 2.5);

      // BLOCK 4: Stage 3 -> Stage 4 (Time: 3s to 4s)
      tl.to(stage3Ref.current, { xPercent: -20, opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 3)
        .fromTo(stage4Ref.current, { xPercent: 20, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 3.5);

    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-[#050506] text-white selection:bg-white selection:text-black font-sans">
      <div ref={trackRef} className="absolute top-0 left-0 w-full h-[500vh] z-0 pointer-events-none" />

      <main className="fixed inset-0 w-screen h-screen overflow-hidden z-10 pointer-events-none">
        
        <div className="absolute inset-0 z-0">
          {children.background(activeStage)}
        </div>

        {/* STAGE 0: HERO */}
        <div ref={heroRef} className={`absolute inset-0 z-10 flex items-center justify-center origin-center ${activeStage === 'HERO' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {children.hero}
        </div>

        {/* STAGE 1 */}
        <div ref={stage1Ref} className={`absolute inset-0 z-20 flex items-center justify-center opacity-0 origin-bottom ${activeStage === 'RECONCILIATION' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {children.stage1}
        </div>

        {/* STAGE 2 */}
        <div ref={stage2Ref} className={`absolute inset-0 z-30 flex items-center justify-center ${activeStage === 'SETTLEMENT_QA' ? 'pointer-events-auto' : 'pointer-events-none'}`} style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
          {children.stage2}
        </div>

        {/* STAGE 3 */}
        <div ref={stage3Ref} className={`absolute inset-0 z-40 flex items-center justify-center opacity-0 ${activeStage === 'CASH_FORECASTER' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {children.stage3}
        </div>

        {/* STAGE 4 */}
        <div ref={stage4Ref} className={`absolute inset-0 z-50 flex items-center justify-center opacity-0 ${activeStage === 'TAX_MATCHER' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {children.stage4}
        </div>

      </main>
    </div>
  );
}