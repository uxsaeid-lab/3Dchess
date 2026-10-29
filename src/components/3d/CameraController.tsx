import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CameraPreset } from '../../types/chess';

interface CameraControllerProps {
  preset: CameraPreset;
  autoRotate: boolean;
}

const PRESET_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  cinematic: [-5.6, 4.8, 7.6],
  white: [-2.0, 5.5, 7.8],
  black: [2.0, 5.5, -7.8],
  top: [0, 11.5, 0.01],
  isometric: [-6.2, 5.5, 6.2],
};

export const CameraController: React.FC<CameraControllerProps> = ({
  preset,
  autoRotate,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(...PRESET_POSITIONS[preset]));
  const isTransitioning = useRef<boolean>(false);

  // When preset changes, smoothly transition camera position
  useEffect(() => {
    const [x, y, z] = PRESET_POSITIONS[preset];
    targetPos.current.set(x, y, z);
    isTransitioning.current = true;
  }, [preset]);

  // Smooth lerp during transition
  useFrame((_, delta) => {
    if (isTransitioning.current && controlsRef.current) {
      camera.position.lerp(targetPos.current, Math.min(1, delta * 4));
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0.25, 0), Math.min(1, delta * 4));
      controlsRef.current.update();

      if (camera.position.distanceTo(targetPos.current) < 0.05) {
        camera.position.copy(targetPos.current);
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={4.5}
      maxDistance={18}
      maxPolarAngle={1.35} // Restricted to keep cinematic low-angle isometric perspective
      minPolarAngle={0.5}
      target={[0, 0.25, 0]}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
    />
  );
};
