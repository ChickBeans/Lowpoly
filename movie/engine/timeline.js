// Timeline evaluation: everything is a pure function of time t, so the same scene always
// renders the same frame (needed for scrubbing and for recording).
(function (MP) {
  const TURN = 0.4, POSE_BLEND = 0.6;

  // Path keys: [{ t, x, z, y?, yaw?, cut? }]. y is the floor height (slopes, stairs, rooftops). Between keys the actor walks (or stands if the spot is
  // the same). A key with cut:true jumps there at its time (used at camera cuts).
  MP.makePath = function (keys) {
    keys = keys.map(k => Object.assign({ y: 0 }, k));
    let prevYaw = keys[0].yaw || 0;
    for (let i = 0; i < keys.length; i++) {          // resolve a facing for every key
      const k = keys[i], p = keys[i - 1];
      if (k.yaw === undefined) k.yaw = (p && !k.cut && Math.hypot(k.x - p.x, k.z - p.z) > 0.01) ? Math.atan2(k.x - p.x, k.z - p.z) : prevYaw;
      prevYaw = k.yaw;
    }
    const dist = [0];
    for (let i = 1; i < keys.length; i++) dist.push(dist[i - 1] + (keys[i].cut ? 0 : Math.hypot(keys[i].x - keys[i - 1].x, keys[i].z - keys[i - 1].z)));
    return function at(t) {
      if (t <= keys[0].t) return { x: keys[0].x, y: keys[0].y, z: keys[0].z, yaw: keys[0].yaw, speed: 0, dist: 0 };
      for (let i = 0; i < keys.length - 1; i++) {
        const A = keys[i], B = keys[i + 1];
        if (t >= B.t) continue;
        const dur = B.t - A.t, u = (t - A.t) / dur, d = Math.hypot(B.x - A.x, B.z - A.z);
        if (B.cut || d < 0.01) {                     // standing: turn toward the next facing near the end
          const w = MP.smooth((t - (B.t - Math.min(TURN * 1.5, dur))) / Math.min(TURN * 1.5, dur));
          return { x: A.x, y: A.y, z: A.z, yaw: B.cut ? A.yaw : MP.angleLerp(A.yaw, B.yaw, w), speed: 0, dist: dist[i] };
        }
        const lin = B.ease === 'linear', s = lin ? u : MP.smooth(u), dir = Math.atan2(B.x - A.x, B.z - A.z);
        let yaw = MP.angleLerp(A.yaw, dir, MP.clamp(u * dur / TURN, 0, 1));
        yaw = MP.angleLerp(yaw, B.yaw, 1 - MP.clamp((1 - u) * dur / TURN, 0, 1));
        const speed = lin ? d / dur : d / dur * 6 * u * (1 - u);     // derivative of smoothstep
        return { x: MP.lerp(A.x, B.x, s), y: MP.lerp(A.y, B.y, s), z: MP.lerp(A.z, B.z, s), yaw, speed, dist: dist[i] + d * s };
      }
      const L = keys[keys.length - 1]; return { x: L.x, y: L.y, z: L.z, yaw: L.yaw, speed: 0, dist: dist[dist.length - 1] };
    };
  };

  // Pose keys: [{ t, R, L, look:[yaw,pitch] }] — each key blends in over POSE_BLEND seconds.
  MP.makePoses = function (keys) {
    return function at(t) {
      let i = 0; while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
      const cur = keys[i], prev = keys[Math.max(0, i - 1)], w = i === 0 ? 1 : MP.smooth((t - cur.t) / POSE_BLEND);
      const arms = {};
      [[-1, 'R'], [1, 'L']].forEach(([sd, k]) => {
        const a = MP.POSES[prev[k] || 'idle'](sd), b = MP.POSES[cur[k] || 'idle'](sd);
        arms[sd] = { T: a.T.lerp(b.T, w), pole: a.pole.lerp(b.pole, w), flat: MP.lerp(a.flat, b.flat, w), peace: MP.lerp(a.peace || 0, b.peace || 0, w), swing: MP.lerp(prev[k] === 'idle' || !prev[k] ? 1 : 0, cur[k] === 'idle' || !cur[k] ? 1 : 0, w) };
      });
      const la = prev.look || [0, 0], lb = cur.look || [0, 0];
      return { arms, look: [MP.lerp(la[0], lb[0], w), MP.lerp(la[1], lb[1], w)] };
    };
  };

  // Ramps: [{ t, to, dur }] — a value that eases to `to` starting at t over dur seconds.
  MP.makeRamp = function (keys, start) {
    return function at(t) {
      let v = start || 0;
      for (const k of keys) { if (t < k.t) break; v = MP.lerp(v, k.to, MP.smooth((t - k.t) / (k.dur || 0.001))); }
      return v;
    };
  };

  // Camera shots: [{ t0, t1, from:{pos,tgt,fov}, to:{pos,tgt,fov}, ease }] — a hard cut between shots.
  MP.makeCamera = function (shots) {
    return function at(t) {
      let s = shots[0]; for (const sh of shots) if (t >= sh.t0) s = sh;
      const u = MP.clamp((t - s.t0) / (s.t1 - s.t0), 0, 1), e = s.ease === 'linear' ? u : MP.smooth(u), to = s.to || s.from;
      const P = (a, b) => [0, 1, 2].map(i => MP.lerp(a[i], b[i], e));
      return { pos: P(s.from.pos, to.pos), tgt: P(s.from.tgt, to.tgt), fov: MP.lerp(s.from.fov || 50, to.fov || s.from.fov || 50, e) };
    };
  };
})(window.MP);
