import * as THREE from 'three';

// Procedural Carrara Sanctuary Marble (Warm grey smoky veins over pearl alabaster)
export function createMarbleTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Base Alabaster Cream/Ivory Gradient
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  baseGrad.addColorStop(0, '#f8fafc');
  baseGrad.addColorStop(0.3, '#f1f5f9');
  baseGrad.addColorStop(0.7, '#e2e8f0');
  baseGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Multi-octave Perlin-like Smoky Cloud Layer
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Simple pseudo-noise function
  const noise = (x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return n - Math.floor(n);
  };

  const smoothNoise = (x: number, y: number) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const s = fx * fx * (3 - 2 * fx);
    const t = fy * fy * (3 - 2 * fy);

    const n00 = noise(i, j);
    const n10 = noise(i + 1, j);
    const n01 = noise(i, j + 1);
    const n11 = noise(i + 1, j + 1);

    const nx0 = n00 * (1 - s) + n10 * s;
    const nx1 = n01 * (1 - s) + n11 * s;
    return nx0 * (1 - t) + nx1 * t;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const nx = x / 64;
      const ny = y / 64;
      const turbulence =
        smoothNoise(nx, ny) * 0.5 +
        smoothNoise(nx * 2, ny * 2) * 0.25 +
        smoothNoise(nx * 4, ny * 4) * 0.125;

      const marblePattern = Math.sin((x / 40 + y / 50 + turbulence * 4) * Math.PI);
      const veinIntensity = Math.pow(Math.abs(marblePattern), 8);

      // Blend smoky veins
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const veinR = 140;
      const veinG = 148;
      const veinB = 160;

      const factor = (1 - veinIntensity) * 0.35 + (turbulence * 0.15);
      data[idx] = Math.min(255, Math.max(0, r * (1 - factor) + veinR * factor));
      data[idx + 1] = Math.min(255, Math.max(0, g * (1 - factor) + veinG * factor));
      data[idx + 2] = Math.min(255, Math.max(0, b * (1 - factor) + veinB * factor));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Crisp Delicate Veins drawn with bezier splines
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(110, 120, 138, 0.4)';
  ctx.filter = 'blur(1px)';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let sx = (i / 6) * width;
    let sy = 0;
    ctx.moveTo(sx, sy);
    while (sy < height) {
      const cx = sx + (Math.random() - 0.45) * 60;
      const cy = sy + 30 + Math.random() * 40;
      sx = cx;
      sy = cy;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }
  ctx.filter = 'none';

  // 4. Hairline micro-veins
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = 'rgba(90, 100, 120, 0.25)';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    let sx = Math.random() * width;
    let sy = Math.random() * height;
    ctx.moveTo(sx, sy);
    for (let j = 0; j < 4; j++) {
      sx += (Math.random() - 0.5) * 50;
      sy += (Math.random() - 0.2) * 40;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Volcanic Obsidian (Deep vitrified black with subtle iridescent fissures)
export function createObsidianTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Obsidian Vitreous Base
  const baseGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    10,
    width / 2,
    height / 2,
    width
  );
  baseGrad.addColorStop(0, '#11151f');
  baseGrad.addColorStop(0.5, '#0b0d14');
  baseGrad.addColorStop(1, '#05070a');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Micro crystalline fractures & metallic specks
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Slight grain & specular noise
      const grain = (Math.random() - 0.5) * 12;
      const swirl = Math.sin(x * 0.05 + Math.cos(y * 0.05) * 2);

      let r = data[idx] + grain + swirl * 2;
      let g = data[idx + 1] + grain + swirl * 3;
      let b = data[idx + 2] + grain + swirl * 5;

      // Occasional crystalline micro-glint
      if (Math.random() < 0.003) {
        r += 50;
        g += 65;
        b += 90;
      }

      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Subtle volcanic fissures (smoky charcoal / faint cold blue glow)
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    let sx = Math.random() * width;
    let sy = 0;
    ctx.moveTo(sx, sy);
    while (sy < height) {
      sx += (Math.random() - 0.5) * 40;
      sy += 20 + Math.random() * 35;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Gold/amber hairline micro-accent
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    let sx = Math.random() * width;
    let sy = Math.random() * height;
    ctx.moveTo(sx, sy);
    for (let j = 0; j < 3; j++) {
      sx += (Math.random() - 0.5) * 35;
      sy += (Math.random() - 0.5) * 35;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Cathedral Flagstone / Basalt
export function createStonePlinthTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0f141d';
  ctx.fillRect(0, 0, width, height);

  // Flagstone grid with chisel borders
  const tileSize = 64;
  ctx.strokeStyle = 'rgba(5, 8, 12, 0.9)';
  ctx.lineWidth = 2.5;

  for (let x = 0; x < width; x += tileSize) {
    for (let y = 0; y < height; y += tileSize) {
      const shade = Math.floor(18 + Math.random() * 12);
      ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}
