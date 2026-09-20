/**
 * The King of Dragons - Game Over / Continue Scene
 * Retro arcade game over screen with score tally and restart countdown.
 */

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalGold = data.gold || 0;
    this.finalLevel = data.level || 1;
  }

  create() {
    this.cameras.main.setBackgroundColor('#050608');

    // "GAME OVER" Header
    const title = this.add.text(240, 65, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#d50000',
      stroke: '#3e2723',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Defeat Heraldry (Tilted sword)
    if (this.textures.exists('icon_sword')) {
      const sword = this.add.image(100, 65, 'icon_sword').setScale(0.032).setAngle(135).setTint(0x757575);
    }
    if (this.textures.exists('icon_shield')) {
      const shield = this.add.image(380, 65, 'icon_shield').setScale(0.032).setAngle(-25).setTint(0x757575);
    }

    // Score Summary Plaque (Warcraft Kit)
    if (this.textures.exists('panel_dialog')) {
      const plaque = this.add.image(240, 142, 'panel_dialog').setScale(0.20, 0.115);
    } else {
      const box = this.add.graphics();
      box.fillStyle(0x141824, 0.85);
      box.fillRoundedRect(90, 105, 300, 75, 6);
      box.lineStyle(1, 0x4a5568, 1);
      box.strokeRoundedRect(90, 105, 300, 75, 6);
    }

    this.add.text(240, 122, `FINAL SCORE: ${this.finalScore.toString().padStart(6, '0')}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 142, `GOLD COLLECTED: ${this.finalGold} G`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 162, `HERO RANK: ELF WARRIOR LV.${this.finalLevel}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#00e5ff'
    }).setOrigin(0.5, 0.5);

    // Interactive Retry Button
    if (this.textures.exists('button_normal')) {
      this.btnRetry = this.add.image(240, 215, 'button_normal').setScale(0.19, 0.045).setInteractive({ useHandCursor: true });
      this.btnRetry.on('pointerover', () => {
        if (this.textures.exists('button_hover')) this.btnRetry.setTexture('button_hover');
        this.btnRetry.setScale(0.20, 0.048);
      });
      this.btnRetry.on('pointerout', () => {
        this.btnRetry.setTexture('button_normal');
        this.btnRetry.setScale(0.19, 0.045);
      });
      this.btnRetry.on('pointerdown', () => {
        if (this.textures.exists('button_pressed')) this.btnRetry.setTexture('button_pressed');
        if (!this.hasRestarted) this.restartGame();
      });
    }

    // Continue / Restart prompt
    this.continueText = this.add.text(240, 215, '► RETRY [J / Z] ◄', {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: this.continueText,
      alpha: { from: 1, to: 0.2 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    // Input to retry
    this.hasRestarted = false;

    this.input.keyboard.on('keydown', (e) => {
      if (!this.hasRestarted && (
        e.code === 'KeyJ' || e.code === 'KeyZ' ||
        e.code === 'Space' || e.code === 'Enter'
      )) {
        this.restartGame();
      }
    });

    this.input.on('pointerdown', () => {
      if (!this.hasRestarted) {
        this.restartGame();
      }
    });
  }

  restartGame() {
    this.hasRestarted = true;
    window.SoundEngine.playSelect();
    this.cameras.main.flash(300, 255, 255, 255);

    this.time.delayedCall(350, () => {
      this.scene.start('GameScene');
    });
  }
}

window.GameOverScene = GameOverScene;
