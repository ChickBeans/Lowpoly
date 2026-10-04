// Environment: a white marble Hindu temple on a raised base, a grand staircase with carved
// balustrades, a paved plaza with rope barriers, planters, a bag counter and a wrap-lending counter.
window.MP = window.MP || {}; MP.ENV = MP.ENV || {};
MP.ENV.temple = function (scene) {
  const V = MP.V, rnd = MP.rng(31), flat = MP.flat, mat = MP.mat, tex = MP.tex;
  const marbleT = tex(32, 32, g => {
    g.fillStyle = '#eeeae1'; g.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 60; i++) { g.fillStyle = rnd() < 0.5 ? '#e2ddd2' : '#f6f3ec'; g.fillRect(Math.floor(rnd() * 32), Math.floor(rnd() * 32), 2, 1); }
  }, 1, 1);
  const carvedT = tex(32, 32, g => {   // rows of little carved arches and dots
    g.fillStyle = '#e9e4da'; g.fillRect(0, 0, 32, 32);
    g.fillStyle = '#c9c2b5'; for (let x = 0; x < 32; x += 8) { g.fillRect(x + 1, 6, 6, 1); g.fillRect(x + 1, 6, 1, 8); g.fillRect(x + 6, 6, 1, 8); g.fillRect(x + 3, 3, 2, 2); }
    g.fillStyle = '#d6cfc2'; for (let x = 0; x < 32; x += 4) { g.fillRect(x, 18, 2, 2); g.fillRect(x + 2, 24, 2, 2); }
    g.fillStyle = '#c4bdaf'; g.fillRect(0, 28, 32, 1); g.fillRect(0, 15, 32, 1);
  }, 1, 1);
  const M = flat(0xffffff, { map: marbleT }), MC = flat(0xffffff, { map: carvedT }), MS = flat(0xd9d3c6), GOLD = flat(0xd8a93a);
  const add = (geo, m, x, y, z, ry) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (ry) o.rotation.y = ry; o.castShadow = o.receiveShadow = true; scene.add(o); return o; };
  const boxM = (w, h, d, m, x, y, z) => add(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z);
  const flags = [];

  // ---- sky: banded gradient dome, a few flat clouds ----
  const skyG = new THREE.SphereGeometry(400, 24, 12), sc = [], c = new THREE.Color(), top = new THREE.Color(0x3d7fd6), hor = new THREE.Color(0xbcd6f0);
  const sp = skyG.attributes.position; for (let i = 0; i < sp.count; i++) { let e = Math.max(0, sp.getY(i) / 400); e = Math.ceil(e * 8) / 8; c.copy(hor).lerp(top, Math.pow(e, 0.6)); sc.push(c.r, c.g, c.b); }
  skyG.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
  const sky = new THREE.Mesh(skyG, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -1; scene.add(sky);
  const clouds = new THREE.Group(); scene.add(clouds);
  [[-90, 60, -220, 1.4], [70, 75, -260, 1.1], [150, 50, -180, 1], [-160, 45, -120, 0.9], [20, 85, -300, 1.2]].forEach(([x, y, z, s]) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s);
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(8 + rnd() * 6, 0), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf7f9fb : 0xe4eaf1, fog: false })); b.position.set((i - 2) * 10, rnd() * 3, 0); b.scale.set(1.4, 0.45, 0.6); g.add(b); }
    clouds.add(g);
  });

  // ---- plaza: big paving with beige border stripes ----
  const paveT = tex(32, 32, g => {
    g.fillStyle = '#bdb6aa'; g.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 160; i++) { const k = 160 + Math.floor(rnd() * 50); g.fillStyle = `rgb(${k},${k - 6},${k - 14})`; g.fillRect(Math.floor(rnd() * 32), Math.floor(rnd() * 32), 1, 1); }
    g.fillStyle = '#a69f93'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 16, 32, 1); g.fillRect(0, 0, 1, 32); g.fillRect(16, 0, 1, 16); g.fillRect(8, 16, 1, 16); g.fillRect(24, 16, 1, 16);
  }, 60, 60);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mat(0xffffff, { map: paveT })); plaza.rotation.x = -Math.PI / 2; plaza.receiveShadow = true; scene.add(plaza);
  [[-7.2, 0], [7.2, 0]].forEach(([x]) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 40), mat(0xb3a07f)); s.rotation.x = -Math.PI / 2; s.position.set(x, 0.005, 10); s.receiveShadow = true; scene.add(s); });
  [-1.5, 7, 15].forEach(z => { const s = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.35), mat(0xb3a07f)); s.rotation.x = -Math.PI / 2; s.position.set(0, 0.006, z); s.receiveShadow = true; scene.add(s); });
  // greenery round the edges
  const green = flat(0x2f5a2c), green2 = flat(0x3d6b35);
  add(new THREE.ConeGeometry(2.2, 6.5, 7), green, -15, 3.25, -9);
  [[-19, -14, 3], [-17, -20, 3.5], [18, -16, 3.2], [20, -9, 2.6], [-21, -4, 2.4]].forEach(([x, z, r]) => add(new THREE.IcosahedronGeometry(r, 0), green2, x, r * 0.9 + 1.2, z));
  boxM(60, 1.2, 1.2, flat(0x35602f), 0, 0, -44);

  // ---- raised base and grand staircase (base of steps at z = -8.5, top at y = 5.6, z = -19) ----
  const STEPS = 20, RISE = 0.28, RUN = 0.52, Z0 = -8.5, SW = 11.6;
  for (let i = 0; i < STEPS; i++) boxM(SW, RISE * (i + 1), RUN, i % 2 ? M : MS, 0, 0, Z0 - RUN * (i + 0.5));
  const TOPY = STEPS * RISE, TOPZ = Z0 - RUN * STEPS;
  boxM(34, TOPY, 20, MC, 0, 0, TOPZ - 10);                   // podium
  boxM(SW, TOPY, 3, M, 0, 0, TOPZ - 1.5);
  // balustrades: sloping carved walls with a rail and posts
  [-1, 1].forEach(sd => {
    const x = sd * (SW / 2 + 0.35), len = Math.hypot(RUN * STEPS, TOPY), ang = Math.atan2(TOPY, RUN * STEPS);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, len), MC); wall.position.set(x, TOPY / 2 + 0.55, Z0 - RUN * STEPS / 2); wall.rotation.x = ang; wall.castShadow = wall.receiveShadow = true; scene.add(wall);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, len), M); rail.position.set(x, TOPY / 2 + 1.15, Z0 - RUN * STEPS / 2); rail.rotation.x = ang; scene.add(rail);
    for (let i = 0; i < STEPS; i++) boxM(0.5, RISE * (i + 1), RUN, MS, x, 0, Z0 - RUN * (i + 0.5));   // stepped side under the balustrade
    for (let k = 0; k <= 10; k++) { const f = k / 10, y = TOPY * f, z = Z0 - RUN * STEPS * f; boxM(0.62, 1.35, 0.4, M, x, y, z); add(new THREE.ConeGeometry(0.28, 0.45, 6), M, x, y + 1.55, z); }
    boxM(0.9, 1.6, 0.9, M, x, 0, Z0 + 0.4); add(new THREE.ConeGeometry(0.4, 0.8, 6), M, x, 2.0, Z0 + 0.4);
  });

  // ---- temple body: porch with columns, carved hall, side wings ----
  const BY = TOPY, FZ = TOPZ - 2.2;
  boxM(15, 6.2, 12, MC, 0, BY, FZ - 7);                      // main hall
  for (let i = 0; i < 6; i++) { const x = -5.5 + i * 2.2; add(new THREE.CylinderGeometry(0.32, 0.36, 5, 8), M, x, BY + 2.5, FZ + 0.8); boxM(0.9, 0.4, 0.9, M, x, BY + 5, FZ + 0.8); }
  boxM(13.5, 0.8, 2.6, MC, 0, BY + 5.4, FZ + 0.2);            // porch roof
  // scalloped arches between the columns
  const archT = tex(64, 16, g => { g.clearRect(0, 0, 64, 16); g.fillStyle = '#efeae0';
    for (let k = 0; k < 4; k++) { const cx = 8 + k * 16; g.fillRect(cx - 8, 0, 16, 4); for (let j = -6; j <= 6; j += 3) g.fillRect(cx + j - 1, 4, 3, 3 + (6 - Math.abs(j)) * 0.8); } }, 1, 1);
  const arch = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.8), new THREE.MeshLambertMaterial({ map: archT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); arch.position.set(0, BY + 3.8, FZ + 0.85); scene.add(arch);
  boxM(4.2, 3.6, 0.2, flat(0x2a2622), 0, BY, FZ - 1);         // dark doorway
  [-1, 1].forEach(sd => boxM(6.5, 5, 12, MC, sd * 10.5, BY, FZ - 8));
  // domes: one big ribbed dome on a drum, two smaller ones
  const dome = (x, z, r, y0) => {
    add(new THREE.CylinderGeometry(r * 1.02, r * 1.06, r * 0.35, 12), MC, x, y0 + r * 0.17, z);
    add(new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), M, x, y0 + r * 0.35, z);
    add(new THREE.CylinderGeometry(r * 0.15, r * 0.28, r * 0.25, 8), M, x, y0 + r * 1.42, z);
    add(new THREE.ConeGeometry(r * 0.1, r * 0.35, 6), GOLD, x, y0 + r * 1.7, z);
    flagpole(x, y0 + r * 1.85, z, r * 0.6);
  };
  const flagT = tex(16, 8, g => { g.fillStyle = '#f4f1ec'; g.fillRect(0, 0, 16, 8); g.fillStyle = '#c8202e'; g.fillRect(0, 0, 16, 2); g.fillRect(0, 6, 16, 2); g.fillRect(2, 3, 3, 2); }, 1, 1);
  function flagpole(x, y, z, h) {
    add(new THREE.CylinderGeometry(0.03, 0.03, h, 4), flat(0x8a8a8a), x, y + h / 2, z);
    const fg = new THREE.PlaneGeometry(0.9, 0.5, 3, 1); fg.translate(0.45, 0, 0);
    const f = new THREE.Mesh(fg, new THREE.MeshLambertMaterial({ map: flagT, side: THREE.DoubleSide })); f.position.set(x, y + h - 0.28, z); scene.add(f); flags.push(f);
  }
  dome(0, FZ - 7, 4.2, BY + 6.2);
  [-1, 1].forEach(sd => dome(sd * 5.6, FZ - 3, 1.8, BY + 6.2));
  // shikhara spires: stacked tapering tiers with a gold tip
  const spire = (x, z, h, w, y0) => {
    let y = y0; const tiers = 6;
    for (let i = 0; i < tiers; i++) { const r0 = w * (1 - i / tiers * 0.75), r1 = w * (1 - (i + 1) / tiers * 0.75), th = h / tiers; add(new THREE.CylinderGeometry(r1, r0, th, 8), i % 2 ? M : MC, x, y + th / 2, z); y += th; }
    add(new THREE.SphereGeometry(w * 0.3, 8, 4), M, x, y + w * 0.15, z); add(new THREE.ConeGeometry(w * 0.1, w * 0.5, 6), GOLD, x, y + w * 0.55, z);
    flagpole(x, y + w * 0.7, z, h * 0.3);
  };
  [-1, 1].forEach(sd => { spire(sd * 10.2, FZ - 4, 7.5, 1.9, BY + 5); spire(sd * 12.4, FZ - 11, 6.5, 1.6, BY + 5); spire(sd * 8.2, FZ - 12, 8.5, 2.0, BY + 6.2); });
  // bunting across the porch
  const BCOL = [0xd8343a, 0x2f7a3a, 0xe0b72d, 0x2a58a8, 0xe07a2a];
  for (let k = 0; k < 2; k++) for (let i = 0; i < 22; i++) {
    const u = i / 21, x = -5.5 + u * 11, y = BY + 4.9 - k * 0.6 - Math.sin(u * Math.PI) * 0.6;
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 3), flat(BCOL[(i + k * 2) % 5])); t.rotation.x = Math.PI; t.position.set(x, y, FZ + 1.4); scene.add(t);
  }
  // "30 YEARS" banner across the top of the stairs
  const banT = tex(128, 32, g => {
    g.fillStyle = '#fafafa'; g.fillRect(0, 0, 128, 32); g.font = 'bold 26px Arial, sans-serif'; g.textBaseline = 'middle';
    g.fillStyle = '#d42a35'; g.fillText('30', 6, 17); g.fillStyle = '#26338f'; g.fillText('YEARS', 38, 17);
  }, 1, 1);
  const ban = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.5, 0.08), [MS, MS, MS, MS, mat(0xffffff, { map: banT }), MS]); ban.position.set(0, TOPY + 0.75, TOPZ + 0.6); scene.add(ban);

  // ---- rope barriers and planters in front of the steps ----
  const steel = new THREE.MeshPhongMaterial({ color: 0xc8ccd0, shininess: 60, specular: 0x888888 }), rope = flat(0xb02a45);
  const posts = [-6.6, -3.4, 3.4, 6.6].map(x => { add(new THREE.CylinderGeometry(0.035, 0.035, 0.95, 6), steel, x, 0.475, -7.3); add(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 8), steel, x, 0.02, -7.3); add(new THREE.SphereGeometry(0.06, 6, 4), steel, x, 0.97, -7.3); return x; });
  [[-6.6, -3.4], [3.4, 6.6], [-3.4, 3.4]].forEach(([a, b]) => {
    const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(V(MP.lerp(a, b, u), 0.88 - Math.sin(u * Math.PI) * 0.22, -7.3)); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.025, 4, false), rope, 0, 0, 0);
  });
  [-1, 1].forEach(sd => {
    const x = sd * 8.6, z = -7.6;
    add(new THREE.LatheGeometry([[0, 0], [0.45, 0], [0.5, 0.15], [0.35, 0.4], [0.55, 0.9], [0.6, 1.0], [0, 1.0]].map(([r, y]) => new THREE.Vector2(r, y)), 8), M, x, 0, z);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; add(new THREE.ConeGeometry(0.14, 0.6, 4), flat(0x2f6a33), x + Math.cos(a) * 0.3, 1.25, z + Math.sin(a) * 0.3).rotation.z = Math.cos(a) * 0.5; }
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.3; add(new THREE.IcosahedronGeometry(0.1, 0), flat(0xc4202c), x + Math.cos(a) * 0.22, 1.32, z + Math.sin(a) * 0.22); }
  });

  // ---- bag counter (left) and wrap-lending counter (right), both facing the plaza centre ----
  const cream = flat(0xe8e0cf), wood = flat(0x8a6a48), roofC = flat(0x9a3a2e);
  boxM(1.4, 2.6, 3.4, cream, -12.9, 0, 1.4); boxM(3.2, 0.18, 3.8, roofC, -11.5, 2.6, 1.4);
  [[-10.1, -0.3], [-10.1, 3.1]].forEach(([x, z]) => add(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5), cream, x, 1.3, z));
  boxM(0.5, 1.05, 3.2, wood, -10.1, 0, 1.4);                 // counter
  const shelf = (x, z) => { boxM(0.6, 0.06, 1.6, wood, x, 1.2, z); };
  shelf(-12.0, 1.4);
  const signT = tex(16, 16, g => { g.fillStyle = '#2a58a8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#fff'; g.fillRect(4, 6, 8, 7); g.fillRect(6, 4, 4, 2); g.fillStyle = '#2a58a8'; g.fillRect(7, 5, 2, 1); }, 1, 1);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), mat(0xffffff, { map: signT })); sign.position.set(-10.25, 2.25, 1.4); sign.rotation.y = Math.PI / 2; scene.add(sign);
  boxM(2.6, 0.95, 1.2, wood, 10.6, 0, 1.0);                  // wrap table
  for (let i = 0; i < 5; i++) boxM(0.55, 0.07, 0.4, flat(i % 2 ? 0x1f2740 : 0x232c48), 10.4 + (i % 2) * 0.1, 0.95 + i * 0.07, 0.8 - (i > 2 ? 0.5 : 0));
  [[9.4, 0.4], [11.8, 0.4], [9.4, 2.0], [11.8, 2.0]].forEach(([x, z]) => add(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 4), flat(0x7a7a7a), x, 1.2, z));
  boxM(2.8, 0.06, 2.0, flat(0xd8d2c4), 10.6, 2.4, 1.2);
  const counterSpot = { bags: V(-10.05, 1.05, 1.1) };

  // ---- a few pigeons on the paving ----
  const pigeons = [[-2.5, 4.2], [-2.0, 4.6], [5.2, 6.1]].map(([x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = i * 1.7;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.2), flat(0x8a8f99)); b.position.y = 0.09; g.add(b);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), flat(0x6d727c)); h.position.set(0, 0.16, 0.1); g.add(h);
    scene.add(g); return { g, h, ph: i * 2.1 };
  });

  return {
    counterSpot,
    update(t, camPos) {
      sky.position.copy(camPos);
      clouds.position.x = t * 0.6;
      flags.forEach((f, i) => { f.rotation.y = Math.sin(t * 2.2 + i) * 0.35 - 0.3; });
      pigeons.forEach(p => { const k = (t * 0.8 + p.ph) % 3; p.h.position.y = k < 0.3 ? 0.1 : 0.16; p.h.position.z = k < 0.3 ? 0.14 : 0.1; });
    }
  };
};
