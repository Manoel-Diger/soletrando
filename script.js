// Base de dados com 150+ palavras organizadas por dificuldade e categoria
const DATABASE = {
  facil: {
    animais: ['GATO', 'LEAO', 'ONÇA', 'PATO', 'URSO', 'LOBO', 'RATO', 'PEIXE', 'SAPO', 'CAVALO'],
    frutas: ['UVA', 'PERA', 'LIMA', 'COCO', 'FIGO', 'KIWI', 'MANGA', 'MELAO', 'ABACAXI', 'BANANA'],
    objetos: ['MESA', 'CAMA', 'PORTA', 'JANELA', 'LIVRO', 'LAPIS', 'PAPEL', 'BOLSA', 'RELOGIO', 'CHAVE', 'BOLA'],
    natureza: ['SOL', 'LUA', 'MAR', 'RIO', 'FLOR', 'ARVORE', 'PEDRA', 'TERRA', 'FOGO', 'VENTO'],
    cores: ['AZUL', 'VERDE', 'ROXO', 'ROSA', 'CINZA', 'PRETO', 'BRANCO', 'LARANJA', 'AMARELO', 'VERMELHO']
  },
  medio: {
    animais: ['ELEFANTE', 'GIRAFA', 'MACACO', 'TIGRE', 'CAVALO', 'PORCO', 'GALINHA', 'TARTARUGA', 'BORBOLETA', 'CACHORRO'],
    profissoes: ['MEDICO', 'PROFESSOR', 'DENTISTA', 'ENGENHEIRO', 'ADVOGADO', 'ARTISTA', 'COZINHEIRO', 'MOTORISTA', 'VENDEDOR', 'SECRETARIO'],
    lugares: ['ESCOLA', 'HOSPITAL', 'PARQUE', 'CINEMA', 'MUSEU', 'TEATRO', 'MERCADO', 'FARMACIA', 'BIBLIOTECA', 'RESTAURANTE'],
    tecnologia: ['COMPUTADOR', 'TELEFONE', 'TELEVISAO', 'RADIO', 'CAMERA', 'IMPRESSORA', 'TECLADO', 'MOUSE', 'MONITOR', 'INTERNET'],
    esportes: ['FUTEBOL', 'BASQUETE', 'VÔLEI', 'NATAÇÃO', 'CORRIDA', 'CICLISMO', 'TÊNIS', 'BOXE', 'JUDÔ', 'KARATÊ']
  },
  dificil: {
    ciencias: ['ASTRONOMIA', 'BIOLOGIA', 'QUIMICA', 'FISICA', 'MATEMATICA', 'GEOGRAFIA', 'HISTORIA', 'PSICOLOGIA', 'SOCIOLOGIA', 'ANTROPOLOGIA'],
    palavras_complexas: ['EXTRAORDINARIO', 'RESPONSABILIDADE', 'CONSCIENTIZACAO', 'ESPECIALIZACAO', 'TRANSFORMACAO', 'DESENVOLVIMENTO', 'IMPLEMENTACAO', 'CARACTERISTICAS', 'PRINCIPALMENTE', 'DEFINITIVAMENTE'],
    verbos: ['EXPERIMENTAR', 'DESENVOLVER', 'ESTABELECER', 'REPRESENTAR', 'DEMONSTRAR', 'DETERMINAR', 'CARACTERIZAR', 'FUNDAMENTAR', 'COMPLEMENTAR', 'IMPLEMENTAR'],
    substantivos: ['CONHECIMENTO', 'EXPERIENCIA', 'OPORTUNIDADE', 'CONSEQUENCIA', 'PERSONALIDADE', 'CRIATIVIDADE', 'FLEXIBILIDADE', 'ORIGINALIDADE', 'COMUNICACAO', 'ORGANIZACAO'],
    adjetivos: ['EXTRAORDINARIO', 'EXCEPCIONAL', 'FUNDAMENTAL', 'SIGNIFICATIVO', 'CONSIDERAVEL', 'SUBSTANCIAL', 'TRADICIONAL', 'INTERNACIONAL', 'REVOLUCIONARIO', 'RELEVANTE']
  }
};

// Estado do jogo
let gameState = {
  mode: 'single', // 'single' ou 'multi'
  currentPlayer: 1,
  players: { 1: { name: 'Jogador 1', score: 0, lives: 3 }, 2: { name: 'Jogador 2', score: 0, lives: 3 } },
  currentWord: '',
  currentLetters: [],
  difficulty: 'facil',
  level: 1,
  timer: 30,
  baseTimer: 30,
  timerInterval: null,
  wordsThisLevel: 0,
  hintsUsed: 0,
  startTime: null,
  keyboardMode: false,
  incompletePenalty: 0,
  inactivityTimer: null,
  lastInteraction: 0,
  autoHintShown: false
};

// Funções de utilidade
const $ = id => document.getElementById(id);
const shuffle = arr => arr.sort(() => Math.random() - 0.5);
const playSound = id => $(`sound-${id}`).play().catch(() => {});

// Navegação entre telas
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(screenId).classList.add('active');
}

function voltarMenu() {
  showScreen('menu-screen');
  resetGame();
}

// Inicialização do jogo
function iniciarJogo(mode) {
  gameState.mode = mode;
  resetGame();
  showScreen('game-screen');
  if (mode === 'multi') {
    $('player-info').textContent = `Vez do ${gameState.players[gameState.currentPlayer].name}`;
  }
  nextWord();
}

function resetGame() {
  gameState.currentPlayer = 1;
  gameState.players = { 1: { name: 'Jogador 1', score: 0, lives: 3 }, 2: { name: 'Jogador 2', score: 0, lives: 3 } };
  gameState.level = 1;
  gameState.wordsThisLevel = 0;
  gameState.hintsUsed = 0;
  gameState.incompletePenalty = 0;
  gameState.startTime = Date.now();
  gameState.keyboardMode = false;
  clearInterval(gameState.timerInterval);
  updateTimerByLevel();
  updateHUD();
}

// Atualizar timer baseado no nível
function updateTimerByLevel() {
  if (gameState.level <= 3) {
    gameState.baseTimer = 30;
  } else if (gameState.level <= 6) {
    gameState.baseTimer = 25;
  } else {
    gameState.baseTimer = 20;
  }
}

// Gerenciamento de palavras
function getRandomWord() {
  const difficulties = Object.keys(DATABASE);
  const currentDiff = gameState.level <= 3 ? 'facil' : gameState.level <= 6 ? 'medio' : 'dificil';
  gameState.difficulty = currentDiff;
  
  const categories = Object.keys(DATABASE[currentDiff]);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const words = DATABASE[currentDiff][randomCategory];
  const word = words[Math.floor(Math.random() * words.length)];
  
  return { word: word.toUpperCase(), category: randomCategory, difficulty: currentDiff };
}

function nextWord() {
  const wordData = getRandomWord();
  gameState.currentWord = wordData.word;
  gameState.currentLetters = shuffle([...wordData.word]);
  gameState.autoHintShown = false;
  
  $('category').textContent = `📂 ${wordData.category.toUpperCase()}`;
  $('difficulty').textContent = `⭐ ${wordData.difficulty.toUpperCase()}`;
  $('difficulty').className = `difficulty ${wordData.difficulty}`;
  
  updateTimerByLevel();
  renderLetters();
  renderKeyboard();
  resetTimer();
  resetInactivityTimer();
  hideMessage();
  $('hint').classList.add('hidden');
  updateHUD();
}

function renderLetters() {
  const dragContainer = $('drag-container');
  const dropContainer = $('drop-container');
  
  dragContainer.innerHTML = '';
  dropContainer.innerHTML = '';
  
  // Criar letras arrastáveis
  gameState.currentLetters.forEach((letter, i) => {
    const letterBox = document.createElement('div');
    letterBox.className = 'letter-box';
    letterBox.textContent = letter;
    letterBox.draggable = true;
    letterBox.dataset.letter = letter;
    letterBox.dataset.index = i;
    dragContainer.appendChild(letterBox);
  });
  
  // Criar zonas de drop
  for(let i = 0; i < gameState.currentWord.length; i++) {
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.dataset.position = i;
    dropContainer.appendChild(dropZone);
  }
  
  setupDragAndDrop();
}

// Sistema drag and drop
function setupDragAndDrop() {
  let draggedElement = null;
  
  document.querySelectorAll('.letter-box').forEach(box => {
    box.addEventListener('dragstart', e => {
      draggedElement = e.target;
      e.target.style.opacity = '0.5';
      trackUserActivity();
    });
    
    box.addEventListener('dragend', e => {
      e.target.style.opacity = '1';
    });
  });
  
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      if (draggedElement && !zone.hasChildNodes()) {
        zone.appendChild(draggedElement);
        zone.classList.add('filled');
        draggedElement = null;
        trackUserActivity();
      }
    });
  });
  
  // Permitir arrastar de volta
  $('drag-container').addEventListener('dragover', e => e.preventDefault());
  $('drag-container').addEventListener('drop', e => {
    e.preventDefault();
    if (draggedElement && draggedElement.parentNode.classList.contains('drop-zone')) {
      draggedElement.parentNode.classList.remove('filled');
      $('drag-container').appendChild(draggedElement);
      trackUserActivity();
    }
  });
}

// Verificação da palavra
function verificarPalavra() {
  trackUserActivity();
  const dropZones = document.querySelectorAll('.drop-zone');
  const userWord = Array.from(dropZones).map(zone => 
    zone.firstChild ? zone.firstChild.textContent : ''
  ).join('');
  
  // Penalidade por palavra incompleta
  if (userWord.length !== gameState.currentWord.length) {
    gameState.incompletePenalty++;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (gameState.incompletePenalty >= 3) {
      currentPlayer.lives--;
      showMessage('❌ Muitas tentativas incompletas! Vida perdida!', 'error');
      addShakeEffect();
      gameState.incompletePenalty = 0;
      
      if (currentPlayer.lives <= 0) {
        if (gameState.mode === 'multi') {
          switchPlayer();
        } else {
          setTimeout(endGame, 2000);
        }
      } else {
        setTimeout(nextWord, 2000);
      }
      updateHUD();
      return;
    }
    
    showMessage(`⚠️ Complete a palavra! (${gameState.incompletePenalty}/3 tentativas)`, 'error');
    addShakeEffect();
    return;
  }
  
  gameState.incompletePenalty = 0;
  const isCorrect = userWord === gameState.currentWord;
  const currentPlayer = gameState.players[gameState.currentPlayer];
  
  if (isCorrect) {
    playSound('correct');
    const points = calculatePoints();
    currentPlayer.score += points;
    gameState.wordsThisLevel++;
    
    showMessage(`Correto! +${points} pontos`, 'success');
    createConfetti();
    clearInterval(gameState.timerInterval);
    clearTimeout(gameState.inactivityTimer);
    
    // Verificar progressão de nível
    if (gameState.wordsThisLevel >= 3) {
      levelUp();
    } else {
      setTimeout(nextWord, 2000);
    }
  } else {
    playSound('wrong');
    currentPlayer.lives--;
    showMessage(`Incorreto! A palavra era: ${gameState.currentWord}`, 'error');
    addShakeEffect();
    clearInterval(gameState.timerInterval);
    clearTimeout(gameState.inactivityTimer);
    
    // Mostrar resposta correta visualmente
    showCorrectAnswer();
    
    if (currentPlayer.lives <= 0) {
      if (gameState.mode === 'multi') {
        setTimeout(switchPlayer, 3000);
      } else {
        setTimeout(endGame, 3000);
      }
    } else {
      setTimeout(nextWord, 3000);
    }
  }
  
  updateHUD();
}

function calculatePoints() {
  let basePoints = gameState.difficulty === 'facil' ? 10 : gameState.difficulty === 'medio' ? 20 : 30;
  let timeBonus = Math.max(0, gameState.timer * 2);
  let hintPenalty = gameState.hintsUsed * 5;
  return Math.max(5, basePoints + timeBonus - hintPenalty);
}

function levelUp() {
  gameState.level++;
  gameState.wordsThisLevel = 0;
  gameState.incompletePenalty = 0;
  updateTimerByLevel();
  showMessage(`🎉 Nível ${gameState.level} desbloqueado!`, 'success');
  createConfetti();
  setTimeout(nextWord, 3000);
}

function switchPlayer() {
  const otherPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  if (gameState.players[otherPlayer].lives > 0) {
    gameState.currentPlayer = otherPlayer;
    $('player-info').textContent = `Vez do ${gameState.players[gameState.currentPlayer].name}`;
    setTimeout(nextWord, 2000);
  } else {
    setTimeout(endGame, 2000);
  }
}

// Sistema de timer
function resetTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timer = gameState.baseTimer;
  updateTimer();
  
  gameState.timerInterval = setInterval(() => {
    gameState.timer--;
    updateTimer();
    
    if (gameState.timer <= 0) {
      clearInterval(gameState.timerInterval);
      timeUp();
    }
  }, 1000);
}

function updateTimer() {
  $('timer').textContent = `⏱️ ${gameState.timer}s`;
  if (gameState.timer <= 10) {
    $('timer').style.color = '#e74c3c';
  } else {
    $('timer').style.color = 'white';
  }
}

function timeUp() {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  currentPlayer.lives--;
  showMessage('⏰ Tempo esgotado!', 'error');
  clearTimeout(gameState.inactivityTimer);
  
  // Mostrar resposta correta quando o tempo esgotar
  showCorrectAnswer();
  
  if (currentPlayer.lives <= 0) {
    if (gameState.mode === 'multi') {
      setTimeout(switchPlayer, 3000);
    } else {
      setTimeout(endGame, 3000);
    }
  } else {
    setTimeout(nextWord, 3000);
  }
  
  updateHUD();
}

// Sistema de dicas
function mostrarDica() {
  trackUserActivity();
  if (gameState.hintsUsed >= 2) {
    showMessage('Máximo de 2 dicas por jogo!', 'error');
    return;
  }
  
  gameState.hintsUsed++;
  const hints = [
    `Começa com a letra "${gameState.currentWord[0]}"`,
    `Termina com a letra "${gameState.currentWord[gameState.currentWord.length - 1]}"`,
    `Tem ${gameState.currentWord.length} letras`
  ];
  
  $('hint').textContent = `💡 ${hints[gameState.hintsUsed - 1]}`;
  $('hint').classList.remove('hidden');
}

// Atualização da interface
function updateHUD() {
  const current = gameState.players[gameState.currentPlayer];
  $('score').textContent = `Pontos: ${current.score}`;
  $('lives').textContent = `❤️ ${current.lives}`;
  $('level').textContent = `Nível: ${gameState.level}`;
}

function showMessage(text, type = '') {
  const messageEl = $('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

function hideMessage() {
  $('message').textContent = '';
  $('message').className = 'message';
}

// Fim de jogo
function endGame() {
  clearInterval(gameState.timerInterval);
  const gameTime = Math.floor((Date.now() - gameState.startTime) / 1000);
  
  if (gameState.mode === 'single') {
    const player = gameState.players[1];
    $('end-title').textContent = player.score > 0 ? '🎉 Parabéns!' : '😔 Fim de Jogo';
    $('final-stats').innerHTML = `
      <div>📊 Pontuação Final: ${player.score}</div>
      <div>🎯 Nível Alcançado: ${gameState.level}</div>
      <div>⏱️ Tempo Total: ${gameTime}s</div>
      <div>💡 Dicas Usadas: ${gameState.hintsUsed}</div>
    `;
    
    saveScore(player.score, gameTime);
  } else {
    const p1 = gameState.players[1];
    const p2 = gameState.players[2];
    const winner = p1.score > p2.score ? p1 : p2.score > p1.score ? p2 : null;
    
    $('end-title').textContent = winner ? `🏆 ${winner.name} Venceu!` : '🤝 Empate!';
    $('final-stats').innerHTML = `
      <div>${p1.name}: ${p1.score} pontos</div>
      <div>${p2.name}: ${p2.score} pontos</div>
      <div>⏱️ Tempo Total: ${gameTime}s</div>
    `;
  }
  
  showScreen('end-screen');
}

function reiniciarJogo() {
  iniciarJogo(gameState.mode);
}

// Sistema de ranking
function saveScore(score, time) {
  if (score === 0) return;
  
  const rankings = JSON.parse(localStorage.getItem('soletrando-ranking') || '[]');
  rankings.push({
    score,
    time,
    date: new Date().toLocaleDateString('pt-BR'),
    level: gameState.level
  });
  
  rankings.sort((a, b) => b.score - a.score);
  localStorage.setItem('soletrando-ranking', JSON.stringify(rankings.slice(0, 5)));
}

function mostrarRanking() {
  const rankings = JSON.parse(localStorage.getItem('soletrando-ranking') || '[]');
  const list = $('ranking-list');
  
  if (rankings.length === 0) {
    list.innerHTML = '<div style="text-align: center; opacity: 0.7;">Nenhum recorde ainda!</div>';
  } else {
    list.innerHTML = rankings.map((record, i) => `
      <div class="ranking-item">
        <span>${i + 1}º lugar</span>
        <span>${record.score} pts - Nv.${record.level}</span>
      </div>
    `).join('');
  }
  
  showScreen('ranking-screen');
}

function resetRanking() {
  if (confirm('Tem certeza que deseja limpar todo o ranking?')) {
    localStorage.removeItem('soletrando-ranking');
    mostrarRanking();
  }
}

// Funcionalidades adicionais
function embaralharLetras() {
  trackUserActivity();
  gameState.currentLetters = shuffle([...gameState.currentLetters]);
  renderLetters();
  renderKeyboard();
}

function toggleKeyboard() {
  trackUserActivity();
  gameState.keyboardMode = !gameState.keyboardMode;
  const keyboard = $('virtual-keyboard');
  const toggleBtn = $('keyboard-toggle');
  
  if (gameState.keyboardMode) {
    keyboard.classList.remove('hidden');
    toggleBtn.textContent = '🖱️ Arrastar';
  } else {
    keyboard.classList.add('hidden');
    toggleBtn.textContent = '⌨️ Teclado';
  }
}

function renderKeyboard() {
  if (!gameState.keyboardMode) return;
  
  const keyboardLetters = $('keyboard-letters');
  keyboardLetters.innerHTML = '';
  
  const availableLetters = Array.from($('drag-container').children)
    .map(el => el.textContent);
  
  availableLetters.forEach(letter => {
    const key = document.createElement('button');
    key.className = 'keyboard-key';
    key.textContent = letter;
    key.onclick = () => useKeyboardLetter(letter, key);
    keyboardLetters.appendChild(key);
  });
}

function useKeyboardLetter(letter, keyElement) {
  trackUserActivity();
  const emptyZone = document.querySelector('.drop-zone:not(.filled)');
  if (!emptyZone) return;
  
  const letterBox = Array.from($('drag-container').children)
    .find(el => el.textContent === letter && !el.disabled);
  
  if (letterBox) {
    emptyZone.appendChild(letterBox.cloneNode(true));
    emptyZone.classList.add('filled');
    keyElement.disabled = true;
    
    // Remover da área de drag
    letterBox.remove();
  }
}

// Efeitos visuais
function createConfetti() {
  const container = $('confetti-container');
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    
    container.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 4000);
  }
}

function addShakeEffect() {
  const gameScreen = $('game-screen');
  gameScreen.classList.add('shake-animation');
  setTimeout(() => gameScreen.classList.remove('shake-animation'), 800);
  
  // Vibração em dispositivos móveis
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
}

// Mostrar resposta correta visualmente
function showCorrectAnswer() {
  const dropZones = document.querySelectorAll('.drop-zone');
  const dragContainer = $('drag-container');
  
  // Limpar campos atuais
  dropZones.forEach(zone => {
    if (zone.firstChild) {
      dragContainer.appendChild(zone.firstChild);
      zone.classList.remove('filled');
    }
  });
  
  // Preencher com a resposta correta
  gameState.currentWord.split('').forEach((letter, index) => {
    const letterBox = document.createElement('div');
    letterBox.className = 'letter-box correct-answer';
    letterBox.textContent = letter;
    letterBox.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
    letterBox.style.animation = 'pulse 0.6s ease-in-out';
    
    dropZones[index].appendChild(letterBox);
    dropZones[index].classList.add('filled');
  });
  
  // Ocultar letras da área de drag temporariamente
  Array.from(dragContainer.children).forEach(el => {
    el.style.opacity = '0.3';
  });
}

// Sistema de dica automática por inatividade
function trackUserActivity() {
  gameState.lastInteraction = Date.now();
  resetInactivityTimer();
}

function resetInactivityTimer() {
  clearTimeout(gameState.inactivityTimer);
  
  gameState.inactivityTimer = setTimeout(() => {
    if (!gameState.autoHintShown && gameState.timer > 0) {
      showAutoHint();
    }
  }, 10000); // 10 segundos de inatividade
}

function showAutoHint() {
  if (gameState.autoHintShown) return;
  
  gameState.autoHintShown = true;
  const hints = [
    `💡 Dica gratuita: Começa com "${gameState.currentWord[0]}"`,
    `💡 Dica gratuita: Termina com "${gameState.currentWord[gameState.currentWord.length - 1]}"`,
    `💡 Dica gratuita: Categoria ${$('category').textContent.replace('📂 ', '').toLowerCase()}`
  ];
  
  const randomHint = hints[Math.floor(Math.random() * hints.length)];
  
  $('hint').textContent = randomHint;
  $('hint').classList.remove('hidden');
  $('hint').style.background = 'rgba(52, 152, 219, 0.2)';
  $('hint').style.borderColor = '#3498db';
  
  // Sutil animação de aparecer
  $('hint').style.animation = 'fadeIn 0.5s ease-in';
  
  showMessage('💫 Dica automática apareceu!', 'success');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  showScreen('menu-screen');

  
});