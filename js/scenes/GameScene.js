/**
 * Elfblade Road - Core Gameplay Scene (Stage 1)
 * "The Outskirts of Malmort: Ancient Forest & Ruined Fortress Gate"
 * Manages 2.5D belt-scroll progression, wave triggers, enemy spawners,
 * camera locking, barrel breakables, item drops, hitstop, and boss encounter.
 */

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // 1. World Dimensions & Bounds
    this.worldWidth = 2400;
    this.worldHeight = 270;
    this.physics = null; // Pure custom 2.5D coordinate physics for authentic arcade feel

    // 2. Parallax Background Layers
    this.bgSky = this.add.tileSprite(0, 0, 480, 270, 'bg_sky').setOrigin(0, 0).setScrollFactor(0);
    this.bgForest = this.add.tileSprite(0, 0, 480, 270, 'bg_forest').setOrigin(0, 0).setScrollFactor(0);
    
    // Tiled Ground over entire world width
    this.bgGround = this.add.tileSprite(0, 0, this.worldWidth, 270, 'bg_ground').setOrigin(0, 0);
    this.bgGround.depth = 10;

    // 3. Camera Setup & Boundaries
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameraLockMaxX = 480; // Current section right edge lock
    this.cameras.main.setScroll(0, 0);

    // 4. Initialize Entities Arrays
    this.enemies = [];
    this.barrels = [];
    this.pickups = [];

    // 5. Spawn Player Character (Female Elf Warrior)
    this.player = new Player(this, 80, 210);

    // Camera follow player with horizontal smoothing
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setFollowOffset(-40, 0);

    // 6. UI: HUD and VirtualPad
    this.hud = new HUD(this);
    this.virtualPad = new VirtualPad(this);

    // 7. Input Keyboard Setup
    this.setupKeyboardInput();

    // 8. Wave Progression State
    this.currentWave = 1;
    this.waveState = 'IN_PROGRESS'; // 'IN_PROGRESS', 'CLEARED'
    this.boss = null;
    this.isBossWave = false;

    // 9. Hitstop Freeze State
    this.isHitstop = false;

    // 10. Atmospheric Scenery Props (Lanterns, Outposts, Planters)
    this.spawnSceneryProps();

    // 11. Start Stage 1 BGM & Spawn Wave 1
    window.SoundEngine.playBGM('stage1');
    this.spawnWave1();

    // Stage 1 Intro Banner
    this.showStageIntro();
  }

  setupKeyboardInput() {
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      upArr: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      downArr: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      leftArr: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      rightArr: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      attackJ: Phaser.Input.Keyboard.KeyCodes.J,
      attackZ: Phaser.Input.Keyboard.KeyCodes.Z,
      jumpK: Phaser.Input.Keyboard.KeyCodes.K,
      jumpX: Phaser.Input.Keyboard.KeyCodes.X,
      guardSpace: Phaser.Input.Keyboard.KeyCodes.SPACE,
      guardShift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      magicL: Phaser.Input.Keyboard.KeyCodes.L,
      magicC: Phaser.Input.Keyboard.KeyCodes.C,
      crt: Phaser.Input.Keyboard.KeyCodes.T,
      mute: Phaser.Input.Keyboard.KeyCodes.M
    });

    // Toggle CRT Scanlines
    this.keys.crt.on('down', () => {
      const crt = document.getElementById('crt-overlay');
      const btn = document.getElementById('btn-crt');
      if (crt) {
        crt.classList.toggle('crt-on');
        const isOn = crt.classList.contains('crt-on');
        if (btn) btn.textContent = isOn ? 'CRT: ON' : 'CRT: OFF';
      }
    });

    // Toggle Audio Mute
    this.keys.mute.on('down', () => {
      window.SoundEngine.toggleMute();
    });
  }

  showStageIntro() {
    let panel = null;
    if (this.textures.exists('panel_dialog')) {
      panel = this.add.image(240, 100, 'panel_dialog').setScale(0.24, 0.058).setScrollFactor(0).setDepth(10000);
    }

    const introText = this.add.text(240, 100, 'STAGE 1: THE OUTSKIRTS OF MALMORT', {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(10001);

    this.tweens.add({
      targets: [introText, panel].filter(Boolean),
      alpha: 0,
      duration: 1000,
      delay: 2200,
      onComplete: () => {
        introText.destroy();
        if (panel) panel.destroy();
      }
    });
  }

  // ==========================================
  // SCENERY & ATMOSPHERIC PROPS
  // ==========================================
  spawnSceneryProps() {
    // 1. Ancient Planters & Wild Mushrooms along forest tree line
    const plantCoords = [
      { x: 150, y: 168 },
      { x: 490, y: 166 },
      { x: 840, y: 168 },
      { x: 1180, y: 170 },
      { x: 1460, y: 168 },
      { x: 1780, y: 170 },
      { x: 2180, y: 168 }
    ];

    plantCoords.forEach(pt => {
      if (this.textures.exists('prop_plant')) {
        const shd = this.add.image(pt.x, pt.y, 'shadow').setScale(0.55, 0.35).setAlpha(0.4);
        shd.depth = pt.y - 1;
        const pl = this.add.image(pt.x, pt.y, 'prop_plant').setScale(0.033).setOrigin(0.5, 0.88);
        pl.depth = pt.y;
      }
    });

    // 2. Ruined Camp Outposts (Tables & Chairs)
    const camps = [
      { x: 280, y: 180 },
      { x: 1040, y: 182 }
    ];

    camps.forEach(camp => {
      if (this.textures.exists('prop_table')) {
        const tblShd = this.add.image(camp.x, camp.y, 'shadow').setScale(0.8, 0.45).setAlpha(0.45);
        tblShd.depth = camp.y - 1;
        const tbl = this.add.image(camp.x, camp.y, 'prop_table').setScale(0.038).setOrigin(0.5, 0.85);
        tbl.depth = camp.y;

        if (this.textures.exists('prop_chair')) {
          const c1 = this.add.image(camp.x - 24, camp.y - 2, 'prop_chair').setScale(0.030).setOrigin(0.5, 0.90);
          c1.depth = camp.y - 1;
          const c2 = this.add.image(camp.x + 24, camp.y - 2, 'prop_chair').setScale(0.030).setOrigin(0.5, 0.90);
          c2.setFlipX(true);
          c2.depth = camp.y - 1;
        }

        // Lantern on the table
        this.spawnLantern(camp.x, camp.y - 22, 181);
      }
    });

    // 3. Additional Atmospheric Hanging/Post Lanterns
    const lanternCoords = [
      { x: 640, y: 172 },
      { x: 1380, y: 172 },
      { x: 1720, y: 170 },
      { x: 2240, y: 170 }
    ];

    lanternCoords.forEach(l => {
      this.spawnLantern(l.x, l.y, l.y);
    });
  }

  spawnLantern(x, y, depth) {
    if (!this.textures.exists('prop_lantern')) return;

    const lantern = this.add.image(x, y, 'prop_lantern').setScale(0.026).setOrigin(0.5, 0.88);
    lantern.depth = depth;

    // Glowing warm flickering light aura
    const aura = this.add.graphics();
    aura.fillStyle(0xffaa22, 0.24);
    aura.fillCircle(0, 0, 34);
    aura.fillStyle(0xffd54f, 0.18);
    aura.fillCircle(0, 0, 18);
    aura.fillStyle(0xffffff, 0.22);
    aura.fillCircle(0, 0, 6);
    aura.setPosition(x, y - 14);
    aura.setBlendMode(Phaser.BlendModes.ADD);
    aura.depth = depth - 1;

    this.tweens.add({
      targets: aura,
      alpha: { from: 0.16, to: 0.38 },
      scaleX: { from: 0.92, to: 1.14 },
      scaleY: { from: 0.92, to: 1.14 },
      duration: Phaser.Math.Between(320, 520),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    if (this.isHitstop) return;

    // 1. Gather Input (Keyboard + VirtualPad)
    const input = this.collectInput();

    // 2. Update Player
    if (this.player) {
      this.player.update(delta, input);
    }

    // 3. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy && enemy.isAlive()) {
        enemy.update(delta, this.player);
      }
    }

    // 4. Update Pickups (Proximity Collection)
    this.updatePickups();

    // 5. Update Camera Section Lock & Parallax
    this.updateCameraBounds();

    // 6. Update Parallax Background Offsets
    this.bgSky.tilePositionX = this.cameras.main.scrollX * 0.12;
    this.bgForest.tilePositionX = this.cameras.main.scrollX * 0.45;

    // 7. Check Wave Progression
    this.checkWaveProgress();

    // 8. Update HUD
    if (this.hud) {
      this.hud.update(this.player, this.boss);
    }

    // Reset Virtual Pad one-shot triggers
    this.virtualPad.resetJustPressed();
  }

  collectInput() {
    const k = this.keys;
    const vp = this.virtualPad.state;

    return {
      left: k.left.isDown || k.leftArr.isDown || vp.left,
      right: k.right.isDown || k.rightArr.isDown || vp.right,
      up: k.up.isDown || k.upArr.isDown || vp.up,
      down: k.down.isDown || k.downArr.isDown || vp.down,
      attackJustPressed: Phaser.Input.Keyboard.JustDown(k.attackJ) || Phaser.Input.Keyboard.JustDown(k.attackZ) || vp.attackJustPressed,
      jumpJustPressed: Phaser.Input.Keyboard.JustDown(k.jumpK) || Phaser.Input.Keyboard.JustDown(k.jumpX) || vp.jumpJustPressed,
      guard: k.guardSpace.isDown || k.guardShift.isDown || vp.guard,
      magicJustPressed: Phaser.Input.Keyboard.JustDown(k.magicL) || Phaser.Input.Keyboard.JustDown(k.magicC) || vp.magicJustPressed
    };
  }

  // Camera Section Lock Manager
  updateCameraBounds() {
    const cam = this.cameras.main;
    // Lock camera so it cannot scroll past current section limit while wave is active
    if (cam.scrollX + cam.width > this.cameraLockMaxX) {
      cam.scrollX = this.cameraLockMaxX - cam.width;
    }
  }

  checkWaveProgress() {
    // Check if all enemies in current wave are dead
    const aliveEnemies = this.enemies.filter(e => e && e.isAlive());

    if (aliveEnemies.length === 0 && this.waveState === 'IN_PROGRESS') {
      this.waveState = 'CLEARED';
      this.hud.setGoVisible(true);

      // Unlock next section
      if (this.currentWave === 1) {
        this.cameraLockMaxX = 1000;
      } else if (this.currentWave === 2) {
        this.cameraLockMaxX = 1550;
      } else if (this.currentWave === 3) {
        this.cameraLockMaxX = 2100;
      }
    }

    // Trigger next wave once player moves into next section
    if (this.waveState === 'CLEARED') {
      if (this.currentWave === 1 && this.player.x > 540) {
        this.currentWave = 2;
        this.waveState = 'IN_PROGRESS';
        this.hud.setGoVisible(false);
        this.spawnWave2();
      } else if (this.currentWave === 2 && this.player.x > 1060) {
        this.currentWave = 3;
        this.waveState = 'IN_PROGRESS';
        this.hud.setGoVisible(false);
        this.spawnWave3();
      } else if (this.currentWave === 3 && this.player.x > 1620) {
        this.currentWave = 4;
        this.waveState = 'IN_PROGRESS';
        this.hud.setGoVisible(false);
        this.isBossWave = true;
        this.startBossEncounter();
      }
    }
  }

  // ==========================================
  // WAVE SPAWNERS
  // ==========================================

  // Wave 1: 3 Goblins emerging from the forest + Intro Crate
  spawnWave1() {
    this.spawnBreakable(240, 230, 'crate', [{ type: 'coin', value: 25 }]);

    this.time.delayedCall(600, () => {
      this.enemies.push(new Goblin(this, 380, 185));
      this.enemies.push(new Goblin(this, 430, 220));
      this.enemies.push(new Goblin(this, 460, 250));
    });
  }

  // Wave 2: 2 Goblins + 1 Heavy Orc + Breakables (Barrel, Crate, Treasure Chest!)
  spawnWave2() {
    this.spawnBreakable(750, 190, 'barrel', [{ type: 'meat', value: 50 }]);
    this.spawnBreakable(840, 240, 'crate', [{ type: 'wood_logs', value: 80 }]);
    this.spawnBreakable(680, 210, 'chest', [
      { type: 'coin', value: 30 },
      { type: 'sword', value: 1 },
      { type: 'gem_blue', value: 40 }
    ]);

    this.time.delayedCall(400, () => {
      this.enemies.push(new Goblin(this, 880, 180));
      this.enemies.push(new Goblin(this, 940, 230));
      this.enemies.push(new Orc(this, 980, 210));
    });
  }

  // Wave 3: 3 Orcs + 2 Goblins charging from both flanks + Armory Chest
  spawnWave3() {
    this.spawnBreakable(1260, 185, 'barrel', [{ type: 'potion', value: 1 }]);
    this.spawnBreakable(1350, 245, 'crate', [{ type: 'iron_ore', value: 150 }]);
    this.spawnBreakable(1460, 200, 'chest', [
      { type: 'coin', value: 50 },
      { type: 'shield', value: 1 },
      { type: 'meat', value: 50 }
    ]);

    this.time.delayedCall(300, () => {
      // Flanking from left
      this.enemies.push(new Goblin(this, this.cameras.main.scrollX - 20, 180));
      // Front assault
      this.enemies.push(new Orc(this, 1380, 190));
      this.enemies.push(new Orc(this, 1440, 240));
      this.enemies.push(new Goblin(this, 1490, 215));
      this.enemies.push(new Orc(this, 1540, 200));
    });
  }

  // Boss Encounter: Orc Warlord Gorgok + Secret Ancient Relic Chest
  startBossEncounter() {
    // Lock camera into boss arena
    this.cameraLockMaxX = 2100;
    this.cameras.main.setBounds(1620, 0, 480, this.worldHeight);

    // Ancient relic chest at far end of fortress gate
    this.spawnBreakable(2260, 215, 'chest', [
      { type: 'scroll', value: 1 },
      { type: 'gem_red', value: 150 }
    ]);

    // Flashing WARNING banner
    this.hud.showBossWarning(() => {
      // Start Boss Battle BGM
      window.SoundEngine.playBGM('boss');

      // Heavy footsteps screen shake as Gorgok enters
      for (let i = 0; i < 4; i++) {
        this.time.delayedCall(i * 350, () => {
          this.cameras.main.shake(160, 0.008);
          window.SoundEngine.playHit(true);
        });
      }

      // Spawn Boss
      this.time.delayedCall(1400, () => {
        this.boss = new Boss(this, 2020, 215);
        this.enemies.push(this.boss);
      });
    });
  }

  // Minions summoned during Boss Berserk rage phase
  spawnEnrageMinions() {
    this.time.delayedCall(400, () => {
      const g1 = new Goblin(this, this.cameras.main.scrollX + 20, 185);
      const g2 = new Goblin(this, this.cameras.main.scrollX + 460, 245);
      this.enemies.push(g1);
      this.enemies.push(g2);
    });
  }

  // ==========================================
  // BREAKABLE BARRELS, CRATES & CHESTS
  // ==========================================

  spawnBreakable(x, y, propType = 'barrel', loot = [{ type: 'coin', value: 30 }]) {
    let sprite;
    let hp = 2;
    const isChest = (propType === 'chest');
    const isCrate = (propType === 'crate');
    if (isChest) hp = 3;

    const shadow = this.add.image(x, y, 'shadow').setScale(isChest ? 0.75 : 0.6, 0.4).setAlpha(0.4);
    shadow.depth = y - 1;

    if (isChest && this.textures.exists('prop_chest')) {
      sprite = this.add.image(x, y, 'prop_chest').setScale(0.035).setOrigin(0.5, 0.84);
    } else if (isCrate && this.textures.exists('prop_crate')) {
      sprite = this.add.image(x, y, 'prop_crate').setScale(0.034).setOrigin(0.5, 0.88);
    } else if (this.textures.exists('prop_barrel')) {
      sprite = this.add.image(x, y, 'prop_barrel').setScale(0.035).setOrigin(0.5, 0.85);
    } else {
      sprite = this.add.sprite(x, y - 10, 'barrel', 0);
    }

    sprite.depth = y;

    const prop = {
      x: x,
      groundY: y,
      hp: hp,
      broken: false,
      propType: propType,
      loot: loot,
      lootType: loot[0]?.type || 'coin',
      lootValue: loot[0]?.value || 30,
      sprite: sprite,
      shadow: shadow,
      hitBarrel: function() {
        if (this.broken) return;
        this.hp--;
        if (this.hp > 0) {
          // Subtle wobble on impact
          this.scene.tweens.add({
            targets: this.sprite,
            angle: { from: -5, to: 5 },
            duration: 60,
            yoyo: true,
            repeat: 1,
            onComplete: () => { this.sprite.angle = 0; }
          });
          if (this.sprite.setFrame) {
            this.sprite.setFrame(1);
          }
        } else {
          this.breakBarrel();
        }
      },
      breakBarrel: () => {
        if (prop.broken) return;
        prop.broken = true;
        window.SoundEngine.playBarrelBreak();

        if (prop.sprite.setFrame) {
          prop.sprite.setFrame(2);
          prop.sprite.depth = prop.groundY - 1;
        } else {
          this.tweens.add({
            targets: prop.sprite,
            alpha: 0,
            scaleY: 0.01,
            duration: 250,
            onComplete: () => {
              prop.sprite.destroy();
              if (prop.shadow) prop.shadow.destroy();
            }
          });
        }

        // Spawn splinter / metal debris particles
        const numParticles = isChest ? 9 : 6;
        const debrisColor = isChest ? 0xd4af37 : (isCrate ? 0x795548 : 0x8d6e63);
        for (let i = 0; i < numParticles; i++) {
          const wood = this.add.graphics();
          wood.fillStyle(debrisColor, 1.0);
          wood.fillRect(prop.x, prop.groundY - 14, Phaser.Math.Between(3, 6), Phaser.Math.Between(2, 4));
          wood.depth = prop.groundY + 2;
          this.tweens.add({
            targets: wood,
            x: prop.x + Phaser.Math.Between(-35, 35),
            y: prop.groundY - Phaser.Math.Between(15, 45),
            alpha: 0,
            duration: 450 + i * 30,
            onComplete: () => wood.destroy()
          });
        }

        if (isChest) {
          // Golden sparkle burst for treasure chest!
          for (let j = 0; j < 8; j++) {
            const spark = this.add.image(prop.x + Phaser.Math.Between(-15, 15), prop.groundY - 18, 'hit_spark', 0);
            spark.depth = 999;
            spark.setTint(0xffd700);
            this.tweens.add({
              targets: spark,
              y: spark.y - 30,
              alpha: 0,
              scale: 1.4,
              duration: 500 + j * 40,
              onComplete: () => spark.destroy()
            });
          }
          this.hud.showFloatingText(prop.x, prop.groundY - 28, "TREASURE OPENED!", "#ffd700");
          window.SoundEngine.playLevelUp();
        }

        // Drop contents
        if (Array.isArray(prop.loot)) {
          prop.loot.forEach((item, idx) => {
            const spreadX = prop.x + (idx - (prop.loot.length - 1) / 2) * 20;
            const spreadY = Phaser.Math.Clamp(prop.groundY + Phaser.Math.Between(-8, 8), 165, 260);
            this.spawnPickup(spreadX, spreadY, item.type, item.value);
          });
        } else if (prop.lootType) {
          this.spawnPickup(prop.x, prop.groundY, prop.lootType, prop.lootValue);
        }
      }
    };

    prop.scene = this;
    this.barrels.push(prop);
    return prop;
  }

  // Backward compatibility wrapper for existing barrel API
  spawnBarrel(x, y, lootType, lootValue) {
    return this.spawnBreakable(x, y, 'barrel', [{ type: lootType, value: lootValue }]);
  }

  // ==========================================
  // ITEM PICKUPS (Coins, Potions, Buffs, Rare Gear)
  // ==========================================

  spawnPickup(x, groundY, type, value) {
    const shadow = this.add.image(x, groundY, 'shadow').setScale(0.5, 0.35).setAlpha(0.4);
    shadow.depth = groundY - 1;

    let sprite;
    let isHD = false;

    if (type === 'coin' && this.textures.exists('icon_gold_coin')) {
      sprite = this.add.image(x, groundY - 14, 'icon_gold_coin').setScale(0.018);
      isHD = true;
    } else if (type === 'potion' && this.textures.exists('icon_mana_potion')) {
      sprite = this.add.image(x, groundY - 15, 'icon_mana_potion').setScale(0.021);
      isHD = true;
    } else if (type === 'meat' && this.textures.exists('icon_health_potion')) {
      sprite = this.add.image(x, groundY - 15, 'icon_health_potion').setScale(0.021);
      isHD = true;
    } else if (type === 'sword' && this.textures.exists('icon_sword')) {
      sprite = this.add.image(x, groundY - 16, 'icon_sword').setScale(0.023);
      isHD = true;
    } else if (type === 'shield' && this.textures.exists('icon_shield')) {
      sprite = this.add.image(x, groundY - 14, 'icon_shield').setScale(0.020);
      isHD = true;
    } else if (type === 'scroll' && this.textures.exists('icon_scroll')) {
      sprite = this.add.image(x, groundY - 14, 'icon_scroll').setScale(0.022);
      isHD = true;
    } else if (type === 'wood_logs' && this.textures.exists('icon_wood_logs')) {
      sprite = this.add.image(x, groundY - 14, 'icon_wood_logs').setScale(0.022);
      isHD = true;
    } else if (type === 'iron_ore' && this.textures.exists('icon_iron_ore')) {
      sprite = this.add.image(x, groundY - 14, 'icon_iron_ore').setScale(0.022);
      isHD = true;
    } else {
      let frameIdx = 0;
      if (type === 'meat') frameIdx = 4;
      else if (type === 'potion') frameIdx = 5;
      else if (type === 'gem_blue') frameIdx = 6;
      else if (type === 'gem_red') frameIdx = 7;
      sprite = this.add.sprite(x, groundY - 18, 'pickups', frameIdx);
      if (type === 'coin') sprite.play('anim_coin');
    }

    sprite.depth = groundY;

    // Gentle floating / bounce tween
    this.tweens.add({
      targets: sprite,
      y: (groundY - (isHD ? 20 : 24)),
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Special glowing aura for rare/special equipment drops
    if (type === 'sword' || type === 'shield' || type === 'scroll') {
      const auraColor = type === 'sword' ? 0xff9800 : (type === 'shield' ? 0x00e5ff : 0xd500f9);
      const aura = this.add.graphics();
      aura.fillStyle(auraColor, 0.28);
      aura.fillCircle(0, 0, 14);
      aura.setPosition(x, groundY - 16);
      aura.setBlendMode(Phaser.BlendModes.ADD);
      aura.depth = groundY - 1;
      this.tweens.add({
        targets: aura,
        alpha: { from: 0.15, to: 0.45 },
        scaleX: { from: 0.8, to: 1.25 },
        scaleY: { from: 0.8, to: 1.25 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });
      sprite.on('destroy', () => aura.destroy());
    }

    const pickup = {
      x: x,
      groundY: groundY,
      type: type,
      value: value,
      sprite: sprite,
      shadow: shadow,
      collected: false
    };

    this.pickups.push(pickup);
    return pickup;
  }

  updatePickups() {
    if (!this.player || this.player.state === 'DEAD') return;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      if (p.collected) continue;

      const distX = Math.abs(this.player.x - p.x);
      const distY = Math.abs(this.player.groundY - p.groundY);

      if (distX < 24 && distY < 18) {
        p.collected = true;

        if (p.type === 'coin') {
          this.player.gainGold(p.value);
        } else if (p.type === 'gem_blue' || p.type === 'gem_red') {
          this.player.gainGold(p.value);
          this.player.gainEXP(Math.round(p.value * 0.5));
        } else if (p.type === 'meat') {
          this.player.heal(p.value);
        } else if (p.type === 'potion') {
          this.player.restoreMagic(p.value);
        } else if (p.type === 'sword') {
          this.player.gainSwordBuff(15000, 8);
        } else if (p.type === 'shield') {
          this.player.gainShieldBuff(15000);
        } else if (p.type === 'scroll') {
          this.player.restoreMagic(this.player.maxMagicOrbs);
          this.hud.showFloatingText(this.player.x, this.player.sprite.y - 35, "ARCANE STORM!", "#b388ff");
          window.SoundEngine.playMagicStorm();
          this.cameras.main.flash(350, 200, 100, 255);
          this.enemies.forEach(e => {
            if (e && e.isAlive()) e.takeDamage(55, this.player.x, true);
          });
        } else if (p.type === 'wood_logs') {
          this.player.gainGold(80);
          this.player.gainEXP(80);
          this.hud.showFloatingText(this.player.x, this.player.sprite.y - 25, "+80G TIMBER", "#ffd700");
        } else if (p.type === 'iron_ore') {
          this.player.gainGold(150);
          this.player.gainEXP(150);
          this.hud.showFloatingText(this.player.x, this.player.sprite.y - 25, "+150G IRON ORE", "#00e5ff");
        }

        // Sparkle glint on collect
        const glint = this.add.image(p.x, p.groundY - 14, 'hit_spark', 0);
        glint.depth = 999;
        this.tweens.add({
          targets: glint,
          scale: 1.5,
          alpha: 0,
          duration: 300,
          onComplete: () => glint.destroy()
        });

        p.sprite.destroy();
        p.shadow.destroy();
        this.pickups.splice(i, 1);
      }
    }
  }

  // Hitstop Arcade Freeze Effect (Momentary pause on heavy impacts)
  triggerHitstop(duration = 50) {
    if (this.isHitstop) return;
    this.isHitstop = true;
    setTimeout(() => {
      this.isHitstop = false;
    }, duration);
  }

  // Boss Defeat Victory Sequence
  handleBossDefeated() {
    this.waveState = 'CLEARED';
    window.SoundEngine.stopBGM();
    window.SoundEngine.playBGM('victory');

    // Victory Banner
    const clearText = this.add.text(240, 110, '★ STAGE 1 CLEAR! ★', {
      fontFamily: 'monospace',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(10002);

    this.tweens.add({
      targets: clearText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 600,
      yoyo: true,
      repeat: 3
    });

    // Transition to VictoryScene after celebration
    this.time.delayedCall(3800, () => {
      this.scene.start('VictoryScene', {
        score: this.player.score,
        gold: this.player.gold,
        level: this.player.level,
        hp: this.player.hp,
        maxHp: this.player.maxHp
      });
    });
  }

  handleGameOver() {
    window.SoundEngine.stopBGM();
    window.SoundEngine.playGameOver();

    this.time.delayedCall(1600, () => {
      this.scene.start('GameOverScene', {
        score: this.player.score,
        gold: this.player.gold,
        level: this.player.level
      });
    });
  }
}

window.GameScene = GameScene;
