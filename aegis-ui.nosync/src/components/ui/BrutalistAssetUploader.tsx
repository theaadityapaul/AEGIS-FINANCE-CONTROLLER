'use client';
import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, Terminal } from 'lucide-react';

export default function BrutalistAssetUploader({ onAssetUploaded, onClose }: { onAssetUploaded: (data: any) => void; onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setLoading(true);
    setError('');

    try {
      // If it's a JSON audit file, read it for the dashboard
      if (file.type.includes('json') || file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        onAssetUploaded(json);
      }

      // Persist metadata to Neon via our API
      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.name.split('.').pop() || 'unknown',
          mimeType: file.mimeType || 'application/octet-stream',
          sizeBytes: file.size,
          googleDriveFileId: `asset_${Date.now()}_${file.name}`,
        }),
      });

      if (!res.ok) throw new Error('Failed to log asset to cloud database');

      setSuccessMsg(`[SUCCESS] ${file.name} synced to Neon cloud.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid file format');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#050506] border-[3px] border-[#ff003c] p-6 shadow-[0_0_50px_rgba(255,0,60,0.2)] font-mono text-white relative">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-[2px] border-[#333] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#ff003c]" />
            <span className="text-xs uppercase tracking-[0.2em] font-black text-[#ff003c]">AEGIS // CLOUD_ASSET_INJECTOR</span>
          </div>
          <button onClick={onClose} className="text-[#888] hover:text-[#ff003c] font-black text-xl leading-none cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-[2px] border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragging ? 'border-[#ccff00] bg-[#ccff00]/10' : 'border-[#333] hover:border-[#ff003c] bg-black/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
            className="hidden"
          />
          <Upload className={`w-10 h-10 mb-3 ${dragging ? 'text-[#ccff00]' : 'text-[#ff003c]'}`} />
          <p className="text-xs uppercase tracking-widest text-center font-bold mb-1">
            Drag & Drop local disk asset here
          </p>
          <p className="text-[10px] text-[#666] uppercase tracking-wider">
            Supports JSON audits, system logs & datasets
          </p>
        </div>

        {loading && (
          <div className="mt-4 text-center text-xs uppercase tracking-widest text-[#ccff00] animate-pulse">
            Processing and syncing to Neon database...
          </div>
        )}

        {error && (
          <div className="mt-4 text-center text-xs uppercase tracking-wider text-[#ff003c]">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-[#ccff00]">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#222] flex justify-between items-center text-[10px] text-[#666]">
          <span>STORAGE: NEON_POSTGRESQL</span>
          <button onClick={onClose} className="hover:text-white uppercase tracking-wider">Close Window</button>
        </div>

      </div>
    </div>
  );
}