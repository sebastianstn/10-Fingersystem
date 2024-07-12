// Hier wählen wir wichtige Elemente aus unserer HTML-Seite aus
const textDisplay = document.getElementById("text-display");
const inputArea = document.getElementById("input-area");
const timer = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const speedDisplay = document.getElementById("speed");
const accuracyDisplay = document.getElementById("accuracy");
const progressBar = document.getElementById("progress-bar");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const levelDisplay = document.getElementById("current-level");
const xpDisplay = document.getElementById("current-xp");
const xpToNextLevelDisplay = document.getElementById("xp-to-next-level");
const mascot = document.getElementById("mascot");
const starsDisplay = document.getElementById("stars-display");

// Hier speichern wir wichtige Informationen für unseren Tipptest
let timeLeft = 60; // Wie viel Zeit noch übrig ist
let timerInterval; // Hilft uns, die Zeit zu zählen
let currentWordIndex = 0; // Welches Wort gerade getippt werden soll
let correctWords = 0; // Wie viele Wörter richtig getippt wurden
let totalTyped = 0; // Wie viele Wörter insgesamt getippt wurden
let currentDifficulty = "anfänger"; // Wie schwierig der Test gerade ist
let currentRowIndex = 0; // In welcher Zeile wir gerade sind
const wordsPerRow = 8; // Wie viele Wörter in einer Zeile stehen

// Hier speichern wir Informationen über das Level des Spielers
let currentLevel = 1; // Das aktuelle Level des Spielers
let currentXP = 0; // Wie viele Erfahrungspunkte der Spieler hat
let xpToNextLevel = 100; // Wie viele Punkte für das nächste Level nötig sind
let collectedStars = 0; // Wie viele Sterne der Spieler gesammelt hat

// Hier sind die Wörter für die verschiedenen Schwierigkeitsgrade
const wordLists = {
  anfänger: [
    "aus",
    "bei",
    "mit",
    "nach",
    "seit",
    "von",
    "zu",
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
  fortgeschritten: [
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
  experte: [
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

let currentWordList = []; // Die Wörter, die gerade verwendet werden
let highScores = { anfänger: [], fortgeschritten: [], experte: [] }; // Die besten Ergebnisse
let testHistory = []; // Hier merken wir uns, wie gut der Spieler war

// Diese Funktion lässt unser Maskottchen sprechen
function updateMascot(message) {
  mascot.textContent = message;
  mascot.style.display = "block";
  setTimeout(() => (mascot.style.display = "none"), 8000);
}

// Diese Funktion anpasst und stellt sicher, dass die Anzeige von Text, auf 2 Reihe gut funktioniert
function updateCurrentWord() {
  const words = textDisplay.querySelectorAll("span.word");
  words.forEach((word) => word.classList.remove("current"));
  const currentWordInDisplay = Array.from(words).find(
    (word) => parseInt(word.dataset.index) === currentWordIndex
  );
  if (currentWordInDisplay) {
    currentWordInDisplay.classList.add("current");
  } else {
    updateDisplay();
  }
}
// Diese Funktion fügt neue Sterne hinzu
function updateStars(starsEarned) {
  collectedStars += starsEarned;
  starsDisplay.textContent = "⭐".repeat(collectedStars);
  updateMascot(`Toll! Du hast ${starsEarned} Sterne gesammelt!`);
}

// Diese Funktion ändert, wie schwierig der Test ist
function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  currentWordList = generateText(difficulty, 50).split(" ");
  resetTest();
  updateDisplay();
  updateCurrentWord();
  updateDifficultyButtons();
  updateProgressBar(0);

  // Entfernen Sie zuerst alle Schwierigkeitsklassen
  textDisplay.classList.remove(
    "difficulty-anfänger",
    "difficulty-fortgeschritten",
    "difficulty-experte"
  );
  // Fügen Sie die neue Schwierigkeitsklasse hinzu
  textDisplay.classList.add(`difficulty-${difficulty}`);

  // Hier sagt unser Maskottchen etwas Ermutigendes
  const messages = {
    anfänger: "Los geht's! Du schaffst das!",
    fortgeschritten: "Gut gemacht! Jetzt wird's etwas schwieriger!",
    experte: "Wow, du bist ein Profi! Zeig, was du kannst!",
  };
  updateMascot(messages[difficulty]);
}

// Diese Funktion startet den Test von vorne
function resetTest() {
  timeLeft = 60;
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

// Diese Funktion startet den Tipptest
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
  updateMascot("Los geht's! Viel Glück!");
}

// Diese Funktion zählt die Zeit runter
function updateTimer() {
  timeLeft--;
  timer.textContent = timeLeft;
  updateProgressBar(((60 - timeLeft) / 60) * 100);
  if (timeLeft === 0) {
    endTest();
  }
}

// Diese Funktion zeigt an, wie weit der Test schon ist
function updateProgressBar(percentage) {
  progressBar.style.width = `${percentage}%`;
}

// Diese Funktion zeigt die Wörter an, die getippt werden sollen
function updateDisplay() {
  const words = currentWordList.slice(
    currentWordIndex,
    currentWordIndex + wordsPerRow * 2
  );
  const rows = [
    words.slice(0, wordsPerRow),
    words.slice(wordsPerRow, wordsPerRow * 2),
  ];

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
          .join(" ")}</div>`
    )
    .join("");

  updateCurrentWord();
}

// Diese Funktion prüft, ob das Wort richtig getippt wurde
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
    updateMascot("Super gemacht!");
    updateStars(0.1);
  } else {
    currentSpan.classList.add("incorrect");
    updateMascot("Fast! Nächstes Mal klappt es bestimmt!");
  }

  currentSpan.classList.remove("current");
  totalTyped++;
  currentWordIndex++;

  if (currentWordIndex % (wordsPerRow[currentDifficulty] * 2) === 0) {
    updateDisplay();
  } else {
    updateCurrentWord();
  }

  inputArea.value = "";
}

// Diese Funktion gibt dem Spieler Erfahrungspunkte und lässt ihn aufleveln
function updateXP(xpGained) {
  currentXP += xpGained;
  if (currentXP >= xpToNextLevel) {
    currentLevel++;
    currentXP -= xpToNextLevel;
    xpToNextLevel = Math.round(xpToNextLevel * 1.5);
    updateMascot(`Wow! Du bist jetzt Level ${currentLevel}!`);
  }

  levelDisplay.textContent = currentLevel;
  xpDisplay.textContent = currentXP;
  xpToNextLevelDisplay.textContent = xpToNextLevel;
}

// Diese Funktion beendet den Test und zeigt das Ergebnis
function endTest() {
  clearInterval(timerInterval);
  inputArea.disabled = true;
  const wpm = Math.round((correctWords / 1) * 60);
  const accuracy = Math.round((correctWords / totalTyped) * 100) || 0;
  speedDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy;
  startBtn.disabled = false;

  updateHighScore(wpm);
  updateStatistics(wpm, accuracy);
  const extraStars = Math.floor(wpm / 10);
  updateStars(extraStars);
  updateMascot(
    `Toll gemacht! Du hast ${wpm} WPM erreicht und ${extraStars} extra Sterne gesammelt!`
  );
}

// Diese Funktion erstellt den Text zum Tippen
function generateText(difficulty, wordCount) {
  const list = wordLists[difficulty];
  let text = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * list.length);
    text.push(list[randomIndex]);
  }
  return text.join(" ");
}

// Diese Funktion speichert neue Highscores
function updateHighScore(wpm) {
  highScores[currentDifficulty].push(wpm);
  highScores[currentDifficulty].sort((a, b) => b - a);
  highScores[currentDifficulty] = highScores[currentDifficulty].slice(0, 5);
  displayHighScores();
}

// Diese Funktion zeigt die besten Ergebnisse an
function displayHighScores() {
  const highScoreList = document.getElementById("high-scores");
  highScoreList.innerHTML = `<h3>Bestenliste (${currentDifficulty}):</h3>`;
  highScores[currentDifficulty].forEach((score, index) => {
    highScoreList.innerHTML += `<p>${index + 1}. ${score} WPM</p>`;
  });
}

// Diese Funktion speichert die Testergebnisse
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

// Diese Funktion zeigt an, welcher Schwierigkeitsgrad gerade ausgewählt ist
function updateDifficultyButtons() {
  const buttons = {
    anfänger: document.getElementById("anfänger-btn"),
    fortgeschritten: document.getElementById("fortgeschritten-btn"),
    experte: document.getElementById("experte-btn"),
  };

  Object.keys(buttons).forEach((diff) => {
    if (buttons[diff]) {
      buttons[diff].classList.toggle("active", currentDifficulty === diff);
    }
  });
}

// Diese Funktion prüft, was der Spieler tippt
inputArea.addEventListener("input", function (e) {
  const currentSpan = textDisplay.querySelector("span.word.current");
  const typedWord = inputArea.value;
  const currentWord = currentWordList[currentWordIndex];

  let isCorrect = true;

  if (typedWord.length > currentWord.length) {
    isCorrect = false;
    currentSpan.classList.add("error");
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

// Diese Funktion prüft, ob die Leertaste gedrückt wurde
inputArea.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.preventDefault();
    const typedWord = inputArea.value.trim();
    if (typedWord.length > 0) {
      checkWord();
    }
  }
});

// Diese Funktion schaltet den Dunkelmodus ein oder aus
darkModeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
});

// Diese Funktion wird ausgeführt, wenn die Seite geladen wird
document.addEventListener("DOMContentLoaded", function () {
  startBtn.addEventListener("click", startTest);
  document
    .getElementById("anfänger-btn")
    .addEventListener("click", () => setDifficulty("anfänger"));
  document
    .getElementById("fortgeschritten-btn")
    .addEventListener("click", () => setDifficulty("fortgeschritten"));
  document
    .getElementById("experte-btn")
    .addEventListener("click", () => setDifficulty("experte"));
  setDifficulty("anfänger");
  displayHighScores();
  updateMascot("Willkommen! Bist du bereit zum Tippen?");
});
