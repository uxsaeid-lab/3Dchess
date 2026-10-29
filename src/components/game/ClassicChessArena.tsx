import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Chess } from 'chess.js';
import './ClassicChessArena.css';

interface ClassicChessArenaProps {
  initialBotId?: string; // 'noob' | 'fischer' | 'kasparov' | 'carlsen' | 'magnus'
  onExitToLanding: () => void;
}

export const ClassicChessArena: React.FC<ClassicChessArenaProps> = ({
  initialBotId = 'noob',
  onExitToLanding,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const exitBtnRef = useRef<HTMLButtonElement>(null);

  // Normalize initial bot id ('magnus' -> 'carlsen')
  const initialBotKey = initialBotId === 'magnus' ? 'carlsen' : initialBotId;

  useEffect(() => {
    const rootContainer = containerRef.current;
    if (!rootContainer) return;

    let isDisposed = false;
    let animFrameId: number;

    // ============================================================================
    // 1. SVG MINIATURE ICONS FOR CAPTURED TRAYS
    // ============================================================================
    const PIECE_SVGS: Record<string, string> = {
      p: `<svg viewBox="0 0 24 24"><path d="M12 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm-3 8.5c-.5 2.5-2 4.5-2 6.5h10c0-2-1.5-4-2-6.5H9zm-3 8h12v1.5H6v-1.5z"/></svg>`,
      n: `<svg viewBox="0 0 24 24"><path d="M17 4c-3.5 0-6 2-7 4L7 9.5l1.5 2L11 10v2c-2.5 1.5-4 4-4 7h11c0-4-1.5-9-1-15zM6 20.5h12V22H6v-1.5z"/></svg>`,
      b: `<svg viewBox="0 0 24 24"><path d="M12 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 4c-3 1.5-4.5 4.5-4 8 .5 2 1.5 3.5 1.5 5h5c0-1.5 1-3 1.5-5 .5-3.5-1-6.5-4-8zm-6 14.5h12V22H6v-1.5z"/></svg>`,
      r: `<svg viewBox="0 0 24 24"><path d="M7 4h2v2h2V4h2v2h2V4h2v4.5l-1.5 1.5 1 9H7.5l1-9L7 8.5V4zm-1 16.5h12V22H6v-1.5z"/></svg>`,
      q: `<svg viewBox="0 0 24 24"><path d="M4 6l3.5 6L12 5l4.5 7L20 6l-2 13H6L4 6zm2 14.5h12V22H6v-1.5z"/></svg>`,
      k: `<svg viewBox="0 0 24 24"><path d="M11 2h2v2h2v2h-2v2h-2V6H9V4h2V2zm-5 8c2-1.5 4-2 6-2s4 .5 6 2l-1.5 9h-9L6 10zm0 10.5h12V22H6v-1.5z"/></svg>`,
    };

    function createCapturedIcon(type: string, isFilledStyle: boolean) {
      const span = document.createElement('span');
      span.innerHTML = PIECE_SVGS[type] || PIECE_SVGS.p;
      const svg = span.firstElementChild as SVGSVGElement | null;
      if (svg) {
        if (isFilledStyle) {
          svg.setAttribute('fill', '#e6cdb0');
          svg.setAttribute('stroke', '#332014');
          svg.setAttribute('stroke-width', '0.9');
        } else {
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', '#cbb59c');
          svg.setAttribute('stroke-width', '1.6');
        }
      }
      return span;
    }

    // ============================================================================
    // 2. PROCEDURAL WOOD & 360 WARM LIBRARY TEXTURES
    // ============================================================================
    function createWoodTexture({
      baseHex,
      grainHex,
      highlightHex,
      scaleY = 10,
      bump = false,
    }: {
      baseHex: string;
      grainHex: string;
      highlightHex: string;
      scaleY?: number;
      bump?: boolean;
    }) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 420; i++) {
        const y = Math.random() * 512;
        const h = 1 + Math.random() * scaleY;
        ctx.fillStyle = Math.random() > 0.35 ? grainHex : highlightHex;
        ctx.globalAlpha = bump ? 0.08 + Math.random() * 0.14 : 0.06 + Math.random() * 0.14;
        ctx.beginPath();
        ctx.moveTo(0, y);
        const wave = (Math.random() - 0.5) * 28;
        ctx.bezierCurveTo(170, y + wave, 340, y - wave, 512, y);
        ctx.lineTo(512, y + h);
        ctx.lineTo(0, y + h);
        ctx.closePath();
        ctx.fill();
      }

      for (let k = 0; k < 4; k++) {
        const kx = 80 + Math.random() * 350;
        const ky = 80 + Math.random() * 350;
        const kr = 25 + Math.random() * 45;
        const grad = ctx.createRadialGradient(kx, ky, 2, kx, ky, kr);
        grad.addColorStop(0, grainHex);
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(kx, ky, kr * 1.8, kr * 0.55, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = bump ? THREE.NoColorSpace : THREE.SRGBColorSpace;
      return tex;
    }

    function createWarmLibraryPanoramaTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      bgGrad.addColorStop(0.0, '#1c1008');
      bgGrad.addColorStop(0.22, '#2d1a0e');
      bgGrad.addColorStop(0.48, '#3d2314');
      bgGrad.addColorStop(0.58, '#4a2b18');
      bgGrad.addColorStop(0.75, '#2b180d');
      bgGrad.addColorStop(1.0, '#180d07');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      const bookColors = ['#5c1f16', '#263e2c', '#6e471b', '#233044', '#4d2b1a', '#7c5325', '#3e1e19'];
      for (let shelfY = 220; shelfY <= 580; shelfY += 68) {
        ctx.fillStyle = '#24130a';
        ctx.fillRect(0, shelfY + 52, 2048, 10);
        ctx.fillStyle = '#5e381e';
        ctx.fillRect(0, shelfY + 50, 2048, 2);

        let x = 0;
        while (x < 2048) {
          const bw = 12 + Math.random() * 22;
          const bh = 36 + Math.random() * 14;
          ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
          ctx.globalAlpha = 0.55 + Math.random() * 0.3;
          ctx.fillRect(x, shelfY + (50 - bh), bw - 2, bh);
          ctx.fillStyle = '#d4a15a';
          ctx.globalAlpha = 0.35;
          ctx.fillRect(x + 2, shelfY + (50 - bh) + 8, bw - 6, 3);
          x += bw;
        }
      }
      ctx.globalAlpha = 1.0;

      for (let px = 0; px < 2048; px += 256) {
        const pGrad = ctx.createLinearGradient(px, 0, px + 36, 0);
        pGrad.addColorStop(0, '#1f1109');
        pGrad.addColorStop(0.5, '#4c2c18');
        pGrad.addColorStop(1, '#1a0e07');
        ctx.fillStyle = pGrad;
        ctx.fillRect(px, 180, 36, 520);
      }

      [420, 1460].forEach((wx) => {
        const winGrad = ctx.createRadialGradient(wx, 380, 20, wx, 380, 260);
        winGrad.addColorStop(0, 'rgba(255, 232, 185, 0.85)');
        winGrad.addColorStop(0.35, 'rgba(235, 178, 105, 0.42)');
        winGrad.addColorStop(0.75, 'rgba(140, 85, 40, 0.12)');
        winGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = winGrad;
        ctx.beginPath();
        ctx.arc(wx, 380, 260, 0, Math.PI * 2);
        ctx.fill();
      });

      [
        { x: 220, y: 460, r: 170 },
        { x: 760, y: 470, r: 150 },
        { x: 1180, y: 450, r: 185 },
        { x: 1820, y: 465, r: 160 },
      ].forEach((l) => {
        const lGrad = ctx.createRadialGradient(l.x, l.y, 6, l.x, l.y, l.r);
        lGrad.addColorStop(0, 'rgba(255, 220, 145, 0.92)');
        lGrad.addColorStop(0.25, 'rgba(245, 155, 65, 0.50)');
        lGrad.addColorStop(0.65, 'rgba(160, 75, 20, 0.18)');
        lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    const lightWoodTex = createWoodTexture({
      baseHex: '#dfc195',
      grainHex: '#b88f5c',
      highlightHex: '#f1dec0',
      scaleY: 7,
    });
    const darkWoodTex = createWoodTexture({
      baseHex: '#3d2111',
      grainHex: '#1f0e06',
      highlightHex: '#59331d',
      scaleY: 9,
    });
    const frameWoodTex = createWoodTexture({
      baseHex: '#2c160b',
      grainHex: '#140904',
      highlightHex: '#4a2614',
      scaleY: 12,
    });
    const tableWoodTex = createWoodTexture({
      baseHex: '#3a1f10',
      grainHex: '#1a0c05',
      highlightHex: '#5e341c',
      scaleY: 14,
    });
    const woodBumpTex = createWoodTexture({
      baseHex: '#808080',
      grainHex: '#404040',
      highlightHex: '#c0c0c0',
      scaleY: 6,
      bump: true,
    });
    tableWoodTex.repeat.set(3, 3);

    // ============================================================================
    // 3. THREE.JS SCENE, CAMERA, RENDERER & WARM 360 ROOM
    // ============================================================================
    const canvasContainer = rootContainer.querySelector('#canvas-container') as HTMLDivElement;
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    canvasContainer.appendChild(renderer.domElement);

    const libraryPanoramaTex = createWarmLibraryPanoramaTexture();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRenderTarget = pmremGenerator.fromEquirectangular(libraryPanoramaTex);
    scene.environment = envRenderTarget.texture;
    scene.background = libraryPanoramaTex;
    scene.backgroundBlurriness = 0.065;
    scene.backgroundIntensity = 1.05;

    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 120);
    const CAMERA_PRESETS = [
      { pos: new THREE.Vector3(-4.2, 4.7, 8.7), target: new THREE.Vector3(0, 0.35, 0) },
      { pos: new THREE.Vector3(0.0, 5.6, 8.8), target: new THREE.Vector3(0, 0.25, 0) },
      { pos: new THREE.Vector3(0.0, 10.5, 2.2), target: new THREE.Vector3(0, 0.0, 0) },
    ];
    let currentCamPreset = 0;
    camera.position.copy(CAMERA_PRESETS[0].pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(CAMERA_PRESETS[0].target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 5.2;
    controls.maxDistance = 14.5;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.update();

    // ============================================================================
    // 4. LIGHTING
    // ============================================================================
    const ambientLight = new THREE.AmbientLight(0xffe4c4, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.SpotLight(0xffcb88, 68);
    keyLight.position.set(-6.5, 9.2, 5.2);
    keyLight.angle = Math.PI / 3.6;
    keyLight.penumbra = 0.75;
    keyLight.decay = 1.45;
    keyLight.distance = 32;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.bias = -0.00035;
    scene.add(keyLight);

    const windowLight = new THREE.DirectionalLight(0xffe0b2, 1.85);
    windowLight.position.set(7.5, 6.5, -4.5);
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.width = 1024;
    windowLight.shadow.mapSize.height = 1024;
    windowLight.shadow.bias = -0.0004;
    scene.add(windowLight);

    const rimLight = new THREE.SpotLight(0xdbeafe, 24);
    rimLight.position.set(4.5, 7.5, -7.8);
    rimLight.angle = Math.PI / 3;
    rimLight.penumbra = 0.9;
    rimLight.decay = 1.4;
    scene.add(rimLight);

    // ============================================================================
    // 5. 3D TABLE, VINTAGE BOOKS, BRASS LAMP & CHESSBOARD
    // ============================================================================
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    const tableMat = new THREE.MeshPhysicalMaterial({
      map: tableWoodTex,
      bumpMap: woodBumpTex,
      bumpScale: 0.012,
      roughness: 0.24,
      metalness: 0.04,
      clearcoat: 0.88,
      clearcoatRoughness: 0.18,
    });

    const tableTopGeo = new THREE.CylinderGeometry(10.5, 10.5, 0.45, 72);
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.y = -0.46;
    tableTop.receiveShadow = true;
    boardGroup.add(tableTop);

    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4a559,
      metalness: 0.85,
      roughness: 0.24,
    });
    const tableRimGeo = new THREE.TorusGeometry(10.51, 0.055, 16, 96);
    tableRimGeo.rotateX(Math.PI / 2);
    const tableRim = new THREE.Mesh(tableRimGeo, brassTrimMat);
    tableRim.position.y = -0.26;
    boardGroup.add(tableRim);

    function createVintageBook(
      w: number,
      h: number,
      d: number,
      coverHex: number,
      x: number,
      y: number,
      z: number,
      rotY: number
    ) {
      const bookGroup = new THREE.Group();
      const leatherMat = new THREE.MeshStandardMaterial({ color: coverHex, roughness: 0.55, metalness: 0.08 });
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xe6d2b5, roughness: 0.75 });

      const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), leatherMat);
      cover.castShadow = true;
      cover.receiveShadow = true;
      bookGroup.add(cover);

      const pages = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.82, d * 0.96), pagesMat);
      pages.position.x = 0.04;
      bookGroup.add(pages);

      for (let i = -1; i <= 1; i++) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.03, h * 1.02, 0.04), brassTrimMat);
        band.position.set(-w / 2, 0, i * (d * 0.25));
        bookGroup.add(band);
      }

      bookGroup.position.set(x, y, z);
      bookGroup.rotation.y = rotY;
      boardGroup.add(bookGroup);
    }

    createVintageBook(1.9, 0.34, 2.5, 0x3b1e12, -5.6, -0.06, -1.2, 0.22);
    createVintageBook(1.75, 0.3, 2.35, 0x4f2416, -5.55, 0.26, -1.15, 0.12);
    createVintageBook(1.6, 0.26, 2.15, 0x223324, -5.5, 0.54, -1.1, 0.3);

    const lampGroup = new THREE.Group();
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.18, 32), brassTrimMat);
    lampBase.position.y = -0.14;
    lampGroup.add(lampBase);
    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.5, 20), brassTrimMat);
    lampStem.position.y = 1.1;
    lampGroup.add(lampStem);
    const shadeMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4d2b,
      emissive: 0x2a4518,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.65, 32, 1, true), shadeMat);
    lampShade.position.set(0.25, 2.3, 0);
    lampShade.rotation.z = -0.22;
    lampGroup.add(lampShade);

    const bulbLight = new THREE.PointLight(0xffb75e, 8, 9);
    bulbLight.position.set(0.35, 2.05, 0);
    lampGroup.add(bulbLight);

    lampGroup.position.set(-6.4, 0, -3.5);
    boardGroup.add(lampGroup);

    const frameMat = new THREE.MeshPhysicalMaterial({
      map: frameWoodTex,
      bumpMap: woodBumpTex,
      bumpScale: 0.008,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.92,
      clearcoatRoughness: 0.14,
    });

    const outerFrameGeo = new THREE.BoxGeometry(9.1, 0.34, 9.1);
    const outerFrame = new THREE.Mesh(outerFrameGeo, frameMat);
    outerFrame.position.y = -0.16;
    outerFrame.receiveShadow = true;
    outerFrame.castShadow = true;
    boardGroup.add(outerFrame);

    const innerBorderGeo = new THREE.BoxGeometry(8.26, 0.37, 8.26);
    const innerBorder = new THREE.Mesh(innerBorderGeo, brassTrimMat);
    innerBorder.position.y = -0.155;
    boardGroup.add(innerBorder);

    const lightSquareMat = new THREE.MeshPhysicalMaterial({
      map: lightWoodTex,
      bumpMap: woodBumpTex,
      bumpScale: 0.005,
      roughness: 0.22,
      metalness: 0.02,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
    });

    const darkSquareMat = new THREE.MeshPhysicalMaterial({
      map: darkWoodTex,
      bumpMap: woodBumpTex,
      bumpScale: 0.006,
      roughness: 0.24,
      metalness: 0.04,
      clearcoat: 0.88,
      clearcoatRoughness: 0.16,
    });

    const squareMeshes = new Map<string, THREE.Mesh>();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const squareGeo = new THREE.BoxGeometry(1, 0.08, 1);

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const isLight = (r + f) % 2 === 0;
        const sqMesh = new THREE.Mesh(squareGeo, isLight ? lightSquareMat : darkSquareMat);
        const x = f - 3.5;
        const z = r - 3.5;
        sqMesh.position.set(x, 0.02, z);
        sqMesh.receiveShadow = true;

        const sqName = `${files[f]}${8 - r}`;
        sqMesh.userData = { square: sqName, isLight };
        boardGroup.add(sqMesh);
        squareMeshes.set(sqName, sqMesh);
      }
    }

    function createCoordLabel(char: string, x: number, z: number, rotZ = 0) {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = 'rgba(218, 178, 112, 0.78)';
      ctx.font = 'bold 34px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 32, 34);
      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), mat);
      plane.rotation.x = -Math.PI / 2;
      plane.rotation.z = rotZ;
      plane.position.set(x, 0.022, z);
      boardGroup.add(plane);
    }

    for (let i = 0; i < 8; i++) {
      createCoordLabel(files[i].toUpperCase(), i - 3.5, 4.3);
      createCoordLabel(String(8 - i), -4.3, i - 3.5);
    }

    // ============================================================================
    // 6. SCULPTED STAUNTON PIECES WITH ARTISAN CARVED KNIGHT GEOMETRY
    // ============================================================================
    const whitePieceMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4e4c8,
      roughness: 0.17,
      metalness: 0.03,
      clearcoat: 0.92,
      clearcoatRoughness: 0.12,
      reflectivity: 0.85,
    });

    const blackPieceMat = new THREE.MeshPhysicalMaterial({
      color: 0x1b1512,
      bumpMap: woodBumpTex,
      bumpScale: 0.003,
      roughness: 0.21,
      metalness: 0.08,
      clearcoat: 0.96,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
    });

    const feltMat = new THREE.MeshStandardMaterial({ color: 0x1d4d2f, roughness: 0.9 });

    function createLatheFromProfile(pointsArray: [number, number][], segments = 48) {
      const curvePoints: THREE.Vector2[] = [];
      for (let i = 0; i < pointsArray.length - 1; i++) {
        const p0 = pointsArray[Math.max(0, i - 1)];
        const p1 = pointsArray[i];
        const p2 = pointsArray[i + 1];
        const p3 = pointsArray[Math.min(pointsArray.length - 1, i + 2)];
        const steps = 6;
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const t2 = t * t;
          const t3 = t2 * t;
          const x =
            0.5 *
            (2 * p1[0] +
              (-p0[0] + p2[0]) * t +
              (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
              (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
          const y =
            0.5 *
            (2 * p1[1] +
              (-p0[1] + p2[1]) * t +
              (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
              (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
          curvePoints.push(new THREE.Vector2(Math.max(0.001, x), y));
        }
      }
      const last = pointsArray[pointsArray.length - 1];
      curvePoints.push(new THREE.Vector2(Math.max(0.001, last[0]), last[1]));
      const geo = new THREE.LatheGeometry(curvePoints, segments);
      geo.computeVertexNormals();
      return geo;
    }

    let cachedKnightCoreGeo: THREE.BufferGeometry | null = null;
    let cachedKnightManeGeo: THREE.BufferGeometry | null = null;
    let cachedKnightEarGeo: THREE.BufferGeometry | null = null;

    function getSculptedKnightGeometries() {
      if (cachedKnightCoreGeo && cachedKnightManeGeo && cachedKnightEarGeo) {
        return {
          coreGeo: cachedKnightCoreGeo,
          maneGeo: cachedKnightManeGeo,
          earGeo: cachedKnightEarGeo,
        };
      }

      const headShape = new THREE.Shape();
      headShape.moveTo(-0.22, 0.34);
      headShape.bezierCurveTo(-0.26, 0.56, -0.25, 0.85, -0.17, 1.12);
      headShape.bezierCurveTo(-0.12, 1.24, -0.02, 1.28, 0.06, 1.23);
      headShape.bezierCurveTo(0.15, 1.16, 0.27, 1.03, 0.34, 0.92);
      headShape.bezierCurveTo(0.37, 0.87, 0.35, 0.8, 0.29, 0.78);
      headShape.lineTo(0.2, 0.82);
      headShape.lineTo(0.27, 0.75);
      headShape.bezierCurveTo(0.24, 0.7, 0.12, 0.71, 0.04, 0.78);
      headShape.bezierCurveTo(0.08, 0.68, 0.23, 0.56, 0.21, 0.34);
      headShape.closePath();

      const extrudeSettings = {
        depth: 0.14,
        bevelEnabled: true,
        bevelSegments: 10,
        steps: 4,
        bevelSize: 0.085,
        bevelThickness: 0.095,
        curveSegments: 36,
      };

      const coreGeo = new THREE.ExtrudeGeometry(headShape, extrudeSettings);
      coreGeo.center();
      coreGeo.rotateY(-Math.PI / 2);

      const posAttr = coreGeo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        v.y += 0.8;
        let widthFactor = 1.0;
        if (v.z > 0.08) {
          const snoutT = Math.min(1, (v.z - 0.08) / 0.28);
          widthFactor *= 1.0 - 0.46 * snoutT;
        }
        if (v.y < 0.55) {
          const baseT = (0.55 - v.y) / 0.22;
          widthFactor *= 1.0 + 0.26 * baseT;
        }
        const cheekDist = Math.hypot(v.y - 0.96, v.z - 0.04);
        if (cheekDist < 0.18) {
          widthFactor *= 1.0 + 0.18 * (1 - cheekDist / 0.18);
        }
        v.x *= widthFactor;
        posAttr.setXYZ(i, v.x, v.y, v.z);
      }
      coreGeo.computeVertexNormals();
      cachedKnightCoreGeo = coreGeo;

      const maneShape = new THREE.Shape();
      maneShape.moveTo(-0.16, 0.35);
      maneShape.bezierCurveTo(-0.31, 0.46, -0.34, 0.62, -0.26, 0.72);
      maneShape.bezierCurveTo(-0.33, 0.8, -0.32, 0.94, -0.23, 1.02);
      maneShape.bezierCurveTo(-0.28, 1.1, -0.24, 1.21, -0.12, 1.24);
      maneShape.lineTo(-0.08, 1.12);
      maneShape.bezierCurveTo(-0.16, 0.88, -0.18, 0.6, -0.12, 0.35);
      maneShape.closePath();

      const maneGeo = new THREE.ExtrudeGeometry(maneShape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 2,
        bevelSize: 0.038,
        bevelThickness: 0.042,
        curveSegments: 28,
      });
      maneGeo.center();
      maneGeo.rotateY(-Math.PI / 2);
      const mPos = maneGeo.attributes.position;
      for (let i = 0; i < mPos.count; i++) {
        mPos.setY(i, mPos.getY(i) + 0.79);
        mPos.setZ(i, mPos.getZ(i) - 0.17);
      }
      maneGeo.computeVertexNormals();
      cachedKnightManeGeo = maneGeo;

      const earGeo = new THREE.ConeGeometry(0.042, 0.19, 18);
      earGeo.scale(0.72, 1.0, 1.25);
      cachedKnightEarGeo = earGeo;

      return { coreGeo, maneGeo, earGeo };
    }

    function createStauntonPieceMesh(type: string, color: 'w' | 'b') {
      const group = new THREE.Group();
      const mat = color === 'w' ? whitePieceMat : blackPieceMat;

      const felt = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 32), feltMat);
      felt.position.y = 0.015;
      group.add(felt);

      const brassRing = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.015, 12, 36), brassTrimMat);
      brassRing.rotation.x = Math.PI / 2;
      brassRing.position.y = 0.045;
      group.add(brassRing);

      if (type === 'p') {
        const profile: [number, number][] = [
          [0.01, 0.02],
          [0.35, 0.02],
          [0.36, 0.08],
          [0.31, 0.13],
          [0.33, 0.17],
          [0.24, 0.24],
          [0.16, 0.45],
          [0.13, 0.64],
          [0.22, 0.68],
          [0.22, 0.72],
          [0.12, 0.75],
          [0.01, 0.76],
        ];
        const body = new THREE.Mesh(createLatheFromProfile(profile), mat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 36, 36), mat);
        head.position.y = 0.91;
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);
      } else if (type === 'r') {
        const profile: [number, number][] = [
          [0.01, 0.02],
          [0.38, 0.02],
          [0.39, 0.09],
          [0.34, 0.15],
          [0.36, 0.2],
          [0.27, 0.28],
          [0.22, 0.55],
          [0.2, 0.85],
          [0.27, 0.92],
          [0.29, 0.98],
          [0.28, 1.12],
          [0.18, 1.12],
          [0.01, 1.05],
        ];
        const body = new THREE.Mesh(createLatheFromProfile(profile), mat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const merlonCount = 6;
        for (let i = 0; i < merlonCount; i++) {
          const angle = (i / merlonCount) * Math.PI * 2;
          const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.08), mat);
          merlon.position.set(Math.cos(angle) * 0.23, 1.17, Math.sin(angle) * 0.23);
          merlon.rotation.y = -angle;
          merlon.castShadow = true;
          group.add(merlon);
        }
      } else if (type === 'n') {
        const baseProfile: [number, number][] = [
          [0.01, 0.02],
          [0.38, 0.02],
          [0.39, 0.09],
          [0.34, 0.15],
          [0.36, 0.21],
          [0.29, 0.29],
          [0.25, 0.35],
          [0.27, 0.39],
          [0.01, 0.4],
        ];
        const base = new THREE.Mesh(createLatheFromProfile(baseProfile), mat);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const { coreGeo, maneGeo, earGeo } = getSculptedKnightGeometries();
        const horseGroup = new THREE.Group();

        const coreMesh = new THREE.Mesh(coreGeo, mat);
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        horseGroup.add(coreMesh);

        const maneMesh = new THREE.Mesh(maneGeo, mat);
        maneMesh.castShadow = true;
        maneMesh.receiveShadow = true;
        horseGroup.add(maneMesh);

        [-0.068, 0.068].forEach((xOffset) => {
          const ear = new THREE.Mesh(earGeo, mat);
          ear.position.set(xOffset, 1.29, -0.02);
          ear.rotation.x = 0.28;
          ear.rotation.z = xOffset > 0 ? -0.14 : 0.14;
          ear.castShadow = true;
          horseGroup.add(ear);
        });

        [-0.052, 0.052].forEach((xSide) => {
          const brow = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.009, 10, 20), mat);
          brow.position.set(xSide * 1.45, 1.07, 0.08);
          brow.rotation.y = xSide > 0 ? Math.PI / 2.3 : -Math.PI / 2.3;
          horseGroup.add(brow);

          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.021, 14, 14), brassTrimMat);
          eye.position.set(xSide * 1.48, 1.07, 0.08);
          horseGroup.add(eye);

          const nostril = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.008, 10, 18), mat);
          nostril.position.set(xSide * 0.95, 0.89, 0.27);
          nostril.rotation.y = xSide > 0 ? Math.PI / 3 : -Math.PI / 3;
          nostril.rotation.x = -0.35;
          horseGroup.add(nostril);
        });

        horseGroup.rotation.y = color === 'w' ? Math.PI : 0;
        group.add(horseGroup);
      } else if (type === 'b') {
        const profile: [number, number][] = [
          [0.01, 0.02],
          [0.38, 0.02],
          [0.39, 0.09],
          [0.34, 0.15],
          [0.36, 0.2],
          [0.26, 0.29],
          [0.18, 0.58],
          [0.15, 0.85],
          [0.24, 0.9],
          [0.24, 0.95],
          [0.16, 0.99],
          [0.22, 1.14],
          [0.19, 1.3],
          [0.08, 1.42],
          [0.01, 1.45],
        ];
        const body = new THREE.Mesh(createLatheFromProfile(profile), mat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 24), brassTrimMat);
        finial.position.y = 1.48;
        group.add(finial);
      } else if (type === 'q') {
        const profile: [number, number][] = [
          [0.01, 0.02],
          [0.41, 0.02],
          [0.42, 0.1],
          [0.36, 0.16],
          [0.38, 0.22],
          [0.28, 0.32],
          [0.2, 0.65],
          [0.17, 1.02],
          [0.28, 1.08],
          [0.29, 1.14],
          [0.19, 1.18],
          [0.24, 1.36],
          [0.28, 1.5],
          [0.18, 1.5],
          [0.14, 1.56],
          [0.01, 1.58],
        ];
        const body = new THREE.Mesh(createLatheFromProfile(profile), mat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const pearls = 8;
        for (let i = 0; i < pearls; i++) {
          const a = (i / pearls) * Math.PI * 2;
          const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), mat);
          pearl.position.set(Math.cos(a) * 0.24, 1.53, Math.sin(a) * 0.24);
          group.add(pearl);
        }
        const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 20), brassTrimMat);
        topBall.position.y = 1.62;
        group.add(topBall);
      } else if (type === 'k') {
        const profile: [number, number][] = [
          [0.01, 0.02],
          [0.43, 0.02],
          [0.44, 0.1],
          [0.38, 0.17],
          [0.4, 0.23],
          [0.3, 0.34],
          [0.22, 0.72],
          [0.18, 1.12],
          [0.3, 1.18],
          [0.31, 1.25],
          [0.2, 1.3],
          [0.26, 1.52],
          [0.28, 1.64],
          [0.16, 1.68],
          [0.01, 1.7],
        ];
        const body = new THREE.Mesh(createLatheFromProfile(profile), mat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.24, 0.065), brassTrimMat);
        crossV.position.y = 1.8;
        crossV.castShadow = true;
        group.add(crossV);

        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.065, 0.065), brassTrimMat);
        crossH.position.y = 1.83;
        crossH.castShadow = true;
        group.add(crossH);
      }

      return group;
    }

    // ============================================================================
    // 7. SELECTION RINGS & LEGAL MOVE INDICATORS
    // ============================================================================
    const indicatorsGroup = new THREE.Group();
    boardGroup.add(indicatorsGroup);

    const selectionRingGeo = new THREE.RingGeometry(0.36, 0.45, 40);
    selectionRingGeo.rotateX(-Math.PI / 2);
    const selectionRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const selectionRing = new THREE.Mesh(selectionRingGeo, selectionRingMat);
    selectionRing.visible = false;
    selectionRing.position.y = 0.066;
    boardGroup.add(selectionRing);

    const lastMoveFromRing = new THREE.Mesh(
      selectionRingGeo,
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    const lastMoveToRing = new THREE.Mesh(
      selectionRingGeo,
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    lastMoveFromRing.visible = false;
    lastMoveToRing.visible = false;
    lastMoveFromRing.position.y = 0.064;
    lastMoveToRing.position.y = 0.064;
    boardGroup.add(lastMoveFromRing, lastMoveToRing);

    function clearMoveIndicators() {
      while (indicatorsGroup.children.length > 0) {
        indicatorsGroup.remove(indicatorsGroup.children[0]);
      }
    }

    function showMoveIndicators(moves: { to: string; captured?: any }[]) {
      clearMoveIndicators();
      moves.forEach((m) => {
        const sq = squareMeshes.get(m.to);
        if (!sq) return;

        if (m.captured) {
          const capRing = new THREE.Mesh(
            new THREE.RingGeometry(0.37, 0.46, 36).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
          );
          capRing.position.set(sq.position.x, 0.068, sq.position.z);
          capRing.userData = { targetSquare: m.to };
          indicatorsGroup.add(capRing);
        } else {
          const dot = new THREE.Mesh(
            new THREE.CircleGeometry(0.14, 28).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8 })
          );
          dot.position.set(sq.position.x, 0.068, sq.position.z);
          dot.userData = { targetSquare: m.to };
          indicatorsGroup.add(dot);
        }
      });
    }

    // ============================================================================
    // 8. CAPTURE VFX (VORONOI SHATTER + ETHEREAL SOUL SMOKE)
    // ============================================================================
    interface ActiveVFX {
      group: THREE.Group;
      shards: {
        mesh: THREE.Mesh;
        vx: number;
        vy: number;
        vz: number;
        rx: number;
        ry: number;
      }[];
      smokeWispList: {
        sprite: THREE.Sprite;
        vy: number;
        swirlPhase: number;
        swirlSpeed: number;
        growRate: number;
        initialOpacity: number;
      }[];
      age: number;
      duration: number;
    }

    const activeVFX: ActiveVFX[] = [];

    function createSmokeTexture() {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      if (!ctx) return new THREE.Texture();
      const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
      g.addColorStop(0, 'rgba(255, 248, 230, 0.75)');
      g.addColorStop(0.45, 'rgba(210, 195, 175, 0.35)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }
    const smokeSpriteTex = createSmokeTexture();

    function triggerCaptureVFX(worldPos: THREE.Vector3, pieceColor: 'w' | 'b') {
      const vfxGroup = new THREE.Group();
      vfxGroup.position.copy(worldPos);
      boardGroup.add(vfxGroup);

      const shards: ActiveVFX['shards'] = [];
      const shardMat = pieceColor === 'w' ? whitePieceMat : blackPieceMat;
      const shardGeo = new THREE.DodecahedronGeometry(0.065, 0);

      for (let i = 0; i < 24; i++) {
        const mesh = new THREE.Mesh(shardGeo, shardMat);
        mesh.scale.set(0.6 + Math.random(), 0.5 + Math.random(), 0.6 + Math.random());
        mesh.position.set((Math.random() - 0.5) * 0.25, 0.2 + Math.random() * 0.7, (Math.random() - 0.5) * 0.25);
        mesh.castShadow = true;
        vfxGroup.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.9 + Math.random() * 1.9;
        shards.push({
          mesh,
          vx: Math.cos(angle) * speed,
          vy: 1.5 + Math.random() * 2.2,
          vz: Math.sin(angle) * speed,
          rx: (Math.random() - 0.5) * 10,
          ry: (Math.random() - 0.5) * 10,
        });
      }

      const smokeWispList: ActiveVFX['smokeWispList'] = [];
      for (let s = 0; s < 18; s++) {
        const spMat = new THREE.SpriteMaterial({
          map: smokeSpriteTex,
          color: pieceColor === 'w' ? 0xfff3dc : 0x9ca3af,
          transparent: true,
          opacity: 0.65,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const sprite = new THREE.Sprite(spMat);
        const startScale = 0.28 + Math.random() * 0.25;
        sprite.scale.set(startScale, startScale, 1);
        sprite.position.set((Math.random() - 0.5) * 0.22, 0.25 + Math.random() * 0.55, (Math.random() - 0.5) * 0.22);
        vfxGroup.add(sprite);

        smokeWispList.push({
          sprite,
          vy: 0.85 + Math.random() * 0.95,
          swirlPhase: Math.random() * Math.PI * 2,
          swirlSpeed: 2 + Math.random() * 2.5,
          growRate: 0.55 + Math.random() * 0.45,
          initialOpacity: 0.65,
        });
      }

      activeVFX.push({ group: vfxGroup, shards, smokeWispList, age: 0, duration: 1.75 });
    }

    // ============================================================================
    // 9. CHESS ENGINE STATE, MOVE ANIMATIONS & BOT AI
    // ============================================================================
    const chess = new Chess();
    const pieceMeshes = new Map<string, THREE.Group>();
    interface MovingAnim {
      mesh: THREE.Group;
      startPos: THREE.Vector3;
      endPos: THREE.Vector3;
      arcHeight: number;
      elapsed: number;
      duration: number;
    }
    const movingAnimations: MovingAnim[] = [];
    let selectedSquare: string | null = null;
    let isBotThinking = false;
    let currentBotLevel = initialBotKey in { noob: 1, fischer: 1, kasparov: 1, carlsen: 1 } ? initialBotKey : 'noob';

    const BOT_CONFIGS: Record<
      string,
      { label: string; subname: string; depth: number; randomness: number }
    > = {
      noob: { label: 'حریف: نوب اسب (قدرت ۲۰)', subname: 'Noob Horse (20)', depth: 1, randomness: 0.65 },
      fischer: { label: 'حریف: بابی فیشر (قدرت ۵۰)', subname: 'Bobby Fischer (50)', depth: 2, randomness: 0.25 },
      kasparov: { label: 'حریف: گری کاسپاروف (قدرت ۷۵)', subname: 'Garry Kasparov (75)', depth: 3, randomness: 0.08 },
      carlsen: { label: 'حریف: مگنوس کارلسن (قدرت ۱۰۰)', subname: 'Magnus Carlsen (100)', depth: 3, randomness: 0.0 },
    };

    const OPENING_MOVES = [
      ['e4', 'e5'],
      ['Nf3', 'Nc6'],
      ['Bb5', 'a6'],
      ['Ba4', 'Nf6'],
      ['O-O', 'Be7'],
    ];

    function squareToCoords(sq: string) {
      const f = files.indexOf(sq[0]);
      const r = 8 - parseInt(sq[1], 10);
      return new THREE.Vector3(f - 3.5, 0.06, r - 3.5);
    }

    function syncBoardMeshesFromEngine() {
      pieceMeshes.forEach((mesh) => boardGroup.remove(mesh));
      pieceMeshes.clear();

      const board = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const cell = board[r][f];
          if (cell) {
            const mesh = createStauntonPieceMesh(cell.type, cell.color);
            const pos = squareToCoords(cell.square);
            mesh.position.copy(pos);
            mesh.userData = { square: cell.square, type: cell.type, color: cell.color };
            boardGroup.add(mesh);
            pieceMeshes.set(cell.square, mesh);
          }
        }
      }
      updateHUD();
    }

    function animatePieceMovement(mesh: THREE.Group, fromSq: string, toSq: string, isKnight = false) {
      const startPos = squareToCoords(fromSq);
      const endPos = squareToCoords(toSq);
      movingAnimations.push({
        mesh,
        startPos,
        endPos,
        arcHeight: isKnight ? 0.95 : 0.28,
        elapsed: 0,
        duration: 0.36,
      });
    }

    function executeMove(moveObj: any) {
      const result = chess.move(moveObj);
      if (!result) return false;

      if (result.captured) {
        let capSq = result.to;
        if (result.flags.includes('e')) {
          capSq = result.to[0] + result.from[1];
        }
        const capturedMesh = pieceMeshes.get(capSq);
        if (capturedMesh) {
          triggerCaptureVFX(capturedMesh.position.clone(), capturedMesh.userData.color);
          boardGroup.remove(capturedMesh);
          pieceMeshes.delete(capSq);
        }
      }

      const movingMesh = pieceMeshes.get(result.from);
      if (movingMesh) {
        pieceMeshes.delete(result.from);

        if (result.promotion) {
          boardGroup.remove(movingMesh);
          const promotedMesh = createStauntonPieceMesh(result.promotion, result.color);
          promotedMesh.position.copy(squareToCoords(result.from));
          promotedMesh.userData = { square: result.to, type: result.promotion, color: result.color };
          boardGroup.add(promotedMesh);
          pieceMeshes.set(result.to, promotedMesh);
          animatePieceMovement(promotedMesh, result.from, result.to, false);
        } else {
          movingMesh.userData.square = result.to;
          pieceMeshes.set(result.to, movingMesh);
          animatePieceMovement(movingMesh, result.from, result.to, result.piece === 'n');
        }
      }

      if (result.flags.includes('k') || result.flags.includes('q')) {
        const rank = result.color === 'w' ? '1' : '8';
        const rookFrom = result.flags.includes('k') ? `h${rank}` : `a${rank}`;
        const rookTo = result.flags.includes('k') ? `f${rank}` : `d${rank}`;
        const rookMesh = pieceMeshes.get(rookFrom);
        if (rookMesh) {
          pieceMeshes.delete(rookFrom);
          rookMesh.userData.square = rookTo;
          pieceMeshes.set(rookTo, rookMesh);
          animatePieceMovement(rookMesh, rookFrom, rookTo, false);
        }
      }

      const fromPos = squareToCoords(result.from);
      const toPos = squareToCoords(result.to);
      lastMoveFromRing.position.set(fromPos.x, 0.064, fromPos.z);
      lastMoveToRing.position.set(toPos.x, 0.064, toPos.z);
      lastMoveFromRing.visible = true;
      lastMoveToRing.visible = true;

      selectedSquare = null;
      selectionRing.visible = false;
      clearMoveIndicators();
      updateHUD();

      if (!chess.isGameOver() && chess.turn() === 'b') {
        isBotThinking = true;
        setTimeout(makeBotMove, 520);
      }

      return true;
    }

    const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

    function evaluateBoard(game: Chess) {
      if (game.isCheckmate()) return game.turn() === 'w' ? -99999 : 99999;
      if (game.isDraw()) return 0;
      let score = 0;
      const b = game.board();
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const p = b[r][f];
          if (p) {
            const centerBonus = (3.5 - Math.abs(3.5 - f)) * 4 + (3.5 - Math.abs(3.5 - r)) * 4;
            const val = PIECE_VALUES[p.type] + centerBonus;
            score += p.color === 'w' ? val : -val;
          }
        }
      }
      return score;
    }

    function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
      if (depth === 0 || game.isGameOver()) return evaluateBoard(game);
      const moves = game.moves({ verbose: true });

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const m of moves) {
          game.move(m);
          const ev = minimax(game, depth - 1, alpha, beta, false);
          game.undo();
          maxEval = Math.max(maxEval, ev);
          alpha = Math.max(alpha, ev);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const m of moves) {
          game.move(m);
          const ev = minimax(game, depth - 1, alpha, beta, true);
          game.undo();
          minEval = Math.min(minEval, ev);
          beta = Math.min(beta, ev);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    }

    function makeBotMove() {
      if (isDisposed || chess.isGameOver() || chess.turn() !== 'b') {
        isBotThinking = false;
        return;
      }

      const cfg = BOT_CONFIGS[currentBotLevel] || BOT_CONFIGS.noob;
      const legalMoves = chess.moves({ verbose: true });
      if (legalMoves.length === 0) {
        isBotThinking = false;
        return;
      }

      let chosenMove = legalMoves[0];
      if (Math.random() < cfg.randomness) {
        chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      } else {
        let bestVal = Infinity;
        for (const m of legalMoves) {
          chess.move(m);
          const val = minimax(chess, cfg.depth - 1, -Infinity, Infinity, true);
          chess.undo();
          if (val < bestVal) {
            bestVal = val;
            chosenMove = m;
          }
        }
      }

      executeMove(chosenMove);
      isBotThinking = false;
    }

    // ============================================================================
    // 10. HUD UPDATES
    // ============================================================================
    const moveListEl = rootContainer.querySelector('#move-list') as HTMLDivElement;
    const whiteTrayEl = rootContainer.querySelector('#white-captured-tray') as HTMLDivElement;
    const blackTrayEl = rootContainer.querySelector('#black-captured-tray') as HTMLDivElement;
    const whiteTurnDot = rootContainer.querySelector('#white-turn-dot') as HTMLSpanElement;
    const blackTurnDot = rootContainer.querySelector('#black-turn-dot') as HTMLSpanElement;
    const whiteCard = rootContainer.querySelector('#white-card') as HTMLDivElement;
    const blackCard = rootContainer.querySelector('#black-card') as HTMLDivElement;
    const statusBanner = rootContainer.querySelector('#status-banner') as HTMLDivElement;
    const statusBannerText = rootContainer.querySelector('#status-banner-text') as HTMLSpanElement;

    function updateHUD() {
      if (isDisposed) return;
      const history = chess.history({ verbose: true });

      if (moveListEl) {
        moveListEl.innerHTML = '';
        for (let i = 0; i < history.length; i += 2) {
          const moveNum = Math.floor(i / 2) + 1;
          const wMove = history[i]?.san || '';
          const bMove = history[i + 1]?.san || '';
          const isLatestRow = i + 2 >= history.length;

          const row = document.createElement('div');
          row.className = `grid grid-cols-[28px_1fr_1fr] items-center px-2.5 py-1 rounded-lg transition ${
            isLatestRow ? 'bg-amber-100/15 text-white font-semibold' : 'text-amber-100/65 hover:bg-white/5'
          }`;
          row.innerHTML = `
            <span class="text-amber-100/40">${moveNum}.</span>
            <span>${wMove}</span>
            <span>${bMove}</span>
          `;
          moveListEl.appendChild(row);
        }
        moveListEl.scrollTop = moveListEl.scrollHeight;
      }

      const capturedByWhite: string[] = [];
      const capturedByBlack: string[] = [];
      history.forEach((m) => {
        if (m.captured) {
          if (m.color === 'w') capturedByWhite.push(m.captured);
          else capturedByBlack.push(m.captured);
        }
      });

      const order: Record<string, number> = { p: 1, n: 2, b: 3, r: 4, q: 5 };
      capturedByWhite.sort((a, b) => order[a] - order[b]);
      capturedByBlack.sort((a, b) => order[a] - order[b]);

      if (whiteTrayEl) {
        whiteTrayEl.innerHTML = '';
        const displayWhiteTray =
          capturedByWhite.length > 0 ? capturedByWhite : ['p', 'p', 'p', 'n', 'b', 'r', 'q'];
        displayWhiteTray.forEach((t) => {
          const icon = createCapturedIcon(t, true);
          if (capturedByWhite.length === 0) icon.style.opacity = '0.78';
          whiteTrayEl.appendChild(icon);
        });
      }

      if (blackTrayEl) {
        blackTrayEl.innerHTML = '';
        const displayBlackTray =
          capturedByBlack.length > 0 ? capturedByBlack : ['p', 'p', 'n', 'b', 'b', 'r', 'k'];
        displayBlackTray.forEach((t) => {
          const icon = createCapturedIcon(t, false);
          if (capturedByBlack.length === 0) icon.style.opacity = '0.78';
          blackTrayEl.appendChild(icon);
        });
      }

      const isWhiteTurn = chess.turn() === 'w';
      if (whiteTurnDot) whiteTurnDot.style.opacity = isWhiteTurn ? '1' : '0.15';
      if (blackTurnDot) blackTurnDot.style.opacity = isWhiteTurn ? '0.15' : '1';
      if (whiteCard) whiteCard.style.opacity = isWhiteTurn ? '1' : '0.8';
      if (blackCard) blackCard.style.opacity = isWhiteTurn ? '0.8' : '1';

      if (chess.isCheckmate()) {
        showBanner(isWhiteTurn ? 'شاهمات! حریف برنده شد' : 'شاهمات! شما پیروز شدید');
      } else if (chess.isDraw()) {
        showBanner('بازی مساوی شد!');
      } else if (chess.inCheck()) {
        showBanner('کیش! (Check)');
      } else if (statusBanner) {
        statusBanner.style.opacity = '0';
      }
    }

    function showBanner(msg: string) {
      if (!statusBanner || !statusBannerText) return;
      statusBannerText.textContent = msg;
      statusBanner.style.opacity = '1';
      statusBanner.style.transform = 'translate(-50%, 0)';
    }

    let whiteSeconds = 8 * 60 + 45;
    let blackSeconds = 9 * 60 + 12;
    const whiteClockEl = rootContainer.querySelector('#white-clock') as HTMLSpanElement;
    const blackClockEl = rootContainer.querySelector('#black-clock') as HTMLSpanElement;

    function formatTime(sec: number) {
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      return `${m}:${s}`;
    }

    const timerInterval = setInterval(() => {
      if (isDisposed || chess.isGameOver()) return;
      if (chess.turn() === 'w' && whiteSeconds > 0) {
        whiteSeconds--;
        if (whiteClockEl) whiteClockEl.textContent = formatTime(whiteSeconds);
      } else if (chess.turn() === 'b' && blackSeconds > 0) {
        blackSeconds--;
        if (blackClockEl) blackClockEl.textContent = formatTime(blackSeconds);
      }
    }, 1000);

    // ============================================================================
    // 11. RAYCASTING & INTERACTION
    // ============================================================================
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return;
      if (e.target !== renderer.domElement) return;
      if (isBotThinking || chess.isGameOver() || chess.turn() !== 'w') return;

      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(boardGroup.children, true);
      let clickedSq: string | null = null;

      for (const hit of intersects) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj && obj !== boardGroup) {
          if (obj.userData?.targetSquare) {
            clickedSq = obj.userData.targetSquare;
            break;
          }
          if (obj.userData?.square) {
            clickedSq = obj.userData.square;
            break;
          }
          obj = obj.parent;
        }
        if (clickedSq) break;
      }

      if (!clickedSq) {
        selectedSquare = null;
        selectionRing.visible = false;
        clearMoveIndicators();
        return;
      }

      if (selectedSquare) {
        const legalMoves = chess.moves({ square: selectedSquare as any, verbose: true });
        const matchingMove = legalMoves.find((m) => m.to === clickedSq);
        if (matchingMove) {
          executeMove({ from: selectedSquare, to: clickedSq, promotion: 'q' });
          return;
        }
      }

      const pieceOnSq = chess.get(clickedSq as any);
      if (pieceOnSq && pieceOnSq.color === 'w') {
        selectedSquare = clickedSq;
        const pos = squareToCoords(clickedSq);
        selectionRing.position.set(pos.x, 0.066, pos.z);
        selectionRing.visible = true;
        const legalMoves = chess.moves({ square: clickedSq as any, verbose: true });
        showMoveIndicators(legalMoves);
      } else {
        selectedSquare = null;
        selectionRing.visible = false;
        clearMoveIndicators();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // ============================================================================
    // 12. UI BUTTONS
    // ============================================================================
    const undoBtn = rootContainer.querySelector('#undo-btn');
    const resignBtn = rootContainer.querySelector('#resign-btn');
    const resetBoardBtn = rootContainer.querySelector('#reset-board-btn');
    const botBtn = rootContainer.querySelector('#bot-selector-btn');
    const botDropdown = rootContainer.querySelector('#bot-dropdown') as HTMLDivElement;
    const cameraViewBtn = rootContainer.querySelector('#camera-view-btn');
    const botOptionBtns = rootContainer.querySelectorAll('.bot-option');
    const currentBotLabel = rootContainer.querySelector('#current-bot-label');
    const opponentSubname = rootContainer.querySelector('#opponent-subname');

    // Set initial bot selection display
    const initCfg = BOT_CONFIGS[currentBotLevel] || BOT_CONFIGS.noob;
    if (currentBotLabel) currentBotLabel.textContent = initCfg.label;
    if (opponentSubname) opponentSubname.textContent = initCfg.subname;

    const handleUndo = () => {
      if (isBotThinking || chess.history().length === 0) return;
      chess.undo();
      if (chess.turn() === 'b' && chess.history().length > 0) {
        chess.undo();
      }
      selectedSquare = null;
      selectionRing.visible = false;
      lastMoveFromRing.visible = false;
      lastMoveToRing.visible = false;
      clearMoveIndicators();
      syncBoardMeshesFromEngine();
    };

    const handleResign = () => {
      if (chess.isGameOver()) return;
      showBanner('شما تسلیم شدید. بازی جدید در حال چیده شدن...');
      setTimeout(() => {
        chess.reset();
        lastMoveFromRing.visible = false;
        lastMoveToRing.visible = false;
        syncBoardMeshesFromEngine();
      }, 1500);
    };

    const handleResetBoard = () => {
      chess.reset();
      lastMoveFromRing.visible = false;
      lastMoveToRing.visible = false;
      selectedSquare = null;
      selectionRing.visible = false;
      clearMoveIndicators();
      syncBoardMeshesFromEngine();
    };

    const handleToggleBotDropdown = () => {
      if (botDropdown) botDropdown.classList.toggle('hidden');
    };

    undoBtn?.addEventListener('click', handleUndo);
    resignBtn?.addEventListener('click', handleResign);
    resetBoardBtn?.addEventListener('click', handleResetBoard);
    botBtn?.addEventListener('click', handleToggleBotDropdown);

    botOptionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const botKey = (btn as HTMLElement).dataset.bot || 'noob';
        currentBotLevel = botKey;
        const cfg = BOT_CONFIGS[currentBotLevel] || BOT_CONFIGS.noob;
        if (currentBotLabel) currentBotLabel.textContent = cfg.label;
        if (opponentSubname) opponentSubname.textContent = cfg.subname;
        if (botDropdown) botDropdown.classList.add('hidden');
      });
    });

    const handleCameraView = () => {
      currentCamPreset = (currentCamPreset + 1) % CAMERA_PRESETS.length;
      const preset = CAMERA_PRESETS[currentCamPreset];
      camera.position.copy(preset.pos);
      controls.target.copy(preset.target);
      controls.update();
    };
    cameraViewBtn?.addEventListener('click', handleCameraView);

    function initClassicPosition() {
      chess.reset();
      syncBoardMeshesFromEngine();
      lastMoveFromRing.visible = false;
      lastMoveToRing.visible = false;
      selectedSquare = null;
      selectionRing.visible = false;
      clearMoveIndicators();
    }
    initClassicPosition();
    initClassicPosition();

    // ============================================================================
    // 13. MAIN RENDER LOOP
    // ============================================================================
    const clock = new THREE.Clock();

    function animate() {
      if (isDisposed) return;
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      for (let i = movingAnimations.length - 1; i >= 0; i--) {
        const anim = movingAnimations[i];
        anim.elapsed += dt;
        const t = Math.min(anim.elapsed / anim.duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);

        anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, ease);
        anim.mesh.position.y = anim.startPos.y + Math.sin(t * Math.PI) * anim.arcHeight;

        if (t >= 1) {
          anim.mesh.position.copy(anim.endPos);
          movingAnimations.splice(i, 1);
        }
      }

      for (let i = activeVFX.length - 1; i >= 0; i--) {
        const vfx = activeVFX[i];
        vfx.age += dt;
        const progress = vfx.age / vfx.duration;

        vfx.shards.forEach((s) => {
          s.vy -= 9.5 * dt;
          s.mesh.position.x += s.vx * dt;
          s.mesh.position.y += s.vy * dt;
          s.mesh.position.z += s.vz * dt;
          if (s.mesh.position.y < 0.03) {
            s.mesh.position.y = 0.03;
            s.vy *= -0.35;
            s.vx *= 0.65;
            s.vz *= 0.65;
          }
          s.mesh.rotation.x += s.rx * dt;
          s.mesh.rotation.y += s.ry * dt;
          s.mesh.scale.multiplyScalar(0.982);
        });

        vfx.smokeWispList.forEach((w) => {
          w.sprite.position.y += w.vy * dt;
          w.sprite.position.x += Math.sin(vfx.age * w.swirlSpeed + w.swirlPhase) * 0.25 * dt;
          w.sprite.position.z += Math.cos(vfx.age * w.swirlSpeed + w.swirlPhase) * 0.25 * dt;
          const sc = w.sprite.scale.x + w.growRate * dt;
          w.sprite.scale.set(sc, sc, 1);
          const mat = w.sprite.material as THREE.SpriteMaterial;
          mat.opacity = Math.max(0, w.initialOpacity * (1 - progress));
        });

        if (progress >= 1) {
          boardGroup.remove(vfx.group);
          activeVFX.splice(i, 1);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      clearInterval(timerInterval);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      undoBtn?.removeEventListener('click', handleUndo);
      resignBtn?.removeEventListener('click', handleResign);
      resetBoardBtn?.removeEventListener('click', handleResetBoard);
      botBtn?.removeEventListener('click', handleToggleBotDropdown);
      cameraViewBtn?.removeEventListener('click', handleCameraView);

      controls.dispose();
      renderer.dispose();
      pmremGenerator.dispose();
      if (canvasContainer && renderer.domElement) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  }, [initialBotKey]);

  return (
    <div ref={containerRef} className="classic-game-root">
      {/* 3D WebGL Canvas */}
      <div id="canvas-container"></div>
      <div className="vignette-overlay"></div>

      {/* Top Left Header & Bot Selector & Exit Button */}
      <header dir="ltr" className="fixed top-6 left-7 z-20 flex items-center gap-4">
        {/* Button to Exit back to Landing */}
        <button
          ref={exitBtnRef}
          onClick={onExitToLanding}
          className="glass-btn px-4 py-2 rounded-full text-xs text-emerald-300 hover:text-white flex items-center gap-2 font-['Vazirmatn'] transition cursor-pointer"
          title="بازگشت به صفحه اصلی"
        >
          <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="font-semibold">خروج به صفحه اصلی</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="w-6 h-[1.5px] bg-amber-100/45 inline-block"></span>
          <h1 className="text-[19px] font-medium tracking-wide text-amber-50/95 select-none">Classic Chess</h1>
        </div>

        <div className="relative">
          <button
            id="bot-selector-btn"
            className="dark-glass-subtle px-3.5 py-1.5 rounded-full text-xs text-amber-100/85 hover:text-white flex items-center gap-2 transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span id="current-bot-label" className="font-['Vazirmatn']">
              حریف: نوب اسب (قدرت ۲۰)
            </span>
            <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {/* Dropdown */}
          <div
            id="bot-dropdown"
            dir="rtl"
            className="hidden absolute left-0 mt-2 w-60 dark-glass rounded-2xl p-2 z-30 font-['Vazirmatn']"
          >
            <div className="text-[11px] text-amber-200/50 px-3 py-1">انتخاب سطح حریف (شاهمات)</div>
            <button
              data-bot="noob"
              className="bot-option w-full text-right px-3 py-2 rounded-xl hover:bg-white/10 flex items-center justify-between text-xs transition cursor-pointer"
            >
              <span>نوب اسب (Noob Horse)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">قدرت ۲۰</span>
            </button>
            <button
              data-bot="fischer"
              className="bot-option w-full text-right px-3 py-2 rounded-xl hover:bg-white/10 flex items-center justify-between text-xs transition mt-0.5 cursor-pointer"
            >
              <span>بابی فیشر (Bobby Fischer)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">قدرت ۵۰</span>
            </button>
            <button
              data-bot="kasparov"
              className="bot-option w-full text-right px-3 py-2 rounded-xl hover:bg-white/10 flex items-center justify-between text-xs transition mt-0.5 cursor-pointer"
            >
              <span>گری کاسپاروف (Kasparov)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">قدرت ۷۵</span>
            </button>
            <button
              data-bot="carlsen"
              className="bot-option w-full text-right px-3 py-2 rounded-xl hover:bg-white/10 flex items-center justify-between text-xs transition mt-0.5 cursor-pointer"
            >
              <span>مگنوس کارلسن (Carlsen)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">قدرت ۱۰۰</span>
            </button>
          </div>
        </div>

        <button
          id="camera-view-btn"
          className="dark-glass-subtle px-3 py-1.5 rounded-full text-xs text-amber-100/75 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          title="تغییر زاویه دوربین"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Camera Angle</span>
        </button>
      </header>

      {/* Status Toast Banner */}
      <div
        id="status-banner"
        dir="rtl"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 transition-all duration-300 transform -translate-y-2"
      >
        <div className="dark-glass px-5 py-2 rounded-full text-xs font-['Vazirmatn'] text-amber-200 border border-amber-400/30 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span id="status-banner-text">کیش!</span>
        </div>
      </div>

      {/* Right Move Notation Sidebar */}
      <aside
        dir="ltr"
        className="fixed top-0 right-0 h-full w-[178px] dark-glass border-l border-amber-100/10 z-20 flex flex-col pt-6 pb-6 px-3.5"
      >
        <div className="flex items-center justify-between px-2 pb-4 border-b border-amber-100/10">
          <button
            id="reset-board-btn"
            title="شروع مجدد بازی"
            className="text-amber-100/70 hover:text-white transition p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h12" />
            </svg>
          </button>
          <span className="text-[10px] uppercase tracking-widest text-amber-100/45 font-semibold">Moves</span>
        </div>

        <div
          id="move-list"
          className="move-scroll flex-1 overflow-y-auto mt-3 space-y-0.5 pr-1 font-['JetBrains_Mono'] text-[12px]"
        ></div>
      </aside>

      {/* Bottom HUD Controls */}
      <footer dir="ltr" className="fixed bottom-6 left-7 right-[198px] z-20 flex items-end justify-between pointer-events-none">
        {/* Left Player Capsule (White / Player 1) */}
        <div className="flex flex-col items-start gap-2 pointer-events-auto">
          <div
            id="white-card"
            className="dark-glass rounded-full py-2 pl-2.5 pr-5 flex items-center gap-3.5 min-w-[265px] transition-all duration-300 ring-1 ring-amber-200/20"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-b from-blue-300 to-indigo-400 flex-shrink-0 border border-white/25 shadow-inner flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle cx="32" cy="32" r="32" fill="#9bb8ed" />
                <circle cx="32" cy="27" r="12" fill="#ffdbb5" />
                <path d="M18 22c2-8 12-11 20-9 5 1 8 5 7 10-4-3-10-4-16-3-5 1-8 3-11 2z" fill="#3b4990" />
                <circle cx="28" cy="27" r="1.6" fill="#1f243d" />
                <circle cx="36" cy="27" r="1.6" fill="#1f243d" />
                <path d="M29 32c2 1.8 4 1.8 6 0" stroke="#c97b63" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M16 58c2-10 10-15 16-15s14 5 16 15" fill="#3b4990" />
              </svg>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span id="white-turn-title" className="text-[13.5px] font-medium text-white tracking-tight">
                  Blue&apos;s Turn
                </span>
                <span id="white-turn-dot" className="w-2 h-2 rounded-full turn-dot-blue transition-opacity duration-300"></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-100/50 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-100/40"></span>
                <span>Player 1</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-amber-50/90 font-['JetBrains_Mono'] text-[13px] pl-2">
              <svg className="w-3.5 h-3.5 text-amber-100/45" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 2" />
              </svg>
              <span id="white-clock">08:45</span>
            </div>
          </div>

          {/* Captured Black Pieces Sub-Capsule */}
          <div
            className="dark-glass-subtle rounded-full px-3.5 py-1.5 min-h-[28px] min-w-[175px] flex items-center gap-1.5 captured-tray"
            id="white-captured-tray"
          ></div>
        </div>

        {/* Center Action Pill Buttons (Undo & Resign) */}
        <div className="flex items-center gap-3 pb-1 pointer-events-auto">
          <button
            id="undo-btn"
            className="glass-btn rounded-full px-6 py-2.5 flex items-center gap-2 text-[13px] font-medium text-amber-50/90 cursor-pointer"
          >
            <svg className="w-4 h-4 text-amber-100/75" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H13" />
            </svg>
            <span>Undo</span>
          </button>

          <button
            id="resign-btn"
            className="glass-btn rounded-full px-6 py-2.5 flex items-center gap-2 text-[13px] font-medium text-amber-50/90 cursor-pointer"
          >
            <svg className="w-4 h-4 text-amber-100/75" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3v18h2v-7h12l-2-4 2-4H7V3H5z" />
            </svg>
            <span>Resign</span>
          </button>
        </div>

        {/* Right Player Capsule (Black / Opponent) */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div
            id="black-card"
            className="dark-glass rounded-full py-2 pl-2.5 pr-5 flex items-center gap-3.5 min-w-[265px] transition-all duration-300 opacity-85"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-b from-rose-300 to-amber-300 flex-shrink-0 border border-white/25 shadow-inner flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle cx="32" cy="32" r="32" fill="#f3a6b8" />
                <circle cx="32" cy="28" r="12" fill="#ffdbb5" />
                <path d="M19 25c1-9 25-9 26 0-4-4-22-4-26 0z" fill="#7c3a58" />
                <path d="M18 22c2-7 26-7 28 0l-2 3c-7-4-17-4-24 0l-2-3z" fill="#b84a69" />
                <circle cx="28" cy="28" r="1.6" fill="#2d1f2d" />
                <circle cx="36" cy="28" r="1.6" fill="#2d1f2d" />
                <path d="M29 33c2 1.5 4 1.5 6 0" stroke="#b86b58" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M16 58c2-10 10-15 16-15s14 5 16 15" fill="#7c3a58" />
              </svg>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span id="black-turn-title" className="text-[13.5px] font-medium text-white tracking-tight">
                  Opponent
                </span>
                <span id="black-turn-dot" className="w-2 h-2 rounded-full turn-dot-amber opacity-0 transition-opacity duration-300"></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-100/50 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span id="opponent-subname">Player 2</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-amber-50/90 font-['JetBrains_Mono'] text-[13px] pl-2">
              <svg className="w-3.5 h-3.5 text-amber-100/45" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 2" />
              </svg>
              <span id="black-clock">09:12</span>
            </div>
          </div>

          {/* Captured White Pieces Sub-Capsule */}
          <div
            className="dark-glass-subtle rounded-full px-3.5 py-1.5 min-h-[28px] min-w-[175px] flex items-center justify-end gap-1.5 captured-tray"
            id="black-captured-tray"
          ></div>
        </div>
      </footer>
    </div>
  );
};
