const rounds = [
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
  I: "ih", N: "nnn", O: "aw", P: "puh", S: "sss", T: "tuh", U: "uh", V: "vvv",
};

const elements = {
  introScreen: document.querySelector("#intro-screen"),
  startButton: document.querySelector("#start-button"),
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
  hint: document.querySelector("#hint"),
};

let roundIndex = 0;
let placed = [];
let stars = 0;
let celebrating = false;
let mistake = null;
let mistakeTimer;

function speak(text, rate = 0.72) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = rate;
  voice.pitch = 1.18;
  window.speechSynthesis.speak(voice);
}

function letterOrder(round) {
  const values = [...round.word];
  return roundIndex % 2 ? [values[2], values[0], values[1]] : values;
}

function render() {
  const round = rounds[roundIndex];
  elements.gameCard.classList.toggle("is-celebrating", celebrating);
  elements.pictureBubble.setAttribute("aria-label", `A ${round.label}`);
  elements.emoji.textContent = round.emoji;
  elements.pictureLabel.textContent = round.label;
  elements.eyebrow.textContent = `Sound builder · ${roundIndex + 1} of ${rounds.length}`;
  elements.heading.textContent = celebrating ? "You built it!" : "Build the word!";

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
  [...round.word].forEach((letter, index) => {
    const socket = document.createElement("div");
    socket.className = placed[index] ? `socket filled ${round.colors[index]}` : "socket";
    if (placed[index]) {
      socket.textContent = letter;
    } else {
      const number = document.createElement("span");
      number.textContent = String(index + 1);
      socket.append(number);
    }
    elements.sockets.append(socket);
  });

  elements.blocks.replaceChildren();
  letterOrder(round).forEach((letter) => {
    const sourceIndex = round.word.indexOf(letter);
    const button = document.createElement("button");
    const used = placed.includes(letter);
    button.type = "button";
    button.className = `letter-block ${round.colors[sourceIndex]}${used ? " used" : ""}${mistake === letter ? " oops" : ""}`;
    button.textContent = letter;
    button.disabled = used || celebrating;
    button.setAttribute("aria-label", `Letter ${letter}`);
    button.addEventListener("click", () => chooseLetter(letter));
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

function chooseLetter(letter) {
  if (celebrating || placed.includes(letter) || placed.length === 3) return;
  const round = rounds[roundIndex];
  const wanted = round.word[placed.length];
  if (letter !== wanted) {
    mistake = letter;
    speak(`${soundText[letter] || letter}. Try another block.`);
    window.clearTimeout(mistakeTimer);
    mistakeTimer = window.setTimeout(() => {
      mistake = null;
      render();
    }, 450);
    render();
    return;
  }

  placed.push(letter);
  speak(soundText[letter] || letter);
  if (placed.length === round.word.length) {
    celebrating = true;
    stars = Math.min(3, stars + 1);
    window.setTimeout(() => speak(`${round.label}! You built it!`), 550);
  }
  render();
}

function hearSounds() {
  const round = rounds[roundIndex];
  const sounds = [...round.word].map((letter) => soundText[letter] || letter).join(" … ");
  speak(`${sounds} … ${round.label}`, 0.62);
}

function nextRound() {
  placed = [];
  celebrating = false;
  mistake = null;
  roundIndex = (roundIndex + 1) % rounds.length;
  render();
  window.setTimeout(() => speak(`Find the sounds in ${rounds[roundIndex].label}`), 250);
}

elements.actionButton.addEventListener("click", () => {
  if (celebrating) nextRound();
  else hearSounds();
});

elements.startButton.addEventListener("click", () => {
  elements.introScreen.classList.add("is-hidden");
  elements.gameShell.classList.remove("is-hidden");
  speak(`Find the sounds in ${rounds[roundIndex].label}`);
});

render();
