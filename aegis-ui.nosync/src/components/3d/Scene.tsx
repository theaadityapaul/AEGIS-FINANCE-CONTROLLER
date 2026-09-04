'use client';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stars } from '@react-three/drei';
import { OperationalStage } from '../ui/PageOrchestrator';

export default function Scene({ 
  activeStage, 
  transactionData 
}: { 
  activeStage?: OperationalStage, 
  transactionData?: any[] 
}) {
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
      {/* 1. Deep Obsidian Base */}
      <color attach="background" args={['#050506']} />
      
      {/* 2. Atmospheric Purple Fog to blend the edges */}
      <fog attach="fog" args={['#050506', 15, 60]} />
      
      {/* 3. Immersive Purple Accent Lighting */}
      <ambientLight intensity={0.2} color="#ffffff" />
      
      {/* Top Right: Bright Neon Purple */}
      <spotLight 
        position={[20, 30, 20]} 
        intensity={3} 
        angle={0.6} 
        penumbra={1} 
        color="#a855f7" 
      />
      
      {/* Bottom Left: Deep Violet Core */}
      <spotLight 
        position={[-20, -20, -20]} 
        intensity={2} 
        angle={0.6} 
        penumbra={1} 
        color="#7c3aed" 
      />

      {/* Center fill: Soft Lavender */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={0.5} 
        color="#c084fc" 
      />

      {/* 4. The Stars (Refined for the new lighting) */}
      <Stars 
        radius={80} 
        depth={50} 
        count={8000} 
        factor={3} 
        saturation={0.8} 
        fade 
        speed={1.5} 
      />
      
      <Environment preset="night" />
      
      {/* 5. Smooth, locked camera rotation */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={false} // Disabled zoom so it stays fixed as a background
        autoRotate 
        autoRotateSpeed={0.4} 
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}