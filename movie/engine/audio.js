// Sound for live playback: a soft warm pad and the shutter click at the photo moment.
// Synthesised with WebAudio, so there are no audio files to host.
(function (MP) {
  let ctx = null, nodes = [];
  function stop() { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); nodes = []; }
  function pad(at, dur, freqs, gain) {
    freqs.forEach(f => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(gain, at + 1.2); g.gain.setValueAtTime(gain, at + dur - 1.2); g.gain.linearRampToValueAtTime(0, at + dur);
      o.connect(g).connect(ctx.destination); o.start(at); o.stop(at + dur + 0.05); nodes.push(o);
    });
  }
  function shutter(at) {
    const len = Math.floor(ctx.sampleRate * 0.12), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) { const k = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 3) * (k < 0.08 || (k > 0.45 && k < 0.53) ? 1 : 0.25); }
    const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = buf; g.gain.value = 0.6; s.connect(g).connect(ctx.destination); s.start(at); nodes.push(s);
  }
  // chords every 7.5 s: I – vi – IV – V in D major, quietly
  const CH = [[146.8, 220, 293.7, 370], [123.5, 185, 246.9, 293.7], [98, 196, 246.9, 293.7], [110, 220, 277.2, 329.6]];
  function start(t, def) {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    stop(); const now = ctx.currentTime + 0.05;
    for (let k = 0; k * 7.5 < def.duration; k++) { const s = k * 7.5; if (s + 7.5 <= t) continue; const off = Math.max(0, s - t); pad(now + off, 7.5 - Math.max(0, t - s), CH[k % 4], 0.018); }
    const st = def.finalShot.shutterAt; if (t <= st) shutter(now + st - t);
  }
  MP.audio = { start, stop };
})(window.MP);
