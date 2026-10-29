import React from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import type { BoardTheme } from '../../types/theme';
import { CathedralEnvironment } from './CathedralEnvironment';

interface SceneLightingProps {
  theme: BoardTheme;
}

export const SceneLighting: React.FC<SceneLightingProps> = ({ theme }) => {
  const isCathedral = theme.isCathedral ?? false;

  return (
    <>
      {/* Studio Environment Map for Specular Reflections */}
      <Environment preset={theme.envPreset} />

      {isCathedral ? (
        /* Wizard's Gothic Sanctuary Cathedral Lighting & Architecture */
        <CathedralEnvironment />
      ) : (
        /* Standard Studio Lighting */
        <>
          <ambientLight intensity={theme.ambientIntensity} />

          {/* Primary Studio Key Light */}
          <directionalLight
            position={[6, 12, 6]}
            intensity={theme.keyLightIntensity}
            color={theme.keyLightColor}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={1}
            shadow-camera-far={30}
            shadow-camera-left={-6.5}
            shadow-camera-right={6.5}
            shadow-camera-top={6.5}
            shadow-camera-bottom={-6.5}
            shadow-bias={-0.0002}
          />

          {/* Rim / Silhouette Light */}
          <directionalLight
            position={[-7, 8, -7]}
            intensity={theme.rimLightIntensity}
            color={theme.rimLightColor}
          />

          {/* Warm Fill Light */}
          <pointLight position={[0, 9, 0]} intensity={0.5} distance={20} color="#ffffff" />
        </>
      )}

      {/* Soft Ground Contact Shadows */}
      <ContactShadows
        position={[0, -0.33, 0]}
        opacity={0.7}
        scale={16}
        blur={1.8}
        far={5}
        resolution={512}
        color="#000000"
      />

      {/* Studio Dark Pedestal / Floor Table */}
      {!isCathedral && (
        <mesh position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color={theme.tableColor}
            roughness={0.8}
            metalness={0.15}
          />
        </mesh>
      )}
    </>
  );
};
