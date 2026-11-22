/* ============================================================
   app.js — Motor 3D do Apartamento 24 m²
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'apto24_studio_v1';

  /* ----------------------------------------------------------
     DIMENSIONS (metros) — Planta exata de 24 m²
     ---------------------------------------------------------- */
  const H = 2.65;        // Pé-direito total (laje)
  const T_OUT = 0.14;    // Espessura parede externa
  const T_IN = 0.11;     // Espessura parede interna
  const CENTER = new THREE.Vector3(2.41, 0, 2.60);

  /* ----------------------------------------------------------
     DEFAULT STATE
     ---------------------------------------------------------- */
  function createDefaultState() {
    return {
      floors: {
        quarto: { id: 'wood_carvalho', scale: 0.6, finish: 'acetinado' },
        sala: { id: 'wood_carvalho', scale: 0.6, finish: 'acetinado' },
        cozinha: { id: 'porc_offwhite', scale: 0.6, finish: 'acetinado' },
        banheiro: { id: 'porc_offwhite', scale: 0.6, finish: 'acetinado' }
      },
      baseboardColor: '#f3f2ee',
      walls: {
        todas: { color: '#f2efe9', finish: 'pintura' },
        quarto_cab: { color: '#f2efe9', finish: 'pintura' },
        quarto_esq: { color: '#f2efe9', finish: 'pintura' },
        sala_sofa: { color: '#f2efe9', finish: 'pintura' },
        sala_tv: { color: '#f2efe9', finish: 'pintura' },
        cozinha: { color: '#f2efe9', finish: 'metro_branco' },
        banheiro: { color: '#eae8e3', finish: 'calacatta_parede' }
      },
      ceiling: {
        visibility: 'hidden', // Start open so user immediately sees the full 3D floor plan clearly
        style: 'sanca_aberta',
        temp: 3000,
        ledOn: true,
        spotsSocialOn: true,
        spotsWetOn: true,
        intensity: 1.1,
        dropHeight: 0.14,
        color: '#f7f6f2'
      },
      art: {
        sofa: { enabled: true, layout: 3, theme: 'abstrato_bege', frameColor: '#24262a', scale: 1.0, height: 1.56, offset: 0, customUrl: null },
        quarto: { enabled: true, layout: 2, theme: 'botanico', frameColor: '#c5a072', scale: 0.95, height: 1.52, offset: 0, customUrl: null },
        jantar: { enabled: true, layout: 1, theme: 'terracota', frameColor: '#24262a', scale: 0.95, height: 1.54, offset: 0, customUrl: null },
        corredor: { enabled: false, layout: 1, theme: 'line_art', frameColor: '#c5a072', scale: 0.85, height: 1.52, offset: 0, customUrl: null }
      },
      furniture: JSON.parse(JSON.stringify(AppFurniture.DEFAULT_FURNITURE)),
      wallMode: 'cutaway',
      dayMode: true,
      showMeasures: true
    };
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const def = createDefaultState();
        return {
          ...def,
          ...parsed,
          floors: { ...def.floors, ...(parsed.floors || {}) },
          walls: { ...def.walls, ...(parsed.walls || {}) },
          ceiling: { ...def.ceiling, ...(parsed.ceiling || {}) },
          art: { ...def.art, ...(parsed.art || {}) },
          furniture: Array.isArray(parsed.furniture) ? parsed.furniture : def.furniture
        };
      }
    } catch (e) {
      console.warn('Erro ao ler estado salvo:', e);
    }
    return createDefaultState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignore quota errors (e.g., very large custom uploaded image)
    }
  }

  /* ----------------------------------------------------------
     THREE.JS SCENE SETUP
     ---------------------------------------------------------- */
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dfe4eb');

  const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 80);
  camera.position.set(6.8, 6.2, 8.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.copy(CENTER);
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.minDistance = 0.6;
  controls.maxDistance = 18;
  controls.update();

  /* ----------------------------------------------------------
     LIGHTING
     ---------------------------------------------------------- */
  const hemiLight = new THREE.HemisphereLight('#fffdf8', '#b8bec8', 0.72);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight('#fff6e5', 1.15);
  sunLight.position.set(7.5, 11.5, 9.5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 28;
  sunLight.shadow.camera.left = -6;
  sunLight.shadow.camera.right = 6;
  sunLight.shadow.camera.top = 6;
  sunLight.shadow.camera.bottom = -6;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight('#dce8ff', 0.35);
  fillLight.position.set(-5, 6, -4);
  scene.add(fillLight);

  // Subtle architectural ground grid platform under the apartment
  const groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: '#cfd6df', roughness: 0.95 })
  );
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.set(CENTER.x, -0.08, CENTER.z);
  groundPlane.receiveShadow = true;
  scene.add(groundPlane);

  const gridHelper = new THREE.GridHelper(24, 48, '#b6bfc9', '#c4ccd6');
  gridHelper.position.set(CENTER.x, -0.075, CENTER.z);
  scene.add(gridHelper);

  /* ----------------------------------------------------------
     SCENE GROUPS
     ---------------------------------------------------------- */
  const aptGroup = new THREE.Group();
  scene.add(aptGroup);

  const floorsGroup = new THREE.Group();
  const wallsGroup = new THREE.Group();
  const baseboardsGroup = new THREE.Group();
  const fixturesGroup = new THREE.Group();
  const ceilingGroup = new THREE.Group();
  const furnitureGroup = new THREE.Group();
  const artGroup = new THREE.Group();

  aptGroup.add(floorsGroup, wallsGroup, baseboardsGroup, fixturesGroup, ceilingGroup, furnitureGroup, artGroup);

  /* ----------------------------------------------------------
     1. FLOOR ZONES (EXACT 24m² PLAN)
     ---------------------------------------------------------- */
  const FLOOR_ZONES_GEOM = {
    banheiro: [
      { x: 0.0, z: 0.0, w: 2.24, d: 1.52 }
    ],
    quarto: [
      { x: 0.0, z: 1.63, w: 2.35, d: 3.12 }
    ],
    sala: [
      { x: 2.35, z: 1.63, w: 0.95, d: 1.69 },
      { x: 2.35, z: 3.32, w: 2.47, d: 1.88 }
    ],
    cozinha: [
      { x: 2.35, z: 0.0, w: 1.41, d: 1.63 },
      { x: 3.76, z: 0.36, w: 1.06, d: 1.27 },
      { x: 3.30, z: 1.63, w: 1.52, d: 1.69 }
    ]
  };

  // Concrete structural slab under apartment
  function buildSlab() {
    const slabMat = new THREE.MeshStandardMaterial({ color: '#33363d', roughness: 0.9 });
    const addSlab = (x, z, w, d) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), slabMat);
      m.position.set(x + w / 2, -0.036, z + d / 2);
      m.receiveShadow = true;
      aptGroup.add(m);
    };
    addSlab(-T_OUT, -T_OUT, 3.76 + T_OUT * 2, 4.75 + T_OUT * 2);
    addSlab(3.76 - T_OUT, 0.36 - T_OUT, 1.06 + T_OUT * 2, 4.84 + T_OUT * 2);
    addSlab(2.24 - T_OUT, 4.75 - T_OUT, 2.58 + T_OUT * 2, 0.45 + T_OUT * 2);
  }
  buildSlab();

  function rebuildFloors() {
    clearGroup(floorsGroup);

    Object.entries(FLOOR_ZONES_GEOM).forEach(([zoneKey, rects]) => {
      const cfg = state.floors[zoneKey];
      const item = AppTextures.FLOOR_CATALOG.find((f) => f.id === cfg.id) || AppTextures.FLOOR_CATALOG[0];
      const roughness =
        cfg.finish === 'polido' ? 0.16 :
        cfg.finish === 'acetinado' ? 0.42 : 0.78;
      const metalness = cfg.finish === 'polido' ? 0.08 : 0.02;

      rects.forEach((r) => {
        // Real-world UV scaling
        const unitSize = item.category === 'porcelanato' ? (cfg.scale || 0.6) : 1.1;
        const repX = r.w / unitSize;
        const repY = r.d / unitSize;

        const tex = AppTextures.getFloorTexture(cfg.id, repX, repY);
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness,
          metalness
        });

        const geo = new THREE.PlaneGeometry(r.w, r.d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(r.x + r.w / 2, 0.002, r.z + r.d / 2);
        mesh.receiveShadow = true;
        mesh.userData.floorZone = zoneKey;
        floorsGroup.add(mesh);
      });
    });

    // Entrance marble threshold (Soleira da porta de entrada)
    const soleira = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.012, 0.18),
      new THREE.MeshStandardMaterial({ color: '#e8e6e0', roughness: 0.25 })
    );
    soleira.position.set(3.34, 0.006, -0.04);
    soleira.receiveShadow = true;
    floorsGroup.add(soleira);

    // Bathroom door threshold
    const soleiraBanh = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.012, 0.14),
      new THREE.MeshStandardMaterial({ color: '#dedbd4', roughness: 0.28 })
    );
    soleiraBanh.position.set(1.88, 0.006, 1.575);
    soleiraBanh.receiveShadow = true;
    floorsGroup.add(soleiraBanh);
  }

  /* ----------------------------------------------------------
     2. WALLS, SHAFTS, WINDOWS, DOORS & ACCENT FINISHES
     ---------------------------------------------------------- */
  // Track cutaway groups by facing direction ('N', 'S', 'E', 'W')
  const cutawayWallGroups = { N: [], S: [], E: [], W: [] };
  const wallAccentMeshes = {}; // targetKey -> array of meshes

  function buildWallSegment(parent, x1, z1, x2, z2, thickness, yBottom, yTop, mat, cutawayDir) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const h = yTop - yBottom;
    if (len < 0.001 || h < 0.001) return null;

    const geo = new THREE.BoxGeometry(len, h, thickness);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((x1 + x2) / 2, yBottom + h / 2, (z1 + z2) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    if (cutawayDir) {
      cutawayWallGroups[cutawayDir].push({ mesh, yBottom, yTop });
    }
    return mesh;
  }

  function addAccentFace(parent, targetKey, w, h, x, y, z, rotY, cutawayDir) {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshStandardMaterial({ color: '#f2efe9', roughness: 0.85, side: THREE.FrontSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    mesh.receiveShadow = true;
    mesh.userData = { targetKey, w, h };
    parent.add(mesh);

    if (!wallAccentMeshes[targetKey]) wallAccentMeshes[targetKey] = [];
    wallAccentMeshes[targetKey].push(mesh);

    if (cutawayDir) {
      cutawayWallGroups[cutawayDir].push({ mesh, yBottom: y - h / 2, yTop: y + h / 2, isPlane: true });
    }
    return mesh;
  }

  function buildArchitecture() {
    clearGroup(wallsGroup);
    clearGroup(fixturesGroup);
    cutawayWallGroups.N = [];
    cutawayWallGroups.S = [];
    cutawayWallGroups.E = [];
    cutawayWallGroups.W = [];
    Object.keys(wallAccentMeshes).forEach((k) => delete wallAccentMeshes[k]);

    const outerMat = new THREE.MeshStandardMaterial({ color: '#3b3e45', roughness: 0.82 });
    const baseWallMat = new THREE.MeshStandardMaterial({ color: state.walls.todas.color, roughness: 0.85 });

    // Helper for wall with top cap look (outer structural color)
    const wall = (x1, z1, x2, z2, thick, yb, yt, dir, isOuter = true) =>
      buildWallSegment(wallsGroup, x1, z1, x2, z2, thick, yb, yt, isOuter ? outerMat : baseWallMat, dir);

    // --- OUTER PERIMETER WALLS ---
    // West wall (x = -T_OUT/2, z: -T_OUT .. 4.75 + T_OUT)
    wall(-T_OUT / 2, -T_OUT, -T_OUT / 2, 4.75 + T_OUT, T_OUT, 0, H, 'W');

    // North wall (left + laundry up to entrance x=2.95)
    wall(0, -T_OUT / 2, 2.95, -T_OUT / 2, T_OUT, 0, H, 'N');
    // Header above Entrance Door (x=2.95 .. 3.74, y=2.12 .. H)
    wall(2.95, -T_OUT / 2, 3.74, -T_OUT / 2, T_OUT, 2.12, H, 'N');
    // Small pillar right of entrance + jog South to z=0.36
    wall(3.74, -T_OUT / 2, 3.76 + T_OUT / 2, -T_OUT / 2, T_OUT, 0, H, 'N');
    wall(3.76 + T_OUT / 2, -T_OUT / 2, 3.76 + T_OUT / 2, 0.36, T_OUT, 0, H, 'N');
    // North-east step wall (x: 3.76 .. 4.82 + T_OUT, z = 0.36 - T_OUT/2)
    wall(3.76, 0.36 - T_OUT / 2, 4.82 + T_OUT, 0.36 - T_OUT / 2, T_OUT, 0, H, 'N');

    // East wall (x = 4.82 + T_OUT/2, z: 0.36 .. 5.20 + T_OUT)
    wall(4.82 + T_OUT / 2, 0.36 - T_OUT, 4.82 + T_OUT / 2, 5.20 + T_OUT, T_OUT, 0, H, 'E');

    // South wall — Living Room (z = 5.20 + T_OUT/2, x: 2.24 .. 4.82)
    // Window opening: x = 2.90 .. 4.26, y = 0.90 .. 2.20
    wall(2.24 - T_OUT, 5.20 + T_OUT / 2, 2.90, 5.20 + T_OUT / 2, T_OUT, 0, H, 'S');
    wall(4.26, 5.20 + T_OUT / 2, 4.82 + T_OUT, 5.20 + T_OUT / 2, T_OUT, 0, H, 'S');
    wall(2.90, 5.20 + T_OUT / 2, 4.26, 5.20 + T_OUT / 2, T_OUT, 0, 0.90, 'S');
    wall(2.90, 5.20 + T_OUT / 2, 4.26, 5.20 + T_OUT / 2, T_OUT, 2.20, H, 'S');

    // Jog wall between Living Room South and Bedroom South (x = 2.24 - T_OUT/2, z: 4.75 .. 5.20)
    wall(2.24 - T_OUT / 2, 4.75, 2.24 - T_OUT / 2, 5.20 + T_OUT, T_OUT, 0, H, 'S');

    // South wall — Bedroom (z = 4.75 + T_OUT/2, x: 0 .. 2.24)
    // Window opening: x = 0.48 .. 1.76, y = 0.98 .. 2.15
    wall(-T_OUT, 4.75 + T_OUT / 2, 0.48, 4.75 + T_OUT / 2, T_OUT, 0, H, 'S');
    wall(1.76, 4.75 + T_OUT / 2, 2.24, 4.75 + T_OUT / 2, T_OUT, 0, H, 'S');
    wall(0.48, 4.75 + T_OUT / 2, 1.76, 4.75 + T_OUT / 2, T_OUT, 0, 0.98, 'S');
    wall(0.48, 4.75 + T_OUT / 2, 1.76, 4.75 + T_OUT / 2, T_OUT, 2.15, H, 'S');

    // --- SHAFTS (Caixas X da planta) ---
    const shaftMat = new THREE.MeshStandardMaterial({ color: '#454850', roughness: 0.85 });
    const shaft1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, H, 0.28), shaftMat);
    shaft1.position.set(0.425, H / 2, 0.14);
    shaft1.castShadow = true;
    shaft1.receiveShadow = true;
    wallsGroup.add(shaft1);
    cutawayWallGroups.N.push({ mesh: shaft1, yBottom: 0, yTop: H });

    const shaft2 = new THREE.Mesh(new THREE.BoxGeometry(0.64, H, 0.28), shaftMat);
    shaft2.position.set(4.50, H / 2, 0.50);
    shaft2.castShadow = true;
    shaft2.receiveShadow = true;
    wallsGroup.add(shaft2);
    cutawayWallGroups.N.push({ mesh: shaft2, yBottom: 0, yTop: H });

    // --- INTERIOR PARTITION WALLS ---
    // Bathroom East Wall (x = 2.295, z: 0 .. 1.63)
    wall(2.295, 0, 2.295, 1.63, T_IN, 0, H, null, false);
    // Bathroom South Wall (z = 1.575, x: 0 .. 1.52 solid, 1.52..2.24 door header y=2.12..H)
    wall(0, 1.575, 1.52, 1.575, T_IN, 0, H, null, false);
    wall(1.52, 1.575, 2.24, 1.575, T_IN, 2.12, H, null, false);
    // Center Dividing Wall between Bedroom & Dining/Living (x = 2.295, z: 2.48 .. 5.20)
    wall(2.295, 2.48, 2.295, 5.20, T_IN, 0, H, null, false);

    // --- INTERIOR PAINTABLE / CUSTOMIZABLE WALL FACES ---
    const eps = 0.004;

    // 1. Parede Esquerda do Quarto (facing +X)
    addAccentFace(wallsGroup, 'quarto_esq', 3.12, H, eps, H / 2, 1.63 + 1.56, Math.PI / 2, 'W');

    // 2. Parede Cabeceira do Quarto (South bedroom wall, facing -Z)
    addAccentFace(wallsGroup, 'quarto_cab', 0.48, H, 0.24, H / 2, 4.75 - eps, Math.PI, 'S');
    addAccentFace(wallsGroup, 'quarto_cab', 0.48, H, 2.00, H / 2, 4.75 - eps, Math.PI, 'S');
    addAccentFace(wallsGroup, 'quarto_cab', 1.28, 0.98, 1.12, 0.49, 4.75 - eps, Math.PI, 'S');
    addAccentFace(wallsGroup, 'quarto_cab', 1.28, H - 2.15, 1.12, 2.15 + (H - 2.15) / 2, 4.75 - eps, Math.PI, 'S');

    // Quarto interior walls (wardrobe back & bedroom side of divider) -> 'todas'
    addAccentFace(wallsGroup, 'todas', 1.52, H, 0.76, H / 2, 1.63 + eps, 0, null);
    addAccentFace(wallsGroup, 'todas', 2.27, H, 2.24 - eps, H / 2, 2.48 + 1.135, -Math.PI / 2, null);

    // 3. Parede TV / Divisória (Sala side of center divider, facing +X)
    addAccentFace(wallsGroup, 'sala_tv', 2.72, H, 2.35 + eps, H / 2, 2.48 + 1.36, Math.PI / 2, null);

    // 4. Parede do Sofá (East wall living room section z=3.32..5.20, facing -X)
    addAccentFace(wallsGroup, 'sala_sofa', 1.88, H, 4.82 - eps, H / 2, 3.32 + 0.94, -Math.PI / 2, 'E');

    // Sala South wall (around window) -> 'todas'
    addAccentFace(wallsGroup, 'todas', 0.55, H, 2.625, H / 2, 5.20 - eps, Math.PI, 'S');
    addAccentFace(wallsGroup, 'todas', 0.56, H, 4.54, H / 2, 5.20 - eps, Math.PI, 'S');
    addAccentFace(wallsGroup, 'todas', 1.36, 0.90, 3.58, 0.45, 5.20 - eps, Math.PI, 'S');
    addAccentFace(wallsGroup, 'todas', 1.36, H - 2.20, 3.58, 2.20 + (H - 2.20) / 2, 5.20 - eps, Math.PI, 'S');

    // 5. Frontão / Parede Cozinha (East wall kitchen section z=0.64..3.32, facing -X + laundry wall)
    addAccentFace(wallsGroup, 'cozinha', 2.68, H, 4.82 - eps, H / 2, 0.64 + 1.34, -Math.PI / 2, 'E');
    addAccentFace(wallsGroup, 'cozinha', 1.63, H, 2.35 + eps, H / 2, 0.815, Math.PI / 2, null);
    addAccentFace(wallsGroup, 'todas', 0.60, H, 2.65, H / 2, eps, 0, 'N');
    addAccentFace(wallsGroup, 'todas', 0.42, H, 3.97, H / 2, 0.36 + eps, 0, 'N');

    // 6. Paredes do Banheiro (all 4 inner faces)
    addAccentFace(wallsGroup, 'banheiro', 1.39, H, 0.85 + 0.695, H / 2, eps, 0, 'N');
    addAccentFace(wallsGroup, 'banheiro', 0.85, H, 0.425, H / 2, 0.28 + eps, 0, 'N');
    addAccentFace(wallsGroup, 'banheiro', 1.24, H, eps, H / 2, 0.28 + 0.62, Math.PI / 2, 'W');
    addAccentFace(wallsGroup, 'banheiro', 1.52, H, 2.24 - eps, H / 2, 0.76, -Math.PI / 2, null);
    addAccentFace(wallsGroup, 'banheiro', 1.52, H, 0.76, H / 2, 1.52 - eps, Math.PI, null);

    // --- WINDOWS, DOORS & SHOWER BOX ---
    buildWindowsAndDoors();
    buildBaseboards();
    applyWallMaterials();
  }

  function buildWindowsAndDoors() {
    const frameMat = new THREE.MeshStandardMaterial({ color: '#2b2e34', roughness: 0.35, metalness: 0.55 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#b9d6e8',
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.32
    });
    const doorWoodMat = new THREE.MeshStandardMaterial({ color: '#d7c3a5', roughness: 0.55 });
    const handleMat = new THREE.MeshStandardMaterial({ color: '#1f2124', roughness: 0.3, metalness: 0.8 });

    // Helper for sliding window
    function addWindow(cx, cz, w, yBot, yTop, dir) {
      const wg = new THREE.Group();
      const wh = yTop - yBot;
      const cy = yBot + wh / 2;

      // Outer frame
      const fTop = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, 0.08), frameMat);
      fTop.position.set(cx, yTop - 0.02, cz);
      const fBot = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, 0.08), frameMat);
      fBot.position.set(cx, yBot + 0.02, cz);
      const fMid = new THREE.Mesh(new THREE.BoxGeometry(0.03, wh, 0.06), frameMat);
      fMid.position.set(cx, cy, cz);
      const pane = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, wh - 0.04, 0.015), glassMat);
      pane.position.set(cx, cy, cz);

      wg.add(fTop, fBot, fMid, pane);
      fixturesGroup.add(wg);
      if (dir) {
        cutawayWallGroups[dir].push({ mesh: wg, yBottom: yBot, yTop: yTop, isWindowGroup: true });
      }
    }

    // Bedroom South Window & Living Room South Window
    addWindow(1.12, 4.75 + T_OUT / 2, 1.28, 0.98, 2.15, 'S');
    addWindow(3.58, 5.20 + T_OUT / 2, 1.36, 0.90, 2.20, 'S');

    // Entrance Door (North wall x = 2.95..3.74)
    const entDoor = new THREE.Group();
    const entLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.76, 2.10, 0.045), doorWoodMat);
    entLeaf.position.set(3.345, 1.05, -0.04);
    entLeaf.castShadow = true;
    const entHandle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.09), handleMat);
    entHandle.position.set(3.64, 1.02, -0.02);
    entDoor.add(entLeaf, entHandle);
    fixturesGroup.add(entDoor);
    cutawayWallGroups.N.push({ mesh: entDoor, yBottom: 0, yTop: 2.12, isWindowGroup: true });

    // Bathroom Sliding Door (Porta de correr em madeira clara)
    const bathDoor = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.10, 0.035), doorWoodMat);
    bathDoor.position.set(1.88, 1.05, 1.615);
    bathDoor.castShadow = true;
    fixturesGroup.add(bathDoor);

    const bathRail = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.05, 0.04), frameMat);
    bathRail.position.set(1.62, 2.14, 1.64);
    fixturesGroup.add(bathRail);

    // Bathroom Shower Glass Box (x = 0.85, z: 0.28..1.52)
    const showerGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 1.98, 1.22),
      new THREE.MeshStandardMaterial({
        color: '#d4e8ec',
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.34
      })
    );
    showerGlass.position.set(0.85, 0.99, 0.90);
    fixturesGroup.add(showerGlass);

    const showerRail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 1.24), frameMat);
    showerRail.position.set(0.85, 1.99, 0.90);
    fixturesGroup.add(showerRail);

    // Shower head + Chrome arm + Floor drain
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#d0d5db', roughness: 0.2, metalness: 0.9 });
    const shArm = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.28), chromeMat);
    shArm.position.set(0.42, 2.14, 0.42);
    const shHead = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.025, 18), chromeMat);
    shHead.position.set(0.42, 2.10, 0.54);
    const drain = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.008, 0.14), chromeMat);
    drain.position.set(0.42, 0.006, 0.82);
    fixturesGroup.add(shArm, shHead, drain);
  }

  function buildBaseboards() {
    clearGroup(baseboardsGroup);
    const bbMat = new THREE.MeshStandardMaterial({ color: state.baseboardColor, roughness: 0.55 });
    const bh = 0.085;
    const bt = 0.015;

    const addBB = (x1, z1, x2, z2) => {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, bh, bt), bbMat);
      m.position.set((x1 + x2) / 2, bh / 2, (z1 + z2) / 2);
      m.rotation.y = -Math.atan2(dz, dx);
      baseboardsGroup.add(m);
    };

    // Bedroom baseboards
    addBB(0.01, 1.64, 0.01, 4.74);
    addBB(0.01, 4.74, 2.23, 4.74);
    addBB(2.23, 2.48, 2.23, 4.74);
    // Living room baseboards
    addBB(2.36, 2.48, 2.36, 5.19);
    addBB(2.36, 5.19, 4.81, 5.19);
    addBB(4.81, 3.32, 4.81, 5.19);
  }

  function applyWallMaterials() {
    Object.entries(wallAccentMeshes).forEach(([targetKey, meshes]) => {
      const cfg = state.walls[targetKey] || state.walls.todas;
      meshes.forEach((mesh) => {
        const { w, h } = mesh.userData;
        if (cfg.finish === 'pintura') {
          mesh.material.map = null;
          mesh.material.color.set(cfg.color);
          mesh.material.roughness = 0.86;
          mesh.material.needsUpdate = true;
        } else {
          const repX = cfg.finish.startsWith('ripado') ? Math.max(1, w * 1.1) :
                       cfg.finish === 'metro_branco' ? Math.max(1, w * 1.3) :
                       cfg.finish === 'calacatta_parede' ? Math.max(1, w / 0.8) :
                       cfg.finish === 'boiserie' ? Math.max(1, Math.round(w / 0.95)) : w / 1.5;
          const repY = cfg.finish === 'metro_branco' ? h * 1.3 :
                       cfg.finish === 'calacatta_parede' ? h / 0.8 :
                       cfg.finish === 'boiserie' ? 1 : h / 1.5;

          const tex = AppTextures.getWallFinishTexture(cfg.finish, cfg.color, repX, repY);
          mesh.material.map = tex;
          mesh.material.color.set('#ffffff');
          mesh.material.roughness =
            cfg.finish === 'metro_branco' || cfg.finish === 'calacatta_parede' ? 0.28 :
            cfg.finish.startsWith('ripado') ? 0.62 : 0.82;
          mesh.material.needsUpdate = true;
        }
      });
    });
  }

  /* ----------------------------------------------------------
     3. DROPPED CEILING & LIGHTING (PROJETO DE TETO REBAIXADO)
     ---------------------------------------------------------- */
  function getKelvinHex(temp) {
    if (temp <= 3000) return '#ffc578';
    if (temp <= 4000) return '#ffeed2';
    return '#ddecff';
  }

  function rebuildCeiling() {
    clearGroup(ceilingGroup);

    const cfg = state.ceiling;
    const vis = cfg.visibility;
    const drop = cfg.dropHeight || 0.14;
    const ySlab = H;
    const yDrop = H - drop;
    const isSemi = vis === 'semi';

    const gypsumMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      roughness: 0.88,
      transparent: isSemi,
      opacity: isSemi ? 0.42 : 1.0,
      side: THREE.DoubleSide
    });

    const recessMat = new THREE.MeshStandardMaterial({
      color: '#eae8e2',
      roughness: 0.9,
      transparent: isSemi,
      opacity: isSemi ? 0.32 : 1.0,
      side: THREE.DoubleSide
    });

    const ledColorHex = getKelvinHex(cfg.temp);
    const ledMat = new THREE.MeshBasicMaterial({
      color: cfg.ledOn ? ledColorHex : '#484b52'
    });
    const spotTrimMat = new THREE.MeshStandardMaterial({ color: '#24262b', roughness: 0.4, metalness: 0.5 });
    const spotBulbMat = new THREE.MeshBasicMaterial({ color: ledColorHex });

    // Helper: add gypsum box
    const addGyp = (x, z, w, d, yBot, hThick, mat = gypsumMat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, hThick, d), mat);
      m.position.set(x + w / 2, yBot + hThick / 2, z + d / 2);
      m.receiveShadow = true;
      ceilingGroup.add(m);
      return m;
    };

    // Helper: add recessed spotlight fixture
    const addSpot = (x, z, y, isWet) => {
      const on = isWet ? cfg.spotsWetOn : cfg.spotsSocialOn;
      const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 16), spotTrimMat);
      trim.position.set(x, y - 0.004, z);
      const bulb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.036, 0.014, 16),
        on ? spotBulbMat : new THREE.MeshBasicMaterial({ color: '#45484f' })
      );
      bulb.position.set(x, y - 0.006, z);
      ceilingGroup.add(trim, bulb);
    };

    // Helper: add LED strip bar
    const addLedBar = (x, z, w, d, y) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.014, d), ledMat);
      bar.position.set(x + w / 2, y, z + d / 2);
      ceilingGroup.add(bar);
    };

    // Always build real room PointLights (so lighting works even when ceiling is hidden in Night Mode!)
    const lightInt = cfg.intensity * (state.dayMode ? 0.35 : 0.95);
    const addRoomLight = (x, z, y, dist, mult = 1, active = true) => {
      if (!active || lightInt <= 0.01) return;
      const pl = new THREE.PointLight(ledColorHex, lightInt * mult, dist, 1.6);
      pl.position.set(x, y, z);
      ceilingGroup.add(pl);
    };

    // Base illumination per zone
    const anySocial = cfg.spotsSocialOn || cfg.ledOn;
    addRoomLight(1.12, 3.25, yDrop - 0.12, 5.2, 0.95, anySocial);  // Quarto
    addRoomLight(3.58, 4.15, yDrop - 0.12, 5.5, 1.05, anySocial);  // Sala
    addRoomLight(3.65, 1.85, yDrop - 0.12, 4.8, 0.85, cfg.spotsWetOn || cfg.ledOn); // Cozinha
    addRoomLight(1.25, 0.85, yDrop - 0.12, 3.5, 0.70, cfg.spotsWetOn); // Banheiro

    if (vis === 'hidden') return;

    // Upper structural slab closing the top (so interior views are sealed)
    addGyp(0, 0, 3.76, 4.75, ySlab, 0.04, recessMat);
    addGyp(3.76, 0.36, 1.06, 4.84, ySlab, 0.04, recessMat);
    addGyp(2.24, 4.75, 2.58, 0.45, ySlab, 0.04, recessMat);

    const style = cfg.style;

    if (style === 'laje') {
      // Simple flat ceiling + 4 plafons
      [[1.12, 3.30, false], [3.58, 4.10, false], [3.65, 1.75, true], [1.25, 0.85, true]].forEach(([px, pz, wet]) => {
        const on = wet ? cfg.spotsWetOn : cfg.spotsSocialOn;
        const plaf = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.035, 0.32),
          on ? spotBulbMat : new THREE.MeshStandardMaterial({ color: '#ccc' })
        );
        plaf.position.set(px, ySlab - 0.02, pz);
        ceilingGroup.add(plaf);
      });
    } else if (style === 'tabica') {
      // Dropped gypsum with 3.5cm shadow gap (tabica)
      const g = 0.035;
      addGyp(g, 1.63 + g, 2.24 - g * 2, 3.12 - g * 2, yDrop, 0.04); // Quarto
      addGyp(2.35 + g, 0.04, 1.38 - g, 1.58, yDrop, 0.04);          // Entrada/Serv
      addGyp(3.76, 0.36 + g, 1.06 - g, 1.26, yDrop, 0.04);          // Coz topo
      addGyp(2.35 + g, 1.62, 2.47 - g * 2, 3.58 - g, yDrop, 0.04);  // Sala/Coz
      addGyp(g, g, 2.24 - g * 2, 1.52 - g * 2, yDrop, 0.04);        // Banheiro

      // Recessed spots
      [[0.65, 2.55], [1.65, 2.55], [0.65, 3.95], [1.65, 3.95]].forEach(([x, z]) => addSpot(x, z, yDrop, false));
      [[2.95, 3.15], [4.15, 3.15], [2.95, 4.45], [4.15, 4.45]].forEach(([x, z]) => addSpot(x, z, yDrop, false));
      [[3.45, 0.95], [4.05, 1.85], [4.05, 2.65]].forEach(([x, z]) => addSpot(x, z, yDrop, true));
      [[0.45, 0.85], [1.65, 0.85]].forEach(([x, z]) => addSpot(x, z, yDrop, true));
    } else if (style === 'sanca_aberta') {
      // Perimeter dropped border (0.36m wide) creating recessed cove in Quarto & Sala with glowing LED strip!
      const b = 0.36;
      const hB = drop;

      // QUARTO perimeter sanca (x: 0..2.24, z: 1.63..4.75)
      addGyp(0, 1.63, 2.24, b, yDrop, hB);
      addGyp(0, 4.75 - b, 2.24, b, yDrop, hB);
      addGyp(0, 1.63 + b, b, 3.12 - b * 2, yDrop, hB);
      addGyp(2.24 - b, 1.63 + b, b, 3.12 - b * 2, yDrop, hB);
      // Quarto LED cove inner rectangle
      addLedBar(b, 1.63 + b, 2.24 - b * 2, 0.025, yDrop + 0.03);
      addLedBar(b, 4.75 - b - 0.025, 2.24 - b * 2, 0.025, yDrop + 0.03);
      addLedBar(b, 1.63 + b, 0.025, 3.12 - b * 2, yDrop + 0.03);
      addLedBar(2.24 - b - 0.025, 1.63 + b, 0.025, 3.12 - b * 2, yDrop + 0.03);

      // SALA perimeter sanca (x: 2.35..4.82, z: 2.48..5.20)
      addGyp(2.35, 2.48, 2.47, b, yDrop, hB);
      addGyp(2.35, 5.20 - b, 2.47, b, yDrop, hB);
      addGyp(2.35, 2.48 + b, b, 2.72 - b * 2, yDrop, hB);
      addGyp(4.82 - b, 2.48 + b, b, 2.72 - b * 2, yDrop, hB);
      // Sala LED cove inner rectangle
      addLedBar(2.35 + b, 2.48 + b, 2.47 - b * 2, 0.025, yDrop + 0.03);
      addLedBar(2.35 + b, 5.20 - b - 0.025, 2.47 - b * 2, 0.025, yDrop + 0.03);
      addLedBar(2.35 + b, 2.48 + b, 0.025, 2.72 - b * 2, yDrop + 0.03);
      addLedBar(4.82 - b - 0.025, 2.48 + b, 0.025, 2.72 - b * 2, yDrop + 0.03);

      // Flat dropped ceiling over Kitchen, Hallway & Bathroom (filled to ySlab for seamless transition)
      addGyp(2.24, 0, 1.52, 2.48, yDrop, hB);
      addGyp(3.76, 0.36, 1.06, 2.12, yDrop, hB);
      addGyp(0, 0, 2.24, 1.63, yDrop, hB);

      // Warm indirect cove glow lights inside the recessed sanca
      if (cfg.ledOn && !state.dayMode) {
        const coveGlow = new THREE.PointLight(ledColorHex, cfg.intensity * 0.9, 3.8, 1.8);
        coveGlow.position.set(3.58, yDrop + 0.08, 3.84);
        ceilingGroup.add(coveGlow);
        const coveGlowQ = new THREE.PointLight(ledColorHex, cfg.intensity * 0.85, 3.6, 1.8);
        coveGlowQ.position.set(1.12, yDrop + 0.08, 3.19);
        ceilingGroup.add(coveGlowQ);
      }

      // Spots in perimeter border + kitchen + bathroom
      [[0.18, 2.25], [0.18, 3.85], [2.05, 2.25], [2.05, 3.85]].forEach(([x, z]) => addSpot(x, z, yDrop, false));
      [[2.53, 3.20], [2.53, 4.45], [4.62, 3.20], [4.62, 4.45]].forEach(([x, z]) => addSpot(x, z, yDrop, false));
      [[3.45, 0.95], [4.10, 1.80], [3.55, 2.10]].forEach(([x, z]) => addSpot(x, z, yDrop, true));
      [[0.45, 0.85], [1.65, 0.85]].forEach(([x, z]) => addSpot(x, z, yDrop, true));
    } else if (style === 'sanca_ilha') {
      // Floating central gypsum islands with indirect LED glow all around their edges!
      const m = 0.24;
      // Quarto floating island
      addGyp(m, 1.63 + m, 2.24 - m * 2, 3.12 - m * 2, yDrop, 0.06);
      addLedBar(m - 0.02, 1.63 + m, 2.24 - m * 2 + 0.04, 0.02, yDrop + 0.04);
      addLedBar(m - 0.02, 4.75 - m - 0.02, 2.24 - m * 2 + 0.04, 0.02, yDrop + 0.04);
      addLedBar(m - 0.02, 1.63 + m, 0.02, 3.12 - m * 2, yDrop + 0.04);
      addLedBar(2.24 - m, 1.63 + m, 0.02, 3.12 - m * 2, yDrop + 0.04);

      // Sala floating island
      addGyp(2.35 + m, 2.48 + m, 2.47 - m * 2, 2.72 - m * 2, yDrop, 0.06);
      addLedBar(2.35 + m - 0.02, 2.48 + m, 2.47 - m * 2 + 0.04, 0.02, yDrop + 0.04);
      addLedBar(2.35 + m - 0.02, 5.20 - m - 0.02, 2.47 - m * 2 + 0.04, 0.02, yDrop + 0.04);
      addLedBar(2.35 + m - 0.02, 2.48 + m, 0.02, 2.72 - m * 2, yDrop + 0.04);
      addLedBar(4.82 - m, 2.48 + m, 0.02, 2.72 - m * 2, yDrop + 0.04);

      // Flat ceiling kitchen & bathroom
      addGyp(2.35, 0, 1.41, 2.48, yDrop, 0.04);
      addGyp(3.76, 0.36, 1.06, 2.12, yDrop, 0.04);
      addGyp(0, 0, 2.24, 1.52, yDrop, 0.04);

      [[0.70, 2.65], [1.55, 2.65], [0.70, 3.90], [1.55, 3.90]].forEach(([x, z]) => addSpot(x, z, yDrop, false));
      [[3.10, 3.25], [4.05, 3.25], [3.10, 4.45], [4.05, 4.45]].forEach(([x, z]) => addSpot(x, z, yDrop, false));
      [[3.50, 1.05], [4.05, 1.95]].forEach(([x, z]) => addSpot(x, z, yDrop, true));
      [[0.45, 0.85], [1.65, 0.85]].forEach(([x, z]) => addSpot(x, z, yDrop, true));
    } else if (style === 'perfil_led') {
      // Smooth tabica ceiling with sleek recessed architectural LED linear profiles!
      const g = 0.03;
      addGyp(g, 1.63 + g, 2.24 - g * 2, 3.12 - g * 2, yDrop, 0.04);
      addGyp(2.35 + g, 0.03, 1.39, 1.60, yDrop, 0.04);
      addGyp(3.76, 0.36 + g, 1.06 - g, 1.27, yDrop, 0.04);
      addGyp(2.35 + g, 1.62, 2.47 - g * 2, 3.58 - g, yDrop, 0.04);
      addGyp(g, g, 2.24 - g * 2, 1.52 - g * 2, yDrop, 0.04);

      // Flush linear LED profiles
      addLedBar(1.08, 2.10, 0.045, 2.15, yDrop - 0.005); // Quarto central linear
      addLedBar(3.52, 0.65, 0.045, 4.10, yDrop - 0.005); // Cozinha -> Sala spine linear
      addLedBar(2.65, 3.15, 1.75, 0.045, yDrop - 0.005); // Cross bar over dining
      addLedBar(0.35, 0.82, 1.50, 0.04, yDrop - 0.005);  // Banheiro linear

      // Accent spots
      [[0.45, 4.35], [1.80, 4.35], [2.80, 4.45], [4.30, 4.45]].forEach(([x, z]) => addSpot(x, z, yDrop, false));
    } else if (style === 'trilho') {
      // Tabica + Modern Black Electrified Tracks (Trilhos Eletrificados)
      const g = 0.035;
      addGyp(g, 1.63 + g, 2.24 - g * 2, 3.12 - g * 2, yDrop, 0.04);
      addGyp(2.35 + g, 0.04, 1.38, 1.58, yDrop, 0.04);
      addGyp(3.76, 0.36 + g, 1.06 - g, 1.26, yDrop, 0.04);
      addGyp(2.35 + g, 1.62, 2.47 - g * 2, 3.58 - g, yDrop, 0.04);
      addGyp(g, g, 2.24 - g * 2, 1.52 - g * 2, yDrop, 0.04);

      const railMat = new THREE.MeshStandardMaterial({ color: '#1b1d21', roughness: 0.35, metalness: 0.7 });
      const addTrack = (x, z, len, alongZ, count, isWet) => {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(alongZ ? 0.035 : len, 0.025, alongZ ? len : 0.035),
          railMat
        );
        rail.position.set(x, yDrop - 0.015, z);
        ceilingGroup.add(rail);

        const on = isWet ? cfg.spotsWetOn : cfg.spotsSocialOn;
        for (let i = 0; i < count; i++) {
          const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * (len - 0.22);
          const cx = alongZ ? x : x + t;
          const cz = alongZ ? z + t : z;
          const can = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.09, 14), railMat);
          can.position.set(cx, yDrop - 0.075, cz);
          can.rotation.z = (i % 2 === 0 ? 0.35 : -0.35);
          const lens = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.01, 12),
            on ? spotBulbMat : new THREE.MeshBasicMaterial({ color: '#333' })
          );
          lens.position.set(cx, yDrop - 0.118, cz);
          ceilingGroup.add(can, lens);
        }
      };

      addTrack(3.60, 4.10, 1.80, true, 4, false); // Sala
      addTrack(3.75, 1.75, 1.60, true, 3, true);  // Cozinha
      addTrack(1.12, 3.30, 1.40, false, 3, false); // Quarto
      [[0.45, 0.85], [1.65, 0.85]].forEach(([x, z]) => addSpot(x, z, yDrop, true));
    }
  }

  /* ----------------------------------------------------------
     4. WALL ART / QUADROS
     ---------------------------------------------------------- */
  const ART_WALL_ANCHORS = {
    sofa:     { x: 4.805, z: 4.26, rotY: -Math.PI / 2, axis: 'z', cutawayDir: 'E' },
    quarto:   { x: 0.015, z: 3.45, rotY:  Math.PI / 2, axis: 'z', cutawayDir: 'W' },
    jantar:   { x: 2.365, z: 3.12, rotY:  Math.PI / 2, axis: 'z', cutawayDir: null },
    corredor: { x: 0.015, z: 2.38, rotY:  Math.PI / 2, axis: 'z', cutawayDir: 'W' }
  };

  const customArtTextures = {};

  function rebuildArt() {
    clearGroup(artGroup);

    Object.entries(ART_WALL_ANCHORS).forEach(([wallKey, anchor]) => {
      const cfg = state.art[wallKey];
      if (!cfg || !cfg.enabled) return;

      const count = cfg.layout || 1;
      const frameW = (count === 1 ? 0.62 : count === 2 ? 0.44 : 0.36) * (cfg.scale || 1);
      const frameH = frameW * 1.32;
      const gap = 0.06 * (cfg.scale || 1);
      const totalSpan = count * frameW + (count - 1) * gap;

      const frameMat = new THREE.MeshStandardMaterial({ color: cfg.frameColor || '#24262a', roughness: 0.45 });
      const group = new THREE.Group();

      for (let i = 0; i < count; i++) {
        const localX = -totalSpan / 2 + frameW / 2 + i * (frameW + gap) + (cfg.offset || 0);
        const fGroup = new THREE.Group();

        // Frame outer backing
        const frameBox = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, 0.022), frameMat);
        frameBox.castShadow = true;
        fGroup.add(frameBox);

        // Art canvas texture
        let tex;
        if (cfg.customUrl && customArtTextures[wallKey]) {
          tex = customArtTextures[wallKey];
        } else {
          tex = AppTextures.getArtTexture(cfg.theme || 'abstrato_bege', i);
        }

        const artPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(frameW - 0.036, frameH - 0.036),
          new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 })
        );
        artPlane.position.z = 0.0125;
        fGroup.add(artPlane);

        fGroup.position.set(localX, 0, 0);
        group.add(fGroup);
      }

      group.position.set(anchor.x, cfg.height || 1.55, anchor.z);
      group.rotation.y = anchor.rotY;
      group.userData.artWall = wallKey;
      group.userData.cutawayDir = anchor.cutawayDir;
      artGroup.add(group);
    });
  }

  /* ----------------------------------------------------------
     5. FURNITURE MANAGEMENT + SELECTION + DRAG & DROP
     ---------------------------------------------------------- */
  const furnitureMeshes = {}; // id -> THREE.Group
  let selectedFurnId = null;

  // Selection highlight ring
  const selRing = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.52, 32),
    new THREE.MeshBasicMaterial({ color: '#e0a96d', side: THREE.DoubleSide })
  );
  selRing.rotation.x = -Math.PI / 2;
  selRing.position.y = 0.015;
  selRing.visible = false;
  aptGroup.add(selRing);

  function rebuildFurniture() {
    clearGroup(furnitureGroup);
    Object.keys(furnitureMeshes).forEach((k) => delete furnitureMeshes[k]);

    state.furniture.forEach((item) => {
      const group = AppFurniture.createMeshByType(item.type, item.color);
      group.position.set(item.x, 0, item.z);
      group.rotation.y = item.rotY || 0;
      group.visible = item.visible !== false;
      group.userData.furnId = item.id;
      group.traverse((child) => {
        if (child.isMesh) child.userData.furnId = item.id;
      });
      furnitureGroup.add(group);
      furnitureMeshes[item.id] = group;
    });

    updateSelectionRing();
    renderFurnitureList();
  }

  function updateSelectionRing() {
    if (!selectedFurnId || !furnitureMeshes[selectedFurnId]) {
      selRing.visible = false;
      return;
    }
    const mesh = furnitureMeshes[selectedFurnId];
    if (!mesh.visible) {
      selRing.visible = false;
      return;
    }
    selRing.position.set(mesh.position.x, 0.018, mesh.position.z);
    selRing.visible = true;
  }

  function selectFurniture(id) {
    selectedFurnId = id;
    updateSelectionRing();
    renderFurnitureList();

    const insp = document.getElementById('furniture-inspector');
    if (!id) {
      insp.classList.add('hidden');
      return;
    }
    const item = state.furniture.find((f) => f.id === id);
    if (!item) return;

    document.getElementById('insp-name').textContent = item.name;
    document.getElementById('insp-toggle-vis').textContent = item.visible === false ? 'Mostrar' : 'Ocultar';
    const delBtn = document.getElementById('insp-delete');
    if (item.isExtra) delBtn.classList.remove('hidden');
    else delBtn.classList.add('hidden');

    // Highlight active color dot
    document.querySelectorAll('#insp-colors .color-dot').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.color.toLowerCase() === (item.color || '').toLowerCase());
    });

    insp.classList.remove('hidden');
  }

  /* ----------------------------------------------------------
     RAYCASTING & FLOOR DRAG-AND-DROP
     ---------------------------------------------------------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const dragIntersect = new THREE.Vector3();
  const dragOffset = new THREE.Vector3();

  let isDraggingFurn = false;
  let pointerDownPos = { x: 0, y: 0 };
  let draggedFurnId = null;

  function setPointerFromEvent(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pointerDownPos = { x: e.clientX, y: e.clientY };
    setPointerFromEvent(e);
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(furnitureGroup.children, true);
    const visibleHit = hits.find((h) => {
      const fid = h.object.userData.furnId;
      return fid && furnitureMeshes[fid] && furnitureMeshes[fid].visible;
    });

    if (visibleHit) {
      const fid = visibleHit.object.userData.furnId;
      // Only start dragging immediately if already selected, or allow smooth grab
      draggedFurnId = fid;
      selectFurniture(fid);
      if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
        const mesh = furnitureMeshes[fid];
        dragOffset.copy(mesh.position).sub(dragIntersect);
      }
      isDraggingFurn = true;
      controls.enabled = false;
      container.classList.add('dragging-furn');
    }
  });

  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isDraggingFurn || !draggedFurnId) return;
    setPointerFromEvent(e);
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
      const nx = THREE.MathUtils.clamp(dragIntersect.x + dragOffset.x, 0.15, 4.68);
      const nz = THREE.MathUtils.clamp(dragIntersect.z + dragOffset.z, 0.15, 5.05);
      const mesh = furnitureMeshes[draggedFurnId];
      const item = state.furniture.find((f) => f.id === draggedFurnId);
      if (mesh && item) {
        mesh.position.set(nx, 0, nz);
        item.x = Number(nx.toFixed(2));
        item.z = Number(nz.toFixed(2));
        updateSelectionRing();
      }
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (isDraggingFurn) {
      isDraggingFurn = false;
      draggedFurnId = null;
      controls.enabled = true;
      container.classList.remove('dragging-furn');
      saveState();
      return;
    }

    // Check if it was a clean click on empty floor to deselect
    const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    if (dist < 5 && e.target === renderer.domElement && e.button === 0) {
      setPointerFromEvent(e);
      raycaster.setFromCamera(pointer, camera);
      const fHits = raycaster.intersectObjects(furnitureGroup.children, true);
      if (fHits.length === 0) {
        selectFurniture(null);
      }
    }
  });

  /* ----------------------------------------------------------
     6. SMART WALL CUTAWAY & DAY/NIGHT MODE
     ---------------------------------------------------------- */
  function updateWallCutaway() {
    const mode = state.wallMode;
    const camRel = camera.position.clone().sub(CENTER);
    const camDist = camRel.length();

    // Determine which outer walls face the camera when looking from outside
    const hideDir = { N: false, S: false, E: false, W: false };
    if (mode === 'low') {
      hideDir.N = hideDir.S = hideDir.E = hideDir.W = true;
    } else if (mode === 'cutaway' && camDist > 3.6) {
      if (camRel.z > 1.2) hideDir.S = true;
      if (camRel.z < -1.2) hideDir.N = true;
      if (camRel.x > 1.4) hideDir.E = true;
      if (camRel.x < -1.4) hideDir.W = true;
    }

    ['N', 'S', 'E', 'W'].forEach((dir) => {
      const cut = hideDir[dir];
      cutawayWallGroups[dir].forEach((entry) => {
        if (entry.isWindowGroup) {
          entry.mesh.visible = !cut;
          return;
        }
        const origH = entry.yTop - entry.yBottom;
        if (cut) {
          if (entry.yBottom > 0.35) {
            entry.mesh.visible = false;
          } else {
            entry.mesh.visible = true;
            const targetH = Math.min(origH, 0.34);
            entry.mesh.scale.y = targetH / origH;
            entry.mesh.position.y = entry.yBottom + targetH / 2;
          }
        } else {
          entry.mesh.visible = true;
          entry.mesh.scale.y = 1;
          entry.mesh.position.y = entry.yBottom + origH / 2;
        }
      });
    });

    // Hide wall art attached to currently cutaway walls
    artGroup.children.forEach((ag) => {
      const dir = ag.userData.cutawayDir;
      ag.visible = !(dir && hideDir[dir]);
    });

    // Hide South-wall curtains when South wall is cut away so they never float in mid-air
    ['curtain_living', 'curtain_bedroom'].forEach((cid) => {
      const item = state.furniture.find((f) => f.id === cid);
      const mesh = furnitureMeshes[cid];
      if (item && mesh) {
        mesh.visible = item.visible !== false && !hideDir.S;
      }
    });
  }

  function applyDayNight() {
    const day = state.dayMode;
    scene.background = new THREE.Color(day ? '#dfe4eb' : '#0f121a');
    groundPlane.material.color.set(day ? '#cfd6df' : '#151922');
    hemiLight.intensity = day ? 0.72 : 0.08;
    sunLight.intensity = day ? 1.15 : 0.04;
    fillLight.intensity = day ? 0.35 : 0.03;
    renderer.toneMappingExposure = day ? 1.08 : 1.15;

    document.getElementById('daynight-label').textContent = day ? 'Dia' : 'Noite';
    document.getElementById('btn-daynight').classList.toggle('active', !day);
    rebuildCeiling();
  }

  /* ----------------------------------------------------------
     7. ROOM LABELS & MEASUREMENTS OVERLAY
     ---------------------------------------------------------- */
  const ROOM_LABELS = [
    { name: 'Quarto', dims: '2,24 × 3,12 m · 7,3 m²', pos: new THREE.Vector3(1.12, 0.15, 2.75) },
    { name: 'Sala / Jantar', dims: '2,47 × 2,72 m · 6,3 m²', pos: new THREE.Vector3(3.58, 0.15, 4.18) },
    { name: 'Cozinha / Serv.', dims: '2,47 × 2,48 m · 6,0 m²', pos: new THREE.Vector3(3.65, 0.15, 1.55) },
    { name: 'Banheiro', dims: '2,24 × 1,52 m · 3,2 m²', pos: new THREE.Vector3(1.15, 0.15, 0.88) },
    { name: 'Entrada', dims: 'Porta 0,78 m', pos: new THREE.Vector3(3.34, 0.20, -0.25) }
  ];

  const labelsOverlay = document.getElementById('labels-overlay');
  const labelEls = ROOM_LABELS.map((rl) => {
    const el = document.createElement('div');
    el.className = 'room-label';
    el.innerHTML = `${rl.name}<span>${rl.dims}</span>`;
    labelsOverlay.appendChild(el);
    return { el, pos: rl.pos };
  });

  function updateLabels() {
    labelsOverlay.style.display = state.showMeasures ? 'block' : 'none';
    if (!state.showMeasures) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    labelEls.forEach(({ el, pos }) => {
      const v = pos.clone().project(camera);
      if (v.z > 1) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'block';
      el.style.left = `${(v.x * 0.5 + 0.5) * w}px`;
      el.style.top = `${(-v.y * 0.5 + 0.5) * h}px`;
    });
  }

  /* ----------------------------------------------------------
     8. CAMERA PRESETS & SMOOTH TRANSITION
     ---------------------------------------------------------- */
  const CAM_PRESETS = {
    iso:      { pos: [6.8, 6.2, 8.2], target: [2.41, 0.4, 2.60], wallMode: 'cutaway', cvis: null },
    top:      { pos: [2.41, 9.2, 2.62], target: [2.41, 0, 2.60], wallMode: 'full', cvis: 'hidden' },
    sala:     { pos: [3.65, 1.48, 4.95], target: [3.20, 1.05, 2.20], wallMode: 'full', cvis: 'visible' },
    quarto:   { pos: [1.85, 1.42, 2.05], target: [1.05, 0.90, 4.35], wallMode: 'full', cvis: 'visible' },
    cozinha:  { pos: [3.15, 1.48, 0.35], target: [4.35, 1.00, 2.40], wallMode: 'full', cvis: 'visible' },
    banheiro: { pos: [1.88, 1.45, 1.42], target: [0.65, 1.05, 0.45], wallMode: 'full', cvis: 'visible' },
    teto:     { pos: [3.95, 0.82, 4.85], target: [2.30, 2.55, 2.55], wallMode: 'full', cvis: 'visible' }
  };

  let camAnim = null;

  function goToCamera(key) {
    const p = CAM_PRESETS[key];
    if (!p) return;

    document.querySelectorAll('.cam-btn').forEach((b) => b.classList.toggle('active', b.dataset.cam === key));

    if (p.wallMode) {
      state.wallMode = p.wallMode;
      syncWallModeUI();
    }
    if (p.cvis) {
      state.ceiling.visibility = p.cvis;
      syncCeilingUI();
      rebuildCeiling();
    }

    // Unlock maxPolarAngle briefly for looking UP at ceiling!
    controls.maxPolarAngle = key === 'teto' ? Math.PI * 0.95 : Math.PI * 0.62;

    camAnim = {
      startPos: camera.position.clone(),
      endPos: new THREE.Vector3(...p.pos),
      startTarget: controls.target.clone(),
      endTarget: new THREE.Vector3(...p.target),
      t: 0
    };
  }

  /* ----------------------------------------------------------
     9. UI POPULATION & EVENT WIRING
     ---------------------------------------------------------- */
  let activeFloorZone = 'todos';
  let activeWallTarget = 'todas';
  let activeArtWall = 'sofa';

  const WALL_PALETTE = [
    { name: 'Branco Neve', hex: '#f7f7f5' },
    { name: 'Algodão Egípcio', hex: '#f2efe9' },
    { name: 'Areia Suave', hex: '#e5dacb' },
    { name: 'Crômio', hex: '#d3d3ce' },
    { name: 'Papel Picado', hex: '#d8d2c7' },
    { name: 'Elefante', hex: '#9e9b93' },
    { name: 'Verde Sálvia', hex: '#aeb8a8' },
    { name: 'Verde Oliva', hex: '#6e7e68' },
    { name: 'Terracota Suave', hex: '#c88c74' },
    { name: 'Azul Névoa', hex: '#9fb2bf' },
    { name: 'Azul Petróleo', hex: '#3d586b' },
    { name: 'Grafite Urbano', hex: '#41454c' }
  ];

  const BASEBOARD_COLORS = ['#f7f7f5', '#e5e2db', '#c9ae8b', '#8d6541', '#383b40', '#181a1e'];
  const CEILING_COLORS = ['#ffffff', '#f7f6f2', '#ece9e1', '#d6d4ce', '#363940'];
  const FRAME_COLORS = ['#1e2024', '#c5a072', '#6b492b', '#c7a454', '#f2f0eb'];

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => el.classList.add('hidden'), 2400);
  }

  function initUI() {
    // Mobile drawer toggle
    const sidebarEl = document.getElementById('sidebar');
    const btnMobOpen = document.getElementById('btn-mobile-menu');
    const btnMobClose = document.getElementById('btn-mobile-close');
    if (btnMobOpen && btnMobClose && sidebarEl) {
      btnMobOpen.addEventListener('click', () => sidebarEl.classList.add('mobile-open'));
      btnMobClose.addEventListener('click', () => sidebarEl.classList.remove('mobile-open'));
    }

    // Tabs
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      });
    });

    // Cameras
    document.querySelectorAll('.cam-btn').forEach((btn) => {
      btn.addEventListener('click', () => goToCamera(btn.dataset.cam));
    });

    // Wall Cutaway Mode
    document.querySelectorAll('[data-wallmode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wallMode = btn.dataset.wallmode;
        syncWallModeUI();
        saveState();
      });
    });

    // Measures toggle
    const btnMeasures = document.getElementById('btn-measures');
    btnMeasures.classList.toggle('active', state.showMeasures);
    btnMeasures.addEventListener('click', () => {
      state.showMeasures = !state.showMeasures;
      btnMeasures.classList.toggle('active', state.showMeasures);
      saveState();
    });

    // Day / Night toggle
    document.getElementById('btn-daynight').addEventListener('click', () => {
      state.dayMode = !state.dayMode;
      applyDayNight();
      saveState();
      showToast(state.dayMode ? 'Modo Dia ativado' : 'Modo Noite ativado — destaque para LED e gesso!');
    });

    // Screenshot PNG
    document.getElementById('btn-screenshot').addEventListener('click', () => {
      const prevSel = selRing.visible;
      selRing.visible = false;
      renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL('image/png');
      selRing.visible = prevSel;
      const a = document.createElement('a');
      a.href = url;
      a.download = 'apartamento-24m2-3d.png';
      a.click();
      showToast('Foto PNG salva!');
    });

    // Export JSON
    document.getElementById('btn-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meu-apartamento-24m2.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Projeto exportado (.json)!');
    });

    // Import JSON
    const inputImport = document.getElementById('input-import');
    document.getElementById('btn-import').addEventListener('click', () => inputImport.click());
    inputImport.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const loaded = JSON.parse(reader.result);
          state = { ...createDefaultState(), ...loaded };
          saveState();
          refreshAll();
          showToast('Projeto carregado com sucesso!');
        } catch (err) {
          showToast('Arquivo JSON inválido.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // Reset
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (!confirm('Resetar todo o apartamento para a configuração original da planta?')) return;
      localStorage.removeItem(STORAGE_KEY);
      state = createDefaultState();
      selectFurniture(null);
      refreshAll();
      goToCamera('iso');
      showToast('Planta restaurada para o padrão original.');
    });

    /* --- PISOS TAB --- */
    document.querySelectorAll('#floor-zone-selector .zone-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFloorZone = btn.dataset.zone;
        document.querySelectorAll('#floor-zone-selector .zone-btn').forEach((b) => b.classList.toggle('active', b === btn));
        syncFloorUI();
      });
    });

    const porcGrid = document.getElementById('floor-porcelanato-grid');
    const woodGrid = document.getElementById('floor-wood-grid');
    AppTextures.FLOOR_CATALOG.forEach((item) => {
      const card = document.createElement('button');
      card.className = 'swatch-card';
      card.dataset.floorid = item.id;
      card.innerHTML = `
        <div class="swatch-thumb" style="background-image:url('${AppTextures.getFloorPreviewUrl(item.id)}')"></div>
        <div class="swatch-info"><strong>${item.name}</strong><span>${item.desc}</span></div>
      `;
      card.addEventListener('click', () => {
        const targets = activeFloorZone === 'todos' ? ['quarto', 'sala', 'cozinha', 'banheiro'] : [activeFloorZone];
        targets.forEach((z) => { state.floors[z].id = item.id; });
        rebuildFloors();
        syncFloorUI();
        saveState();
      });
      (item.category === 'porcelanato' ? porcGrid : woodGrid).appendChild(card);
    });

    document.querySelectorAll('#tile-scale-selector button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sc = parseFloat(btn.dataset.scale);
        const targets = activeFloorZone === 'todos' ? ['quarto', 'sala', 'cozinha', 'banheiro'] : [activeFloorZone];
        targets.forEach((z) => { state.floors[z].scale = sc; });
        rebuildFloors();
        syncFloorUI();
        saveState();
      });
    });

    document.querySelectorAll('#tile-finish-selector button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fin = btn.dataset.finish;
        const targets = activeFloorZone === 'todos' ? ['quarto', 'sala', 'cozinha', 'banheiro'] : [activeFloorZone];
        targets.forEach((z) => { state.floors[z].finish = fin; });
        rebuildFloors();
        syncFloorUI();
        saveState();
      });
    });

    const bbRow = document.getElementById('baseboard-color-row');
    BASEBOARD_COLORS.forEach((hex) => {
      const d = document.createElement('button');
      d.className = 'color-dot';
      d.style.background = hex;
      d.dataset.color = hex;
      d.addEventListener('click', () => {
        state.baseboardColor = hex;
        buildBaseboards();
        syncFloorUI();
        saveState();
      });
      bbRow.appendChild(d);
    });

    /* --- PAREDES TAB --- */
    document.querySelectorAll('#wall-target-selector .zone-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeWallTarget = btn.dataset.wall;
        document.querySelectorAll('#wall-target-selector .zone-btn').forEach((b) => b.classList.toggle('active', b === btn));
        syncWallUI();
      });
    });

    const wPal = document.getElementById('wall-color-palette');
    WALL_PALETTE.forEach((c) => {
      const d = document.createElement('button');
      d.className = 'color-dot';
      d.style.background = c.hex;
      d.title = c.name;
      d.dataset.color = c.hex;
      d.addEventListener('click', () => applyWallColor(c.hex));
      wPal.appendChild(d);
    });

    const wCustom = document.getElementById('wall-custom-color');
    wCustom.addEventListener('input', (e) => applyWallColor(e.target.value));

    function applyWallColor(hex) {
      if (activeWallTarget === 'todas') {
        Object.keys(state.walls).forEach((k) => {
          state.walls[k].color = hex;
          if (k !== 'cozinha' && k !== 'banheiro' && state.walls[k].finish === 'pintura') {
            state.walls[k].color = hex;
          }
        });
      } else {
        state.walls[activeWallTarget].color = hex;
      }
      applyWallMaterials();
      syncWallUI();
      saveState();
    }

    const wfGrid = document.getElementById('wall-finish-grid');
    AppTextures.WALL_FINISHES.forEach((wf) => {
      const card = document.createElement('button');
      card.className = 'swatch-card';
      card.dataset.wfinish = wf.id;
      card.innerHTML = `
        <div class="swatch-thumb" style="background-image:url('${AppTextures.getWallFinishPreviewUrl(wf.id)}')"></div>
        <div class="swatch-info"><strong>${wf.name}</strong><span>${wf.desc}</span></div>
      `;
      card.addEventListener('click', () => {
        if (activeWallTarget === 'todas') {
          Object.keys(state.walls).forEach((k) => { state.walls[k].finish = wf.id; });
        } else {
          state.walls[activeWallTarget].finish = wf.id;
        }
        applyWallMaterials();
        syncWallUI();
        saveState();
      });
      wfGrid.appendChild(card);
    });

    /* --- TETO & LED TAB --- */
    document.querySelectorAll('#ceiling-vis-selector button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ceiling.visibility = btn.dataset.cvis;
        rebuildCeiling();
        syncCeilingUI();
        saveState();
      });
    });

    document.getElementById('btn-look-ceiling').addEventListener('click', () => {
      state.ceiling.visibility = 'visible';
      rebuildCeiling();
      syncCeilingUI();
      goToCamera('teto');
    });

    document.querySelectorAll('#ceiling-style-selector .ceiling-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ceiling.style = btn.dataset.style;
        if (state.ceiling.visibility === 'hidden') state.ceiling.visibility = 'semi';
        rebuildCeiling();
        syncCeilingUI();
        saveState();
      });
    });

    document.querySelectorAll('#light-temp-selector button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ceiling.temp = parseInt(btn.dataset.temp, 10);
        rebuildCeiling();
        syncCeilingUI();
        saveState();
      });
    });

    ['chk-led', 'chk-spots-social', 'chk-spots-wet'].forEach((id) => {
      document.getElementById(id).addEventListener('change', (e) => {
        if (id === 'chk-led') state.ceiling.ledOn = e.target.checked;
        if (id === 'chk-spots-social') state.ceiling.spotsSocialOn = e.target.checked;
        if (id === 'chk-spots-wet') state.ceiling.spotsWetOn = e.target.checked;
        rebuildCeiling();
        saveState();
      });
    });

    document.getElementById('slider-light-intensity').addEventListener('input', (e) => {
      state.ceiling.intensity = parseFloat(e.target.value);
      rebuildCeiling();
      saveState();
    });

    document.getElementById('slider-drop-height').addEventListener('input', (e) => {
      state.ceiling.dropHeight = parseFloat(e.target.value);
      if (state.ceiling.visibility === 'hidden') state.ceiling.visibility = 'semi';
      rebuildCeiling();
      syncCeilingUI();
      saveState();
    });

    const cColorRow = document.getElementById('ceiling-color-row');
    CEILING_COLORS.forEach((hex) => {
      const d = document.createElement('button');
      d.className = 'color-dot';
      d.style.background = hex;
      d.dataset.color = hex;
      d.addEventListener('click', () => {
        state.ceiling.color = hex;
        rebuildCeiling();
        syncCeilingUI();
        saveState();
      });
      cColorRow.appendChild(d);
    });

    /* --- MÓVEIS TAB & INSPECTOR --- */
    const addFurnGrid = document.getElementById('add-furniture-grid');
    AppFurniture.EXTRA_CATALOG.forEach((ex) => {
      const b = document.createElement('button');
      b.className = 'add-furn-btn';
      b.textContent = ex.label;
      b.addEventListener('click', () => {
        const newId = `${ex.type}_${Date.now()}`;
        const newItem = {
          id: newId,
          type: ex.type,
          name: ex.label.replace(/^[^\s]+\s/, ''),
          room: 'Extra',
          x: ex.x + (Math.random() - 0.5) * 0.2,
          z: ex.z + (Math.random() - 0.5) * 0.2,
          rotY: 0,
          color: ex.defaultColor,
          visible: true,
          isExtra: true
        };
        state.furniture.push(newItem);
        rebuildFurniture();
        selectFurniture(newId);
        saveState();
        showToast(`${newItem.name} adicionado! Arraste no 3D para posicionar.`);
      });
      addFurnGrid.appendChild(b);
    });

    // Inspector colors
    const inspColors = document.getElementById('insp-colors');
    AppFurniture.FURNITURE_COLORS.forEach((fc) => {
      const d = document.createElement('button');
      d.className = 'color-dot';
      d.style.background = fc.hex;
      d.title = fc.name;
      d.dataset.color = fc.hex;
      d.addEventListener('click', () => {
        if (!selectedFurnId) return;
        const item = state.furniture.find((f) => f.id === selectedFurnId);
        const mesh = furnitureMeshes[selectedFurnId];
        if (!item || !mesh) return;
        item.color = fc.hex;
        (mesh.userData.primaryMaterials || []).forEach((m) => m.color.set(fc.hex));
        selectFurniture(selectedFurnId);
        saveState();
      });
      inspColors.appendChild(d);
    });

    document.getElementById('insp-close').addEventListener('click', () => selectFurniture(null));
    document.getElementById('insp-rot-left').addEventListener('click', () => rotateSelected(-Math.PI / 4));
    document.getElementById('insp-rot-90').addEventListener('click', () => rotateSelected(Math.PI / 2));
    document.getElementById('insp-rot-right').addEventListener('click', () => rotateSelected(Math.PI / 4));

    function rotateSelected(delta) {
      if (!selectedFurnId) return;
      const item = state.furniture.find((f) => f.id === selectedFurnId);
      const mesh = furnitureMeshes[selectedFurnId];
      if (!item || !mesh) return;
      item.rotY = (item.rotY || 0) + delta;
      mesh.rotation.y = item.rotY;
      saveState();
    }

    document.querySelectorAll('.nudge-grid button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!selectedFurnId) return;
        const item = state.furniture.find((f) => f.id === selectedFurnId);
        const mesh = furnitureMeshes[selectedFurnId];
        if (!item || !mesh) return;
        item.x = THREE.MathUtils.clamp(item.x + parseFloat(btn.dataset.dx), 0.15, 4.68);
        item.z = THREE.MathUtils.clamp(item.z + parseFloat(btn.dataset.dz), 0.15, 5.05);
        mesh.position.set(item.x, 0, item.z);
        updateSelectionRing();
        saveState();
      });
    });

    document.getElementById('insp-toggle-vis').addEventListener('click', () => {
      if (!selectedFurnId) return;
      const item = state.furniture.find((f) => f.id === selectedFurnId);
      const mesh = furnitureMeshes[selectedFurnId];
      if (!item || !mesh) return;
      item.visible = item.visible === false;
      mesh.visible = item.visible;
      selectFurniture(selectedFurnId);
      saveState();
    });

    document.getElementById('insp-delete').addEventListener('click', () => {
      if (!selectedFurnId) return;
      state.furniture = state.furniture.filter((f) => f.id !== selectedFurnId);
      selectFurniture(null);
      rebuildFurniture();
      saveState();
      showToast('Item removido.');
    });

    /* --- QUADROS TAB --- */
    document.querySelectorAll('#art-wall-selector .zone-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeArtWall = btn.dataset.artwall;
        document.querySelectorAll('#art-wall-selector .zone-btn').forEach((b) => b.classList.toggle('active', b === btn));
        syncArtUI();
      });
    });

    document.getElementById('art-enabled').addEventListener('change', (e) => {
      state.art[activeArtWall].enabled = e.target.checked;
      rebuildArt();
      saveState();
    });

    document.querySelectorAll('#art-layout-selector button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.art[activeArtWall].layout = parseInt(btn.dataset.layout, 10);
        state.art[activeArtWall].enabled = true;
        rebuildArt();
        syncArtUI();
        saveState();
      });
    });

    const artGrid = document.getElementById('art-theme-grid');
    AppTextures.ART_THEMES.forEach((at) => {
      const card = document.createElement('button');
      card.className = 'swatch-card';
      card.dataset.arttheme = at.id;
      card.innerHTML = `
        <div class="swatch-thumb" style="background-image:url('${AppTextures.getArtPreviewUrl(at.id)}')"></div>
        <div class="swatch-info"><strong>${at.name}</strong><span>${at.desc}</span></div>
      `;
      card.addEventListener('click', () => {
        state.art[activeArtWall].theme = at.id;
        state.art[activeArtWall].customUrl = null;
        state.art[activeArtWall].enabled = true;
        delete customArtTextures[activeArtWall];
        rebuildArt();
        syncArtUI();
        saveState();
      });
      artGrid.appendChild(card);
    });

    // Custom image upload for Quadros
    const inputUploadArt = document.getElementById('input-upload-art');
    document.getElementById('btn-upload-art').addEventListener('click', () => inputUploadArt.click());
    inputUploadArt.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const tex = new THREE.Texture(img);
          tex.encoding = THREE.sRGBEncoding;
          tex.needsUpdate = true;
          customArtTextures[activeArtWall] = tex;
          state.art[activeArtWall].customUrl = 'loaded';
          state.art[activeArtWall].enabled = true;
          rebuildArt();
          syncArtUI();
          showToast('Imagem aplicada no quadro!');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    const fColRow = document.getElementById('art-frame-color-row');
    FRAME_COLORS.forEach((hex) => {
      const d = document.createElement('button');
      d.className = 'color-dot';
      d.style.background = hex;
      d.dataset.color = hex;
      d.addEventListener('click', () => {
        state.art[activeArtWall].frameColor = hex;
        rebuildArt();
        syncArtUI();
        saveState();
      });
      fColRow.appendChild(d);
    });

    document.getElementById('art-scale').addEventListener('input', (e) => {
      state.art[activeArtWall].scale = parseFloat(e.target.value);
      rebuildArt();
      saveState();
    });
    document.getElementById('art-height').addEventListener('input', (e) => {
      state.art[activeArtWall].height = parseFloat(e.target.value);
      rebuildArt();
      saveState();
    });
    document.getElementById('art-offset').addEventListener('input', (e) => {
      state.art[activeArtWall].offset = parseFloat(e.target.value);
      rebuildArt();
      saveState();
    });
  }

  function renderFurnitureList() {
    const list = document.getElementById('furniture-list');
    list.innerHTML = '';
    state.furniture.forEach((item) => {
      const row = document.createElement('div');
      row.className = `furn-item ${item.id === selectedFurnId ? 'selected' : ''} ${item.visible === false ? 'hidden-item' : ''}`;
      row.innerHTML = `
        <div>
          <div class="furn-item-name">${item.name}</div>
          <div class="furn-item-room">${item.room}</div>
        </div>
        <button class="furn-vis-btn">${item.visible === false ? 'Mostrar' : 'Ocultar'}</button>
      `;
      row.addEventListener('click', (e) => {
        if (e.target.classList.contains('furn-vis-btn')) {
          item.visible = item.visible === false;
          if (furnitureMeshes[item.id]) furnitureMeshes[item.id].visible = item.visible;
          updateSelectionRing();
          renderFurnitureList();
          saveState();
          return;
        }
        selectFurniture(item.id);
      });
      list.appendChild(row);
    });
  }

  function syncWallModeUI() {
    document.querySelectorAll('[data-wallmode]').forEach((b) => {
      b.classList.toggle('active', b.dataset.wallmode === state.wallMode);
    });
  }

  function syncFloorUI() {
    const sample = state.floors[activeFloorZone === 'todos' ? 'sala' : activeFloorZone];
    document.querySelectorAll('[data-floorid]').forEach((el) => {
      el.classList.toggle('active', el.dataset.floorid === sample.id);
    });
    document.querySelectorAll('#tile-scale-selector button').forEach((el) => {
      el.classList.toggle('active', parseFloat(el.dataset.scale) === (sample.scale || 0.6));
    });
    document.querySelectorAll('#tile-finish-selector button').forEach((el) => {
      el.classList.toggle('active', el.dataset.finish === (sample.finish || 'acetinado'));
    });
    document.querySelectorAll('#baseboard-color-row .color-dot').forEach((el) => {
      el.classList.toggle('active', el.dataset.color === state.baseboardColor);
    });
  }

  function syncWallUI() {
    const cfg = state.walls[activeWallTarget] || state.walls.todas;
    document.querySelectorAll('#wall-color-palette .color-dot').forEach((el) => {
      el.classList.toggle('active', el.dataset.color.toLowerCase() === cfg.color.toLowerCase());
    });
    document.getElementById('wall-custom-color').value = cfg.color;
    document.querySelectorAll('[data-wfinish]').forEach((el) => {
      el.classList.toggle('active', el.dataset.wfinish === cfg.finish);
    });
  }

  function syncCeilingUI() {
    const c = state.ceiling;
    document.querySelectorAll('#ceiling-vis-selector button').forEach((el) => {
      el.classList.toggle('active', el.dataset.cvis === c.visibility);
    });
    document.querySelectorAll('#ceiling-style-selector .ceiling-card').forEach((el) => {
      el.classList.toggle('active', el.dataset.style === c.style);
    });
    document.querySelectorAll('#light-temp-selector button').forEach((el) => {
      el.classList.toggle('active', parseInt(el.dataset.temp, 10) === c.temp);
    });
    document.getElementById('chk-led').checked = c.ledOn;
    document.getElementById('chk-spots-social').checked = c.spotsSocialOn;
    document.getElementById('chk-spots-wet').checked = c.spotsWetOn;
    document.getElementById('slider-light-intensity').value = c.intensity;
    document.getElementById('slider-drop-height').value = c.dropHeight;
    document.querySelectorAll('#ceiling-color-row .color-dot').forEach((el) => {
      el.classList.toggle('active', el.dataset.color === c.color);
    });
  }

  function syncArtUI() {
    const a = state.art[activeArtWall];
    document.getElementById('art-enabled').checked = a.enabled;
    document.querySelectorAll('#art-layout-selector button').forEach((el) => {
      el.classList.toggle('active', parseInt(el.dataset.layout, 10) === a.layout);
    });
    document.querySelectorAll('[data-arttheme]').forEach((el) => {
      el.classList.toggle('active', el.dataset.arttheme === a.theme && !a.customUrl);
    });
    document.querySelectorAll('#art-frame-color-row .color-dot').forEach((el) => {
      el.classList.toggle('active', el.dataset.color === a.frameColor);
    });
    document.getElementById('art-scale').value = a.scale;
    document.getElementById('art-height').value = a.height;
    document.getElementById('art-offset').value = a.offset;
  }

  function clearGroup(grp) {
    while (grp.children.length > 0) {
      grp.remove(grp.children[0]);
    }
  }

  function refreshAll() {
    rebuildFloors();
    buildBaseboards();
    applyWallMaterials();
    rebuildCeiling();
    rebuildArt();
    rebuildFurniture();
    applyDayNight();
    syncWallModeUI();
    syncFloorUI();
    syncWallUI();
    syncCeilingUI();
    syncArtUI();
  }

  /* ----------------------------------------------------------
     RESIZE & ANIMATION LOOP
     ---------------------------------------------------------- */
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  function animate() {
    requestAnimationFrame(animate);

    if (camAnim) {
      camAnim.t = Math.min(1, camAnim.t + 0.055);
      const ease = 1 - Math.pow(1 - camAnim.t, 3);
      camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, ease);
      controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, ease);
      if (camAnim.t >= 1) camAnim = null;
    }

    controls.update();
    updateWallCutaway();
    updateLabels();
    renderer.render(scene, camera);
  }

  /* ----------------------------------------------------------
     BOOT
     ---------------------------------------------------------- */
  buildArchitecture();
  initUI();
  refreshAll();
  animate();
})();
