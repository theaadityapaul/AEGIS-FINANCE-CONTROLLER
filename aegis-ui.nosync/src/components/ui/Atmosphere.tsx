'use client';

export default function Atmosphere() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[-20] bg-[#030303] overflow-hidden">
      {/* Deep Fluid Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(0,255,204,0.03)_0%,rgba(0,0,0,0)_70%)] blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(255,51,102,0.03)_0%,rgba(0,0,0,0)_70%)] blur-3xl animate-[pulse_12s_ease-in-out_infinite_reverse]" />
      
      {/* Film Grain Texture Mask */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  );
}