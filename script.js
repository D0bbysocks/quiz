/* =========================
   1) Import / Data
========================= */
import data from './starter-code/data.json' with { type: 'json' };
const quizzes = data.quizzes;

/* =========================
   2) DOM Elements
========================= */
const root = document.documentElement;

// Theme
const lightToggle = document.querySelector('.toggle-knob');

// Screens
const introScreen  = document.querySelector('.screen--start');
const quizScreen   = document.querySelector('.screen--quiz');
const resultScreen = document.querySelector('.screen--result');

// Header / Logos (kommen mehrfach vor)
const logoEls = document.querySelectorAll('.logo');
const logoTextEls = document.querySelectorAll('.logo-text');

// Quiz UI
const quizCategoryCards = document.querySelectorAll('.game-card');
const questionCounterEl = document.querySelector('#quest-counter');
const questionTitleEl   = document.querySelector('#current-question');
const answerButtons     = document.querySelectorAll('.quiz-answer__btn-option');

const quizSubmitBtn = document.querySelector('.quiz-answer__btn');
const playAgainBtn  = document.querySelector('.play-again');

const progressBarEl  = document.querySelector('.quiz-timer__progressbar');
const errorMessageEl = document.querySelector('.error__noAnswer');
const scoreEl        = document.querySelector('#score');

// Cheat Trigger
const cheatSunBtn = document.querySelector('.icon-sun');

/* =========================
   3) App State
========================= */
const state = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  selectedAnswerIndex: null,
  currentPoints: 0,

  // Cheat
  sunUnlocked: false,
  themeUnlocked: false,
  cheatActive: false,
  cheatRevealVisible: false,
};

/* =========================
   4) Config
========================= */
const CONFIG = {
  revealDelayMs: 2000,
  tripleClickWindowMs: 1000,
  correctIconUrl: './assets/images/icon-correct.svg',
  wrongIconUrl: './assets/images/icon-incorrect.svg',
};

/* =========================
   5) Helpers
========================= */
function showElement(el) {
  el.classList.remove('is-hidden');
}

function hideElement(el) {
  el.classList.add('is-hidden');
}

function resetAnswerButtons() {
  answerButtons.forEach(btn => {
    btn.classList.remove('is-selected', 'is-correct', 'is-wrong');

    const icon = btn.querySelector('.quiz-answer__option-icon');
    if (icon) {
      icon.classList.add('is-hidden');
      icon.style.backgroundImage = '';
    }
  });
}

function setIcon(buttonEl, iconUrl) {
  const icon = buttonEl.querySelector('.quiz-answer__option-icon');
  if (!icon) return;
  icon.classList.remove('is-hidden');
  icon.style.backgroundImage = `url(${iconUrl})`;
}

/* =========================
   6) Theme
========================= */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    root.dataset.theme = savedTheme;
  } else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = systemPrefersDark ? 'dark' : 'light';
  }
}

function toggleTheme() {
  const newTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
}

/* =========================
   7) UI Updates
========================= */
function updateQuizHeader(quiz) {
  const { title, icon } = quiz;

  logoTextEls.forEach(el => (el.textContent = title));
  logoEls.forEach(el => {
    el.style.backgroundImage = `url(${icon})`;
    el.classList.remove('is-hidden');
  });
}

function updateQuizPoints() {
  scoreEl.textContent = state.currentPoints;
}

function updateProgressBar() {
  const total = state.currentQuiz.questions.length;
  const progress = (state.currentQuestionIndex / total) * 100;
  progressBarEl.style.width = `${progress}%`;
}

/* =========================
   8) Quiz Logic
========================= */
function getCurrentQuestion() {
  return state.currentQuiz.questions[state.currentQuestionIndex];
}

function getCorrectAnswerIndex(questionObj) {
  return questionObj.options.indexOf(questionObj.answer);
}

function renderQuestion() {
  const questions = state.currentQuiz.questions;
  const questionObj = questions[state.currentQuestionIndex];

  questionCounterEl.textContent =
    `Question ${state.currentQuestionIndex + 1} of ${questions.length}`;
  questionTitleEl.textContent = questionObj.question;

  questionObj.options.forEach((optionText, index) => {
    const button = answerButtons[index];
    const label  = button.querySelector('.quiz-answer__option-label');
    const text   = button.querySelector('.quiz-answer__option-text');

    label.textContent = String.fromCharCode(65 + index);
    text.textContent  = optionText;
  });

  resetAnswerButtons();
  state.selectedAnswerIndex = null;
  state.cheatRevealVisible = false;
  errorMessageEl.classList.add('is-hidden');

  updateProgressBar();

  // Cheat zeigt Antwort direkt wieder an (falls aktiv)
  if (state.cheatActive) {
    showCorrectAnswer(getCurrentQuestion());
  }
}

function answerCheck() {
  const questionObj = getCurrentQuestion();

  if (state.selectedAnswerIndex === null) {
    errorMessageEl.classList.remove('is-hidden');
    return null;
  }

  const selectedText =
    questionObj.options[state.selectedAnswerIndex];

  const isCorrect = selectedText === questionObj.answer;

  if (isCorrect) {
    state.currentPoints++;
  }

  errorMessageEl.classList.add('is-hidden');
  return isCorrect;
}

/* =========================
   9) Cheat Logic
========================= */
function showCorrectAnswer(questionObj) {
  const correctIndex = getCorrectAnswerIndex(questionObj);
  const correctBtn = answerButtons[correctIndex];

  correctBtn.classList.add('is-correct');
  setIcon(correctBtn, CONFIG.correctIconUrl);

  state.cheatRevealVisible = true;
}

function clearCheatHighlight() {
  answerButtons.forEach(btn => {
    btn.classList.remove('is-correct');

    const icon = btn.querySelector('.quiz-answer__option-icon');
    if (icon) {
      icon.classList.add('is-hidden');
      icon.style.backgroundImage = '';
    }
  });

  state.cheatRevealVisible = false;
}

// Cheat Unlocks
let sunClickCount = 0;
let sunClickTimer = null;

function handleSunCheatClick() {
  sunClickCount++;

  if (sunClickCount === 1) {
    sunClickTimer = setTimeout(() => {
      sunClickCount = 0;
    }, CONFIG.tripleClickWindowMs);
  }

  if (sunClickCount === 3) {
    clearTimeout(sunClickTimer);
    sunClickCount = 0;
    state.sunUnlocked = true;
    tryActivateCheat();
  }
}

let themeClickCount = 0;
let themeClickTimer = null;

function handleThemeCheatStep() {
  if (!state.sunUnlocked) return;

  themeClickCount++;

  if (themeClickCount === 1) {
    themeClickTimer = setTimeout(() => {
      themeClickCount = 0;
    }, CONFIG.tripleClickWindowMs);
  }

  if (themeClickCount === 2) {
    clearTimeout(themeClickTimer);
    themeClickCount = 0;
    state.themeUnlocked = true;
    tryActivateCheat();
  }
}

function tryActivateCheat() {
  if (state.sunUnlocked && state.themeUnlocked && !state.cheatActive) {
    state.cheatActive = true;
    showCorrectAnswer(getCurrentQuestion());
  }
}

/* =========================
   10) Events
========================= */
function handleAnswerClick(index) {
  // Cheat-Grün ausblenden, sobald User auswählt
  if (state.cheatActive && state.cheatRevealVisible) {
    clearCheatHighlight();
  }

  answerButtons.forEach(btn => btn.classList.remove('is-selected'));
  answerButtons[index].classList.add('is-selected');
  state.selectedAnswerIndex = index;
}

function bindEvents() {
  lightToggle.addEventListener('click', () => {
    toggleTheme();
    handleThemeCheatStep();
  });

  quizCategoryCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      state.currentQuiz = quizzes[index];
      state.currentQuestionIndex = 0;
      state.currentPoints = 0;

      hideElement(introScreen);
      showElement(quizScreen);
      updateQuizHeader(state.currentQuiz);
      renderQuestion();
      quizSubmitBtn.disabled = false;
    });
  });

  answerButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => handleAnswerClick(index));
  });

  quizSubmitBtn.addEventListener('click', () => {
    quizSubmitBtn.disabled = true;

    const isCorrect = answerCheck();
    if (isCorrect === null) {
      quizSubmitBtn.disabled = false;
      return;
    }

    const questionObj = getCurrentQuestion();
    const correctIndex = getCorrectAnswerIndex(questionObj);

    resetAnswerButtons();

    const correctBtn = answerButtons[correctIndex];
    correctBtn.classList.add('is-correct');
    setIcon(correctBtn, CONFIG.correctIconUrl);

    if (!isCorrect) {
      const wrongBtn = answerButtons[state.selectedAnswerIndex];
      wrongBtn.classList.add('is-wrong');
      setIcon(wrongBtn, CONFIG.wrongIconUrl);
    }

    const isLastQuestion =
      state.currentQuestionIndex ===
      state.currentQuiz.questions.length - 1;

    if (isLastQuestion) {
      setTimeout(() => {
        updateQuizPoints();
        showElement(resultScreen);
        hideElement(quizScreen);
      }, CONFIG.revealDelayMs);
    } else {
      setTimeout(() => {
        state.currentQuestionIndex++;
        renderQuestion();
        quizSubmitBtn.disabled = false;
      }, CONFIG.revealDelayMs);
    }
  });

  playAgainBtn.addEventListener('click', () => {
    showElement(introScreen);
    hideElement(resultScreen);

    state.currentQuiz = null;
    state.currentQuestionIndex = 0;
    state.selectedAnswerIndex = null;
    state.currentPoints = 0;

    resetAnswerButtons();
    progressBarEl.style.width = '0%';
    quizSubmitBtn.disabled = false;
  });

  cheatSunBtn.addEventListener('click', handleSunCheatClick);
}

/* =========================
   11) Init
========================= */
initTheme();
bindEvents();
