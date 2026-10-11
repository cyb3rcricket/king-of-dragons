/**
 * Untitled Dragon Brawler - Retro Arcade Title Scene
 * Featuring parallax background demo, animated Elf Warrior preview,
 * authentic 16-bit arcade styling, and controls tutorial.
 */

class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    // Start Title BGM
    window.SoundEngine.playBGM('title');

    // Parallax Demo Backgrounds
    this.bgSky = this.add.tileSprite(240, 135, 480, 270, 'bg_sky');
    this.bgForest = this.add.tileSprite(240, 135, 480, 270, 'bg_forest');
    this.bgGround = this.add.tileSprite(240, 135, 480, 270, 'bg_ground');

    // Dark overlay for title contrast
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0c14, 0.45);
    overlay.fillRect(0, 0, 480, 270);

    // Heraldry Icons flanking Title (UI Kit)
    if (this.textures.exists('icon_sword')) {
      const swordHerald = this.add.image(55, 60, 'icon_sword').setScale(0.036).setAngle(-18);
      this.tweens.add({
        targets: swordHerald,
        y: 56,
        angle: -14,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    if (this.textures.exists('icon_shield')) {
      const shieldHerald = this.add.image(425, 60, 'icon_shield').setScale(0.036).setAngle(15);
      this.tweens.add({
        targets: shieldHerald,
        y: 56,
        angle: 18,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Title Logo & Marquee
    const marqueeText = this.add.text(240, 28, '★ 16-BIT ARCADE HOMAGE ★', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#00e5ff',
      letterSpacing: 2
    }).setOrigin(0.5, 0.5);

    const mainTitle = this.add.text(240, 58, 'UNTITLED DRAGON BRAWLER', {
      fontFamily: 'monospace',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#8b4513',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    // Title Pulse tween
    this.tweens.add({
      targets: mainTitle,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const subTitle = this.add.text(240, 83, 'ELVEN RETRIBUTION • STAGE 1', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e74c3c',
      letterSpacing: 3
    }).setOrigin(0.5, 0.5);

    // Showcase Elf Warrior Sprite
    const showcaseShadow = this.add.image(240, 172, 'shadow');
    showcaseShadow.setAlpha(0.6);
    showcaseShadow.setScale(1.0);
    this.showcaseElf = this.add.sprite(240, 170, 'elf');
    this.showcaseElf.setOrigin(0.5, 0.85);
    this.showcaseElf.setScale(1.3);
    this.showcaseElf.play('elf_walk');

    // Interactive Start Button
    if (this.textures.exists('button_normal')) {
      this.btnStart = this.add.image(240, 195, 'button_normal').setScale(0.19, 0.045).setInteractive({ useHandCursor: true });
      this.btnStart.on('pointerover', () => {
        if (this.textures.exists('button_hover')) this.btnStart.setTexture('button_hover');
        this.btnStart.setScale(0.20, 0.048);
      });
      this.btnStart.on('pointerout', () => {
        this.btnStart.setTexture('button_normal');
        this.btnStart.setScale(0.19, 0.045);
      });
      this.btnStart.on('pointerdown', () => {
        if (this.textures.exists('button_pressed')) this.btnStart.setTexture('button_pressed');
        window.SoundEngine.init();
        if (!this.hasStarted) this.startGame();
      });
    }

    // Flashing "PRESS ATTACK OR CLICK TO START"
    this.startPrompt = this.add.text(240, 195, '► PRESS ATTACK [J / Z] OR CLICK TO START ◄', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: this.startPrompt,
      alpha: { from: 1, to: 0.2 },
      duration: 450,
      yoyo: true,
      repeat: -1
    });

    // Controls Legend Plaque at Bottom
    if (this.textures.exists('panel_dialog')) {
      const plaque = this.add.image(240, 240, 'panel_dialog').setScale(0.265, 0.055);
    } else {
      const box = this.add.graphics();
      box.fillStyle(0x0f141d, 0.85);
      box.fillRoundedRect(40, 218, 400, 44, 4);
      box.lineStyle(1, 0x4a5568, 1);
      box.strokeRoundedRect(40, 218, 400, 44, 4);
    }

    this.add.text(240, 231, '[WASD / ARROWS] Move   [J / Z] 3-Hit Combo   [K / X] Jump Attack', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#c5c6c7'
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 247, '[SPACE / SHIFT] Shield Guard    [L / C] Magic Storm    [T] CRT Mode', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5);

    // Handle Input to Start Game
    this.hasStarted = false;

    this.input.keyboard.on('keydown', (event) => {
      // Initialize audio on first keystroke
      window.SoundEngine.init();

      if (!this.hasStarted && (
        event.code === 'KeyJ' || event.code === 'KeyZ' ||
        event.code === 'Space' || event.code === 'Enter' ||
        event.code === 'KeyK' || event.code === 'KeyX'
      )) {
        this.startGame();
      }
    });

    this.input.on('pointerdown', () => {
      window.SoundEngine.init();
      if (!this.hasStarted) {
        this.startGame();
      }
    });
  }

  update(time, delta) {
    // Parallax background gentle scroll
    this.bgSky.tilePositionX += 0.15;
    this.bgForest.tilePositionX += 0.45;
    this.bgGround.tilePositionX += 0.8;
  }

  startGame() {
    this.hasStarted = true;
    window.SoundEngine.playSelect();

    // Flash screen white
    this.cameras.main.flash(350, 255, 255, 255);

    this.time.delayedCall(400, () => {
      window.SoundEngine.stopBGM();
      this.scene.start('GameScene');
    });
  }
}

window.TitleScene = TitleScene;
