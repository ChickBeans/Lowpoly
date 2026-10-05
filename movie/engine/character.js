// PS1-style box character, built from an appearance description (no hand-placed per-person code).
// The same skeleton is used for everyone: hips swing the legs, arms are placed by IK toward pose targets.
(function (MP) {
  const V = MP.V, UNIT_CYL = new THREE.CylinderGeometry(1, 1, 1, 7), UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
  const SHOULDER_Y = 1.46, UPPER = 0.3, FORE = 0.28;

  // Arm pose library, in body-local metres (character faces +z). side: -1 = right arm, +1 = left arm.
  MP.POSES = {
    idle:     sd => ({ T: V(sd * 0.27, 0.99, 0.04), pole: V(sd * 0.3, 0, -1), flat: 0 }),
    strap:    sd => ({ T: V(sd * 0.17, 1.36, 0.13), pole: V(sd, -0.4, -0.3), flat: 0 }),
    give:     sd => ({ T: V(sd * 0.14, 1.24, 0.46), pole: V(sd * 0.6, -1, 0), flat: 0 }),
    clasp:    sd => ({ T: V(sd * 0.06, 1.03, 0.17), pole: V(sd, -0.2, -0.5), flat: 0 }),
    namaste:  sd => ({ T: V(sd * 0.032, 1.2, 0.21), pole: V(sd, -0.5, -0.4), flat: 1 }),
    point_up: sd => ({ T: V(sd * 0.3, 1.86, 0.32), pole: V(sd, 0, -0.5), flat: 0 }),
    open:     sd => ({ T: V(sd * 0.36, 1.25, 0.3), pole: V(sd, -0.8, -0.2), flat: 0 }),
    phone:    sd => ({ T: V(sd * 0.07, 1.52, 0.3), pole: V(sd, -1, 0), flat: 0 }),
    point_fwd: sd => ({ T: V(sd * 0.16, 1.52, 0.52), pole: V(sd, -0.6, 0), flat: 0 }),
    hip:      sd => ({ T: V(sd * 0.25, 1.0, -0.04), pole: V(sd, 0.3, -0.1), flat: 0 }),
    peace_up: sd => ({ T: V(sd * 0.34, 1.66, 0.12), pole: V(sd, -0.6, -0.2), flat: 0, peace: 1 }),
    peace_chest: sd => ({ T: V(sd * 0.22, 1.38, 0.3), pole: V(sd, -1, 0), flat: 0, peace: 1 }),
    peace_cup: sd => ({ T: V(sd * 0.13, 1.3, 0.3), pole: V(sd, -1, 0), flat: 0, peace: 1 }),
    cup_chest: sd => ({ T: V(sd * 0.07, 1.22, 0.25), pole: V(sd, -1, 0), flat: 0 }),
    carry:    sd => ({ T: V(sd * 0.15, 1.12, 0.34), pole: V(sd, -1, 0.3), flat: 0 }),
    eat:      sd => ({ T: V(sd * 0.05, 1.64, 0.22), pole: V(sd, -1, 0), flat: 0 }),
    table:    sd => ({ T: V(sd * 0.17, 1.2, 0.4), pole: V(sd, -1, 0.2), flat: 0 })
  };

  // 32px dot face (same drawing language as the Reykjavik scene)
  function face(o) {
    return MP.tex(32, 32, g => {
      g.fillStyle = o.skin; g.fillRect(0, 0, 32, 32);
      g.fillStyle = o.shade; g.fillRect(0, 0, 2, 32); g.fillRect(30, 0, 2, 32); g.fillRect(4, 29, 24, 3);
      g.fillStyle = o.brow; o.browRows.forEach(r => { g.fillRect(6, r, 7, 1); g.fillRect(19, r, 7, 1); });
      [8, 20].forEach(x => {
        g.fillStyle = '#f1ebe3'; g.fillRect(x, 15, 4, 2); g.fillStyle = '#1c120e'; g.fillRect(x + 1, 15, 2, 2); g.fillStyle = '#fff'; g.fillRect(x + 1, 15, 1, 1);
        g.fillStyle = '#16100d'; g.fillRect(x - 1, 14, 6, 1); if (o.lash) { g.fillRect(x - 1, 15, 1, 1); g.fillRect(x + 4, 14, 1, 1); }
      });
      if (o.glasses) {   // thin round frames, drawn pixel by pixel
        g.fillStyle = o.glasses;
        [10, 22].forEach(cx => { for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; g.fillRect(Math.round(cx + Math.cos(t) * 4.2 - 0.5), Math.round(15.5 + Math.sin(t) * 3.6 - 0.5), 1, 1); } });
        g.fillRect(14, 15, 4, 1);
      }
      g.fillStyle = o.shade; g.fillRect(16, 17, 1, 4); g.fillRect(14, 21, 1, 1); g.fillRect(17, 21, 1, 1);
      if (o.noseRing) { g.fillStyle = '#e0b04a'; g.fillRect(14, 20, 1, 1); }
      g.fillStyle = o.shade; g.fillRect(9, 22, 1, 2); g.fillRect(22, 22, 1, 2);
      if (o.blush) { g.fillStyle = 'rgba(225,120,110,.45)'; g.fillRect(5, 19, 4, 2); g.fillRect(23, 19, 4, 2); }
      g.fillStyle = o.lip; g.fillRect(12, 24, 8, 1); g.fillRect(11, 23, 1, 1); g.fillRect(20, 23, 1, 1);
      if (o.teeth) { g.fillStyle = '#f4efe6'; g.fillRect(13, 24, 6, 1); g.fillStyle = o.lip; g.fillRect(13, 25, 6, 1); }
    });
  }

  function box(par, w, h, d, m, x, y, z) { const b = new THREE.Mesh(UNIT_BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); par.add(b); return b; }

  // hair styles: boxes placed relative to the head centre (head is 0.24 x 0.29 x 0.25)
  const HAIR = {
    shaggy(h, m) {         // medium, layered, covers the ears; parted fringe kept above the brows
      box(h, 0.285, 0.085, 0.3, m, 0, 0.18, -0.01);
      box(h, 0.12, 0.06, 0.3, m, -0.08, 0.225, -0.01).rotation.z = 0.2; box(h, 0.16, 0.07, 0.3, m, 0.06, 0.23, -0.01).rotation.z = -0.15;
      box(h, 0.29, 0.26, 0.08, m, 0, 0.03, -0.13);
      [-1, 1].forEach(sd => { box(h, 0.05, 0.2, 0.22, m, sd * 0.135, 0.04, -0.02); box(h, 0.045, 0.08, 0.06, m, sd * 0.13, -0.07, 0.06); });
      box(h, 0.16, 0.07, 0.05, m, 0.045, 0.125, 0.127).rotation.z = -0.3; box(h, 0.09, 0.06, 0.05, m, -0.09, 0.13, 0.127).rotation.z = 0.35;
      box(h, 0.05, 0.05, 0.045, m, 0.12, 0.085, 0.12).rotation.z = -0.2; box(h, 0.045, 0.05, 0.045, m, -0.125, 0.09, 0.12).rotation.z = 0.25;
    },
    long(h, m) {           // long straight, full bangs above the brows, past the shoulders
      box(h, 0.285, 0.075, 0.3, m, 0, 0.18, -0.005);
      box(h, 0.285, 0.065, 0.05, m, 0, 0.105, 0.125);
      [-0.11, -0.055, 0, 0.055, 0.11].forEach((x, i) => box(h, 0.055, 0.025, 0.045, m, x, 0.064 + (i % 2) * 0.006, 0.128));
      [-1, 1].forEach(sd => box(h, 0.055, 0.48, 0.16, m, sd * 0.148, -0.13, -0.02));
      return box(h, 0.3, 0.56, 0.08, m, 0, -0.17, -0.13);
    },
    short(h, m) {          // close-cropped, sits under a hat
      box(h, 0.27, 0.06, 0.28, m, 0, 0.165, -0.01);
      box(h, 0.27, 0.2, 0.06, m, 0, 0.05, -0.128);
      [-1, 1].forEach(sd => box(h, 0.035, 0.12, 0.18, m, sd * 0.13, 0.08, -0.04));
      box(h, 0.25, 0.035, 0.04, m, 0, 0.13, 0.122);
    },
    wavy(h, m) {           // short, a bit of volume and waves, forehead showing
      box(h, 0.275, 0.08, 0.29, m, 0, 0.175, -0.005);
      [[-0.09, 0.225], [-0.03, 0.235], [0.04, 0.23], [0.1, 0.22]].forEach(([x, y], i) => { const b = box(h, 0.08, 0.06, 0.24, m, x, y, -0.02); b.rotation.z = (i % 2 ? -1 : 1) * 0.25; });
      box(h, 0.275, 0.22, 0.07, m, 0, 0.06, -0.13);
      [-1, 1].forEach(sd => box(h, 0.04, 0.12, 0.2, m, sd * 0.132, 0.1, -0.03));
      [-0.08, -0.02, 0.05, 0.1].forEach((x, i) => box(h, 0.06, 0.05, 0.05, m, x, 0.145 - (i % 2) * 0.01, 0.12).rotation.z = 0.3 - i * 0.2);
    },
    shortFringe(h, m) {
      box(h, 0.275, 0.08, 0.29, m, 0, 0.175, -0.005);
      box(h, 0.255, 0.06, 0.27, m, 0.01, 0.215, -0.01);
      box(h, 0.275, 0.24, 0.07, m, 0, 0.05, -0.13);
      [-1, 1].forEach(sd => box(h, 0.04, 0.14, 0.21, m, sd * 0.132, 0.085, -0.03));
      box(h, 0.27, 0.06, 0.05, m, 0, 0.115, 0.125);                               // straight fringe
      [-0.1, -0.05, 0, 0.05, 0.1].forEach((x, i) => box(h, 0.052, 0.035, 0.045, m, x, 0.075 - (i % 2) * 0.006, 0.128));
    },
    ponytail(h, m) {
      box(h, 0.28, 0.08, 0.29, m, 0, 0.175, -0.005);
      box(h, 0.28, 0.2, 0.07, m, 0, 0.07, -0.13);
      [-1, 1].forEach(sd => box(h, 0.04, 0.12, 0.2, m, sd * 0.135, 0.09, -0.04));
      box(h, 0.285, 0.065, 0.05, m, 0, 0.11, 0.125);                              // full bangs
      [-0.11, -0.055, 0, 0.055, 0.11].forEach((x, i) => box(h, 0.055, 0.03, 0.045, m, x, 0.068 + (i % 2) * 0.005, 0.128));
      [-1, 1].forEach(sd => box(h, 0.025, 0.2, 0.03, m, sd * 0.127, -0.03, 0.075)); // loose strands by the face
      box(h, 0.06, 0.05, 0.05, MP.mat(0x141414), 0, -0.04, -0.17);                // hair tie
      const tail = box(h, 0.075, 0.26, 0.06, m, 0, -0.19, -0.18); tail.rotation.x = 0.12;
      return tail;
    }
  };

  function makeProps(body) {
    const P = {}, white = MP.mat(0xf4f2ec);
    const group = () => { const g = new THREE.Group(); g.visible = false; body.add(g); return g; };
    P.cup = group(); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.032, 0.11, 7), white); c.position.y = 0.055; P.cup.add(c); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.015, 7), MP.mat(0xe2e0da)); l.position.y = 0.115; P.cup.add(l); }
    P.burger = group(); [[0.012, 0xd99a4a, 0.05], [0.0, 0x4a2a1a, 0.052], [-0.012, 0x6aa040, 0.054], [-0.024, 0xd99a4a, 0.05]].forEach(([y, c, r]) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.018, 8), MP.mat(c)); d.position.y = y + 0.04; P.burger.add(d); });
    P.phone = group(); { const ph = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.13, 0.012), MP.mat(0x1c1c20)); P.phone.add(ph); }
    P.tray = group(); { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.3), MP.mat(0xc8302c)); P.tray.add(tr);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), MP.mat(0xd99a4a)); b.position.set(-0.1, 0.04, 0); P.tray.add(b);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.05), MP.mat(0xd8282c)); f.position.set(0.02, 0.05, 0.04); P.tray.add(f);
      const ff = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.04), MP.mat(0xf2c84a)); ff.position.set(0.02, 0.1, 0.04); P.tray.add(ff);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.032, 0.11, 7), white); c.position.set(0.13, 0.065, -0.04); P.tray.add(c); }
    return P;
  }

  MP.buildCharacter = function (def) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const skin = MP.mat(def.skin), top = MP.mat(def.top), shorts = MP.mat(def.shorts || def.bottom || 0x333333), shoe = MP.mat(def.shoes), hair = MP.mat(def.hair);
    // legs: groups pivoting at the hip
    const legs = [-1, 1].map(sd => {
      const g = new THREE.Group(); g.position.set(sd * 0.1, 0.92, 0); body.add(g);
      if (def.longPants) { const p = new THREE.Mesh(UNIT_CYL, shorts); MP.span(p, V(0, 0, 0), V(0, -0.84, 0.01), 0.1); g.add(p); }
      else {
        const sh = new THREE.Mesh(UNIT_CYL, shorts); MP.span(sh, V(0, 0.02, 0), V(sd * 0.01, -0.42, 0.01), 0.112); g.add(sh);
        const lower = def.legLower ? MP.mat(0xffffff, { map: def.legLower }) : skin;
        const sk = new THREE.Mesh(UNIT_CYL, lower); MP.span(sk, V(sd * 0.01, -0.42, 0.01), V(sd * 0.01, -0.84, 0.01), def.legLower ? 0.062 : 0.055); g.add(sk);
        if (def.legLower) { const th = new THREE.Mesh(UNIT_CYL, lower); MP.span(th, V(0, 0.0, 0), V(sd * 0.01, -0.36, 0.01), 0.1); g.add(th); }
      }
      box(g, 0.12, 0.085, 0.26, shoe, sd * 0.01, -0.875, 0.05);
      return g;
    });
    // wrap skirt: grows downward from the waist when it is put on
    const skirt = new THREE.Group(); skirt.position.y = 0.97; body.add(skirt);
    if (def.skirt) {
      const sg = new THREE.CylinderGeometry(0.2, 0.235, 0.92, 7); sg.translate(0, -0.46, 0);
      const sm = new THREE.Mesh(sg, MP.mat(def.skirt)); sm.scale.z = 0.82; skirt.add(sm);
      box(skirt, 0.42, 0.06, 0.34, MP.mat(new THREE.Color(def.skirt).multiplyScalar(0.8)), 0, -0.02, 0);
      const fold = box(skirt, 0.02, 0.8, 0.02, MP.mat(new THREE.Color(def.skirt).multiplyScalar(0.7)), 0.06, -0.48, 0.185); fold.rotation.z = 0.05;
    }
    skirt.visible = false;
    // torso
    const topFront = def.topFront ? MP.mat(0xffffff, { map: def.topFront }) : (def.topTex ? MP.mat(0xffffff, { map: def.topTex }) : top), topSide = def.topTex ? MP.mat(0xffffff, { map: def.topTex }) : top;
    { const t = new THREE.Mesh(UNIT_BOX, [topSide, topSide, topSide, topSide, topFront, topSide]); t.scale.set(0.44, 0.6, 0.26); t.position.set(0, 1.22, 0); body.add(t); }
    box(body, 0.445, 0.05, 0.265, MP.mat(new THREE.Color(def.top).multiplyScalar(0.85)), 0, 0.94, 0);
    box(body, 0.19, 0.035, 0.19, top, 0, 1.53, 0);
    const neck = new THREE.Mesh(UNIT_CYL, skin); MP.span(neck, V(0, 1.5, 0), V(0, 1.63, 0), 0.056); body.add(neck);
    // arms: meshes re-placed every frame by IK
    const arms = [-1, 1].map(sd => {
      const a = { sd, S: V(sd * 0.235, SHOULDER_Y, 0) };
      const upM = def.upperSleeve !== undefined ? MP.mat(def.upperSleeve) : (def.sleeveTex ? MP.mat(0xffffff, { map: def.sleeveTex }) : top);
      const foreM = def.foreSleeve !== undefined ? MP.mat(def.foreSleeve) : (def.sleeveTex ? MP.mat(0xffffff, { map: def.sleeveTex }) : top);
      a.upper = new THREE.Mesh(UNIT_CYL, upM); body.add(a.upper);
      a.upperSkin = def.sleeve === 'short' ? new THREE.Mesh(UNIT_CYL, skin) : null; if (a.upperSkin) body.add(a.upperSkin);
      a.fore = new THREE.Mesh(UNIT_CYL, def.sleeve === 'short' ? skin : foreM); body.add(a.fore);
      a.fingers = [0, 1].map(() => { const f = new THREE.Mesh(UNIT_BOX, skin); f.scale.set(0.018, 0.075, 0.02); f.visible = false; body.add(f); return f; });
      a.hand = new THREE.Mesh(UNIT_BOX, skin); body.add(a.hand);
      if ((def.wristband && sd === 1) || (def.watch && sd === def.watch)) { a.band = new THREE.Mesh(UNIT_CYL, MP.mat(0x111111)); body.add(a.band); }
      return a;
    });
    // head
    const head = new THREE.Group(); head.position.set(0, 1.76, 0); body.add(head);
    const fm = MP.mat(0xffffff, { map: face(def.face) });
    const hb = new THREE.Mesh(UNIT_BOX, [skin, skin, skin, skin, fm, skin]); hb.scale.set(0.235, 0.29, 0.25); head.add(hb);
    box(head, 0.04, 0.07, 0.05, skin, -0.122, -0.005, -0.01); box(head, 0.04, 0.07, 0.05, skin, 0.122, -0.005, -0.01);
    if (def.earrings) [-1, 1].forEach(sd => box(head, 0.016, 0.03, 0.016, MP.mat(0xd9a83c), sd * 0.127, -0.05, 0));
    const tail = HAIR[def.hairStyle](head, hair);
    // things that can be held in a hand (shown when the timeline says so)
    const props = makeProps(body);
    if (def.hat === 'bucket') {
      const hm = MP.mat(def.hatColor);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.25, 0.02, 10), hm); brim.position.set(0, 0.14, 0); brim.rotation.x = -0.06; head.add(brim);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.155, 0.14, 8), hm); crown.position.set(0, 0.215, -0.005); head.add(crown);
      box(head, 0.004, 0.2, 0.004, MP.mat(0x222222), -0.1, -0.02, 0.1); box(head, 0.004, 0.2, 0.004, MP.mat(0x222222), 0.1, -0.02, 0.1);
    } else if (def.hat === 'cap') {
      const hm = MP.mat(def.hatColor);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), hm); crown.scale.set(1, 0.75, 1.05); crown.position.set(0, 0.15, -0.01); head.add(crown);
      box(head, 0.2, 0.018, 0.13, hm, 0, 0.152, 0.17).rotation.x = 0.12;
    }
    if (def.hat === 'beanie') { const bn = new THREE.Mesh(new THREE.SphereGeometry(0.155, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), MP.mat(def.hatColor)); bn.scale.set(1, 0.95, 1.03); bn.position.set(0, 0.11, -0.01); head.add(bn); box(head, 0.29, 0.05, 0.3, MP.mat(new THREE.Color(def.hatColor).multiplyScalar(0.85)), 0, 0.12, -0.01); }
    if (def.scarf) {        // chunky knit scarf: a wrap round the neck and one end hanging in front, with fringe
      const sm = MP.mat(0xffffff, { map: def.scarf });
      box(body, 0.36, 0.13, 0.33, sm, 0, 1.5, 0.01); box(body, 0.3, 0.08, 0.24, sm, 0.01, 1.58, -0.03);
      const end = box(body, 0.12, 0.42, 0.06, sm, -0.06, 1.27, 0.165); end.rotation.z = 0.06;
      for (let i = 0; i < 6; i++) box(body, 0.014, 0.08, 0.014, MP.mat([0x6b4a3a, 0x4a5a8e, 0xbfae9e, 0x2f3150][i % 4]), -0.1 + i * 0.016, 1.02, 0.17);
    }
    if (def.bag === 'cross') {   // strap across the chest from one shoulder to the other hip, small bag at the hip
      const sd = def.bagSide || 1, strapM = MP.mat(def.strapColor || 0x1a1a1e);
      const st = new THREE.Mesh(UNIT_BOX, strapM); MP.span(st, V(-sd * 0.15, 1.56, 0.13), V(sd * 0.22, 1.0, 0.15), 1); st.scale.x = def.strapWide ? 0.06 : 0.015; st.scale.z = 0.012; body.add(st);
      const stb = new THREE.Mesh(UNIT_BOX, strapM); MP.span(stb, V(-sd * 0.15, 1.56, -0.12), V(sd * 0.22, 1.0, -0.14), 1); stb.scale.x = st.scale.x; stb.scale.z = 0.012; body.add(stb);
      if (def.bagColor !== undefined) box(body, 0.17, 0.12, 0.08, MP.mat(def.bagColor), sd * 0.27, 0.95, 0.06).rotation.z = -sd * 0.12;
    }
    if (def.towel) { const tw = MP.mat(0xf2f2ee); box(body, 0.12, 0.05, 0.3, tw, def.towel * 0.16, 1.57, 0); box(body, 0.12, 0.28, 0.03, tw, def.towel * 0.17, 1.42, 0.14); box(body, 0.12, 0.22, 0.03, tw, def.towel * 0.16, 1.45, -0.14); }
    // bags
    let bag = null;
    if (def.bag === 'tote') {
      bag = new THREE.Group(); body.add(bag);
      box(bag, 0.27, 0.3, 0.08, MP.mat(def.bagColor), -0.3, 1.02, -0.09);
      const st = box(bag, 0.03, 0.55, 0.02, MP.mat(def.bagColor), -0.2, 1.38, -0.04); st.rotation.z = -0.35;
    } else if (def.bag === 'backpack') {
      bag = new THREE.Group(); body.add(bag);
      box(bag, 0.3, 0.36, 0.14, MP.mat(def.bagColor), 0, 1.24, -0.2);
      box(bag, 0.26, 0.1, 0.03, MP.mat(new THREE.Color(def.bagColor).multiplyScalar(0.85)), 0, 1.12, -0.28);
      [-1, 1].forEach(sd => box(bag, 0.035, 0.42, 0.02, MP.mat(0x2a2a2a), sd * 0.12, 1.3, 0.135));
    }
    { const s = def.scale || 1, w = def.width || 1; root.scale.set(s * w, s, s * w); }
    root.traverse(m => { if (m.isMesh) m.castShadow = true; });

    const S = V(0, 0, 0), up = V(0, 1, 0), tmp = V(0, 0, 0);
    // st: { x, z, yaw, phase, amp, arms: {[-1|1]: {T, pole, flat, swing}}, look: [yaw, pitch], skirt, bag, t }
    function apply(st) {
      root.position.set(st.x, st.y || 0, st.z); root.rotation.y = st.yaw;
      const skirtOn = st.skirt || 0;
      body.position.y = Math.abs(Math.cos(st.phase)) * 0.03 * st.amp;
      body.scale.y = 1 + Math.sin(st.t * 1.6 + (def.breathPhase || 0)) * 0.005;
      const legSwing = MP.lerp(0.5, 0.22, skirtOn);
      legs.forEach((l, i) => { l.rotation.x = (i ? -1 : 1) * Math.sin(st.phase) * legSwing * st.amp; });
      skirt.visible = skirtOn > 0.02; skirt.scale.y = Math.max(0.02, skirtOn); skirt.rotation.x = Math.sin(st.phase * 2) * 0.03 * st.amp;
      arms.forEach(a => {
        const P = st.arms[a.sd], T = P.T.clone();
        T.z += -a.sd * Math.sin(st.phase) * 0.13 * st.amp * P.swing;   // arms swing against the legs
        const { E, W } = MP.ik(a.S, T, UPPER, FORE, P.pole);
        if (a.upperSkin) { const M = a.S.clone().lerp(E, 0.45); MP.span(a.upper, a.S, M, 0.088); MP.span(a.upperSkin, M, E, 0.05); MP.span(a.fore, E, W, 0.046); }
        else { MP.span(a.upper, a.S, E, 0.08); MP.span(a.fore, E, W, 0.072); }
        if (a.band) MP.span(a.band, W.clone().lerp(E, 0.08), W.clone().lerp(E, 0.16), 0.05);
        // hand: a fist along the forearm, or an upright flat palm for namaste
        tmp.copy(W).sub(E).normalize();
        a.fingers.forEach(f => { f.visible = false; });
        if (P.peace > 0.5) {
          a.hand.scale.set(0.065, 0.075, 0.05); a.hand.position.copy(W).add(V(0, 0.035, 0.01)); a.hand.quaternion.set(0, 0, 0, 1); a.hand.rotation.z = a.sd * 0.15;
          a.fingers.forEach((f, k) => { f.visible = true; f.position.copy(a.hand.position).add(V((k ? 1 : -1) * 0.016 - a.sd * 0.012, 0.07, 0)); f.quaternion.set(0, 0, 0, 1); f.rotation.z = (k ? -1 : 1) * 0.2 + a.sd * 0.15; });
        } else if (P.flat > 0.5) { a.hand.scale.set(0.045, 0.12, 0.075); a.hand.position.set(a.sd * 0.024, W.y + 0.055, W.z); a.hand.quaternion.set(0, 0, 0, 1); a.hand.rotation.x = 0.15; }
        else { a.hand.scale.set(0.06, 0.1, 0.075); a.hand.position.copy(W).addScaledVector(tmp, 0.05); a.hand.quaternion.setFromUnitVectors(up, tmp); }
      });
      const lk = st.look || [0, 0];
      head.rotation.set(lk[1] + Math.sin(st.t * 0.9 + (def.breathPhase || 0)) * 0.02, lk[0] + Math.sin(st.t * 0.6 + (def.breathPhase || 0)) * 0.04, def.tilt || 0);
      if (tail) tail.rotation.z = Math.sin(st.phase) * 0.12 * st.amp + Math.sin(st.t * 1.3) * 0.03;
      if (bag) bag.visible = !st.bagGone;
      // held items follow the hand
      Object.values(props).forEach(p => { p.visible = false; });
      if (st.hold) arms.forEach(a => {
        const what = st.hold[a.sd < 0 ? 'R' : 'L']; if (!what || !props[what]) return;
        const p = props[what], W = a.hand.position; p.visible = true;
        if (what === 'tray') p.position.set(0, W.y - 0.02, W.z + 0.04); else if (what === 'phone') p.position.set(W.x, W.y + 0.06, W.z + 0.03); else p.position.set(W.x - a.sd * 0.01, W.y - 0.02, W.z + 0.04);
      });
      // sitting: body lowered onto a stool, legs forward
      const sit = st.sit || 0;
      if (sit > 0) { body.position.y -= 0.16 * sit; legs.forEach(l => { l.rotation.x = MP.lerp(l.rotation.x, -1.45, sit); }); }
    }
    return { root, apply, def };
  };
})(window.MP);
