/* ============================================================
   furniture.js — Modelos 3D de Móveis da Planta + Itens Extras
   ============================================================ */

window.AppFurniture = (function () {
  function stdMat(color, roughness = 0.65, metalness = 0.05) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  function addBox(parent, w, h, d, x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function addCyl(parent, rt, rb, h, segs, x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  /* ----------------------------------------------------------
     1. CAMA CASAL (Quarto) — Cabeceira em +Z (parede da janela)
     ---------------------------------------------------------- */
  function buildBed(primaryColor = '#8c7662') {
    const g = new THREE.Group();
    const frameMat = stdMat('#e8e2d8', 0.75);
    const mattressMat = stdMat('#f6f5f2', 0.85);
    const blanketMat = stdMat(primaryColor, 0.85);
    const pillowMat = stdMat('#ede6dc', 0.85);
    const accentPillowMat = stdMat('#b47551', 0.82);

    // Base box
    addBox(g, 1.42, 0.28, 1.92, 0, 0.14, 0, frameMat);
    // Mattress
    addBox(g, 1.38, 0.22, 1.88, 0, 0.39, 0, mattressMat);
    // Headboard (at +Z end, against South window wall)
    addBox(g, 1.48, 0.92, 0.08, 0, 0.46, 0.94, frameMat);
    // Throw blanket folded across foot of bed (-Z side)
    addBox(g, 1.41, 0.05, 0.62, 0, 0.495, -0.52, blanketMat);
    // Side drape of blanket
    addBox(g, 0.03, 0.22, 0.62, -0.71, 0.40, -0.52, blanketMat);
    addBox(g, 0.03, 0.22, 0.62, 0.71, 0.40, -0.52, blanketMat);

    // Pillows (at +Z end)
    addBox(g, 0.56, 0.14, 0.34, -0.34, 0.55, 0.68, pillowMat);
    addBox(g, 0.56, 0.14, 0.34, 0.34, 0.55, 0.68, pillowMat);
    addBox(g, 0.46, 0.13, 0.24, -0.32, 0.56, 0.46, blanketMat);
    addBox(g, 0.46, 0.13, 0.24, 0.32, 0.56, 0.46, blanketMat);
    // Center terracotta cushion
    addBox(g, 0.34, 0.13, 0.18, 0, 0.57, 0.28, accentPillowMat);

    g.userData.primaryMaterials = [blanketMat];
    return g;
  }

  /* ----------------------------------------------------------
     2. CRIADO-MUDO COM ABAJUR (Quarto)
     ---------------------------------------------------------- */
  function buildNightstand(primaryColor = '#d2b48c') {
    const g = new THREE.Group();
    const woodMat = stdMat(primaryColor, 0.6);
    const legMat = stdMat('#8a6b48', 0.6);
    const shadeMat = stdMat('#faf6ee', 0.7);
    const brassMat = stdMat('#c7a770', 0.35, 0.7);

    // Top cylinder
    addCyl(g, 0.19, 0.19, 0.14, 24, 0, 0.46, 0, woodMat);
    // 3 legs
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      addCyl(g, 0.016, 0.012, 0.42, 8, Math.cos(a) * 0.13, 0.21, Math.sin(a) * 0.13, legMat);
    }
    // Lamp base & shade
    addCyl(g, 0.045, 0.055, 0.04, 16, 0, 0.55, 0, brassMat);
    addCyl(g, 0.012, 0.012, 0.16, 10, 0, 0.64, 0, brassMat);
    addCyl(g, 0.08, 0.11, 0.14, 18, 0, 0.74, 0, shadeMat);

    g.userData.primaryMaterials = [woodMat];
    return g;
  }

  /* ----------------------------------------------------------
     3. GUARDA-ROUPA (Quarto)
     ---------------------------------------------------------- */
  function buildWardrobe(primaryColor = '#eceae4') {
    const g = new THREE.Group();
    const bodyMat = stdMat(primaryColor, 0.55);
    const trimMat = stdMat('#c9c5bc', 0.45, 0.2);
    const handleMat = stdMat('#2c2e33', 0.35, 0.6);

    // Main cabinet (1.44m wide x 2.35m tall x 0.55m deep)
    addBox(g, 1.44, 2.35, 0.54, 0, 1.175, 0, bodyMat);
    // Two sliding doors with subtle depth offset
    addBox(g, 0.70, 2.24, 0.025, -0.355, 1.175, 0.275, bodyMat);
    addBox(g, 0.70, 2.24, 0.025, 0.355, 1.175, 0.29, trimMat);
    // Handles
    addBox(g, 0.02, 0.65, 0.02, -0.05, 1.15, 0.295, handleMat);
    addBox(g, 0.02, 0.65, 0.02, 0.05, 1.15, 0.31, handleMat);
    // Top crown
    addBox(g, 1.46, 0.04, 0.57, 0, 2.36, 0.01, bodyMat);

    g.userData.primaryMaterials = [bodyMat];
    return g;
  }

  /* ----------------------------------------------------------
     4. SOFÁ 3 LUGARES (Sala) — Faces -X by default when rotated
     ---------------------------------------------------------- */
  function buildSofa(primaryColor = '#dedad2') {
    const g = new THREE.Group();
    const fabricMat = stdMat(primaryColor, 0.88);
    const cushionMat1 = stdMat('#8d7258', 0.85);
    const cushionMat2 = stdMat('#b89b7a', 0.85);
    const legMat = stdMat('#3d3228', 0.55);

    // Base (width along X = 1.80, depth along Z = 0.82 -> rotate Y = -PI/2 to sit on East wall)
    addBox(g, 1.80, 0.18, 0.82, 0, 0.17, 0, fabricMat);
    // 2 Seat cushions
    addBox(g, 0.78, 0.16, 0.70, -0.40, 0.34, 0.04, fabricMat);
    addBox(g, 0.78, 0.16, 0.70, 0.40, 0.34, 0.04, fabricMat);
    // Backrest
    addBox(g, 1.80, 0.56, 0.18, 0, 0.54, -0.32, fabricMat);
    // Back pillows
    addBox(g, 0.76, 0.34, 0.14, -0.40, 0.58, -0.17, fabricMat);
    addBox(g, 0.76, 0.34, 0.14, 0.40, 0.58, -0.17, fabricMat);
    // Armrests
    addBox(g, 0.14, 0.44, 0.82, -0.83, 0.40, 0, fabricMat);
    addBox(g, 0.14, 0.44, 0.82, 0.83, 0.40, 0, fabricMat);

    // Decorative throw pillows
    const p1 = addBox(g, 0.30, 0.28, 0.10, -0.62, 0.54, -0.02, cushionMat1);
    p1.rotation.y = 0.45;
    p1.rotation.z = 0.12;
    const p2 = addBox(g, 0.28, 0.26, 0.10, -0.46, 0.53, 0.03, cushionMat2);
    p2.rotation.y = 0.25;
    const p3 = addBox(g, 0.30, 0.28, 0.10, 0.62, 0.54, -0.02, cushionMat1);
    p3.rotation.y = -0.4;

    // Legs
    [[-0.80, -0.32], [0.80, -0.32], [-0.80, 0.32], [0.80, 0.32]].forEach(([lx, lz]) => {
      addCyl(g, 0.02, 0.015, 0.08, 8, lx, 0.04, lz, legMat);
    });

    g.userData.primaryMaterials = [fabricMat];
    return g;
  }

  /* ----------------------------------------------------------
     5. MESA DE JANTAR / PENÍNSULA + 3 CADEIRAS
     ---------------------------------------------------------- */
  function buildDiningSet(primaryColor = '#d4b88c') {
    const g = new THREE.Group();
    const woodMat = stdMat(primaryColor, 0.55);
    const chairFrameMat = stdMat('#b48a5a', 0.55);
    const seatMat = stdMat('#ebe6dc', 0.82);
    const potMat = stdMat('#6b635b', 0.75);
    const leafMat = stdMat('#4d7344', 0.75);

    // Tabletop (0.78m x 1.22m, height 0.76m)
    addBox(g, 0.78, 0.045, 1.22, 0, 0.75, 0, woodMat);
    // Support side panel (against wall -X) + legs
    addBox(g, 0.04, 0.73, 1.16, -0.36, 0.365, 0, woodMat);
    addBox(g, 0.05, 0.73, 0.05, 0.34, 0.365, -0.55, woodMat);
    addBox(g, 0.05, 0.73, 0.05, 0.34, 0.365, 0.55, woodMat);

    // Centerpiece plant on table
    addCyl(g, 0.065, 0.05, 0.11, 14, 0.02, 0.825, -0.05, potMat);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), leafMat);
      leaf.scale.set(1.2, 0.5, 0.8);
      leaf.position.set(0.02 + Math.cos(a) * 0.06, 0.91 + (i % 2) * 0.03, -0.05 + Math.sin(a) * 0.06);
      leaf.castShadow = true;
      g.add(leaf);
    }

    // Helper for modern Scandinavian dining chair
    function addChair(cx, cz, rotY) {
      const ch = new THREE.Group();
      // Round seat
      addCyl(ch, 0.21, 0.21, 0.04, 18, 0, 0.45, 0, seatMat);
      // 4 legs
      [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(([lx, lz]) => {
        addCyl(ch, 0.015, 0.012, 0.45, 8, lx, 0.225, lz, chairFrameMat);
      });
      // Curved-style backrest (3 segments)
      addBox(ch, 0.36, 0.12, 0.03, 0, 0.72, -0.18, chairFrameMat);
      addCyl(ch, 0.014, 0.014, 0.30, 8, -0.15, 0.59, -0.16, chairFrameMat);
      addCyl(ch, 0.014, 0.014, 0.30, 8, 0.15, 0.59, -0.16, chairFrameMat);

      ch.position.set(cx, 0, cz);
      ch.rotation.y = rotY;
      g.add(ch);
    }

    // 3 Chairs exactly as in the floor plan: 1 North, 2 East
    addChair(0.02, -0.74, 0);
    addChair(0.52, -0.28, -Math.PI / 2);
    addChair(0.52, 0.32, -Math.PI / 2);

    g.userData.primaryMaterials = [woodMat];
    return g;
  }

  /* ----------------------------------------------------------
     6. RACK + PAINEL + TV 50" + 2 PUFFS (Sala)
     ---------------------------------------------------------- */
  function buildTvUnit(primaryColor = '#d4b88c') {
    const g = new THREE.Group();
    const woodMat = stdMat(primaryColor, 0.55);
    const panelMat = stdMat('#e5d5bc', 0.65);
    const tvFrameMat = stdMat('#16181c', 0.25, 0.4);
    const screenMat = new THREE.MeshStandardMaterial({ color: '#1b2230', roughness: 0.12, metalness: 0.3 });
    const puffMat = stdMat('#c8bfb2', 0.85);

    // Floating TV rack (depth X=0.32, length Z=1.32)
    addBox(g, 0.32, 0.26, 1.32, 0, 0.36, 0, woodMat);
    // TV wood back panel against -X wall
    addBox(g, 0.03, 1.55, 1.32, -0.14, 1.25, 0, panelMat);
    // TV 50" mounted facing +X
    addBox(g, 0.04, 0.68, 1.12, -0.09, 1.28, 0, tvFrameMat);
    addBox(g, 0.01, 0.63, 1.07, -0.068, 1.28, 0, screenMat);

    // 2 Round Puffs tucked right next to the rack (as in the floor plan!)
    addCyl(g, 0.18, 0.18, 0.36, 20, 0.36, 0.18, -0.32, puffMat);
    addCyl(g, 0.18, 0.18, 0.36, 20, 0.36, 0.18, 0.22, puffMat);

    g.userData.primaryMaterials = [woodMat, panelMat];
    return g;
  }

  /* ----------------------------------------------------------
     7. COZINHA: BANCADA + PIA + ARMÁRIOS
     ---------------------------------------------------------- */
  function buildKitchenCounter(primaryColor = '#e8e6e1') {
    const g = new THREE.Group();
    const cabMat = stdMat(primaryColor, 0.5);
    const stoneMat = stdMat('#dcd9d2', 0.32, 0.08);
    const steelMat = stdMat('#b8bec4', 0.25, 0.85);
    const boardMat = stdMat('#c69d6b', 0.7);

    // Base cabinet (depth X=0.60, length Z=1.24)
    addBox(g, 0.58, 0.84, 1.24, 0, 0.42, 0, cabMat);
    // Granite/Quartz Countertop
    addBox(g, 0.62, 0.04, 1.26, -0.01, 0.86, 0, stoneMat);
    // Back splash lip
    addBox(g, 0.025, 0.12, 1.26, 0.29, 0.94, 0, stoneMat);
    // Stainless steel sink basin (facing -X)
    addBox(g, 0.38, 0.02, 0.52, -0.02, 0.882, 0.18, steelMat);
    addBox(g, 0.32, 0.025, 0.46, -0.02, 0.885, 0.18, stdMat('#7a8086', 0.3, 0.8));
    // Goose-neck gourmet faucet
    addCyl(g, 0.012, 0.015, 0.26, 10, 0.19, 1.01, 0.18, steelMat);
    addBox(g, 0.14, 0.018, 0.018, 0.12, 1.13, 0.18, steelMat);
    addCyl(g, 0.01, 0.01, 0.06, 8, 0.05, 1.10, 0.18, steelMat);
    // Cutting board (just like in the floor plan!)
    addBox(g, 0.22, 0.02, 0.32, -0.02, 0.89, -0.34, boardMat);

    // Cabinet door seams
    const seamMat = stdMat('#bdb9b0', 0.5);
    addBox(g, 0.01, 0.76, 0.012, -0.292, 0.42, -0.20, seamMat);
    addBox(g, 0.01, 0.76, 0.012, -0.292, 0.42, 0.20, seamMat);

    g.userData.primaryMaterials = [cabMat];
    return g;
  }

  /* ----------------------------------------------------------
     8. ARMÁRIO AÉREO COZINHA (Toggleable)
     ---------------------------------------------------------- */
  function buildUpperCabinets(primaryColor = '#eceae4') {
    const g = new THREE.Group();
    const cabMat = stdMat(primaryColor, 0.45);
    const glassMat = new THREE.MeshStandardMaterial({ color: '#d8e4e8', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.45 });
    const ledMat = new THREE.MeshBasicMaterial({ color: '#fff3d6' });

    // Overhead cabinets over sink + stove (length Z=1.82, depth X=0.35, height=0.72)
    addBox(g, 0.35, 0.72, 1.82, 0, 1.88, 0, cabMat);
    // Subtle decorative niche
    addBox(g, 0.36, 0.22, 0.60, -0.005, 1.66, 0.60, glassMat);
    // Under-cabinet LED strip
    addBox(g, 0.02, 0.01, 1.76, -0.10, 1.515, 0, ledMat);

    g.userData.primaryMaterials = [cabMat];
    return g;
  }

  /* ----------------------------------------------------------
     9. FOGÃO 4 BOCAS
     ---------------------------------------------------------- */
  function buildStove(primaryColor = '#cfd4da') {
    const g = new THREE.Group();
    const bodyMat = stdMat(primaryColor, 0.32, 0.65);
    const glassMat = stdMat('#1b1d22', 0.12, 0.2);
    const burnerMat = stdMat('#25272b', 0.5, 0.5);

    addBox(g, 0.60, 0.86, 0.56, 0, 0.43, 0, bodyMat);
    // Oven glass door (facing -X)
    addBox(g, 0.02, 0.48, 0.44, -0.30, 0.40, 0, glassMat);
    // Oven handle
    addBox(g, 0.03, 0.025, 0.40, -0.32, 0.68, 0, stdMat('#e5e7eb', 0.2, 0.8));
    // Top glass / inox hob
    addBox(g, 0.58, 0.02, 0.54, 0, 0.87, 0, bodyMat);
    // 4 burners
    [[-0.14, -0.13], [0.12, -0.13], [-0.14, 0.13], [0.12, 0.13]].forEach(([bx, bz]) => {
      addCyl(g, 0.065, 0.07, 0.025, 16, bx, 0.89, bz, burnerMat);
    });

    g.userData.primaryMaterials = [bodyMat];
    return g;
  }

  /* ----------------------------------------------------------
     10. GELADEIRA
     ---------------------------------------------------------- */
  function buildFridge(primaryColor = '#cfd4da') {
    const g = new THREE.Group();
    const bodyMat = stdMat(primaryColor, 0.28, 0.65);
    const seamMat = stdMat('#2c2f34', 0.5);
    const handleMat = stdMat('#9aa0a8', 0.2, 0.85);

    // Fridge body (depth X=0.66, width Z=0.64, height=1.82)
    addBox(g, 0.64, 1.80, 0.64, 0, 0.90, 0, bodyMat);
    // Freezer / Fridge divider seam (facing -X)
    addBox(g, 0.015, 0.018, 0.64, -0.322, 1.24, 0, seamMat);
    // Handles
    addBox(g, 0.03, 0.36, 0.025, -0.34, 1.50, -0.24, handleMat);
    addBox(g, 0.03, 0.54, 0.025, -0.34, 0.86, -0.24, handleMat);

    g.userData.primaryMaterials = [bodyMat];
    return g;
  }

  /* ----------------------------------------------------------
     11. MÁQUINA DE LAVAR + TANQUE (Área de Serviço)
     ---------------------------------------------------------- */
  function buildWasher(primaryColor = '#f2f3f5') {
    const g = new THREE.Group();
    const bodyMat = stdMat(primaryColor, 0.35, 0.15);
    const doorRingMat = stdMat('#9aa0a8', 0.25, 0.75);
    const glassMat = stdMat('#262c36', 0.1, 0.3);

    addBox(g, 0.58, 0.85, 0.60, 0, 0.425, 0, bodyMat);
    // Front drum door (facing +X)
    const ring = addCyl(g, 0.19, 0.19, 0.04, 24, 0.295, 0.44, 0, doorRingMat);
    ring.rotation.z = Math.PI / 2;
    const glass = addCyl(g, 0.145, 0.145, 0.045, 24, 0.30, 0.44, 0, glassMat);
    glass.rotation.z = Math.PI / 2;
    // Control panel strip
    addBox(g, 0.02, 0.12, 0.56, 0.29, 0.77, 0, stdMat('#e2e4e8', 0.4));

    g.userData.primaryMaterials = [bodyMat];
    return g;
  }

  function buildLaundrySink(primaryColor = '#f4f4f2') {
    const g = new THREE.Group();
    const ceramicMat = stdMat(primaryColor, 0.22, 0.05);
    const steelMat = stdMat('#b8bec4', 0.25, 0.85);

    // Basin
    addBox(g, 0.44, 0.26, 0.48, 0, 0.78, 0, ceramicMat);
    addBox(g, 0.34, 0.04, 0.38, 0.02, 0.90, 0, stdMat('#dcded9', 0.3));
    // Column pedestal
    addBox(g, 0.22, 0.66, 0.24, -0.06, 0.33, 0, ceramicMat);
    // Faucet
    addBox(g, 0.14, 0.025, 0.025, -0.14, 1.02, 0, steelMat);

    g.userData.primaryMaterials = [ceramicMat];
    return g;
  }

  /* ----------------------------------------------------------
     12. BANHEIRO: VASO, PIA/GABINETE + ESPELHO, CHUVEIRO
     ---------------------------------------------------------- */
  function buildToilet(primaryColor = '#f7f7f5') {
    const g = new THREE.Group();
    const ceramicMat = stdMat(primaryColor, 0.18, 0.05);

    // Tank (against -Z wall)
    addBox(g, 0.38, 0.42, 0.18, 0, 0.58, -0.22, ceramicMat);
    // Bowl pedestal
    addCyl(g, 0.18, 0.14, 0.38, 20, 0, 0.19, 0.04, ceramicMat);
    // Seat lid
    addCyl(g, 0.19, 0.19, 0.04, 20, 0, 0.40, 0.05, ceramicMat);

    g.userData.primaryMaterials = [ceramicMat];
    return g;
  }

  function buildBathroomVanity(primaryColor = '#d4c8b8') {
    const g = new THREE.Group();
    const cabMat = stdMat(primaryColor, 0.55);
    const stoneMat = stdMat('#e6e3dc', 0.28, 0.05);
    const basinMat = stdMat('#ffffff', 0.15, 0.05);
    const mirrorMat = new THREE.MeshStandardMaterial({ color: '#dbe7ee', roughness: 0.14, metalness: 0.45 });
    const ledMat = new THREE.MeshBasicMaterial({ color: '#fff2d6' });

    // Floating cabinet (width X=0.66, depth Z=0.44)
    addBox(g, 0.64, 0.46, 0.42, 0, 0.56, 0, cabMat);
    // Stone top
    addBox(g, 0.68, 0.04, 0.45, 0, 0.81, 0, stoneMat);
    // Round vessel basin
    addCyl(g, 0.17, 0.14, 0.12, 22, 0, 0.89, 0.02, basinMat);
    // Mirror with backlit LED halo on wall (-Z)
    addCyl(g, 0.28, 0.28, 0.014, 28, 0, 1.50, -0.21, ledMat).rotation.x = Math.PI / 2;
    addCyl(g, 0.26, 0.26, 0.018, 28, 0, 1.50, -0.20, mirrorMat).rotation.x = Math.PI / 2;

    g.userData.primaryMaterials = [cabMat];
    return g;
  }

  /* ----------------------------------------------------------
     13. TAPETES (Quarto e Sala)
     ---------------------------------------------------------- */
  function buildRug(w, d, primaryColor = '#e6dfd3') {
    const g = new THREE.Group();
    const rugMat = stdMat(primaryColor, 0.95);
    addBox(g, w, 0.012, d, 0, 0.006, 0, rugMat);
    g.userData.primaryMaterials = [rugMat];
    return g;
  }

  /* ----------------------------------------------------------
     14. ITENS EXTRAS ADICIONÁVEIS
     ---------------------------------------------------------- */
  function buildPlant(primaryColor = '#c27b56') {
    const g = new THREE.Group();
    const potMat = stdMat(primaryColor, 0.72);
    const soilMat = stdMat('#3c2f24', 0.95);
    const stemMat = stdMat('#3d5e37', 0.8);
    const leafMat = stdMat('#4c7c42', 0.7);

    addCyl(g, 0.16, 0.12, 0.32, 18, 0, 0.16, 0, potMat);
    addCyl(g, 0.15, 0.15, 0.02, 16, 0, 0.31, 0, soilMat);
    addCyl(g, 0.018, 0.024, 0.65, 8, 0, 0.62, 0, stemMat);

    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const h = 0.55 + (i % 3) * 0.22;
      const r = 0.12 + (i % 2) * 0.08;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), leafMat);
      leaf.scale.set(1.3, 0.32, 0.85);
      leaf.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
      leaf.rotation.y = -a;
      leaf.rotation.z = 0.35;
      leaf.castShadow = true;
      g.add(leaf);
    }

    g.userData.primaryMaterials = [potMat];
    return g;
  }

  function buildFloorLamp(primaryColor = '#25272b') {
    const g = new THREE.Group();
    const metalMat = stdMat(primaryColor, 0.35, 0.75);
    const shadeMat = stdMat('#f6eedc', 0.65);

    addCyl(g, 0.15, 0.16, 0.03, 20, 0, 0.015, 0, metalMat);
    addCyl(g, 0.014, 0.016, 1.55, 10, 0, 0.79, 0, metalMat);
    addCyl(g, 0.13, 0.18, 0.24, 20, 0, 1.55, 0, shadeMat);

    g.userData.primaryMaterials = [metalMat];
    return g;
  }

  function buildCoffeeTable(primaryColor = '#b88d5d') {
    const g = new THREE.Group();
    const topMat = stdMat(primaryColor, 0.5);
    const legMat = stdMat('#25272b', 0.4, 0.7);

    addCyl(g, 0.34, 0.34, 0.03, 28, 0, 0.38, 0, topMat);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      addCyl(g, 0.012, 0.012, 0.37, 8, Math.cos(a) * 0.20, 0.185, Math.sin(a) * 0.20, legMat);
    }

    g.userData.primaryMaterials = [topMat];
    return g;
  }

  function buildArmchair(primaryColor = '#a56e4c') {
    const g = new THREE.Group();
    const fabricMat = stdMat(primaryColor, 0.85);
    const legMat = stdMat('#3c2d20', 0.55);

    addBox(g, 0.66, 0.14, 0.64, 0, 0.34, 0, fabricMat);
    addBox(g, 0.66, 0.44, 0.14, 0, 0.60, -0.25, fabricMat);
    addBox(g, 0.10, 0.28, 0.60, -0.28, 0.46, 0, fabricMat);
    addBox(g, 0.10, 0.28, 0.60, 0.28, 0.46, 0, fabricMat);
    [[-0.26, -0.24], [0.26, -0.24], [-0.26, 0.24], [0.26, 0.24]].forEach(([lx, lz]) => {
      addCyl(g, 0.018, 0.014, 0.28, 8, lx, 0.14, lz, legMat);
    });

    g.userData.primaryMaterials = [fabricMat];
    return g;
  }

  function buildFullMirror(primaryColor = '#25272b') {
    const g = new THREE.Group();
    const frameMat = stdMat(primaryColor, 0.4, 0.4);
    const mirrorMat = new THREE.MeshStandardMaterial({ color: '#d8e4ea', roughness: 0.05, metalness: 0.94 });

    const frame = addBox(g, 0.58, 1.72, 0.04, 0, 0.86, 0, frameMat);
    const glass = addBox(g, 0.52, 1.66, 0.01, 0, 0.86, 0.022, mirrorMat);
    frame.rotation.x = -0.10;
    glass.rotation.x = -0.10;

    g.userData.primaryMaterials = [frameMat];
    return g;
  }

  function buildDesk(primaryColor = '#c9a97c') {
    const g = new THREE.Group();
    const topMat = stdMat(primaryColor, 0.55);
    const legMat = stdMat('#25272b', 0.4, 0.7);
    const laptopMat = stdMat('#3c414a', 0.3, 0.7);

    addBox(g, 0.95, 0.04, 0.50, 0, 0.74, 0, topMat);
    addBox(g, 0.03, 0.72, 0.46, -0.44, 0.36, 0, legMat);
    addBox(g, 0.03, 0.72, 0.46, 0.44, 0.36, 0, legMat);
    // Small laptop on desk
    addBox(g, 0.32, 0.012, 0.22, 0, 0.766, 0.02, laptopMat);
    const lid = addBox(g, 0.32, 0.20, 0.01, 0, 0.86, -0.09, laptopMat);
    lid.rotation.x = -0.2;

    g.userData.primaryMaterials = [topMat];
    return g;
  }

  function buildCurtain(w = 1.45, primaryColor = '#f4f1ea') {
    const g = new THREE.Group();
    const fabricMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.9,
      transparent: true,
      opacity: 0.92
    });
    const rodMat = stdMat('#2b2d30', 0.35, 0.7);

    // Rod
    const rod = addCyl(g, 0.012, 0.012, w + 0.16, 10, 0, 2.42, 0, rodMat);
    rod.rotation.z = Math.PI / 2;

    // Pleated curtain panels left & right
    const pleats = 8;
    for (let side of [-1, 1]) {
      for (let i = 0; i < pleats; i++) {
        const px = side * (w * 0.26 + (i - pleats / 2) * 0.045);
        const pz = (i % 2 === 0 ? 0.025 : -0.01);
        addCyl(g, 0.028, 0.032, 2.38, 8, px, 1.21, pz, fabricMat);
      }
    }

    g.userData.primaryMaterials = [fabricMat];
    return g;
  }

  /* ----------------------------------------------------------
     DEFAULT FURNITURE LIST (EXACTLY MATCHING THE 24m² PLAN)
     ---------------------------------------------------------- */
  const DEFAULT_FURNITURE = [
    { id: 'bed', type: 'bed', name: 'Cama Casal', room: 'Quarto', x: 1.12, z: 3.74, rotY: 0, color: '#8f7760', visible: true },
    { id: 'rug_bedroom', type: 'rug_bedroom', name: 'Tapete Quarto', room: 'Quarto', x: 1.12, z: 3.45, rotY: 0, color: '#e6e0d5', visible: true },
    { id: 'night_l', type: 'nightstand', name: 'Criado-Mudo Esq.', room: 'Quarto', x: 0.22, z: 4.48, rotY: 0, color: '#d4b488', visible: true },
    { id: 'night_r', type: 'nightstand', name: 'Criado-Mudo Dir.', room: 'Quarto', x: 2.02, z: 4.48, rotY: 0, color: '#d4b488', visible: true },
    { id: 'wardrobe', type: 'wardrobe', name: 'Guarda-Roupa', room: 'Quarto', x: 0.76, z: 1.92, rotY: 0, color: '#eceae4', visible: true },

    { id: 'sofa', type: 'sofa', name: 'Sofá 3 Lugares', room: 'Sala', x: 4.38, z: 4.26, rotY: -Math.PI / 2, color: '#e2dfd8', visible: true },
    { id: 'rug_living', type: 'rug_living', name: 'Tapete Sala', room: 'Sala', x: 3.55, z: 4.26, rotY: 0, color: '#e3dacb', visible: true },
    { id: 'dining', type: 'dining', name: 'Mesa Jantar + 3 Cadeiras', room: 'Sala', x: 2.75, z: 3.12, rotY: 0, color: '#d5b98e', visible: true },
    { id: 'tv_unit', type: 'tv_unit', name: 'Painel TV + Rack + Puffs', room: 'Sala', x: 2.52, z: 4.42, rotY: 0, color: '#d5b98e', visible: true },

    { id: 'kitchen_counter', type: 'kitchen_counter', name: 'Bancada e Pia Cozinha', room: 'Cozinha', x: 4.50, z: 2.66, rotY: 0, color: '#eae8e3', visible: true },
    { id: 'upper_cabinets', type: 'upper_cabinets', name: 'Armário Aéreo Cozinha', room: 'Cozinha', x: 4.62, z: 2.34, rotY: 0, color: '#eceae4', visible: true },
    { id: 'stove', type: 'stove', name: 'Fogão 4 Bocas', room: 'Cozinha', x: 4.50, z: 1.72, rotY: 0, color: '#cfd4da', visible: true },
    { id: 'fridge', type: 'fridge', name: 'Geladeira', room: 'Cozinha', x: 4.48, z: 1.00, rotY: 0, color: '#cfd4da', visible: true },
    { id: 'washer', type: 'washer', name: 'Máquina de Lavar', room: 'Serviço', x: 2.66, z: 1.18, rotY: 0, color: '#f3f4f6', visible: true },
    { id: 'laundry_sink', type: 'laundry_sink', name: 'Tanque', room: 'Serviço', x: 2.58, z: 0.45, rotY: 0, color: '#f4f4f2', visible: true },

    { id: 'toilet', type: 'toilet', name: 'Vaso Sanitário', room: 'Banheiro', x: 1.24, z: 0.34, rotY: 0, color: '#f7f7f5', visible: true },
    { id: 'vanity', type: 'vanity', name: 'Gabinete Pia + Espelho', room: 'Banheiro', x: 1.88, z: 0.24, rotY: 0, color: '#d4c8b8', visible: true },

    { id: 'curtain_living', type: 'curtain', name: 'Cortina Sala', room: 'Sala', x: 3.58, z: 5.10, rotY: 0, color: '#f4f1ea', visible: true },
    { id: 'curtain_bedroom', type: 'curtain_sm', name: 'Cortina Quarto', room: 'Quarto', x: 1.12, z: 4.66, rotY: 0, color: '#f4f1ea', visible: false }
  ];

  const EXTRA_CATALOG = [
    { type: 'plant', label: '🌿 Planta Vaso', defaultColor: '#c27b56', x: 3.55, z: 4.85 },
    { type: 'floor_lamp', label: '💡 Luminária Piso', defaultColor: '#25272b', x: 4.35, z: 5.00 },
    { type: 'coffee_table', label: '☕ Mesa Centro', defaultColor: '#b88d5d', x: 3.55, z: 4.26 },
    { type: 'armchair', label: '🪑 Poltrona', defaultColor: '#a56e4c', x: 3.50, z: 4.70 },
    { type: 'mirror', label: '🪞 Espelho Corpo', defaultColor: '#25272b', x: 1.85, z: 2.00 },
    { type: 'desk', label: '💻 Escrivaninha', defaultColor: '#c9a97c', x: 0.55, z: 2.75 }
  ];

  const FURNITURE_COLORS = [
    { name: 'Off-White', hex: '#eceae4' },
    { name: 'Linho Bege', hex: '#e2dfd8' },
    { name: 'Carvalho Claro', hex: '#d5b98e' },
    { name: 'Freijó', hex: '#a87443' },
    { name: 'Nogueira', hex: '#5f432c' },
    { name: 'Cinza Claro', hex: '#b6bac0' },
    { name: 'Grafite', hex: '#383c42' },
    { name: 'Preto Fosco', hex: '#1e2024' },
    { name: 'Terracota', hex: '#b56c4e' },
    { name: 'Verde Sálvia', hex: '#6c826e' },
    { name: 'Azul Petróleo', hex: '#3a5568' },
    { name: 'Inox', hex: '#cfd4da' }
  ];

  function createMeshByType(type, color) {
    switch (type) {
      case 'bed': return buildBed(color);
      case 'nightstand': return buildNightstand(color);
      case 'wardrobe': return buildWardrobe(color);
      case 'sofa': return buildSofa(color);
      case 'dining': return buildDiningSet(color);
      case 'tv_unit': return buildTvUnit(color);
      case 'kitchen_counter': return buildKitchenCounter(color);
      case 'upper_cabinets': return buildUpperCabinets(color);
      case 'stove': return buildStove(color);
      case 'fridge': return buildFridge(color);
      case 'washer': return buildWasher(color);
      case 'laundry_sink': return buildLaundrySink(color);
      case 'toilet': return buildToilet(color);
      case 'vanity': return buildBathroomVanity(color);
      case 'rug_bedroom': return buildRug(2.02, 1.66, color);
      case 'rug_living': return buildRug(1.22, 1.78, color);
      case 'curtain': return buildCurtain(1.52, color);
      case 'curtain_sm': return buildCurtain(1.36, color);
      case 'plant': return buildPlant(color);
      case 'floor_lamp': return buildFloorLamp(color);
      case 'coffee_table': return buildCoffeeTable(color);
      case 'armchair': return buildArmchair(color);
      case 'mirror': return buildFullMirror(color);
      case 'desk': return buildDesk(color);
      default: return buildPlant(color);
    }
  }

  return {
    DEFAULT_FURNITURE,
    EXTRA_CATALOG,
    FURNITURE_COLORS,
    createMeshByType
  };
})();
