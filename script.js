const correctPassword = "Subhadi";
let gameActive = false;
let gameScore = 0;
let gameTimeLeft = 30;
let gameInterval;
let timerInterval;
let floatingHeartsInterval;
let balloonsInterval;
let currentPage = 0;
const totalPages = 6;

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    const submitBtn = document.getElementById('submitPassword');

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });

    submitBtn.addEventListener('click', checkPassword);
});

function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const passwordScreen = document.getElementById('passwordScreen');
    const mainContent = document.getElementById('mainContent');

    if (passwordInput.value === correctPassword) {
        passwordScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
        initializeWebsite();
    } else {
        passwordError.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
}

function initializeWebsite() {
    floatingHeartsInterval = setInterval(createFloatingHeart, 800);

    for (let i = 0; i < 20; i++) {
        createBalloon();
    }

    setInterval(cycleQuotes, 5000);

    initializeEventListeners();
}

function initializeEventListeners() {
    document.getElementById("musicBtn").addEventListener("click", function() {
        const music = document.getElementById("bgMusic");
        if (music.paused) {
            music.play();
            this.textContent = "Pause Music 🎵";
        } else {
            music.pause();
            this.textContent = "Play Our Song 🎵";
        }
    });

    document.getElementById("loveNotesBtn").addEventListener("click", function() {
        openDiary();
    });

    document.getElementById("gameBtn").addEventListener("click", function() {
        document.getElementById("heartGame").classList.remove("hidden");
        showGameInstructions();
    });

    document.getElementById("startGameBtn").addEventListener("click", function() {
        startHeartGame();
    });

    document.getElementById("playAgainBtn").addEventListener("click", function() {
        showGameInstructions();
    });
}

function openDiary() {
    const diary = document.getElementById("loveDiary");
    const overlay = document.getElementById("letterOverlay");

    diary.classList.remove("hidden");
    overlay.classList.add("active");
    document.body.classList.add("diary-open");

    currentPage = 0;
    showPage(currentPage);

    addDiaryEventListeners();

    playLoveSound();
}

function closeDiary() {
    const diary = document.getElementById("loveDiary");
    const overlay = document.getElementById("letterOverlay");

    diary.classList.add("hidden");
    overlay.classList.remove("active");
    document.body.classList.remove("diary-open");

    removeDiaryEventListeners();
}

function addDiaryEventListeners() {
    const diaryBook = document.querySelector(".diary-book");

    diaryBook.addEventListener("click", handleDiaryClick);

    document.addEventListener("keydown", handleDiaryKeyboard);
}

function removeDiaryEventListeners() {
    const diaryBook = document.querySelector(".diary-book");

    diaryBook.removeEventListener("click", handleDiaryClick);
    document.removeEventListener("keydown", handleDiaryKeyboard);
}

function handleDiaryClick(e) {
    if (e.target.classList.contains('close-diary-btn')) {
        return;
    }

    const diaryBook = document.querySelector(".diary-book");
    const rect = diaryBook.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const bookWidth = rect.width;

    if (clickX < bookWidth / 2) {
        if (currentPage > 0) {
            currentPage--;
            showPage(currentPage);
            playPageTurnSound();
        }
    } else {
        if (currentPage < totalPages - 1) {
            currentPage++;
            showPage(currentPage);
            playPageTurnSound();
        }
    }
}

function handleDiaryKeyboard(e) {
    if (e.key === 'ArrowLeft' && currentPage > 0) {
        currentPage--;
        showPage(currentPage);
        playPageTurnSound();
    } else if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
        currentPage++;
        showPage(currentPage);
        playPageTurnSound();
    } else if (e.key === 'Escape') {
        closeDiary();
    }
}

function showPage(pageIndex) {
    const pages = document.querySelectorAll('.diary-page');
    const leftHint = document.querySelector('.left-hint');
    const rightHint = document.querySelector('.right-hint');

    pages.forEach(page => page.classList.remove('active'));

    if (pages[pageIndex]) {
        pages[pageIndex].classList.add('active');
    }

    leftHint.style.visibility = pageIndex > 0 ? 'visible' : 'hidden';
    rightHint.style.visibility = pageIndex < totalPages - 1 ? 'visible' : 'hidden';

    if (pageIndex === 0) {
        rightHint.textContent = 'Click here to begin reading →';
    } else if (pageIndex === totalPages - 1) {
        rightHint.style.visibility = 'hidden';
    } else {
        rightHint.textContent = 'Click here to continue →';
    }
}

function playPageTurnSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(400, context.currentTime);
        oscillator.frequency.setValueAtTime(300, context.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
    } catch (error) {
        console.log('Audio context not available');
    }
}

function showGameInstructions() {
    document.getElementById("gameInstructions").classList.remove("hidden");
    document.getElementById("gamePlay").classList.add("hidden");
    document.getElementById("gameResults").classList.add("hidden");

    document.body.classList.remove('game-mode');
}

function startHeartGame() {
    document.getElementById("gameInstructions").classList.add("hidden");
    document.getElementById("gamePlay").classList.remove("hidden");
    document.getElementById("gameResults").classList.add("hidden");

    document.body.classList.add('game-mode');

    clearInterval(floatingHeartsInterval);
    clearInterval(balloonsInterval);

    removeExistingBackgroundElements();

    gameActive = true;
    gameScore = 0;
    gameTimeLeft = 30;

    document.getElementById('score').textContent = gameScore;
    document.getElementById('gameTimer').textContent = gameTimeLeft;

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';

    gameInterval = setInterval(spawnRandomHeart, 800);

    timerInterval = setInterval(updateGameTimer, 1000);
}

function spawnRandomHeart() {
    if (!gameActive) return;

    const gameArea = document.getElementById('gameArea');
    const heart = document.createElement('div');

    const isGoodHeart = Math.random() >= 0.5;

    heart.classList.add('game-heart');
    heart.textContent = isGoodHeart ? '💕' : '💔';

    const gameAreaRect = gameArea.getBoundingClientRect();
    const heartSize = 40;
    const maxLeft = gameAreaRect.width - heartSize;
    heart.style.left = Math.random() * maxLeft + 'px';

    if (isGoodHeart) {
        heart.classList.add('good-heart');
        heart.style.setProperty('--duration', (Math.random() * 2 + 3) + 's');
        heart.style.top = '-50px';
    } else {
        heart.classList.add('bad-heart');
        heart.style.setProperty('--duration', (Math.random() * 2 + 3) + 's');
        heart.style.top = '100%';
    }

    heart.addEventListener('click', () => {
        if (isGoodHeart) {
            gameScore++;
            createScoreEffect(heart, '+1', '#4CAF50');
        } else {
            gameScore--;
            createScoreEffect(heart, '-1', '#f44336');
        }
        document.getElementById('score').textContent = gameScore;
        heart.remove();

        if (gameScore > 0 && gameScore % 10 === 0) {
            createFireworks();
        }
    });

    gameArea.appendChild(heart);

    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, 5000);
}

function createScoreEffect(element, text, color) {
    const effect = document.createElement('div');
    effect.textContent = text;
    effect.style.position = 'absolute';
    effect.style.left = element.style.left;
    effect.style.top = element.style.top;
    effect.style.color = color;
    effect.style.fontSize = '24px';
    effect.style.fontWeight = 'bold';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '1000';
    effect.style.animation = 'scoreFloat 1s ease-out forwards';

    if (!document.querySelector('#scoreFloatStyle')) {
        const style = document.createElement('style');
        style.id = 'scoreFloatStyle';
        style.textContent = `
            @keyframes scoreFloat {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.getElementById('gameArea').appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

function updateGameTimer() {
    gameTimeLeft--;
    document.getElementById('gameTimer').textContent = gameTimeLeft;

    if (gameTimeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);

    document.getElementById('gameArea').innerHTML = '';

    document.body.classList.remove('game-mode');

    restartBackgroundElements();

    document.getElementById("gamePlay").classList.add("hidden");
    document.getElementById("gameResults").classList.remove("hidden");

    document.getElementById('finalScore').textContent = gameScore;

    let message = "";
    if (gameScore >= 30) {
        message = "Incredible! You're amazing at catching my love! 💕✨";
        createFireworks();
    } else if (gameScore >= 20) {
        message = "Wonderful! You know how to handle my heart! 💖";
    } else if (gameScore >= 10) {
        message = "Sweet! You're getting better at this! 💕";
    } else if (gameScore >= 0) {
        message = "Not bad for a first try! Practice makes perfect! 😊";
    } else {
        message = "Oops! Those tricky hearts got you! Try again? 😅";
    }

    document.getElementById('scoreMessage').textContent = message;
}

function removeExistingBackgroundElements() {
    const floatingHearts = document.querySelectorAll('.floating-heart');
    floatingHearts.forEach(heart => heart.remove());

    const balloons = document.querySelectorAll('.balloon');
    balloons.forEach(balloon => balloon.remove());
}

function restartBackgroundElements() {
    floatingHeartsInterval = setInterval(createFloatingHeart, 800);

    for (let i = 0; i < 10; ++i) {
        setTimeout(() => createBalloon(), i * 200);
    }
}

function closeHeartGame() {
    if (gameActive) {
        endGame();
    }

    document.getElementById("heartGame").classList.add("hidden");

    document.body.classList.remove('game-mode');
    restartBackgroundElements();

    showGameInstructions();
}

function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.textContent = ['❤️', '💕', '💖', '💗', '💘'][Math.floor(Math.random() * 5)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';

    document.querySelector('.floating-hearts').appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 6000);
}

const balloonColors = ["#ff9a9e", "#fad0c4", "#fbc2eb", "#a1c4fd", "#c2e9fb", "#fddb92"];
const balloonsContainer = document.querySelector(".balloons");

function createBalloon() {
    let balloon = document.createElement("div");
    balloon.classList.add("balloon");
    balloon.style.setProperty("--color", balloonColors[Math.floor(Math.random() * balloonColors.length)]);
    balloon.style.setProperty("--size", `${Math.random() * 40 + 40}px`);
    balloon.style.left = `${Math.random() * 100}%`;
    balloon.style.setProperty("--duration", `${Math.random() * 5 + 5}s`);

    balloon.addEventListener("click", () => {
        balloon.classList.add("popping");
        playPopSound();
        setTimeout(() => {
            balloon.remove();
            createBalloon();
        }, 300);
    });

    balloon.addEventListener("animationend", (e) => {
        if (e.animationName === "floatUp") {
            balloon.remove();
            createBalloon();
        }
    });

    balloonsContainer.appendChild(balloon);
}

function createFireworks() {
    const colors = ['#E91E63', '#fbc2eb', '#a1c4fd', '#fddb92', '#ff9a9e'];

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            firework.style.background = colors[Math.floor(Math.random() * colors.length)];
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';

            document.querySelector('.fireworks').appendChild(firework);

            setTimeout(() => firework.remove(), 1000);
        }, i * 200);
    }
}

function playLoveSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(523.25, context.currentTime);
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);

        oscillator.start();
        oscillator.stop(context.currentTime + 1);
    } catch (error) {
        console.log('Audio context not available');
    }
}

function playPopSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gainNode.gain.setValueAtTime(0.4, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
        console.log('Audio context not available');
    }
}

const romanticQuotes = [
    "You are my sunshine on cloudy days ☀️",
    "Every love song makes sense when I think of you 🎵",
    "You're the reason I believe in fairy tales ✨",
    "My heart skips a beat every time I see you 💓",
    "You are my happily ever after 👑",
    "You make my world brighter just by being in it 🌟",
    "With you, every day feels like a celebration 🎉",
    "You are my greatest adventure, my love 💕"
];

let quoteIndex = 0;
function cycleQuotes() {
    const subtitle = document.querySelector('.subtitle');
    subtitle.style.opacity = 0;

    setTimeout(() => {
        subtitle.textContent = romanticQuotes[quoteIndex];
        subtitle.style.opacity = 1;
        quoteIndex = (quoteIndex + 1) % romanticQuotes.length;
    }, 500);
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const diary = document.getElementById('loveDiary');
        if (diary && !diary.classList.contains('hidden')) {
            closeDiary();
        }

        const heartGame = document.getElementById('heartGame');
        if (heartGame && !heartGame.classList.contains('hidden')) {
            closeHeartGame();
        }
    }
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('click', function(e) {
    const isDiaryOpen = !document.getElementById('loveDiary').classList.contains('hidden');
    const isGameOpen = !document.getElementById('heartGame').classList.contains('hidden');

    if (Math.random() > 0.8 && !isDiaryOpen && !isGameOpen) {
        createClickHeart(e.clientX, e.clientY);
    }
});

function createClickHeart(x, y) {
    const heart = document.createElement('div');
    heart.textContent = '💕';
    heart.style.position = 'fixed';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = '20px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.animation = 'clickHeartFloat 1.5s ease-out forwards';

    if (!document.querySelector('#clickHeartStyle')) {
        const style = document.createElement('style');
        style.id = 'clickHeartStyle';
        style.textContent = `
            @keyframes clickHeartFloat {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-30px) scale(0.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
}
