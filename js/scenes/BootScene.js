/**
 * Elfblade Road - Boot & Asset Preload Scene
 * Runs procedural 16-bit pixel art asset generation, sets up sprite animations,
 * displays a retro arcade self-test screen, and transitions to TitleScene.
 */

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Preload high-res UI Kit graphical assets
    const kitAssets = [
      { key: 'prop_barrel', path: 'ui_kit/prop_barrel.png' },
      { key: 'prop_crate', path: 'ui_kit/prop_crate.png' },
      { key: 'prop_chest', path: 'ui_kit/prop_chest.png' },
      { key: 'prop_chair', path: 'ui_kit/prop_chair.png' },
      { key: 'prop_table', path: 'ui_kit/prop_table.png' },
      { key: 'prop_lantern', path: 'ui_kit/prop_lantern.png' },
      { key: 'prop_plant', path: 'ui_kit/prop_plant.png' },
      { key: 'icon_gold_coin', path: 'ui_kit/icon_gold_coin.png' },
      { key: 'icon_health_potion', path: 'ui_kit/icon_health_potion.png' },
      { key: 'icon_mana_potion', path: 'ui_kit/icon_mana_potion.png' },
      { key: 'icon_sword', path: 'ui_kit/icon_sword.png' },
      { key: 'icon_shield', path: 'ui_kit/icon_shield.png' },
      { key: 'icon_scroll', path: 'ui_kit/icon_scroll.png' },
      { key: 'icon_wood_logs', path: 'ui_kit/icon_wood_logs.png' },
      { key: 'icon_iron_ore', path: 'ui_kit/icon_iron_ore.png' },
      { key: 'panel_dialog', path: 'ui_kit/panel_dialog.png' },
      { key: 'bar_frame', path: 'ui_kit/bar_frame.png' },
      { key: 'bar_fill', path: 'ui_kit/bar_fill.png' },
      { key: 'button_normal', path: 'ui_kit/button_normal.png' },
      { key: 'button_hover', path: 'ui_kit/button_hover.png' },
      { key: 'button_pressed', path: 'ui_kit/button_pressed.png' }
    ];

    kitAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  create() {
    // 1. Arcade Boot Visuals
    this.cameras.main.setBackgroundColor('#050608');

    const titleText = this.add.text(240, 80, 'ELFBLADE ROAD', {
      fontFamily: 'monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5);

    const subText = this.add.text(240, 104, '16-BIT RETRO HARDWARE INIT...', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#00e5ff'
    }).setOrigin(0.5, 0.5);

    const checkList = [
      "VRAM 64KB OK",
      "CHIPTUNE SOUND ENGINE OK",
      "PIXEL PROCEDURAL SPRITES LOADED",
      "HD UI TEXTURE PACK LOADED",
      "PARALLAX BELT-SCROLL ENGINE READY"
    ];

    checkList.forEach((msg, idx) => {
      this.time.delayedCall(100 * idx, () => {
        this.add.text(240, 130 + idx * 16, msg, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#69f0ae'
        }).setOrigin(0.5, 0.5);
      });
    });

    // 2. Generate all procedural textures
    const generator = new AssetGenerator(this);
    generator.generateAll();

    // 3. Register all Phaser sprite animations
    this.registerAnimations();

    // 4. Transition to TitleScene after boot sequence
    this.time.delayedCall(800, () => {
      this.scene.start('TitleScene');
    });
  }

  registerAnimations() {
    // Elf Animations
    this.anims.create({
      key: 'elf_idle',
      frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'elf_walk',
      frames: this.anims.generateFrameNumbers('elf', { start: 4, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'elf_attack1',
      frames: this.anims.generateFrameNumbers('elf', { start: 10, end: 12 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'elf_attack2',
      frames: this.anims.generateFrameNumbers('elf', { start: 13, end: 15 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'elf_attack3',
      frames: this.anims.generateFrameNumbers('elf', { start: 16, end: 19 }),
      frameRate: 14,
      repeat: 0
    });

    this.anims.create({
      key: 'elf_jump',
      frames: this.anims.generateFrameNumbers('elf', { start: 20, end: 21 }),
      frameRate: 6,
      repeat: 0
    });

    this.anims.create({
      key: 'elf_jump_attack',
      frames: this.anims.generateFrameNumbers('elf', { start: 22, end: 23 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'elf_guard',
      frames: this.anims.generateFrameNumbers('elf', { start: 24, end: 25 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'elf_magic',
      frames: this.anims.generateFrameNumbers('elf', { start: 26, end: 29 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'elf_hurt',
      frames: this.anims.generateFrameNumbers('elf', { start: 30, end: 31 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'elf_die',
      frames: this.anims.generateFrameNumbers('elf', { start: 32, end: 35 }),
      frameRate: 6,
      repeat: 0
    });

    // Goblin Animations
    this.anims.create({
      key: 'goblin_idle',
      frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 0 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_walk',
      frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_attack',
      frames: this.anims.generateFrameNumbers('goblin', { start: 4, end: 6 }),
      frameRate: 9,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_hurt',
      frames: this.anims.generateFrameNumbers('goblin', { start: 7, end: 8 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_die',
      frames: this.anims.generateFrameNumbers('goblin', { start: 9, end: 12 }),
      frameRate: 7,
      repeat: 0
    });

    // Orc Animations
    this.anims.create({
      key: 'orc_idle',
      frames: this.anims.generateFrameNumbers('orc', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'orc_walk',
      frames: this.anims.generateFrameNumbers('orc', { start: 2, end: 5 }),
      frameRate: 7,
      repeat: -1
    });

    this.anims.create({
      key: 'orc_attack',
      frames: this.anims.generateFrameNumbers('orc', { start: 6, end: 9 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'orc_charge',
      frames: this.anims.generateFrameNumbers('orc', { start: 10, end: 12 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'orc_hurt',
      frames: this.anims.generateFrameNumbers('orc', { start: 13, end: 14 }),
      frameRate: 7,
      repeat: 0
    });

    this.anims.create({
      key: 'orc_die',
      frames: this.anims.generateFrameNumbers('orc', { start: 15, end: 18 }),
      frameRate: 6,
      repeat: 0
    });

    // Boss Animations
    this.anims.create({
      key: 'boss_idle',
      frames: this.anims.generateFrameNumbers('boss', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'boss_walk',
      frames: this.anims.generateFrameNumbers('boss', { start: 2, end: 5 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'boss_swing',
      frames: this.anims.generateFrameNumbers('boss', { start: 6, end: 9 }),
      frameRate: 7,
      repeat: 0
    });

    this.anims.create({
      key: 'boss_smash',
      frames: this.anims.generateFrameNumbers('boss', { start: 10, end: 14 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'boss_hurt',
      frames: this.anims.generateFrameNumbers('boss', { start: 15, end: 16 }),
      frameRate: 6,
      repeat: 0
    });

    this.anims.create({
      key: 'boss_die',
      frames: this.anims.generateFrameNumbers('boss', { start: 17, end: 21 }),
      frameRate: 5,
      repeat: 0
    });

    // VFX Animations
    this.anims.create({
      key: 'anim_hit_spark',
      frames: this.anims.generateFrameNumbers('hit_spark', { start: 0, end: 2 }),
      frameRate: 18,
      repeat: 0
    });

    this.anims.create({
      key: 'anim_guard_spark',
      frames: this.anims.generateFrameNumbers('guard_spark', { start: 0, end: 1 }),
      frameRate: 16,
      repeat: 0
    });

    this.anims.create({
      key: 'anim_dust_puff',
      frames: this.anims.generateFrameNumbers('dust_puff', { start: 0, end: 2 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'anim_coin',
      frames: this.anims.generateFrameNumbers('pickups', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  }
}

window.BootScene = BootScene;
