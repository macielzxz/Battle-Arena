# ⚔️ Battle Arena

> Projeto de estudo de **Design Patterns** em JavaScript puro — implementando **Singleton** e **Factory Method** em um jogo de batalha com visual gamer, sons procedurais e animações de combate.

---

## 🎮 Demo

Abra o `index.html` diretamente no navegador. Nenhum servidor ou instalação necessária.

```
battle-arena/
├── index.html        ← Ponto de entrada
├── css/
│   └── style.css     ← Estilo completo (tema gamer dark)
└── js/
    ├── sfx.js        ← Motor de sons via Web Audio API
    └── game.js       ← Lógica do jogo + padrões de design
```

---

## 🧩 Padrões de Design Implementados

### Singleton — O Jogador

O personagem do jogador existe como **uma única instância** durante toda a execução. A classe usa um IIFE com closure para garantir que `Player.getInstance()` sempre retorne o mesmo objeto.

```javascript
const Player = (() => {
  let instance = null;

  class PlayerClass {
    constructor() {
      this.name  = 'Arcanus';
      this.maxHp = 300;
      this.hp    = 300;
      this.attack = 45;
      // ...
    }
  }

  return {
    getInstance() {
      if (!instance) instance = new PlayerClass();
      return instance;        // sempre o mesmo objeto
    },
    reset() { instance = null; }
  };
})();
```

**Por que Singleton aqui?**
Em um RPG, o jogador é único. Não faz sentido criar múltiplas instâncias do herói. O padrão garante que qualquer parte do código que chame `Player.getInstance()` acesse o mesmo estado de HP, ataque e defesa.

---

### Factory Method — Os Monstros

A `MonsterFactory` centraliza a criação de monstros. Cada tipo tem suas próprias configurações (stats, emojis de estado, gritos, sons), e novos inimigos podem ser adicionados sem alterar a lógica de combate.

```javascript
class MonsterFactory {
  static types = {
    dragon: { name: 'Dragão das Sombras', maxHp: 220, attack: 60, defense: 15, ... },
    demon:  { name: 'Demônio Abissal',    maxHp: 180, attack: 75, defense: 8,  ... },
    zombie: { name: 'Zumbi Antigo',       maxHp: 260, attack: 35, defense: 5,  ... },
    alien:  { name: 'Alienígena Kral',    maxHp: 200, attack: 55, defense: 12, ... },
  };

  static create(type) {
    const cfg = MonsterFactory.types[type];
    return {
      ...JSON.parse(JSON.stringify(cfg)),
      typeKey: type,
      hp: cfg.maxHp,
      alive: true,
      takeDamage(atk) { ... },
      getHpPercent()  { ... },
    };
  }
}

// Uso:
const monsters = ['dragon', 'demon', 'zombie', 'alien'].map(t =>
  MonsterFactory.create(t)
);
```

**Por que Factory aqui?**
Os 4 monstros compartilham comportamentos (takeDamage, getHpPercent, randomCry), mas têm dados diferentes. A Factory elimina repetição, centraliza a configuração e torna trivial adicionar um novo tipo de inimigo: basta incluir uma entrada no objeto `types`.

---

## 🔊 Sons Procedurais

Todos os sons são gerados em tempo real pela **Web Audio API** — sem arquivos `.mp3` ou `.wav`. O módulo `sfx.js` sintetiza osciladores, envelopes ADSR e noise bursts para criar sons únicos por monstro.

| Evento | Técnica |
|--------|---------|
| Impacto de espada | Noise burst + sweep de sawtooth |
| Grito do Dragão | Sawtooth grave com glide descendente |
| Grito do Demônio | Square agudo dissonante duplo |
| Gemido do Zumbi | Sine grave com vibrato |
| Som do Alienígena | Sine eletrônico com sweep rápido |
| Dano no Jogador | Noise filtrado + triangle descendente |
| Fanfare de Vitória | Sequência ascendente em 4 notas |
| Game Over | Sequência descendente com reverb |

---

## ⚡ Mecânicas

| Ação | Efeito |
|------|--------|
| **ATACAR** | Jogador ataca o monstro — HP do monstro diminui |
| **RECEBER** | Monstro ataca o jogador — HP do jogador diminui |
| Monstro a 0 HP | Overlay "MORTO", card desativado, som de morte |
| Jogador a 0 HP | Tela de **GAME OVER** |
| Todos morrem | Tela de **VITÓRIA** com fanfare |

### Fórmula de dano
```javascript
// Monstro recebendo dano
const dano = Math.max(1, playerAtk - monsterDef + Math.floor(Math.random() * 15));

// Jogador recebendo dano
const dano = Math.max(1, monsterAtk - playerDef + Math.floor(Math.random() * 10));
```

---

## 🎨 Features Visuais

- Barras de HP dinâmicas: verde → amarelo → vermelho piscando
- Emojis de estado: idle / ataque / dano / morte (por monstro e por jogador)
- Números de dano flutuantes animados
- Animações de tremor (hit) e pulso (ataque)
- Log de batalha em tempo real com histórico
- Overlay de fim de jogo com botão de reinício

---

## 🚀 Como Rodar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/battle-arena.git

# Abra no navegador
cd battle-arena
open index.html   # macOS
# ou arraste o arquivo para o navegador
```

Nenhuma dependência. Nenhum build. JavaScript puro no navegador.

---

## 🛠️ Tecnologias

- **HTML5** — estrutura semântica
- **CSS3** — variáveis, animações, keyframes, grid layout
- **JavaScript ES2022** — classes, static fields, IIFE, closures, destructuring
- **Web Audio API** — síntese de áudio procedural em tempo real
- **Google Fonts** — Cinzel Decorative, Rajdhani, Orbitron

---

## 📐 Conceitos de JS Demonstrados

- `IIFE` para encapsulamento do Singleton
- `static` class fields na Factory
- `JSON.parse(JSON.stringify(...))` para deep clone de configuração
- Closures para estado privado
- Template literals para geração de HTML dinâmico
- `void el.offsetWidth` para forçar reflow e reiniciar animações CSS

---

## 📄 Licença

MIT — sinta-se livre para estudar, modificar e usar como referência.
