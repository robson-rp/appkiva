/**
 * Celebration sound & haptic feedback utilities
 * Uses Web Audio API (no external files needed) and Vibration API
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Play a rising sparkle chime */
export function playSparkleSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Rising arpeggio notes (C5, E5, G5, C6)
    const frequencies = [523, 659, 784, 1047];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  } catch {
    // Audio not supported
  }
}

/** Play the main unlock fanfare */
export function playUnlockFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Triumphant chord: C4, E4, G4, C5 simultaneously
    const chord = [262, 330, 392, 523];
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    });

    // Bright shimmer overlay
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(1568, now + 0.3); // G6
    shimmer.frequency.linearRampToValueAtTime(2093, now + 0.8); // C7
    shimmerGain.gain.setValueAtTime(0, now + 0.3);
    shimmerGain.gain.linearRampToValueAtTime(0.06, now + 0.5);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    shimmer.connect(shimmerGain).connect(ctx.destination);
    shimmer.start(now + 0.3);
    shimmer.stop(now + 1.1);
  } catch {
    // Audio not supported
  }
}

/** Play a short positive "ding" for the button tap */
export function playConfirmDing() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Audio not supported
  }
}

/** Trigger haptic feedback patterns */
export function hapticBurst() {
  try {
    navigator?.vibrate?.([30, 50, 30, 50, 60]);
  } catch {
    // Vibration not supported
  }
}

export function hapticLight() {
  try {
    navigator?.vibrate?.(15);
  } catch {
    // Vibration not supported
  }
}

export function hapticSuccess() {
  try {
    navigator?.vibrate?.([20, 40, 40, 40, 80]);
  } catch {
    // Vibration not supported
  }
}
