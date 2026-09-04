'use client';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface TaxMatrixProps {
  data: any[];
}

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'Corporate Income': return 'bg-white border-white text-black';
    case 'Deductible Expense': return 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc]';
    case 'Capital Gains': return 'bg-purple-500/20 border-purple-500 text-purple-400';
    default: return 'bg-transparent border-white/20 text-gray-500';
  }
};

export default function TaxMatrix({ data = [] }: TaxMatrixProps) {
  // Map Python data into the format the Matrix expects
  const matrixData = data.map((txn, i) => {
    const isException = txn.match_type?.includes('EXCEPTION') || txn.match_type?.includes('UNRESOLVED');
    return {
      id: txn.transaction_id || `TXN-${i}`,
      amount: txn.expected_amount?.toFixed(2) || '0.00',
      category: isException ? 'Uncategorized' : 'Corporate Income',
      jurisdiction: 'Global Hub',
      risk: isException ? 'HIGH' : 'LOW',
      notes: txn.audit_notes || 'Tax routing verified.'
    };
  });

  const [selectedNode, setSelectedNode] = useState(matrixData[0] || null);
  const [isExporting, setIsExporting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.02, duration: 0.6, ease: 'back.out(1.5)' }
      );
    }
  }, []);

  useEffect(() => {
    if (panelRef.current && selectedNode) {
      gsap.fromTo(panelRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [selectedNode]);

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);

    // Reset the progress bar width
    gsap.set(progressRef.current, { width: '0%', opacity: 1 });

    // Animate the loading sequence
    gsap.to(progressRef.current, {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        // Generate the CSV file for High-Risk nodes
        const headers = ['Transaction ID', 'Amount', 'Category', 'Jurisdiction', 'Risk Level', 'Audit Notes'];
        const highRiskNodes = matrixData.filter(node => node.risk === 'HIGH');
        const csvRows = highRiskNodes.map(node => 
          `${node.id},${node.amount},${node.category},${node.jurisdiction},${node.risk},"${node.notes}"`
        );
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        // Programmatically trigger the download
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'Aegis_Jurisdiction_Audit.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Fade out the progress bar and reset state
        gsap.to(progressRef.current, { opacity: 0, duration: 0.3, delay: 0.5 });
        setTimeout(() => setIsExporting(false), 800);
      }
    });
  };

  if (!selectedNode) return null;

  return (
    <div className="w-[85vw] h-[75vh] flex gap-8">
      
      <div className="flex-1 bg-[#050506]/90 backdrop-blur-2xl border border-white/10 p-8 flex flex-col shadow-2xl">
        <header className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif text-white">Global Tax Matrix</h2>
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono mt-1">Cross-Border Ledger Scanning</p>
          </div>
          <div className="flex gap-4 text-[9px] font-mono uppercase tracking-widest">
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-white" /> Income</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#00ffcc]" /> Deductible</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500" /> Capital</span>
          </div>
        </header>

        <div ref={gridRef} className="flex-1 grid grid-cols-8 gap-2 content-start overflow-y-auto pr-2 custom-scrollbar">
          {matrixData.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`h-12 border text-[8px] font-mono transition-all duration-300 flex items-center justify-center overflow-hidden
                ${selectedNode.id === node.id ? 'ring-2 ring-white scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'hover:scale-105 hover:border-white/50'}
                ${getCategoryColor(node.category)}
              `}
            >
              {node.id.substring(0, 6)}...
            </button>
          ))}
        </div>
      </div>

      <div className="w-[350px] bg-white border border-white/10 p-8 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-[0.03] pointer-events-none" />
        
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono mb-8 border-b border-gray-200 pb-4">
          Node Inspection
        </h3>

        <div ref={panelRef} className="flex-1 flex flex-col gap-8">
          <div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Transaction ID</p>
            <p className="text-xl font-serif text-black break-all">{selectedNode.id}</p>
          </div>

          <div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Cleared Value</p>
            <p className="text-4xl font-mono text-black tracking-tighter">${selectedNode.amount}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-gray-200 py-6">
            <div>
              <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Tax Routing</p>
              <p className={`text-[10px] font-bold font-mono px-2 py-1 inline-block ${getCategoryColor(selectedNode.category)}`}>
                {selectedNode.category}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Jurisdiction</p>
              <p className="text-sm font-mono text-black font-bold">{selectedNode.jurisdiction}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-6">
            {/* Contextual Risk Display */}
            {selectedNode.risk === 'HIGH' ? (
              <div className="bg-red-50 border border-red-200 p-4">
                <p className="text-[10px] font-mono text-red-600 uppercase tracking-widest font-bold mb-1">Audit Warning</p>
                <p className="text-xs text-red-800">{selectedNode.notes}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 p-4">
                <p className="text-[10px] font-mono text-green-600 uppercase tracking-widest font-bold mb-1">Status Cleared</p>
                <p className="text-xs text-green-800">{selectedNode.notes}</p>
              </div>
            )}

            {/* NEW: Export Audit Protocol */}
            <div className="pt-2 border-t border-gray-200">
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full relative overflow-hidden bg-black text-white font-mono text-[10px] uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                <span className="relative z-10">{isExporting ? 'GENERATING REPORT...' : '[ EXPORT JURISDICTION AUDIT ]'}</span>
                {/* The GSAP Loading Bar inside the button */}
                <div 
                  ref={progressRef}
                  className="absolute top-0 left-0 h-full bg-purple-600/50 w-0 z-0"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}