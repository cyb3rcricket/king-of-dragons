/**
 * The King of Dragons - Authentic 16-Bit SNES HUD System
 * Displays player portrait, HP bar, Magic orbs, Level, EXP, Score, Gold,
 * Boss HP bar, flashing "GO -->" indicator, and floating combat text.
 */

class HUD {
  constructor(scene) {
    this.scene = scene;

    // HUD Container fixed to camera screen
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.depth = 10000; // Above all sprites and vfx

    this.createHUD();
  }

  createHUD() {
    // 1. Top HUD Background Bar
    const bgBar = this.scene.add.graphics();
    bgBar.fillStyle(0x0a0c10, 0.85);
    bgBar.fillRect(0, 0, 480, 36);
    bgBar.lineStyle(1, 0x2c3340, 1.0);
    bgBar.lineBetween(0, 36, 480, 36);
    this.container.add(bgBar);

    // 2. Elf Portrait Frame
    const portrait = this.scene.add.image(22, 18, 'hud_portrait_elf');
    portrait.setScale(0.75);
    this.container.add(portrait);

    // 3. Name & Level Text
    this.nameText = this.scene.add.text(42, 4, 'ELF LV.1', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffd700'
    });
    this.container.add(this.nameText);

    // 4. HP Bar Graphics (Fallback) & High-Res Bar
    this.hpGraphics = this.scene.add.graphics();
    this.container.add(this.hpGraphics);

    this.hasHdBar = this.scene.textures.exists('bar_frame') && this.scene.textures.exists('bar_fill');
    if (this.hasHdBar) {
      const barX = 42;
      const barY = 16;
      this.hpBarFill = this.scene.add.image(barX, barY, 'bar_fill').setScale(0.075, 0.050).setOrigin(0, 0.5);
      this.hpBarFrame = this.scene.add.image(barX, barY, 'bar_frame').setScale(0.075, 0.050).setOrigin(0, 0.5);
      this.container.add(this.hpBarFill);
      this.container.add(this.hpBarFrame);
    }

    // 5. EXP Bar Graphics
    this.expGraphics = this.scene.add.graphics();
    this.container.add(this.expGraphics);

    // 6. Magic Orbs Container
    this.orbsContainer = this.scene.add.container(42, 25);
    this.container.add(this.orbsContainer);

    // Buffs Container (Active equipment boosts)
    this.buffContainer = this.scene.add.container(185, 14);
    this.container.add(this.buffContainer);

    // 7. Score & Gold (Top Right)
    this.scoreText = this.scene.add.text(470, 4, 'SCORE 000000', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(1, 0);
    this.container.add(this.scoreText);

    if (this.scene.textures.exists('icon_gold_coin')) {
      this.goldCoinIcon = this.scene.add.image(406, 23, 'icon_gold_coin').setScale(0.013);
      this.container.add(this.goldCoinIcon);
    }

    this.goldText = this.scene.add.text(470, 18, 'GOLD 0000', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(1, 0);
    this.container.add(this.goldText);

    // 8. Flashing "GO -->" Indicator
    this.goArrow = this.scene.add.image(440, 60, 'hud_arrow_go');
    this.goArrow.setVisible(false);
    this.container.add(this.goArrow);

    // Pulsing tween for GO arrow
    this.scene.tweens.add({
      targets: this.goArrow,
      x: 450,
      alpha: { from: 1, to: 0.3 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    // 9. Boss Health Bar (Bottom Center, hidden until boss appears)
    this.bossBarContainer = this.scene.add.container(240, 250);
    this.bossBarContainer.setVisible(false);
    this.container.add(this.bossBarContainer);

    const bossBg = this.scene.add.graphics();
    bossBg.fillStyle(0x000000, 0.85);
    bossBg.fillRoundedRect(-140, -18, 280, 24, 3);
    bossBg.lineStyle(1, 0xffd700, 0.9);
    bossBg.strokeRoundedRect(-140, -18, 280, 24, 3);
    this.bossBarContainer.add(bossBg);

    this.bossNameText = this.scene.add.text(0, -14, 'ORC WARLORD GORGOK', {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#ff5252'
    }).setOrigin(0.5, 0);
    this.bossBarContainer.add(this.bossNameText);

    this.bossHpGraphics = this.scene.add.graphics();
    this.bossBarContainer.add(this.bossHpGraphics);

    this.hasHdBossBar = this.scene.textures.exists('bar_frame') && this.scene.textures.exists('bar_fill');
    if (this.hasHdBossBar) {
      this.bossBarFill = this.scene.add.image(-135, 1, 'bar_fill').setScale(0.150, 0.055).setOrigin(0, 0.5);
      this.bossBarFrame = this.scene.add.image(-135, 1, 'bar_frame').setScale(0.150, 0.055).setOrigin(0, 0.5);
      this.bossBarContainer.add(this.bossBarFill);
      this.bossBarContainer.add(this.bossBarFrame);
    }

    // 10. Warning Siren Banner (for Boss entrance)
    this.warningBanner = this.scene.add.container(240, 135);
    this.warningBanner.setVisible(false);
    this.container.add(this.warningBanner);

    const warnBg = this.scene.add.graphics();
    warnBg.fillStyle(0xd50000, 0.8);
    warnBg.fillRect(-240, -22, 480, 44);
    warnBg.lineStyle(2, 0xffff00, 1);
    warnBg.lineBetween(-240, -22, 240, -22);
    warnBg.lineBetween(-240, 22, 240, 22);
    this.warningBanner.add(warnBg);

    if (this.scene.textures.exists('panel_dialog')) {
      const warnPlaque = this.scene.add.image(0, 0, 'panel_dialog').setScale(0.27, 0.055);
      this.warningBanner.add(warnPlaque);
    }

    const warnText = this.scene.add.text(0, 0, 'WARNING! BOSS APPROACHING!', {
      fontFamily: 'monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    this.warningBanner.add(warnText);
  }

  update(player, boss) {
    if (!player) return;

    // 1. Update Name & Level
    this.nameText.setText(`ELF LV.${player.level}`);

    // Buff Badges
    this.buffContainer.removeAll(true);
    let buffOffset = 0;
    if (player.swordBuffTimer > 0 && this.scene.textures.exists('icon_sword')) {
      const sw = this.scene.add.image(buffOffset, 0, 'icon_sword').setScale(0.014);
      this.buffContainer.add(sw);
      buffOffset += 14;
    }
    if (player.shieldBuffTimer > 0 && this.scene.textures.exists('icon_shield')) {
      const sh = this.scene.add.image(buffOffset, 0, 'icon_shield').setScale(0.013);
      this.buffContainer.add(sh);
    }

    // 2. Render HP Bar
    this.displayHp = Phaser.Math.Linear(this.displayHp !== undefined ? this.displayHp : player.hp, player.hp, 0.2);
    const hpRatio = Phaser.Math.Clamp(this.displayHp / player.maxHp, 0, 1);

    if (this.hasHdBar && this.hpBarFill) {
      const cropW = Math.max(0, Math.round(1792 * hpRatio));
      this.hpBarFill.setCrop(0, 0, cropW, 1008);

      if (hpRatio < 0.25) {
        this.hpBarFill.setTint(0xff2222);
        this.hpBarFill.setAlpha(0.6 + Math.sin(this.scene.time.now / 100) * 0.4);
      } else if (hpRatio < 0.55) {
        this.hpBarFill.setTint(0xffb74d);
        this.hpBarFill.setAlpha(1.0);
      } else {
        this.hpBarFill.clearTint();
        this.hpBarFill.setAlpha(1.0);
      }
    } else {
      this.hpGraphics.clear();
      const hpX = 42;
      const hpY = 15;
      const maxBarW = 110;
      const barH = 6;

      // HP Bar Frame / Bevel
      this.hpGraphics.fillStyle(0x1a1a1a, 1.0);
      this.hpGraphics.fillRect(hpX, hpY, maxBarW, barH);
      this.hpGraphics.lineStyle(1, 0x4a5568, 1.0);
      this.hpGraphics.strokeRect(hpX - 1, hpY - 1, maxBarW + 2, barH + 2);

      const curHpW = Math.round(maxBarW * hpRatio);
      let hpColor = 0x2ecc71; // Green
      if (hpRatio < 0.3) hpColor = 0xe74c3c; // Red
      else if (hpRatio < 0.6) hpColor = 0xf39c12; // Yellow

      this.hpGraphics.fillStyle(hpColor, 1.0);
      this.hpGraphics.fillRect(hpX, hpY, curHpW, barH);

      // HP Highlight line
      this.hpGraphics.fillStyle(0xffffff, 0.4);
      this.hpGraphics.fillRect(hpX, hpY, curHpW, 1);
    }

    // 3. Render EXP Bar
    this.expGraphics.clear();
    const expX = 42;
    const expY = this.hasHdBar ? 21 : 22;
    const maxBarW = 110;
    const expRatio = Phaser.Math.Clamp(player.exp / player.expNext, 0, 1);
    this.expGraphics.fillStyle(0x2d3748, 1.0);
    this.expGraphics.fillRect(expX, expY, maxBarW, 2);
    this.expGraphics.fillStyle(0xd4af37, 1.0);
    this.expGraphics.fillRect(expX, expY, Math.round(maxBarW * expRatio), 2);

    // 4. Render Magic Orbs / Mana Flasks
    this.orbsContainer.removeAll(true);
    const usePotionIcon = this.scene.textures.exists('icon_mana_potion');
    for (let i = 0; i < player.maxMagicOrbs; i++) {
      if (i < player.magicOrbs) {
        if (usePotionIcon) {
          const pot = this.scene.add.image(i * 14 + 6, 2, 'icon_mana_potion').setScale(0.013);
          this.orbsContainer.add(pot);
        } else {
          const orb = this.scene.add.image(i * 12 + 6, 2, 'hud_orb').setScale(0.7);
          this.orbsContainer.add(orb);
        }
      } else {
        const orb = this.scene.add.image(i * (usePotionIcon ? 14 : 12) + 6, 2, 'hud_orb_empty').setScale(0.7);
        this.orbsContainer.add(orb);
      }
    }

    // 5. Score & Gold
    const scoreStr = player.score.toString().padStart(6, '0');
    this.scoreText.setText(`SCORE ${scoreStr}`);
    const goldStr = player.gold.toString().padStart(4, '0');
    this.goldText.setText(`GOLD ${goldStr}`);

    // 6. Boss HP Bar
    if (boss && boss.isAlive()) {
      this.bossBarContainer.setVisible(true);
      const bRatio = Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1);

      if (this.hasHdBossBar && this.bossBarFill) {
        const cropW = Math.max(0, Math.round(1792 * bRatio));
        this.bossBarFill.setCrop(0, 0, cropW, 1008);
        this.bossBarFill.setTint(boss.isEnraged ? 0xff1744 : 0xff7043);
      } else {
        this.bossHpGraphics.clear();
        const bBarW = 250;
        const bBarH = 5;
        const bx = -125;
        const by = -2;

        // Boss bar frame
        this.bossHpGraphics.fillStyle(0x212121, 1.0);
        this.bossHpGraphics.fillRect(bx, by, bBarW, bBarH);

        const bCurW = Math.round(bBarW * bRatio);
        const bColor = boss.isEnraged ? 0xff1744 : 0xff9100;

        this.bossHpGraphics.fillStyle(bColor, 1.0);
        this.bossHpGraphics.fillRect(bx, by, bCurW, bBarH);
        this.bossHpGraphics.fillStyle(0xffffff, 0.4);
        this.bossHpGraphics.fillRect(bx, by, bCurW, 1);
      }
    } else {
      this.bossBarContainer.setVisible(false);
    }
  }

  setGoVisible(visible) {
    this.goArrow.setVisible(visible);
  }

  showFloatingText(worldX, worldY, text, color = '#ffffff') {
    // Convert world position to screen coordinates
    const cam = this.scene.cameras.main;
    const screenX = worldX - cam.scrollX;
    const screenY = worldY - cam.scrollY;

    const floatText = this.scene.add.text(screenX, screenY, text, {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.container.add(floatText);

    this.scene.tweens.add({
      targets: floatText,
      y: screenY - 24,
      alpha: 0,
      duration: 650,
      ease: 'Power1',
      onComplete: () => floatText.destroy()
    });
  }

  showBossWarning(callback) {
    this.warningBanner.setVisible(true);
    this.warningBanner.setAlpha(0);

    window.SoundEngine.playBossRoar();

    // Flashing warning animation
    this.scene.tweens.add({
      targets: this.warningBanner,
      alpha: 1,
      duration: 200,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.warningBanner.setVisible(false);
        if (callback) callback();
      }
    });
  }
}

window.HUD = HUD;
