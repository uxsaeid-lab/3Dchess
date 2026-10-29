import * as THREE from 'three';

// Procedural Curly Maple Wood Texture (Warm golden cream with fine grain lines)
export function createMapleTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Warm honey/cream maple base
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#f2dfc1');
  grad.addColorStop(0.3, '#eed8b6');
  grad.addColorStop(0.7, '#e4cc9e');
  grad.addColorStop(1, '#dfc495');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Grain lines & wood fibers
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Gentle wavy grain
      const wave = Math.sin(y * 0.08 + Math.cos(x * 0.02) * 4);
      const ring = Math.sin(y * 0.25 + wave * 2);
      const grainFactor = (ring + 1) * 0.5 * 0.08;

      data[idx] = Math.min(255, data[idx] * (1 - grainFactor));
      data[idx + 1] = Math.min(255, data[idx + 1] * (1 - grainFactor * 1.1));
      data[idx + 2] = Math.min(255, data[idx + 2] * (1 - grainFactor * 1.3));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Fine wood pores
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = 'rgba(180, 140, 100, 0.25)';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, y + 25 + Math.random() * 30);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural French Walnut Wood Texture (Deep rich warm brown with dark grain streaks)
export function createWalnutTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Rich walnut base
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#3e2417');
  grad.addColorStop(0.4, '#4a2b1c');
  grad.addColorStop(0.7, '#351b11');
  grad.addColorStop(1, '#2c150c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Pronounced dark grain striations
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const wave = Math.sin(x * 0.04 + Math.sin(y * 0.015) * 6);
      const streak = Math.pow(Math.abs(Math.sin(x * 0.15 + wave * 3)), 6);
      const factor = streak * 0.35;

      // Darken pores
      data[idx] = Math.max(0, data[idx] * (1 - factor));
      data[idx + 1] = Math.max(0, data[idx + 1] * (1 - factor * 1.15));
      data[idx + 2] = Math.max(0, data[idx + 2] * (1 - factor * 1.3));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Subtle warm amber highlight lines
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(160, 95, 55, 0.2)';
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    let sx = Math.random() * width;
    let sy = 0;
    ctx.moveTo(sx, sy);
    while (sy < height) {
      sx += (Math.random() - 0.5) * 10;
      sy += 20 + Math.random() * 30;
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

// Procedural Heavy Mahogany Library Table Texture
export function createTableWoodTexture(width = 1024, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep warm mahogany base
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#2b170e');
  grad.addColorStop(0.3, '#351c11');
  grad.addColorStop(0.7, '#24120a');
  grad.addColorStop(1, '#1a0c06');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Broad grain arches
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(15, 8, 4, 0.6)';
  for (let i = 0; i < 25; i++) {
    ctx.beginPath();
    const sx = (i / 25) * width * 1.2 - width * 0.1;
    ctx.moveTo(sx, 0);
    ctx.bezierCurveTo(
      sx + 100,
      height * 0.3,
      sx - 80,
      height * 0.7,
      sx + 40,
      height
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

// Procedural Antique Ivory Texture (Subtle warm translucent grain)
export function createIvoryTexture(width = 256, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#fdfaf2');
  grad.addColorStop(0.5, '#f7f0e3');
  grad.addColorStop(1, '#eee2ce');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Micro banding
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(215, 195, 170, 0.18)';
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Carved Ebony Texture (Dark wood with faint grain)
export function createEbonyTexture(width = 256, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#221c1a');
  grad.addColorStop(0.5, '#191412');
  grad.addColorStop(1, '#0e0b0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Vertical dark grain
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(5, 4, 3, 0.5)';
  for (let x = 0; x < width; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}
