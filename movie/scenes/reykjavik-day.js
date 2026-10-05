// Scene Definition: "Reykjavik, the first day". Into a red-and-yellow burger shop, two burger
// sets, eating at the big window looking at Mt. Esja, out with the leftover paper cups, and a
// local offers to take their photo on the seafront.
// The people are generic polygon versions; no photo is stored here.
window.MP = window.MP || {}; MP.SCENES = MP.SCENES || {};
(function () {
  const PI = Math.PI, E = PI / 2;
  const FINAL_CAM = { pos: [-12.14, 1.45, 5.0], tgt: [-12.14, 1.42, -20], fov: 52 };
  const SEAT = { him: [1.05, 10.15], her: [1.75, 10.15] };
  const scarf = MP.tex(16, 16, g => { const r = MP.rng(5); g.fillStyle = '#cbbcb0'; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 80; i++) { g.fillStyle = ['#5a6ea8', '#7b5a46', '#e8e2da', '#8d8fb8', '#3d3f63', '#b08a73'][Math.floor(r() * 6)]; g.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1); } }, 1, 1);

  MP.SCENES.reykjavik = {
    schemaVersion: '0.1',
    id: 'reykjavik-day1',
    title: 'Memory Movie：レイキャビク、最初の日',
    duration: 60,
    environment: 'reykjavik',
    caption: { small: 'Ísland', big: 'Reykjavík' },
    date: "'26 2 5   11:30",
    beats: [
      { t: 0, label: 'お店へ' }, { t: 9, label: 'ハンバーガーセット×2' }, { t: 20, label: '窓から山を見ながら' },
      { t: 33, label: '紙コップを持って海辺へ' }, { t: 40.5, label: '撮りましょうか？' }, { t: 45, label: '📸' }
    ],
    finalShot: { shutterAt: 45, holdUntil: 60, reveal: 'photo', revealAt: 49.5, revealDur: 2.4, printAt: 50, originalAt: 53, camera: FINAL_CAM },
    envState: {
      showCounterTrays: [{ t: 0, v: false }, { t: 13.6, v: true }, { t: 15.2, v: false }],
      showMeal: [{ t: 0, v: false }, { t: 18.4, v: true }, { t: 33, v: false }]
    },
    says: [{ who: 'local', t0: 41.0, t1: 43.0, text: 'Want me to take a photo?\n写真撮りましょうか？' }],

    cast: [
      { id: 'him', look: { skin: 0xe2ba98, hair: 0x121014, hairStyle: 'shaggy', top: 0x24262a, sleeve: 'long', shorts: 0x17181b, longPants: true, shoes: 0x111114,
          bag: 'cross', bagSide: -1, strapColor: 0xa9adb3, strapWide: true, bagColor: 0x6f7277, breathPhase: 0,
          face: { skin: '#e7c09f', shade: '#c69a79', brow: '#141011', browRows: [11, 12], lip: '#a96f63', teeth: true } },
        path: [
          { t: 0, x: -7.0, z: 5.6, yaw: E }, { t: 0.3, x: -7.0, z: 5.6 }, { t: 7.4, x: 6.6, z: 6.6, ease: 'linear' }, { t: 8.4, x: 6.75, z: 8.2 }, { t: 8.95, x: 6.75, z: 9.6 },
          { t: 9, x: 4.6, z: 13.0, cut: true }, { t: 10.6, x: 1.8, z: 14.6, yaw: 0 },
          { t: 15.4, x: 1.8, z: 14.6, yaw: 0 }, { t: 17.4, x: SEAT.him[0], z: 11.0 }, { t: 18.2, x: SEAT.him[0], z: SEAT.him[1], yaw: PI },
          { t: 33, x: 6.6, z: 8.0, cut: true, yaw: -2.6 }, { t: 36.8, x: 2.4, z: 5.2 },
          { t: 37, x: -6.4, z: 3.4, cut: true, yaw: -E }, { t: 40.6, x: -12.38, z: 1.3, yaw: PI, ease: 'linear' },
          { t: 41.4, x: -12.38, z: 1.3, yaw: -1.0 }, { t: 43.4, x: -12.38, z: 1.3, yaw: -1.0 }, { t: 43.9, x: -12.38, z: 1.3, yaw: 0 }
        ],
        sit: [{ t: 18.4, to: 1, dur: 0.7 }, { t: 33, to: 0, dur: 0.01 }],
        hold: [{ t: 0 }, { t: 15.2, R: 'tray' }, { t: 18.3 }, { t: 21.3, R: 'burger' }, { t: 24.2 }, { t: 27.8, R: 'burger' }, { t: 30.6 }, { t: 32.2, R: 'cup' },
          { t: 41.9, R: 'cup', L: 'phone' }, { t: 42.7, R: 'cup' }],
        poses: [
          { t: 0 }, { t: 11.0, R: 'point_fwd', look: [0, -0.3] }, { t: 12.6, R: 'idle', look: [0.4, 0] }, { t: 14.0, look: [0, 0] }, { t: 15.0, R: 'carry', L: 'carry' },
          { t: 18.2, R: 'table', L: 'table' }, { t: 21.3, R: 'eat' }, { t: 22.8, R: 'table', look: [0, 0.05] }, { t: 24.4, look: [0.5, 0] }, { t: 25.8, look: [0, 0] },
          { t: 27.8, R: 'eat' }, { t: 29.4, R: 'table', look: [0.2, -0.05] }, { t: 32.2, R: 'cup_chest', L: 'idle', look: [0, 0] },
          { t: 41.6, L: 'give', look: [0, 0] }, { t: 42.9, L: 'idle' }, { t: 44.0, R: 'peace_cup', L: 'idle', look: [0.08, 0] }
        ] },

      { id: 'her', look: { skin: 0xe8c4a6, hair: 0x3a1d18, hairStyle: 'long', top: 0x202945, sleeve: 'long', shorts: 0x141217, longPants: true, shoes: 0x141416,
          scarf, bag: 'cross', bagSide: 1, strapColor: 0x1a1a1e, bagColor: 0x2d4ea3, scale: 0.95, tilt: 0.12, breathPhase: 1.3,
          face: { skin: '#ecc8aa', shade: '#c99c7e', brow: '#3a2219', browRows: [11], lip: '#c06666', lash: true, blush: true } },
        path: [
          { t: 0, x: -7.8, z: 5.1, yaw: E }, { t: 0.5, x: -7.8, z: 5.1 }, { t: 7.9, x: 6.0, z: 6.4, ease: 'linear' }, { t: 8.9, x: 6.85, z: 8.2 },
          { t: 9, x: 5.4, z: 13.4, cut: true }, { t: 10.9, x: 2.6, z: 14.6, yaw: 0 },
          { t: 15.6, x: 2.6, z: 14.6, yaw: 0 }, { t: 17.7, x: SEAT.her[0], z: 11.0 }, { t: 18.5, x: SEAT.her[0], z: SEAT.her[1], yaw: PI },
          { t: 33, x: 7.1, z: 8.6, cut: true, yaw: -2.6 }, { t: 37.0, x: 3.1, z: 5.0 },
          { t: 37, x: -5.8, z: 3.8, cut: true, yaw: -E }, { t: 40.9, x: -11.9, z: 1.33, yaw: PI, ease: 'linear' },
          { t: 41.6, x: -11.9, z: 1.33, yaw: -1.2 }, { t: 43.4, x: -11.9, z: 1.33, yaw: -1.2 }, { t: 43.9, x: -11.9, z: 1.33, yaw: 0 }
        ],
        sit: [{ t: 18.7, to: 1, dur: 0.7 }, { t: 33, to: 0, dur: 0.01 }],
        hold: [{ t: 0 }, { t: 15.4, R: 'tray' }, { t: 18.6 }, { t: 22.4, R: 'burger' }, { t: 25.0 }, { t: 32.4, R: 'cup' }],
        poses: [
          { t: 0 }, { t: 11.6, look: [-0.3, -0.2] }, { t: 13.2, look: [0, 0] }, { t: 15.2, R: 'carry', L: 'carry' },
          { t: 18.6, R: 'table', L: 'table' }, { t: 22.4, R: 'eat' }, { t: 23.8, R: 'table' }, { t: 24.6, look: [-0.5, 0] }, { t: 26.0, look: [0, 0] },
          { t: 27.4, R: 'point_fwd', look: [0, -0.05] }, { t: 29.0, R: 'table' }, { t: 32.4, R: 'cup_chest', L: 'idle', look: [0, 0] },
          { t: 44.1, R: 'cup_chest', L: 'idle', look: [-0.1, 0] }
        ] },

      { id: 'staff', look: { skin: 0xdcb08a, hair: 0x5a3a24, hairStyle: 'short', hat: 'cap', hatColor: 0xf2c230, top: 0xc8302c, sleeve: 'short', shorts: 0x2a2a30, longPants: true, shoes: 0x222222, breathPhase: 2.2,
          face: { skin: '#ddb18b', shade: '#b98b66', brow: '#4a2a1a', browRows: [11], lip: '#a8665a', teeth: true } },
        path: [{ t: 0, x: 2.2, z: 16.2, yaw: PI }],
        poses: [{ t: 0 }, { t: 11.4, R: 'open', L: 'open' }, { t: 12.8, R: 'idle', L: 'idle' }, { t: 13.2, R: 'give', L: 'give' }, { t: 14.6, R: 'idle', L: 'idle' }] },

      { id: 'local', look: { skin: 0xe8c8b0, hair: 0x8a8a8a, hairStyle: 'short', hat: 'beanie', hatColor: 0x6a6e78, top: 0x2f5a8a, sleeve: 'long', shorts: 0x3a4a6a, longPants: true, shoes: 0x3a2a20, scale: 1.03, breathPhase: 3.3,
          face: { skin: '#eccab2', shade: '#c9a48c', brow: '#7a6a5a', browRows: [11], lip: '#b07a70', teeth: true } },
        path: [
          { t: 0, x: -24, z: 5.0, yaw: E }, { t: 38.0, x: -24, z: 5.0, yaw: E }, { t: 41.2, x: -13.6, z: 3.1, yaw: 1.9, ease: 'linear' },
          { t: 42.9, x: -13.6, z: 3.1, yaw: 1.9 }, { t: 44.2, x: -12.15, z: 6.1, yaw: PI }
        ],
        hold: [{ t: 0 }, { t: 42.6, R: 'phone' }],
        poses: [{ t: 0 }, { t: 41.2, R: 'open', look: [0, 0] }, { t: 42.2, R: 'give' }, { t: 42.9, R: 'idle' }, { t: 44.2, R: 'phone', L: 'phone' }] }
    ],

    camera: [
      { t0: 0, t1: 9, from: { pos: [-9, 2.4, 3.2], tgt: [-6, 4.5, -45], fov: 52 }, to: { pos: [-1.5, 1.9, 2.4], tgt: [6.4, 1.6, 8.6], fov: 52 } },
      { t0: 9, t1: 20, from: { pos: [-2.4, 1.75, 11.2], tgt: [2.2, 1.4, 15.4], fov: 56 }, to: { pos: [-2.2, 1.7, 12.6], tgt: [1.4, 1.3, 11.2], fov: 56 } },
      { t0: 20, t1: 26.5, from: { pos: [1.4, 1.62, 12.9], tgt: [1.4, 1.75, -30], fov: 60 }, to: { pos: [1.4, 1.6, 12.2], tgt: [1.4, 1.75, -30], fov: 60 } },
      { t0: 26.5, t1: 33, from: { pos: [1.4, 1.4, 6.2], tgt: [1.4, 1.3, 11], fov: 50 }, to: { pos: [1.4, 1.4, 6.8], tgt: [1.4, 1.3, 11], fov: 48 } },
      { t0: 33, t1: 37, from: { pos: [0.2, 1.7, 2.6], tgt: [6.4, 1.3, 7.8], fov: 54 }, to: { pos: [-0.6, 1.7, 2.8], tgt: [4.0, 1.2, 6.2], fov: 54 } },
      { t0: 37, t1: 40.5, from: { pos: [-3.6, 1.7, 7.6], tgt: [-9, 1.2, 2.4], fov: 52 }, to: { pos: [-7.2, 1.6, 6.6], tgt: [-12, 1.2, 1.6], fov: 52 } },
      { t0: 40.5, t1: 45, from: { pos: [-7.2, 1.7, 6.8], tgt: [-12.9, 1.3, 2.3], fov: 58 }, to: FINAL_CAM },
      { t0: 45, t1: 60, from: FINAL_CAM }
    ]
  };
})();
