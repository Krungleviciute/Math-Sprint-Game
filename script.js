// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionsAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let fianlTimeDisplay = '0.0';

// Scroll
let valueY = 0;

// Refresh Splash page best scores
const bestScoresToDOM = () => {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  })
}

// Check Local storage for best scores, set BestScoreArray
const getSavedBestScores = () => {
  if(localStorage.getItem('bestScores')){
    bestScoreArray = JSON.parse(localStorage.getItem('bestScores'));
  } else {
    bestScoreArray = [
      {
        questions: 10, 
        bestScore: fianlTimeDisplay
      },
      {
        questions: 25, 
        bestScore: fianlTimeDisplay
      },
      {
        questions: 50, 
        bestScore: fianlTimeDisplay
      },
      {
        questions: 99, 
        bestScore: fianlTimeDisplay
      },
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

// To update BestScoreArray
const updateBestScore = () => {
  bestScoreArray.forEach((score, index) => {
    if(questionsAmount == score.questions){
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      if(savedBestScore == 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = fianlTimeDisplay;
      }
    }
  });
  bestScoresToDOM();
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

const playAgain = () => {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

const showScorePage = () => {
  setTimeout(() => {
    playAgainBtn.hidden = false
  }, 1500)
  gamePage.hidden = true;
  scorePage.hidden = false;
}

// Format and display time in DOM
const scoresToDOM = () => {
  fianlTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${fianlTimeDisplay}s`;
  updateBestScore();
  // Scroll to Top, go To ScorePage
  itemContainer.scrollTo({
    top: 0, behavior: 'instant'
  })
  showScorePage();
}

// Stop timer, process results, go to score page
const checkTime = () => {
  if(playerGuessArray.length == questionsAmount){
    clearInterval(timer);
    // Check for wrong guesses and add penalty time
    equationsArray.forEach((equation, index) => {
      !(equation.evaluated === playerGuessArray[index]) && (penaltyTime += 0.5);
    });
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
}

// Add a tenth of a second to timePlayed
const addTime = () => {
  timePlayed += 0.1;
  checkTime();
}

// Start time when game page is clicked
const startTimer = () => {
  // Reset times;
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;

  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

// SCroll, Store user selection in PlayerGuessArray
const select = (guessedTrue) => {
  // SCroll 80 pixels at a time
  valueY +=80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
}

// Display Game page
const showGamePage = () => {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// Get Random Number up to a max number
const getRandomNumber = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomNumber(questionsAmount);
  // Set amount of wrong equations
  const wrongEquations = questionsAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomNumber(9);
    secondNumber = getRandomNumber(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomNumber(9);
    secondNumber = getRandomNumber(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomNumber(3)
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

const equationsToDOM = () => {
  equationsArray.forEach((equation) => {
    const item = document.createElement('div');
    item.classList.add('item');

    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;

    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

const startCountdown = () => {
  let count = 3;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if( count === 0){
      countdown.textContent = "GO!"
    } else if(count === -1){
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = count
    }
  }, 1000);
}

const showCountdown = () => {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  populateGamePage();
  startCountdown();
}

const getRadioValue = () => {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if(radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

const selectQuestionsAmount = (e) => {
  e.preventDefault();
  questionsAmount = getRadioValue();
  questionsAmount && showCountdown();
}

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remoce selected Label Styling
    radioEl.classList.remove('selected-label');
    if(radioEl.children[1].checked){
      radioEl.classList.add('selected-label')
    }
  })
});

startForm.addEventListener('submit', selectQuestionsAmount);
gamePage.addEventListener('click', startTimer);

// On Load
getSavedBestScores();