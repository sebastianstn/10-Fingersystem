const textDisplay = document.getElementById("text-display");
const inputArea = document.getElementById("input-area");
const timer = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const speedDisplay = document.getElementById("speed");
const accuracyDisplay = document.getElementById("accuracy");
const easyBtn = document.getElementById("easy-btn");
const mediumBtn = document.getElementById("medium-btn");
const hardBtn = document.getElementById("hard-btn");
const durationSelect = document.getElementById("test-duration");
const progressBar = document.getElementById("progress-bar");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const levelDisplay = document.getElementById("current-level");
const xpDisplay = document.getElementById("current-xp");
const xpToNextLevelDisplay = document.getElementById("xp-to-next-level");

let timeLeft;
let timerInterval;
let currentWordIndex = 0;
let correctWords = 0;
let totalTyped = 0;
let currentDifficulty = "medium";
let currentRowIndex = 0;
const wordsPerRow = 10;

let currentLevel = 1;
let currentXP = 0;
let xpToNextLevel = 100;

const wordLists = {
  easy: [
    "der",
    "die",
    "das",
    "und",
    "in",
    "zu",
    "den",
    "mit",
    "von",
    "für",
    "nicht",
    "im",
    "ein",
    "eine",
    "auf",
    "ist",
    "sich",
    "auch",
    "es",
    "an",
    "werden",
    "aus",
    "er",
    "hat",
    "dass",
    "sie",
    "nach",
    "wird",
    "bei",
    "einer",
    "um",
    "am",
    "sind",
    "noch",
    "wie",
    "einem",
    "über",
    "einen",
    "so",
    "Sie",
  ],
  medium: [
    "Arbeit",
    "Leben",
    "Zeit",
    "Jahr",
    "Welt",
    "Haus",
    "Frage",
    "Frau",
    "Mann",
    "Kind",
    "Land",
    "Menschen",
    "Weg",
    "Tag",
    "Sache",
    "Hand",
    "Stadt",
    "Platz",
    "Stunde",
    "Woche",
    "Mutter",
    "Vater",
    "Freund",
    "Auge",
    "Kopf",
    "Idee",
    "Wasser",
    "Nacht",
    "Beispiel",
    "Seite",
    "Gruppe",
    "Musik",
    "Buch",
    "Kraft",
    "Liebe",
    "Meinung",
    "Prozess",
    "Wirtschaft",
    "Hilfe",
    "Thema",
  ],
  hard: [
    "Verantwortung",
    "Gesellschaft",
    "Entwicklung",
    "Möglichkeit",
    "Unternehmen",
    "Beziehung",
    "Erfahrung",
    "Wissenschaft",
    "Technologie",
    "Umweltschutz",
    "Globalisierung",
    "Nachhaltigkeit",
    "Gerechtigkeit",
    "Kommunikation",
    "Persönlichkeit",
    "Kreativität",
    "Herausforderung",
    "Zusammenarbeit",
    "Philosophie",
    "Psychologie",
    "Digitalisierung",
    "Transformation",
    "Individualität",
    "Authentizität",
    "Interdisziplinär",
    "Paradigmenwechsel",
    "Diversifizierung",
    "Implementierung",
    "Konsolidierung",
    "Restrukturierung",
  ],
};

let currentWordList = [];
let highScores = {
  easy: [],
  medium: [],
  hard: [],
};
let testHistory = [];

// Setzt den Schwierigkeitsgrad und initialisiert den Test
function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  currentWordList = generateText(difficulty, 50).split(" ");
  resetTest();
  updateDisplay();
  updateCurrentWord();
  updateDifficultyButtons();
  updateProgressBar(0);
}

// Setzt alle Testvariablen zurück und bereitet einen neuen Test vor
function resetTest() {
  timeLeft = parseInt(durationSelect.value);
  currentWordIndex = 0;
  currentRowIndex = 0;
  correctWords = 0;
  totalTyped = 0;
  inputArea.value = "";
  inputArea.disabled = true;
  startBtn.disabled = false;
  clearInterval(timerInterval);
  timer.textContent = timeLeft;
  speedDisplay.textContent = "0";
  accuracyDisplay.textContent = "100";
  updateProgressBar(0);
}

// Startet den Tipptest
function startTest() {
  if (currentWordList.length === 0) {
    setDifficulty(currentDifficulty);
  }
  resetTest();
  inputArea.disabled = false;
  inputArea.focus();
  timerInterval = setInterval(updateTimer, 1000);
  startBtn.disabled = true;
  updateDisplay();
  updateCurrentWord();
  updateProgressBar(0);
}

// Aktualisiert den Timer und beendet den Test, wenn die Zeit abgelaufen ist
function updateTimer() {
  timeLeft--;
  timer.textContent = timeLeft;
  updateProgressBar(
    ((parseInt(durationSelect.value) - timeLeft) /
      parseInt(durationSelect.value)) *
      100
  );
  if (timeLeft === 0) {
    endTest();
  }
}

// Aktualisiert die Fortschrittsleiste
function updateProgressBar(percentage) {
  progressBar.style.width = `${percentage}%`;
}

// Aktualisiert die Anzeige der zu tippenden Wörter
function updateDisplay() {
  const words = currentWordList.slice(currentWordIndex, currentWordIndex + 20);
  const rows = [];
  for (let i = 0; i < words.length; i += wordsPerRow) {
    rows.push(words.slice(i, i + wordsPerRow));
  }

  textDisplay.innerHTML = rows
    .map(
      (row, rowIndex) =>
        `<div class="word-row">${row
          .map(
            (word, index) =>
              `<span class="word" data-index="${
                currentWordIndex + rowIndex * wordsPerRow + index
              }">${word
                .split("")
                .map((char) => `<span class="char">${char}</span>`)
                .join("")}</span>`
          )
          .join("")}</div>`
    )
    .join("");

  updateCurrentWord();
}

// Markiert das aktuelle zu tippende Wort
function updateCurrentWord() {
  const words = textDisplay.querySelectorAll("span.word");
  words.forEach((word) => word.classList.remove("current"));
  const currentWord = Array.from(words).find(
    (word) => parseInt(word.dataset.index) === currentWordIndex
  );
  if (currentWord) {
    currentWord.classList.add("current");
  } else {
    updateDisplay();
  }
}

// Überprüft das getippte Wort und aktualisiert den Fortschritt
function checkWord() {
  const currentWord = currentWordList[currentWordIndex];
  const typedWord = inputArea.value.trim();
  const currentSpan = textDisplay.querySelector(
    `span.word[data-index="${currentWordIndex}"]`
  );

  if (typedWord === currentWord) {
    currentSpan.classList.add("correct");
    correctWords++;
    updateXP(10);
  } else {
    currentSpan.classList.add("incorrect");
    updateXP(0);
  }

  animateWord(currentSpan);
  currentSpan.classList.remove("current");
  totalTyped++;
  currentWordIndex++;

  if (currentWordIndex % 20 === 0) {
    updateDisplay();
  } else {
    updateCurrentWord();
  }

  inputArea.value = "";
}

// Animiert das Wort kurz, wenn es getippt wurde
function animateWord(wordElement) {
  wordElement.style.transform = "scale(1.1)";
  setTimeout(() => {
    wordElement.style.transform = "scale(1)";
  }, 200);
}

// Aktualisiert die XP und das Level des Benutzers
function updateXP(xpGained) {
  currentXP += xpGained;
  if (currentXP >= xpToNextLevel) {
    currentLevel++;
    currentXP -= xpToNextLevel;
    xpToNextLevel = Math.round(xpToNextLevel * 1.5);
  }
  levelDisplay.textContent = currentLevel;
  xpDisplay.textContent = currentXP;
  xpToNextLevelDisplay.textContent = xpToNextLevel;
}

// Beendet den Test und zeigt die Ergebnisse an
function endTest() {
  clearInterval(timerInterval);
  inputArea.disabled = true;
  const totalMinutes = parseInt(durationSelect.value) / 60;
  const wpm = Math.round(correctWords / totalMinutes);
  const accuracy = Math.round((correctWords / totalTyped) * 100) || 0;
  speedDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy;
  startBtn.disabled = false;

  updateHighScore(wpm);
  updateStatistics(wpm, accuracy);
}

// Generiert einen zufälligen Text basierend auf dem Schwierigkeitsgrad
function generateText(difficulty, wordCount) {
  const list = wordLists[difficulty];
  let text = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * list.length);
    text.push(list[randomIndex]);
  }
  return text.join(" ");
}

// Aktualisiert die Höchstpunktzahl
function updateHighScore(wpm) {
  highScores[currentDifficulty].push(wpm);
  highScores[currentDifficulty].sort((a, b) => b - a);
  highScores[currentDifficulty] = highScores[currentDifficulty].slice(0, 5);
  displayHighScores();
}

// Zeigt die Höchstpunktzahl an
function displayHighScores() {
  const highScoreList = document.getElementById("high-scores");
  highScoreList.innerHTML = `<h3>Highscores (${currentDifficulty}):</h3>`;
  highScores[currentDifficulty].forEach((score, index) => {
    highScoreList.innerHTML += `<p>${index + 1}. ${score} WPM</p>`;
  });
}

// Aktualisiert die Teststatistiken
function updateStatistics(wpm, accuracy) {
  testHistory.push({
    date: new Date(),
    wpm,
    accuracy,
    difficulty: currentDifficulty,
  });

  const statsDisplay = document.getElementById("statistics");
  statsDisplay.innerHTML = "<h3>Letzte Tests:</h3>";
  testHistory
    .slice(-5)
    .reverse()
    .forEach((test, index) => {
      statsDisplay.innerHTML += `<p>${test.date.toLocaleDateString()}: ${
        test.wpm
      } WPM, ${test.accuracy}% Genauigkeit (${test.difficulty})</p>`;
    });
}

// Aktualisiert die Anzeige der Schwierigkeitsgrad-Buttons
function updateDifficultyButtons() {
  [easyBtn, mediumBtn, hardBtn].forEach((btn) =>
    btn.classList.remove("active")
  );
  document.getElementById(`${currentDifficulty}-btn`).classList.add("active");
}

// Event-Listener für die Eingabe des Benutzers
inputArea.addEventListener("input", function (e) {
  const currentSpan = textDisplay.querySelector("span.word.current");
  const typedWord = inputArea.value;
  const currentWord = currentWordList[currentWordIndex];

  let isCorrect = true;

  // Überprüfen, ob die Eingabe länger als das aktuelle Wort ist
  if (typedWord.length > currentWord.length) {
    isCorrect = false;
    currentSpan.classList.add("error");
    // Begrenzen Sie die Eingabe auf die Länge des aktuellen Wortes
    inputArea.value = typedWord.slice(0, currentWord.length);
  } else {
    Array.from(currentSpan.children).forEach((charSpan, index) => {
      if (index < typedWord.length) {
        if (typedWord[index] === currentWord[index]) {
          charSpan.classList.remove("incorrect");
          charSpan.classList.add("correct");
        } else {
          charSpan.classList.remove("correct");
          charSpan.classList.add("incorrect");
          isCorrect = false;
        }
      } else {
        charSpan.classList.remove("correct", "incorrect");
      }
    });
  }

  currentSpan.classList.toggle("error", !isCorrect);
});

// Event-Listener für Tastatureingaben
inputArea.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.preventDefault(); // Verhindert das Einfügen eines Leerzeichens
    const currentWord = currentWordList[currentWordIndex];
    const typedWord = inputArea.value.trim();

    if (typedWord.length > 0) {
      checkWord();
    }
  }
});

// Schaltet den Dunkelmodus ein/aus
darkModeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
});

// Initialisiert die Anwendung, wenn das DOM geladen ist
document.addEventListener("DOMContentLoaded", function () {
  startBtn.addEventListener("click", startTest);
  easyBtn.addEventListener("click", () => setDifficulty("easy"));
  mediumBtn.addEventListener("click", () => setDifficulty("medium"));
  hardBtn.addEventListener("click", () => setDifficulty("hard"));

  setDifficulty(currentDifficulty);
  displayHighScores();
});
