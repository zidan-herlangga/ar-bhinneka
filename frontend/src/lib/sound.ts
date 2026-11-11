let context: AudioContext | null = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!context) context = new AudioCtor();
  if (context.state === "suspended") void context.resume();
  return context;
}

export function isSoundEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("bti-sound") !== "0";
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("bti-sound", enabled ? "1" : "0");
}

function tone(frequency: number, duration: number, type: OscillatorType = "sine", gain = 0.14) {
  if (!isSoundEnabled()) return;
  const ctx = getContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const amplifier = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  amplifier.gain.setValueAtTime(gain, ctx.currentTime);
  amplifier.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.connect(amplifier).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function playClick() {
  tone(440, 0.05, "triangle", 0.08);
}

export function playCorrect() {
  tone(659.25, 0.1, "sine", 0.12);
  setTimeout(() => tone(987.77, 0.16, "sine", 0.12), 90);
}

export function playWrong() {
  tone(220, 0.22, "square", 0.1);
}

export function playSuccess() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    setTimeout(() => tone(frequency, 0.14, "sine", 0.12), index * 90);
  });
}

export function playLevelUp() {
  [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
    setTimeout(() => tone(frequency, 0.12, "triangle", 0.12), index * 80);
  });
}
