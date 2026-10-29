import React from 'react';

export const LibraryEnvironment: React.FC = () => {
  return (
    <group>
      {/* --- 1. Warm Balanced Lighting --- */}
      {/* Warm Golden Ambient Light (1.8 intensity for crisp visibility of all pieces & squares) */}
      <ambientLight intensity={1.8} color="#ffe8d6" />

      {/* Key Spotlight: Shining directly down onto the center of the board with soft shadows */}
      <spotLight
        position={[-3.5, 9.0, 3.5]}
        target-position={[0, 0, 0]}
        intensity={2.8}
        color="#fff3e0"
        angle={0.75}
        penumbra={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-camera-near={1}
        shadow-camera-far={25}
      />

      {/* Soft warm fill light from opposite angle to ensure crisp side silhouettes without cold blue tint */}
      <directionalLight
        position={[4.5, 6.0, -3.5]}
        intensity={0.6}
        color="#ffeacc"
      />

      {/* Soft bounce fill directly above board */}
      <pointLight position={[0, 4.0, 0]} intensity={0.4} color="#ffd8a8" distance={12} />

      {/* --- 2. Polished Mahogany Table Surface Beneath Board --- */}
      {/* Large wooden table plane extending smoothly underneath the board */}
      <mesh position={[0, -0.155, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshPhysicalMaterial
          color="#2e170e"
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          reflectivity={0.85}
        />
      </mesh>

      {/* Soft ground contact shadow directly under the chessboard */}
      <mesh position={[0, -0.153, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.8, 9.8]} />
        <meshBasicMaterial color="#0a0503" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
