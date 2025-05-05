// Global Variables
let currentLevel = 1;
let points = 100;
const levelPasswords = {};
let hintsUsed = 0;
let startTime;
let timerInterval;
let otpCode; // For Level 3 OTP
let isAdmin = false;
let currentDifficulty = 'medium'; // Default difficulty
let wordPasswords = [
    'apple123', 'banana456', 'orange789', 'grape012', 'melon345',
    'peach678', 'berry901', 'kiwi234', 'mango567', 'plum890'
];

// Difficulty Settings
const difficultySettings = {
    easy: {
        maxLevel: 3,
        passwordLength: 6,
        timeLimit: 90,
        pointsMultiplier: 1.2,
        hintsEnabled: true,
        shuffleEnabled: true
    },
    medium: {
        maxLevel: 5,
        passwordLength: 8,
        timeLimit: 60,
        pointsMultiplier: 1.0,
        hintsEnabled: true,
        shuffleEnabled: true,
        wordBankEnabled: true
    },
    hard: {
        maxLevel: 6,
        passwordLength: 10,
        timeLimit: 45,
        pointsMultiplier: 0.8,
        hintsEnabled: false,
        shuffleEnabled: false,
        cipherEnabled: true
    }
};

// Arrays for each level's password security
const veryWeakPasswords = [
    'password', '123456', 'qwerty', 'letmein', 'abc123', 
    '111111', 'iloveyou', 'admin', 'welcome', 'monkey'
];

const weakPasswords = [
    'summer2024', 'password1', 'letmein!', 'football99', 'sunshine7', 
    'dragon12', 'baseball8', 'hello2023', 'winter21', 'flower3'
];

const mediumPasswords = [
    'cat45dog', 'bird98fish', 'lion32tiger', 'wolf76bear', 'duck15swan',
    'frog23toad', 'deer41moose', 'seal89whale', 'hawk52eagle', 'owl37crow'
];

const patternPasswords = [
    'abc123xyz789', 'def456uvw321', 'ghi789rst456', 'jkl321opq654',
    'mno654lmn987', 'pqr987ijk123', 'stu147def369', 'vwx258abc147'
];

const hardPasswords = [
    '2x4=8plus5', '7-3=4plus2', '9x2=18div3', '5+7=12min4',
    '8/2=4plus9', '6x3=18div2', '4+5=9plus7', '3x6=18min5'
];

const cipherPasswords = [
    'HELLO->IFMMP', 'WORLD->XPSME', 'CIPHER->DJQIFS',
    'PUZZLE->QVAAME', 'DECODE->EFDPEF', 'SOLVE->TPMWF'
];

// Cipher key for hard mode
const cipherKey = {
    'A': 'X', 'B': 'Y', 'C': 'Z', 'D': 'A', 'E': 'B', 'F': 'C',
    'G': 'D', 'H': 'I', 'I': 'J', 'J': 'K', 'K': 'L', 'L': 'M',
    'M': 'N', 'N': 'O', 'O': 'P', 'P': 'Q', 'Q': 'R', 'R': 'S',
    'S': 'T', 'T': 'U', 'U': 'V', 'V': 'W', 'W': 'X', 'X': 'Y',
    'Y': 'Z', 'Z': 'A'
};

// wordPasswords is now only used for easy mode or hints

// Level introductions and explanations
const levelIntros = {
    1: {
        title: "Level 1: Simple Reversal",
        intro: "In this level, you'll encounter a basic password pattern. Hackers often look for simple transformations. TIP: Try reading the password backwards!",
        explanation: "This password was weak because it was just reversed text. Simple transformations like reversal are one of the first things attackers try."
    },
    2: {
        title: "Level 2: Number Substitution",
        intro: "Common password patterns include replacing letters with similar-looking numbers. For example: 'a' → '4', 'e' → '3', 'i' → '1', etc.",
        explanation: "Using number substitutions (leetspeak) is a common but weak practice. These patterns are well-known and easily guessed."
    },
    3: {
        title: "Level 3: Keyboard Pattern",
        intro: "Many users create passwords using keyboard patterns. Look for sequences on your keyboard - they might be horizontal, vertical, or diagonal!",
        explanation: "Keyboard pattern passwords are vulnerable because they're predictable and commonly used. Tools can easily detect these patterns."
    },
    4: {
        title: "Level 4: Word Combination",
        intro: "This level features combined words with numbers between them. Use the word bank to identify possible word combinations!",
        explanation: "While combining words adds complexity, using common words with simple number insertions is still predictable."
    },
    5: {
        title: "Level 5: Repeating Patterns",
        intro: "Look for repeating sequences in this level. The password follows a pattern that repeats with slight variations.",
        explanation: "Repeating patterns might look complex, but once the pattern is identified, the password becomes predictable."
    },
    6: {
        title: "Level 6: Cipher Challenge",
        intro: "This level uses a shift cipher. Each letter is shifted by a certain amount. Collect cipher keys to reveal the pattern!",
        explanation: "Simple substitution ciphers can be broken through frequency analysis and pattern recognition."
    },
    7: {
        title: "Level 7: Phishing Simulation",
        intro: "This level tests your ability to spot phishing attempts. Read the email carefully and decide if it's a phishing attempt.",
        explanation: "Phishing attacks trick users into revealing sensitive information. Always check sender addresses and links carefully."
    },
    8: {
        title: "Password Manager Promotion",
        intro: "Congratulations! You've completed all levels. Learn why password managers are important.",
        explanation: "Password managers help you generate and store strong, unique passwords for every site."
    }
};



// --- Analytics Tracking Helpers ---
function startLevelAnalytics(level) {
  const now = Date.now();
  if (!analytics.startTime) analytics.startTime = now;
  let entry = analytics.attempts.find(a => a.level === level);
  if (!entry) {
    entry = { level, tries: 0, hintsUsed: 0, timeSpent: 0, incorrectGuesses: [], levelStart: now };
    analytics.attempts.push(entry);
  } else {
    entry.levelStart = now;
  }
  showAnalyticsReport();
  saveAnalytics();
}

function recordAttempt(level, guess, correct) {
  let entry = analytics.attempts.find(a => a.level === level);
  if (!entry) return;
  entry.tries++;
  if (!correct && guess) entry.incorrectGuesses.push(guess);
  showAnalyticsReport();
  saveAnalytics();
}

function recordHint(level) {
  let entry = analytics.attempts.find(a => a.level === level);
  if (!entry) return;
  entry.hintsUsed++;
  showAnalyticsReport();
  saveAnalytics();
}

function endLevelAnalytics(level) {
  let entry = analytics.attempts.find(a => a.level === level);
  if (!entry || !entry.levelStart) return;
  const now = Date.now();
  entry.timeSpent += Math.round((now - entry.levelStart) / 1000);
  delete entry.levelStart;
  showAnalyticsReport();
  saveAnalytics();
}

function markGameCompletion(status) {
  analytics.completed = status === 'completed';
  analytics.gaveUp = status === 'gaveUp';
  analytics.endTime = Date.now();
  analytics.totalTime = Math.round((analytics.endTime - analytics.startTime) / 1000);
  showAnalyticsReport();
  saveAnalytics();
}
// --- End Analytics Helpers ---

// --- Analytics Persistence ---
function getDefaultAnalytics(player) {
  return {
    player: player || getCurrentUserId(),
    attempts: [],
    gaveUp: false,
    completed: false,
    totalTime: 0,
    startTime: null,
    endTime: null
  };
}
let analytics = getDefaultAnalytics();

function getCurrentUserId() {
  return window.currentUserId ? window.currentUserId : (window.guestId || "Guest");
}

function saveAnalytics() {
  try {
    localStorage.setItem('grimlock_analytics', JSON.stringify(analytics));
  } catch (e) { /* ignore */ }
}
function loadAnalytics() {
  try {
    const data = localStorage.getItem('grimlock_analytics');
    if (data) {
      analytics = JSON.parse(data);
    } else {
      analytics = getDefaultAnalytics();
    }
    showAnalyticsReport();
  } catch (e) { /* ignore */ }
}
// --- End Analytics Persistence ---

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Hide difficulty selection
    const difficultySelection = document.getElementById('difficulty-selection');
    const adminDifficultySelection = document.getElementById('admin-difficulty-selection');
    if (difficultySelection) difficultySelection.style.display = 'none';
    if (adminDifficultySelection) adminDifficultySelection.style.display = 'none';
    
    // Show game container for admin mode
    if (isAdmin) {
        document.getElementById('game-container').style.display = 'block';
    }
    
    // Hide all intro/level sections
    document.getElementById('tutorial-section').style.display = 'none';
    document.getElementById('medium-intro-section') && (document.getElementById('medium-intro-section').style.display = 'none');
    document.getElementById('hard-intro-section') && (document.getElementById('hard-intro-section').style.display = 'none');
    document.getElementById('level-info').style.display = 'none';
    document.getElementById('combined-words-section').style.display = 'none';
    document.getElementById('cipher-section').style.display = 'none';
    
    // Hide or show all hint buttons based on difficulty
    const hintButtons = document.querySelectorAll('[id^="clear-hint-btn-"]');
    hintButtons.forEach(btn => {
        btn.style.display = difficultySettings[difficulty].hintsEnabled ? 'inline-block' : 'none';
    });
    
    // Show the appropriate intro or tutorial
    if (difficulty === 'medium') {
        currentLevel = 4; // Start at first medium level
        document.getElementById('medium-intro-section').style.display = 'block';
    } else if (difficulty === 'hard') {
        currentLevel = 6; // Start at cipher level for hard
        document.getElementById('hard-intro-section').style.display = 'block';
    } else {
        // For easy mode, show tutorial
        document.getElementById('tutorial-section').style.display = 'block';
    }
    
    // Hide other sections
    document.getElementById('password-section').style.display = 'none';
    document.getElementById('scrambled-password-section').style.display = 'none';
    document.getElementById('strong-password-section').style.display = 'none';
    document.getElementById('pattern-section').style.display = 'none';
    
    // Clear any existing input
    document.getElementById('tutorial-input').value = '';
    document.getElementById('tutorial-message').innerText = '';
    document.getElementById('tutorial-workings').value = '';
    
    // Show the give up button
    const giveUpContainer = document.getElementById('give-up-container');
    if (giveUpContainer) giveUpContainer.style.display = 'block';
    
    // Set difficulty-specific body attribute for styling
    document.body.setAttribute('data-difficulty', difficulty);
}

function startMediumLevel() {
    document.getElementById('medium-intro-section').style.display = 'none';
    document.getElementById('level-info').style.display = 'block';
    document.getElementById('combined-words-section').style.display = 'block';
    proceedToNextChallenge();
}

function startHardLevel() {
    document.getElementById('hard-intro-section').style.display = 'none';
    document.getElementById('level-info').style.display = 'block';
    document.getElementById('cipher-section').style.display = 'block';
    proceedToNextChallenge();
}

async function startGame() {
  // Set analytics player at game start
  analytics = getDefaultAnalytics(getCurrentUserId());
  saveAnalytics();
  console.log('startGame called, currentLevel:', currentLevel);
  if (currentLevel === 1) {
    showLevelIntro(1);
    await generateLevelOnePassword();
    document.getElementById('password-section').style.display = 'block';
    startTimer(difficultySettings[currentDifficulty].timeLimit);
  }
}

async function generateLevelOnePassword() {
  // Ensure the password-section is visible
  document.getElementById('password-section').style.display = 'block';
  // Get a random weak password
  const password = veryWeakPasswords[Math.floor(Math.random() * veryWeakPasswords.length)];
  // Store the original password
  levelPasswords[1] = password;
  // Display the password as is
  document.getElementById("password-display").innerText = password;
  startTime = Date.now();
}

function checkTutorial() {
    const input = document.getElementById("tutorial-input").value.toLowerCase().trim();
    if (input === "apple") {
        document.getElementById("tutorial-message").innerText = "✅ Great job! Now let's start the real challenge...";
        document.getElementById("tutorial-message").className = "message success";
        setTimeout(() => {
            document.getElementById("tutorial-section").style.display = "none";
            document.getElementById("level-info").style.display = "block";
            document.getElementById("password-section").style.display = "block";
            startGame();
        }, 1500);
    } else {
        document.getElementById("tutorial-message").innerText = "❌ Not quite! Remember, 'elppa' unscrambles to 'apple'";
        document.getElementById("tutorial-message").className = "message error";
    }
}

// ---------------------------
// SessionStorage High Score Functions
// ---------------------------
// In this solution we use sessionStorage so high scores reset when you refresh.
function addHighScore(score, level, password, userId) {
  // Get current high scores array from sessionStorage or initialize an empty array
  let scores = sessionStorage.getItem('highScores');
  scores = scores ? JSON.parse(scores) : [];
  
  // Create a new record
  const newRecord = { score, level, password, userId, timestamp: Date.now() };
  scores.push(newRecord);
  
  // Sort the scores in descending order by score
  scores.sort((a, b) => b.score - a.score);
  
  // Keep only the top 10 records
  scores = scores.slice(0, 10);
  
  // Save back into sessionStorage
  sessionStorage.setItem('highScores', JSON.stringify(scores));
}

function displayHighScoreDetails() {
  let scores = sessionStorage.getItem('highScores');
  let detailsText = "No high scores available.";
  if (scores) {
    const highScores = JSON.parse(scores);
    detailsText = "<ol>";
    highScores.forEach(record => {
      detailsText += `<li>Score: ${record.score}, Level: ${record.level}, Password: ${record.password}, User: ${record.userId}</li>`;
    });
    detailsText += "</ol>";
  }
  // Display the details in the element with id "highscore-details"
  document.getElementById("highscore-details").innerHTML = detailsText;
}

function toggleHighscore() {
  const hsDiv = document.getElementById("highscore-details");
  if (hsDiv.style.display === "none" || hsDiv.style.display === "") {
    displayHighScoreDetails();
    hsDiv.style.display = "block";
  } else {
    hsDiv.style.display = "none";
  }
}

// ---------------------------
// Admin Functions
// ---------------------------
function adminLogin() {
  const username = document.getElementById("admin-username").value.trim();
  const password = document.getElementById("admin-password").value.trim();
  if (username === "admin" && password === "adminpass") {
    isAdmin = true;
    window.currentUserId = "Admin";
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin-difficulty-selection").style.display = "block";
    // Show admin-only reveal buttons when game starts
    document.querySelectorAll('[id^="reveal-"]').forEach(button => {
      button.style.display = "inline-block";
    });
    // Show analytics dashboard
    const analyticsDash = document.getElementById('admin-analytics-dashboard');
    if (analyticsDash) analyticsDash.style.display = 'block';
    loadAnalytics();
    showAnalyticsReport();
  } else {
    document.getElementById("admin-status").innerText = "Invalid credentials!";
    document.getElementById("admin-status").className = "text-danger";
  }
}

function adminLogout() {
  isAdmin = false;
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("admin-login").style.display = "block";
  // Hide admin-only reveal buttons
  document.getElementById("reveal-l1-btn").style.display = "none";
  document.getElementById("reveal-l2-btn").style.display = "none";
  document.getElementById("reveal-l3-btn").style.display = "none";
  document.getElementById("reveal-l1-btn-level").style.display = "none";
}

function revealLevelOnePassword() {
  if (isAdmin) {
    const message = document.getElementById("message");
    const displayedPassword = document.getElementById("password-display").innerText;
    const solution = displayedPassword.split('').reverse().join('');
    message.innerHTML = `Level 1 Password: ${solution}<br><small>(Reverse of: ${displayedPassword})</small>`;
    message.className = "message success";
  } else {
    const message = document.getElementById("message");
    message.innerText = "You are not authorized to see this password!";
    message.className = "message error";
  }
}

function revealLevelTwoPassword() {
  if (isAdmin) {
    const message = document.getElementById("message");
    const solution = toLeetSpeak(levelPasswords[2]);
    message.innerHTML = `Level 2 Password: ${solution}<br><small>(Leetspeak of: ${levelPasswords[2]})</small>`;
    message.className = "message success";
  } else {
    const message = document.getElementById("message");
    message.innerText = "You are not authorized to see this password!";
    message.className = "message error";
  }
}

function revealLevelThreePassword() {
  if (isAdmin) {
    const message = document.getElementById("message");
    message.innerHTML = `Level 3 Password: ${levelPasswords[3]}<br><small>(Look for keyboard pattern)</small>`;
    message.className = "message success";
  } else {
    const message = document.getElementById("message");
    message.innerText = "You are not authorized to see this password!";
    message.className = "message error";
  }
}

function revealLevelFourPassword() {
  if (isAdmin) {
    const message = document.getElementById("message");
    message.innerHTML = `Level 4 Password: ${levelPasswords[4]}<br><small>(Combined words with numbers)</small>`;
    message.className = "message success";
  } else {
    const message = document.getElementById("message");
    message.innerText = "You are not authorized to see this password!";
    message.className = "message error";
  }
}

function revealLevelFivePassword() {
  if (isAdmin) {
    const message = document.getElementById("message");
    message.innerHTML = `Level 5 Password: ${levelPasswords[5]}<br><small>(Look for repeating pattern)</small>`;
    message.className = "message success";
  } else {
    const message = document.getElementById("message");
    message.innerText = "You are not authorized to see this password!";
    message.className = "message error";
  }
}

function revealLevelSixPassword() {
  if (isAdmin) {
    const message = document.getElementById("message");
    const encryptedPassword = document.getElementById("cipher-password").innerText;
    message.innerHTML = `Level 6 Password: ${levelPasswords[6]}<br><small>(Encrypted from: ${encryptedPassword})</small>`;
    message.className = "message success";
  } else {
    const message = document.getElementById("message");
    message.innerText = "You are not authorized to see this password!";
    message.className = "message error";
  }
}

function revealOTP() {
  if (isAdmin) {
    const message = document.getElementById("message");
    message.innerText = `Level 3 OTP: ${otpCode}`;
    message.className = "message success";
  } else {
    const message = document.getElementById("message");
    message.innerText = "You are not authorized to see this password!";
    message.className = "message error";
  }
}

// ---------------------------
// Game Functions
// ---------------------------
function restartGame() {
  currentLevel = 1;
  points = 100;
  // Hide the high score screen
  const highScore = document.getElementById("high-score");
  if (highScore) highScore.style.display = "none";
  // Show the game container
  const gameContainer = document.getElementById("game-container");
  if (gameContainer) gameContainer.style.display = "block";
  // Hide all level sections
  document.querySelectorAll('.level-section').forEach(section => {
    section.style.display = 'none';
  });
  updatePointsDisplay();
  startGame();
}

function endGame() {
  // Store info for progress page
  localStorage.setItem('progressScore', points);
  localStorage.setItem('progressLevel', currentLevel);
  localStorage.setItem('progressDifficulty', currentDifficulty);

  // Hide the game container and show the high score screen
  const gameContainer = document.getElementById("game-container");
  if (gameContainer) gameContainer.style.display = "none";
  const highScore = document.getElementById("high-score");
  if (highScore) highScore.style.display = "block";
  const finalPoints = document.getElementById("final-points");
  if (finalPoints) finalPoints.innerText = `Final Score: ${points}`;
  const finalLevel = document.getElementById("final-level");
  if (finalLevel) finalLevel.innerText = `You reached Level ${currentLevel}`;

  // Hide all level sections
  document.querySelectorAll('.level-section').forEach(section => {
    section.style.display = 'none';
  });

  // If at the end of easy or medium, redirect to progress.html
  if ((currentDifficulty === 'easy' && currentLevel === difficultySettings['easy'].maxLevel) ||
      (currentDifficulty === 'medium' && currentLevel === difficultySettings['medium'].maxLevel)) {
    window.location.href = 'progress.html';
    return;
  }

  // Determine final password: if on Level 3 (OTP), use otpCode; otherwise use levelPasswords.
  let finalPassword = (currentLevel === 3) ? (otpCode || "N/A") : (levelPasswords[currentLevel] || "N/A");

  // Determine user ID from admin or guest mode.
  const userId = window.currentUserId ? window.currentUserId : (window.guestId || "Guest");

  // Add this new high score record (list resets on refresh)
  addHighScore(points, currentLevel, finalPassword, userId);

  // Update the leaderboard details in the highscore-details element
  displayHighScoreDetails();

  // Show progress/return buttons for hard only
  const progressDiv = document.getElementById("difficulty-progress-buttons");
  if (progressDiv) progressDiv.innerHTML = `<button class='btn btn-secondary' onclick='returnToIntro()'>Return to Intro Page</button>`;

  markGameCompletion('completed');
}

function progressToMedium() {
  // Preserve admin status if present
  if (isAdmin || window.currentUserId === 'Admin') {
    isAdmin = true;
    window.currentUserId = 'Admin';
  }
  setDifficulty('medium');
  document.getElementById("high-score").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  currentLevel = 1;
  points = 100;
  updatePointsDisplay();
  startGame();
}

function progressToHard() {
  // Preserve admin status if present
  if (isAdmin || window.currentUserId === 'Admin') {
    isAdmin = true;
    window.currentUserId = 'Admin';
  }
  setDifficulty('hard');
  document.getElementById("high-score").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  currentLevel = 1;
  points = 100;
  updatePointsDisplay();
  startGame();
}

function returnToIntro() {
  window.location.href = "index.html";
}

// ---------------------------
// Timer Functions
// ---------------------------
function startTimer(seconds) {
  console.log('startTimer called with', seconds, 'seconds');
  clearInterval(timerInterval);
  let timeLeft = seconds;
  const timerDisplay = document.getElementById("timer-display");
  timerDisplay.innerText = `Time left: ${timeLeft}s`;
  timerDisplay.className = "timer";
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `Time left: ${timeLeft}s`;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerDisplay.innerText = "Time's up!";
      timerDisplay.className = "timer expired";
      setTimeout(() => {
        endGameAndRedirect();
      }, 1500);
    } else if (timeLeft <= 10) {
      timerDisplay.className = "timer warning";
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  const timerDisplay = document.getElementById("timer-display");
  timerDisplay.innerText = "";
  timerDisplay.className = "timer";
}

// ---------------------------
// Password Generation Functions
// ---------------------------
// Utility: Scramble a string
function scrambleString(str) {
  return str.split('').sort(() => Math.random() - 0.5).join('');
}

// Local password generator as fallback
function localPasswordGenerator(length, useSymbols = false, useUpper = false, useNumbers = false) {
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useNumbers) chars += '0123456789';
  if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Fetch a random password from an API, fallback to local generator
async function fetchPassword(length, useSymbols = false, useUpper = false, useNumbers = false) {
  try {
    const url = `https://passwordwolf.com/api/?length=${length}&upper=${useUpper ? 1 : 0}&numbers=${useNumbers ? 1 : 0}&special=${useSymbols ? 1 : 0}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data[0].password;
  } catch (e) {
    console.error('Password fetch failed, using local generator:', e);
    return localPasswordGenerator(length, useSymbols, useUpper, useNumbers);
  }
}

// Utility function for leetspeak
function toLeetSpeak(str) {
  return str.toLowerCase()
    .replace(/a/g, '4')
    .replace(/e/g, '3')
    .replace(/i/g, '1')
    .replace(/o/g, '0')
    .replace(/s/g, '5');
}

// Update generateLevelPassword for level 2
async function generateLevelPassword(level) {
    let password;
    switch(level) {
        case 1:
            password = veryWeakPasswords[Math.floor(Math.random() * veryWeakPasswords.length)];
            break;
        case 2:
            password = weakPasswords[Math.floor(Math.random() * weakPasswords.length)];
            break;
        case 3:
            const keyboardPatterns = ['qwerty123', 'asdfgh456', '1qaz2wsx', 'zxcvbn789'];
            password = keyboardPatterns[Math.floor(Math.random() * keyboardPatterns.length)];
            break;
        case 4:
            password = mediumPasswords[Math.floor(Math.random() * mediumPasswords.length)];
            break;
        case 5:
            const basePattern = patternPasswords[Math.floor(Math.random() * patternPasswords.length)];
            password = basePattern;
            break;
        case 6:
            const cipherChoice = cipherPasswords[Math.floor(Math.random() * cipherPasswords.length)];
            password = cipherChoice.split('->')[1];
            break;
        default:
            let settings = {
                length: 8,
                useSymbols: level > 2,
                useUpper: level > 1,
                useNumbers: true
            };
            password = await fetchPassword(settings.length, settings.useSymbols, settings.useUpper, settings.useNumbers);
    }
    
    // Store the original password and return scrambled version
    levelPasswords[level] = password;
    return scrambleString(password);
}

// Update generateScrambledPassword for level 2
async function generateScrambledPassword() {
  // Ensure the scrambled-password-section is visible
  document.getElementById('scrambled-password-section').style.display = 'block';
  // Use the original password, scramble it, and display
  const password = levelPasswords[2];
  const scrambled = scrambleString(password);
  document.getElementById("scrambled-password").innerText = scrambled;
  hintsUsed = 0;
  startTime = Date.now();
}

async function generateStrongPassword() {
    // Level 3: Use only vertical keyboard sequences
    const verticalPatterns = [
        'qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ik,', 'ol.'
    ];
    const password = verticalPatterns[Math.floor(Math.random() * verticalPatterns.length)];
    levelPasswords[3] = password;
    document.getElementById("strong-password").innerText = scrambleString(password);
    startTime = Date.now();
}

// New level generation functions
async function generateCombinedWordPassword() {
    const password = mediumPasswords[Math.floor(Math.random() * mediumPasswords.length)];
    const scrambled = scrambleString(password);
    levelPasswords[4] = password;
    document.getElementById("combined-password").innerText = scrambled;
    showWordBank();
    startTime = Date.now();
}

async function generatePatternPassword() {
    const password = patternPasswords[Math.floor(Math.random() * patternPasswords.length)];
    const scrambled = scrambleString(password);
    levelPasswords[5] = password;
    document.getElementById("pattern-password").innerText = scrambled;
    showSequenceBank();
    startTime = Date.now();
}

function showSequenceBank() {
    const sequenceBank = document.getElementById("sequence-bank");
    const sequenceBankContent = document.getElementById("sequence-bank-content");
    const currentPassword = levelPasswords[5];
    // The correct answer scrambled
    const correctScrambled = scrambleString(currentPassword);
    // Get all possible patterns except the correct one
    const distractorPatterns = patternPasswords.filter(p => p !== currentPassword);
    // Pick 5 random distractors
    let distractors = [];
    while (distractors.length < 5 && distractorPatterns.length > 0) {
        const idx = Math.floor(Math.random() * distractorPatterns.length);
        const pattern = distractorPatterns.splice(idx, 1)[0];
        let scrambledDistractor = scrambleString(pattern);
        // Ensure uniqueness
        if (scrambledDistractor !== correctScrambled && !distractors.includes(scrambledDistractor)) {
            distractors.push(scrambledDistractor);
        }
    }
    // Combine and shuffle
    let scrambledBank = [correctScrambled, ...distractors];
    scrambledBank = scrambledBank.sort(() => Math.random() - 0.5);
    sequenceBankContent.innerText = scrambledBank.join(', ');
    sequenceBank.style.display = 'block';
}

async function generateCipherPassword() {
    const password = cipherPasswords[Math.floor(Math.random() * cipherPasswords.length)];
    levelPasswords[6] = password.split('->')[1];
    document.getElementById("cipher-password").innerText = password.split('->')[0];
    resetCipherKeys();
    startTime = Date.now();
}

// Word bank functionality
function showWordBank() {
    const wordBank = document.getElementById("word-bank");
    const wordBankContent = document.getElementById("word-bank-content");
    const currentPassword = levelPasswords[currentLevel];
    
    // Extract words from the current password
    const words = currentPassword.match(/[a-zA-Z]+/g);
    
    // Create a list of similar words including the correct ones
    let bankWords = [...words];
    const allWords = [...mediumPasswords.join(' ').match(/[a-zA-Z]+/g)];
    while (bankWords.length < 6) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        if (!bankWords.includes(randomWord)) {
            bankWords.push(randomWord);
        }
    }
    
    // Shuffle the word bank
    bankWords = bankWords.sort(() => Math.random() - 0.5);
    wordBankContent.innerText = bankWords.join(', ');
    wordBank.style.display = 'block';
}

// Cipher key collection system
let collectedKeys = new Set();

function resetCipherKeys() {
    collectedKeys.clear();
    document.getElementById("cipher-keys-found").innerText = "0/3";
    document.getElementById("cipher-key-display").innerHTML = "";
}

function collectCipherKey() {
    if (collectedKeys.size >= 3) return;
    
    const keys = Object.entries(cipherKey);
    let newKey;
    do {
        newKey = keys[Math.floor(Math.random() * keys.length)];
    } while (collectedKeys.has(newKey));
    
    collectedKeys.add(newKey);
    document.getElementById("cipher-keys-found").innerText = `${collectedKeys.size}/3`;
    
    const keyDisplay = document.getElementById("cipher-key-display");
    keyDisplay.innerHTML = Array.from(collectedKeys)
        .map(([from, to]) => `${from} → ${to}`)
        .join('<br>');
    
    // Award bonus points for finding keys
    points += 10;
    updatePointsDisplay();
}

// ---------------------------
// Verification Functions
// ---------------------------
function verifyPassword() {
  const enteredPassword = document.getElementById("password-input").value.trim();
  const displayedPassword = document.getElementById("password-display").innerText;
  const correctPassword = displayedPassword.split('').reverse().join('');
  recordAttempt(1, enteredPassword, enteredPassword.toLowerCase() === correctPassword.toLowerCase());
  
  if (enteredPassword.toLowerCase() === correctPassword.toLowerCase()) { // Make case-insensitive
    showLevelExplanation(1);
    calculatePoints();
    setTimeout(() => {
      currentLevel++;
      proceedToNextChallenge();
    }, 4000);
  } else {
    handleIncorrectAttempt(enteredPassword);
  }
}

function checkScrambledPassword() {
  const enteredPassword = document.getElementById("scrambled-input").value.trim();
  const correctUnscrambled = levelPasswords[2];
  recordAttempt(2, enteredPassword, enteredPassword.toLowerCase() === correctUnscrambled.toLowerCase());
  if (enteredPassword.toLowerCase() === correctUnscrambled.toLowerCase()) {
    // Show the button to reveal leetspeak version
    document.getElementById("show-leetspeak-btn").style.display = "inline-block";
    document.getElementById("leetspeak-result").innerText = "";
    document.getElementById("leetspeak-input-section").style.display = "none";
    document.getElementById("scrambled-input").disabled = true;
    document.getElementById("scrambled-input").classList.add("bg-success", "text-white");
    // Optionally, show a message
    document.getElementById("message").innerText = "✅ Unscrambled! Now get the leetspeak version.";
    document.getElementById("message").className = "message success";
  } else {
    handleIncorrectAttempt(enteredPassword);
  }
}

function showLeetspeakVersion() {
    const original = levelPasswords[2];
    const leet = toLeetSpeak(original);
    document.getElementById("leetspeak-result").innerText = `Leetspeak: ${leet}`;
    document.getElementById("leetspeak-input-section").style.display = "block";
    document.getElementById("show-leetspeak-btn").style.display = "none";
}

function checkLeetspeakPassword() {
  const enteredLeet = document.getElementById("leetspeak-input").value.trim();
  const correctLeet = toLeetSpeak(levelPasswords[2]);
  recordAttempt(2, enteredLeet, enteredLeet.toLowerCase() === correctLeet.toLowerCase());
  if (enteredLeet.toLowerCase() === correctLeet.toLowerCase()) {
    showLevelExplanation(2);
    calculatePoints();
    setTimeout(() => {
      // Reset for next round
      document.getElementById("leetspeak-input-section").style.display = "none";
      document.getElementById("leetspeak-result").innerText = "";
      document.getElementById("scrambled-input").disabled = false;
      document.getElementById("scrambled-input").classList.remove("bg-success", "text-white");
      document.getElementById("scrambled-input").value = "";
      document.getElementById("leetspeak-input").value = "";
      currentLevel++;
      proceedToNextChallenge();
    }, 4000);
  } else {
    document.getElementById("message").innerText = "❌ Incorrect leetspeak password! Try again.";
    document.getElementById("message").className = "message error";
  }
}

function checkStrongPassword() {
    const enteredPassword = document.getElementById("strong-input").value.trim();
    recordAttempt(3, enteredPassword, enteredPassword.toLowerCase() === levelPasswords[3].toLowerCase());
    if (enteredPassword.toLowerCase() === levelPasswords[3].toLowerCase()) {
        showLevelExplanation(3);
        calculatePoints();
        setTimeout(() => {
            // Use maxLevel from difficultySettings
            if (currentLevel === difficultySettings[currentDifficulty].maxLevel) {
                endGame();
            } else {
                currentLevel++;
                proceedToNextChallenge();
            }
        }, 4000);
    } else {
        handleIncorrectAttempt(enteredPassword);
    }
}

// New level verification functions
function checkCombinedPassword() {
    const enteredPassword = document.getElementById("combined-input").value.trim();
    recordAttempt(4, enteredPassword, enteredPassword === levelPasswords[4]);
    if (enteredPassword === levelPasswords[4]) {
        showLevelExplanation(4);
        calculatePoints();
        setTimeout(() => {
            if (currentLevel === difficultySettings[currentDifficulty].maxLevel) {
                endGame();
            } else {
                currentLevel++;
                proceedToNextChallenge();
            }
        }, 4000);
    } else {
        handleIncorrectAttempt(enteredPassword);
    }
}

function checkPatternPassword() {
    const enteredPassword = document.getElementById("pattern-input").value.trim();
    recordAttempt(5, enteredPassword, enteredPassword === levelPasswords[5]);
    if (enteredPassword === levelPasswords[5]) {
        showLevelExplanation(5);
        calculatePoints();
        setTimeout(() => {
            if (currentLevel === difficultySettings[currentDifficulty].maxLevel) {
                endGame();
            } else {
                currentLevel++;
                proceedToNextChallenge();
            }
        }, 4000);
    } else {
        handleIncorrectAttempt(enteredPassword);
    }
}

function checkCipherPassword() {
    const enteredPassword = document.getElementById("cipher-input").value.trim();
    recordAttempt(6, enteredPassword, enteredPassword === levelPasswords[6]);
    if (enteredPassword === levelPasswords[6]) {
        calculatePoints();
        showLevelExplanation(6, () => {
            stopTimer();
            currentLevel++;
            proceedToNextChallenge();
        });
    } else {
        handleIncorrectAttempt(enteredPassword);
        // Offer a new cipher key as consolation
        if (collectedKeys.size < 3) {
            collectCipherKey();
        }
    }
}

// ---------------------------
// Level Progression and Points Functions
// ---------------------------
async function proceedToNextChallenge() {
    console.log('proceedToNextChallenge', {currentLevel, currentDifficulty});
    document.getElementById("current-level").innerText = currentLevel;
    startLevelAnalytics(currentLevel);
    showLevelIntro(currentLevel);
    // Always hide all level sections first
    document.querySelectorAll('.level-section').forEach(section => {
        section.style.display = "none";
    });
    const hintButtons = document.querySelectorAll('[id^="clear-hint-btn-"]');
    hintButtons.forEach(btn => {
        btn.style.display = difficultySettings[currentDifficulty].hintsEnabled ? 'inline-block' : 'none';
    });
    // Hard mode: 6=cipher, 7=phishing, 8=promotion
    if (currentDifficulty === 'hard') {
        console.log('Hard mode switch, currentLevel:', currentLevel);
        switch(currentLevel) {
            case 6:
                console.log('Showing cipher-section');
                document.getElementById("cipher-section").style.display = "block";
                await generateCipherPassword();
                break;
            case 7:
                console.log('Showing phishing-section');
                document.getElementById("phishing-section").style.display = "block";
                break;
            case 8:
                console.log('Showing password manager promotion');
                showPasswordManagerPromotion();
                break;
        }
        if (currentLevel === 6 || currentLevel === 7) {
            startTimer(difficultySettings[currentDifficulty].timeLimit);
        }
        // Fallback: force show phishing-section if on level 7
        if (currentLevel === 7) {
            document.getElementById("phishing-section").style.display = "block";
        }
        return;
    }
    switch(currentLevel) {
        case 2:
            levelPasswords[2] = weakPasswords[Math.floor(Math.random() * weakPasswords.length)];
            document.getElementById("scrambled-password-section").style.display = "block";
            await generateScrambledPassword();
            break;
        case 3:
            document.getElementById("strong-password-section").style.display = "block";
            await generateStrongPassword();
            break;
        case 4:
            document.getElementById("combined-words-section").style.display = "block";
            await generateCombinedWordPassword();
            break;
        case 5:
            document.getElementById("pattern-section").style.display = "block";
            await generatePatternPassword();
            break;
        case 6:
            document.getElementById("cipher-section").style.display = "block";
            await generateCipherPassword();
            break;
        case 7:
            document.getElementById("phishing-section").style.display = "block";
            break;
        case 8:
            showPasswordManagerPromotion();
            break;
    }
    if (currentLevel <= 6) {
      startTimer(difficultySettings[currentDifficulty].timeLimit);
    }
}

function calculatePoints() {
  let timeTaken = (Date.now() - startTime) / 1000;
  let basePoints = Math.max(50 - Math.floor(timeTaken), 10);
  let earnedPoints = Math.floor(basePoints * difficultySettings[currentDifficulty].pointsMultiplier);
  points += earnedPoints;
  updatePointsDisplay();
}

function updatePointsDisplay() {
  document.getElementById("points").innerText = points;
}

// ---------------------------
// Hint and Incorrect Attempt Functions
// ---------------------------
function handleIncorrectAttempt(userInput) {
  document.getElementById("message").innerText = "❌ Incorrect! Try again.";
  document.getElementById("message").className = "message error";
  if (difficultySettings[currentDifficulty].hintsEnabled) {
    revealHint(userInput);
  }
  // If points are 0 or less, end game and redirect
  if (points <= 0) {
    document.getElementById("message").innerText = "❌ Out of points!";
    document.getElementById("message").className = "message error";
    setTimeout(() => {
      endGame();
    }, 1500);
  }
}

// Returns the max number of hints for the current difficulty
function getMaxHintsForCurrentDifficulty() {
    if (currentDifficulty === 'medium') return 2;
    if (currentDifficulty === 'hard') return 0;
    return 4; // easy
}

function revealHint(userInput) {
  let correctPassword = levelPasswords[currentLevel] || otpCode;
  const maxHints = getMaxHintsForCurrentDifficulty();
  if (hintsUsed < maxHints) {
    let newHints = generateDynamicHint(userInput, correctPassword);
    let hintElementId = `clear-hint-display${currentLevel === 1 ? '' : currentLevel}`;
    let hintsElement = document.getElementById(hintElementId);
    if (hintsElement) {
      hintsElement.innerHTML += `<p>${newHints[hintsUsed]}</p>`;
    }
    hintsUsed++;
    recordHint(currentLevel);
  }
}

function generateDynamicHint(userInput, correctPassword) {
  let hints = [];
  if (userInput.length !== correctPassword.length) {
    hints.push(`Hint: The correct input is ${correctPassword.length} characters long.`);
  }
  if (userInput.toLowerCase() !== correctPassword.toLowerCase()) {
    hints.push(`Hint: Check your capitalization.`);
  }
  if (userInput.replace(/[^0-9]/g, '') !== correctPassword.replace(/[^0-9]/g, '')) {
    hints.push(`Hint: The number of digits is ${correctPassword.replace(/[^0-9]/g, '').length}.`);
  }
  hints.push(`Hint: Try a different approach!`);
  return hints;
}

function clearHint() {
  if (points < 10) {
    document.getElementById("message").innerText = "❌ Not enough points!";
    document.getElementById("message").className = "message error";
    return;
  }
  points = Math.floor(points / 2);
  updatePointsDisplay();
  let password = levelPasswords[currentLevel];
  let revealed = password.split("");
  let indicesToReveal = Math.ceil(password.length / 2);
  let revealedIndices = new Set();
  while (revealedIndices.size < indicesToReveal) {
    let randomIndex = Math.floor(Math.random() * password.length);
    revealedIndices.add(randomIndex);
  }
  let maskedPassword = revealed.map((char, index) =>
    revealedIndices.has(index) ? char : "_"
  ).join("");
  
  let displayId = `clear-hint-display${currentLevel === 1 ? '' : currentLevel}`;
  let clearHintDisplay = document.getElementById(displayId);
  if (clearHintDisplay) {
    clearHintDisplay.innerText = `Clear Hint: ${maskedPassword}`;
  }
  // If points are 0 or less after using hint, end game and redirect
  if (points <= 0) {
    document.getElementById("message").innerText = "❌ Out of points!";
    document.getElementById("message").className = "message error";
    setTimeout(() => {
      endGame();
    }, 1500);
  }
}

// Function to show level introduction
function showLevelIntro(level) {
    const intro = levelIntros[level];
    const message = document.getElementById("message");
    message.innerHTML = `<h3>${intro.title}</h3><p>${intro.intro}</p>`;
    message.className = "message info";
}

// Function to show post-level explanation
function showLevelExplanation(level, callback) {
    const explanation = levelIntros[level].explanation;
    const message = document.getElementById("message");
    message.innerHTML = `<h3>Why was this password weak?</h3><p>${explanation}</p>`;
    message.className = "message warning";
    setTimeout(() => {
        endLevelAnalytics(level);
        if (callback) {
            callback();
        } else if (currentLevel <= difficultySettings[currentDifficulty].maxLevel) {
            showLevelIntro(currentLevel);
        }
    }, 3000);
}

function endGameAndRedirect() {
  markGameCompletion('gaveUp');
  endGame();
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

function checkPhishingAnswer(isPhishing) {
    const feedback = document.getElementById('phishing-feedback');
    if (isPhishing) {
        feedback.innerHTML = "<span style='color:green;'>Correct! This is a phishing attempt. Always check the sender's address and links carefully.</span>";
        setTimeout(() => {
            currentLevel++;
            proceedToNextChallenge();
        }, 2500);
    } else {
        feedback.innerHTML = "<span style='color:red;'>Incorrect. This is a phishing attempt. Look for suspicious sender addresses and urgent requests.</span>";
    }
    recordAttempt(7, isPhishing ? 'Phishing Attempt' : 'Safe Email', isPhishing);
}

function showPasswordManagerPromotion() {
    // Hide all level sections
    document.querySelectorAll('.level-section').forEach(section => {
        section.style.display = 'none';
    });
    // Show a message about password managers
    const message = document.getElementById('message');
    message.innerHTML = `<h2>Congratulations on completing the hardest level!</h2><p>Strong passwords are hard to remember. Consider using a <strong>password manager</strong> to generate and store unique passwords for every site.<br><br>Recommended password managers: <a href='https://bitwarden.com/' target='_blank'>Bitwarden</a>, <a href='https://www.lastpass.com/' target='_blank'>LastPass</a>, <a href='https://www.dashlane.com/' target='_blank'>Dashlane</a></p>`;
    message.className = 'message info';
    setTimeout(() => {
        endGameAndRedirect();
    }, 6000);
}

function showAnalyticsReport() {
  const report = document.getElementById('analytics-report');
  if (report) {
    let display = analytics.player ? `Player: ${analytics.player}\n` : '';
    display += JSON.stringify(analytics, null, 2);
    report.textContent = display;
  }
  // Update player name in admin dashboard if present
  const playerDiv = document.getElementById('analytics-player');
  if (playerDiv && analytics.player) {
    playerDiv.textContent = `Player: ${analytics.player}`;
  }
  saveAnalytics();
}

function exportAnalytics(format) {
  let dataStr = '';
  if (format === 'csv') {
    // CSV header
    dataStr = 'Level,Tries,HintsUsed,TimeSpent,IncorrectGuesses\n';
    analytics.attempts.forEach(a => {
      dataStr += `${a.level},${a.tries},${a.hintsUsed},${a.timeSpent},"${(a.incorrectGuesses||[]).join(';')}"\n`;
    });
  } else {
    dataStr = JSON.stringify(analytics, null, 2);
  }
  const blob = new Blob([dataStr], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics_report.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Patch: load analytics on page load
window.addEventListener('DOMContentLoaded', loadAnalytics);
