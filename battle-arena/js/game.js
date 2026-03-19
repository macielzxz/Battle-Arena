const Player = (() => {
  let instance = null;

  class PlayerClass {
    constructor() {
      this.name        = 'Arcanus';
      this.emoji       = '🧙‍♂️';
      this.emojiHurt   = '🧙😫';
      this.emojiDead   = '🧙💀';
      this.emojiAttack = '🧙‍♂️⚔️';
      this.maxHp       = 300;
      this.hp          = 300;
      this.attack      = 45;
      this.defense     = 20;
      this.alive       = true;
    }

    takeDamage(dmg) {
      const real = Math.max(1, dmg - this.defense + Math.floor(Math.random() * 10));
      this.hp    = Math.max(0, this.hp - real);
      if (this.hp === 0) this.alive = false;
      return real;
    }

    getHpPercent() { return (this.hp / this.maxHp) * 100; }
  }

  return {
    getInstance() {
      if (!instance) instance = new PlayerClass();
      return instance;
    },
    reset() { instance = null; }
  };
})();

class MonsterFactory {
  static types = {
    dragon: {
      name:        'Dragão das Sombras',
      emoji:       '🐉',
      emojiHurt:   '🤕🔥',
      emojiDead:   '☠️🔥',
      emojiAttack: '🐉💢',
      type:        'DRAGÃO',
      maxHp:       220,
      attack:      60,
      defense:     15,
      cries:       ['RAAAWR! 🔥', 'GRAAAAAH!', 'Queima tudo!'],
      deathCry:    '💀 O dragão desmorona em cinzas…',
    },
    demon: {
      name:        'Demônio Abissal',
      emoji:       '😈',
      emojiHurt:   '🤢😖',
      emojiDead:   '☠️😵',
      emojiAttack: '😈⚡',
      type:        'DEMÔNIO',
      maxHp:       180,
      attack:      75,
      defense:     8,
      cries:       ['MUHAHAHAHA!', 'Sua alma é minha!', 'INFERNO!'],
      deathCry:    '💀 O demônio volta ao abismo…',
    },
    zombie: {
      name:        'Zumbi Antigo',
      emoji:       '🧟',
      emojiHurt:   '🧟💥',
      emojiDead:   '☠️🪦',
      emojiAttack: '🧟‍♂️👊',
      type:        'MORTO-VIVO',
      maxHp:       260,
      attack:      35,
      defense:     5,
      cries:       ['Braaaaains…', 'Uuuuugh…', 'Grrrrr…'],
      deathCry:    '💀 O zumbi cai e não levanta mais…',
    },
    alien: {
      name:        'Alienígena Kral',
      emoji:       '👽',
      emojiHurt:   '👾😵',
      emojiDead:   '☠️🛸',
      emojiAttack: '👽☄️',
      type:        'ALIENÍGENA',
      maxHp:       200,
      attack:      55,
      defense:     12,
      cries:       ['ZRXKK!! ☄️', 'XR-49 KRAL!', 'Terrans must die!'],
      deathCry:    '💀 O alien se dissolve em plasma…',
    },
  };

  static create(type) {
    const cfg = MonsterFactory.types[type];
    if (!cfg) throw new Error(`Tipo de monstro desconhecido: ${type}`);
    return {
      ...JSON.parse(JSON.stringify(cfg)),
      id:      `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      typeKey: type,
      hp:      cfg.maxHp,
      alive:   true,

      randomCry() {
        return this.cries[Math.floor(Math.random() * this.cries.length)];
      },
      takeDamage(dmg, playerAtk) {
        const real = Math.max(1, playerAtk + dmg - this.defense + Math.floor(Math.random() * 15));
        this.hp    = Math.max(0, this.hp - real);
        if (this.hp === 0) this.alive = false;
        return real;
      },
      getHpPercent() { return (this.hp / this.maxHp) * 100; }
    };
  }
}


let monsters = [];
let player   = null;

function initGame() {
  Player.reset();
  player = Player.getInstance();

  const order = ['dragon', 'demon', 'zombie', 'alien'];
  monsters = order.map(t => MonsterFactory.create(t));

  renderPlayer();
  renderMonsters();
  document.getElementById('logList').innerHTML = '';
  document.getElementById('overlayScreen').classList.remove('show');
  addLog(`⚔️ A batalha começa! <span class="log-em">${player.name}</span> enfrenta 4 inimigos!`);
}


function renderPlayer() {
  document.getElementById('playerName').textContent    = player.name;
  document.getElementById('playerEmoji').textContent   = player.emoji;
  document.getElementById('playerAtk').textContent     = player.attack;
  document.getElementById('playerDef').textContent     = player.defense;
  document.getElementById('playerMaxHp').textContent   = player.maxHp;
  updatePlayerHp();
}

function updatePlayerHp() {
  const pct  = player.getHpPercent();
  const fill = document.getElementById('playerHpFill');
  fill.style.width = pct + '%';
  fill.className   = 'player-hp-fill' + (pct <= 30 ? ' low' : pct <= 60 ? ' medium' : '');
  document.getElementById('playerHpNum').textContent = `${player.hp} / ${player.maxHp}`;
}


function renderMonsters() {
  const grid = document.getElementById('enemiesGrid');
  grid.innerHTML = '';

  monsters.forEach((m, idx) => {
    const card       = document.createElement('div');
    card.className   = 'monster-card';
    card.id          = `card-${idx}`;
    card.innerHTML   = `
      <div class="monster-type-badge">${m.type}</div>
      <div class="monster-dead-overlay" id="dead-${idx}">
        <span class="skull">💀</span>
        <span class="dead-text">MORTO</span>
      </div>
      <div class="monster-emoji" id="emoji-${idx}">${m.emoji}</div>
      <div class="monster-name">${m.name}</div>
      <div class="monster-stats">
        <div class="stat-atk">ATQ <span class="stat-val">${m.attack}</span></div>
        <div class="stat-def">DEF <span class="stat-val">${m.defense}</span></div>
        <div>HP <span class="stat-val">${m.maxHp}</span></div>
      </div>
      <div class="hp-wrapper">
        <div class="hp-label-row">
          <span class="hp-tag">VIDA</span>
          <span class="hp-numbers" id="hpnum-${idx}">${m.hp} / ${m.maxHp}</span>
        </div>
        <div class="hp-track">
          <div class="hp-fill" id="hpfill-${idx}" style="width:100%"></div>
        </div>
      </div>
      <div class="action-btns">
        <button class="btn btn-attack"  onclick="playerAttacks(${idx})">
          <span class="btn-icon">⚔️</span>ATACAR
        </button>
        <button class="btn btn-defend"  onclick="monsterAttacks(${idx})">
          <span class="btn-icon">🛡️</span>RECEBER
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateMonsterHp(idx) {
  const m    = monsters[idx];
  const pct  = m.getHpPercent();
  const fill = document.getElementById(`hpfill-${idx}`);
  fill.style.width = pct + '%';
  fill.className   = 'hp-fill' + (pct <= 30 ? ' low' : pct <= 60 ? ' medium' : '');
  document.getElementById(`hpnum-${idx}`).textContent = `${m.hp} / ${m.maxHp}`;
}


function playerAttacks(idx) {
  if (!player.alive) return;
  const m = monsters[idx];
  if (!m.alive) return;

  const dmg  = m.takeDamage(0, player.attack);
  const card = document.getElementById(`card-${idx}`);

  card.classList.add('shaking');
  setTimeout(() => card.classList.remove('shaking'), 380);

  SFX.swordHit();
  const sounds = SFX.monsterSounds[m.typeKey];

  if (m.alive) {
    setTimeout(() => sounds && sounds.hurt(), 60);
    flashMonsterEmoji(idx, 'hurt');
    flashPlayerEmoji('attack');
  } else {
    setTimeout(() => sounds && sounds.die(), 60);
    flashMonsterEmoji(idx, 'dead');
    flashPlayerEmoji('attack');
  }

  showFloat(card, `-${dmg}`, 'enemy');
  updateMonsterHp(idx);

  const cry = m.alive ? m.randomCry() : m.deathCry;
  addLog(`🗡️ <span class="log-em">${player.name}</span> ataca <span class="log-em">${m.name}</span> — <span class="log-dmg">-${dmg} HP</span> — "${cry}"`);
  setPlayerMsg(`"${cry}"`);

  if (!m.alive) {
    document.getElementById(`dead-${idx}`).classList.add('show');
    document.getElementById(`card-${idx}`).classList.add('dead');
    addLog(`<span class="log-dead">${m.deathCry}</span>`);
    checkVictory();
  }
}

function monsterAttacks(idx) {
  if (!player.alive) return;
  const m = monsters[idx];
  if (!m.alive) return;

  const card = document.getElementById(`card-${idx}`);
  card.classList.add('attacking');
  setTimeout(() => card.classList.remove('attacking'), 420);

  const dmg = player.takeDamage(m.attack);
  SFX.playerHurt();
  flashPlayerEmoji('hurt');
  flashMonsterEmoji(idx, 'attack');

  showFloat(document.getElementById('playerZone'), `-${dmg}`, 'player');
  updatePlayerHp();

  const cry = m.randomCry();
  addLog(`🔥 <span class="log-em">${m.name}</span> ataca <span class="log-em">${player.name}</span> — <span class="log-dmg">-${dmg} HP</span> — "${cry}"`);
  setPlayerMsg(`Atacado por ${m.name}! "${cry}"`);

  if (!player.alive) {
    setTimeout(() => SFX.playerDie(), 80);
    setTimeout(() => flashPlayerEmoji('dead'), 90);
    addLog(`<span class="log-dead">💀 ${player.name} foi derrotado! Game Over!</span>`);
    showOverlay('💀 GAME OVER', 'Você foi derrotado…', false);
  }
}


function showFloat(parentEl, text, cls) {
  const el      = document.createElement('div');
  el.className  = `float-dmg ${cls}`;
  el.textContent = text;
  el.style.left  = (40 + Math.random() * 40) + '%';
  el.style.top   = '30%';
  parentEl.style.position = 'relative';
  parentEl.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function flashMonsterEmoji(idx, type) {
  const m  = monsters[idx];
  const el = document.getElementById(`emoji-${idx}`);
  if (!el) return;

  const newEmoji  = type === 'hurt'   ? m.emojiHurt
                  : type === 'attack' ? m.emojiAttack
                  : m.emojiDead;
  const animClass = type === 'attack' ? 'attack-flash' : 'hurt-flash';

  el.textContent = newEmoji;
  el.classList.remove('hurt-flash', 'attack-flash');
  void el.offsetWidth; 
  el.classList.add(animClass);

  if (type === 'dead') return; 
  setTimeout(() => {
    el.textContent = m.emoji;
    el.classList.remove(animClass);
  }, 520);
}

function flashPlayerEmoji(type) {
  const el = document.getElementById('playerEmoji');
  if (!el) return;

  const newEmoji  = type === 'hurt'   ? player.emojiHurt
                  : type === 'attack' ? player.emojiAttack
                  : player.emojiDead;
  const animClass = type === 'attack' ? 'attack-flash' : 'hurt-flash';

  el.textContent = newEmoji;
  el.classList.remove('hurt-flash', 'attack-flash', 'dead-anim');
  void el.offsetWidth;

  if (type === 'dead') {
    el.classList.add('dead-anim');
    return;
  }
  el.classList.add(animClass);
  setTimeout(() => {
    el.textContent = player.emoji;
    el.classList.remove(animClass);
  }, 560);
}


function addLog(html) {
  const list    = document.getElementById('logList');
  const entry   = document.createElement('div');
  entry.className  = 'log-entry';
  entry.innerHTML  = html;
  list.prepend(entry);
  while (list.children.length > 30) list.lastChild.remove();
}

function setPlayerMsg(msg) {
  document.getElementById('playerMsg').textContent = msg;
}

function checkVictory() {
  if (monsters.every(m => !m.alive)) {
    setTimeout(() => SFX.victory(), 100);
    showOverlay('🏆 VITÓRIA!', 'Todos os inimigos foram derrotados!', true);
  }
}

function showOverlay(title, sub, win) {
  if (!win) setTimeout(() => SFX.gameOver(), 200);
  const overlay = document.getElementById('overlayScreen');
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlayTitle').style.color = win ? '#ffd060' : '#ff3355';
  document.getElementById('overlaySub').textContent   = sub;
  overlay.classList.add('show');
}

function restartGame() { initGame(); }

initGame();
