import * as THREE from 'three';

// Procedural Panoramic Warm Vintage Library Study Texture
export function createLibraryBackdropTexture(width = 2048, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep warm mahogany/dark chocolate room atmosphere
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0c0704');
  bgGrad.addColorStop(0.4, '#1b100a');
  bgGrad.addColorStop(0.7, '#150c07');
  bgGrad.addColorStop(1, '#080402');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Warm ambient lamp light glow on the left/center
  const lampGlow = ctx.createRadialGradient(
    width * 0.32,
    height * 0.45,
    20,
    width * 0.32,
    height * 0.45,
    width * 0.45
  );
  lampGlow.addColorStop(0, 'rgba(255, 170, 85, 0.35)');
  lampGlow.addColorStop(0.3, 'rgba(217, 119, 6, 0.18)');
  lampGlow.addColorStop(0.7, 'rgba(120, 53, 15, 0.08)');
  lampGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = lampGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Floor-to-ceiling Vintage Bookshelves (Left & Center)
  const drawBookshelf = (startX: number, endX: number, bottomY: number, topY: number) => {
    // Shelf uprights
    ctx.fillStyle = '#140c07';
    ctx.fillRect(startX, topY, endX - startX, bottomY - topY);

    const shelfCount = 6;
    const shelfHeight = (bottomY - topY) / shelfCount;

    for (let s = 0; s < shelfCount; s++) {
      const sy = topY + s * shelfHeight;
      // Shelf plank
      ctx.fillStyle = '#0a0503';
      ctx.fillRect(startX, sy + shelfHeight - 12, endX - startX, 12);

      // Book spines
      let bx = startX + 15;
      while (bx < endX - 25) {
        const bw = 14 + ((bx * 7) % 18);
        const bh = shelfHeight - 18 - ((bx * 13) % 22);
        const colors = [
          '#451a03', '#78350f', '#7f1d1d', '#1e293b',
          '#14532d', '#3e1f13', '#581c87', '#312e81', '#701a75'
        ];
        const color = colors[(Math.floor(bx) + s * 5) % colors.length];

        ctx.fillStyle = color;
        ctx.fillRect(bx, sy + shelfHeight - 12 - bh, bw, bh);

        // Gold foil spine banding
        if (bw > 18) {
          ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
          ctx.fillRect(bx + 2, sy + shelfHeight - 12 - bh + 10, bw - 4, 3);
          ctx.fillRect(bx + 2, sy + shelfHeight - 12 - 20, bw - 4, 3);
        }

        bx += bw + 3;
      }
    }
  };

  // Draw bookshelves across left and center background
  drawBookshelf(width * 0.05, width * 0.38, height * 0.85, height * 0.15);
  drawBookshelf(width * 0.42, width * 0.65, height * 0.85, height * 0.18);

  // 4. Antique Oil Painting in Gilded Gold Frame (Between shelves)
  const frameX = width * 0.37;
  const frameY = height * 0.22;
  const frameW = width * 0.14;
  const frameH = height * 0.32;

  // Gold ornate frame
  ctx.fillStyle = '#b45309';
  ctx.fillRect(frameX, frameY, frameW, frameH);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(frameX + 8, frameY + 8, frameW - 16, frameH - 16);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(frameX + 12, frameY + 12, frameW - 24, frameH - 24);

  // Dark classical portrait canvas
  const portraitGrad = ctx.createRadialGradient(
    frameX + frameW / 2,
    frameY + frameH * 0.4,
    10,
    frameX + frameW / 2,
    frameY + frameH / 2,
    frameW * 0.6
  );
  portraitGrad.addColorStop(0, '#5a3d28');
  portraitGrad.addColorStop(0.4, '#2d1a0e');
  portraitGrad.addColorStop(1, '#0e0603');
  ctx.fillStyle = portraitGrad;
  ctx.fillRect(frameX + 16, frameY + 16, frameW - 32, frameH - 32);

  // 5. Victorian Arched Window (Right side) - MUTED, NOT BLINDING!
  const winX = width * 0.72;
  const winY = height * 0.16;
  const winW = width * 0.22;
  const winH = height * 0.68;

  // Window frame arch
  ctx.fillStyle = '#100a06';
  ctx.beginPath();
  ctx.rect(winX, winY + 60, winW, winH - 60);
  ctx.arc(winX + winW / 2, winY + 60, winW / 2, Math.PI, 0, false);
  ctx.fill();

  // Muted cool evening sky (soft slate-blue, gentle and atmospheric, never overexposed)
  const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  skyGrad.addColorStop(0, '#2c3e55');
  skyGrad.addColorStop(0.5, '#405874');
  skyGrad.addColorStop(1, '#627d98');

  ctx.save();
  ctx.beginPath();
  ctx.rect(winX + 12, winY + 60, winW - 24, winH - 72);
  ctx.arc(winX + winW / 2, winY + 60, winW / 2 - 12, Math.PI, 0, false);
  ctx.clip();
  ctx.fillStyle = skyGrad;
  ctx.fill();

  // Subtle tree branch silhouettes outside window
  ctx.strokeStyle = '#1b2533';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(winX + winW, winY + winH * 0.4);
  ctx.lineTo(winX + winW * 0.5, winY + winH * 0.35);
  ctx.lineTo(winX + winW * 0.2, winY + winH * 0.2);
  ctx.stroke();

  // Window mullions (wooden grid bars)
  ctx.strokeStyle = '#0a0503';
  ctx.lineWidth = 10;
  // Vertical mullion
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.stroke();
  // Horizontal mullions
  for (let my = winY + 100; my < winY + winH - 20; my += 75) {
    ctx.beginPath();
    ctx.moveTo(winX + 12, my);
    ctx.lineTo(winX + winW - 12, my);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Brass Armillary Globe & Antique Furniture Silhouettes (Center-Right)
  const globeX = width * 0.52;
  const globeY = height * 0.65;
  // Turned wooden stand
  ctx.fillStyle = '#170c06';
  ctx.fillRect(globeX - 12, globeY, 24, height * 0.2);
  ctx.beginPath();
  ctx.arc(globeX, globeY + 15, 35, 0, Math.PI * 2);
  ctx.fill();

  // Brass glowing armillary rings
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(globeX, globeY - 40, 55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(globeX, globeY - 40, 55, 24, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  // 7. Warm Bokeh Lights & Atmospheric Defocus Discs (Matching Reference Image)
  const bokehList = [
    { x: width * 0.25, y: height * 0.45, r: 42, color: 'rgba(255, 170, 85, 0.25)' },
    { x: width * 0.31, y: height * 0.42, r: 65, color: 'rgba(251, 191, 36, 0.20)' },
    { x: width * 0.58, y: height * 0.48, r: 38, color: 'rgba(245, 158, 11, 0.18)' },
    { x: width * 0.62, y: height * 0.52, r: 52, color: 'rgba(217, 119, 6, 0.15)' },
    { x: width * 0.18, y: height * 0.58, r: 35, color: 'rgba(253, 230, 138, 0.16)' },
    { x: width * 0.82, y: height * 0.42, r: 48, color: 'rgba(147, 197, 253, 0.12)' },
  ];

  bokehList.forEach((b) => {
    const bGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    bGrad.addColorStop(0, b.color);
    bGrad.addColorStop(0.7, b.color.replace(/[\d.]+\)$/, '0.05)'));
    bGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 8. Soft cinematic vignette on borders
  const vigGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.35,
    width / 2,
    height / 2,
    width * 0.7
  );
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(1, 'rgba(6, 3, 2, 0.85)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
