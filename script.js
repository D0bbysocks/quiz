const root = document.documentElement;
const light_toggle = document.querySelector('.toggle-knob');

const answerButtons = document.querySelectorAll('.quiz-answer__btn-option');
const quizCategory = document.querySelectorAll('.game-card');
const logo = document.querySelector('.logo');
const logoText = document.querySelector('.logo-text');

const introScreen = document.querySelector('.screen--start');
const quizScreen = document.querySelector('.screen--quiz');
const resultScreen = document.querySelector('.screen--result');

const quizSubmit = document.querySelector('.quiz-answer__btn');

const savedTheme = localStorage.getItem("theme");


let selectedAnswerIndex = null;
let selectCategoryIndex = null;


import data from './starter-code/data.json' with { type: 'json' };

const quizzes = data.quizzes;
let currentQuiz = null;


// Dark Mode
if (savedTheme) {
  root.dataset.theme = savedTheme;
} else {
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = systemPrefersDark ? "dark" : "light";
}

// 2) Toggle-Click
light_toggle.addEventListener('click', () => {
  const currentTheme = root.dataset.theme;
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  root.dataset.theme = newTheme;
  localStorage.setItem("theme", newTheme);
});

function showElement(element) {
  element.classList.remove('is-hidden');
}
function hideElement(element) {
  element.classList.add('is-hidden');
}

// Auswahl Quiz
quizCategory.forEach((button, index) => {
  button.addEventListener('click', () => {
    selectCategoryIndex = index;
    currentQuiz = quizzes[selectCategoryIndex];
    hideElement(introScreen);
    showElement(quizScreen);
    showElement(logo);
    console.log(currentQuiz);

    const { title, icon } = currentQuiz;
    logoText.textContent = title;
    logo.style.backgroundImage = `url(${icon})`;

    
  });
});


// 
// Antwort Quiz

// // Hilfsfunktion: Selected-State bei allen entfernen
function clearSelectedState() {
  answerButtons.forEach(button => {
    button.classList.remove('is-selected');
  });
}

// Klick-Handler für jede Antwort setzen
answerButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    clearSelectedState();
    button.classList.add('is-selected');
    selectedAnswerIndex = index;
    console.log(selectedAnswerIndex);
  });
});

