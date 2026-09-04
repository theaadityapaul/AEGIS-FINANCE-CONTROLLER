'use client';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

type ForecastMode = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

const VECTOR_DATA = {
  CONSERVATIVE: [30, 45, 20, 10, -15, -30, -10],
  MODERATE: [50, 75, 60, 40, 20, 5, 15],
  AGGRESSIVE: [90, 120, 100, 85, 70, 50, 80]
};

const DAYS = ['D+1', 'D+2', 'D+3', 'D+4', 'D+5', 'D+6', 'D+7'];

export default function CashForecaster() {
  const [activeMode, setActiveMode] = useState<ForecastMode>('MODERATE');
  const graphRef = useRef<HTMLDivElement>(null);

  const handleModeSwitch = (mode: ForecastMode) => {
    if (mode === activeMode || !graphRef.current) return;
    
    const bars = graphRef.current.querySelectorAll('.forecast-bar');
    
    gsap.to(bars, {
      scaleY: 0,
      opacity: 0,
      duration: 0.2,
      stagger: 0.02,
      ease: 'expo.in',
      transformOrigin: 'bottom',
      onComplete: () => {
        gsap.set(bars, { clearProps: 'all' });
        setActiveMode(mode);
      }
    });
  };

  useEffect(() => {
    if (!graphRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.forecast-bar', { 
        scaleY: 0, 
        opacity: 0, 
        duration: 0.6, 
        stagger: 0.04, 
        ease: 'elastic.out(1, 0.5)',
        transformOrigin: 'bottom'
      });
    }, graphRef);
    
    return () => ctx.revert();
  }, [activeMode]);

  return (
    <div className="w-full h-[55vh] flex flex-col justify-between bg-black/60 backdrop-blur-xl border border-[#00ffff]/30 p-6 shadow-2xl">
      
      <header className="flex justify-between items-end border-b border-[#00ffff]/20 pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#00ffff]">Liquid_Vector</h2>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-mono mt-1">7-Day Capital Trajectory</p>
        </div>
        
        <div className="flex gap-2">
          {(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeSwitch(mode as ForecastMode)}
              className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest transition-colors duration-100 border ${
                activeMode === mode
                  ? 'bg-[#00ffff] text-black border-[#00ffff] shadow-[0_0_10px_#00ffff]'
                  : 'bg-transparent text-gray-400 border-gray-800 hover:text-[#00ffff] hover:border-[#00ffff]'
              }`}
            >
              {mode.substring(0, 4)}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 relative border-l border-b border-white/20 pt-8 px-4 flex items-end">
        
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0 px-4 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-[#00ffff] border-dashed" />
          ))}
        </div>

        <div ref={graphRef} className="w-full h-48 flex items-end justify-around z-10">
          {VECTOR_DATA[activeMode].map((val, i) => {
            const isNegative = val < 0;
            const height = Math.min(Math.abs(val), 100) + '%';
            
            return (
              <div key={i} className="w-12 h-full flex flex-col justify-end items-center group/bar relative">
                
                <div 
                  className={`forecast-bar w-full origin-bottom relative transition-colors duration-300 ${
                    isNegative ? 'bg-[#ff003c]' : 'bg-[#00ffff]'
                  } ${activeMode === 'AGGRESSIVE' ? 'shadow-[0_0_15px_#00ffff]' : ''}`}
                  style={{ height }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity font-black text-[10px] text-white bg-black border border-[#00ffff] px-1.5 py-0.5 pointer-events-none z-20 whitespace-nowrap">
                    {isNegative ? '-' : '+'}${Math.abs(val)}k
                  </div>

                  <div className="absolute inset-0 border-x border-black/40 pointer-events-none" />
                </div>
                
                <span className="absolute -bottom-6 text-[8px] font-black text-gray-400 uppercase tracking-widest">{DAYS[i]}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}