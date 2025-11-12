const QUIZZES = {
  "Alle Quizzen": "quizzes/alles.json",
  "Quiz My Ass": "quizzes/quiz1.json",
  "De Grote Mei Quiz": "quizzes/quiz2.json"
};

let questions = [];
let current = 0;
let score = 0;
let selectedQuiz = null;
let scoreboard = JSON.parse(localStorage.getItem("scoreboard") || "[]");

const menu = document.getElementById("menu");
const quizDiv = document.getElementById("quiz");
const resultDiv = document.getElementById("result");
const questionText = document.getElementById("question-text");
const answersDiv = document.getElementById("answers");
const questionImage = document.getElementById("question-image");
const openInput = document.getElementById("open-input");
const submitOpen = document.getElementById("submit-open");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const progress = document.getElementById("progress");
const finalScore = document.getElementById("final-score");
const scoreboardDiv = document.getElementById("scoreboard");
const quizButtons = document.getElementById("quiz-buttons");

function shuffle(array) {
  return array.map(a => ({ sort: Math.random(), value: a }))
              .sort((a, b) => a.sort - b.sort)
              .map(a => a.value);
}

function renderScoreboard() {
  if (scoreboard.length === 0) return;
  scoreboardDiv.innerHTML = "<h3>Past Scores</h3>" + 
    scoreboard.map(e => `<p>${e.quiz}: ${e.score} / ${e.total}</p>`).join("");
}

function showMenu() {
  menu.classList.remove("hidden");
  quizDiv.classList.add("hidden");
  resultDiv.classList.add("hidden");
  renderScoreboard();
}

function startQuiz(name) {
  selectedQuiz = name;
  fetch(QUIZZES[name])
    .then(res => res.json())
    .then(data => {
      questions = shuffle(data.questions).map(q => ({
        ...q,
        answers: q.answers ? shuffle(q.answers) : []
      }));
      current = 0;
      score = 0;
      menu.classList.add("hidden");
      resultDiv.classList.add("hidden");
      quizDiv.classList.remove("hidden");
      showQuestion();
    })
    .catch(err => alert("Error loading quiz: " + err));
}

function showQuestion() {
  const q = questions[current];
  feedback.textContent = "";
  openInput.classList.add("hidden");
  submitOpen.classList.add("hidden");
  nextBtn.classList.add("hidden");
  answersDiv.innerHTML = "";

  questionText.textContent = q.question;
  progress.textContent = `${current + 1} / ${questions.length}`;
  
  if (q.image) {
    questionImage.src = q.image;
    questionImage.classList.remove("hidden");
  } else {
    questionImage.classList.add("hidden");
  }

  if (!q.answers || q.answers.length === 0) {
    openInput.value = "";
    openInput.classList.remove("hidden");
    submitOpen.classList.remove("hidden");
    submitOpen.onclick = () => handleOpenSubmit(q);
  } else {
    q.answers.forEach(ans => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = ans;
      btn.onclick = () => handleAnswer(q, ans, btn);
      answersDiv.appendChild(btn);
    });
  }
}

function handleAnswer(q, ans, btn) {
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach(b => b.disabled = true);

  const isCorrect = ans === q.correct;
  if (isCorrect) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("incorrect");
    buttons.forEach(b => {
      if (b.textContent === q.correct) b.classList.add("correct");
    });
  }

  nextBtn.classList.remove("hidden");
  nextBtn.onclick = nextQuestion;
}

function handleOpenSubmit(q) {
  const correctAnswers = Array.isArray(q.correct)
    ? q.correct.map(a => a.toLowerCase().trim())
    : [q.correct.toLowerCase().trim()];
  const userAnswer = openInput.value.toLowerCase().trim();

  const correct = correctAnswers.includes(userAnswer);
  if (correct) score++;

  feedback.textContent = correct
    ? "✅ Correct!"
    : "❌ Wrong! Correct: " + (Array.isArray(q.correct) ? q.correct.join(", ") : q.correct);

  openInput.classList.add(correct ? "correct" : "incorrect");
  submitOpen.classList.add("hidden");
  nextBtn.classList.remove("hidden");
  nextBtn.onclick = nextQuestion;
}

function nextQuestion() {
  if (current + 1 < questions.length) {
    current++;
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  quizDiv.classList.add("hidden");
  resultDiv.classList.remove("hidden");
  finalScore.textContent = `Score: ${score} / ${questions.length}`;
  scoreboard.push({ quiz: selectedQuiz, score, total: questions.length });
  localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
}

document.getElementById("back-btn").onclick = showMenu;

Object.keys(QUIZZES).forEach(key => {
  const btn = document.createElement("button");
  btn.textContent = key.toUpperCase();
  btn.onclick = () => startQuiz(key);
  quizButtons.appendChild(btn);
});

showMenu();
