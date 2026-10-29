import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PieceType, PieceColor } from '../../types/chess';
import type { BoardTheme } from '../../types/theme';
import { createMarbleTexture, createObsidianTexture } from '../../utils/proceduralTextures';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  position: [number, number, number];
  isSelected: boolean;
  isLegalTarget: boolean;
  theme: BoardTheme;
  onClick: (e: { stopPropagation: () => void }) => void;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  position,
  isSelected,
  isLegalTarget,
  theme,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetY = isSelected ? position[1] + 0.35 : position[1];

  // Smooth floating animation for selected piece
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        delta * 12
      );

      // Subtle breathing float when selected
      if (isSelected) {
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 6) * 0.003;
      }
    }
  });

  const isLight = color === 'w';

  // Procedural marble & obsidian maps for pieces
  const marbleTexture = useMemo(() => createMarbleTexture(256, 256), []);
  const obsidianTexture = useMemo(() => createObsidianTexture(256, 256), []);

  // Base materials for pieces with high clearcoat (0.92) & crisp reflections
  const mainMaterial = useMemo(() => {
    const pieceColor = isLight ? theme.lightPiece : theme.darkPiece;
    const metalness = isLight ? theme.lightPieceMetalness : theme.darkPieceMetalness;
    const roughness = isLight ? theme.lightPieceRoughness : theme.darkPieceRoughness;
    const clearcoat = isLight ? theme.lightPieceClearcoat : theme.darkPieceClearcoat;
    const isWizardsTheme = theme.id === 'wizards_sanctuary';

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(pieceColor),
      map: isWizardsTheme ? (isLight ? marbleTexture : obsidianTexture) : undefined,
      metalness,
      roughness,
      clearcoat,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });
  }, [
    isLight,
    theme.id,
    theme.lightPiece,
    theme.darkPiece,
    theme.lightPieceMetalness,
    theme.darkPieceMetalness,
    theme.lightPieceRoughness,
    theme.darkPieceRoughness,
    theme.lightPieceClearcoat,
    theme.darkPieceClearcoat,
    marbleTexture,
    obsidianTexture,
  ]);

  // Accent material (for crowns, rings, cross, etc.)
  const accentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.boardTrim),
      metalness: 0.85,
      roughness: 0.18,
    });
  }, [theme.boardTrim]);

  // Target highlight material (glows if it's an enemy piece that can be captured)
  const targetHighlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.captureMoveColor),
      emissive: new THREE.Color(theme.captureMoveColor),
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.85,
    });
  }, [theme.captureMoveColor]);

  // Piece rotation: knights face forward toward enemy side
  const rotationY = color === 'w' ? 0 : Math.PI;

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
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
      {/* Target capture highlight halo ring */}
      {isLegalTarget && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.48, 32]} />
          <primitive object={targetHighlightMaterial} />
        </mesh>
      )}

      {/* Render procedural Staunton geometries based on piece type */}
      {type === 'p' && (
        <PawnGeometry material={mainMaterial} accentMaterial={accentMaterial} />
      )}
      {type === 'r' && (
        <RookGeometry material={mainMaterial} accentMaterial={accentMaterial} />
      )}
      {type === 'n' && (
        <KnightGeometry material={mainMaterial} accentMaterial={accentMaterial} />
      )}
      {type === 'b' && (
        <BishopGeometry material={mainMaterial} accentMaterial={accentMaterial} />
      )}
      {type === 'q' && (
        <QueenGeometry material={mainMaterial} accentMaterial={accentMaterial} />
      )}
      {type === 'k' && (
        <KingGeometry material={mainMaterial} accentMaterial={accentMaterial} />
      )}
    </group>
  );
};

// --- Staunton Geometries ---

const BasePedestal: React.FC<{
  material: THREE.Material;
  accentMaterial: THREE.Material;
  scale?: number;
}> = ({ material, accentMaterial, scale = 1 }) => (
  <group scale={[scale, 1, scale]}>
    {/* Base rim */}
    <mesh position={[0, 0.04, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.36, 0.4, 0.08, 32]} />
    </mesh>
    {/* Metallic trim ring */}
    <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} material={accentMaterial}>
      <torusGeometry args={[0.35, 0.02, 16, 32]} />
    </mesh>
    {/* Waist tier */}
    <mesh position={[0, 0.12, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.28, 0.35, 0.08, 32]} />
    </mesh>
    {/* Upper collar */}
    <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]} material={material}>
      <torusGeometry args={[0.26, 0.02, 16, 32]} />
    </mesh>
  </group>
);

const PawnGeometry: React.FC<{ material: THREE.Material; accentMaterial: THREE.Material }> = ({
  material,
  accentMaterial,
}) => (
  <group>
    <BasePedestal material={material} accentMaterial={accentMaterial} scale={0.85} />
    {/* Tapered stem */}
    <mesh position={[0, 0.38, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.14, 0.24, 0.38, 32]} />
    </mesh>
    {/* Collar disc */}
    <mesh position={[0, 0.58, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
    </mesh>
    {/* Head sphere */}
    <mesh position={[0, 0.74, 0]} castShadow receiveShadow material={material}>
      <sphereGeometry args={[0.17, 32, 24]} />
    </mesh>
  </group>
);

const RookGeometry: React.FC<{ material: THREE.Material; accentMaterial: THREE.Material }> = ({
  material,
  accentMaterial,
}) => (
  <group>
    <BasePedestal material={material} accentMaterial={accentMaterial} scale={0.95} />
    {/* Sturdy tower column */}
    <mesh position={[0, 0.48, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.24, 0.3, 0.56, 32]} />
    </mesh>
    {/* Turret overhang platform */}
    <mesh position={[0, 0.78, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.3, 0.24, 0.08, 32]} />
    </mesh>
    {/* Turret crown */}
    <mesh position={[0, 0.9, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
    </mesh>
    {/* Battlements / Crenellations */}
    {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
      <mesh
        key={i}
        position={[Math.cos(angle) * 0.22, 1.02, Math.sin(angle) * 0.22]}
        castShadow
        receiveShadow
        material={material}
      >
        <boxGeometry args={[0.1, 0.1, 0.1]} />
      </mesh>
    ))}
  </group>
);

const KnightGeometry: React.FC<{ material: THREE.Material; accentMaterial: THREE.Material }> = ({
  material,
  accentMaterial,
}) => (
  <group>
    <BasePedestal material={material} accentMaterial={accentMaterial} scale={0.92} />
    {/* Lower neck pedestal */}
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.24, 0.3, 0.24, 32]} />
    </mesh>
    {/* Arched Horse Neck */}
    <mesh
      position={[0, 0.58, -0.04]}
      rotation={[0.3, 0, 0]}
      castShadow
      receiveShadow
      material={material}
    >
      <boxGeometry args={[0.22, 0.44, 0.28]} />
    </mesh>
    {/* Horse Head / Muzzle */}
    <mesh
      position={[0, 0.76, -0.16]}
      rotation={[-0.2, 0, 0]}
      castShadow
      receiveShadow
      material={material}
    >
      <boxGeometry args={[0.2, 0.26, 0.36]} />
    </mesh>
    {/* Horse Nose Tip */}
    <mesh position={[0, 0.67, -0.32]} castShadow receiveShadow material={material}>
      <sphereGeometry args={[0.08, 16, 16]} />
    </mesh>
    {/* Left Ear */}
    <mesh
      position={[-0.08, 0.95, -0.05]}
      rotation={[-0.2, 0, -0.15]}
      castShadow
      receiveShadow
      material={material}
    >
      <coneGeometry args={[0.04, 0.14, 16]} />
    </mesh>
    {/* Right Ear */}
    <mesh
      position={[0.08, 0.95, -0.05]}
      rotation={[-0.2, 0, 0.15]}
      castShadow
      receiveShadow
      material={material}
    >
      <coneGeometry args={[0.04, 0.14, 16]} />
    </mesh>
    {/* Mane Ridge */}
    <mesh position={[0, 0.65, 0.11]} rotation={[-0.1, 0, 0]} castShadow material={accentMaterial}>
      <boxGeometry args={[0.06, 0.38, 0.08]} />
    </mesh>
  </group>
);

const BishopGeometry: React.FC<{ material: THREE.Material; accentMaterial: THREE.Material }> = ({
  material,
  accentMaterial,
}) => (
  <group>
    <BasePedestal material={material} accentMaterial={accentMaterial} scale={0.92} />
    {/* Slender column */}
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.16, 0.26, 0.62, 32]} />
    </mesh>
    {/* Collar */}
    <mesh position={[0, 0.83, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.24, 0.24, 0.05, 32]} />
    </mesh>
    {/* Mitre body (elongated sphere) */}
    <mesh
      position={[0, 1.05, 0]}
      scale={[0.85, 1.25, 0.85]}
      castShadow
      receiveShadow
      material={material}
    >
      <sphereGeometry args={[0.2, 32, 24]} />
    </mesh>
    {/* Mitre cut accent ring */}
    <mesh position={[0, 1.05, 0]} rotation={[0.4, 0, 0]} material={accentMaterial}>
      <torusGeometry args={[0.17, 0.015, 16, 32]} />
    </mesh>
    {/* Finial ball */}
    <mesh position={[0, 1.34, 0]} castShadow receiveShadow material={accentMaterial}>
      <sphereGeometry args={[0.055, 16, 16]} />
    </mesh>
  </group>
);

const QueenGeometry: React.FC<{ material: THREE.Material; accentMaterial: THREE.Material }> = ({
  material,
  accentMaterial,
}) => (
  <group>
    <BasePedestal material={material} accentMaterial={accentMaterial} scale={0.98} />
    {/* Graceful waist & column */}
    <mesh position={[0, 0.58, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.18, 0.3, 0.78, 32]} />
    </mesh>
    {/* Upper collar */}
    <mesh position={[0, 0.98, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.26, 0.26, 0.05, 32]} />
    </mesh>
    {/* Coronet flared bowl */}
    <mesh position={[0, 1.15, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.3, 0.2, 0.28, 32]} />
    </mesh>
    {/* 8 Pearl points around coronet */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * Math.PI * 2) / 8;
      return (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.28, 1.3, Math.sin(angle) * 0.28]}
          castShadow
          receiveShadow
          material={accentMaterial}
        >
          <sphereGeometry args={[0.04, 16, 16]} />
        </mesh>
      );
    })}
    {/* Center imperial pearl */}
    <mesh position={[0, 1.38, 0]} castShadow receiveShadow material={accentMaterial}>
      <sphereGeometry args={[0.075, 24, 24]} />
    </mesh>
  </group>
);

const KingGeometry: React.FC<{ material: THREE.Material; accentMaterial: THREE.Material }> = ({
  material,
  accentMaterial,
}) => (
  <group>
    <BasePedestal material={material} accentMaterial={accentMaterial} scale={1.02} />
    {/* Tall majestic column */}
    <mesh position={[0, 0.65, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.2, 0.32, 0.9, 32]} />
    </mesh>
    {/* Regal shoulder collar */}
    <mesh position={[0, 1.12, 0]} castShadow receiveShadow material={material}>
      <cylinderGeometry args={[0.3, 0.3, 0.06, 32]} />
    </mesh>
    {/* Domed Crown */}
    <mesh
      position={[0, 1.32, 0]}
      scale={[1, 0.85, 1]}
      castShadow
      receiveShadow
      material={material}
    >
      <sphereGeometry args={[0.26, 32, 24]} />
    </mesh>
    {/* Capital block */}
    <mesh position={[0, 1.5, 0]} castShadow receiveShadow material={accentMaterial}>
      <boxGeometry args={[0.16, 0.05, 0.16]} />
    </mesh>
    {/* Cross - Vertical bar */}
    <mesh position={[0, 1.64, 0]} castShadow receiveShadow material={accentMaterial}>
      <boxGeometry args={[0.055, 0.22, 0.04]} />
    </mesh>
    {/* Cross - Horizontal crossbar */}
    <mesh position={[0, 1.67, 0]} castShadow receiveShadow material={accentMaterial}>
      <boxGeometry args={[0.16, 0.055, 0.04]} />
    </mesh>
  </group>
);
