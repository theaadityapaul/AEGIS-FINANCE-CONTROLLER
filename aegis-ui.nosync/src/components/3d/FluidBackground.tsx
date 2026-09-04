'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FluidBackgroundProps {
  activeStage: number;
}

function KineticCreature({ activeStage }: { activeStage: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 10000;

  const [positions, basePositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const base = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 15 + Math.random() * 5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      base[i * 3] = x; base[i * 3 + 1] = y; base[i * 3 + 2] = z;
    }
    return [pos, base];
  }, []);

  // We build both the geometry AND the material natively in Three.js.
  // This completely eliminates the <pointsMaterial> JSX tag that crashed your compiler.
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color('#222222') 
    });

    return { geometry: geo, material: mat };
  }, [positions]);

  const targetColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    let stageColor = '#222222';
    if (activeStage === 0) stageColor = '#ccff00'; 
    if (activeStage === 1) stageColor = '#ff003c'; 
    if (activeStage === 2) stageColor = '#00ffff'; 
    if (activeStage === 3) stageColor = '#ffffff'; 

    targetColor.set(stageColor);
    mat.color.lerp(targetColor, 0.05);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const bx = basePositions[idx];
      const by = basePositions[idx + 1];
      const bz = basePositions[idx + 2];

      let tx = bx, ty = by, tz = bz;

      if (activeStage === 0) {
        const pulse = Math.sin(time * 2 + bx * 0.1) * 2;
        tx += pulse; ty += pulse; tz += pulse;
      } else if (activeStage === 1) {
        tx += Math.sin(time * 10 + by) * 5;
        ty += Math.cos(time * 10 + bx) * 5;
      } else if (activeStage === 2) {
        tx += Math.sin(time * 3 + bz * 0.5) * 10;
        ty += Math.cos(time * 2 + bx * 0.5) * 2;
      } else if (activeStage === 3) {
        tx = Math.round(bx / 5) * 5;
        ty = Math.round(by / 5) * 5;
        tz = Math.round(bz / 5) * 5;
      }

      positionsAttr.array[idx] += (tx - positionsAttr.array[idx]) * 0.1;
      positionsAttr.array[idx + 1] += (ty - positionsAttr.array[idx + 1]) * 0.1;
      positionsAttr.array[idx + 2] += (tz - positionsAttr.array[idx + 2]) * 0.1;
    }

    positionsAttr.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.2;
    pointsRef.current.rotation.x = time * 0.1;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}

// Instead of a <fog> JSX tag, we manually inject it into the scene via a hook
function SceneEnvironment() {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.fog = new THREE.Fog('#030304', 20, 60);
  }, [scene]);

  return null;
}

export default function FluidBackground({ activeStage }: FluidBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#030304] -z-10">
      <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
        <SceneEnvironment />
        <KineticCreature activeStage={activeStage} />
      </Canvas>
    </div>
  );
}