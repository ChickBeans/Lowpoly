// Environment: a hiking day. A wooded trail up the hillside, a residential street, a building
// with an outdoor switchback staircase, and its rooftop looking out over the town and the sea.
window.MP = window.MP || {}; MP.ENV = MP.ENV || {};
MP.ENV.hike = function (scene, ctx) {
  const V = MP.V, rnd = MP.rng(57), flat = MP.flat, mat = MP.mat, tex = MP.tex;
  // overcast light
  scene.fog = new THREE.Fog(0xd3d9e0, 50, 320);
  ctx.hemi.color.set(0xe8ecf2); ctx.hemi.groundColor.set(0x8a8a80); ctx.hemi.intensity = 0.8;
  ctx.sun.color.set(0xfff6ea); ctx.sun.intensity = 0.55;

  // many small boxes merged into one mesh (houses, windows, rails) to keep it fast
  function merged(list, flatShade) {
    const pos = [], nor = [], col = [], c = new THREE.Color();
    list.forEach(({ geo, color }) => { c.set(color); const g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals();
      const p = g.attributes.position.array, n = g.attributes.normal.array; for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); } for (let i = 0; i < p.length / 3; i++) col.push(c.r, c.g, c.b); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, flatShade === false ? mat(0xffffff, { vertexColors: true }) : flat(0xffffff, { vertexColors: true })); m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  }
  const B = (w, h, d, x, y, z, color, ry) => { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); return { geo: g, color }; };
  const roofPrism = (w, d, h, x, y, z, color, ry) => { const r = d / 1.732 * 1.08, g = new THREE.CylinderGeometry(r, r, w + 0.3, 3); g.rotateZ(Math.PI / 2); g.rotateX(-Math.PI / 2); g.scale(1, h / (r * 1.5), 1); if (ry) g.rotateY(ry); g.translate(x, y + h / 3, z); return { geo: g, color }; };
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; scene.add(o); return o; };

  // ---- sky: soft grey-white gradient with low flat cloud banks ----
  const skyG = new THREE.SphereGeometry(500, 24, 12), sc = [], c = new THREE.Color(), top = new THREE.Color(0xaab6c4), hor = new THREE.Color(0xe6e9ec);
  const sp = skyG.attributes.position; for (let i = 0; i < sp.count; i++) { let e = Math.max(0, sp.getY(i) / 500); e = Math.ceil(e * 8) / 8; c.copy(hor).lerp(top, Math.pow(e, 0.7)); sc.push(c.r, c.g, c.b); }
  skyG.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
  const sky = new THREE.Mesh(skyG, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -1; scene.add(sky);
  const clouds = new THREE.Group(); scene.add(clouds);
  for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, d = 160 + rnd() * 200, b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: rnd() < 0.5 ? 0xf2f3f4 : 0xd9dde2, fog: false }));
    b.position.set(Math.cos(a) * d, 60 + rnd() * 50, Math.sin(a) * d); b.scale.set(40 + rnd() * 40, 5 + rnd() * 4, 20 + rnd() * 20); b.rotation.y = rnd() * 3; clouds.add(b); }

  // ---- the wooded trail (x -70..-44 along z = 12, rising from y -6 to 0) ----
  const SLOPE = 4.8 / 14, trailY = x => -6 + (x + 63) * SLOPE;
  const hill = new THREE.Group(); hill.position.set(-56, trailY(-56), 12); hill.rotation.z = Math.atan(SLOPE); scene.add(hill);
  const forestT = tex(16, 16, g => { g.fillStyle = '#5d6b3a'; g.fillRect(0, 0, 16, 16); for (let i = 0; i < 50; i++) { g.fillStyle = ['#6d7a44', '#4c5a30', '#7a6a48'][Math.floor(rnd() * 3)]; g.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1); } }, 12, 10);
  const hillGround = new THREE.Mesh(new THREE.PlaneGeometry(44, 40), mat(0xffffff, { map: forestT })); hillGround.rotation.x = -Math.PI / 2; hillGround.receiveShadow = true; hill.add(hillGround);
  const pathM = new THREE.Mesh(new THREE.PlaneGeometry(44, 1.8), mat(0x9a8462)); pathM.rotation.x = -Math.PI / 2; pathM.position.y = 0.01; pathM.receiveShadow = true; hill.add(pathM);
  const trailBits = [];
  for (let x = -68; x <= -45; x += 0.9) trailBits.push({ geo: (() => { const g = new THREE.CylinderGeometry(0.07, 0.07, 1.7, 5); g.rotateX(Math.PI / 2); g.translate(x, trailY(x) + 0.05, 12); return g; })(), color: 0x6a4a2c });
  for (let i = 0; i < 70; i++) {     // trees, kept off the path and away from the camera side
    const x = -72 + rnd() * 30, side = rnd() < 0.75 ? -1 : 1, z = side < 0 ? 12 - 2.2 - rnd() * 12 : 12 + 9 + rnd() * 10, h = 3.5 + rnd() * 3, y = trailY(MP.clamp(x, -70, -44)) + (z - 12) * 0;
    const trunk = new THREE.CylinderGeometry(0.12, 0.16, h * 0.45, 5); trunk.translate(x, y + h * 0.22, z); trailBits.push({ geo: trunk, color: 0x5a4030 });
    const crown = rnd() < 0.5 ? new THREE.ConeGeometry(1.0 + rnd() * 0.6, h * 0.75, 6) : new THREE.IcosahedronGeometry(1.1 + rnd() * 0.6, 0); crown.translate(x, y + h * 0.7, z);
    trailBits.push({ geo: crown, color: [0x3b5e2f, 0x2f5228, 0x4a6b36, 0x557a3c][Math.floor(rnd() * 4)] });
  }
  for (let i = 0; i < 26; i++) { const x = -70 + rnd() * 26, z = 12 + (rnd() < 0.5 ? -1.2 - rnd() * 2 : 1.2 + rnd() * 1.5); const g = new THREE.DodecahedronGeometry(0.2 + rnd() * 0.3, 0); g.translate(x, trailY(x) + 0.1, z); trailBits.push({ geo: g, color: 0x8a8580 }); }
  merged(trailBits);

  // ---- the street (y = 0, along z = 12 from x -44 to -6) with houses either side ----
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(40, 5), mat(0x55585e)); asphalt.rotation.x = -Math.PI / 2; asphalt.position.set(-25, 0.01, 12); asphalt.receiveShadow = true; scene.add(asphalt);
  const town0 = new THREE.Mesh(new THREE.PlaneGeometry(70, 40), mat(0x9a9b96)); town0.rotation.x = -Math.PI / 2; town0.position.set(-20, 0, 6); town0.receiveShadow = true; scene.add(town0);
  const WALL = [0xe8e2d6, 0xd9d4c8, 0xc9c2b4, 0xf0ece4, 0xb8b4ac, 0xe0d2bc], ROOF = [0x5a5e66, 0x6a4a3c, 0x3e4a5a, 0x7a6a5a, 0x4a4e54];
  const street = [];
  for (let x = -42; x < -12; x += 5.5 + rnd() * 1.5) {
    [[6.5, 0], [17.5, Math.PI]].forEach(([z, ry]) => { const w = 4 + rnd() * 1.4, h = 4.5 + rnd() * 1.6, d = 4.5;
      street.push(B(w, h, d, x, 0, z, WALL[Math.floor(rnd() * WALL.length)])); street.push(roofPrism(w, d, 1.6, x, h, z, ROOF[Math.floor(rnd() * ROOF.length)]));
      street.push(B(1.2, 1.0, 0.05, x - w * 0.2, 2.6, z + (ry ? -d / 2 - 0.03 : d / 2 + 0.03), 0x7a8a98));
      street.push(B(w + 0.4, 1.1, 0.15, x, 0, z + (ry ? -d / 2 - 0.6 : d / 2 + 0.6), 0xcfc9bd)); });   // garden walls
  }
  for (let x = -40; x < -8; x += 8) { street.push(B(0.12, 6, 0.12, x, 0, 9.4, 0x9a9a96)); street.push(B(1.4, 0.08, 0.08, x, 5.6, 9.4, 0x5a5a5a)); }   // utility poles
  merged(street);

  // ---- the building (x -7..7, z -7..3, roof at y 16) with a switchback staircase on its west side ----
  const ROOF_Y = 16;
  const winT = tex(32, 32, g => { g.fillStyle = '#c9c6bf'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#7c8794'; for (let y = 4; y < 32; y += 10) for (let x = 3; x < 32; x += 10) g.fillRect(x, y, 6, 5); g.fillStyle = '#b5b2aa'; g.fillRect(0, 0, 32, 1); }, 3, 4);
  const bld = new THREE.Mesh(new THREE.BoxGeometry(14, ROOF_Y, 10), flat(0xffffff, { map: winT })); bld.position.set(0, ROOF_Y / 2, -2); bld.castShadow = bld.receiveShadow = true; scene.add(bld);
  const tileT = tex(16, 16, g => { g.fillStyle = '#c4c4bf'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#b0b0aa'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); for (let i = 0; i < 20; i++) { g.fillStyle = rnd() < 0.5 ? '#cfcfca' : '#babab4'; g.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1); } }, 14, 10);
  const roofF = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), mat(0xffffff, { map: tileT })); roofF.rotation.x = -Math.PI / 2; roofF.position.set(0, ROOF_Y + 0.02, -2); roofF.receiveShadow = true; scene.add(roofF);
  const rails = [], white = 0xf2f3f2;
  const railRun = (x0, z0, x1, z1, y) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.max(2, Math.round(len / 0.32));
    for (let i = 0; i <= n; i++) { const u = i / n; rails.push(B(0.045, 1.1, 0.045, MP.lerp(x0, x1, u), y, MP.lerp(z0, z1, u), white)); }
    const top = new THREE.BoxGeometry(0.12, 0.09, len); top.rotateY(ry); top.translate((x0 + x1) / 2, y + 1.12, (z0 + z1) / 2); rails.push({ geo: top, color: white });
    const mid = new THREE.BoxGeometry(0.06, 0.05, len); mid.rotateY(ry); mid.translate((x0 + x1) / 2, y + 0.12, (z0 + z1) / 2); rails.push({ geo: mid, color: white });
    for (let i = 0; i <= len; i += 2.4) rails.push(B(0.1, 1.15, 0.1, MP.lerp(x0, x1, i / len), y, MP.lerp(z0, z1, i / len), white));
  };
  railRun(-6.9, -6.9, 6.9, -6.9, ROOF_Y); railRun(6.9, -6.9, 6.9, 2.9, ROOF_Y); railRun(-6.9, 2.9, 6.9, 2.9, ROOF_Y);
  railRun(-6.9, -6.9, -6.9, -5.3, ROOF_Y); railRun(-6.9, -3.3, -6.9, 2.9, ROOF_Y);       // gap for the stairs
  rails.push(B(1.6, 0.4, 1.0, 4.5, ROOF_Y, 1.5, 0xa8aaa6), B(0.9, 1.0, 0.8, 5.2, ROOF_Y, -1.0, 0x9fa3a0));   // rooftop units
  // staircase: lanes at x -8.15 (going toward -z) and x -9.75 (going toward +z), 5 flights of 3.2 m
  const FL = 5, RISE = ROOF_Y / FL, Z1 = 3.4, Z2 = -3.4, SN = 16;
  for (let f = 0; f < FL; f++) {
    const lane = f % 2 ? -9.75 : -8.15, za = f % 2 ? Z2 : Z1, zb = f % 2 ? Z1 : Z2;
    for (let i = 0; i < SN; i++) { const u = (i + 0.5) / SN; rails.push(B(1.5, 0.12, Math.abs(zb - za) / SN, lane, f * RISE + (i + 1) * RISE / SN - 0.12, MP.lerp(za, zb, u), 0xa9aba7)); }
    const zl = f % 2 ? 4.3 : -4.3; rails.push(B(3.2, 0.15, 1.8, -8.95, (f + 1) * RISE - 0.15, zl, 0xa9aba7));
  }
  for (let f = 0; f <= FL; f++) [[-10.5, 5.2], [-10.5, -5.2], [-7.4, 5.2], [-7.4, -5.2]].forEach(([x, z]) => rails.push(B(0.18, RISE, 0.18, x, Math.max(0, f - 1) * RISE, z, 0x8f918d)));
  for (let f = 0; f <= FL; f++) rails.push(B(0.06, 0.06, 10.4, -10.55, f * RISE + 1.0, 0, 0xd9dad6), B(0.06, 0.06, 10.4, -7.35, f * RISE + 1.0, 0, 0xd9dad6));   // thin guard rails at each level
  rails.push(B(2.4, 0.15, 1.6, -8.0, ROOF_Y - 0.15, -4.3, 0xa9aba7));   // top landing onto the roof
  merged(rails);
  const stairPath = (f, u) => { const lane = f % 2 ? -9.75 : -8.15, za = f % 2 ? Z2 : Z1, zb = f % 2 ? Z1 : Z2; return { x: lane, z: MP.lerp(za, zb, u), y: f * RISE + RISE * u }; };

  // ---- the view: slope down to the town, school field, apartment blocks, wooded hills, the sea ----
  const LOW = -14;
  const slope = new THREE.Mesh(new THREE.PlaneGeometry(260, 22), flat(0x4f6e3a)); slope.rotation.x = -Math.PI / 2 + Math.atan(14 / 18); slope.position.set(0, -7, -17); scene.add(slope);
  const lowland = new THREE.Mesh(new THREE.PlaneGeometry(600, 200), mat(0x8e8e88)); lowland.rotation.x = -Math.PI / 2; lowland.position.set(0, LOW, -126); lowland.receiveShadow = true; scene.add(lowland);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 600), mat(0x8fa2b4)); sea.rotation.x = -Math.PI / 2; sea.position.set(0, LOW - 0.3, -520); scene.add(sea);
  const view = [];
  for (let i = 0; i < 520; i++) {
    const x = (rnd() - 0.5) * 220, z = -28 - Math.pow(rnd(), 0.8) * 190; if (Math.abs(x + 20) < 18 && z > -70 && z < -52) continue;   // keep the school field clear
    const w = 3 + rnd() * 2.5, h = 3 + rnd() * 2.5, d = 3.5 + rnd() * 2, ry = (rnd() - 0.5) * 0.3;
    view.push(B(w, h, d, x, LOW, z, WALL[Math.floor(rnd() * WALL.length)], ry)); view.push(roofPrism(w, d, 1.3, x, LOW + h, z, ROOF[Math.floor(rnd() * ROOF.length)], ry));
  }
  view.push(B(36, 0.05, 18, -20, LOW + 0.02, -61, 0xc9a874));            // school sports field
  view.push(B(30, 9, 9, -46, LOW, -48, 0xe8e6e0), B(26, 11, 8, -60, LOW, -78, 0xdcdad4), B(18, 14, 8, 30, LOW, -60, 0xe4e2dc), B(12, 22, 10, 55, LOW, -110, 0xd0d4d8));
  for (let i = 0; i < 40; i++) { const x = -150 + rnd() * 140, z = -200 - rnd() * 40, h = 10 + rnd() * 34; view.push(B(5 + rnd() * 8, h, 5 + rnd() * 8, x, LOW, z, [0xc4c8cc, 0xb4bac0, 0xd4d6d8][Math.floor(rnd() * 3)])); }   // port city
  [[-95, -70, 26, 14], [-60, -32, 18, 10], [80, -45, 24, 12], [110, -95, 30, 14], [-140, -120, 30, 16]].forEach(([x, z, r, h]) => { const g = new THREE.SphereGeometry(r, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, h / r, 1); g.translate(x, LOW, z); view.push({ geo: g, color: 0x48663a }); });   // wooded hills
  [[-260, -560, 90, 26], [-90, -600, 110, 22], [180, -580, 120, 30]].forEach(([x, z, r, h]) => { const g = new THREE.ConeGeometry(r, h, 7); g.translate(x, LOW + h / 2, z); view.push({ geo: g, color: 0x9aa6b2 }); });   // far mountains in haze
  for (let i = 0; i < 4; i++) view.push(B(6, 1.6, 2, -40 + i * 40, LOW - 0.2, -330 - i * 30, 0xf0f0ee));   // ships
  merged(view);
  // a few gulls / crows circling over the town
  const birds = [0, 1, 2].map(i => { const g = new THREE.Group(); [-1, 1].forEach(sd => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.14), flat(0x30302e)); w.position.x = sd * 0.25; g.add(w); }); scene.add(g); return { g, ph: i * 2.1, r: 14 + i * 5 }; });

  return {
    stairPath, trailY, ROOF_Y,
    update(t, camPos) {
      sky.position.copy(camPos);
      clouds.rotation.y = t * 0.002;
      birds.forEach(b => { const a = t * 0.18 + b.ph; b.g.position.set(Math.cos(a) * b.r, ROOF_Y + 8 + Math.sin(a * 2) * 1.5, -40 + Math.sin(a) * b.r); b.g.rotation.y = -a; b.g.children.forEach((w, k) => { w.rotation.z = (k ? -1 : 1) * Math.sin(t * 7 + b.ph) * 0.4; }); });
    }
  };
};
