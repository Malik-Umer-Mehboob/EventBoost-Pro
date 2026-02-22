import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 2000, color = "#a855f7", size = 0.005, speed = 1 }) {
  const ref = useRef<THREE.Points>(null!);
  
  // Create sphere of particles
  const sphere = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 1.5 + Math.random() * 0.5;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        positions.set([x, y, z], i * 3);
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= (delta * speed) / 10;
      ref.current.rotation.y -= (delta * speed) / 15;
      
      // Subtle mouse parallax
      const { x, y } = state.mouse;
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x * 0.1, 0.1);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, y * 0.1, 0.1);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={size}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* Radial Gradient overlay for depth */}
      <div 
        className="absolute inset-0 bg-[#020617]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)'
        }}
      />
      
      <Canvas camera={{ position: [0, 0, 1.2], fov: 75 }}>
        <ambientLight intensity={0.5} />
        
        {/* Layer 1: Large soft particles */}
        <ParticleField count={800} color="#6366f1" size={0.008} speed={0.5} />
        
        {/* Layer 2: Medium purple particles */}
        <ParticleField count={2000} color="#a855f7" size={0.004} speed={1} />
        
        {/* Layer 3: Small cyan accent particles */}
        <ParticleField count={500} color="#22d3ee" size={0.002} speed={1.5} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;

