const container = document.getElementById('container');
const message = document.getElementById('message');
const counterEl = document.getElementById('counter');
const timerDisplay = document.getElementById('timer-display');
const footer = document.getElementById('footer');

let count = 0;
let stage = 0;

// Yazıları sesli okuma ve bittiğinde işlem yapma
function speak(text, callback) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.1; 
    
    if (callback) {
        utterance.onend = () => {
            setTimeout(callback, 500); // Küçük bir nefes payı
        };
    }
    window.speechSynthesis.speak(utterance);
}

function playClickSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, context.currentTime);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
}

function updateCounter(val) {
    count = val;
    counterEl.innerText = count;
}

function resetGame(msg = "Sıfırlandın!") {
    container.innerHTML = `<button id="mainBtn" class="main-btn">BAŞLA</button>`;
    document.getElementById('mainBtn').onclick = handleMainClick;
    message.innerText = msg;
    speak(msg);
    timerDisplay.style.display = 'none';
    updateCounter(0);
    stage = 0;
}

function handleMainClick() {
    playClickSound();
    stage++;
    updateCounter(count + 1);

    if (stage === 1) {
        const txt = "Cidden durmalısın devam etmenin anlamı yok!";
        message.innerText = txt;
        speak(txt);
    } 
    else if (stage === 2) {
        const txt = "Benimle kapışmak istiyorsun ha?";
        message.innerText = txt;
        speak(txt, startTripleChallenge);
    }
}

// SEVİYE 1: Karıştırma
function startTripleChallenge() {
    container.innerHTML = '';
    const buttons = [];
    const correctIndex = Math.floor(Math.random() * 3);

    for (let i = 0; i < 3; i++) {
        const btn = document.createElement('button');
        btn.className = "main-btn absolute shuffling";
        btn.innerText = "TIKLA";
        btn.dataset.correct = (i === correctIndex);
        container.appendChild(btn);
        buttons.push(btn);
    }

    setTimeout(() => {
        const txt = "İçlerinden sadece biri doğru yanlışı seçersen sayaç sıfırlanır";
        message.innerText = txt;
        speak(txt);
        buttons.forEach((btn) => {
            btn.classList.remove('shuffling');
            btn.style.position = 'relative';
            btn.onclick = () => {
                playClickSound();
                if (btn.dataset.correct === "true") {
                    updateCounter(count + 1);
                    container.innerHTML = ''; // Butonları hemen temizle
                    const winTxt = "Fena değilsin...";
                    message.innerText = winTxt;
                    speak(winTxt, startEthicalDilemma);
                } else {
                    resetGame();
                }
            };
        });
    }, 3000);
}

// SEVİYE 2: Epstein İkilemi
function startEthicalDilemma() {
    container.innerHTML = '';
    const txt = "Buton 1e tıklarsan Epstein ölücek ama 5 çocuk kurtulacak fakat Buton 2ye basarsan 5 çocuk ölecek ve epstein kurtulcak";
    message.innerText = txt;
    speak(txt);
    
    const btn1 = document.createElement('button');
    btn1.className = "main-btn";
    btn1.innerText = "Buton 1";
    
    const btn2 = document.createElement('button');
    btn2.className = "main-btn";
    btn2.innerText = "Buton 2";

    container.appendChild(btn1);
    container.appendChild(btn2);

    btn1.onclick = () => {
        playClickSound();
        container.innerHTML = ''; 
        const winTxt = "Cidden iyi birisin";
        message.innerText = winTxt;
        speak(winTxt, startSpamChallenge);
        updateCounter(count + 1);
    };

    btn2.onclick = () => {
        playClickSound();
        container.innerHTML = '';
        const m1 = "Dostum...";
        message.innerText = m1;
        speak(m1, () => {
            const m2 = "Cidden mi?";
            message.innerText = m2;
            speak(m2, () => {
                resetGame("Vicdanın nerede?");
            });
        });
    };
}

// SEVİYE 3: 10 Saniye / 30 Tık
function startSpamChallenge() {
    container.innerHTML = '';
    const txt = "10 saniye içinde butona 30 kez basmalısın!";
    message.innerText = txt;
    speak(txt, () => {
        let clicksNeeded = 30;
        let timeLeft = 10;
        timerDisplay.style.display = 'block';
        timerDisplay.innerText = timeLeft;
        
        const spamBtn = document.createElement('button');
        spamBtn.className = "main-btn w-40 h-40 rounded-full bg-red-500 text-white border-none text-2xl shadow-xl";
        spamBtn.innerText = "TIKLA!";
        container.appendChild(spamBtn);

        const timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (clicksNeeded > 0) resetGame("Çok yavaşsın!");
            }
        }, 1000);

        spamBtn.onclick = () => {
            playClickSound();
            clicksNeeded--;
            updateCounter(count + 1);
            message.innerText = `Kalan: ${clicksNeeded}`;
            if (clicksNeeded <= 0) {
                clearInterval(timerInterval);
                timerDisplay.style.display = 'none';
                startWatermelonGame();
            }
        };
    });
}

// SEVİYE 4: Karpuz & Örümcek (%75 Karpuz, 1 Saniye)
function startWatermelonGame() {
    container.innerHTML = '';
    const txt = "Ekranda her bir saniye içinde karpuz gelicek karpuzu görünce butona bas fakat örümcek gelirse basma";
    message.innerText = txt;
    
    speak(txt, () => {
        let score = 0;
        let currentItem = ''; 
        container.innerHTML = `
            <div class="flex flex-col items-center">
                <div id="gameArea" class="game-icon"></div>
                <button id="hitBtn" class="main-btn mt-8">ŞİMDİ BAS!</button>
            </div>
        `;
        
        const gameArea = document.getElementById('gameArea');
        const hitBtn = document.getElementById('hitBtn');

        const gameInterval = setInterval(() => {
            // %75 Karpuz, %25 Örümcek
            const isWatermelon = Math.random() < 0.75;
            currentItem = isWatermelon ? '🍉' : '🕷️';
            gameArea.innerText = currentItem;
        }, 1000);

        hitBtn.onclick = () => {
            playClickSound();
            if (currentItem === '🍉') {
                score++;
                updateCounter(count + 1);
                message.innerText = `Puan: ${score} / 5`;
                if (score >= 5) {
                    clearInterval(gameInterval);
                    finishGame();
                }
            } else if (currentItem === '🕷️') {
                clearInterval(gameInterval);
                resetGame("Örümceğe bastın!");
            } else {
                // Henüz bir şey gelmediyse
                resetGame("Erken bastın!");
            }
        };
    });
}

function finishGame() {
    container.innerHTML = '';
    const txt = "Tebrikler...";
    message.innerText = txt;
    speak(txt);
    footer.style.display = 'block';
}

// İlk başlatma butonu için event listener
document.getElementById('mainBtn').onclick = handleMainClick;
