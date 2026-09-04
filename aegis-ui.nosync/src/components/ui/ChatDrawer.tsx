'use client';
import { useState } from 'react';
import { Send, Terminal } from 'lucide-react';

export default function ChatDrawer() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'Aegis Node online. Neural link established. Awaiting controller inquiry...' }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'human', content: userMessage }]);
    
    try {
      // Hit your Python FastAPI server
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, data]);
      
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'CRITICAL ERROR: Cannot reach Python backend on port 8000.' 
      }]);
    }
  };

  return (
    <div className="aegis-terminal absolute top-0 right-0 h-full w-[400px] bg-[#050505]/80 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col pointer-events-auto z-50 shadow-2xl">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <Terminal className="text-aegis-accent" />
        <h2 className="text-white font-mono font-bold tracking-widest text-sm mt-1">AEGIS TERMINAL</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 no-scrollbar mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-4 rounded-xl text-sm font-mono leading-relaxed shadow-lg ${
            msg.role === 'ai' 
              ? 'bg-aegis-panel text-aegis-accent border border-aegis-accent/20' 
              : 'bg-white/10 text-white self-end text-right border border-white/5'
          }`}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query batch anomalies..." 
          className="w-full bg-black border border-white/20 rounded-xl py-4 px-4 text-white font-mono text-xs focus:outline-none focus:border-aegis-accent transition-colors shadow-inner"
        />
        <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-white/10 hover:bg-aegis-accent hover:text-black rounded-lg transition-all text-white">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}