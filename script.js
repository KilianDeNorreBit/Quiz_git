
const QUIZZES = {

    "Quiz My Ass": {
        file: "quizzes/quiz-questions.json",
        year: 2025
    },

    "De Grote Mei Quiz": {
        file: "quizzes/quiz-questions2.json",
        year: 2025
    },

    "De slimste mens van Eeregem": {
        file: "quizzes/quiz-questions3.json",
        year: 2025
    },

    "Raak Quiz": {
        file: "quizzes/quiz-questions4.json",
        year: 2025
    },

    "De Valier": {
        file: "quizzes/quiz-questions5.json",
        year: 2025
    },

    "Levensvreugde Zomert": {
        file: "quizzes/quiz-questions6.json",
        year: 2025
    },

    "Ne Vriejen Auvend": {
        file: "quizzes/quiz-questions7.json",
        year: 2025
    },

    "De Lodderoeigen": {
        file: "quizzes/quiz-questions8.json",
        year: 2025
    },

    "Trebor Seam": {
        file: "quizzes/quiz-questions9.json",
        year: 2025
    },

    "Natuurpunt": {
        file: "quizzes/quiz-questions10.json",
        year: 2025
    },

    "TRIVIMI": {
        file: "quizzes/quiz-questions11.json",
        year: 2026
    },

    "Quiz N-VA": {
        file: "quizzes/quiz-questions12.json",
        year: 2026
    },

    "Daatmet": {
        file: "quizzes/quiz-questions13.json",
        year: 2026
    },

    "BCAT": {
        file: "quizzes/quiz-questions14.json",
        year: 2026
    },

    "FC Dender": {
        file: "quizzes/quiz-questions15.json",
        year: 2026
    },

    "BBC Vesting": {
        file: "quizzes/quiz-questions16.json",
        year: 2026
    },

    "Greut & Groesj": {
        file: "quizzes/quiz-questions17.json",
        year: 2026
    },

    "De slimste mens van Eeregem": {
        file: "quizzes/quiz-questions18.json",
        year: 2026
    },

    "After Work Ninof": {
        file: "quizzes/quiz-questions19.json",
        year: 2026
    }
};

// ========================================
// VARIABELEN
// ========================================

let questions = [];
let allQuestions = [];
let current = 0;
let score = 0;
let selectedQuiz = null;
let selectedTheme = null;

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
const themeButtons = document.getElementById("theme-buttons");
const quizGroups = document.getElementById("quiz-groups");

const returnBtn = document.getElementById("returnBtn");
const backBtn = document.getElementById("back-btn");

// ========================================
// THEMA-ICOONTJES
// ========================================

function getThemeIcon(theme) {
    const name = theme.toLowerCase();

    if (name.includes("natuur")) return "🌿";
    if (name.includes("dier")) return "🐾";
    if (name.includes("geschiedenis")) return "🏛️";
    if (name.includes("sport")) return "🏆";
    if (name.includes("muziek")) return "🎵";
    if (name.includes("film")) return "🎬";
    if (name.includes("wetenschap")) return "🔬";
    if (name.includes("geografie")) return "🌍";
    if (name.includes("it & games")) return "💻";
    if (name.includes("cultuur")) return "🎭";
    if (name.includes("gastronomie")) return "🍔";
    if (name.includes("kunst")) return "🎨";
    if (name.includes("politiek")) return "🏛️";
    if (name.includes("auto")) return "🚗";
    if (name.includes("taal")) return "📚";
    if (name.includes("ruimte")) return "🚀";
    if (name.includes("algemeen")) return "🧠";

    return "📖";
}

// ========================================
// QUIZZEN VERDELEN PER JAAR
// ========================================

function renderQuizGroups() {
    quizGroups.innerHTML = "";

    const groups = {};

    Object.keys(QUIZZES).forEach(name => {

        // Alle Quizzen niet tonen
        if (name === "Alle Quizzen") return;

        const year = QUIZZES[name].year || "Overige quizzen";

        if (!groups[year]) {
            groups[year] = [];
        }

        groups[year].push(name);
    });

    // Oud naar nieuw sorteren
    const years = Object.keys(groups).sort((a, b) => {
        if (a === "Overige quizzen") return 1;
        if (b === "Overige quizzen") return -1;

        return Number(a) - Number(b);
    });

    years.forEach(year => {

        const section = document.createElement("details");
        section.className = "year-section";

        // Alle jaartabbladen starten gesloten
        section.open = false;

        const title = document.createElement("summary");

        title.textContent = year === "Overige quizzen"
            ? "📁 Overige quizzen"
            : `📅 Quizzen ${year}`;

        section.appendChild(title);

        const buttons = document.createElement("div");
        buttons.className = "year-quiz-buttons";

        groups[year].forEach(name => {

            const button = document.createElement("button");

            button.textContent = name.toUpperCase();
            button.onclick = () => startQuiz(name);

            buttons.appendChild(button);
        });

        section.appendChild(buttons);
        quizGroups.appendChild(section);
    });
}

// ========================================
// MENU TONEN
// ========================================

function showMenu() {
    menu.classList.remove("hidden");
    quizDiv.classList.add("hidden");
    resultDiv.classList.add("hidden");
}

// ========================================
// QUIZ LADEN
// ========================================

async function startQuiz(name) {
    try {
        selectedQuiz = name;
        selectedTheme = null;

        const response = await fetch(QUIZZES[name].file);

        if (!response.ok) {
            throw new Error("Quiz kon niet geladen worden.");
        }

        const data = await response.json();

        allQuestions = data.questions || data;

        if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
            throw new Error("Deze quiz bevat geen vragen.");
        }

        questions = shuffle(allQuestions).map(q => ({
            ...q,
            answers: q.answers ? shuffle([...q.answers]) : []
        }));

        current = 0;
        score = 0;

        menu.classList.add("hidden");
        resultDiv.classList.add("hidden");
        quizDiv.classList.remove("hidden");

        renderThemes(allQuestions);
        showQuestion();

    } catch (error) {
        alert("Fout bij laden: " + error.message);
    }
}

// ========================================
// THEMA'S TONEN
// ========================================

function renderThemes(qs) {
    if (!themeButtons) return;

    themeButtons.innerHTML = "";

    const themes = [
        ...new Set(qs.map(q => q.Thema).filter(Boolean))
    ].sort();

    themes.forEach(theme => {

        const button = document.createElement("button");
        button.className = "theme-button";

        const icon = document.createElement("span");
        icon.className = "theme-icon";
        icon.textContent = getThemeIcon(theme);
        icon.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.textContent = theme;

        button.append(icon, label);

        button.onclick = () => startTheme(theme);

        themeButtons.appendChild(button);
    });
}

// ========================================
// THEMA STARTEN
// ========================================

function startTheme(theme) {
    selectedTheme = theme;

    questions = shuffle(
        allQuestions.filter(q => q.Thema === theme)
    ).map(q => ({
        ...q,
        answers: q.answers ? shuffle([...q.answers]) : []
    }));

    if (questions.length === 0) {
        alert("Geen vragen gevonden voor dit thema.");
        return;
    }

    current = 0;
    score = 0;

    menu.classList.add("hidden");
    quizDiv.classList.remove("hidden");
    resultDiv.classList.add("hidden");

    showQuestion();
}

// ========================================
// VRAAG TONEN
// ========================================

function showQuestion() {
    const q = questions[current];

    feedback.textContent = "";
    answersDiv.innerHTML = "";

    nextBtn.classList.add("hidden");
    openInput.classList.add("hidden");
    submitOpen.classList.add("hidden");

    openInput.classList.remove("correct", "incorrect");

    questionText.textContent = q.question;

    progress.textContent =
        `Vraag ${current + 1} van ${questions.length}`;

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
        q.answers.forEach(answer => {

            const button = document.createElement("button");

            button.className = "answer-btn";
            button.textContent = answer;

            button.onclick = () => handleAnswer(q, answer, button);

            answersDiv.appendChild(button);
        });
    }
}

// ========================================
// ANTWOORD CONTROLEREN
// ========================================

function handleAnswer(q, answer, button) {
    const buttons = answersDiv.querySelectorAll("button");

    buttons.forEach(btn => btn.disabled = true);

    const correct = answer === q.correct;

    if (correct) {
        score++;
        button.classList.add("correct");
        feedback.textContent = "✅ Correct!";
    } else {
        button.classList.add("incorrect");

        buttons.forEach(btn => {
            if (btn.textContent === q.correct) {
                btn.classList.add("correct");
            }
        });

        feedback.textContent =
            "❌ Fout! Het juiste antwoord is: " + q.correct;
    }

    nextBtn.classList.remove("hidden");
}

// ========================================
// OPEN VRAGEN
// ========================================

function handleOpenSubmit(q) {
    const correctAnswers = Array.isArray(q.correct)
        ? q.correct.map(a => String(a).toLowerCase().trim())
        : [String(q.correct).toLowerCase().trim()];

    const userAnswer = openInput.value.toLowerCase().trim();

    const correct = correctAnswers.includes(userAnswer);

    if (correct) {
        score++;
        feedback.textContent = "✅ Correct!";
        openInput.classList.add("correct");
    } else {
        feedback.textContent =
            "❌ Fout! Correct antwoord: " +
            (Array.isArray(q.correct) ? q.correct.join(", ") : q.correct);

        openInput.classList.add("incorrect");
    }

    submitOpen.classList.add("hidden");
    nextBtn.classList.remove("hidden");
}

// ========================================
// VOLGENDE VRAAG
// ========================================

function nextQuestion() {
    if (current + 1 < questions.length) {
        current++;
        showQuestion();
    } else {
        endQuiz();
    }
}

// ========================================
// QUIZ BEËINDIGEN
// ========================================

function endQuiz() {
    quizDiv.classList.add("hidden");
    resultDiv.classList.remove("hidden");

    finalScore.textContent =
        `Score: ${score} / ${questions.length}`;
}

// ========================================
// HULPFUNCTIES
// ========================================

function shuffle(array) {
    return array
        .map(value => ({
            sort: Math.random(),
            value
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(item => item.value);
}

// ========================================
// KNOPPEN EN NAVIGATIE
// ========================================

nextBtn.onclick = nextQuestion;

if (backBtn) {
    backBtn.onclick = showMenu;
}

if (returnBtn) {
    returnBtn.onclick = showMenu;
}

// ========================================
// OPSTARTEN
// ========================================

renderQuizGroups();
showMenu();

// Thema's laden vanuit alle vragen
async function loadThemes() {
    try {
        const response = await fetch("quizzes/alles.json");

        if (!response.ok) {
            throw new Error("Thema's konden niet geladen worden.");
        }

        const data = await response.json();

        allQuestions = data.questions || data;

        renderThemes(allQuestions);

    } catch (error) {
        console.error("Fout bij laden van thema's:", error);
    }
}

loadThemes();