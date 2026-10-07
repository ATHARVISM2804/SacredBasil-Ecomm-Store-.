// Original score for the Sacred Basil Luxe hero film.
// Indian ambient: tanpura drone + santoor (raag Bhupali, Sa = D) + soft bansuri.
// Writes a dry stereo WAV; reverb and mastering are applied with ffmpeg.
// Usage: node compose.mjs out.wav
import { writeFileSync } from "node:fs";

const SR = 44100;
const DUR = 43.708;
const N = Math.ceil(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

// Seeded random so every render is identical
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const SA = 146.83; // D3
const ratio = { S: 1, R: 9 / 8, G: 5 / 4, P: 3 / 2, D: 5 / 3 }; // Bhupali: Sa Re Ga Pa Dha
const note = (sw, oct = 0) => SA * ratio[sw] * 2 ** oct;

function add(buf, i, v) { if (i >= 0 && i < N) buf[i] += v; }

// ---- Tanpura: Pa, Sa', Sa', Sa (low) cycle with jawari-like bright harmonics
function tanpuraPluck(t0, f, amp, pan) {
  const len = Math.floor(SR * 5.5);
  const start = Math.floor(t0 * SR);
  const ph = Array.from({ length: 14 }, () => rand() * 6.28);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.04) * Math.exp(-t / 2.6);
    let s = 0;
    for (let h = 1; h <= 14; h++) {
      // jawari: upper partials swell then fade, giving the shimmering buzz
      const shimmer = h > 3 ? 0.5 + 0.5 * Math.sin(2 * Math.PI * (0.35 + h * 0.07) * t + ph[h - 1]) : 1;
      s += (Math.sin(2 * Math.PI * f * h * t * (1 + 0.0004 * h) + ph[h - 1]) / h ** 1.15) * shimmer;
    }
    const v = s * env * amp;
    add(L, start + k, v * (1 - pan));
    add(R, start + k, v * pan);
  }
}

// ---- Santoor: hammered, three slightly detuned strings per note, bright fast decay
function santoor(t0, f, amp, pan) {
  const len = Math.floor(SR * 3.2);
  const start = Math.floor(t0 * SR);
  const det = [0.9985, 1, 1.0016];
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.003) * (0.65 * Math.exp(-t / 0.55) + 0.35 * Math.exp(-t / 1.7));
    let s = 0;
    for (const d of det) {
      s += Math.sin(2 * Math.PI * f * d * t)
        + 0.45 * Math.sin(2 * Math.PI * 2 * f * d * t) * Math.exp(-t / 0.4)
        + 0.18 * Math.sin(2 * Math.PI * 3.01 * f * d * t) * Math.exp(-t / 0.25)
        + 0.08 * Math.sin(2 * Math.PI * 4.02 * f * d * t) * Math.exp(-t / 0.15);
    }
    const v = (s / 3) * env * amp;
    add(L, start + k, v * (1 - pan));
    add(R, start + k, v * pan);
  }
}

// ---- Bansuri: breathy sine with slow vibrato and a soft glide in
function bansuri(t0, dur, f, amp, fromF = f) {
  const len = Math.floor(SR * dur);
  const start = Math.floor(t0 * SR);
  let phase = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const glide = Math.min(1, t / 0.35);
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, t / 0.8);
    const freq = (fromF + (f - fromF) * glide) * vib;
    phase += (2 * Math.PI * freq) / SR;
    const env = Math.min(1, t / 0.45) * Math.min(1, (dur - t) / 0.9);
    const breath = (rand() * 2 - 1) * 0.006 * env;
    const v = (Math.sin(phase) + 0.12 * Math.sin(2 * phase) + breath) * env * amp;
    add(L, start + k, v * 0.55);
    add(R, start + k, v * 0.45);
  }
}

// ---- Warm pad underneath, for body
function pad(t0, dur, freqs, amp) {
  const len = Math.floor(SR * dur);
  const start = Math.floor(t0 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / dur)) ** 1.5;
    let s = 0;
    freqs.forEach((f, i) => { s += Math.sin(2 * Math.PI * f * t * (i % 2 ? 1.002 : 0.998)); });
    const v = (s / freqs.length) * env * amp;
    add(L, start + k, v);
    add(R, start + k, v);
  }
}

// ------------------------------------------------------------------ arrangement
// Film beats: 0 box descends · 5.4 foil close-up · 11.7 lid opens · 17.4 scrubs
// 23.6 oil & soap · 28.8 candle · 33.7 full reveal · 41.7 hold/fade

// Tanpura throughout, every ~1.05 s, cycle Pa Sa' Sa' Sa
const cycle = [note("P", -1), note("S"), note("S"), note("S", -1)]; // low Sa played softer
for (let i = 0, t = 0.2; t < DUR - 1; i++, t += 1.05) {
  const fadeIn = Math.min(1, t / 4);
  tanpuraPluck(t, cycle[i % 4], (i % 4 === 3 ? 0.014 : 0.024) * fadeIn, i % 2 ? 0.42 : 0.58);
}

// Pad: Sa+Pa body, swells under the reveal and the candle
pad(2, 14, [SA * 0.75, SA, note("P")], 0.03);
pad(14, 16, [SA, note("P"), note("G")], 0.028);
pad(28, 15.7, [SA * 0.75, SA, note("G"), note("P")], 0.032);

// Santoor phrases (time, swara, octave)
const phrases = [
  // gentle opening as the box settles
  [4.0, "G", 0], [4.5, "P", 0], [5.0, "D", 0], [6.2, "P", 0],
  [7.6, "G", 0], [8.1, "R", 0], [8.6, "S", 0],
  // lid opens: rising arpeggio
  [11.4, "S", 0], [11.75, "R", 0], [12.1, "G", 0], [12.45, "P", 0], [12.8, "D", 0], [13.15, "S", 1],
  [14.6, "D", 0], [15.4, "P", 0],
  // scrubs
  [17.4, "G", 1], [17.9, "R", 1], [18.4, "S", 1], [19.6, "D", 0], [20.4, "P", 0],
  [21.4, "G", 0], [21.9, "P", 0],
  // oil & soap
  [23.6, "D", 0], [24.1, "S", 1], [24.6, "R", 1], [25.8, "S", 1], [26.6, "D", 0],
  // candle: sparse, intimate
  [29.0, "P", 0], [30.8, "G", 0],
  // full reveal: cascade resolving to Sa
  [33.6, "S", 1], [33.95, "D", 0], [34.3, "P", 0], [34.65, "G", 0], [35.0, "R", 0], [35.6, "S", 0],
  [37.4, "P", 0], [38.6, "S", 0],
];
for (const [t, sw, oct] of phrases) {
  santoor(t, note(sw, oct) * 2, 0.2 + rand() * 0.03, 0.35 + rand() * 0.3);
  // tremolo grace: santoor players often double-strike
  if (rand() > 0.65) santoor(t + 0.09, note(sw, oct) * 2, 0.08, 0.5);
}

// Bansuri: warmest moment on the candle, then a long Sa to close
bansuri(27.6, 3.6, note("G", 1), 0.075, note("R", 1));
bansuri(31.0, 2.6, note("R", 1), 0.065, note("G", 1));
bansuri(35.8, 6.4, note("S", 1), 0.07, note("D", 0));

// ------------------------------------------------------------------ output
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.85 / peak;
const out = Buffer.alloc(44 + N * 4);
out.write("RIFF", 0); out.writeUInt32LE(36 + N * 4, 4); out.write("WAVE", 8);
out.write("fmt ", 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write("data", 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
writeFileSync(process.argv[2] ?? "score-dry.wav", out);
console.log("wrote", process.argv[2], DUR, "s");
