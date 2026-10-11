/**
 * Elfblade Road - Stage 1 Victory Scene
 * Features Stage Clear fanfare, bonus tally calculations,
 * hero ranking grade (S / A / B / C), and replay option.
 */

class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.score = data.score || 0;
    this.gold = data.gold || 0;
    this.level = data.level || 1;
    this.hp = data.hp || 50;
    this.maxHp = data.maxHp || 100;

    // Calculate bonuses
    this.hpBonus = this.hp * 50;
    this.goldBonus = this.gold * 10;
    this.totalScore = this.score + this.hpBonus + this.goldBonus;

    // Grade calculation
    if (this.totalScore >= 18000) this.rank = 'S';
    else if (this.totalScore >= 12000) this.rank = 'A';
    else if (this.totalScore >= 7000) this.rank = 'B';
    else this.rank = 'C';
  }

  create() {
    this.cameras.main.setBackgroundColor('#080e18');

    // Victory Header
    const title = this.add.text(240, 30, '★ STAGE 1 CLEAR! ★', {
      fontFamily: 'monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#b78103',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    const subTitle = this.add.text(240, 52, 'THE OUTSKIRTS OF MALMORT LIBERATED', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#00e5ff',
      letterSpacing: 1
    }).setOrigin(0.5, 0.5);

    // Showcase Victorious Elf Warrior
    this.add.image(100, 162, 'shadow').setAlpha(0.5);
    const elf = this.add.sprite(100, 162, 'elf');
    elf.setOrigin(0.5, 0.85);
    elf.setScale(1.4);
    elf.play('elf_idle');

    // Confetti / Gold Star Sparkles
    for (let i = 0; i < 10; i++) {
      const spark = this.add.image(Phaser.Math.Between(40, 440), Phaser.Math.Between(30, 220), 'hit_spark', 0);
      spark.setAlpha(0.6);
      this.tweens.add({
        targets: spark,
        y: spark.y - 30,
        alpha: 0,
        duration: 1000 + i * 80,
        repeat: -1
      });
    }

    // Results Card Plaque (UI Kit)
    if (this.textures.exists('panel_dialog')) {
      const plaque = this.add.image(310, 140, 'panel_dialog').setScale(0.195, 0.170);
    } else {
      const box = this.add.graphics();
      box.fillStyle(0x131d2e, 0.9);
      box.fillRoundedRect(165, 75, 290, 130, 6);
      box.lineStyle(2, 0xd4af37, 1);
      box.strokeRoundedRect(165, 75, 290, 130, 6);
    }

    if (this.textures.exists('icon_gold_coin')) {
      const coinDeco = this.add.image(178, 148, 'icon_gold_coin').setScale(0.013);
    }

    const statRows = [
      { label: "BATTLE SCORE:", value: `${this.score}` },
      { label: "VITALITY BONUS:", value: `+${this.hpBonus}` },
      { label: "TREASURE BONUS:", value: `+${this.goldBonus}` },
      { label: "TOTAL SCORE:", value: `${this.totalScore}`, highlight: true }
    ];

    statRows.forEach((row, i) => {
      this.time.delayedCall(250 * (i + 1), () => {
        window.SoundEngine.playItemPickup('coin');
        this.add.text(190, 92 + i * 19, row.label, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: row.highlight ? '#ffd700' : '#c5c6c7',
          fontStyle: row.highlight ? 'bold' : 'normal'
        });

        this.add.text(435, 92 + i * 19, row.value, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: row.highlight ? '#ffd700' : '#ffffff',
          fontStyle: row.highlight ? 'bold' : 'normal'
        }).setOrigin(1, 0);
      });
    });

    // Rank Badge
    this.time.delayedCall(1350, () => {
      window.SoundEngine.playLevelUp();

      const rankBadge = this.add.text(410, 172, `RANK ${this.rank}`, {
        fontFamily: 'monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: this.rank === 'S' ? '#ffd700' : (this.rank === 'A' ? '#00e5ff' : '#69f0ae'),
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5, 0.5);

      this.tweens.add({
        targets: rankBadge,
        scaleX: { from: 2.2, to: 1.0 },
        scaleY: { from: 2.2, to: 1.0 },
        duration: 350,
        ease: 'Back.easeOut'
      });
    });

    // Play Again prompt & Interactive Button
    this.time.delayedCall(1600, () => {
      if (this.textures.exists('button_normal')) {
        this.btnRestart = this.add.image(240, 235, 'button_normal').setScale(0.20, 0.045).setInteractive({ useHandCursor: true });
        this.btnRestart.on('pointerover', () => {
          if (this.textures.exists('button_hover')) this.btnRestart.setTexture('button_hover');
          this.btnRestart.setScale(0.21, 0.048);
        });
        this.btnRestart.on('pointerout', () => {
          this.btnRestart.setTexture('button_normal');
          this.btnRestart.setScale(0.20, 0.045);
        });
        this.btnRestart.on('pointerdown', () => {
          if (this.textures.exists('button_pressed')) this.btnRestart.setTexture('button_pressed');
          if (this.canRestart && !this.hasRestarted) this.restartGame();
        });
      }

      const restartPrompt = this.add.text(240, 235, '► PRESS ATTACK [J / Z] TO PLAY AGAIN ◄', {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5, 0.5);

      this.tweens.add({
        targets: restartPrompt,
        alpha: { from: 1, to: 0.2 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });

      this.canRestart = true;
    });

    // Handle Input to Play Again
    this.canRestart = false;
    this.hasRestarted = false;

    this.input.keyboard.on('keydown', (e) => {
      if (this.canRestart && !this.hasRestarted && (
        e.code === 'KeyJ' || e.code === 'KeyZ' ||
        e.code === 'Space' || e.code === 'Enter'
      )) {
        this.restartGame();
      }
    });

    this.input.on('pointerdown', () => {
      if (this.canRestart && !this.hasRestarted) {
        this.restartGame();
      }
    });
  }

  restartGame() {
    this.hasRestarted = true;
    window.SoundEngine.playSelect();
    this.cameras.main.flash(300, 255, 255, 255);

    this.time.delayedCall(350, () => {
      this.scene.start('TitleScene');
    });
  }
}

window.VictoryScene = VictoryScene;
