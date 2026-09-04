'use client';
import { useState, useCallback } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function DataUploader({ onDataLoad }: { onDataLoad: (data: any) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsProcessing(true);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Cinematic delay for processing effect
          setTimeout(() => onDataLoad(json), 1500);
        } catch (error) {
          alert("Invalid JSON data stream.");
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid JSON reconciliation report.");
      setIsProcessing(false);
    }
  }, [onDataLoad]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020202] text-white">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-[600px] h-[400px] border-x border-y flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden backdrop-blur-xl bg-white/5
          ${isDragging ? 'border-aegis-accent scale-105 shadow-[0_0_50px_rgba(0,255,204,0.1)]' : 'border-white/10'}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-aegis-accent animate-spin" />
            <p className="font-mono text-xs tracking-widest uppercase text-aegis-accent">Analyzing Ledger Stream...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 pointer-events-none">
            <div className={`p-6 rounded-full border border-white/10 transition-colors ${isDragging ? 'bg-aegis-accent/20 border-aegis-accent/50' : 'bg-black/50'}`}>
              <UploadCloud className={`w-12 h-12 ${isDragging ? 'text-aegis-accent' : 'text-gray-500'}`} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-serif mb-2">Initialize Data Stream</h2>
              <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">Drag & Drop Reconciliation JSON</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}