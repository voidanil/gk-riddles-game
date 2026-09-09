import { mathQn, mathAns, gkQn, gkAns, iqQn, iqAns } from "./data.js";

// ==============================
// DOM HELPERS
// ==============================

const $ = (id) => document.getElementById(id);

// ==============================
// GAME SETTINGS
// ==============================

const MAX_TIME = 20;
const COUNTDOWN_TIME = 6;

// ==============================
// GAME STATE
// ==============================

let questions = [];
let answers = [];

let questionIndex = 0;
let points = 0;
let totalTime = 0;
let timer = COUNTDOWN_TIME;

let scaleValue = 0;
let gameInterval = null;
let gameRunning = false;

// ==============================
// INITIAL SETUP
// ==============================

document.body.style.padding = "30px";

$("guessPlease").textContent = "Let's Play";
$("points").textContent = "Points :";
$("timer").textContent = "⏱";

// ==============================
// PAGE TITLE ANIMATION
// ==============================

const title = "Solve The Puzzle";

let titleIndex = 0;
let titleText = "";

setInterval(() => {
  titleText += title[titleIndex];
  document.title = titleText;

  titleIndex++;

  if (titleIndex >= title.length) {
    titleIndex = 0;
    titleText = "";
  }
}, 300);

// ==============================
// SELECT TOPIC
// ==============================

function selectTopic(newQuestions, newAnswers) {
  if (gameRunning) return;

  questions = [...newQuestions];
  answers = [...newAnswers];

  resetGame();

  $("guessPlease").textContent = "Let's Play";
}

// ==============================
// TOPIC BUTTONS
// ==============================

$("iq").addEventListener("click", (event) => {
  event.preventDefault();
  selectTopic(iqQn, iqAns);
});

$("math").addEventListener("click", (event) => {
  event.preventDefault();
  selectTopic(mathQn, mathAns);
});

$("gk").addEventListener("click", (event) => {
  event.preventDefault();
  selectTopic(gkQn, gkAns);
});

// ==============================
// ACTIVE TOPIC
// ==============================

document.querySelectorAll(".topic").forEach((topic) => {
  topic.addEventListener("click", () => {
    document
      .querySelectorAll(".topic")
      .forEach((item) => item.classList.remove("active"));

    topic.classList.add("active");
  });
});

// ==============================
// SHUFFLE QUESTIONS
// ==============================

function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [questions[i], questions[randomIndex]] = [
      questions[randomIndex],
      questions[i],
    ];

    [answers[i], answers[randomIndex]] = [answers[randomIndex], answers[i]];
  }
}

// ==============================
// UPDATE SCALE
// ==============================

function updateScale() {
  if (answers.length === 0) return;

  const percentage = (scaleValue / answers.length) * 100;

  $("scaleMeter").style.backgroundImage = `linear-gradient(
      to right,
      #33ff33 ${percentage}%,
      #ff4d4d ${percentage}%
    )`;
}

// ==============================
// SHOW QUESTION
// ==============================

function showQuestion() {
  if (questionIndex >= questions.length) {
    finishGame();
    return;
  }

  $("guessPlease").textContent = questions[questionIndex];
}

// ==============================
// START GAME
// ==============================

function startGame() {
  if (gameRunning) return;

  if (answers.length === 0) {
    $("guessPlease").textContent = "No questions available";
    return;
  }

  gameRunning = true;

  $("playGame").disabled = true;

  questionIndex = 0;
  points = 0;
  totalTime = 0;
  scaleValue = 0;

  shuffleQuestions();
  updateScale();

  // Start countdown
  timer = COUNTDOWN_TIME;

  $("points").textContent = "Points :";
  $("guesses").value = "";

  gameInterval = setInterval(gameTick, 1000);

  $("guessPlease").textContent = "Get Ready!!";
}

// ==============================
// GAME TIMER
// ==============================

function gameTick() {
  $("timer").textContent = `${timer} s`;

  // Countdown
  if (timer > 1) {
    if (timer <= COUNTDOWN_TIME) {
      $("guessPlease").textContent = `Starts on: ${timer}`;
    }

    timer--;
    return;
  }

  // Start actual game
  if (timer === 1) {
    $("guessPlease").textContent = "Go";

    timer = MAX_TIME;

    showQuestion();

    return;
  }

  // Actual question timer
  if (timer > 0) {
    totalTime++;

    timer--;

    return;
  }

  // Time is over
  timeOut();
}

// ==============================
// TIME OUT
// ==============================

function timeOut() {
  $("guessPlease").textContent = "Time Out !!";
  $("guesses").value = "";

  questionIndex++;

  if (questionIndex >= questions.length) {
    finishGame();
    return;
  }

  timer = MAX_TIME;

  showQuestion();
}

// ==============================
// SUBMIT ANSWER
// ==============================

$("wordPuzzle").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!gameRunning) return;

  if (timer <= 0 || timer > MAX_TIME) return;

  const userAnswer = $("guesses").value.trim().toLowerCase();

  const correctAnswer = String(answers[questionIndex]).trim().toLowerCase();

  $("guesses").value = "";

  if (userAnswer !== correctAnswer) {
    return;
  }

  // Correct answer
  $("guessPlease").textContent = "Correct ✔";

  points++;
  scaleValue++;
  questionIndex++;

  $("points").textContent = `Points: ${points}`;

  updateScale();

  // Game completed
  if (questionIndex >= questions.length) {
    finishGame();
    return;
  }

  // Next question gets a fresh 20 seconds
  timer = MAX_TIME;

  showQuestion();
});

// ==============================
// SKIP QUESTION
// ==============================

$("skip").addEventListener("click", (event) => {
  event.preventDefault();

  if (!gameRunning) return;

  if (timer <= 0 || timer > MAX_TIME) return;

  $("guesses").value = "";

  questionIndex++;

  if (questionIndex >= questions.length) {
    finishGame();
    return;
  }

  timer = MAX_TIME;

  showQuestion();
});

// ==============================
// RESTART GAME
// ==============================

$("restart").addEventListener("click", (event) => {
  event.preventDefault();

  stopTimer();

  gameRunning = false;

  resetGame();

  $("playGame").disabled = false;

  $("guessPlease").textContent = "Let's Play";
});

// ==============================
// RESET GAME
// ==============================

function resetGame() {
  questionIndex = 0;
  points = 0;
  totalTime = 0;
  scaleValue = 0;

  timer = COUNTDOWN_TIME;

  $("points").textContent = "Points :";
  $("timer").textContent = "⏱";
  $("guesses").value = "";

  updateScale();
}

// ==============================
// FINISH GAME
// ==============================

function finishGame() {
  stopTimer();

  gameRunning = false;

  $("playGame").disabled = false;

  $("points").innerHTML = `Thank You for playing.<br>
     You scored ${points} out of ${answers.length}
     in ${totalTime} sec.`;

  if (points === answers.length) {
    $("guessPlease").textContent = "BINGO !!";
  } else {
    $("guessPlease").textContent = `Score: ${points}`;
  }

  $("guesses").value = "";
}

// ==============================
// STOP TIMER
// ==============================

function stopTimer() {
  if (gameInterval !== null) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
}

// ==============================
// PLAY BUTTON
// ==============================

$("playGame").addEventListener("click", (event) => {
  event.preventDefault();
  startGame();
});
