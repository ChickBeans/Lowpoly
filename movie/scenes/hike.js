// Scene Definition: "A hiking day". Up the wooded trail, into town, up the building's outdoor
// stairs, out onto the rooftop, and the three of them at the railing for the photo.
// The people are generic polygon versions; no photo is stored here.
window.MP = window.MP || {}; MP.SCENES = MP.SCENES || {};
(function () {
  const PI = Math.PI, E = PI / 2;
  const SLOPE = 4.8 / 14, ty = x => -6 + (x + 63) * SLOPE;          // trail height (matches hike-env)
  const RISE = 3.2, ROOF = 16, LANE = [-8.15, -9.75];
  const stair = (f, u) => ({ x: LANE[f % 2], z: f % 2 ? -3.4 + 6.8 * u : 3.4 - 6.8 * u, y: f * RISE + RISE * u });
  const FINAL_CAM = { pos: [0, 17.4, -1.6], tgt: [0, 16.95, -20], fov: 58 };

  // textures for patterned clothes
  const dots = MP.tex(16, 16, g => { g.fillStyle = '#2c3f86'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d9def0'; [[2, 2], [9, 4], [5, 9], [12, 11], [1, 13], [13, 1]].forEach(([x, y]) => g.fillRect(x, y, 2, 2)); }, 1, 2);
  const stripes = MP.tex(8, 16, g => { g.fillStyle = '#1e2638'; g.fillRect(0, 0, 8, 16); g.fillStyle = '#e8eaee'; for (let y = 1; y < 16; y += 3) g.fillRect(0, y, 8, 1); }, 1, 1);
  const jacket = zip => MP.tex(32, 32, g => { g.fillStyle = '#f2f2ef'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#ee6a3a'; g.fillRect(0, 0, 32, 9); g.fillStyle = '#26304a'; g.fillRect(0, 24, 32, 8); g.fillRect(0, 9, 4, 15); g.fillRect(28, 9, 4, 15);
    if (zip) { g.fillStyle = '#d6f03a'; g.fillRect(15, 3, 2, 29); g.fillStyle = '#e8402a'; g.fillRect(4, 27, 24, 2); } }, 1, 1);

  const face = (skin, shade, brow, lip, extra) => Object.assign({ skin, shade, brow, browRows: [11], lip, teeth: true }, extra || {});
  // walking keys helper: same facing, constant pace
  const walk = (t0, t1, a, b, yaw) => [{ t: t0, x: a[0], z: a[1], y: a[2] || 0, yaw }, { t: t1, x: b[0], z: b[1], y: b[2] || 0, yaw, ease: 'linear' }];

  function person(id, order, look, fin, finPose) {
    const lag = order * 1.0, zOff = [0, -0.15, 0.15][order], line = [-1.2, 0, 1.2][order];
    const path = [
      // A: the trail, single file
      ...walk(0.3, 11.8, [-63 - order * 1.4, 12 + zOff, ty(-63 - order * 1.4)], [-50 - order * 1.4, 12 + zOff, ty(-50 - order * 1.4)], E),
      // B: the street, side by side
      { t: 12, x: -29.5, z: 12 + line, cut: true, yaw: E }, { t: 21.6, x: -17.5, z: 12 + line, yaw: E, ease: 'linear' },
      // C: first flight of the outdoor stairs, one behind the other
      { t: 22, x: LANE[0], z: 4.4 + order * 1.1, cut: true, yaw: PI }, { t: 22.4 + lag * 0.9, x: LANE[0], z: 3.4, yaw: PI },
      { t: 27.6 + lag * 0.9, ...stair(0, 1), yaw: PI, ease: 'linear' },
      // C2: the last flight and out onto the roof
      ...(order < 2 ? [{ t: 30, ...stair(4, order ? 0.06 : 0.32), cut: true, yaw: PI }]
                    : [{ t: 30, x: -8.95, z: 4.3, y: 4 * RISE, cut: true, yaw: -E }, { t: 30.9, ...stair(4, 0), yaw: PI }]),
      { t: 32.2 + lag * 0.7, ...stair(4, 1), yaw: PI, ease: 'linear' },
      { t: 33.0 + lag * 0.7, x: -8.0, z: -4.3, y: ROOF }, { t: 34.2 + lag * 0.7, x: -5.6 + order * 0.3, z: -4.4 + order * 0.3, y: ROOF },
      // D: to the railing to take in the view
      { t: 37.0 + lag * 0.4, x: line * 1.15 - 0.3, z: -6.15, y: ROOF, yaw: PI }, { t: 40.2, x: line * 1.15 - 0.3, z: -6.15, y: ROOF, yaw: PI },
      // E: turn round and line up for the photo
      { t: 43.4, x: fin[0], z: fin[1], y: ROOF, yaw: 0 }
    ];
    return { id, look, path, poses: finPose };
  }

  MP.SCENES.hike = {
    schemaVersion: '0.1',
    id: 'hike-rooftop',
    title: 'Memory Movie：ハイキングの日',
    duration: 60,
    environment: 'hike',
    caption: { small: 'A hiking day', big: 'Rooftop View' },
    beats: [
      { t: 0, label: '山道を登る' }, { t: 12, label: '街に出る' }, { t: 22, label: 'ビルの階段' }, { t: 30, label: '屋上へ' },
      { t: 34, label: '見晴らし' }, { t: 40, label: '写真の位置へ' }, { t: 45, label: '📸' }
    ],
    finalShot: { shutterAt: 45, holdUntil: 60, printAt: 50, originalAt: 53, camera: FINAL_CAM },

    cast: [
      person('mom', 0, { skin: 0xe9c2a0, hair: 0x2a1e18, hairStyle: 'short', hat: 'bucket', hatColor: 0x1e1f22, top: 0xf2f2ef, sleeve: 'long', upperSleeve: 0xf2f2ef, foreSleeve: 0x18181a,
          shorts: 0x4a5585, legLower: dots, shoes: 0x8a8c90, bag: 'backpack', bagColor: 0x3f5a36, scale: 0.92, breathPhase: 0.4,
          face: face('#eac3a2', '#c99c7c', '#2a1e18', '#b8746a', { blush: true }) },
        [-1.32, -5.55],
        [{ t: 0 }, { t: 6, look: [0.3, -0.2] }, { t: 8, look: [0, 0] }, { t: 15.5, look: [0.5, 0] }, { t: 17.2, look: [0, 0] }, { t: 18.6, R: 'point_fwd' }, { t: 20.4, R: 'idle' },
         { t: 37.4, R: 'point_fwd', look: [0.1, 0.15] }, { t: 39.2, R: 'idle', look: [-0.4, 0] }, { t: 40.4, look: [0, 0] }, { t: 43.6, R: 'peace_up', L: 'peace_up', look: [0, 0.02] }]),
      person('mid', 1, { skin: 0xe6bd98, hair: 0x1c1714, hairStyle: 'wavy', topTex: jacket(false), topFront: jacket(true), upperSleeve: 0xee6a3a, foreSleeve: 0xf0f0ee, sleeve: 'long',
          shorts: 0x1f2433, longPants: true, shoes: 0x2a2a2e, bag: 'backpack', bagColor: 0x2f8a9a, width: 1.12, breathPhase: 1.7,
          face: face('#e7be9a', '#c4986f', '#1c1714', '#b06a5e', { browRows: [11, 12] }) },
        [0.02, -5.45],
        [{ t: 0 }, { t: 3, look: [0, -0.15] }, { t: 5, look: [0, 0] }, { t: 14.6, look: [-0.5, 0] }, { t: 17, look: [0, 0] }, { t: 37.8, look: [0.25, 0.1] },
         { t: 39.4, look: [0.45, 0] }, { t: 40.4, look: [0, 0] }, { t: 43.7, R: 'peace_chest', L: 'peace_chest', look: [0, 0.02] }]),
      person('right', 2, { skin: 0xdcb08a, hair: 0x1a1714, hairStyle: 'short', hat: 'cap', hatColor: 0x1b1b1d, topTex: stripes, sleeveTex: stripes, sleeve: 'long',
          shorts: 0x151517, shoes: 0x1c1c1c, bag: 'backpack', bagColor: 0x5e6266, towel: -1, watch: 1, width: 1.15, scale: 1.03, breathPhase: 2.9,
          face: face('#ddb18b', '#b98b66', '#1a1714', '#a8665a', { browRows: [11, 12] }) },
        [1.4, -5.6],
        [{ t: 0 }, { t: 7, look: [-0.3, -0.25] }, { t: 9, look: [0, 0] }, { t: 16, look: [-0.45, 0] }, { t: 18, look: [0, 0] }, { t: 38.2, look: [-0.2, -0.05] },
         { t: 40.4, look: [0, 0] }, { t: 43.8, L: 'hip', look: [0.05, 0.02] }])
    ],

    camera: [
      { t0: 0, t1: 12, ease: 'linear', from: { pos: [-63, ty(-63) + 1.7, 18.6], tgt: [-63.5, ty(-63.5) + 0.7, 12], fov: 50 }, to: { pos: [-50.5, ty(-50.5) + 1.7, 18.6], tgt: [-51.5, ty(-51.5) + 0.7, 12], fov: 50 } },
      { t0: 12, t1: 22, from: { pos: [-15.5, 1.7, 13.4], tgt: [-27, 1.1, 11.8], fov: 50 }, to: { pos: [-10.5, 1.7, 13.2], tgt: [-19.5, 1.1, 11.8], fov: 50 } },
      { t0: 22, t1: 30, from: { pos: [-17.5, 2.0, 7.5], tgt: [-8.6, 2.0, 0.5], fov: 52 }, to: { pos: [-16.5, 4.2, 4.5], tgt: [-8.8, 3.8, -1.5], fov: 52 } },
      { t0: 30, t1: 34, from: { pos: [-1.6, 17.7, 0.2], tgt: [-8.2, 15.6, -2.6], fov: 54 }, to: { pos: [-2.2, 17.7, -0.4], tgt: [-6.5, 16.2, -4.0], fov: 54 } },
      { t0: 34, t1: 40, from: { pos: [0.9, 17.9, 1.6], tgt: [-0.5, 14.6, -30], fov: 62 }, to: { pos: [0.6, 17.8, 0.4], tgt: [-0.6, 14.2, -30], fov: 62 } },
      { t0: 40, t1: 45, from: { pos: [4.8, 17.6, -2.6], tgt: [0, 16.9, -5.6], fov: 54 }, to: FINAL_CAM },
      { t0: 45, t1: 60, from: FINAL_CAM }
    ]
  };
})();
