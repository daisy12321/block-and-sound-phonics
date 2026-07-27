const rounds = [
  { word: "CAT", emoji: "🐱", label: "cat", colors: ["blue", "yellow", "red"] },
  { word: "DOG", emoji: "🐶", label: "dog", colors: ["green", "red", "blue"] },
  { word: "VAN", emoji: "🚚", label: "van", colors: ["red", "yellow", "green"] },
  { word: "SUN", emoji: "☀️", label: "sun", colors: ["yellow", "blue", "green"] },
  { word: "PIG", emoji: "🐷", label: "pig", colors: ["red", "yellow", "blue"] },
  { word: "BUS", emoji: "🚌", label: "bus", colors: ["blue", "green", "red"] },
  { word: "HEN", emoji: "🐔", label: "hen", colors: ["green", "yellow", "red"] },
  { word: "DIGGER", emoji: "🚜", label: "digger", colors: ["yellow", "blue", "green", "red", "yellow", "blue"] },
  { word: "DUMP TRUCK", emoji: "🚚", label: "dump truck", colors: ["red", "yellow", "green", "blue", "red", "yellow", "green", "blue", "red"] },
  { word: "DOZER", emoji: "🚧", label: "dozer", colors: ["yellow", "blue", "green", "red", "yellow"] },
  { word: "TOWER CRANE", emoji: "🏗️", label: "tower crane", colors: ["green", "yellow", "blue", "red", "green", "yellow", "blue", "red", "green", "yellow"] },
  { word: "MIXER TRUCK", emoji: "🚛", label: "mixer truck", colors: ["blue", "red", "yellow", "green", "blue", "red", "yellow", "green", "blue", "red"] },
];

const soundText = {
  A: "ah", B: "buh", C: "kuh", D: "duh", E: "eh", G: "guh", H: "huh",
  I: "ih", K: "kuh", M: "mmm", N: "nnn", O: "aw", P: "puh", R: "rrr",
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
  const values = round.word.replaceAll(" ", "").split("").map((letter, id) => ({ letter, id, color: round.colors[id] }));
  const offset = (roundIndex * 2 + 1) % values.length;
  const rotated = [...values.slice(offset), ...values.slice(0, offset)];
  return roundIndex % 2 ? rotated.reverse() : rotated;
}

function render() {
  const round = rounds[roundIndex];
  const targetLetters = round.word.replaceAll(" ", "").split("");
  elements.gameCard.classList.toggle("is-celebrating", celebrating);
  elements.gameCard.classList.toggle("is-long-word", targetLetters.length > 3);
  elements.pictureBubble.setAttribute("aria-label", `A ${round.label}`);
  elements.emoji.textContent = round.emoji;
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
  letterOrder(round).forEach((tile) => {
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
    speak(`${soundText[tile.letter] || tile.letter}. Try another block.`);
    window.clearTimeout(mistakeTimer);
    mistakeTimer = window.setTimeout(() => {
      mistake = null;
      render();
    }, 450);
    render();
    return;
  }

  placed.push(tile.id);
  speak(soundText[tile.letter] || tile.letter);
  if (placed.length === targetLetters.length) {
    celebrating = true;
    stars = Math.min(3, stars + 1);
    window.setTimeout(() => speak(`${round.label}! You built it!`), 550);
  }
  render();
}

function hearSounds() {
  const round = rounds[roundIndex];
  const sounds = round.word.replaceAll(" ", "").split("").map((letter) => soundText[letter] || letter).join(" … ");
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

elements.homeButton.addEventListener("click", () => {
  window.speechSynthesis?.cancel();
  elements.gameShell.classList.add("is-hidden");
  elements.introScreen.classList.remove("is-hidden");
});

render();
