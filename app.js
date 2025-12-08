// Wscramble core
const CONFIG = {
  pointsPerCorrect: 5,
  pointsPerWrong: 1,       // deduction per wrong attempt
  wordTimeSec: 40,
  sentenceTimeSec: 60,
  lettersHintWord: 2,      // reveal first 2 letters for words
  lettersHintSentence: 3   // reveal first 3 letters for sentences
};

// ===== Sample datasets =====
// Add more levels to reach 50 word levels and 50 sentence levels.
// Each level contains 5 clean (unscrambled) items.

const WORD_LEVELS = [
  ["cat", "dog", "sun", "book", "game"],
  ["tree", "moon", "fish", "star", "milk"],
  ["chair", "table", "phone", "music", "light"],
  ["house", "bread", "water", "smile", "green"],
  ["river", "cloud", "apple", "heart", "stone"],
  ["planet", "jungle", "rocket", "mirror", "puzzle"],
  ["energy", "silver", "throne", "basket", "letter"],
  ["forest", "bridge", "candle", "dragon", "travel"],
  ["galaxy", "oxygen", "legend", "harbor", "signal"],
  ["library", "orchard", "magnet", "compass", "victory"],
  ["spectrum", "triangle", "framework", "variable", "function"],
  ["analysis", "geometry", "momentum", "algorithm", "operator"],
  ["kaleidoscope", "phenomenon", "architecture", "philosophy", "synchronous"],
  ["encyclopedia", "metamorphosis", "constellation", "consciousness", "quarantine"],
  ["bioluminescence", "electromagnetic", "characteristic", "responsibility", "configuration"]
  // TODO: Add up to 50 levels (each array of 5 words).
];

const SENTENCE_LEVELS = [
  ["the sky is blue", "cats love warm sun", "we walk to school", "it is a bright day", "time heals all wounds"],
  ["birds sing at dawn", "music makes us smile", "read books every day", "plants grow with care", "friends share good stories"],
  ["coding is fun and creative", "learn new things daily", "practice makes us better", "work hard and be kind", "curiosity drives learning"],
  ["the river flows quietly", "stars shine in the night", "coffee smells great today", "the garden looks fresh", "sunrise colors the clouds"],
  ["he wrote a short poem", "they watched a calm movie", "we cooked a simple meal", "she painted a small canvas", "kids played outside happily"],
  ["technology changes our world rapidly", "art inspires people across cultures", "patience helps us solve problems", "kind words can lift spirits", "a healthy routine improves focus"],
  ["great teams communicate clearly and often", "nature hikes calm the restless mind", "small habits create big results", "creative projects spark collaboration", "learning languages broadens horizons"],
  ["mindful breathing reduces daily stress", "volunteering strengthens community bonds", "challenging goals build resilience", "adventures teach valuable lessons", "sharing knowledge empowers others"],
  ["scientific discoveries expand human potential", "balanced diets support steady energy", "thoughtful design simplifies experiences", "reading widely nurtures perspective", "consistent practice leads to mastery"],
  ["innovative ideas reshape industries globally", "artificial intelligence transforms modern workflows", "renewable energy mitigates climate change", "ethical leadership earns lasting trust", "public spaces encourage social connection"],
  ["curiosity and discipline together unlock extraordinary achievements", "systematic experimentation refines assumptions over time",
   "collaborative problem solving accelerates meaningful innovation", "educational access empowers generational progress",
   "strategic thinking navigates uncertainty with confidence"]
  // TODO: Add up to 50 levels (each array of 5 sentences).
];

// ===== Utility functions =====
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scrambleWord(word) {
  const chars = word.split("");
  let attempt = chars.slice();
  let tries = 0;
  do {
    attempt = shuffleArray(attempt.slice());
    tries++;
  } while (attempt.join("") === word && tries < 10);
  return attempt.join("");
}

function scrambleSentence(sentence) {
  // Scramble by shuffling word order; keep words intact
  const words = sentence.split(" ");
  let attempt = words.slice();
  let tries = 0;
  do {
    attempt = shuffleArray(attempt.slice());
    tries++;
  } while (attempt.join(" ") === sentence && tries < 10);
  return attempt.join(" ");
}

// New: reveal-first-letters hint (clear and practical)
function generateHintFirstLetters(answer, isSentence) {
  const count = isSentence ? CONFIG.lettersHintSentence : CONFIG.lettersHintWord;

  // Build a string that reveals the first N non-space characters, preserving spaces
  let revealed = "";
  let revealedCount = 0;
  for (const ch of answer) {
    if (ch === " ") {
      revealed += " ";
    } else if (revealedCount < count) {
      revealed += ch;
      revealedCount++;
    } else {
      revealed += "_";
    }
  }
  return revealed;
}

// ===== Game state =====
const state = {
  category: "word",
  levelIndex: 0,
  itemI...

  const state = {
category: "word",
levelIndex: 0,
itemIndex: 0,
score: 0,
levelScore: 0,
hintUsed: false,
timerId: null,
timeLeft: 0,
items: [],
wrongAttempts: 0,
completedLevels: { word: new Set(), sentence: new Set() } // NEW
};

function endLevel() {
gameSection.classList.add("hidden");
resultSection.classList.remove("hidden");
levelScoreEl.textContent = ${state.levelScore};
totalScoreEl.textContent = ${state.score};

// Mark this level as completed
const cat = state.category;
state.completedLevels[cat].add(state.levelIndex);

// Refresh selector to show ticks
populateLevelSelector();
}

function populateLevelSelector() {
levelSel.innerHTML = "";
const source = categorySel.value === "word" ? WORD_LEVELS : SENTENCE_LEVELS;
const count = source.length;
const completed = state.completedLevels[categorySel.value];

for (let i = 1; i <= count; i++) {
const opt = document.createElement("option");
opt.value = i - 1;
// Add ✔ if completed
opt.textContent = completed.has(i - 1) ? Level ${i} ✔ : Level ${i};
levelSel.appendChild(opt);
}
}

// here hint need to be updated from above.
// Reveal first letters or words as a hint
function generateHint(answer, isSentence) {
if (isSentence) {
// For sentences: show the first 3 words
const words = answer.split(" ");
const revealed = words.slice(0, 3).join(" ");
return Starts with: "${revealed}...";
} else {
// For words: show the first 2 letters
return Starts with: "${answer.slice(0, 2)}...";
}
}

hintBtn.addEventListener("click", () => {
if (state.hintUsed) {
feedbackEl.textContent = "Hint already used in this level.";
feedbackEl.className = "feedback";
return;
}
state.hintUsed = true;
hudHintStatus.textContent = "used";

const item = state.items[state.itemIndex];
const hint = generateHint(item.clean, item.isSentence);
feedbackEl.textContent = hint;
feedbackEl.className = "feedback";
});
