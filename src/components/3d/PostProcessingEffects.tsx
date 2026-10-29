import React, { useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const PostProcessingEffects: React.FC = () => {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    comp.addPass(new RenderPass(scene, camera));

    // Very gentle bloom strictly limited to specular glints (no fog/washout)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.15, // Low strength to prevent bloom fog
      0.35, // Radius
      0.92  // High threshold so only intense glints glow
    );
    comp.addPass(bloomPass);

    comp.addPass(new OutputPass());
    return comp;
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
};
