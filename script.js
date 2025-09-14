// World Capitals Quiz - script.js (cleaned)

/* ===== Settings ===== */
const SHUFFLE_QUESTIONS = true;
const CHOICES_PER_QUESTION = 4;

/* ===== Data ===== */
const COUNTRIES = [
  { country: "United Kingdom", capital: "London" },
  { country: "France", capital: "Paris" },
  { country: "Germany", capital: "Berlin" },
  { country: "Italy", capital: "Rome" },
  { country: "Spain", capital: "Madrid" },
  { country: "Portugal", capital: "Lisbon" },
  { country: "Netherlands", capital: "Amsterdam" },
  { country: "United States", capital: "Washington, D.C." },
  { country: "Canada", capital: "Ottawa" },
  { country: "Mexico", capital: "Mexico City" },
  { country: "Brazil", capital: "Brasília" },
  { country: "Argentina", capital: "Buenos Aires" },
  { country: "China", capital: "Beijing" },
  { country: "Japan", capital: "Tokyo" },
  { country: "India", capital: "New Delhi" },
  { country: "Russia", capital: "Moscow" },
  { country: "Australia", capital: "Canberra" },
];

/* ===== Helpers ===== */
const $ = (sel) => document.querySelector(sel);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}
function buildQuestionPool(length) {
  const base = SHUFFLE_QUESTIONS ? shuffle(COUNTRIES) : COUNTRIES.slice();
  const n = length === "all" ? COUNTRIES.length : Number(length);
  const pool = base.slice(0, Math.min(n, base.length));
  return pool.map((item) => {
    const otherCaps = COUNTRIES.filter((x) => x.capital !== item.capital).map(
      (x) => x.capital
    );
    const distractors = sample(otherCaps, CHOICES_PER_QUESTION - 1);
    const choices = shuffle([item.capital, ...distractors]);
    return {
      prompt: `What is the capital of ${item.country}?`,
      choices,
      correctIndex: choices.indexOf(item.capital),
    };
  });
}

/* ===== App State ===== */
let questions = [];
let index = 0;
let answers = [];

/* ===== App ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Pages
  const intro = $("#intro");
  const quizPage = $("#quizPage");
  const resultsPage = $("#resultsPage");

  // Controls
  const startBtn = $("#startQuiz");
  const resetBtn = $("#reset");
  const lengthSel = $("#length");
  const prevBtn = $("#prev");
  const nextBtn = $("#next");
  const submitBtn = $("#submit");
  const retryBtn = $("#retry");
  const backIntroBtn = $("#backIntro");

  // UI elements
  const progressEl = $("#progress");
  const questionEl = $("#question");
  const answersForm = $("#answers");
  const scoreEl = $("#score");
  const reviewEl = $("#review");

  function setNavState() {
    const onFirst = index === 0;
    const onLast = index === questions.length - 1;
    const answered = answers[index] != null;

    prevBtn.disabled = onFirst;
    nextBtn.disabled = onLast || !answered;
    submitBtn.disabled = !onLast || !answered;

    // lock the question count AFTER leaving the first question
    lengthSel.disabled = !onFirst;
  }

  function updateUI() {
    if (!Array.isArray(questions) || questions.length === 0) return;

    const q = questions[index];
    progressEl.textContent = `Question ${index + 1} of ${questions.length}`;
    questionEl.textContent = q.prompt;

    // Rebuild answers list
    answersForm.innerHTML = "";
    q.choices.forEach((choice, i) => {
      const id = `q${index}_choice${i}`;

      const label = document.createElement("label");
      label.className = "answer";
      label.setAttribute("for", id);

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.id = id;
      input.value = String(i);
      input.checked = answers[index] === i;
      input.addEventListener("change", () => {
        answers[index] = i;
        setNavState();
      });

      const span = document.createElement("span");
      span.textContent = choice;

      label.appendChild(input);
      label.appendChild(span);
      answersForm.appendChild(label);
    });

    setNavState();
  }

  // Populate initial pool on length change (only before Q1 is answered)
  lengthSel.addEventListener("change", () => {
    if (index === 0) {
      const len = lengthSel.value;
      questions = buildQuestionPool(len);
      answers = Array(questions.length).fill(null);
      setNavState();
      updateUI();
    }
  });

  // Intro -> Quiz
  startBtn.addEventListener("click", () => {
    const len = lengthSel.value || "5";
    questions = buildQuestionPool(len);
    index = 0;
    answers = Array(questions.length).fill(null);

    // Show quiz
    resultsPage.classList.add("hidden");
    intro.classList.add("hidden");
    quizPage.classList.remove("hidden");

    // Jump back to the top so it doesn't just scroll down
    window.scrollTo({ top: 0, behavior: "instant" });

    // Button states
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    submitBtn.disabled = true;
    resetBtn.disabled = false;

    updateUI();
  });

  // Reset the round (stay on quiz)
  resetBtn.addEventListener("click", () => {
    index = 0;
    answers = Array(questions.length).fill(null);

    prevBtn.disabled = true;
    nextBtn.disabled = true;
    submitBtn.disabled = true;

    questionEl.textContent = "";
    answersForm.innerHTML = "";
    progressEl.textContent = "Ready when you are.";
    resultsPage.classList.add("hidden");
  });

  // Navigation
  prevBtn.addEventListener("click", () => {
    if (index > 0) {
      index--;
      updateUI();
    }
  });
  nextBtn.addEventListener("click", () => {
    if (index < questions.length - 1) {
      index++;
      updateUI();
    }
  });

  // Submit -> Results
  submitBtn.addEventListener("click", () => {
    if (!Array.isArray(questions) || questions.length === 0) return;

    // Show results page first to avoid any blank flash
    quizPage.classList.add("hidden");
    resultsPage.classList.remove("hidden");

    // Score
    let correct = 0;
    answers.forEach((a, i) => {
      const q = questions[i];
      if (!q || typeof q.correctIndex !== "number") return;
      if (a === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    scoreEl.textContent = `You scored ${correct} out of ${questions.length} (${pct}%)`;

    // Review
    reviewEl.innerHTML = "";
    questions.forEach((q, i) => {
      if (!q || !Array.isArray(q.choices)) return;

      const row = document.createElement("div");
      const isCorrect = answers[i] === q.correctIndex;
      row.className = `row ${isCorrect ? "correct" : "incorrect"}`;

      const userAnswer =
        answers[i] != null && q.choices[answers[i]] != null
          ? q.choices[answers[i]]
          : "No answer";

      row.innerHTML = `
        <strong>Q${i + 1}:</strong> ${q.prompt}<br/>
        <em>Your answer:</em> ${userAnswer}<br/>
        <em>Correct answer:</em> ${q.choices[q.correctIndex]}
      `;

      reviewEl.appendChild(row);
    });

    resultsPage.scrollIntoView({ behavior: "smooth", block: "start" });
    submitBtn.disabled = true; // lock until retry/back
  });

  // Retry -> new round on Quiz
  retryBtn.addEventListener("click", () => {
    const len = lengthSel.value || "5";
    questions = buildQuestionPool(len);
    index = 0;
    answers = Array(questions.length).fill(null);

    resultsPage.classList.add("hidden");
    quizPage.classList.remove("hidden");

    startBtn.disabled = false;
    resetBtn.disabled = false;
    submitBtn.disabled = true;

    progressEl.textContent = "Question 1 of " + questions.length;
    updateUI();
  });

  // Back to Intro
  backIntroBtn.addEventListener("click", () => {
    resultsPage.classList.add("hidden");
    quizPage.classList.add("hidden");
    intro.classList.remove("hidden");

    startBtn.disabled = false;
    resetBtn.disabled = true;
    submitBtn.disabled = true;

    questionEl.textContent = "";
    answersForm.innerHTML = "";
    progressEl.textContent = "Ready when you are.";
  });
});
