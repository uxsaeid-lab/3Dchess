import { useRef, useState, useImperativeHandle, forwardRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PieceColor } from '../../types/chess';
import type { BoardTheme } from '../../types/theme';

export interface ShatterEvent {
  id: string;
  position: [number, number, number];
  color: PieceColor;
  theme: BoardTheme;
}

export interface CombatShatterRef {
  triggerShatter: (position: [number, number, number], color: PieceColor, theme: BoardTheme) => void;
}

interface Shard {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  scale: number;
  initialScale: number;
}

interface ShatterCluster {
  id: string;
  color: PieceColor;
  theme: BoardTheme;
  startTime: number;
  duration: number;
  shards: Shard[];
}

export const CombatShatterEffect = forwardRef<CombatShatterRef>((_, ref) => {
  const [clusters, setClusters] = useState<ShatterCluster[]>([]);
  const clustersRef = useRef<ShatterCluster[]>([]);

  // Update clustersRef in an effect or inside callback
  useEffect(() => {
    clustersRef.current = clusters;
  }, [clusters]);

  // Imperative handle to trigger new shatter from anywhere
  useImperativeHandle(ref, () => ({
    triggerShatter: (pos: [number, number, number], color: PieceColor, theme: BoardTheme) => {
      const shardCount = 22;
      const shards: Shard[] = [];

      for (let i = 0; i < shardCount; i++) {
        // Explosion angle in sphere / cylinder
        const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 1.8 + Math.random() * 2.8;
        const upward = 2.4 + Math.random() * 2.6;

        shards.push({
          position: new THREE.Vector3(
            pos[0] + (Math.random() - 0.5) * 0.2,
            pos[1] + 0.3 + Math.random() * 0.4,
            pos[2] + (Math.random() - 0.5) * 0.2
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            upward,
            Math.sin(angle) * speed
          ),
          rotation: new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ),
          rotationSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 16
          ),
          scale: 0.12 + Math.random() * 0.12,
          initialScale: 0.12 + Math.random() * 0.12,
        });
      }

      const newCluster: ShatterCluster = {
        id: Math.random().toString(36).substring(2, 9),
        color,
        theme,
        startTime: performance.now() / 1000,
        duration: 1.4,
        shards,
      };

      setClusters((prev) => [...prev, newCluster]);
    },
  }));

  // Update physics frame-by-frame
  useFrame((_, delta) => {
    if (clustersRef.current.length === 0) return;

    const now = performance.now() / 1000;
    const gravity = -11.0;
    const floorY = 0.08;

    clustersRef.current.forEach((cluster) => {
      const elapsed = now - cluster.startTime;
      const progress = Math.min(1, elapsed / cluster.duration);

      if (progress < 1) {
        cluster.shards.forEach((shard) => {
          // Physics step
          shard.velocity.y += gravity * delta;
          shard.position.x += shard.velocity.x * delta;
          shard.position.y += shard.velocity.y * delta;
          shard.position.z += shard.velocity.z * delta;

          // Floor bounce
          if (shard.position.y <= floorY) {
            shard.position.y = floorY;
            shard.velocity.y = -shard.velocity.y * 0.42;
            shard.velocity.x *= 0.75;
            shard.velocity.z *= 0.75;
          }

          // Tumbling rotation
          shard.rotation.x += shard.rotationSpeed.x * delta;
          shard.rotation.y += shard.rotationSpeed.y * delta;
          shard.rotation.z += shard.rotationSpeed.z * delta;

          // Shrink scale as it fades
          const scaleFactor = Math.max(0, 1 - Math.pow(progress, 1.8));
          shard.scale = shard.initialScale * scaleFactor;
        });
      }
    });

    // Clean up finished clusters
    const remaining = clustersRef.current.filter(
      (c) => now - c.startTime < c.duration
    );
    if (remaining.length !== clustersRef.current.length) {
      setClusters(remaining);
    }
  });

  return (
    <group>
      {clusters.map((cluster) => (
        <ClusterShardsRenderer key={cluster.id} cluster={cluster} />
      ))}
    </group>
  );
});

CombatShatterEffect.displayName = 'CombatShatterEffect';

// Render individual cluster of shards with high clearcoat material
const ClusterShardsRenderer: React.FC<{ cluster: ShatterCluster }> = ({ cluster }) => {
  const isLight = cluster.color === 'w';

  // Faceted shard geometry (Tetrahedron with randomized irregular vertices)
  const shardGeometry = useMemo(() => {
    return new THREE.TetrahedronGeometry(1, 0);
  }, []);

  const material = useMemo(() => {
    const color = isLight ? cluster.theme.lightPiece : cluster.theme.darkPiece;
    const metalness = isLight ? cluster.theme.lightPieceMetalness : cluster.theme.darkPieceMetalness;
    const roughness = isLight ? cluster.theme.lightPieceRoughness : cluster.theme.darkPieceRoughness;

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      roughness: Math.max(0.1, roughness - 0.05),
      metalness: metalness,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
  }, [isLight, cluster.theme]);

  return (
    <group>
      {cluster.shards.map((shard, i) => (
        <mesh
          key={i}
          geometry={shardGeometry}
          material={material}
          position={shard.position.toArray()}
          rotation={shard.rotation}
          scale={[shard.scale, shard.scale * 1.5, shard.scale]}
          castShadow
        />
      ))}
    </group>
  );
};
