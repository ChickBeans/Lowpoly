// Small shared helpers for the Memory Movie player. No scene knowledge lives here.
window.MP = window.MP || {};
(function (MP) {
  MP.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  MP.lerp = (a, b, t) => a + (b - a) * t;
  MP.smooth = t => { t = MP.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  MP.angleLerp = (a, b, t) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * t; };
  MP.V = (x, y, z) => new THREE.Vector3(x, y, z);

  // seeded random so every render of the same scene looks identical
  MP.rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // canvas texture, nearest-filtered (PS1 look: no blur)
  MP.tex = (w, h, draw, rx, ry) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); return t;
  };
  // materials: smooth-lit for characters, flat facets for buildings and props
  MP.mat = (c, extra) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, extra || {}));
  MP.flat = (c, extra) => new THREE.MeshPhongMaterial(Object.assign({ color: c, flatShading: true, shininess: 0, specular: 0 }, extra || {}));

  // place a unit mesh between two points (used for limbs that move every frame)
  const UP = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3();
  MP.span = (mesh, A, B, r) => {
    tmp.copy(B).sub(A); const len = tmp.length() || 1e-4;
    mesh.position.copy(A).add(B).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, tmp.divideScalar(len));
    mesh.scale.set(r, len, r);
  };
  // two-bone IK: elbow and wrist for a shoulder S reaching target T
  MP.ik = (S, T, a, b, pole) => {
    const d0 = T.clone().sub(S), d = Math.min(Math.max(d0.length(), 1e-3), a + b - 1e-4), dir = d0.normalize();
    const x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x));
    const perp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
    return { E: S.clone().addScaledVector(dir, x).addScaledVector(perp, h), W: S.clone().addScaledVector(dir, d) };
  };
})(window.MP);
