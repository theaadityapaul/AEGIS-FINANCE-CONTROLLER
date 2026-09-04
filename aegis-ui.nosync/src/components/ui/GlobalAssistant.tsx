'use client';
import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface GlobalAssistantProps {
  onNavigate: (stageIndex: number) => void;
  activeStage: number;
}

export default function GlobalAssistant({ onNavigate, activeStage }: GlobalAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'AEGIS CONCIERGE ACTIVE. COMMAND OR QUERY REQUIRED.' }
  ]);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Aggressive panel expansion animation
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(panelRef.current, 
        { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)', scale: 0.9 },
        { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', scale: 1, duration: 0.6, ease: 'expo.out', display: 'flex' }
      );
      setTimeout(() => inputRef.current?.focus(), 600);
    } else {
      gsap.to(panelRef.current, {
        clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
        scale: 0.9,
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => gsap.set(panelRef.current, { display: 'none' })
      });
    }
  }, [isOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue.trim().toLowerCase();
    setChatLog(prev => [...prev, { role: 'user', text: query }]);
    setInputValue('');

    // Brutalist Intent Routing & Spatial Awareness
    setTimeout(() => {
      let response = '';
      
      const isContextual = ['explain', 'what is', 'help', 'where am i', 'screen', 'how'].some(w => query.includes(w));
      const isGreeting = ['hi', 'hello', 'hey', 'ping'].some(w => query.includes(w));

      if (isGreeting) {
        response = 'DAEMON ONLINE. AWAITING FINANCIAL DIRECTIVE.';
      } 
      // SPATIAL AWARENESS: AI reads the activeStage prop to answer questions about the screen
      else if (isContextual) {
        if (activeStage === 0) {
          response = 'CONTEXT [RECON_CORE]: You are viewing the multi-source ledger ingestion matrix. This engine cross-references external payment gateways against internal ERP ledgers to isolate financial discrepancies.';
        } else if (activeStage === 1) {
          response = 'CONTEXT [TERMINAL]: You are in the Neural Settlement Agent. This is a strict NLP interface for querying active financial anomalies and executing manual ledger traces.';
        } else if (activeStage === 2) {
          response = 'CONTEXT [LIQUID_VECTOR]: You are viewing the forward cash forecaster. This module projects capital availability and tracks potential liquidity drains based on pending settlements.';
        } else if (activeStage === 3) {
          response = 'CONTEXT [MATRIX]: You are in the high-contrast tax-line matcher. Select a red high-risk transaction node to cross-reference jurisdictional compliance and export CPA audit reports.';
        }
      } 
      // NAVIGATIONAL COMMANDS
      else if (query.includes('recon') || query.includes('ledger')) {
        response = 'EXECUTING JUMP: RECONCILIATION CORE.';
        onNavigate(0);
      } else if (query.includes('terminal') || query.includes('q&a') || query.includes('query')) {
        response = 'EXECUTING JUMP: RAW ANALYSIS TERMINAL.';
        onNavigate(1);
      } else if (query.includes('forecast') || query.includes('liquid') || query.includes('cash')) {
        response = 'EXECUTING JUMP: FORWARD LIQUIDITY VECTOR.';
        onNavigate(2);
      } else if (query.includes('tax') || query.includes('matrix') || query.includes('audit')) {
        response = 'EXECUTING JUMP: TAX-LINE MATRIX.';
        onNavigate(3);
      } else {
        response = `SYNTAX UNRECOGNIZED: "${query}". AVAILABLE DIRECTIVES: [EXPLAIN SCREEN], OR JUMP TO [RECON, TERMINAL, FORECAST, TAX].`;
      }

      setChatLog(prev => [...prev, { role: 'ai', text: response }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-auto">
      
      <div 
        ref={panelRef}
        className="hidden flex-col w-[400px] h-[500px] bg-[#050506] border-[3px] border-[#ccff00] mb-4 shadow-[10px_10px_0px_rgba(204,255,0,0.2)]"
      >
        <header className="flex justify-between items-center p-4 border-b-[3px] border-[#333] bg-[#0a0a0c]">
          <span className="text-[#ccff00] font-black tracking-widest uppercase text-sm">Concierge_Daemon</span>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#ff003c] font-black text-xl leading-none">&times;</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {chatLog.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 font-mono text-xs uppercase tracking-wider leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#333] text-white border border-[#555]' 
                  : 'bg-[#ccff00]/10 text-[#ccff00] border-l-[3px] border-[#ccff00]'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t-[3px] border-[#333] flex">
          <input 
            ref={inputRef}
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="OVERRIDE COMMAND..."
            className="flex-1 bg-transparent border-none p-4 text-white font-mono text-xs uppercase focus:outline-none placeholder:text-[#555]"
          />
          <button type="submit" className="bg-[#ccff00] text-black font-black px-6 hover:bg-white transition-colors">
            EXE
          </button>
        </form>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#ccff00] border-[3px] border-black flex items-center justify-center hover:scale-95 transition-transform duration-100 shadow-[8px_8px_0px_rgba(255,255,255,0.1)] group"
      >
        <div className="w-6 h-6 border-[3px] border-black group-hover:rotate-45 transition-transform duration-300 ease-in-out" />
      </button>

      <div className="absolute top-2 right-20 text-[9px] font-mono tracking-[0.3em] text-[#666] uppercase bg-black/50 px-2 py-1 pointer-events-none">
        MOD_[0{activeStage}]
      </div>
    </div>
  );
}