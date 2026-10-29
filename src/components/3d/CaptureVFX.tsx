import { useState, useRef, useImperativeHandle, forwardRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PieceColor } from '../../types/chess';

export interface CaptureVFXRef {
  triggerCapture: (position: [number, number, number], color: PieceColor) => void;
}

interface PhysicalShard {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotSpeed: THREE.Vector3;
  scale: number;
  initialScale: number;
}

interface GhostSmokeParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  scale: number;
  alpha: number;
  swirlAngle: number;
  swirlSpeed: number;
}

interface CaptureEvent {
  id: string;
  color: PieceColor;
  startTime: number;
  duration: number;
  shards: PhysicalShard[];
  smokeParticles: GhostSmokeParticle[];
}

export const CaptureVFX = forwardRef<CaptureVFXRef>((_, ref) => {
  const [events, setEvents] = useState<CaptureEvent[]>([]);
  const eventsRef = useRef<CaptureEvent[]>([]);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useImperativeHandle(ref, () => ({
    triggerCapture: (pos: [number, number, number], color: PieceColor) => {
      // 1. Generate Physical Falling Shards
      const shardCount = 36;
      const shards: PhysicalShard[] = [];
      for (let i = 0; i < shardCount; i++) {
        const theta = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 1.4 + Math.random() * 2.2;
        const upward = 0.8 + Math.random() * 1.8;

        shards.push({
          position: new THREE.Vector3(
            pos[0] + (Math.random() - 0.5) * 0.25,
            pos[1] + 0.2 + Math.random() * 0.5,
            pos[2] + (Math.random() - 0.5) * 0.25
          ),
          velocity: new THREE.Vector3(
            Math.cos(theta) * speed,
            upward,
            Math.sin(theta) * speed
          ),
          rotation: new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ),
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 18
          ),
          scale: 0.11 + Math.random() * 0.11,
          initialScale: 0.11 + Math.random() * 0.11,
        });
      }

      // 2. Generate Ethereal Ghost/Smoke Soul Dispersion Particles
      const smokeCount = 70;
      const smokeParticles: GhostSmokeParticle[] = [];
      for (let i = 0; i < smokeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const drift = 0.3 + Math.random() * 0.8;
        smokeParticles.push({
          position: new THREE.Vector3(
            pos[0] + (Math.random() - 0.5) * 0.2,
            pos[1] + Math.random() * 0.3,
            pos[2] + (Math.random() - 0.5) * 0.2
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * drift,
            1.4 + Math.random() * 1.8, // Accelerates upward
            Math.sin(angle) * drift
          ),
          scale: 0.16 + Math.random() * 0.2,
          alpha: 0.85,
          swirlAngle: angle,
          swirlSpeed: (Math.random() - 0.5) * 4.0,
        });
      }

      const newEvent: CaptureEvent = {
        id: Math.random().toString(36).substring(2, 9),
        color,
        startTime: performance.now() / 1000,
        duration: 1.8,
        shards,
        smokeParticles,
      };

      setEvents((prev) => [...prev, newEvent]);
    },
  }));

  // Update physics and particles frame-by-frame
  useFrame((_, delta) => {
    if (eventsRef.current.length === 0) return;

    const now = performance.now() / 1000;
    const gravity = -11.5;
    const floorY = 0.08;

    eventsRef.current.forEach((ev) => {
      const elapsed = now - ev.startTime;
      const progress = Math.min(1, elapsed / ev.duration);

      if (progress < 1) {
        // 1. Shards physics
        ev.shards.forEach((s) => {
          s.velocity.y += gravity * delta;
          s.position.x += s.velocity.x * delta;
          s.position.y += s.velocity.y * delta;
          s.position.z += s.velocity.z * delta;

          // Bounce off wooden board surface
          if (s.position.y <= floorY) {
            s.position.y = floorY;
            s.velocity.y = -s.velocity.y * 0.38;
            s.velocity.x *= 0.75;
            s.velocity.z *= 0.75;
          }

          s.rotation.x += s.rotSpeed.x * delta;
          s.rotation.y += s.rotSpeed.y * delta;
          s.rotation.z += s.rotSpeed.z * delta;

          // Shrink towards end
          const shrink = Math.max(0, 1 - Math.pow(progress, 1.8));
          s.scale = s.initialScale * shrink;
        });

        // 2. Ghost Smoke Soul Rising Dispersion
        ev.smokeParticles.forEach((sm) => {
          sm.swirlAngle += sm.swirlSpeed * delta;
          sm.position.x += (Math.cos(sm.swirlAngle) * 0.4 + sm.velocity.x) * delta;
          sm.position.y += sm.velocity.y * delta;
          sm.position.z += (Math.sin(sm.swirlAngle) * 0.4 + sm.velocity.z) * delta;

          // Smoke expands as it rises
          sm.scale += delta * 0.45;
          // Smooth alpha fade
          sm.alpha = Math.max(0, (1 - progress) * 0.85);
        });
      }
    });

    // Clean up finished events
    const remaining = eventsRef.current.filter((ev) => now - ev.startTime < ev.duration);
    if (remaining.length !== eventsRef.current.length) {
      setEvents(remaining);
    }
  });

  return (
    <group>
      {events.map((ev) => (
        <CaptureEventRenderer key={ev.id} event={ev} />
      ))}
    </group>
  );
});

CaptureVFX.displayName = 'CaptureVFX';

// Renderer for individual capture event shards and smoke
const CaptureEventRenderer: React.FC<{ event: CaptureEvent }> = ({ event }) => {
  const isLight = event.color === 'w';
  const pointsRef = useRef<THREE.Points>(null);

  // Faceted shard geometry
  const shardGeo = useMemo(() => new THREE.TetrahedronGeometry(1, 0), []);

  // Shard Material: Antique Ivory or Carved Ebony with high clearcoat
  const shardMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isLight ? '#fcf7ed' : '#1a1412'),
      roughness: 0.16,
      metalness: isLight ? 0.05 : 0.15,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
    });
  }, [isLight]);

  // Ethereal Ghost Smoke Soul Points
  const { smokeGeo, smokeMat } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = event.smokeParticles.length;
    const positions = new Float32Array(count * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Smooth soft smoke radial sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      const coreColor = isLight ? 'rgba(254, 240, 138, 0.9)' : 'rgba(165, 180, 252, 0.9)';
      const midColor = isLight ? 'rgba(245, 158, 11, 0.4)' : 'rgba(129, 140, 248, 0.4)';
      grad.addColorStop(0, coreColor);
      grad.addColorStop(0.4, midColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      map: tex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { smokeGeo: geo, smokeMat: mat };
  }, [event.smokeParticles.length, isLight]);

  // Update smoke point positions & opacity via pointsRef
  useFrame(() => {
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        event.smokeParticles.forEach((sm, i) => {
          arr[i * 3] = sm.position.x;
          arr[i * 3 + 1] = sm.position.y;
          arr[i * 3 + 2] = sm.position.z;
        });
        posAttr.needsUpdate = true;
      }
      if (event.smokeParticles.length > 0) {
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        mat.opacity = event.smokeParticles[0].alpha;
        mat.size = 0.55 * (1.0 + (1 - event.smokeParticles[0].alpha) * 1.5);
      }
    }
  });

  return (
    <group>
      {/* 1. Physical Tumbling Shards */}
      {event.shards.map((s, i) => (
        <mesh
          key={i}
          geometry={shardGeo}
          material={shardMat}
          position={s.position.toArray()}
          rotation={s.rotation}
          scale={[s.scale, s.scale * 1.4, s.scale]}
          castShadow
        />
      ))}

      {/* 2. Ethereal Ghost/Smoke Soul Dispersion */}
      <points ref={pointsRef} geometry={smokeGeo} material={smokeMat} />
    </group>
  );
};
