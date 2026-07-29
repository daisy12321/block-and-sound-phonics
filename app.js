const rounds = [
  { word: "GRABBER", image: "grabber.png", label: "grabber", colors: ["blue", "yellow", "green", "red", "blue", "yellow", "green"] },
  { word: "DIGGER", image: "digger.png", label: "digger", colors: ["yellow", "blue", "green", "red", "yellow", "blue"] },
  { word: "DUMP TRUCK", image: "dump-truck.png", label: "dump truck", colors: ["red", "yellow", "green", "blue", "red", "yellow", "green", "blue", "red"] },
  { word: "DOZER", image: "dozer.png", label: "dozer", colors: ["yellow", "blue", "green", "red", "yellow"] },
  { word: "LOADER", image: "loader.png", label: "loader", colors: ["yellow", "blue", "green", "red", "yellow", "blue"] },
  { word: "TOWER CRANE", emoji: "🏗️", label: "tower crane", colors: ["green", "yellow", "blue", "red", "green", "yellow", "blue", "red", "green", "yellow"] },
  { word: "TRUCK CRANE", image: "truck-crane.png", label: "truck crane", colors: ["red", "yellow", "green", "blue", "red", "yellow", "green", "blue", "red", "yellow"] },
  { word: "MIXER", image: "mixer.png", label: "mixer", colors: ["blue", "red", "yellow", "green", "blue"] },
  { word: "CAT", emoji: "🐱", label: "cat", colors: ["blue", "yellow", "red"] },
  { word: "DOG", emoji: "🐶", label: "dog", colors: ["green", "red", "blue"] },
  { word: "VAN", emoji: "🚚", label: "van", colors: ["red", "yellow", "green"] },
  { word: "SUN", emoji: "☀️", label: "sun", colors: ["yellow", "blue", "green"] },
  { word: "PIG", emoji: "🐷", label: "pig", colors: ["red", "yellow", "blue"] },
  { word: "BUS", emoji: "🚌", label: "bus", colors: ["blue", "green", "red"] },
  { word: "HEN", emoji: "🐔", label: "hen", colors: ["green", "yellow", "red"] },
];

const soundText = {
  A: "ah", B: "buh", C: "kuh", D: "duh", E: "eh", G: "guh", H: "huh",
  I: "ih", K: "kuh", L: "lll", M: "mmm", N: "nnn", O: "aw", P: "puh", R: "rrr",
  S: "sss", T: "tuh", U: "uh", V: "vvv", W: "wuh", X: "ks",
};

const elements = {
  introScreen: document.querySelector("#intro-screen"),
  startButton: document.querySelector("#start-button"),
  homeButton: document.querySelector("#home-button"),
  gameShell: document.querySelector("#game-shell"),
  gameCard: document.querySelector("#game-card"),
  progress: document.querySelector("#progress"),
  pictureBubble: document.querySelector("#picture-bubble"),
  emoji: document.querySelector("#emoji-picture"),
  pictureLabel: document.querySelector("#picture-label"),
  eyebrow: document.querySelector("#eyebrow"),
  heading: document.querySelector("#heading"),
  sockets: document.querySelector("#sockets"),
  blocks: document.querySelector("#blocks"),
  actionButton: document.querySelector("#action-button"),
  actionLabel: document.querySelector("#action-label"),
  previousWord: document.querySelector("#previous-word"),
  nextWord: document.querySelector("#next-word"),
  hint: document.querySelector("#hint"),
};

let roundIndex = 0;
let placed = [];
let stars = 0;
let celebrating = false;
let mistake = null;
let mistakeTimer;
let letterTiles = [];

function speak(text, rate = 0.72) {
  if (!("speechSynthesis" in window)) return;
  stopSound();
  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = rate;
  voice.pitch = 1.08;
  const voices = window.speechSynthesis.getVoices();
  voice.voice =
    voices.find((item) => item.lang.startsWith("en") && /Samantha|Ava|Aria|Google US English/i.test(item.name)) ||
    voices.find((item) => item.lang.startsWith("en-US")) ||
    voices.find((item) => item.lang.startsWith("en")) ||
    null;
  window.speechSynthesis.speak(voice);
}

let soundRun = 0;
let activeAudioContext = null;

function stopSound() {
  soundRun += 1;
  window.speechSynthesis?.cancel();
  activeAudioContext?.close();
  activeAudioContext = null;
}

function playFricative(letter) {
  if (!("AudioContext" in window)) {
    speak(letter === "S" ? "s" : "v");
    return;
  }
  const context = new AudioContext();
  activeAudioContext = context;
  const duration = 0.62;
  const now = context.currentTime;
  const master = context.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(letter === "S" ? 0.22 : 0.18, now + 0.04);
  master.gain.setValueAtTime(letter === "S" ? 0.22 : 0.18, now + duration - 0.09);
  master.gain.linearRampToValueAtTime(0, now + duration);
  master.connect(context.destination);

  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.random() * 2 - 1;
  }
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = letter === "S" ? "highpass" : "bandpass";
  noiseFilter.frequency.value = letter === "S" ? 3200 : 1700;
  noiseFilter.Q.value = letter === "S" ? 0.7 : 0.9;
  const noiseGain = context.createGain();
  noiseGain.gain.value = letter === "S" ? 1 : 0.38;
  noise.connect(noiseFilter).connect(noiseGain).connect(master);

  if (letter === "V") {
    const voice = context.createOscillator();
    voice.type = "sawtooth";
    voice.frequency.value = 145;
    const voiceFilter = context.createBiquadFilter();
    voiceFilter.type = "lowpass";
    voiceFilter.frequency.value = 520;
    const voiceGain = context.createGain();
    voiceGain.gain.value = 0.42;
    voice.connect(voiceFilter).connect(voiceGain).connect(master);
    voice.start(now);
    voice.stop(now + duration);
  }

  noise.start(now);
  noise.stop(now + duration);
  window.setTimeout(() => {
    if (activeAudioContext === context) activeAudioContext = null;
    context.close();
  }, duration * 1000 + 80);
}

function playLetterSound(letter, cancelCurrent = true) {
  if (cancelCurrent) stopSound();
  if (letter === "S" || letter === "V") {
    playFricative(letter);
    return;
  }
  const voice = new SpeechSynthesisUtterance(soundText[letter] || letter);
  voice.rate = 0.76;
  voice.pitch = 1.08;
  const voices = window.speechSynthesis.getVoices();
  voice.voice =
    voices.find((item) => item.lang.startsWith("en") && /Samantha|Ava|Aria|Google US English/i.test(item.name)) ||
    voices.find((item) => item.lang.startsWith("en-US")) ||
    voices.find((item) => item.lang.startsWith("en")) ||
    null;
  window.speechSynthesis.speak(voice);
}

function playSoundSequence(letters, word) {
  stopSound();
  const run = soundRun;
  letters.forEach((letter, index) => {
    window.setTimeout(() => {
      if (soundRun !== run) return;
      window.speechSynthesis.cancel();
      activeAudioContext?.close();
      activeAudioContext = null;
      playLetterSound(letter, false);
    }, index * 720);
  });
  window.setTimeout(() => {
    if (soundRun === run) speak(word, 0.68);
  }, letters.length * 720);
}

function shuffleLetters(round) {
  const values = round.word.replaceAll(" ", "").split("").map((letter, id) => ({ letter, id, color: round.colors[id] }));
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  if (values.length > 1 && values.every((tile, index) => tile.id === index)) {
    [values[0], values[1]] = [values[1], values[0]];
  }
  return values;
}

function render() {
  const round = rounds[roundIndex];
  const targetLetters = round.word.replaceAll(" ", "").split("");
  elements.gameCard.classList.toggle("is-celebrating", celebrating);
  elements.gameCard.classList.toggle("is-long-word", targetLetters.length > 3);
  elements.pictureBubble.setAttribute("aria-label", `A ${round.label}`);
  elements.emoji.replaceChildren();
  if (round.image) {
    elements.emoji.className = "picture-visual";
    const image = document.createElement("img");
    image.className = "round-picture";
    image.src = round.image;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    elements.emoji.append(image);
  } else {
    elements.emoji.className = "emoji-picture";
    elements.emoji.textContent = round.emoji;
  }
  elements.pictureLabel.textContent = round.label;
  elements.eyebrow.textContent = `Sound builder · ${roundIndex + 1} of ${rounds.length}`;
  elements.heading.textContent = celebrating ? "You built it!" : round.word.includes(" ") ? "Build the words!" : "Build the word!";

  elements.progress.replaceChildren();
  elements.progress.setAttribute("aria-label", `${stars} of 3 stars earned`);
  for (let index = 0; index < 3; index += 1) {
    const star = document.createElement("span");
    star.className = index < stars ? "star earned" : "star";
    star.textContent = "★";
    star.setAttribute("aria-hidden", "true");
    elements.progress.append(star);
  }

  elements.sockets.replaceChildren();
  let groupOffset = 0;
  round.word.split(" ").forEach((word) => {
    const group = document.createElement("div");
    group.className = "socket-word";
    [...word].forEach((letter, wordIndex) => {
      const index = groupOffset + wordIndex;
      const socket = document.createElement("div");
      socket.className = placed.length > index ? `socket filled ${round.colors[index]}` : "socket";
      if (placed.length > index) {
        socket.textContent = letter;
      } else {
        const number = document.createElement("span");
        number.textContent = String(index + 1);
        socket.append(number);
      }
      group.append(socket);
    });
    groupOffset += word.length;
    elements.sockets.append(group);
  });

  elements.blocks.replaceChildren();
  letterTiles.forEach((tile) => {
    const button = document.createElement("button");
    const used = placed.includes(tile.id);
    button.type = "button";
    button.className = `letter-block ${tile.color}${used ? " used" : ""}${mistake === tile.id ? " oops" : ""}`;
    button.textContent = tile.letter;
    button.disabled = used || celebrating;
    button.setAttribute("aria-label", `Letter ${tile.letter}`);
    button.addEventListener("click", () => chooseLetter(tile));
    elements.blocks.append(button);
  });

  elements.actionButton.className = celebrating ? "next-button" : "sound-button";
  elements.actionLabel.textContent = celebrating ? "Next word →" : "Hear the sounds";
  elements.hint.textContent = mistake
    ? "Good try! Listen, then pick another block."
    : celebrating
      ? `${round.word.toLowerCase()} — fantastic phonics!`
      : "Listen. Tap. Build!";
}

function chooseLetter(tile) {
  const round = rounds[roundIndex];
  const targetLetters = round.word.replaceAll(" ", "").split("");
  if (celebrating || placed.includes(tile.id) || placed.length === targetLetters.length) return;
  const wanted = targetLetters[placed.length];
  if (tile.letter !== wanted) {
    mistake = tile.id;
    playLetterSound(tile.letter);
    const run = soundRun;
    window.setTimeout(() => {
      if (soundRun === run) speak("Try another block.");
    }, 700);
    window.clearTimeout(mistakeTimer);
    mistakeTimer = window.setTimeout(() => {
      mistake = null;
      render();
    }, 450);
    render();
    return;
  }

  placed.push(tile.id);
  playLetterSound(tile.letter);
  if (placed.length === targetLetters.length) {
    celebrating = true;
    stars = Math.min(3, stars + 1);
    window.setTimeout(() => speak(`${round.label}! You built it!`), 720);
  }
  render();
}

function hearSounds() {
  const round = rounds[roundIndex];
  playSoundSequence(round.word.replaceAll(" ", "").split(""), round.label);
}

function changeRound(direction) {
  stopSound();
  placed = [];
  celebrating = false;
  mistake = null;
  roundIndex = (roundIndex + direction + rounds.length) % rounds.length;
  letterTiles = shuffleLetters(rounds[roundIndex]);
  render();
  window.setTimeout(() => speak(`Find the sounds in ${rounds[roundIndex].label}`), 250);
}

function nextRound() {
  changeRound(1);
}

elements.actionButton.addEventListener("click", () => {
  if (celebrating) nextRound();
  else hearSounds();
});

elements.previousWord.addEventListener("click", () => changeRound(-1));
elements.nextWord.addEventListener("click", nextRound);

elements.startButton.addEventListener("click", () => {
  elements.introScreen.classList.add("is-hidden");
  elements.gameShell.classList.remove("is-hidden");
  speak(`Find the sounds in ${rounds[roundIndex].label}`);
});

elements.homeButton.addEventListener("click", () => {
  stopSound();
  elements.gameShell.classList.add("is-hidden");
  elements.introScreen.classList.remove("is-hidden");
});

letterTiles = shuffleLetters(rounds[roundIndex]);
render();
