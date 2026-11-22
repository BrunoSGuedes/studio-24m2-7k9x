/* ============================================================
   textures.js — Gerador Procedural de Texturas PBR e Artes
   ============================================================ */

window.AppTextures = (function () {
  const cache = {};

  function createCanvas(w = 512, h = 512) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // Deterministic pseudo-random for consistent textures
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeTextureFromCanvas(canvas, repeatX = 1, repeatY = 1, srgb = true) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    if (srgb) tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }

  /* ----------------------------------------------------------
     FLOOR CATALOG
     ---------------------------------------------------------- */
  const FLOOR_CATALOG = [
    // Porcelanatos
    { id: 'porc_offwhite', category: 'porcelanato', name: 'Off-White Retificado', desc: 'Porcelanato claro', base: '#e5e3de', vein: '#d3d0c8', grout: '#c6c3bc', style: 'plain' },
    { id: 'porc_calacatta', category: 'porcelanato', name: 'Calacatta Gold', desc: 'Mármore branco/veios', base: '#f3f1ed', vein: '#b9b2a6', gold: '#c9ad7f', grout: '#d6d2c9', style: 'marble' },
    { id: 'porc_cimento', category: 'porcelanato', name: 'Cimento Queimado', desc: 'Cinza urbano acetinado', base: '#9e9f9c', vein: '#858683', grout: '#777875', style: 'concrete' },
    { id: 'porc_travertino', category: 'porcelanato', name: 'Bege Travertino', desc: 'Pedra natural quente', base: '#dfd2be', vein: '#c4b299', grout: '#b8a892', style: 'travertine' },
    { id: 'porc_granilite', category: 'porcelanato', name: 'Granilite / Terrazzo', desc: 'Fundo claro com pedras', base: '#e8e5df', vein: '#7a756c', grout: '#ccc7be', style: 'terrazzo' },
    { id: 'porc_nero', category: 'porcelanato', name: 'Nero Marquina', desc: 'Porcelanato preto veios', base: '#26272a', vein: '#7d7a74', grout: '#191a1c', style: 'marble_dark' },

    // Madeira / Vinílico / Laminado
    { id: 'wood_carvalho', category: 'wood', name: 'Carvalho Claro', desc: 'Vinílico régua (Planta)', base: '#c9ae8b', grain: '#ae9069', seam: '#967954', style: 'planks' },
    { id: 'wood_freijo', category: 'wood', name: 'Freijó Natural', desc: 'Madeira acolhedora', base: '#b68553', grain: '#946638', seam: '#7a522a', style: 'planks' },
    { id: 'wood_nogueira', category: 'wood', name: 'Nogueira Escura', desc: 'Laminado sofisticado', base: '#6e4e35', grain: '#523824', seam: '#3f2a1a', style: 'planks' },
    { id: 'wood_espinha', category: 'wood', name: 'Espinha de Peixe', desc: 'Parquet carvalho mel', base: '#c49b66', grain: '#a47a46', seam: '#8a6436', style: 'herringbone' }
  ];

  function generateFloorCanvas(item) {
    const c = createCanvas(512, 512);
    const ctx = c.getContext('2d');
    const rand = mulberry32(item.id.split('').reduce((a, b) => a + b.charCodeAt(0) * 31, 7));

    if (item.category === 'porcelanato') {
      ctx.fillStyle = item.base;
      ctx.fillRect(0, 0, 512, 512);

      // Subtle mineral grain
      for (let i = 0; i < 2400; i++) {
        const x = rand() * 512;
        const y = rand() * 512;
        const r = 1 + rand() * 2.5;
        ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)';
        ctx.fillRect(x, y, r, r);
      }

      if (item.style === 'marble' || item.style === 'marble_dark') {
        const count = item.style === 'marble_dark' ? 9 : 14;
        for (let v = 0; v < count; v++) {
          ctx.beginPath();
          let x = rand() * 512;
          let y = rand() * 512;
          ctx.moveTo(x, y);
          const steps = 16;
          for (let s = 0; s < steps; s++) {
            x += (rand() - 0.3) * 48;
            y += (rand() - 0.35) * 48;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = v % 4 === 0 && item.gold ? item.gold : item.vein;
          ctx.globalAlpha = item.style === 'marble_dark' ? 0.32 : 0.28;
          ctx.lineWidth = 1.2 + rand() * 4;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      } else if (item.style === 'concrete') {
        for (let i = 0; i < 120; i++) {
          const x = rand() * 512;
          const y = rand() * 512;
          const rad = 18 + rand() * 65;
          const g = ctx.createRadialGradient(x, y, 2, x, y, rad);
          g.addColorStop(0, rand() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(40,42,45,0.09)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
      } else if (item.style === 'travertine') {
        for (let i = 0; i < 90; i++) {
          const y = rand() * 512;
          ctx.fillStyle = item.vein;
          ctx.globalAlpha = 0.08 + rand() * 0.14;
          ctx.fillRect(0, y, 512, 2 + rand() * 8);
        }
        ctx.globalAlpha = 1;
      } else if (item.style === 'terrazzo') {
        const chipColors = ['#9c8f7d', '#585652', '#c8a882', '#d7d1c6', '#7e8682', '#b9896b'];
        for (let i = 0; i < 420; i++) {
          ctx.fillStyle = chipColors[Math.floor(rand() * chipColors.length)];
          ctx.beginPath();
          const cx = rand() * 512;
          const cy = rand() * 512;
          const sides = 4 + Math.floor(rand() * 3);
          const rad = 2.5 + rand() * 7.5;
          for (let s = 0; s < sides; s++) {
            const ang = (s / sides) * Math.PI * 2 + rand() * 0.5;
            const px = cx + Math.cos(ang) * rad * (0.6 + rand() * 0.5);
            const py = cy + Math.sin(ang) * rad * (0.6 + rand() * 0.5);
            if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        }
      }

      // Rectified grout lines (border of 1 tile)
      ctx.strokeStyle = item.grout;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 508, 508);
    } else if (item.style === 'planks') {
      ctx.fillStyle = item.base;
      ctx.fillRect(0, 0, 512, 512);
      const rows = 5;
      const rowH = 512 / rows;
      for (let r = 0; r < rows; r++) {
        const y0 = r * rowH;
        const toneShift = (rand() - 0.5) * 18;
        ctx.fillStyle = shadeHex(item.base, toneShift);
        ctx.fillRect(0, y0, 512, rowH);

        // Wood grain lines
        for (let g = 0; g < 36; g++) {
          ctx.strokeStyle = item.grain;
          ctx.globalAlpha = 0.14 + rand() * 0.18;
          ctx.lineWidth = 0.8 + rand() * 1.6;
          ctx.beginPath();
          const gy = y0 + rand() * rowH;
          ctx.moveTo(0, gy);
          ctx.bezierCurveTo(170, gy + (rand() - 0.5) * 7, 340, gy + (rand() - 0.5) * 7, 512, gy);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Vertical plank joint staggered
        const jointX = ((r * 197 + 110) % 420) + 40;
        ctx.fillStyle = item.seam;
        ctx.fillRect(jointX, y0, 2, rowH);

        // Horizontal seam
        ctx.fillStyle = item.seam;
        ctx.fillRect(0, y0, 512, 2);
      }
    } else if (item.style === 'herringbone') {
      ctx.fillStyle = item.base;
      ctx.fillRect(0, 0, 512, 512);
      const step = 64;
      for (let y = -512; y < 1024; y += step) {
        for (let x = -512; x < 1024; x += step * 2) {
          // Right-slanted plank
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = shadeHex(item.base, (rand() - 0.5) * 20);
          ctx.fillRect(0, 0, step * 1.42, step * 0.7);
          ctx.strokeStyle = item.seam;
          ctx.lineWidth = 2;
          ctx.strokeRect(0, 0, step * 1.42, step * 0.7);
          ctx.restore();

          // Left-slanted plank
          ctx.save();
          ctx.translate(x + step, y);
          ctx.rotate(-Math.PI / 4);
          ctx.fillStyle = shadeHex(item.base, (rand() - 0.5) * 20);
          ctx.fillRect(0, 0, step * 1.42, step * 0.7);
          ctx.strokeStyle = item.seam;
          ctx.lineWidth = 2;
          ctx.strokeRect(0, 0, step * 1.42, step * 0.7);
          ctx.restore();
        }
      }
    }

    return c;
  }

  function getFloorTexture(id, repeatX, repeatY) {
    const key = `floor_${id}`;
    if (!cache[key]) {
      const item = FLOOR_CATALOG.find((f) => f.id === id) || FLOOR_CATALOG[0];
      cache[key] = generateFloorCanvas(item);
    }
    return makeTextureFromCanvas(cache[key], repeatX, repeatY, true);
  }

  function getFloorPreviewUrl(id) {
    const key = `floor_${id}`;
    if (!cache[key]) {
      const item = FLOOR_CATALOG.find((f) => f.id === id) || FLOOR_CATALOG[0];
      cache[key] = generateFloorCanvas(item);
    }
    return cache[key].toDataURL('image/png');
  }

  /* ----------------------------------------------------------
     WALL FINISHES
     ---------------------------------------------------------- */
  const WALL_FINISHES = [
    { id: 'pintura', name: 'Pintura Lisa', desc: 'Acabamento fosco' },
    { id: 'ripado_freijo', name: 'Painel Ripado Freijó', desc: 'Madeira ripada 3D' },
    { id: 'ripado_carvalho', name: 'Ripado Carvalho', desc: 'Madeira clara' },
    { id: 'ripado_preto', name: 'Ripado Grafite', desc: 'Ripado moderno escuro' },
    { id: 'cimento_parede', name: 'Cimento Queimado', desc: 'Textura artesanal' },
    { id: 'metro_branco', name: 'Azulejo Metrô', desc: 'Subway tile clássico' },
    { id: 'calacatta_parede', name: 'Porcelanato Mármore', desc: 'Ideal p/ banheiro/cozinha' },
    { id: 'boiserie', name: 'Boiserie Clássica', desc: 'Molduras na parede' }
  ];

  function generateWallFinishCanvas(finishId, tintHex) {
    const c = createCanvas(512, 512);
    const ctx = c.getContext('2d');
    const rand = mulberry32(finishId.length * 997 + 13);

    if (finishId === 'pintura') {
      ctx.fillStyle = tintHex || '#f2efe9';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 1600; i++) {
        ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
        ctx.fillRect(rand() * 512, rand() * 512, 2, 2);
      }
      return c;
    }

    if (finishId.startsWith('ripado_')) {
      const woodColor =
        finishId === 'ripado_freijo' ? '#a67443' :
        finishId === 'ripado_carvalho' ? '#c8ab82' : '#2d3035';
      const darkGap = finishId === 'ripado_preto' ? '#131518' : '#3a2818';

      ctx.fillStyle = darkGap;
      ctx.fillRect(0, 0, 512, 512);
      const slats = 16;
      const step = 512 / slats;
      const slatW = step * 0.68;

      for (let i = 0; i < slats; i++) {
        const x = i * step + step * 0.16;
        const grad = ctx.createLinearGradient(x, 0, x + slatW, 0);
        grad.addColorStop(0, shadeHex(woodColor, 14));
        grad.addColorStop(0.7, woodColor);
        grad.addColorStop(1, shadeHex(woodColor, -18));
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, slatW, 512);

        // Subtle grain
        ctx.strokeStyle = shadeHex(woodColor, -26);
        ctx.globalAlpha = 0.25;
        for (let g = 0; g < 6; g++) {
          ctx.beginPath();
          const gx = x + rand() * slatW;
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx + (rand() - 0.5) * 4, 512);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      return c;
    }

    if (finishId === 'cimento_parede') {
      ctx.fillStyle = tintHex || '#a9aba8';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 160; i++) {
        const x = rand() * 512;
        const y = rand() * 512;
        const rad = 25 + rand() * 80;
        const g = ctx.createRadialGradient(x, y, 4, x, y, rad);
        g.addColorStop(0, rand() > 0.45 ? 'rgba(255,255,255,0.12)' : 'rgba(25,28,32,0.12)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      return c;
    }

    if (finishId === 'metro_branco') {
      ctx.fillStyle = '#cfcdc8';
      ctx.fillRect(0, 0, 512, 512);
      const rows = 8;
      const cols = 4;
      const rw = 512 / cols;
      const rh = 512 / rows;
      const baseCol = tintHex && tintHex !== '#f2efe9' ? tintHex : '#f7f7f5';
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (rw / 2);
        for (let col = -1; col <= cols; col++) {
          const x = col * rw + offset + 3;
          const y = r * rh + 3;
          const grad = ctx.createLinearGradient(x, y, x, y + rh - 6);
          grad.addColorStop(0, shadeHex(baseCol, 8));
          grad.addColorStop(0.85, baseCol);
          grad.addColorStop(1, shadeHex(baseCol, -12));
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, rw - 6, rh - 6);
        }
      }
      return c;
    }

    if (finishId === 'calacatta_parede') {
      return generateFloorCanvas(FLOOR_CATALOG[1]);
    }

    if (finishId === 'boiserie') {
      ctx.fillStyle = tintHex || '#edeae2';
      ctx.fillRect(0, 0, 512, 512);
      // Draw upper and lower molding frames
      const drawFrame = (x, y, w, h) => {
        ctx.strokeStyle = 'rgba(0,0,0,0.14)';
        ctx.lineWidth = 6;
        ctx.strokeRect(x + 3, y + 3, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
      };
      drawFrame(34, 34, 444, 270);
      drawFrame(34, 336, 444, 142);
      return c;
    }

    return c;
  }

  function getWallFinishTexture(finishId, tintHex, repeatX = 1, repeatY = 1) {
    const key = `wall_${finishId}_${tintHex || 'def'}`;
    if (!cache[key]) {
      cache[key] = generateWallFinishCanvas(finishId, tintHex);
    }
    return makeTextureFromCanvas(cache[key], repeatX, repeatY, true);
  }

  function getWallFinishPreviewUrl(finishId) {
    const key = `wallprev_${finishId}`;
    if (!cache[key]) {
      const defaultTint = finishId === 'cimento_parede' ? '#9c9e9c' : '#eeeae2';
      cache[key] = generateWallFinishCanvas(finishId, defaultTint);
    }
    return cache[key].toDataURL('image/png');
  }

  /* ----------------------------------------------------------
     ARTWORK / QUADROS GENERATOR
     ---------------------------------------------------------- */
  const ART_THEMES = [
    { id: 'abstrato_bege', name: 'Abstrato Minimal', desc: 'Tons areia e terra' },
    { id: 'botanico', name: 'Botânico Folhas', desc: 'Verde oliva suave' },
    { id: 'terracota', name: 'Geométrico Terracota', desc: 'Arcos e sol quente' },
    { id: 'line_art', name: 'Line Art', desc: 'Traço contínuo moderno' },
    { id: 'paisagem', name: 'Paisagem Serena', desc: 'Montanhas e neblina' },
    { id: 'arquitetura_pb', name: 'Arquitetura P&B', desc: 'Contraste galeria' }
  ];

  function generateArtCanvas(themeId, variant = 0) {
    const c = createCanvas(360, 480);
    const ctx = c.getContext('2d');

    // Cream matte passe-partout background
    ctx.fillStyle = '#f5f2ec';
    ctx.fillRect(0, 0, 360, 480);

    // Inner art area
    const pad = 26;
    const x0 = pad, y0 = pad, w = 360 - pad * 2, h = 480 - pad * 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, w, h);
    ctx.clip();

    if (themeId === 'abstrato_bege') {
      ctx.fillStyle = '#ebe4d8';
      ctx.fillRect(x0, y0, w, h);
      const palettes = [
        ['#c8ae92', '#8f6f52', '#3a322c'],
        ['#d6c3ac', '#a67b5b', '#4d4138'],
        ['#bfa58a', '#7c5d45', '#2f2925']
      ];
      const pal = palettes[variant % 3];
      ctx.fillStyle = pal[0];
      ctx.beginPath();
      ctx.arc(x0 + w * (0.35 + variant * 0.14), y0 + h * 0.42, 115, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal[1];
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x0 + 40 + variant * 25, y0 + 170, 180, 210, 90) : ctx.fillRect(x0 + 50, y0 + 170, 170, 210);
      ctx.fill();

      ctx.strokeStyle = pal[2];
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x0 + 40, y0 + 340 - variant * 35);
      ctx.bezierCurveTo(x0 + 130, y0 + 80, x0 + 230, y0 + 380, x0 + 280, y0 + 120);
      ctx.stroke();
    } else if (themeId === 'botanico') {
      ctx.fillStyle = '#eef0ea';
      ctx.fillRect(x0, y0, w, h);
      // Soft sage circle backdrop
      ctx.fillStyle = '#dce3d5';
      ctx.beginPath();
      ctx.arc(x0 + w * 0.5, y0 + h * 0.46, 110, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = '#475c43';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x0 + w * (0.45 + variant * 0.05), y0 + h - 25);
      ctx.quadraticCurveTo(x0 + w * 0.55, y0 + h * 0.5, x0 + w * (0.48 - variant * 0.04), y0 + 55);
      ctx.stroke();

      // Leaves
      const leafCount = 7 + variant;
      for (let i = 0; i < leafCount; i++) {
        const t = i / leafCount;
        const lx = x0 + w * 0.5 + (i % 2 === 0 ? -1 : 1) * 10;
        const ly = y0 + h - 75 - t * 280;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate((i % 2 === 0 ? -0.75 : 0.75) + variant * 0.08);
        ctx.fillStyle = i % 2 === 0 ? '#5b7553' : '#7b946f';
        ctx.beginPath();
        ctx.ellipse(0, -28, 18, 42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (themeId === 'terracota') {
      ctx.fillStyle = '#f2e8dc';
      ctx.fillRect(x0, y0, w, h);
      // Arch
      ctx.fillStyle = ['#c46d4e', '#d68b67', '#a6543b'][variant % 3];
      ctx.beginPath();
      ctx.arc(x0 + w / 2, y0 + 185, 95, Math.PI, 0);
      ctx.lineTo(x0 + w / 2 + 95, y0 + h - 30);
      ctx.lineTo(x0 + w / 2 - 95, y0 + h - 30);
      ctx.closePath();
      ctx.fill();

      // Sun circle
      ctx.fillStyle = '#e8c49a';
      ctx.beginPath();
      ctx.arc(x0 + w * (0.35 + variant * 0.15), y0 + 120 + variant * 25, 42, 0, Math.PI * 2);
      ctx.fill();

      // Minimal dark line
      ctx.strokeStyle = '#31251e';
      ctx.lineWidth = 3;
      ctx.strokeRect(x0 + 38, y0 + 38, w - 76, h - 76);
    } else if (themeId === 'line_art') {
      ctx.fillStyle = '#faf8f4';
      ctx.fillRect(x0, y0, w, h);
      // Beige organic blob
      ctx.fillStyle = '#e5d8c8';
      ctx.beginPath();
      ctx.ellipse(x0 + w * (0.45 + variant * 0.06), y0 + h * 0.52, 85, 125, variant * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Single continuous artistic stroke
      ctx.strokeStyle = '#1e1d1b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (variant % 3 === 0) {
        ctx.moveTo(x0 + 80, y0 + 360);
        ctx.bezierCurveTo(x0 + 50, y0 + 140, x0 + 260, y0 + 90, x0 + 220, y0 + 220);
        ctx.bezierCurveTo(x0 + 180, y0 + 320, x0 + 90, y0 + 250, x0 + 170, y0 + 130);
        ctx.bezierCurveTo(x0 + 210, y0 + 80, x0 + 250, y0 + 280, x0 + 230, y0 + 370);
      } else if (variant % 3 === 1) {
        ctx.arc(x0 + w / 2, y0 + 165, 65, 0.2, Math.PI * 1.9);
        ctx.bezierCurveTo(x0 + 260, y0 + 260, x0 + 80, y0 + 290, x0 + 150, y0 + 380);
      } else {
        ctx.moveTo(x0 + 110, y0 + 90);
        ctx.bezierCurveTo(x0 + 250, y0 + 150, x0 + 70, y0 + 250, x0 + 240, y0 + 350);
        ctx.moveTo(x0 + 155, y0 + 110);
        ctx.arc(x0 + 155, y0 + 225, 78, -Math.PI / 2, Math.PI * 1.2);
      }
      ctx.stroke();
    } else if (themeId === 'paisagem') {
      const sky = ctx.createLinearGradient(0, y0, 0, y0 + h);
      sky.addColorStop(0, '#cfd9de');
      sky.addColorStop(0.55, '#ede7de');
      sky.addColorStop(1, '#d8cfc2');
      ctx.fillStyle = sky;
      ctx.fillRect(x0, y0, w, h);

      // Sun
      ctx.fillStyle = '#f8f2e8';
      ctx.beginPath();
      ctx.arc(x0 + w * (0.3 + variant * 0.2), y0 + 115, 34, 0, Math.PI * 2);
      ctx.fill();

      // Mountain layers
      const layers = [
        { y: 240, color: '#9ba9b0', amp: 45 },
        { y: 290, color: '#788890', amp: 38 },
        { y: 345, color: '#53626b', amp: 28 }
      ];
      layers.forEach((l, idx) => {
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(x0, y0 + h);
        for (let px = 0; px <= w; px += 12) {
          const py = l.y + Math.sin(px * 0.02 + variant * 2 + idx) * l.amp + Math.cos(px * 0.045 - idx) * 14;
          ctx.lineTo(x0 + px, y0 + py);
        }
        ctx.lineTo(x0 + w, y0 + h);
        ctx.closePath();
        ctx.fill();
      });
    } else if (themeId === 'arquitetura_pb') {
      ctx.fillStyle = '#e5e5e5';
      ctx.fillRect(x0, y0, w, h);
      ctx.fillStyle = '#1e1f22';
      if (variant % 3 === 0) {
        ctx.fillRect(x0 + 30, y0 + 60, 120, 340);
        ctx.fillStyle = '#55575c';
        ctx.fillRect(x0 + 165, y0 + 130, 110, 270);
        ctx.fillStyle = '#f5f5f5';
        for (let r = 0; r < 8; r++) ctx.fillRect(x0 + 48, y0 + 82 + r * 36, 84, 14);
      } else if (variant % 3 === 1) {
        ctx.beginPath();
        ctx.arc(x0 + w / 2, y0 + h / 2, 115, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ececec';
        ctx.beginPath();
        ctx.arc(x0 + w / 2 + 35, y0 + h / 2 - 20, 92, 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#1b1c1f' : '#8d9096';
          ctx.fillRect(x0 + 25 + i * 30, y0 + 50 + i * 18, 22, 340 - i * 18);
        }
      }
    }

    ctx.restore();
    return c;
  }

  function getArtTexture(themeId, variant = 0) {
    const key = `art_${themeId}_${variant}`;
    if (!cache[key]) {
      cache[key] = generateArtCanvas(themeId, variant);
    }
    const tex = new THREE.CanvasTexture(cache[key]);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  }

  function getArtPreviewUrl(themeId) {
    const key = `art_${themeId}_0`;
    if (!cache[key]) {
      cache[key] = generateArtCanvas(themeId, 0);
    }
    return cache[key].toDataURL('image/png');
  }

  /* ----------------------------------------------------------
     HELPER: Shade Hex Color
     ---------------------------------------------------------- */
  function shadeHex(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  return {
    FLOOR_CATALOG,
    WALL_FINISHES,
    ART_THEMES,
    getFloorTexture,
    getFloorPreviewUrl,
    getWallFinishTexture,
    getWallFinishPreviewUrl,
    getArtTexture,
    getArtPreviewUrl
  };
})();
