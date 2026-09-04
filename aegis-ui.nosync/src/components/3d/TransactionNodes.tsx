'use client';
import { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Transaction {
  transaction_id: string;
  match_type: string;
  expected_amount: number;
  audit_notes: string;
}

export default function TransactionNodes({ 
  data, 
  taxMode,
  scrollProgress = 0 
}: { 
  data: Transaction[], 
  taxMode: boolean,
  scrollProgress?: number
}) {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    return data.map((txn, i) => {
      const radius = txn.match_type.includes('EXCEPTION') || txn.match_type.includes('UNRESOLVED') ? 8 : 15;
      const theta = (i / data.length) * Math.PI * 2;
      const y = (Math.random() - 0.5) * 10;
      
      return {
        ...txn,
        position: new THREE.Vector3(
          Math.cos(theta) * radius + (Math.random() * 2 - 1),
          y,
          Math.sin(theta) * radius + (Math.random() * 2 - 1)
        ),
        isException: txn.match_type.includes('EXCEPTION') || txn.match_type.includes('UNRESOLVED'),
      };
    });
  }, [data]);

  useFrame((state) => {
    if (groupRef.current) {
      // We will use scrollProgress later to control this rotation dynamically
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03 + (scrollProgress * Math.PI);
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, idx) => (
        <InteractiveNode key={idx} node={node} taxMode={taxMode} />
      ))}
    </group>
  );
}

function InteractiveNode({ node, taxMode }: { node: any, taxMode: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      position={node.position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {node.isException ? (
        <octahedronGeometry args={[0.5, 0]} />
      ) : (
        <sphereGeometry args={[0.3, 16, 16]} />
      )}
      
      <meshStandardMaterial 
        color={taxMode ? (node.isException ? '#ff3366' : '#a855f7') : (node.isException ? '#ff3366' : '#00ffcc')} 
        emissive={taxMode ? (node.isException ? '#ff3366' : '#a855f7') : (node.isException ? '#ff3366' : '#00ffcc')}
        emissiveIntensity={hovered ? 2 : 0.5}
        wireframe={node.isException}
      />

      {hovered && (
        <Html distanceFactor={15} center>
          <div className="bg-black/90 border border-white/20 p-4 rounded-lg w-64 backdrop-blur-xl text-left pointer-events-none shadow-2xl z-50">
            <p className={`text-xs font-bold mb-1 ${node.isException ? 'text-aegis-exception' : 'text-aegis-accent'}`}>
              {node.transaction_id}
            </p>
            <p className="text-white font-mono text-lg">${node.expected_amount.toFixed(2)}</p>
            <div className="h-[1px] w-full bg-white/20 my-2" />
            <p className="text-[10px] text-gray-300 leading-relaxed uppercase">
              {node.match_type}
            </p>
            {node.isException && (
              <p className="text-[10px] text-red-400 mt-2 leading-tight">
                {node.audit_notes}
              </p>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
}