// Scene Definition: "The temple in London". Plain data — who is there, what they look like,
// where they walk and when, the camera shots, and the final photo moment.
// The two people are generic polygon versions of the couple; no photo is stored here.
window.MP = window.MP || {}; MP.SCENES = MP.SCENES || {};
(function () {
  const PI = Math.PI, R = -PI / 2, LFT = PI / 2;
  const FINAL_CAM = { pos: [0, 1.45, -1.6], tgt: [0, 3.25, -13.8], fov: 58 };
  const HIM_F = { skin: '#e7c3a2', shade: '#c49a7a', brow: '#141011', browRows: [11, 12], lip: '#a8706a', glasses: '#a8946c' };
  const HER_F = { skin: '#eec7a8', shade: '#cc9f82', brow: '#3a2219', browRows: [11], lip: '#c4605c', lash: true, blush: true, noseRing: true };
  const staffFace = (skin, shade, brow) => ({ skin, shade, brow, browRows: [11], lip: '#9a6458' });

  MP.SCENES.temple = {
    schemaVersion: '0.1',
    id: 'temple-london',
    duration: 60,
    environment: 'temple',
    caption: { small: 'London, United Kingdom', big: 'Neasden Temple' },
    beats: [
      { t: 0, label: '到着' }, { t: 9, label: '荷物を預ける' }, { t: 18, label: '腰巻きを借りる' },
      { t: 28, label: '寺院の話を聞く' }, { t: 39, label: '写真の位置へ' }, { t: 45, label: '📸' }
    ],
    finalShot: { shutterAt: 45, holdUntil: 60, printAt: 50, originalAt: 53, camera: FINAL_CAM },

    cast: [
      { id: 'him', look: { skin: 0xe2ba98, hair: 0x15171c, hairStyle: 'shortFringe', top: 0x1a1b1f, sleeve: 'long', shorts: 0x41444c, skirt: 0x1f2740, shoes: 0x2a2b2f,
          bag: 'tote', bagColor: 0x2b2b2e, face: HIM_F, breathPhase: 0 },
        path: [
          { t: 0, x: -1.0, z: 6.0, yaw: -2.2 }, { t: 0.4, x: -1.0, z: 6.0 }, { t: 8.6, x: -9.2, z: 0.9, yaw: R },
          { t: 18, x: 8.7, z: 4.6, cut: true }, { t: 21, x: 10.9, z: 2.35, yaw: PI },
          { t: 28, x: -0.7, z: -3.9, cut: true, yaw: 1.95 }, { t: 31.2, x: -0.7, z: -3.9, yaw: 1.95 }, { t: 32, x: -0.7, z: -3.9, yaw: PI },
          { t: 36.4, x: -0.7, z: -3.9, yaw: PI }, { t: 37.2, x: -0.7, z: -3.9, yaw: 1.95 },
          { t: 39.6, x: -0.7, z: -3.9, yaw: 1.95 }, { t: 43.8, x: -0.42, z: -5.8, yaw: 0 }
        ],
        poses: [
          { t: 0, R: 'strap' }, { t: 10.8, R: 'give', look: [0, 0.1] }, { t: 12.8, R: 'idle' }, { t: 16.4, look: [0.5, 0] },
          { t: 18, look: [0, 0] }, { t: 21.4, R: 'give', L: 'give', look: [0, 0.15] }, { t: 22.6, R: 'idle', L: 'idle' }, { t: 24.8, look: [0, 0.4] }, { t: 26.6, look: [0.45, 0] },
          { t: 28, look: [0, 0] }, { t: 32.2, look: [0, -0.4] }, { t: 36.4, look: [0, 0] }, { t: 37.6, R: 'clasp', L: 'clasp' },
          { t: 39.6, R: 'idle', L: 'idle' }, { t: 44.0, R: 'namaste', L: 'namaste', look: [0, 0.02] }
        ],
        skirt: [{ t: 22.6, to: 1, dur: 1.4 }],
        bagGoneAt: 12.4 },

      { id: 'her', look: { skin: 0xe8c4a6, hair: 0x4e2219, hairStyle: 'ponytail', top: 0x2f2f33, sleeve: 'short', shorts: 0x1c1c20, skirt: 0x1d2438, shoes: 0x161616,
          bag: 'backpack', bagColor: 0xb9a68a, wristband: true, earrings: true, face: HER_F, scale: 0.95, tilt: 0.03, breathPhase: 1.3 },
        path: [
          { t: 0, x: -0.3, z: 6.5, yaw: -2.2 }, { t: 0.7, x: -0.3, z: 6.5 }, { t: 8.9, x: -9.2, z: 1.75, yaw: R },
          { t: 18, x: 7.9, z: 4.8, cut: true }, { t: 21.3, x: 10.1, z: 2.35, yaw: PI },
          { t: 28, x: 0.15, z: -4.15, cut: true, yaw: 1.98 }, { t: 31.4, x: 0.15, z: -4.15, yaw: 1.98 }, { t: 32.2, x: 0.15, z: -4.15, yaw: PI },
          { t: 36.6, x: 0.15, z: -4.15, yaw: PI }, { t: 37.4, x: 0.15, z: -4.15, yaw: 1.98 },
          { t: 39.9, x: 0.15, z: -4.15, yaw: 1.98 }, { t: 43.9, x: 0.42, z: -5.8, yaw: 0 }
        ],
        poses: [
          { t: 0 }, { t: 13.6, R: 'give', L: 'give', look: [0, 0.1] }, { t: 15.6, R: 'idle', L: 'idle' }, { t: 16.6, look: [-0.5, 0] },
          { t: 18, look: [0, 0] }, { t: 22.2, R: 'give', L: 'give', look: [0, 0.15] }, { t: 23.4, R: 'idle', L: 'idle' }, { t: 25.0, look: [0, 0.4] }, { t: 26.8, look: [-0.45, 0] },
          { t: 28, R: 'clasp', L: 'clasp', look: [0, 0] }, { t: 32.4, look: [0.1, -0.42] }, { t: 36.6, look: [0, 0] },
          { t: 39.8, R: 'idle', L: 'idle' }, { t: 44.1, R: 'namaste', L: 'namaste', look: [0, 0.02] }
        ],
        skirt: [{ t: 23.6, to: 1, dur: 1.4 }],
        bagGoneAt: 15.3 },

      { id: 'bagStaff', look: { skin: 0xc9956f, hair: 0x1a1a1a, hairStyle: 'shortFringe', top: 0xf2f0ea, sleeve: 'short', shorts: 0x5a5d66, longPants: true, shoes: 0x222222, face: staffFace('#cf9b75', '#ad7b58', '#1a1410'), breathPhase: 2 },
        path: [{ t: 0, x: -10.9, z: 1.3, yaw: LFT }],
        poses: [{ t: 0 }, { t: 11.4, R: 'give' }, { t: 13.0, R: 'idle' }, { t: 14.4, R: 'give', L: 'give' }, { t: 16.0, R: 'idle', L: 'idle' }] },

      { id: 'wrapStaff', look: { skin: 0xb98260, hair: 0x262020, hairStyle: 'ponytail', top: 0x8a2f3a, sleeve: 'short', shorts: 0x2a2a30, longPants: true, shoes: 0x222222, face: Object.assign(staffFace('#bf8a66', '#9a6a4a', '#2a1a14'), { lash: true }), scale: 0.95, breathPhase: 0.6 },
        path: [{ t: 0, x: 10.6, z: -0.25, yaw: 0 }],
        poses: [{ t: 0 }, { t: 21.0, R: 'give', L: 'give' }, { t: 22.8, R: 'idle', L: 'idle' }, { t: 23.4, R: 'give', L: 'give' }, { t: 24.4, R: 'idle', L: 'idle' }] },

      { id: 'guide', look: { skin: 0xc48e68, hair: 0x9a9a9a, hairStyle: 'shortFringe', top: 0xdfe7f2, sleeve: 'long', shorts: 0xb9ab8e, longPants: true, shoes: 0x3a2a20, face: staffFace('#c99470', '#a8744f', '#6a6a6a'), breathPhase: 3.1 },
        path: [
          { t: 0, x: 2.3, z: -5.0, yaw: -1.19 }, { t: 30.6, x: 2.3, z: -5.0, yaw: -1.19 }, { t: 31.4, x: 2.3, z: -5.0, yaw: PI },
          { t: 35.4, x: 2.3, z: -5.0, yaw: PI }, { t: 36.2, x: 2.3, z: -5.0, yaw: -1.19 },
          { t: 39.2, x: 2.3, z: -5.0, yaw: -1.19 }, { t: 43.0, x: 0.1, z: 0.9, yaw: PI }
        ],
        poses: [{ t: 0 }, { t: 29.0, R: 'open', L: 'open' }, { t: 30.4, R: 'idle', L: 'idle' }, { t: 31.6, R: 'point_up', look: [0, -0.3] },
          { t: 35.2, R: 'open', L: 'open', look: [0, 0] }, { t: 37.6, R: 'idle', L: 'idle' }, { t: 43.1, R: 'phone', L: 'phone' }] }
    ],

    camera: [
      { t0: 0, t1: 9, from: { pos: [5.5, 3.6, 17], tgt: [-1.5, 4.2, -12], fov: 52 }, to: { pos: [-3.6, 1.95, 6.4], tgt: [-9.3, 1.2, 1.3], fov: 50 } },
      { t0: 9, t1: 18, from: { pos: [-6.0, 1.75, 4.8], tgt: [-10.0, 1.25, 1.2], fov: 48 }, to: { pos: [-6.7, 1.7, 4.0], tgt: [-10.0, 1.25, 1.2], fov: 46 } },
      { t0: 18, t1: 28, from: { pos: [7.4, 1.55, 6.0], tgt: [10.4, 0.85, 1.8], fov: 50 }, to: { pos: [8.0, 1.45, 5.2], tgt: [10.5, 0.75, 1.8], fov: 48 } },
      { t0: 28, t1: 39, from: { pos: [-3.4, 1.05, 0.2], tgt: [2.6, 5.0, -16], fov: 58 }, to: { pos: [-2.9, 1.1, -0.6], tgt: [2.4, 5.3, -16], fov: 58 } },
      { t0: 39, t1: 45, from: { pos: [5.4, 1.7, -1.6], tgt: [0, 1.25, -5.4], fov: 50 }, to: FINAL_CAM },
      { t0: 45, t1: 60, from: FINAL_CAM }
    ]
  };
})();
