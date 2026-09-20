/**
 * The King of Dragons - Procedural 16-Bit Pixel Art Asset Generator
 * Generates all spritesheets, tilesets, backgrounds, and VFX directly
 * onto HTML5 Canvases and registers them with Phaser 3 TextureManager.
 */

class AssetGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  generateAll() {
    this.createElfSpritesheet();
    this.createGoblinSpritesheet();
    this.createOrcSpritesheet();
    this.createBossSpritesheet();
    this.createBarrelSpritesheet();
    this.createPickupSpritesheet();
    this.createVFXTextures();
    this.createBackgroundTextures();
    this.createUITextures();
  }

  // Helper to create an offscreen canvas
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // =========================================================================
  // 1. FEMALE ELF WARRIOR SPRITESHEET (64x64, 36 Frames Linear Strip)
  // Palette:
  // Blonde hair: #ffe066, #d4a017, #8c6200
  // Skin: #ffe4c4, #f5cba7, #d98880
  // Emerald tunic: #2ecc71, #27ae60, #145a32
  // Silver armor: #f4f6f7, #bdc3c7, #7f8c8d
  // Boots / Leather: #873600, #5c2400
  // Twin swords: #e0f7fa, #4dd0e1, #00838f
  // =========================================================================
  createElfSpritesheet() {
    const fw = 64;
    const fh = 64;
    const totalFrames = 36;
    const { canvas, ctx } = this.createCanvas(fw * totalFrames, fh);

    // Frame indices:
    // 0-3: Idle
    // 4-9: Walk
    // 10-12: Attack 1 (horizontal slash)
    // 13-15: Attack 2 (upward slash)
    // 16-19: Attack 3 (spinning finisher)
    // 20-21: Jump
    // 22-23: Jump Attack (dive)
    // 24-25: Guard (blades crossed)
    // 26-29: Magic cast (summoning)
    // 30-31: Hurt
    // 32-35: Die

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * fw;
      this.drawElfFrame(ctx, ox, 0, f);
    }

    if (this.scene.textures.exists('elf')) {
      this.scene.textures.remove('elf');
    }
    this.scene.textures.addSpriteSheet('elf', canvas, {
      frameWidth: fw,
      frameHeight: fh
    });
  }

  drawElfFrame(ctx, ox, oy, f) {
    ctx.save();
    ctx.translate(ox, oy);

    // Base coordinates
    let bx = 32;
    let by = 34;
    let legOffset = 0;
    let armPose = 'normal';
    let swordGlow = false;
    let flashing = false;
    let angle = 0;

    // Determine animation pose based on frame index
    if (f >= 0 && f <= 3) {
      // Idle breathing
      by += (f % 2 === 0 ? 0 : 1);
    } else if (f >= 4 && f <= 9) {
      // Walk cycle
      const walkCycle = [0, 1, 2, 1, 0, -1];
      legOffset = walkCycle[f - 4];
      by += (f % 2 === 0 ? 0 : 1);
    } else if (f >= 10 && f <= 12) {
      // Attack 1: Horizontal slash
      armPose = 'slash1_' + (f - 10);
      swordGlow = true;
      bx += (f - 10) * 4;
    } else if (f >= 13 && f <= 15) {
      // Attack 2: Upward slash
      armPose = 'slash2_' + (f - 13);
      swordGlow = true;
      bx += 2;
    } else if (f >= 16 && f <= 19) {
      // Attack 3: Spin finisher
      armPose = 'spin_' + (f - 16);
      swordGlow = true;
      bx += (f === 17 ? 4 : 2);
    } else if (f >= 20 && f <= 21) {
      // Jump
      by -= 4;
      legOffset = 2;
    } else if (f >= 22 && f <= 23) {
      // Jump attack dive
      by += 2;
      armPose = 'dive';
      swordGlow = true;
    } else if (f >= 24 && f <= 25) {
      // Guard stance
      armPose = 'guard';
      bx -= 2;
    } else if (f >= 26 && f <= 29) {
      // Magic cast
      armPose = 'magic_' + (f - 26);
      swordGlow = true;
      by -= (f % 2 === 1 ? 2 : 0);
    } else if (f >= 30 && f <= 31) {
      // Hurt
      bx -= 4;
      by += 2;
      armPose = 'hurt';
      flashing = true;
    } else if (f >= 32 && f <= 35) {
      // Die
      const dieStep = f - 32;
      bx -= dieStep * 3;
      by += dieStep * 5;
      angle = dieStep * 0.25;
      armPose = 'die';
    }

    if (angle !== 0) {
      ctx.translate(bx, by);
      ctx.rotate(angle);
      ctx.translate(-bx, -by);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(32, 58, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Legs / Boots
    ctx.fillStyle = '#5c2400'; // Dark leather boot
    if (armPose === 'die') {
      ctx.fillRect(bx - 12, by + 18, 18, 5);
    } else {
      // Left leg
      ctx.fillRect(bx - 6 + legOffset, by + 14, 5, 12);
      ctx.fillStyle = '#873600'; // Boot highlight
      ctx.fillRect(bx - 7 + legOffset, by + 22, 6, 4);

      // Right leg
      ctx.fillStyle = '#5c2400';
      ctx.fillRect(bx + 1 - legOffset, by + 14, 5, 12);
      ctx.fillStyle = '#873600';
      ctx.fillRect(bx + 2 - legOffset, by + 22, 6, 4);
    }

    // 2. Emerald Tunic & Silver Breastplate
    ctx.fillStyle = '#145a32'; // Deep tunic shadow
    ctx.fillRect(bx - 7, by + 2, 14, 13);
    ctx.fillStyle = '#27ae60'; // Emerald green tunic
    ctx.fillRect(bx - 6, by + 3, 12, 11);
    ctx.fillStyle = '#2ecc71'; // Tunic highlight
    ctx.fillRect(bx - 5, by + 4, 10, 3);

    // Silver Breastplate
    ctx.fillStyle = '#bdc3c7'; // Silver midtone
    ctx.fillRect(bx - 5, by + 2, 10, 7);
    ctx.fillStyle = '#f4f6f7'; // Silver shine
    ctx.fillRect(bx - 4, by + 3, 4, 4);
    ctx.fillStyle = '#7f8c8d'; // Plate outline
    ctx.fillRect(bx - 5, by + 8, 10, 1);

    // Golden Belt
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(bx - 6, by + 12, 12, 2);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(bx - 2, by + 11, 4, 4); // Belt buckle

    // 3. Head & Face
    ctx.fillStyle = '#ffe4c4'; // Pale elf skin
    ctx.fillRect(bx - 4, by - 8, 8, 9);
    ctx.fillStyle = '#f5cba7'; // Skin shadow
    ctx.fillRect(bx - 4, by, 8, 2);

    // Pointed Elf Ears
    ctx.fillStyle = '#ffe4c4';
    ctx.fillRect(bx - 7, by - 6, 3, 3); // Left ear
    ctx.fillRect(bx - 9, by - 8, 2, 2); // Tip
    ctx.fillRect(bx + 4, by - 6, 3, 3); // Right ear
    ctx.fillRect(bx + 7, by - 8, 2, 2); // Tip

    // Eyes (emerald green)
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(bx + 1, by - 5, 2, 2);
    ctx.fillStyle = '#145a32';
    ctx.fillRect(bx + 1, by - 6, 2, 1); // Brow

    // Flowing Blonde Hair
    ctx.fillStyle = '#8c6200'; // Hair shadow
    ctx.fillRect(bx - 6, by - 12, 12, 5);
    ctx.fillRect(bx - 8, by - 8, 3, 16);
    ctx.fillRect(bx - 10, by - 4, 3, 14);

    ctx.fillStyle = '#d4a017'; // Midtone blonde
    ctx.fillRect(bx - 5, by - 13, 10, 5);
    ctx.fillRect(bx - 7, by - 7, 3, 14);
    ctx.fillRect(bx - 9, by - 3, 3, 12);

    ctx.fillStyle = '#ffe066'; // Golden shine
    ctx.fillRect(bx - 4, by - 14, 8, 3);
    ctx.fillRect(bx - 2, by - 11, 4, 2);

    // Silver Tiara / Circlet
    ctx.fillStyle = '#f4f6f7';
    ctx.fillRect(bx - 4, by - 9, 8, 2);
    ctx.fillStyle = '#00e5ff'; // Cyan jewel in tiara
    ctx.fillRect(bx - 1, by - 10, 2, 2);

    // 4. Arms, Hands & Twin Blades
    if (armPose.startsWith('slash1')) {
      // Horizontal forward slash
      ctx.fillStyle = '#bdc3c7'; // Arm armor
      ctx.fillRect(bx + 2, by + 3, 9, 4);
      // Sword pointing forward
      this.drawPixelBlade(ctx, bx + 11, by + 4, 24, 0, swordGlow);
    } else if (armPose.startsWith('slash2')) {
      // Upward slash
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(bx + 2, by - 2, 5, 8);
      // Blade pointing diagonally up
      this.drawPixelBlade(ctx, bx + 6, by - 2, 20, -Math.PI / 3, swordGlow);
    } else if (armPose.startsWith('spin')) {
      // Spinning finisher with dual extended blades
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(bx - 8, by + 3, 16, 4);
      this.drawPixelBlade(ctx, bx + 8, by + 4, 22, 0, swordGlow);
      this.drawPixelBlade(ctx, bx - 8, by + 4, -22, 0, swordGlow);
    } else if (armPose === 'guard') {
      // Guard: swords crossed defensively in front
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(bx + 2, by + 2, 6, 6);
      this.drawPixelBlade(ctx, bx + 5, by + 4, 18, -Math.PI / 4, true);
      this.drawPixelBlade(ctx, bx + 5, by + 4, 18, Math.PI / 4, true);
    } else if (armPose.startsWith('magic')) {
      // Raising swords to the heavens
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(bx - 3, by - 6, 6, 8);
      this.drawPixelBlade(ctx, bx - 2, by - 6, 22, -Math.PI / 2, true);
      this.drawPixelBlade(ctx, bx + 2, by - 6, 22, -Math.PI / 2, true);
    } else if (armPose === 'dive') {
      // Jump attack dive: swords pointed straight down
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(bx + 1, by + 8, 6, 6);
      this.drawPixelBlade(ctx, bx + 4, by + 12, 22, Math.PI / 2, true);
    } else if (armPose === 'hurt') {
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(bx - 8, by + 4, 6, 6);
      this.drawPixelBlade(ctx, bx - 8, by + 6, 14, Math.PI * 0.75, false);
    } else {
      // Stance: dual blades resting at sides
      ctx.fillStyle = '#bdc3c7'; // Left arm
      ctx.fillRect(bx - 7, by + 4, 4, 7);
      this.drawPixelBlade(ctx, bx - 7, by + 9, 14, Math.PI * 0.4, false);

      ctx.fillRect(bx + 3, by + 4, 4, 7); // Right arm
      this.drawPixelBlade(ctx, bx + 5, by + 9, 14, Math.PI * 0.35, false);
    }

    ctx.restore();
  }

  // Draw an authentic SNES pixel blade with glowing aura
  drawPixelBlade(ctx, x, y, length, angle, glowing = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Hilt & crossguard (gold)
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(-2, -3, 4, 6);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(-1, -2, 2, 4);

    // Blade
    if (glowing) {
      // Cyan magic glow outline
      ctx.fillStyle = 'rgba(77, 208, 225, 0.6)';
      ctx.fillRect(2, -3, length + 2, 6);
    }

    // Steel blade core
    ctx.fillStyle = '#e0f7fa'; // Bright silver cyan
    ctx.fillRect(2, -1, length, 2);
    ctx.fillStyle = '#ffffff'; // White razor edge
    ctx.fillRect(3, -1, length - 2, 1);
    ctx.fillStyle = '#4dd0e1'; // Edge shadow
    ctx.fillRect(2, 1, length, 1);

    ctx.restore();
  }

  // =========================================================================
  // 2. GOBLIN SPRITESHEET (48x48, 13 Frames Linear Strip)
  // Frames:
  // 0-3: Walk
  // 4-6: Attack (Spear thrust)
  // 7-8: Hurt
  // 9-12: Die
  // =========================================================================
  createGoblinSpritesheet() {
    const fw = 48;
    const fh = 48;
    const totalFrames = 13;
    const { canvas, ctx } = this.createCanvas(fw * totalFrames, fh);

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * fw;
      this.drawGoblinFrame(ctx, ox, 0, f);
    }

    if (this.scene.textures.exists('goblin')) {
      this.scene.textures.remove('goblin');
    }
    this.scene.textures.addSpriteSheet('goblin', canvas, {
      frameWidth: fw,
      frameHeight: fh
    });
  }

  drawGoblinFrame(ctx, ox, oy, f) {
    ctx.save();
    ctx.translate(ox, oy);

    let bx = 24;
    let by = 26;
    let thrust = 0;
    let legOffset = 0;

    if (f >= 0 && f <= 3) {
      // Walk
      const steps = [0, 2, 0, -2];
      legOffset = steps[f];
      by += (f % 2 === 1 ? 1 : 0);
    } else if (f >= 4 && f <= 6) {
      // Spear thrust attack
      thrust = (f - 4) * 7;
      bx += 2;
    } else if (f >= 7 && f <= 8) {
      // Hurt
      bx -= 4;
      by += 2;
    } else if (f >= 9 && f <= 12) {
      // Die
      const d = f - 9;
      bx -= d * 3;
      by += d * 4;
      ctx.translate(bx, by);
      ctx.rotate(d * 0.3);
      ctx.translate(-bx, -by);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 43, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Legs
    ctx.fillStyle = '#2e5b15'; // Dark green skin
    ctx.fillRect(bx - 4 + legOffset, by + 10, 3, 7);
    ctx.fillRect(bx + 2 - legOffset, by + 10, 3, 7);

    // 2. Body / Red Rag Tunic
    ctx.fillStyle = '#b71c1c'; // Dark red hood/cloak
    ctx.fillRect(bx - 6, by + 1, 12, 10);
    ctx.fillStyle = '#d32f2f'; // Highlight
    ctx.fillRect(bx - 5, by + 2, 8, 8);

    // 3. Goblin Head & Ears
    ctx.fillStyle = '#558b2f'; // Goblin skin
    ctx.fillRect(bx - 5, by - 8, 10, 9);
    ctx.fillStyle = '#8bc34a'; // Light green snout
    ctx.fillRect(bx + 1, by - 5, 6, 5);

    // Pointed goblin ears
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(bx - 8, by - 6, 4, 3);
    ctx.fillRect(bx - 10, by - 8, 3, 2);

    // Menacing yellow eyes
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(bx + 2, by - 6, 2, 2);
    ctx.fillStyle = '#d50000'; // Red pupil
    ctx.fillRect(bx + 3, by - 6, 1, 1);

    // Red Hood
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(bx - 6, by - 10, 10, 4);
    ctx.fillRect(bx - 8, by - 8, 3, 8);

    // 4. Weapon: Wooden Spear with Iron Tip
    ctx.fillStyle = '#6d4c41'; // Wood shaft
    ctx.fillRect(bx - 2 + thrust, by + 4, 22, 2);
    // Spearhead
    ctx.fillStyle = '#90a4ae'; // Steel
    ctx.fillRect(bx + 20 + thrust, by + 3, 6, 4);
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(bx + 24 + thrust, by + 4, 3, 2); // Sharp point

    ctx.restore();
  }

  // =========================================================================
  // 3. ORC SPRITESHEET (64x64, 19 Frames Linear Strip)
  // Frames:
  // 0-1: Idle
  // 2-5: Walk
  // 6-9: Attack (Overhead Mace Smash)
  // 10-12: Charge / Shield Bash
  // 13-14: Hurt
  // 15-18: Die
  // =========================================================================
  createOrcSpritesheet() {
    const fw = 64;
    const fh = 64;
    const totalFrames = 19;
    const { canvas, ctx } = this.createCanvas(fw * totalFrames, fh);

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * fw;
      this.drawOrcFrame(ctx, ox, 0, f);
    }

    if (this.scene.textures.exists('orc')) {
      this.scene.textures.remove('orc');
    }
    this.scene.textures.addSpriteSheet('orc', canvas, {
      frameWidth: fw,
      frameHeight: fh
    });
  }

  drawOrcFrame(ctx, ox, oy, f) {
    ctx.save();
    ctx.translate(ox, oy);

    let bx = 32;
    let by = 32;
    let legOffset = 0;
    let maceAngle = -Math.PI / 4;
    let maceX = bx + 12;
    let maceY = by;

    if (f >= 0 && f <= 1) {
      // Idle
      by += (f === 1 ? 1 : 0);
    } else if (f >= 2 && f <= 5) {
      // Walk
      const steps = [0, 3, 0, -3];
      legOffset = steps[f - 2];
      by += (f % 2 === 1 ? 1 : 0);
    } else if (f >= 6 && f <= 9) {
      // Overhead mace smash
      const smashSteps = [
        { angle: -Math.PI * 0.7, mx: bx - 4, my: by - 12 },
        { angle: -Math.PI * 0.5, mx: bx + 4, my: by - 16 },
        { angle: Math.PI * 0.25, mx: bx + 18, my: by + 8 },
        { angle: Math.PI * 0.35, mx: bx + 22, my: by + 12 }
      ];
      const s = smashSteps[f - 6];
      maceAngle = s.angle;
      maceX = s.mx;
      maceY = s.my;
      bx += (f - 6) * 2;
    } else if (f >= 10 && f <= 12) {
      // Charge / Shield rush
      bx += (f - 10) * 4;
      by += 1;
      maceAngle = Math.PI * 0.1;
      maceX = bx + 10;
      maceY = by + 6;
    } else if (f >= 13 && f <= 14) {
      // Hurt
      bx -= 5;
      by += 2;
      maceAngle = -Math.PI * 0.6;
    } else if (f >= 15 && f <= 18) {
      // Die
      const d = f - 15;
      bx -= d * 4;
      by += d * 5;
      ctx.translate(bx, by);
      ctx.rotate(d * 0.35);
      ctx.translate(-bx, -by);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(32, 57, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Heavy Boots & Legs
    ctx.fillStyle = '#3e2723'; // Fur boots
    ctx.fillRect(bx - 9 + legOffset, by + 14, 7, 12);
    ctx.fillRect(bx + 2 - legOffset, by + 14, 7, 12);
    ctx.fillStyle = '#263238'; // Spiked iron kneepads
    ctx.fillRect(bx - 10 + legOffset, by + 14, 8, 5);
    ctx.fillRect(bx + 1 - legOffset, by + 14, 8, 5);

    // 2. Muscular Orc Torso & Iron Armor
    ctx.fillStyle = '#33691e'; // Dark green orc skin
    ctx.fillRect(bx - 10, by + 2, 20, 14);
    ctx.fillStyle = '#37474f'; // Spiked iron chestplate
    ctx.fillRect(bx - 8, by + 3, 16, 11);
    ctx.fillStyle = '#78909c'; // Armor highlight
    ctx.fillRect(bx - 6, by + 4, 8, 5);

    // Iron belt with skull buckle
    ctx.fillStyle = '#212121';
    ctx.fillRect(bx - 9, by + 12, 18, 4);
    ctx.fillStyle = '#eceff1'; // Horned skull
    ctx.fillRect(bx - 3, by + 11, 6, 5);

    // 3. Brutal Orc Head & Horned Helmet
    ctx.fillStyle = '#33691e'; // Face
    ctx.fillRect(bx - 6, by - 8, 14, 10);
    ctx.fillStyle = '#558b2f'; // Huge lower jaw
    ctx.fillRect(bx - 4, by - 3, 13, 6);

    // Protruding tusks
    ctx.fillStyle = '#fffde7';
    ctx.fillRect(bx + 4, by - 6, 2, 4);
    ctx.fillRect(bx + 7, by - 5, 2, 3);

    // Fierce red eyes
    ctx.fillStyle = '#d50000';
    ctx.fillRect(bx + 2, by - 6, 2, 2);

    // Spiked Horned Helmet
    ctx.fillStyle = '#263238'; // Dark steel helmet
    ctx.fillRect(bx - 7, by - 12, 15, 6);
    ctx.fillRect(bx - 5, by - 14, 10, 3);
    // Curved ivory horns
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(bx - 11, by - 14, 5, 3);
    ctx.fillRect(bx - 13, by - 17, 3, 4); // Left horn tip
    ctx.fillRect(bx + 7, by - 14, 5, 3);
    ctx.fillRect(bx + 11, by - 17, 3, 4); // Right horn tip

    // 4. Spiked Iron Mace
    ctx.save();
    ctx.translate(maceX, maceY);
    ctx.rotate(maceAngle);
    // Shaft
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(-2, -18, 4, 26);
    // Spiked mace head
    ctx.fillStyle = '#263238';
    ctx.fillRect(-7, -26, 14, 14);
    ctx.fillStyle = '#cfd8dc'; // Spikes
    ctx.fillRect(-10, -21, 4, 4);
    ctx.fillRect(6, -21, 4, 4);
    ctx.fillRect(-2, -29, 4, 4);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 4. BOSS: ORC WARLORD GORGOK SPRITESHEET (80x80, 22 Frames Linear Strip)
  // Frames:
  // 0-1: Idle
  // 2-5: Walk
  // 6-9: Heavy Morningstar Swing
  // 10-14: Leap & Ground Pound Smash
  // 15-16: Hurt
  // 17-21: Dramatic Defeat
  // =========================================================================
  createBossSpritesheet() {
    const fw = 80;
    const fh = 80;
    const totalFrames = 22;
    const { canvas, ctx } = this.createCanvas(fw * totalFrames, fh);

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * fw;
      this.drawBossFrame(ctx, ox, 0, f);
    }

    if (this.scene.textures.exists('boss')) {
      this.scene.textures.remove('boss');
    }
    this.scene.textures.addSpriteSheet('boss', canvas, {
      frameWidth: fw,
      frameHeight: fh
    });
  }

  drawBossFrame(ctx, ox, oy, f) {
    ctx.save();
    ctx.translate(ox, oy);

    let bx = 40;
    let by = 42;
    let legOffset = 0;
    let swingProgress = 0;
    let smashY = 0;

    if (f >= 0 && f <= 1) {
      // Idle
      by += (f === 1 ? 2 : 0);
    } else if (f >= 2 && f <= 5) {
      // Walk
      const steps = [0, 4, 0, -4];
      legOffset = steps[f - 2];
      by += (f % 2 === 1 ? 1 : 0);
    } else if (f >= 6 && f <= 9) {
      // Giant Morningstar Swing
      swingProgress = (f - 6) / 3;
      bx += (f - 6) * 3;
    } else if (f >= 10 && f <= 14) {
      // Leap and Ground Pound
      const jumpOffsets = [-4, -14, -8, 2, 4];
      smashY = jumpOffsets[f - 10];
      by += smashY;
    } else if (f >= 15 && f <= 16) {
      // Hurt
      bx -= 6;
      by += 3;
    } else if (f >= 17 && f <= 21) {
      // Defeat dramatic fall
      const d = f - 17;
      bx -= d * 5;
      by += d * 6;
      ctx.translate(bx, by);
      ctx.rotate(d * 0.28);
      ctx.translate(-bx, -by);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(40, 72, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crimson cape flowing behind
    ctx.fillStyle = '#800000';
    ctx.fillRect(bx - 20, by - 2, 14, 28);
    ctx.fillStyle = '#b30000';
    ctx.fillRect(bx - 18, by, 10, 24);

    // 1. Massive Armored Legs
    ctx.fillStyle = '#1a1a1a'; // Black iron greaves
    ctx.fillRect(bx - 13 + legOffset, by + 16, 10, 16);
    ctx.fillRect(bx + 4 - legOffset, by + 16, 10, 16);
    // Crimson knee gems
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(bx - 11 + legOffset, by + 18, 5, 5);
    ctx.fillRect(bx + 6 - legOffset, by + 18, 5, 5);

    // 2. Hulking Dark Red / Crimson Orc Torso
    ctx.fillStyle = '#641e16'; // Deep reddish-brown orc flesh
    ctx.fillRect(bx - 16, by + 2, 32, 18);
    // Spiked Black Iron Plate
    ctx.fillStyle = '#212121';
    ctx.fillRect(bx - 14, by + 4, 28, 14);
    ctx.fillStyle = '#424242'; // Steel rim
    ctx.fillRect(bx - 12, by + 6, 24, 6);

    // Skull Pauldrons (Left & Right Spiked Shoulders)
    ctx.fillStyle = '#cfd8dc'; // Bone skull pauldron
    ctx.fillRect(bx - 24, by - 2, 10, 10);
    ctx.fillRect(bx + 14, by - 2, 10, 10);
    ctx.fillStyle = '#212121'; // Horn spikes
    ctx.fillRect(bx - 26, by - 6, 4, 5);
    ctx.fillRect(bx + 22, by - 6, 4, 5);

    // 3. Menacing Head, War Paint & Crown Helmet
    ctx.fillStyle = '#78281f'; // Red orc head
    ctx.fillRect(bx - 8, by - 12, 18, 14);
    // War Paint
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(bx - 5, by - 9, 14, 3);

    // Giant lower tusks
    ctx.fillStyle = '#fffde7';
    ctx.fillRect(bx + 4, by - 8, 3, 5);
    ctx.fillRect(bx + 8, by - 7, 3, 4);

    // Glowing Crimson Eyes
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(bx + 2, by - 8, 3, 2);

    // Warlord's Iron Spiked Crown
    ctx.fillStyle = '#f39c12'; // Gold crown inlay
    ctx.fillRect(bx - 9, by - 16, 20, 5);
    ctx.fillStyle = '#212121'; // Black iron crown spikes
    ctx.fillRect(bx - 8, by - 20, 4, 5);
    ctx.fillRect(bx - 1, by - 22, 5, 7);
    ctx.fillRect(bx + 7, by - 20, 4, 5);

    // 4. Twin Morningstars on Heavy Chains
    if (f >= 6 && f <= 9) {
      // Horizontal giant morningstar swipe
      const swingAngle = -Math.PI * 0.4 + swingProgress * Math.PI * 0.8;
      ctx.save();
      ctx.translate(bx + 10, by + 5);
      ctx.rotate(swingAngle);
      // Iron chain links
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(0, -2, 28, 4);
      // Spiked ball
      ctx.fillStyle = '#212121';
      ctx.fillRect(26, -10, 20, 20);
      ctx.fillStyle = '#cfd8dc'; // Spikes
      ctx.fillRect(22, -2, 5, 4);
      ctx.fillRect(45, -2, 5, 4);
      ctx.fillRect(34, -14, 4, 5);
      ctx.fillRect(34, 9, 4, 5);
      ctx.restore();
    } else if (f >= 10 && f <= 14) {
      // Smash downwards
      ctx.fillStyle = '#9e9e9e'; // Chain
      ctx.fillRect(bx + 4, by + 4, 6, 16);
      ctx.fillStyle = '#212121'; // Spiked Ball on ground
      ctx.fillRect(bx - 4, by + 18, 22, 18);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(bx + 5, by + 34, 5, 6);
      ctx.fillRect(bx - 8, by + 24, 5, 5);
      ctx.fillRect(bx + 17, by + 24, 5, 5);
    } else {
      // Default resting morningstars
      ctx.fillStyle = '#9e9e9e'; // Left chain
      ctx.fillRect(bx - 18, by + 6, 4, 14);
      ctx.fillStyle = '#212121'; // Left ball
      ctx.fillRect(bx - 23, by + 18, 14, 14);

      ctx.fillStyle = '#9e9e9e'; // Right chain
      ctx.fillRect(bx + 14, by + 6, 4, 14);
      ctx.fillStyle = '#212121'; // Right ball
      ctx.fillRect(bx + 10, by + 18, 14, 14);
    }

    ctx.restore();
  }

  // =========================================================================
  // 5. BREAKABLE BARREL (32x32, 3 Frames)
  // =========================================================================
  createBarrelSpritesheet() {
    const fw = 32;
    const fh = 32;
    const { canvas, ctx } = this.createCanvas(fw * 3, fh);

    // Frame 0: Intact
    this.drawBarrel(ctx, 0, 0, 0);
    // Frame 1: Damaged
    this.drawBarrel(ctx, fw, 0, 1);
    // Frame 2: Broken splinters
    this.drawBarrel(ctx, fw * 2, 0, 2);

    if (this.scene.textures.exists('barrel')) {
      this.scene.textures.remove('barrel');
    }
    this.scene.textures.addSpriteSheet('barrel', canvas, {
      frameWidth: fw,
      frameHeight: fh
    });
  }

  drawBarrel(ctx, ox, oy, state) {
    ctx.save();
    ctx.translate(ox, oy);

    if (state === 0 || state === 1) {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wood body
      ctx.fillStyle = '#6d4c41'; // Dark wood
      ctx.fillRect(6, 6, 20, 22);
      ctx.fillStyle = '#8d6e63'; // Lighter wood planks
      ctx.fillRect(7, 7, 18, 20);
      ctx.fillStyle = '#a1887f'; // Highlight plank
      ctx.fillRect(10, 7, 5, 20);

      // Iron hoops
      ctx.fillStyle = '#37474f';
      ctx.fillRect(5, 10, 22, 3);
      ctx.fillRect(5, 21, 22, 3);
      ctx.fillStyle = '#78909c'; // Iron rivets
      ctx.fillRect(8, 11, 2, 1);
      ctx.fillRect(16, 11, 2, 1);
      ctx.fillRect(23, 11, 2, 1);

      if (state === 1) {
        // Crack lines
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, 8); ctx.lineTo(15, 15); ctx.lineTo(13, 25);
        ctx.stroke();
      }
    } else {
      // Broken wooden staves
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(4, 22, 10, 4);
      ctx.fillRect(18, 24, 11, 3);
      ctx.fillRect(10, 26, 8, 3);
      ctx.fillStyle = '#37474f'; // Bent iron band
      ctx.fillRect(8, 20, 14, 2);
    }

    ctx.restore();
  }

  // =========================================================================
  // 6. ITEM PICKUPS SPRITESHEET (24x24, 8 Frames)
  // Frames:
  // 0-3: Gold Coin spinning
  // 4: Roast Meat on bone (restores 50 HP)
  // 5: Magic Potion flask (restores magic orbs)
  // 6: Blue Gem (Sapphire)
  // 7: Red Gem (Ruby)
  // =========================================================================
  createPickupSpritesheet() {
    const fw = 24;
    const fh = 24;
    const totalFrames = 8;
    const { canvas, ctx } = this.createCanvas(fw * totalFrames, fh);

    // Frames 0-3: Coin spinning
    const coinWidths = [14, 10, 4, 10];
    for (let i = 0; i < 4; i++) {
      const ox = i * fw;
      const w = coinWidths[i];
      ctx.fillStyle = '#f39c12'; // Gold border
      ctx.fillRect(ox + (24 - w) / 2, 5, w, 14);
      ctx.fillStyle = '#f1c40f'; // Bright gold face
      ctx.fillRect(ox + (24 - w) / 2 + 1, 6, Math.max(1, w - 2), 12);
      ctx.fillStyle = '#ffffff'; // Shine
      ctx.fillRect(ox + (24 - w) / 2 + 2, 7, Math.max(1, w - 4), 2);
    }

    // Frame 4: Roast Meat on Bone
    let ox = 4 * fw;
    ctx.fillStyle = '#efebe9'; // Bone
    ctx.fillRect(ox + 4, 14, 5, 4);
    ctx.fillRect(ox + 2, 13, 3, 6);
    ctx.fillStyle = '#5d4037'; // Dark roast skin
    ctx.fillRect(ox + 7, 7, 14, 11);
    ctx.fillStyle = '#8d6e63'; // Succulent roasted meat
    ctx.fillRect(ox + 9, 8, 10, 9);
    ctx.fillStyle = '#d7ccc8'; // Crispy fat highlight
    ctx.fillRect(ox + 11, 9, 5, 2);

    // Frame 5: Magic Potion Bottle
    ox = 5 * fw;
    ctx.fillStyle = '#b0bec5'; // Cork & glass neck
    ctx.fillRect(ox + 10, 4, 4, 4);
    ctx.fillStyle = '#8d6e63'; // Cork
    ctx.fillRect(ox + 10, 3, 4, 2);
    // Flask body
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Glass
    ctx.fillRect(ox + 7, 8, 10, 12);
    // Glowing Blue Elixir
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(ox + 8, 10, 8, 9);
    ctx.fillStyle = '#ffffff'; // Shimmer bubble
    ctx.fillRect(ox + 9, 11, 2, 2);

    // Frame 6: Blue Gem (Sapphire)
    ox = 6 * fw;
    ctx.fillStyle = '#0d47a1'; // Shadow
    ctx.fillRect(ox + 6, 7, 12, 10);
    ctx.fillStyle = '#1976d2'; // Sapphire body
    ctx.fillRect(ox + 7, 8, 10, 8);
    ctx.fillStyle = '#80d8ff'; // Sparkling facet
    ctx.fillRect(ox + 9, 9, 4, 3);
    ctx.fillStyle = '#ffffff'; // Star glint
    ctx.fillRect(ox + 11, 8, 2, 2);

    // Frame 7: Red Gem (Ruby)
    ox = 7 * fw;
    ctx.fillStyle = '#b71c1c'; // Shadow
    ctx.fillRect(ox + 6, 7, 12, 10);
    ctx.fillStyle = '#d32f2f'; // Ruby body
    ctx.fillRect(ox + 7, 8, 10, 8);
    ctx.fillStyle = '#ff8a80'; // Sparkling facet
    ctx.fillRect(ox + 9, 9, 4, 3);
    ctx.fillStyle = '#ffffff'; // Star glint
    ctx.fillRect(ox + 11, 8, 2, 2);

    if (this.scene.textures.exists('pickups')) {
      this.scene.textures.remove('pickups');
    }
    this.scene.textures.addSpriteSheet('pickups', canvas, {
      frameWidth: fw,
      frameHeight: fh
    });
  }

  // =========================================================================
  // 7. VISUAL EFFECTS (Slash Arcs, Sparks, Lightning, Arcane Circle, Dust)
  // =========================================================================
  createVFXTextures() {
    // 1. Horizontal Slash Arc (48x48)
    const { canvas: s1Canvas, ctx: s1Ctx } = this.createCanvas(48, 48);
    s1Ctx.strokeStyle = '#e0f7fa';
    s1Ctx.lineWidth = 4;
    s1Ctx.shadowColor = '#00e5ff';
    s1Ctx.shadowBlur = 8;
    s1Ctx.beginPath();
    s1Ctx.arc(20, 24, 18, -Math.PI * 0.45, Math.PI * 0.45);
    s1Ctx.stroke();
    s1Ctx.strokeStyle = '#ffffff';
    s1Ctx.lineWidth = 2;
    s1Ctx.stroke();
    this.scene.textures.addCanvas('slash_fx_1', s1Canvas);

    // 2. Upward Slash Arc (48x48)
    const { canvas: s2Canvas, ctx: s2Ctx } = this.createCanvas(48, 48);
    s2Ctx.strokeStyle = '#80deea';
    s2Ctx.lineWidth = 5;
    s2Ctx.shadowColor = '#00e5ff';
    s2Ctx.shadowBlur = 8;
    s2Ctx.beginPath();
    s2Ctx.arc(24, 28, 20, -Math.PI * 0.8, -Math.PI * 0.1);
    s2Ctx.stroke();
    s2Ctx.strokeStyle = '#ffffff';
    s2Ctx.lineWidth = 2;
    s2Ctx.stroke();
    this.scene.textures.addCanvas('slash_fx_2', s2Canvas);

    // 3. Spin Finisher Full Crescent Wave (64x64)
    const { canvas: s3Canvas, ctx: s3Ctx } = this.createCanvas(64, 64);
    s3Ctx.strokeStyle = '#ffe082';
    s3Ctx.lineWidth = 6;
    s3Ctx.shadowColor = '#ffd54f';
    s3Ctx.shadowBlur = 10;
    s3Ctx.beginPath();
    s3Ctx.arc(32, 32, 26, 0, Math.PI * 2);
    s3Ctx.stroke();
    s3Ctx.strokeStyle = '#ffffff';
    s3Ctx.lineWidth = 3;
    s3Ctx.stroke();
    this.scene.textures.addCanvas('slash_fx_3', s3Canvas);

    // 4. Hit Spark (32x32, 3 frames)
    const { canvas: hsCanvas, ctx: hsCtx } = this.createCanvas(32 * 3, 32);
    for (let i = 0; i < 3; i++) {
      const ox = i * 32 + 16;
      const r = (i + 1) * 4;
      hsCtx.fillStyle = i === 2 ? '#ffffff' : '#ffd54f';
      // 4-point star
      hsCtx.beginPath();
      hsCtx.moveTo(ox, 16 - r);
      hsCtx.lineTo(ox + r * 0.3, 16 - r * 0.3);
      hsCtx.lineTo(ox + r, 16);
      hsCtx.lineTo(ox + r * 0.3, 16 + r * 0.3);
      hsCtx.lineTo(ox, 16 + r);
      hsCtx.lineTo(ox - r * 0.3, 16 + r * 0.3);
      hsCtx.lineTo(ox - r, 16);
      hsCtx.lineTo(ox - r * 0.3, 16 - r * 0.3);
      hsCtx.closePath();
      hsCtx.fill();
    }
    this.scene.textures.addSpriteSheet('hit_spark', hsCanvas, {
      frameWidth: 32, frameHeight: 32
    });

    // 5. Shield Guard Deflection Spark (32x32, 2 frames)
    const { canvas: gsCanvas, ctx: gsCtx } = this.createCanvas(32 * 2, 32);
    for (let i = 0; i < 2; i++) {
      const ox = i * 32 + 16;
      const radius = 8 + i * 4;
      gsCtx.strokeStyle = i === 0 ? '#ffffff' : '#80d8ff';
      gsCtx.lineWidth = 3;
      gsCtx.beginPath();
      gsCtx.arc(ox, 16, radius, 0, Math.PI * 2);
      gsCtx.stroke();
    }
    this.scene.textures.addSpriteSheet('guard_spark', gsCanvas, {
      frameWidth: 32, frameHeight: 32
    });

    // 6. Dust Puff (24x24, 3 frames)
    const { canvas: dpCanvas, ctx: dpCtx } = this.createCanvas(24 * 3, 24);
    for (let i = 0; i < 3; i++) {
      const ox = i * 24 + 12;
      dpCtx.fillStyle = `rgba(220, 220, 220, ${0.7 - i * 0.25})`;
      dpCtx.beginPath();
      dpCtx.arc(ox - 3, 16, 4 + i, 0, Math.PI * 2);
      dpCtx.arc(ox + 3, 16, 5 + i, 0, Math.PI * 2);
      dpCtx.arc(ox, 13, 3 + i, 0, Math.PI * 2);
      dpCtx.fill();
    }
    this.scene.textures.addSpriteSheet('dust_puff', dpCanvas, {
      frameWidth: 24, frameHeight: 24
    });

    // 7. Magic Lightning Bolt (32x220)
    const { canvas: ltCanvas, ctx: ltCtx } = this.createCanvas(32, 220);
    ltCtx.strokeStyle = '#e0f7fa';
    ltCtx.lineWidth = 5;
    ltCtx.shadowColor = '#00e5ff';
    ltCtx.shadowBlur = 12;
    ltCtx.beginPath();
    let lx = 16;
    ltCtx.moveTo(lx, 0);
    for (let y = 10; y <= 220; y += 15) {
      lx += (Math.random() - 0.5) * 16;
      ltCtx.lineTo(lx, y);
    }
    ltCtx.stroke();
    ltCtx.strokeStyle = '#ffffff';
    ltCtx.lineWidth = 2;
    ltCtx.stroke();
    this.scene.textures.addCanvas('lightning', ltCanvas);

    // 8. Arcane Elven Magic Circle (96x96)
    const { canvas: mcCanvas, ctx: mcCtx } = this.createCanvas(96, 96);
    mcCtx.strokeStyle = '#4dd0e1';
    mcCtx.lineWidth = 2;
    mcCtx.shadowColor = '#00e5ff';
    mcCtx.shadowBlur = 10;
    // Outer concentric circles
    mcCtx.beginPath();
    mcCtx.arc(48, 48, 44, 0, Math.PI * 2);
    mcCtx.stroke();
    mcCtx.beginPath();
    mcCtx.arc(48, 48, 36, 0, Math.PI * 2);
    mcCtx.stroke();
    // Inner runes / star
    for (let i = 0; i < 6; i++) {
      const a1 = (i * Math.PI) / 3;
      const a2 = ((i + 2) * Math.PI) / 3;
      mcCtx.beginPath();
      mcCtx.moveTo(48 + Math.cos(a1) * 36, 48 + Math.sin(a1) * 36);
      mcCtx.lineTo(48 + Math.cos(a2) * 36, 48 + Math.sin(a2) * 36);
      mcCtx.stroke();
    }
    this.scene.textures.addCanvas('magic_circle', mcCanvas);

    // 9. Ground Shockwave (64x32)
    const { canvas: swCanvas, ctx: swCtx } = this.createCanvas(64, 32);
    swCtx.strokeStyle = '#ffca28';
    swCtx.lineWidth = 4;
    swCtx.shadowColor = '#ff6f00';
    swCtx.shadowBlur = 8;
    swCtx.beginPath();
    swCtx.ellipse(32, 16, 26, 10, 0, 0, Math.PI * 2);
    swCtx.stroke();
    swCtx.strokeStyle = '#ffffff';
    swCtx.lineWidth = 2;
    swCtx.stroke();
    this.scene.textures.addCanvas('shockwave', swCanvas);

    // 10. Soft Oval Shadow (36x14)
    const { canvas: shCanvas, ctx: shCtx } = this.createCanvas(36, 14);
    shCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    shCtx.beginPath();
    shCtx.ellipse(18, 7, 16, 6, 0, 0, Math.PI * 2);
    shCtx.fill();
    this.scene.textures.addCanvas('shadow', shCanvas);
  }

  // =========================================================================
  // 8. PARALLAX ENVIRONMENT & LEVEL BACKGROUND TEXTURES
  // =========================================================================
  createBackgroundTextures() {
    const W = 480;
    const H = 270;

    // 1. Far Sky Layer (Seamless 480x270)
    // Twilight gradient, distant purple mountain ridges, crescent moon, stars
    const { canvas: skyCanvas, ctx: skyCtx } = this.createCanvas(W, H);
    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, H * 0.7);
    skyGrad.addColorStop(0, '#0c1024');   // Midnight navy
    skyGrad.addColorStop(0.4, '#241442'); // Twilight purple
    skyGrad.addColorStop(0.75, '#5c1d4a'); // Crimson dusk
    skyGrad.addColorStop(1, '#8e3a4b');   // Sunset horizon glow
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, W, H);

    // Twinkling stars
    skyCtx.fillStyle = '#ffffff';
    const starCoords = [
      [30, 20], [80, 45], [140, 15], [210, 35], [290, 18], [360, 40], [420, 25],
      [60, 65], [180, 70], [330, 55], [450, 60]
    ];
    starCoords.forEach(([x, y]) => {
      skyCtx.fillRect(x, y, 2, 2);
      skyCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      skyCtx.fillRect(x - 1, y, 4, 2);
      skyCtx.fillStyle = '#ffffff';
    });

    // Glowing Crescent Moon
    skyCtx.fillStyle = '#fffde7';
    skyCtx.shadowColor = '#fff59d';
    skyCtx.shadowBlur = 12;
    skyCtx.beginPath();
    skyCtx.arc(390, 45, 18, 0, Math.PI * 2);
    skyCtx.fill();
    skyCtx.shadowBlur = 0;
    // Moon inner shadow
    skyCtx.fillStyle = '#241442';
    skyCtx.beginPath();
    skyCtx.arc(396, 43, 15, 0, Math.PI * 2);
    skyCtx.fill();

    // Distant jagged mountain silhouettes
    skyCtx.fillStyle = '#1c1335';
    skyCtx.beginPath();
    skyCtx.moveTo(0, 160);
    const peaks = [
      [40, 110], [90, 140], [150, 95], [210, 135], [270, 105],
      [330, 145], [390, 100], [440, 130], [480, 120], [480, 170], [0, 170]
    ];
    peaks.forEach(([px, py]) => skyCtx.lineTo(px, py));
    skyCtx.closePath();
    skyCtx.fill();

    // Distant Citadel Spires on mountain
    skyCtx.fillStyle = '#150d26';
    skyCtx.fillRect(145, 80, 10, 20); // Tower
    skyCtx.beginPath();
    skyCtx.moveTo(142, 80); skyCtx.lineTo(150, 65); skyCtx.lineTo(158, 80);
    skyCtx.fill(); // Spire cone
    skyCtx.fillRect(385, 85, 12, 18);
    skyCtx.beginPath();
    skyCtx.moveTo(382, 85); skyCtx.lineTo(391, 72); skyCtx.lineTo(400, 85);
    skyCtx.fill();

    this.scene.textures.addCanvas('bg_sky', skyCanvas);

    // 2. Midground Layer (Ancient Forest & Ruined Fortress Pillars)
    const { canvas: midCanvas, ctx: midCtx } = this.createCanvas(W, H);
    // Dark ancient twisted forest canopy & mossy gothic stone ruins
    midCtx.fillStyle = '#1b2a26'; // Deep forest silhouette
    // Giant Ancient Trees
    [20, 110, 230, 340, 450].forEach((tx, i) => {
      // Tree trunk
      midCtx.fillStyle = '#1b261e';
      midCtx.fillRect(tx, 90, 22, 90);
      // Bark texture
      midCtx.fillStyle = '#2d3f32';
      midCtx.fillRect(tx + 4, 100, 4, 70);
      midCtx.fillRect(tx + 12, 110, 5, 50);

      // Lush leafy canopy
      midCtx.fillStyle = '#0f2316';
      midCtx.beginPath();
      midCtx.arc(tx + 11, 80, 36, 0, Math.PI * 2);
      midCtx.fill();
      midCtx.fillStyle = '#1a3a25';
      midCtx.beginPath();
      midCtx.arc(tx + 8, 76, 26, 0, Math.PI * 2);
      midCtx.fill();
    });

    // Ruined Fortress Gate Pillars
    [170, 390].forEach(px => {
      // Weathered stone column
      midCtx.fillStyle = '#2c3338';
      midCtx.fillRect(px, 85, 26, 95);
      // Capital & base
      midCtx.fillStyle = '#3e484f';
      midCtx.fillRect(px - 4, 80, 34, 10);
      midCtx.fillRect(px - 4, 165, 34, 15);
      // Stone blocks cracks & moss
      midCtx.fillStyle = '#1e2428';
      midCtx.fillRect(px + 4, 105, 18, 2);
      midCtx.fillRect(px + 4, 135, 18, 2);
      midCtx.fillStyle = '#2e7d32'; // Overgrowing moss
      midCtx.fillRect(px + 2, 88, 8, 14);
      midCtx.fillRect(px + 14, 155, 10, 10);

      // Hanging iron torch bracket with flickering flame
      midCtx.fillStyle = '#111';
      midCtx.fillRect(px + 26, 110, 8, 4);
      midCtx.fillStyle = '#ff6d00'; // Flame
      midCtx.beginPath();
      midCtx.arc(px + 34, 108, 5, 0, Math.PI * 2);
      midCtx.fill();
      midCtx.fillStyle = '#ffeb3b';
      midCtx.beginPath();
      midCtx.arc(px + 34, 108, 2.5, 0, Math.PI * 2);
      midCtx.fill();
    });

    this.scene.textures.addCanvas('bg_forest', midCanvas);

    // 3. Foreground Playable Ground (Cobblestone Path & Roadside Grass)
    const { canvas: gCanvas, ctx: gCtx } = this.createCanvas(W, H);
    // Playable band Y = 155 to 270
    // Grassy border at top of path
    gCtx.fillStyle = '#1e3f20';
    gCtx.fillRect(0, 150, W, 18);
    // Grass tufts
    gCtx.fillStyle = '#2e7d32';
    for (let x = 0; x < W; x += 12) {
      gCtx.fillRect(x, 148, 4, 6);
      gCtx.fillRect(x + 2, 146, 2, 4);
      gCtx.fillRect(x + 6, 149, 3, 5);
    }

    // Dirt & Cobblestone Road Bed
    gCtx.fillStyle = '#373229'; // Roadbed dirt
    gCtx.fillRect(0, 165, W, 105);

    // 2.5D Cobblestone Pavers
    const stoneColors = ['#4a4439', '#575043', '#3e382f', '#615a4c'];
    for (let y = 168; y < 270; y += 14) {
      const rowOffset = (Math.floor(y / 14) % 2 === 0) ? 0 : 16;
      for (let x = -16 + rowOffset; x < W + 20; x += 32) {
        const color = stoneColors[Math.abs((x * 7 + y * 13)) % stoneColors.length];
        gCtx.fillStyle = color;
        // Rounded cobblestone block
        gCtx.fillRect(x + 2, y + 2, 28, 10);
        // Highlight edge
        gCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        gCtx.fillRect(x + 3, y + 2, 26, 2);
        // Shadow groove
        gCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        gCtx.fillRect(x + 2, y + 11, 28, 1);
        gCtx.fillRect(x + 29, y + 2, 1, 10);
      }
    }

    // Roadside bottom grass edge
    gCtx.fillStyle = '#1b381c';
    gCtx.fillRect(0, 265, W, 5);

    this.scene.textures.addCanvas('bg_ground', gCanvas);
  }

  // =========================================================================
  // 9. UI TEXTURES (Portrait, Magic Orbs, GO Arrow, Touch Controls)
  // =========================================================================
  createUITextures() {
    // 1. Elf Portrait (40x40)
    const { canvas: pCanvas, ctx: pCtx } = this.createCanvas(40, 40);
    // Gold ornamental border
    pCtx.fillStyle = '#d4af37';
    pCtx.fillRect(0, 0, 40, 40);
    pCtx.fillStyle = '#111827';
    pCtx.fillRect(2, 2, 36, 36);
    // Blonde elf portrait
    pCtx.fillStyle = '#ffe4c4'; // Face
    pCtx.fillRect(14, 14, 14, 15);
    pCtx.fillStyle = '#f5cba7';
    pCtx.fillRect(14, 25, 14, 4);
    // Pointed ear
    pCtx.fillStyle = '#ffe4c4';
    pCtx.fillRect(27, 18, 6, 4);
    pCtx.fillRect(31, 15, 4, 3);
    // Hair
    pCtx.fillStyle = '#ffe066';
    pCtx.fillRect(10, 6, 22, 9);
    pCtx.fillRect(8, 12, 6, 20);
    pCtx.fillRect(6, 18, 4, 16);
    // Circlet & cyan gem
    pCtx.fillStyle = '#e0e8f0';
    pCtx.fillRect(14, 11, 14, 3);
    pCtx.fillStyle = '#00e5ff';
    pCtx.fillRect(19, 10, 4, 4);
    // Emerald eye
    pCtx.fillStyle = '#2ecc71';
    pCtx.fillRect(21, 18, 3, 3);
    // Emerald tunic collar
    pCtx.fillStyle = '#27ae60';
    pCtx.fillRect(12, 29, 18, 9);
    this.scene.textures.addCanvas('hud_portrait_elf', pCanvas);

    // 2. Glowing Magic Orb (16x16)
    const { canvas: oCanvas, ctx: oCtx } = this.createCanvas(16, 16);
    oCtx.fillStyle = '#00acc1';
    oCtx.beginPath();
    oCtx.arc(8, 8, 7, 0, Math.PI * 2);
    oCtx.fill();
    oCtx.fillStyle = '#00e5ff';
    oCtx.beginPath();
    oCtx.arc(7, 7, 5, 0, Math.PI * 2);
    oCtx.fill();
    oCtx.fillStyle = '#ffffff';
    oCtx.fillRect(5, 4, 3, 3);
    this.scene.textures.addCanvas('hud_orb', oCanvas);

    // 3. Empty Magic Slot (16x16)
    const { canvas: oeCanvas, ctx: oeCtx } = this.createCanvas(16, 16);
    oeCtx.strokeStyle = '#37474f';
    oeCtx.lineWidth = 2;
    oeCtx.strokeRect(2, 2, 12, 12);
    this.scene.textures.addCanvas('hud_orb_empty', oeCanvas);

    // 4. Flashing "GO -->" Arcade Arrow Indicator (48x24)
    const { canvas: goCanvas, ctx: goCtx } = this.createCanvas(48, 24);
    goCtx.fillStyle = '#f1c40f'; // Bright yellow
    // "GO" text
    goCtx.font = 'bold 16px monospace';
    goCtx.fillText('GO', 4, 18);
    // Arrow
    goCtx.fillRect(28, 9, 10, 6);
    goCtx.beginPath();
    goCtx.moveTo(38, 5); goCtx.lineTo(46, 12); goCtx.lineTo(38, 19);
    goCtx.fill();
    this.scene.textures.addCanvas('hud_arrow_go', goCanvas);

    // 5. Virtual D-pad and Action Buttons
    this.createVirtualPadTextures();
  }

  createVirtualPadTextures() {
    // D-Pad Base (120x120)
    const { canvas: dpCanvas, ctx: dpCtx } = this.createCanvas(120, 120);
    dpCtx.fillStyle = 'rgba(20, 25, 35, 0.65)';
    dpCtx.beginPath();
    dpCtx.arc(60, 60, 56, 0, Math.PI * 2);
    dpCtx.fill();
    dpCtx.strokeStyle = 'rgba(245, 176, 65, 0.5)';
    dpCtx.lineWidth = 3;
    dpCtx.stroke();

    // D-Pad Cross
    dpCtx.fillStyle = '#2c3e50';
    dpCtx.fillRect(45, 16, 30, 88);
    dpCtx.fillRect(16, 45, 88, 30);
    // Direction arrows
    dpCtx.fillStyle = '#ecf0f1';
    // Up
    dpCtx.beginPath(); dpCtx.moveTo(60, 22); dpCtx.lineTo(52, 32); dpCtx.lineTo(68, 32); dpCtx.fill();
    // Down
    dpCtx.beginPath(); dpCtx.moveTo(60, 98); dpCtx.lineTo(52, 88); dpCtx.lineTo(68, 88); dpCtx.fill();
    // Left
    dpCtx.beginPath(); dpCtx.moveTo(22, 60); dpCtx.lineTo(32, 52); dpCtx.lineTo(32, 68); dpCtx.fill();
    // Right
    dpCtx.beginPath(); dpCtx.moveTo(98, 60); dpCtx.lineTo(88, 52); dpCtx.lineTo(88, 68); dpCtx.fill();
    this.scene.textures.addCanvas('pad_dpad', dpCanvas);

    // Action Buttons: Attack (Red/Sword), Jump (Green/Boot), Guard (Blue/Shield), Magic (Purple/Star)
    const buttonConfigs = [
      { key: 'pad_btn_attack', label: 'ATK', color: '#c0392b', border: '#e74c3c' },
      { key: 'pad_btn_jump',   label: 'JMP', color: '#27ae60', border: '#2ecc71' },
      { key: 'pad_btn_guard',  label: 'GRD', color: '#2980b9', border: '#3498db' },
      { key: 'pad_btn_magic',  label: 'MAG', color: '#8e44ad', border: '#9b59b6' }
    ];

    buttonConfigs.forEach(b => {
      const { canvas, ctx } = this.createCanvas(56, 56);
      // Outer glow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(28, 28, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(28, 28, 23, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = b.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, 28, 28);
      this.scene.textures.addCanvas(b.key, canvas);
    });
  }
}

window.AssetGenerator = AssetGenerator;
