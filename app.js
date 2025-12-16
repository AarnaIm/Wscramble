// ===============================
// Wscramble – Full Game Logic
// ===============================

console.log("Wscramble JS loaded");

// ===============================
// CONFIG
// ===============================
const CONFIG = {
  pointsPerCorrect: 5,
  pointsPerWrong: 1, // W3: deduct but never below 0
  wordTimeSec: 40,
  sentenceTimeSec: 60,
  lettersHintWord: 2,
  lettersHintSentence: 3,
  maxHintsPerLevel: 2
};

// ===============================
// DATASETS
// ===============================
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

  // New levels start here
  ["camera", "pillow", "window", "garden", "pencil"],
  ["blanket", "bottle", "ticket", "engine", "planet"],
  ["helmet", "rocket", "castle", "pocket", "silver"],
  ["tunnel", "branch", "circle", "market", "shadow"],
  ["cactus", "saddle", "fabric", "hammer", "button"],
  ["anchor", "beacon", "copper", "dancer", "feather"],
  ["marble", "pepper", "singer", "valley", "winter"],
  ["packet", "bridge", "hunter", "island", "jacket"],
  ["kitten", "ladder", "memory", "notebook", "orange"],
  ["planet", "quartz", "rocket", "signal", "temple"]
];

const SENTENCE_LEVELS = [
  ["the sky is blue", "cats love warm sun", "we walk to school", "it is a bright day", "time heals all wounds"],
  ["birds sing at dawn", "music makes us smile", "read books every day", "plants grow with care", "friends share good stories"],
  ["coding is fun and creative", "learn new things daily", "practice makes us better", "work hard and be kind", "curiosity drives learning"],
  ["the river flows quietly", "stars shine in the night", "coffee smells great today", "the garden looks fresh", "sunrise colors the clouds"],
  ["he wrote a short poem", "they watched a calm movie", "we cooked a simple meal", "she painted a small canvas", "kids played outside happily"],

  // New levels start here
  ["the forest was calm today", "we enjoyed the gentle breeze", "the dog barked at strangers", "she found a hidden path", "they shared a warm meal"],
  ["the old bridge looked strong", "we crossed the silent valley", "the teacher praised our work", "he fixed the broken chair", "the kids played in rain"],
  ["the bright moon guided us", "she wrote a lovely letter", "they traveled across mountains", "we watched the sunset glow", "the garden smelled fresh"],
  ["he carried a heavy suitcase", "the baby slept peacefully", "we cleaned the messy room", "she baked a sweet cake", "they laughed all evening"],
  ["the storm passed quickly", "we repaired the wooden fence", "she planted colorful flowers", "the cat slept on sofa", "they enjoyed the picnic"],

  ["the library was very quiet", "she solved the tricky puzzle", "we explored the old castle", "he painted a bright mural", "they danced under lights"],
  ["the market was crowded today", "we bought fresh vegetables", "she found a rare book", "he fixed the leaking pipe", "they enjoyed the festival"],
  ["the ocean waves were strong", "we collected shiny shells", "she built a tall sandcastle", "he swam across the bay", "they relaxed on the beach"],
  ["the train arrived on time", "we packed our bags early", "she booked the hotel room", "he checked the travel map", "they enjoyed the journey"],
  ["the chef cooked spicy food", "we tasted the new dish", "she served warm soup", "he cleaned the kitchen", "they enjoyed the dinner"],

  ["the doctor checked the patient", "we waited in the hallway", "she filled the form quickly", "he bought some medicine", "they left the clinic"],
  ["the artist drew a portrait", "we admired the painting", "she mixed bright colors", "he shaped the sculpture", "they displayed the artwork"],
  ["the farmer harvested crops", "we fed the animals", "she carried a basket", "he repaired the tractor", "they worked in the field"],
  ["the pilot flew the airplane", "we boarded the flight", "she checked the tickets", "he guided the passengers", "they landed safely"],
  ["the actor performed well", "we watched the movie", "she clapped loudly", "he reviewed the film", "they enjoyed the show"]
];

// ===============================
// DOM REFERENCES
// ===============================
const setupSection = document.getElementById("setup");
const gameSection = document.getElementById("game");
const resultSection = document.getElementById("result");

const categorySel = document.getElementById("category");
const levelSel = document.getElementById("level");

const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const skipBtn = document.getElementById("skipBtn");
const hintBtn = document.getElementById("hintBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const restartBtn = document.getElementById("restartBtn");

const scrambleEl = document.getElementById("scramble");
const answerEl = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");

const hudCategory = document.getElementById("hudCategory");
const hudLevel = document.getElementById("hudLevel");
const hudItemIndex = document.getElementById("hudItemIndex");
const hudTimer = document.getElementById("hudTimer");
const hudScore = document.getElementById("hudScore");
const hudHintStatus = document.getElementById("hudHintStatus");

const levelScoreEl = document.getElementById("levelScore");
const totalScoreEl = document.getElementById("totalScore");

// ===============================
// GAME STATE
// ===============================
const state = {
  category: "word",
  levelIndex: 0,
  itemIndex: 0,
  score: 0,
  levelScore: 0,
  timeLeft: 0,
  timerId: null,
  items: [],
  hintsUsed: 0,

  // ✅ Separate tracking for each category
  completedLevels: {
    word: new Set(),
    sentence: new Set()
  }
};

// ===============================
// UTILITY FUNCTIONS
// ===============================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scrambleWord(word) {
  let chars = word.split("");
  let attempt = chars.slice();
  let tries = 0;

  do {
    attempt = shuffleArray(attempt.slice());
    tries++;
  } while (attempt.join("") === word && tries < 10);

  return attempt.join("");
}

function scrambleSentence(sentence) {
  let words = sentence.split(" ");
  let attempt = words.slice();
  let tries = 0;

  do {
    attempt = shuffleArray(attempt.slice());
    tries++;
  } while (attempt.join(" ") === sentence && tries < 10);

  return attempt.join(" ");
}

// ===============================
// ✅ FIXED: HINT SYSTEM
// ===============================
function generateHintFirstLetters(answer, isSentence) {
  const count = isSentence ? CONFIG.lettersHintSentence : CONFIG.lettersHintWord;

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

// ===============================
// ✅ FIXED: LEVEL SELECTOR
// ===============================
function populateLevelSelector() {
  levelSel.innerHTML = "";

  const cat = categorySel.value === "word" ? "word" : "sentence";
  const source = cat === "word" ? WORD_LEVELS : SENTENCE_LEVELS;
  const completed = state.completedLevels[cat];

  for (let i = 0; i < source.length; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = completed.has(i) ? `Level ${i + 1} ✔` : `Level ${i + 1}`;
    levelSel.appendChild(opt);
  }
}

populateLevelSelector();
categorySel.addEventListener("change", populateLevelSelector);

// ===============================
// START LEVEL
// ===============================
function startLevel() {
  state.category = categorySel.value;
  state.levelIndex = Number(levelSel.value);
  state.itemIndex = 0;
  state.levelScore = 0;
  state.hintsUsed = 0;

  hintBtn.disabled = false;
  hudHintStatus.textContent = "available";

  const source =
    state.category === "word" ? WORD_LEVELS : SENTENCE_LEVELS;
  const rawItems = source[state.levelIndex];

  state.items = rawItems.map((item) => ({
    clean: item,
    isSentence: state.category === "sentence"
  }));

  setupSection.classList.add("hidden");
  resultSection.classList.add("hidden");
  gameSection.classList.remove("hidden");

  hudCategory.textContent = state.category;
  hudLevel.textContent = state.levelIndex + 1;
  hudScore.textContent = state.score;

  startTimer();
  loadItem();
}

// ===============================
// TIMER
// ===============================
function startTimer() {
  clearInterval(state.timerId);

  state.timeLeft =
    state.category === "word"
      ? CONFIG.wordTimeSec
      : CONFIG.sentenceTimeSec;

  hudTimer.textContent = state.timeLeft;
  hudTimer.classList.remove("warn");

  state.timerId = setInterval(() => {
    state.timeLeft--;
    hudTimer.textContent = state.timeLeft;

    if (state.timeLeft <= 10) {
      hudTimer.classList.add("warn");
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      endLevel();
    }
  }, 1000);
}

// ===============================
// LOAD ITEM
// ===============================
function loadItem() {
  const item = state.items[state.itemIndex];

  hudItemIndex.textContent = state.itemIndex + 1;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  answerEl.value = "";

  const scrambled = item.isSentence
    ? scrambleSentence(item.clean)
    : scrambleWord(item.clean);

  scrambleEl.textContent = scrambled;
}

// ===============================
// CHECK ANSWER
// ===============================
function checkAnswer() {
  const item = state.items[state.itemIndex];
  const userAns = answerEl.value.trim().toLowerCase();

  if (!userAns) return;

  if (userAns === item.clean.toLowerCase()) {
    state.levelScore += CONFIG.pointsPerCorrect;
    state.score += CONFIG.pointsPerCorrect;

    feedbackEl.textContent = "Correct!";
    feedbackEl.className = "feedback ok";

    hudScore.textContent = state.score;
    setTimeout(nextItem, 400);
  } else {
    state.score = Math.max(0, state.score - CONFIG.pointsPerWrong);

    feedbackEl.textContent = "Wrong!";
    feedbackEl.className = "feedback err";

    hudScore.textContent = state.score;
  }
}

// ===============================
// NEXT ITEM
// ===============================
function nextItem() {
  state.itemIndex++;

  if (state.itemIndex >= 5) {
    endLevel();
  } else {
    loadItem();
  }
}

// ===============================
// ✅ FIXED: END LEVEL
// ===============================
function endLevel() {
  clearInterval(state.timerId);

  gameSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  levelScoreEl.textContent = state.levelScore;
  totalScoreEl.textContent = state.score;

  // ✅ FIXED: Always mark the correct category
  const cat = state.category === "word" ? "word" : "sentence";
  state.completedLevels[cat].add(state.levelIndex);

  populateLevelSelector();
}

// ===============================
// HINT BUTTON
// ===============================
hintBtn.addEventListener("click", () => {
  if (state.hintsUsed >= CONFIG.maxHintsPerLevel) {
    feedbackEl.textContent = "No hints remaining in this level.";
    feedbackEl.className = "feedback err";
    return;
  }

  const item = state.items[state.itemIndex];
  const hint = generateHintFirstLetters(item.clean, item.isSentence);

  state.hintsUsed++;

  if (state.hintsUsed >= CONFIG.maxHintsPerLevel) {
    hintBtn.disabled = true;
    hudHintStatus.textContent = "no hints left";
  } else {
    hudHintStatus.textContent =
      `${CONFIG.maxHintsPerLevel - state.hintsUsed} left`;
  }

  feedbackEl.textContent = `Hint: ${hint}`;
  feedbackEl.className = "feedback";
});

// ===============================
// BUTTON EVENTS
// ===============================
startBtn.addEventListener("click", startLevel);
submitBtn.addEventListener("click", checkAnswer);
skipBtn.addEventListener("click", nextItem);

nextLevelBtn.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  setupSection.classList.remove("hidden");
});

restartBtn.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  setupSection.classList.remove("hidden");
});
