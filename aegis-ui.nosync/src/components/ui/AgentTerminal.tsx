'use client';
import { useState, useRef } from 'react';
import gsap from 'gsap';

const PRESET_QUERIES = ["Analyze Q3 discrepancies", "Identify tax anomalies", "Forecast liquidity drain"];

const generateResponse = (query: string) => {
  const q = query.toLowerCase();
  
  // 1. Greetings
  if (['hi', 'hello', 'hey', 'ping', 'status', 'wake'].some(w => q.includes(w))) {
    return "Aegis Neural Core online. Security protocols active. System status nominal. Ready for ledger ingestion and cross-border settlement queries.";
  }
  
  // 2. Strategy & Advice (Expanded to catch business strategy and profit questions)
  if (['help', 'advis', 'recommend', 'support', 'guide', 'how to', 'profit', 'increase', 'strategy', 'grow', 'revenue'].some(w => q.includes(w))) {
    return "Aegis is a strict ledger reconciliation engine, not a business strategist or financial advisor. My directives are limited to anomaly detection, liquidity forecasting, and tax-line isolation. Please specify a targeted dataset command.";
  }
  
  // 3. Payment Gateways & Companies (This will only fire if they aren't asking for advice about the company)
  if (['razorpay', 'rasorpay', 'stripe', 'paypal', 'vendor', 'company'].some(w => q.includes(w))) {
    return "Scanning specified vendor gateways... Ingestion streams from payment processors are currently locked. 99.8% match rate on recent API payloads. No severe anomalies flagged for this entity.";
  }
  
  // 4. Tax / Anomalies / Discrepancies
  if (['tax', 'anomal', 'discrepanc', 'q3', 'error'].some(w => q.includes(w))) {
    return "Cross-referencing global tax registries... Discrepancy found in UK-LND jurisdiction. $4,520.00 offset traced to undocumented processing fees. Re-routing ledger for manual CPA verification.";
  }
  
  // 5. Liquidity / Forecasting
  if (['liquid', 'forecast', 'drain', 'cash'].some(w => q.includes(w))) {
    return "Projecting 7-day liquidity vector. Warning: Deficit of $145,000 anticipated on Day 4 due to overlapping vendor settlements. Recommend activating conservative growth metrics.";
  }

  // 6. Default Fallback
  return "Query parameters accepted. Scanning active ledgers... No critical anomalies, jurisdiction mismatches, or liquidity flags detected for the requested dataset.";
};

export default function AgentTerminal() {
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);

  const handleQuerySubmit = (e?: React.FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();
    const query = queryOverride || inputValue;
    if (!query.trim() || isStreaming) return;
    
    setActiveQuery(query);
    setInputValue('');
    setIsStreaming(true);

    const newResponse = generateResponse(query);
    setCurrentResponse(newResponse);

    if (responseRef.current) {
      gsap.killTweensOf(responseRef.current.children);
      gsap.set(responseRef.current.children, { opacity: 0, y: 10 });
    }

    setTimeout(() => {
      if (responseRef.current) {
        gsap.to(responseRef.current.children, {
          opacity: 1,
          y: 0,
          stagger: 0.04,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => setIsStreaming(false)
        });
      }
    }, 400);
  };

  return (
    <div className="w-[60vw] h-[75vh] bg-[#050506]/90 backdrop-blur-3xl border border-white/10 p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-aegis-accent/20 blur-[100px] transition-opacity duration-1000 rounded-full pointer-events-none ${isStreaming ? 'opacity-100' : 'opacity-0'}`} />

      <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-8 z-10">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isStreaming ? 'bg-aegis-accent animate-pulse' : 'bg-black'}`} />
          </div>
          <h2 className="text-xl font-mono tracking-widest text-white uppercase">Neural Settlement Agent</h2>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-mono">Terminal Active</p>
      </header>

      <div className="flex-1 overflow-hidden z-10 mb-8">
        {activeQuery ? (
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="text-gray-500 font-mono text-sm mt-1">{'>'}</span>
              <p className="text-white font-mono text-sm uppercase tracking-widest bg-white/5 py-2 px-4 border border-white/10">{activeQuery}</p>
            </div>
            <div className="flex gap-4">
              <span className="text-aegis-accent font-mono text-sm mt-1 animate-pulse">#</span>
              <div ref={responseRef} className="flex flex-wrap gap-x-2 gap-y-1 text-gray-300 font-serif text-2xl leading-relaxed">
                {currentResponse.split(' ').map((word, i) => (
                  <span key={i} className="opacity-0 inline-block">{word}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-center opacity-40">
            <span className="font-mono text-4xl mb-4 text-gray-600">{`</>`}</span>
            <p className="font-mono text-sm uppercase tracking-widest text-gray-400">Awaiting Command Input</p>
          </div>
        )}
      </div>

      <div className="z-10 flex flex-col gap-4">
        <div className="flex gap-3">
          {PRESET_QUERIES.map((query, i) => (
            <button
              key={i}
              onClick={() => handleQuerySubmit(undefined, query)}
              disabled={isStreaming}
              className="text-[10px] font-mono uppercase tracking-widest text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {query}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleQuerySubmit} className="relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isStreaming}
            placeholder="TYPE PROTOCOL COMMAND HERE..."
            className="w-full bg-transparent border-b-2 border-white/20 focus:border-aegis-accent outline-none text-white font-mono text-lg py-4 placeholder:text-gray-600 transition-colors disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isStreaming || !inputValue.trim()}
            className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-widest text-aegis-accent hover:text-white transition-colors disabled:opacity-50"
          >
            Execute
          </button>
        </form>
      </div>
    </div>
  );
}