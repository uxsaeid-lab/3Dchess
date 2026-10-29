import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createStonePlinthTexture } from '../../utils/proceduralTextures';

// Deterministic pseudo-random number generator for pure memoization
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

export const CathedralEnvironment: React.FC = () => {
  const dustRef = useRef<THREE.Points>(null);
  const flameLightsRef = useRef<(THREE.PointLight | null)[]>([]);

  // 1. Procedural Dust Motes & Floating Embers Particles
  const { particleGeo, particleMat } = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const goldColor = new THREE.Color('#f59e0b');
    const moonColor = new THREE.Color('#93c5fd');

    for (let i = 0; i < count; i++) {
      // Cylindrical distribution around sanctuary
      const rVal = pseudoRandom(i * 3 + 1);
      const thetaVal = pseudoRandom(i * 3 + 2);
      const yVal = pseudoRandom(i * 3 + 3);

      const radius = 2.5 + rVal * 8.5;
      const theta = thetaVal * Math.PI * 2;
      const y = 0.5 + yVal * 9.0;

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      // 60% warm gold embers, 40% cool moon motes
      const isGold = pseudoRandom(i * 7 + 4) > 0.4;
      const c = isGold ? goldColor : moonColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 240, 200, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const tex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      map: tex,
      transparent: true,
      opacity: 0.75,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { particleGeo: geo, particleMat: mat };
  }, []);

  // Animate dust motes drift & flame light flicker
  useFrame((state, delta) => {
    // 1. Dust drift
    if (dustRef.current) {
      const posAttr = dustRef.current.geometry.attributes.position;
      const posArray = posAttr.array as Float32Array;
      const count = posArray.length / 3;

      for (let i = 0; i < count; i++) {
        // Subtle vertical float + gentle spiral air current
        posArray[i * 3 + 1] += delta * (0.2 + (i % 5) * 0.05);
        posArray[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.003;
        posArray[i * 3 + 2] += Math.cos(state.clock.elapsedTime * 0.4 + i) * 0.003;

        // Wrap around height
        if (posArray[i * 3 + 1] > 9.5) {
          posArray[i * 3 + 1] = 0.5;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Flickering braziers
    const t = state.clock.elapsedTime;
    flameLightsRef.current.forEach((light, idx) => {
      if (light) {
        // Natural candle/torch flicker combination
        const flicker =
          Math.sin(t * 12 + idx * 3.14) * 0.15 +
          Math.sin(t * 23 + idx * 1.7) * 0.08 +
          (Math.random() - 0.5) * 0.06;
        light.intensity = THREE.MathUtils.clamp(1.4 + flicker, 1.0, 1.85);
      }
    });
  });

  // Plinth Stone Texture
  const stoneTex = useMemo(() => createStonePlinthTexture(), []);

  // 4 Brazier Corner Positions
  const brazierPositions: [number, number, number][] = [
    [-5.3, 0, -5.3],
    [5.3, 0, -5.3],
    [-5.3, 0, 5.3],
    [5.3, 0, 5.3],
  ];

  return (
    <group>
      {/* --- Ambient Moonlight & Stained Glass Spotlight --- */}
      {/* Deep ethereal moonlight base */}
      <ambientLight intensity={0.4} color="#1e293b" />

      {/* Dramatic Cool Stained-Glass Spotlight from high cathedral clerestory */}
      <spotLight
        position={[4, 15, 6]}
        target-position={[0, 0, 0]}
        intensity={2.6}
        color="#93c5fd"
        angle={0.65}
        penumbra={0.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00015}
        shadow-camera-near={2}
        shadow-camera-far={25}
      />

      {/* Counter-balanced warm stained-glass ray (amber/magenta hint) */}
      <spotLight
        position={[-6, 14, -5]}
        target-position={[0, 0, 0]}
        intensity={1.1}
        color="#fed7aa"
        angle={0.7}
        penumbra={0.8}
      />

      {/* --- Floating Dust Motes & Embers --- */}
      <points ref={dustRef} geometry={particleGeo} material={particleMat} />

      {/* --- 4 Corner Pedestal Braziers with Flickering Fire --- */}
      {brazierPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Stone Brazier Column Base */}
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.32, 0.42, 0.9, 16]} />
            <meshStandardMaterial color="#1a202c" roughness={0.75} metalness={0.1} />
          </mesh>

          {/* Bronze Fire Bowl Basin */}
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.48, 0.28, 0.2, 16]} />
            <meshStandardMaterial color="#78350f" roughness={0.35} metalness={0.8} />
          </mesh>

          {/* Emissive Fire Core */}
          <mesh position={[0, 1.12, 0]}>
            <coneGeometry args={[0.22, 0.38, 16]} />
            <meshStandardMaterial
              color="#ff8c00"
              emissive="#ea580c"
              emissiveIntensity={2.5}
              roughness={0.1}
            />
          </mesh>

          {/* Flickering Fire Point Light */}
          <pointLight
            ref={(el) => {
              flameLightsRef.current[idx] = el;
            }}
            position={[0, 1.25, 0]}
            color="#f97316"
            intensity={1.4}
            distance={8.5}
            decay={2}
          />
        </group>
      ))}

      {/* --- Cathedral Dais Plinth & Perimeter Architecture --- */}
      {/* Elevated Cathedral Stone Plinth for the board */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[11.5, 0.4, 11.5]} />
        <meshStandardMaterial
          map={stoneTex}
          color="#1e293b"
          roughness={0.8}
          metalness={0.15}
        />
      </mesh>

      {/* Lower stepped altar terrace */}
      <mesh position={[0, -0.7, 0]} receiveShadow>
        <boxGeometry args={[14.5, 0.3, 14.5]} />
        <meshStandardMaterial
          map={stoneTex}
          color="#0f172a"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Perimeter Gothic Arches (8 Pillars with Pointed Arch Vaulting) */}
      <GothicPerimeterArches />
    </group>
  );
};

// Perimeter Gothic Arch Pillars surrounding the cathedral sanctuary
const GothicPerimeterArches: React.FC = () => {
  const pillars = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number }[] = [];
    const radius = 9.8;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      list.push({
        pos: [Math.cos(angle) * radius, 3.2, Math.sin(angle) * radius],
        rotY: angle + Math.PI / 2,
      });
    }
    return list;
  }, []);

  return (
    <group>
      {pillars.map((p, idx) => (
        <group key={idx} position={p.pos} rotation={[0, p.rotY, 0]}>
          {/* Main Gothic Pillar Column */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.5, 6.8, 12]} />
            <meshStandardMaterial color="#111827" roughness={0.7} metalness={0.2} />
          </mesh>

          {/* Stepped Capital Header */}
          <mesh position={[0, 3.5, 0]}>
            <boxGeometry args={[1.1, 0.35, 1.1]} />
            <meshStandardMaterial color="#1f2937" roughness={0.6} metalness={0.3} />
          </mesh>

          {/* Pointed Arch Inward Rib Vault */}
          <mesh
            position={[0, 4.4, -0.6]}
            rotation={[0.35, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.32, 2.2, 0.32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.65} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
