// Environment: the Reykjavik seafront on a clear winter morning. Gravel promenade with big
// boulders, the bay, Mt. Esja across the water, and a red-and-yellow burger shop with a big
// window facing the mountain (the inside is built too, so the camera can go in).
window.MP = window.MP || {}; MP.ENV = MP.ENV || {};
MP.ENV.reykjavik = function (scene, ctx) {
  const V = MP.V, rnd = MP.rng(73), flat = MP.flat, mat = MP.mat, tex = MP.tex;
  scene.fog = new THREE.Fog(0xc8dbf0, 70, 300);
  ctx.hemi.color.set(0xd8e6ff); ctx.hemi.groundColor.set(0x6a5a50); ctx.hemi.intensity = 0.7;
  ctx.sun.color.set(0xffd2a0); ctx.sun.intensity = 0.95;
  ctx.sunDir = V(16, 12, 20);   // low winter sun from the front-right

  function merged(list, opt) {
    const pos = [], nor = [], col = [], c = new THREE.Color();
    list.forEach(({ geo, color }) => { c.set(color); const g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals();
      const p = g.attributes.position.array, n = g.attributes.normal.array; for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); } for (let i = 0; i < p.length / 3; i++) col.push(c.r, c.g, c.b); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, flat(0xffffff, Object.assign({ vertexColors: true }, opt || {}))); m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  }
  const B = (w, h, d, x, y, z, color, ry) => { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); return { geo: g, color }; };

  // ---- sky: clear, deep blue overhead to pale at the horizon ----
  const skyG = new THREE.SphereGeometry(500, 24, 12), sc = [], c = new THREE.Color(), top = new THREE.Color(0x4f88d8), hor = new THREE.Color(0xc4dcf2);
  const sp = skyG.attributes.position; for (let i = 0; i < sp.count; i++) { let e = Math.max(0, sp.getY(i) / 500); e = Math.ceil(e * 8) / 8; c.copy(hor).lerp(top, Math.pow(e, 0.55)); sc.push(c.r, c.g, c.b); }
  skyG.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
  const sky = new THREE.Mesh(skyG, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -1; scene.add(sky);
  [[-60, 70, -260], [120, 90, -300]].forEach(([x, y, z]) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xe8eff7, fog: false })); b.position.set(x, y, z); b.scale.set(30, 2.5, 6); scene.add(b); });

  // ---- the bay ----
  const seaT = tex(32, 32, g => { g.fillStyle = '#3d5f93'; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 40; i++) { g.fillStyle = rnd() < 0.5 ? '#5579ab' : '#2f4f80'; g.fillRect(Math.floor(rnd() * 32), Math.floor(rnd() * 32), 3 + Math.floor(rnd() * 4), 1); } }, 40, 22);
  const seaGeo = new THREE.PlaneGeometry(360, 160, 48, 20), sea = new THREE.Mesh(seaGeo, mat(0xffffff, { map: seaT })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.4, -81); scene.add(sea);
  const seaBase = seaGeo.attributes.position.array.slice();

  // ---- Mt. Esja: flat-topped, terraced, a little snow on top ----
  const prof = [[-40, 0], [-34, 1.2], [-26, 2.4], [-20, 3.2], [-16, 3.4], [-11, 4.4], [-6, 5.2], [-2, 5.6], [1, 6.4], [5, 6.6], [9, 6.2], [13, 5.8], [18, 5.9], [24, 5.5], [30, 5.0], [40, 4.2]];
  const profH = x => { x = MP.clamp(x, -40, 40); for (let i = 0; i < prof.length - 1; i++) { const p = prof[i], q = prof[i + 1]; if (x <= q[0]) return p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0]); } return 4.2; };
  const mg = new THREE.PlaneGeometry(100, 18, 50, 10); mg.rotateX(-Math.PI / 2);
  const mp = mg.attributes.position, mc = [], cA = new THREE.Color(), cB = new THREE.Color();
  for (let i = 0; i < mp.count; i++) {
    const x = mp.getX(i), z = mp.getZ(i), d = (9 - z) / 18, H = profH(x) * 1.3, raw = MP.smooth(d / 0.6), f = raw * 0.6 + Math.floor(raw * 7) / 7 * 0.4;
    const gully = Math.pow(0.5 + 0.5 * Math.sin(x * 1.15 + Math.sin(x * 0.31) * 2.5), 4), slope = raw * (1 - raw) * 4;
    let h = H * f - gully * slope * 0.9 + (rnd() - 0.5) * 0.15; if (h < 0 || d < 0.01) h = 0; mp.setY(i, h);
    const up = H > 0 ? h / H : 0;
    if (up < 0.5) cA.set(0xc29a6a).lerp(cB.set(0x987868), up * 2); else cA.set(0x987868).lerp(cB.set(0x74646e), (up - 0.5) * 2);
    if ((raw * 7) % 1 < 0.16 && up > 0.2 && up < 0.97) cA.multiplyScalar(0.8);
    if (up > 0.6 && gully > 0.45 && slope > 0.12) cA.set(0xeef2f6);
    if (d > 0.66 && rnd() < 0.08) cA.set(0xe2e8ef);
    if (d < 0.04) cA.set(0xc9a46e);
    mc.push(cA.r, cA.g, cA.b);
  }
  mg.setAttribute('color', new THREE.Float32BufferAttribute(mc, 3));
  const esja = new THREE.Mesh(mg.toNonIndexed(), flat(0xffffff, { vertexColors: true })); esja.geometry.computeVertexNormals(); esja.position.set(-10, -0.4, -52); esja.scale.set(1.5, 1.35, 1); scene.add(esja);
  [[-82, -80, 8, 4.6], [-70, -84, 7, 3.6]].forEach(([x, z, r, h]) => { add(new THREE.ConeGeometry(r, h, 6), flat(0xbcc8d8), x, h / 2 - 0.4, z); add(new THREE.ConeGeometry(r * 0.45, h * 0.45, 6), flat(0xf2f5f8), x, h - h * 0.225 - 0.38, z); });
  function add(geo, m, x, y, z) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; scene.add(o); return o; }

  // ---- promenade: dark gravel, an asphalt path, then the town side ----
  const gravelT = tex(32, 32, g => { g.fillStyle = '#45474d'; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 140; i++) { g.fillStyle = ['#5a5d64', '#33353a', '#6c6f76', '#4f4a46'][Math.floor(rnd() * 4)]; g.fillRect(Math.floor(rnd() * 32), Math.floor(rnd() * 32), 1, 1); } }, 60, 3);
  const gravel = new THREE.Mesh(new THREE.PlaneGeometry(160, 5.5), mat(0xffffff, { map: gravelT })); gravel.rotation.x = -Math.PI / 2; gravel.position.set(0, 0, 0.55); gravel.receiveShadow = true; scene.add(gravel);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(160, 3), mat(0x3a3c41)); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.005, 4.8); path.receiveShadow = true; scene.add(path);
  const town = new THREE.Mesh(new THREE.PlaneGeometry(160, 40), mat(0x6e7266)); town.rotation.x = -Math.PI / 2; town.position.set(0, 0.002, 26); town.receiveShadow = true; scene.add(town);
  // boulders: a riprap line along the water and a few big ones on the gravel (like the photo)
  const rockM = flat(0x6c6670), rocks = new THREE.Group(); scene.add(rocks);
  const rock = (w, h, d, x, z, ry, y0) => { const g = new THREE.DodecahedronGeometry(0.5, 0); g.scale(w, h, d); const o = new THREE.Mesh(g, rockM); o.position.set(x, h / 2 - 0.1 + (y0 || 0), z); o.rotation.y = ry; o.castShadow = o.receiveShadow = true; rocks.add(o); };
  for (let x = -40; x <= 30; x += 1.3 + rnd() * 0.6) { rock(1.4 + rnd() * 0.8, 0.8 + rnd() * 0.5, 1.1 + rnd() * 0.5, x, -1.3 + rnd() * 0.4, rnd() * 3); rock(1.3 + rnd(), 0.6 + rnd() * 0.4, 1.1, x + 0.7, -2.4 + rnd() * 0.3, rnd() * 3, -0.25); }
  [[-15.2, 0.0, 2.0, 0.9], [-13.4, -0.35, 1.9, 1.0], [-10.1, 0.35, 2.1, 1.05], [-8.4, 0.0, 1.8, 0.9], [-17.2, 0.4, 1.7, 0.8]].forEach(([x, z, w, h]) => rock(w, h, 1.3, x, z, rnd() * 0.6));

  // ---- the burger shop: x -4..8, z 9..17, facade (with the big window) facing the sea ----
  const RED = 0xc8302c, YEL = 0xf2c230, X0 = -4, X1 = 8, Z0 = 9, Z1 = 17, HT = 4.2;
  const shop = [];
  shop.push(B(X1 - X0, 0.9, 0.25, (X0 + X1) / 2 - 0.6, 0, Z0, RED));                 // below the window
  shop.push(B(X1 - X0, HT - 3.0, 0.25, (X0 + X1) / 2, 3.0, Z0, RED));               // above the window
  shop.push(B(X1 - X0 + 0.2, 0.25, 0.35, (X0 + X1) / 2, 3.0, Z0 - 0.05, YEL));       // yellow band
  for (let x = X0 + 0.1; x <= 5.6; x += 1.5) shop.push(B(0.12, 2.1, 0.3, x, 0.9, Z0, YEL));   // window mullions
  shop.push(B(0.6, 3.0, 0.25, 5.9, 0, Z0, RED), B(0.6, 3.0, 0.25, 7.7, 0, Z0, RED));  // door frame
  shop.push(B(0.25, HT, Z1 - Z0, X0, 0, (Z0 + Z1) / 2, RED), B(0.25, HT, Z1 - Z0, X1, 0, (Z0 + Z1) / 2, RED), B(X1 - X0, HT, 0.25, (X0 + X1) / 2, 0, Z1, YEL));
  shop.push(B(X1 - X0 + 0.4, 0.3, Z1 - Z0 + 0.4, (X0 + X1) / 2, HT, (Z0 + Z1) / 2, 0x8a2a26));     // roof
  const awn = new THREE.BoxGeometry(X1 - X0 + 0.3, 0.12, 1.4); awn.rotateX(0.28); awn.translate((X0 + X1) / 2, 3.45, Z0 - 0.6); shop.push({ geo: awn, color: YEL });
  // inside: bar counter along the window with stools, order counter at the back, menu board
  shop.push(B(9.2, 0.08, 0.5, 0.6, 1.0, Z0 + 0.45, YEL), B(9.2, 1.0, 0.08, 0.6, 0, Z0 + 0.22, 0xa8282a));
  [-1.6, -0.9, 1.05, 1.75, 2.9, 3.6].forEach(x => { shop.push(B(0.06, 0.74, 0.06, x, 0, Z0 + 1.15, 0x555555), B(0.36, 0.06, 0.36, x, 0.74, Z0 + 1.15, RED)); });
  shop.push(B(5, 1.05, 0.7, 2.2, 0, 15.5, RED), B(5.1, 0.06, 0.8, 2.2, 1.05, 15.5, YEL));
  shop.push(B(5, 1.2, 0.06, 2.2, 2.3, 16.85, 0x2a2a2e));
  [[0.4, 0xf2c230], [1.6, 0xd8282c], [2.8, 0x6aa040], [4.0, 0xf2c230]].forEach(([x, col]) => shop.push(B(0.9, 0.7, 0.04, x, 2.55, 16.8, col)));
  shop.push(B(1.6, 0.8, 1.6, -2.6, 0, 14.5, 0x6a4a3a), B(1.6, 0.8, 1.6, -2.6, 0, 12.0, 0x6a4a3a));    // other tables
  merged(shop);
  const floorT = tex(8, 8, g => { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, 8, 8); g.fillStyle = '#c8302c'; g.fillRect(0, 0, 4, 4); g.fillRect(4, 4, 4, 4); }, 12, 8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), mat(0xffffff, { map: floorT })); floor.rotation.x = -Math.PI / 2; floor.position.set((X0 + X1) / 2, 0.012, (Z0 + Z1) / 2); floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), mat(0xf4efe4, { side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.set((X0 + X1) / 2, HT - 0.01, (Z0 + Z1) / 2); scene.add(ceil);
  const lamp = new THREE.PointLight(0xffe2b0, 0.9, 12, 1.5); lamp.position.set(2, 3.6, 13); scene.add(lamp);
  // sign: a burger pictogram (no name, no logo)
  const signT = tex(32, 32, g => { g.fillStyle = '#f2c230'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#d99a4a'; g.fillRect(6, 8, 20, 6); g.fillRect(8, 6, 16, 2); g.fillStyle = '#4a2a1a'; g.fillRect(5, 15, 22, 4); g.fillStyle = '#6aa040'; g.fillRect(5, 19, 22, 2); g.fillStyle = '#d99a4a'; g.fillRect(6, 21, 20, 5); });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.1), [mat(YEL), mat(YEL), mat(YEL), mat(YEL), mat(YEL), mat(0xffffff, { map: signT })]); sign.position.set(-2.2, 3.6, Z0 - 0.2); sign.rotation.y = Math.PI; scene.add(sign);
  // tray + food left on the bar counter once they sit down (shown by the scene)
  const meal = new THREE.Group(); scene.add(meal);
  [1.1, 1.8].forEach(x => { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.3), mat(RED)); tr.position.set(x, 1.1, Z0 + 0.45); meal.add(tr);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.05), mat(0xd8282c)); f.position.set(x + 0.08, 1.16, Z0 + 0.45); meal.add(f);
    const ff = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.04), mat(0xf2c84a)); ff.position.set(x + 0.08, 1.215, Z0 + 0.45); meal.add(ff);
    const cp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.032, 0.11, 7), mat(0xf4f2ec)); cp.position.set(x - 0.12, 1.17, Z0 + 0.4); meal.add(cp); });
  meal.visible = false;
  // order-counter trays (before they are picked up)
  const counterTrays = new THREE.Group(); scene.add(counterTrays);
  [1.5, 2.3].forEach(x => { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.3), mat(RED)); tr.position.set(x, 1.13, 15.3); counterTrays.add(tr);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), mat(0xd99a4a)); b.position.set(x - 0.1, 1.17, 15.3); counterTrays.add(b); });
  counterTrays.visible = false;

  // ---- colourful tin-clad houses on the town side ----
  const town2 = [], WALL = [0xe8e2d6, 0x3d6f9e, 0xe2b33c, 0xf2f0ea, 0x6c8f5a, 0x9a9ca0, 0xc8463a], ROOF = [0xb03a2e, 0x3a4048, 0x2f5f8a, 0x4b6b3a];
  [[-40, -10, 10.5], [12, 40, 10.5], [-40, 40, 22]].forEach(([a, b, z]) => { for (let x = a; x < b;) { const w = 3 + rnd() * 2.5, h = 3 + rnd() * 2.2; if (z > 20 || x + w < X0 - 1 || x > X1 + 1) {
      town2.push(B(w, h, 4, x + w / 2, 0, z + 2, WALL[Math.floor(rnd() * WALL.length)])); const r = 4 / 1.732 * 1.06, g = new THREE.CylinderGeometry(r, r, w + 0.3, 3); g.rotateZ(Math.PI / 2); g.rotateX(-Math.PI / 2); g.translate(x + w / 2, h + r / 2, z + 2); town2.push({ geo: g, color: ROOF[Math.floor(rnd() * ROOF.length)] }); }
    x += w + 0.5 + rnd(); } });
  merged(town2);
  // seagulls
  const gulls = [0, 1, 2, 3].map(i => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.35), flat(0xf2f2ee)); g.add(b);
    [-1, 1].forEach(sd => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.16), flat(0x9ca2aa)); w.position.x = sd * 0.28; g.add(w); }); scene.add(g); return { g, ph: i * 1.6, r: 5 + i * 1.5, cx: -12 + i * 4, cz: -8 - i * 2 }; });

  return {
    showMeal(on) { meal.visible = on; }, showCounterTrays(on) { counterTrays.visible = on; },
    update(t, camPos) {
      sky.position.copy(camPos);
      const p = seaGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = seaBase[i * 3], y = seaBase[i * 3 + 1]; p.setZ(i, Math.sin(x * 0.5 + t) * 0.06 + Math.cos(y * 0.7 + t * 0.8) * 0.05); } p.needsUpdate = true;
      gulls.forEach(q => { const a = t * 0.35 + q.ph; q.g.position.set(q.cx + Math.cos(a) * q.r, 4 + Math.sin(a * 2) * 0.4, q.cz + Math.sin(a) * q.r); q.g.rotation.y = -a; q.g.children.forEach((w, k) => { if (k) w.rotation.z = (k === 1 ? 1 : -1) * Math.sin(t * 8 + q.ph) * 0.45; }); });
    }
  };
};
