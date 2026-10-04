// Memory Movie player: reads a Scene Definition, builds the world, and draws any moment t.
// renderAt(t) is deterministic, so the same t always gives the same frame (used for recording).
(function (MP) {
  const W = 640, H = 480;

  MP.createPlayer = function (def, glCanvas, outCanvas) {
    const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(W, H, false);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
    const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xc4d8ee, 60, 200);
    const cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 900);
    scene.add(new THREE.HemisphereLight(0xdfeaff, 0x8a8070, 0.62));
    const sun = new THREE.DirectionalLight(0xfff3dc, 0.95); sun.position.set(-14, 26, 18); sun.target.position.set(0, 0, -4);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
    sun.shadow.bias = -0.0015; scene.add(sun, sun.target);

    const env = MP.ENV[def.environment](scene);
    const cast = def.cast.map(c => {
      const a = MP.buildCharacter(c.look); scene.add(a.root);
      return { def: c, actor: a, path: MP.makePath(c.path), poses: MP.makePoses(c.poses || [{ t: 0 }]), skirt: MP.makeRamp(c.skirt || []) };
    });
    // bags left at the counter appear when handed over
    const counterBags = cast.filter(c => c.def.bagGoneAt !== undefined).map((c, i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(i ? 0.3 : 0.27, i ? 0.32 : 0.28, i ? 0.14 : 0.08), MP.mat(c.def.look.bagColor));
      m.position.copy(env.counterSpot.bags).add(MP.V(0, i ? 0.16 : 0.14, i ? 0.55 : 0)); m.castShadow = true; scene.add(m); return { m, at: c.def.bagGoneAt };
    });
    const camAt = MP.makeCamera(def.camera), fs = def.finalShot;

    // ---- 2D overlay on top of the 3D frame: shutter flash, caption, printed photo, original photo ----
    const out = outCanvas.getContext('2d');
    let snap = null, original = null;
    const font = px => px + 'px "DotGothic16", ui-monospace, monospace';
    function drawPrint(img, cx, cy, w, rot, label) {
      const h = w * 0.75, b = w * 0.045;
      out.save(); out.translate(cx, cy); out.rotate(rot);
      out.fillStyle = 'rgba(0,0,0,.35)'; out.fillRect(-w / 2 - b + 5, -h / 2 - b + 6, w + b * 2, h + b * 4.2);
      out.fillStyle = '#f7f4ec'; out.fillRect(-w / 2 - b, -h / 2 - b, w + b * 2, h + b * 4.2);
      out.imageSmoothingEnabled = true;
      const ir = img.width / img.height, fr = w / h; let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (ir > fr) { sw = img.height * fr; sx = (img.width - sw) / 2; } else { sh = img.width / fr; sy = (img.height - sh) / 2; }
      out.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
      if (label) { out.fillStyle = '#4a4438'; out.font = font(Math.round(w * 0.07)); out.textAlign = 'center'; out.fillText(label, 0, h / 2 + b * 2.6); }
      out.restore();
    }
    function caption(alpha) {
      out.save(); out.globalAlpha = alpha; out.textAlign = 'right'; out.lineJoin = 'round'; const x = W * 0.95;
      out.font = font(14); out.lineWidth = 4; out.strokeStyle = '#0b1020'; out.fillStyle = '#fff';
      out.strokeText(def.caption.small, x, H * 0.85); out.fillText(def.caption.small, x, H * 0.85);
      const cw = out.measureText(def.caption.small).width; out.fillStyle = '#0b1020'; out.fillRect(x - cw - 1, H * 0.85 + 4, cw + 2, 4); out.fillStyle = '#fff'; out.fillRect(x - cw, H * 0.85 + 5, cw, 2);
      out.font = font(28); out.lineWidth = 6; out.strokeText(def.caption.big, x, H * 0.935); out.fillText(def.caption.big, x, H * 0.935);
      out.restore();
    }

    function renderAt(t) {
      cast.forEach(c => {
        const p = c.path(t), po = c.poses(t), amp = MP.clamp(p.speed / 0.9, 0, 1);
        c.actor.apply({ x: p.x, z: p.z, yaw: p.yaw, phase: p.dist * 5.2, amp, arms: po.arms, look: po.look, skirt: c.skirt(t), bagGone: c.def.bagGoneAt !== undefined && t >= c.def.bagGoneAt, t });
      });
      counterBags.forEach(b => { b.m.visible = t >= b.at; });
      const cs = camAt(t); cam.position.set(...cs.pos); cam.lookAt(...cs.tgt); if (cam.fov !== cs.fov) { cam.fov = cs.fov; cam.updateProjectionMatrix(); }
      env.update(t, cam.position);
      renderer.render(scene, cam);

      out.imageSmoothingEnabled = false; out.globalAlpha = 1; out.drawImage(glCanvas, 0, 0, W, H);
      // keep a copy of the exact shutter frame for the printed photo
      if (t >= fs.shutterAt && !snap) { snap = document.createElement('canvas'); snap.width = W; snap.height = H; snap.getContext('2d').drawImage(glCanvas, 0, 0); }
      if (t < fs.shutterAt) snap = null;
      const sinceShot = t - fs.shutterAt;
      if (sinceShot >= 0 && sinceShot < 0.9) { out.fillStyle = `rgba(255,255,255,${(1 - sinceShot / 0.9) * 0.95})`; out.fillRect(0, 0, W, H); }
      if (t >= fs.shutterAt + 2.4) caption(MP.smooth((t - fs.shutterAt - 2.4) / 1.2));
      if (snap && t >= fs.printAt) {
        const k = MP.smooth((t - fs.printAt) / 1.4);
        out.fillStyle = `rgba(10,12,20,${0.45 * k})`; out.fillRect(0, 0, W, H);
        const two = original && t >= fs.originalAt;
        const kx = two ? MP.smooth((t - fs.originalAt) / 1.2) : 0;
        drawPrint(snap, MP.lerp(W / 2, W * 0.7, kx), MP.lerp(H * 0.6, H * 0.45, k), MP.lerp(W * 0.9, W * 0.42, k), MP.lerp(0, 0.05, k), 'Memory Polygon');
        if (two) drawPrint(original, W * 0.3, MP.lerp(H * 1.2, H * 0.45, kx), W * 0.42, -0.04, 'あの日の写真');
      }
      if (t > def.duration - 1) { out.fillStyle = `rgba(0,0,0,${MP.clamp(t - (def.duration - 1), 0, 1)})`; out.fillRect(0, 0, W, H); }
    }
    return { renderAt, duration: def.duration, setOriginal(img) { original = img; } };
  };
})(window.MP);
