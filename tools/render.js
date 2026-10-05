#!/usr/bin/env node
// Render a Memory Movie scene to an MP4 (or to still frames) in a headless browser.
//
//   node tools/render.js --scene temple --out out/temple.mp4
//   node tools/render.js --scene reykjavik --photo /path/to/photo.jpg --out out/reykjavik.mp4
//   node tools/render.js --scene hike --stills 3,12,24,44.6 --out out/hike-check.png   (contact sheet for checking)
//
// Needs: Playwright + Chromium (preinstalled in the cloud environment), ffmpeg.
// The page loads Three.js r128 from cdnjs; if the network blocks cdnjs, this script serves a local copy
// (downloaded once from the npm registry into tools/.cache).
// Photos passed with --photo are only used for this render; they are never copied into the repo.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const args = {}; process.argv.slice(2).forEach((a, i, all) => { if (a.startsWith('--')) args[a.slice(2)] = all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true; });
const ROOT = path.resolve(__dirname, '..'), CACHE = path.join(__dirname, '.cache');
const scene = args.scene || 'temple', fps = +(args.fps || 24), out = path.resolve(args.out || `out/${scene}.mp4`);
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.mkdirSync(CACHE, { recursive: true });

function loadPlaywright() { for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { return require(p); } catch (e) {} } throw new Error('Playwright not found'); }
function threeLocal() {
  const f = path.join(CACHE, 'three.min.js'); if (fs.existsSync(f)) return f;
  execFileSync('npm', ['pack', 'three@0.128.0', '--silent'], { cwd: CACHE });
  execFileSync('tar', ['xzf', 'three-0.128.0.tgz', 'package/build/three.min.js'], { cwd: CACHE });
  fs.copyFileSync(path.join(CACHE, 'package/build/three.min.js'), f); return f;
}

// gentle pad chords + shutter click, as a 16-bit mono WAV
function writeAudio(file, duration, shutterAt) {
  const SR = 44100, N = SR * duration, buf = new Float32Array(N);
  const CH = [[146.8, 220, 293.7, 370], [123.5, 185, 246.9, 293.7], [98, 196, 246.9, 293.7], [110, 220, 277.2, 329.6]];
  const tri = x => { x %= 1; return x < 0.5 ? 4 * x - 1 : 3 - 4 * x; };
  for (let k = 0; k * 7.5 < duration; k++) { const s = Math.floor(k * 7.5 * SR), e = Math.min(N, Math.floor((k + 1) * 7.5 * SR)), L = e - s;
    CH[k % 4].forEach(f => { for (let i = 0; i < L; i++) buf[s + i] += 0.045 * Math.min(1, i / (1.2 * SR), (L - i) / (1.2 * SR)) * tri(f * (s + i) / SR); }); }
  for (let k = 0; 1 + k * 2 < duration - 2; k++) { const f = [587.3, 740, 880, 740][k % 4], s = Math.floor((1 + k * 2) * SR); for (let i = 0; i < 1.4 * SR && s + i < N; i++) buf[s + i] += 0.03 * Math.exp(-i / (0.35 * SR)) * Math.sin(2 * Math.PI * f * i / SR); }
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  { const s = Math.floor(shutterAt * SR), L = Math.floor(0.12 * SR); for (let i = 0; i < L; i++) { const k = i / L; buf[s + i] += 0.8 * (k < 0.08 || (k > 0.45 && k < 0.53) ? 1 : 0.25) * (1 - k) ** 3 * (rnd() * 2 - 1); } }
  for (let i = 0; i < SR; i++) buf[N - SR + i] *= 1 - i / SR;
  let mx = 0; for (const v of buf) mx = Math.max(mx, Math.abs(v));
  const data = Buffer.alloc(44 + N * 2); data.write('RIFF', 0); data.writeUInt32LE(36 + N * 2, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(N * 2, 40);
  for (let i = 0; i < N; i++) data.writeInt16LE(Math.round(32767 * 0.9 * buf[i] / mx), 44 + i * 2);
  fs.writeFileSync(file, data);
}

(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 900 } });
  const three = threeLocal();
  await page.route('**/three.min.js', r => r.fulfill({ path: three, contentType: 'application/javascript' }));
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.join(ROOT, 'movie/index.html') + '?scene=' + scene);
  await page.waitForFunction(() => window.MOVIE, null, { timeout: 15000 });
  if (args.photo) { await page.setInputFiles('#photo', path.resolve(args.photo)); await page.waitForTimeout(800); }
  const info = await page.evaluate(() => ({ duration: window.MOVIE.duration, shutterAt: window.MOVIE.shutterAt }));
  const grab = () => page.evaluate(() => document.getElementById('out').toDataURL('image/png').split(',')[1]);

  if (args.stills) {   // still frames at given seconds, tiled into one contact sheet
    const ts = String(args.stills).split(',').map(Number), tmp = fs.mkdtempSync(path.join(CACHE, 'stills-')), files = [];
    for (const t of ts) { await page.evaluate(t => { for (let s = Math.max(0, t - 1); s < t; s += 0.1) window.MOVIE.renderAt(s); window.MOVIE.renderAt(t); }, t);
      const f = path.join(tmp, `s${files.length}.png`); fs.writeFileSync(f, Buffer.from(await grab(), 'base64')); files.push(f); }
    const n = files.length, cols = Math.min(4, n), lay = files.map((_, i) => [(i % cols ? Array(i % cols).fill('w0').join('+') : '0'), (i >= cols ? Array(Math.floor(i / cols)).fill('h0').join('+') : '0')].join('_')).join('|');
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap(f => ['-i', f]), '-filter_complex', n > 1 ? `${files.map((_, i) => `[${i}]`).join('')}xstack=inputs=${n}:layout=${lay}:fill=black,scale=1280:-1` : 'scale=1280:-1', out]);
    fs.rmSync(tmp, { recursive: true, force: true });
  } else {             // full movie: every frame in order (the shutter frame is captured on the way)
    const tmp = fs.mkdtempSync(path.join(CACHE, 'frames-')), N = Math.round(info.duration * fps), t0 = Date.now();
    for (let i = 0; i < N; i += fps) {
      const batch = await page.evaluate(([i, n, fps]) => { const o = []; for (let k = i; k < Math.min(i + fps, n); k++) { window.MOVIE.renderAt(k / fps); o.push(document.getElementById('out').toDataURL('image/png').split(',')[1]); } return o; }, [i, N, fps]);
      batch.forEach((b, k) => fs.writeFileSync(path.join(tmp, `f${String(i + k).padStart(5, '0')}.png`), Buffer.from(b, 'base64')));
      process.stdout.write(`\rframes ${Math.min(i + fps, N)}/${N}`);
    }
    const wav = path.join(tmp, 'audio.wav'); writeAudio(wav, info.duration, info.shutterAt);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%05d.png'), '-i', wav, '-vf', 'scale=1280:960:flags=neighbor',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-shortest', out]);
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`\nrendered in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  await browser.close();
  if (errors.length) { console.error('page errors:', errors); process.exitCode = 1; }
  console.log('wrote', out);
})();
