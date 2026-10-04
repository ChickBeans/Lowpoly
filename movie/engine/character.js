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
    phone:    sd => ({ T: V(sd * 0.07, 1.52, 0.3), pole: V(sd, -1, 0), flat: 0 })
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
    });
  }

  function box(par, w, h, d, m, x, y, z) { const b = new THREE.Mesh(UNIT_BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); par.add(b); return b; }

  // hair styles: boxes placed relative to the head centre (head is 0.24 x 0.29 x 0.25)
  const HAIR = {
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

  MP.buildCharacter = function (def) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const skin = MP.mat(def.skin), top = MP.mat(def.top), shorts = MP.mat(def.shorts || def.bottom || 0x333333), shoe = MP.mat(def.shoes), hair = MP.mat(def.hair);
    // legs: groups pivoting at the hip
    const legs = [-1, 1].map(sd => {
      const g = new THREE.Group(); g.position.set(sd * 0.1, 0.92, 0); body.add(g);
      if (def.longPants) { const p = new THREE.Mesh(UNIT_CYL, shorts); MP.span(p, V(0, 0, 0), V(0, -0.84, 0.01), 0.1); g.add(p); }
      else {
        const sh = new THREE.Mesh(UNIT_CYL, shorts); MP.span(sh, V(0, 0.02, 0), V(sd * 0.01, -0.42, 0.01), 0.112); g.add(sh);
        const sk = new THREE.Mesh(UNIT_CYL, skin); MP.span(sk, V(sd * 0.01, -0.42, 0.01), V(sd * 0.01, -0.84, 0.01), 0.055); g.add(sk);
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
    box(body, 0.44, 0.6, 0.26, top, 0, 1.22, 0);
    box(body, 0.445, 0.05, 0.265, MP.mat(new THREE.Color(def.top).multiplyScalar(0.85)), 0, 0.94, 0);
    box(body, 0.19, 0.035, 0.19, top, 0, 1.53, 0);
    const neck = new THREE.Mesh(UNIT_CYL, skin); MP.span(neck, V(0, 1.5, 0), V(0, 1.63, 0), 0.056); body.add(neck);
    // arms: meshes re-placed every frame by IK
    const arms = [-1, 1].map(sd => {
      const a = { sd, S: V(sd * 0.235, SHOULDER_Y, 0) };
      a.upper = new THREE.Mesh(UNIT_CYL, top); body.add(a.upper);
      a.upperSkin = def.sleeve === 'short' ? new THREE.Mesh(UNIT_CYL, skin) : null; if (a.upperSkin) body.add(a.upperSkin);
      a.fore = new THREE.Mesh(UNIT_CYL, def.sleeve === 'short' ? skin : top); body.add(a.fore);
      a.hand = new THREE.Mesh(UNIT_BOX, skin); body.add(a.hand);
      if (def.wristband && sd === 1) { a.band = new THREE.Mesh(UNIT_CYL, MP.mat(0x111111)); body.add(a.band); }
      return a;
    });
    // head
    const head = new THREE.Group(); head.position.set(0, 1.76, 0); body.add(head);
    const fm = MP.mat(0xffffff, { map: face(def.face) });
    const hb = new THREE.Mesh(UNIT_BOX, [skin, skin, skin, skin, fm, skin]); hb.scale.set(0.235, 0.29, 0.25); head.add(hb);
    box(head, 0.04, 0.07, 0.05, skin, -0.122, -0.005, -0.01); box(head, 0.04, 0.07, 0.05, skin, 0.122, -0.005, -0.01);
    if (def.earrings) [-1, 1].forEach(sd => box(head, 0.016, 0.03, 0.016, MP.mat(0xd9a83c), sd * 0.127, -0.05, 0));
    const tail = HAIR[def.hairStyle](head, hair);
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
    root.scale.setScalar(def.scale || 1);
    root.traverse(m => { if (m.isMesh) m.castShadow = true; });

    const S = V(0, 0, 0), up = V(0, 1, 0), tmp = V(0, 0, 0);
    // st: { x, z, yaw, phase, amp, arms: {[-1|1]: {T, pole, flat, swing}}, look: [yaw, pitch], skirt, bag, t }
    function apply(st) {
      root.position.set(st.x, 0, st.z); root.rotation.y = st.yaw;
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
        if (P.flat > 0.5) { a.hand.scale.set(0.045, 0.12, 0.075); a.hand.position.set(a.sd * 0.024, W.y + 0.055, W.z); a.hand.quaternion.set(0, 0, 0, 1); a.hand.rotation.x = 0.15; }
        else { a.hand.scale.set(0.06, 0.1, 0.075); a.hand.position.copy(W).addScaledVector(tmp, 0.05); a.hand.quaternion.setFromUnitVectors(up, tmp); }
      });
      const lk = st.look || [0, 0];
      head.rotation.set(lk[1] + Math.sin(st.t * 0.9 + (def.breathPhase || 0)) * 0.02, lk[0] + Math.sin(st.t * 0.6 + (def.breathPhase || 0)) * 0.04, def.tilt || 0);
      if (tail) tail.rotation.z = Math.sin(st.phase) * 0.12 * st.amp + Math.sin(st.t * 1.3) * 0.03;
      if (bag) bag.visible = !st.bagGone;
    }
    return { root, apply, def };
  };
})(window.MP);
