'use client';
import { useState, useRef } from 'react';
import gsap from 'gsap';

interface ReconciliationCanvasProps {
  data: any[];
}

export default function ReconciliationCanvas({ data = [] }: ReconciliationCanvasProps) {
  const [isReconciling, setIsReconciling] = useState(false);
  const [hasReconciled, setHasReconciled] = useState(false);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Limit to 4 items for dense, high-impact brutalist design
  const displayData = data.slice(0, 4);

  const handleReconcile = () => {
    if (isReconciling || hasReconciled) return;
    setIsReconciling(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsReconciling(false);
        setHasReconciled(true);
      }
    });

    // Aggressive glitch/shatter effect
    tl.to(rowRefs.current, {
      x: () => (Math.random() - 0.5) * 20,
      skewX: () => (Math.random() - 0.5) * 10,
      opacity: 0.5,
      stagger: 0.05,
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      ease: 'rough({ template: none.out, strength: 2, points: 20, taper: none, randomize: true, clamp: false })'
    })
    .to(rowRefs.current, {
      x: 0,
      skewX: 0,
      opacity: 1,
      duration: 0.3,
      ease: 'expo.out'
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      
      <header className="flex justify-between items-end border-b-[3px] border-[#333] pb-6 mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-1 bg-[#333] inline-block px-2">Ledger_Ingest</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#ccff00] font-mono mt-2">SYS.STATE: Multi-Source Stream</p>
        </div>
        <button 
          onClick={handleReconcile}
          className={`px-8 py-3 font-black text-sm uppercase tracking-widest transition-all duration-100 border-[3px] ${
            hasReconciled 
              ? 'border-[#333] text-[#666] bg-transparent cursor-not-allowed'
              : 'border-[#ccff00] text-black bg-[#ccff00] hover:bg-white hover:border-white active:scale-95'
          }`}
        >
          {isReconciling ? 'ANALYZING...' : hasReconciled ? 'LOCKED' : 'EXE_RECONCILIATION'}
        </button>
      </header>

      <div className="flex-1 flex flex-col gap-2">
        <div className="grid grid-cols-4 gap-4 px-6 text-[10px] uppercase tracking-widest text-[#666] font-black border-b border-[#333] pb-2 mb-2">
          <span>TXN_ID</span>
          <span>SOURCE</span>
          <span>VALUE</span>
          <span>STATUS</span>
        </div>

        {displayData.map((trx, i) => {
          const isMatch = !trx.match_type.includes('EXCEPTION') && !trx.match_type.includes('UNRESOLVED');
          
          return (
            <div 
              key={trx.transaction_id || i}
              ref={(el) => { rowRefs.current[i] = el; }}
              className={`grid grid-cols-4 gap-4 p-4 border-[2px] transition-colors duration-200 items-center font-mono text-sm uppercase font-bold
                ${!hasReconciled ? 'border-[#333] bg-transparent text-[#888]' : 
                  isMatch ? 'border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]' : 'border-[#ff003c] bg-[#ff003c]/10 text-[#ff003c]'
                }
              `}
            >
              <span className="truncate">{trx.transaction_id}</span>
              <span>AEGIS_API</span>
              <span>${trx.expected_amount?.toFixed(2)}</span>
              <span className="flex items-center gap-3">
                <span className={`w-2 h-2 ${!hasReconciled ? 'bg-[#333]' : isMatch ? 'bg-[#ccff00] shadow-[0_0_10px_#ccff00]' : 'bg-[#ff003c] shadow-[0_0_10px_#ff003c] animate-pulse'}`} />
                {!hasReconciled ? 'PENDING' : isMatch ? 'CLEARED' : 'ANOMALY'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}