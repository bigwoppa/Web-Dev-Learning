(() => {
  const button = document.querySelector("#clickButton");
  if (!button) return;

  const meter = document.querySelector(".meter");
  const fill = document.querySelector("#meterFill");
  const text = document.querySelector("#meterText");
  const comboText = document.querySelector("#combo");
  const chaosLayer = document.querySelector("#chaosLayer");
  const resetButton = document.querySelector("#resetButton");
  const soundToggle = document.querySelector("#soundToggle");
  const volumeControl = document.querySelector("#volumeControl");
  const volumeValue = document.querySelector("#volumeValue");
  const visitorNumber = document.querySelector("#visitorNumber");

  const messages = [
    "ACHIEVEMENT: CLICKED A BUTTON",
    "MOM GET THE CAMERA",
    "+1 UNREAD THOUGHT",
    "YOU WON ANOTHER CLICK",
    "WARNING: FUN DETECTED",
    "360 NO-SCOPE",
    "BRAIN ROT INCREASED",
    "WHY ARE YOU STILL CLICKING",
  ];

  let stimulation = 0;
  let clicks = 0;
  let soundOn = true;
  let volume = 0.8;
  let previousLevel = 0;
  let audioContext;
  let masterGain;
  let compressor;

  visitorNumber.textContent = String(Math.floor(10000000 + Math.random() * 89999999));

  function levelFor(value) {
    if (value >= 88) return 5;
    if (value >= 68) return 4;
    if (value >= 46) return 3;
    if (value >= 24) return 2;
    if (value >= 8) return 1;
    return 0;
  }

  function ensureAudio() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 12;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.18;
      masterGain.gain.value = soundOn ? volume * 0.55 : 0;
      masterGain.connect(compressor).connect(audioContext.destination);
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function setMasterVolume() {
    if (!masterGain || !audioContext) return;
    masterGain.gain.setTargetAtTime(soundOn ? volume * 0.55 : 0, audioContext.currentTime, 0.01);
  }

  function hitMarker() {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1450, now);
    oscillator.frequency.exponentialRampToValueAtTime(260, now + 0.075);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    oscillator.connect(gain).connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 0.09);
  }

  function airHorn() {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [220, 277, 330].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.linearRampToValueAtTime(frequency * 0.94, now + 0.85);
      filter.type = "lowpass";
      filter.frequency.value = 1700 - index * 180;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.025);
      gain.gain.setValueAtTime(0.12, now + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      oscillator.connect(filter).connect(gain).connect(masterGain);
      oscillator.start(now);
      oscillator.stop(now + 0.92);
    });
  }

  function bassDrop() {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(170, now);
    oscillator.frequency.exponentialRampToValueAtTime(38, now + 0.9);
    gain.gain.setValueAtTime(0.34, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    oscillator.connect(gain).connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 0.98);
  }

  function alarmBurst() {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let pulse = 0; pulse < 4; pulse += 1) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + pulse * 0.14;
      oscillator.type = "square";
      oscillator.frequency.value = pulse % 2 === 0 ? 760 : 980;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.11, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      oscillator.connect(gain).connect(masterGain);
      oscillator.start(start);
      oscillator.stop(start + 0.13);
    }
  }

  function crowdBurst() {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const length = Math.floor(ctx.sampleRate * 0.9);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 850;
    filter.Q.value = 0.7;
    gain.gain.value = 0.24;
    source.connect(filter).connect(gain).connect(masterGain);
    source.start();
  }

  function say(line) {
    if (!soundOn || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(line);
    speech.rate = 1.08;
    speech.pitch = 0.72;
    speech.volume = Math.max(0.45, volume);
    window.speechSynthesis.speak(speech);
  }

  function levelSound(level) {
    if (level <= previousLevel) return;
    if (level === 1) hitMarker();
    if (level === 2) airHorn();
    if (level === 3) {
      airHorn();
      alarmBurst();
      say("Mom! Get the camera!");
    }
    if (level === 4) {
      bassDrop();
      crowdBurst();
      say("Oh my god!");
    }
    if (level === 5) {
      airHorn();
      bassDrop();
      alarmBurst();
      crowdBurst();
      say("Maximum brain rot!");
    }
    previousLevel = level;
  }

  function render() {
    const rounded = Math.round(stimulation);
    fill.style.width = `${rounded}%`;
    text.textContent = `${rounded}% STIMULATED`;
    meter.setAttribute("aria-valuenow", String(rounded));
    comboText.textContent = `COMBO x${clicks}`;
    document.body.classList.remove("level-1", "level-2", "level-3", "level-4", "level-5");
    const level = levelFor(stimulation);
    if (level) document.body.classList.add(`level-${level}`);
    if (level < previousLevel) previousLevel = level;
  }

  function spawnToast() {
    const toast = document.createElement("div");
    toast.className = "chaos-toast";
    toast.textContent = messages[Math.floor(Math.random() * messages.length)];
    toast.style.left = `${5 + Math.random() * 72}%`;
    toast.style.top = `${12 + Math.random() * 66}%`;
    chaosLayer.append(toast);
    window.setTimeout(() => toast.remove(), 2900);
  }

  button.addEventListener("click", () => {
    clicks += 1;
    stimulation = Math.min(100, stimulation + 6.5);
    hitMarker();
    if (clicks % 6 === 0) airHorn();
    levelSound(levelFor(stimulation));
    if (stimulation >= 18 && clicks % 2 === 0) spawnToast();
    if (stimulation >= 65) spawnToast();
    render();
  });

  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    if (!soundOn && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (soundOn) ensureAudio();
    setMasterVolume();
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.textContent = soundOn ? "SOUND: ON" : "SOUND: OFF";
  });

  volumeControl.addEventListener("input", () => {
    volume = Number(volumeControl.value) / 100;
    volumeValue.textContent = `${volumeControl.value}%`;
    setMasterVolume();
  });

  resetButton.addEventListener("click", () => {
    stimulation = 0;
    clicks = 0;
    previousLevel = 0;
    chaosLayer.replaceChildren();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    render();
  });

  window.setInterval(() => {
    if (stimulation <= 0) return;
    stimulation = Math.max(0, stimulation - 0.85);
    render();
  }, 500);

  render();
})();
