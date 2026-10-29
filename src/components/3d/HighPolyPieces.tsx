import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { PieceType, PieceColor } from '../../types/chess';
import { createIvoryTexture, createEbonyTexture } from '../../utils/woodTextures';

interface HighPolyPieceProps {
  type: PieceType;
  color: PieceColor;
  position: [number, number, number];
  isSelected: boolean;
  isLegalTarget: boolean;
  onClick: (e: { stopPropagation: () => void }) => void;
}

// Generate high-subdivision lathe geometries for Staunton tournament pieces
function generateLatheGeometries() {
  const segments = 56; // High subdivision for photorealistic smooth curves

  // Helper to create spline curve points
  const createSplinePoints = (rawPoints: [number, number][], subdivisions = 8): THREE.Vector2[] => {
    const vectors = rawPoints.map(([r, y]) => new THREE.Vector2(r, y));
    const curve = new THREE.SplineCurve(vectors);
    return curve.getPoints(rawPoints.length * subdivisions);
  };

  // 1. Pawn Lathe Profile
  const pawnPoints = createSplinePoints([
    [0.0, 0.0],
    [0.38, 0.0],
    [0.38, 0.04],
    [0.35, 0.08],
    [0.32, 0.12],
    [0.34, 0.15],
    [0.26, 0.20],
    [0.21, 0.28],
    [0.17, 0.40],
    [0.15, 0.52],
    [0.18, 0.58],
    [0.21, 0.62],
    [0.19, 0.65],
    [0.17, 0.68],
    [0.21, 0.74],
    [0.22, 0.81],
    [0.18, 0.88],
    [0.12, 0.92],
    [0.06, 0.95],
    [0.05, 0.98],
    [0.0, 0.99],
  ]);
  const pawnGeo = new THREE.LatheGeometry(pawnPoints, segments);

  // 2. Rook Body Lathe Profile (up to base of parapet)
  const rookPoints = createSplinePoints([
    [0.0, 0.0],
    [0.40, 0.0],
    [0.40, 0.05],
    [0.37, 0.09],
    [0.34, 0.13],
    [0.35, 0.16],
    [0.28, 0.22],
    [0.26, 0.32],
    [0.25, 0.50],
    [0.24, 0.68],
    [0.27, 0.76],
    [0.33, 0.82],
    [0.35, 0.86],
    [0.33, 0.88],
    [0.24, 0.88],
    [0.0, 0.88],
  ]);
  const rookBodyGeo = new THREE.LatheGeometry(rookPoints, segments);

  // 3. Knight Pedestal Lathe Profile
  const knightBasePoints = createSplinePoints([
    [0.0, 0.0],
    [0.40, 0.0],
    [0.40, 0.05],
    [0.37, 0.09],
    [0.34, 0.13],
    [0.35, 0.16],
    [0.29, 0.22],
    [0.28, 0.28],
    [0.30, 0.34],
    [0.27, 0.38],
    [0.0, 0.38],
  ]);
  const knightBaseGeo = new THREE.LatheGeometry(knightBasePoints, segments);

  // 4. Bishop Lathe Profile
  const bishopPoints = createSplinePoints([
    [0.0, 0.0],
    [0.39, 0.0],
    [0.39, 0.05],
    [0.36, 0.09],
    [0.33, 0.13],
    [0.34, 0.16],
    [0.28, 0.22],
    [0.23, 0.32],
    [0.18, 0.48],
    [0.17, 0.64],
    [0.20, 0.72],
    [0.26, 0.78],
    [0.25, 0.82],
    [0.21, 0.86],
    [0.23, 0.94],
    [0.24, 1.05],
    [0.21, 1.18],
    [0.14, 1.28],
    [0.06, 1.34],
    [0.07, 1.38],
    [0.04, 1.43],
    [0.0, 1.45],
  ]);
  const bishopGeo = new THREE.LatheGeometry(bishopPoints, segments);

  // 5. Queen Lathe Profile
  const queenPoints = createSplinePoints([
    [0.0, 0.0],
    [0.42, 0.0],
    [0.42, 0.05],
    [0.39, 0.09],
    [0.36, 0.13],
    [0.37, 0.16],
    [0.30, 0.22],
    [0.25, 0.34],
    [0.21, 0.52],
    [0.19, 0.72],
    [0.22, 0.84],
    [0.27, 0.92],
    [0.26, 0.96],
    [0.22, 1.00],
    [0.25, 1.08],
    [0.32, 1.18],
    [0.34, 1.25],
    [0.22, 1.25],
    [0.08, 1.28],
    [0.08, 1.36],
    [0.0, 1.38],
  ]);
  const queenGeo = new THREE.LatheGeometry(queenPoints, segments);

  // 6. King Lathe Profile (up to base of Maltese cross)
  const kingPoints = createSplinePoints([
    [0.0, 0.0],
    [0.44, 0.0],
    [0.44, 0.05],
    [0.41, 0.09],
    [0.38, 0.13],
    [0.39, 0.16],
    [0.32, 0.22],
    [0.27, 0.36],
    [0.23, 0.56],
    [0.21, 0.78],
    [0.25, 0.92],
    [0.31, 1.02],
    [0.30, 1.06],
    [0.26, 1.10],
    [0.28, 1.18],
    [0.34, 1.28],
    [0.33, 1.35],
    [0.28, 1.42],
    [0.20, 1.48],
    [0.16, 1.51],
    [0.16, 1.55],
    [0.0, 1.56],
  ]);
  const kingGeo = new THREE.LatheGeometry(kingPoints, segments);

  return {
    pawnGeo,
    rookBodyGeo,
    knightBaseGeo,
    bishopGeo,
    queenGeo,
    kingGeo,
  };
}

// Global cached geometries
let cachedGeometries: ReturnType<typeof generateLatheGeometries> | null = null;
function getGeometries() {
  if (!cachedGeometries) {
    cachedGeometries = generateLatheGeometries();
  }
  return cachedGeometries;
}

export const HighPolyPiece: React.FC<HighPolyPieceProps> = ({
  type,
  color,
  position,
  isSelected,
  isLegalTarget,
  onClick,
}) => {
  const isLight = color === 'w';
  const geometries = getGeometries();

  // Procedural antique ivory & dark carved ebony textures
  const ivoryTex = useMemo(() => createIvoryTexture(), []);
  const ebonyTex = useMemo(() => createEbonyTexture(), []);

  // Antique Polished Ivory (White) and Deep Carved Ebony (Black)
  // White: Elegant warm cream/ivory (#f5ede0), clearcoat 0.85
  // Black: Rich dark ebony (#1c1614), clearcoat 0.95 with subtle specular highlights
  const material = useMemo(() => {
    if (isLight) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f5ede0'),
        map: ivoryTex,
        roughness: 0.18,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        reflectivity: 0.92,
      });
    } else {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#1c1614'),
        map: ebonyTex,
        roughness: 0.22,
        metalness: 0.08,
        clearcoat: 0.95,
        clearcoatRoughness: 0.1,
        reflectivity: 0.95,
      });
    }
  }, [isLight, ivoryTex, ebonyTex]);

  // Subtle gold accent for crowns and Maltese cross
  const goldAccentMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(isLight ? '#d4af37' : '#99732b'),
      metalness: 0.85,
      roughness: 0.2,
    });
  }, [isLight]);

  // Target capture halo
  const targetMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ef4444'),
      emissive: new THREE.Color('#dc2626'),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
    });
  }, []);

  // White pieces face forward, Black pieces face White
  const rotationY = isLight ? 0 : Math.PI;
  const currentY = isSelected ? position[1] + 0.32 : position[1];

  return (
    <group
      position={[position[0], currentY, position[2]]}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* Target capture ring if capturable */}
      {isLegalTarget && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.48, 32]} />
          <primitive object={targetMat} />
        </mesh>
      )}

      {/* Render High-Subdivision Staunton Mesh based on piece type */}
      {type === 'p' && <mesh geometry={geometries.pawnGeo} material={material} castShadow receiveShadow />}

      {type === 'r' && <SculptedRook bodyGeo={geometries.rookBodyGeo} material={material} />}

      {type === 'n' && <SculptedKnight baseGeo={geometries.knightBaseGeo} material={material} isLight={isLight} />}

      {type === 'b' && <SculptedBishop geo={geometries.bishopGeo} material={material} goldMat={goldAccentMat} />}

      {type === 'q' && <SculptedQueen geo={geometries.queenGeo} material={material} goldMat={goldAccentMat} />}

      {type === 'k' && <SculptedKing geo={geometries.kingGeo} material={material} goldMat={goldAccentMat} />}
    </group>
  );
};

// --- Sculpted Rook with Real Castellated Battlements (Crenels) ---
const SculptedRook: React.FC<{ bodyGeo: THREE.BufferGeometry; material: THREE.Material }> = ({
  bodyGeo,
  material,
}) => {
  // 6 Castellated Parapet Merlons
  const crenels = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number }[] = [];
    const count = 6;
    const radius = 0.29;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      list.push({
        pos: [Math.cos(angle) * radius, 0.94, Math.sin(angle) * radius],
        rotY: -angle,
      });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Lathe Column & Cornice */}
      <mesh geometry={bodyGeo} material={material} castShadow receiveShadow />

      {/* Recessed Interior Turret Floor */}
      <mesh position={[0, 0.88, 0]} material={material} receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.02, 32]} />
      </mesh>

      {/* 6 Castellated Parapet Battlements with Crenels between them */}
      {crenels.map((c, i) => (
        <mesh
          key={i}
          position={c.pos}
          rotation={[0, c.rotY, 0]}
          material={material}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.13, 0.14, 0.09]} />
        </mesh>
      ))}
    </group>
  );
};

// --- Sculpted Knight with Carved Organic Horse Head, Snout & Mane ---
const SculptedKnight: React.FC<{
  baseGeo: THREE.BufferGeometry;
  material: THREE.Material;
  isLight: boolean;
}> = ({ baseGeo, material }) => {
  return (
    <group>
      {/* Lathed Base Pedestal */}
      <mesh geometry={baseGeo} material={material} castShadow receiveShadow />

      {/* Carved Organic Horse Neck & Chest */}
      <mesh position={[0, 0.58, -0.04]} rotation={[0.3, 0, 0]} material={material} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.26, 0.44, 24]} />
      </mesh>

      {/* Muscular Arched Jaw & Brow */}
      <mesh position={[0, 0.74, -0.14]} rotation={[-0.22, 0, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.28, 0.34]} />
      </mesh>

      {/* Carved Tapered Snout & Muzzle */}
      <mesh position={[0, 0.65, -0.32]} rotation={[-0.15, 0, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.18, 0.22]} />
      </mesh>

      {/* Muzzle Tip with Nostrils */}
      <mesh position={[0, 0.63, -0.42]} material={material} castShadow>
        <sphereGeometry args={[0.075, 16, 16]} />
      </mesh>

      {/* Alert Pointed Ears (Left & Right) */}
      <mesh position={[-0.075, 0.94, -0.06]} rotation={[-0.2, 0, -0.15]} material={material} castShadow>
        <coneGeometry args={[0.04, 0.16, 16]} />
      </mesh>
      <mesh position={[0.075, 0.94, -0.06]} rotation={[-0.2, 0, 0.15]} material={material} castShadow>
        <coneGeometry args={[0.04, 0.16, 16]} />
      </mesh>

      {/* Curved Mane Crest along Neck */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[0, 0.55 + i * 0.1, 0.08 - i * 0.02]}
          rotation={[-0.15 + i * 0.06, 0, 0]}
          material={material}
          castShadow
        >
          <boxGeometry args={[0.06, 0.12, 0.1]} />
        </mesh>
      ))}
    </group>
  );
};

// --- Sculpted Bishop with Real Miter Cut Slit ---
const SculptedBishop: React.FC<{
  geo: THREE.BufferGeometry;
  material: THREE.Material;
  goldMat: THREE.Material;
}> = ({ geo, material, goldMat }) => {
  return (
    <group>
      {/* Lathe Body and Miter Dome */}
      <mesh geometry={geo} material={material} castShadow receiveShadow />

      {/* Diagonal Miter Cut Slit (Angled deep inset notch) */}
      <mesh position={[0.12, 1.15, 0.08]} rotation={[0.42, 0.35, -0.5]} material={goldMat} castShadow>
        <boxGeometry args={[0.04, 0.24, 0.14]} />
      </mesh>

      {/* Spherical Apex Finial */}
      <mesh position={[0, 1.47, 0]} material={goldMat} castShadow>
        <sphereGeometry args={[0.06, 24, 24]} />
      </mesh>
    </group>
  );
};

// --- Sculpted Queen with Multi-Pointed Coronet & Sphere Pearls ---
const SculptedQueen: React.FC<{
  geo: THREE.BufferGeometry;
  material: THREE.Material;
  goldMat: THREE.Material;
}> = ({ geo, material, goldMat }) => {
  // 8 Coronet Pearls
  const pearls = useMemo(() => {
    const list: [number, number, number][] = [];
    const count = 8;
    const radius = 0.33;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      list.push([Math.cos(angle) * radius, 1.28, Math.sin(angle) * radius]);
    }
    return list;
  }, []);

  return (
    <group>
      {/* Lathe Body and Flared Coronet Bowl */}
      <mesh geometry={geo} material={material} castShadow receiveShadow />

      {/* 8 Spherical Pearls around Coronet Rim */}
      {pearls.map((pos, i) => (
        <mesh key={i} position={pos} material={goldMat} castShadow>
          <sphereGeometry args={[0.038, 16, 16]} />
        </mesh>
      ))}

      {/* Central Apex Jewel Topper */}
      <mesh position={[0, 1.41, 0]} material={goldMat} castShadow>
        <sphereGeometry args={[0.07, 24, 24]} />
      </mesh>
    </group>
  );
};

// --- Sculpted King with Symmetric 3D Maltese Cross Finial ---
const SculptedKing: React.FC<{
  geo: THREE.BufferGeometry;
  material: THREE.Material;
  goldMat: THREE.Material;
}> = ({ geo, material, goldMat }) => {
  return (
    <group>
      {/* Regal Lathe Body and Shoulder Cap */}
      <mesh geometry={geo} material={material} castShadow receiveShadow />

      {/* Maltese Cross Base Plinth */}
      <mesh position={[0, 1.57, 0]} material={goldMat} castShadow>
        <boxGeometry args={[0.12, 0.04, 0.12]} />
      </mesh>

      {/* Central Maltese Cross Hub */}
      <mesh position={[0, 1.68, 0]} material={goldMat} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
      </mesh>

      {/* Maltese Cross Vertical Arm (Tapered flare) */}
      <mesh position={[0, 1.68, 0]} material={goldMat} castShadow>
        <boxGeometry args={[0.05, 0.24, 0.04]} />
      </mesh>

      {/* Maltese Cross Horizontal Crossbar */}
      <mesh position={[0, 1.68, 0]} material={goldMat} castShadow>
        <boxGeometry args={[0.22, 0.05, 0.04]} />
      </mesh>

      {/* 4 Maltese Flared Triangular Arm Tips */}
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI]} material={goldMat} castShadow>
        <coneGeometry args={[0.065, 0.08, 4]} />
      </mesh>
      <mesh position={[0, 1.56, 0]} material={goldMat} castShadow>
        <coneGeometry args={[0.065, 0.08, 4]} />
      </mesh>
      <mesh position={[-0.12, 1.68, 0]} rotation={[0, 0, Math.PI / 2]} material={goldMat} castShadow>
        <coneGeometry args={[0.065, 0.08, 4]} />
      </mesh>
      <mesh position={[0.12, 1.68, 0]} rotation={[0, 0, -Math.PI / 2]} material={goldMat} castShadow>
        <coneGeometry args={[0.065, 0.08, 4]} />
      </mesh>
    </group>
  );
};
