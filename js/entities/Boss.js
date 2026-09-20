/**
 * The King of Dragons - Stage 1 Boss: Orc Warlord Gorgok
 * Dual-morningstar champion with leaping ground pounds, shockwaves,
 * and a 50% HP berserk rage phase with minion summoning.
 */

class Boss extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');

    this.name = "ORC WARLORD GORGOK";
    this.hp = 380;
    this.maxHp = 380;
    this.speedX = 75;
    this.speedY = 55;
    this.damage = 18;
    this.expValue = 500;
    this.goldValue = 350;
    this.attackRangeX = 64;
    this.attackRangeY = 22;
    this.attackCooldown = 1500;

    this.isEnraged = false;
    this.isSuperArmor = true; // Does not easily flinch on light attacks
    this.lastSmashTime = 0;
    this.smashCooldown = 4500;

    // Bigger shadow
    this.shadow.setScale(1.4, 1.0);
  }

  runAI(delta, player) {
    const distX = player.x - this.x;
    const distY = player.groundY - this.groundY;
    const absX = Math.abs(distX);
    const absY = Math.abs(distY);

    this.facing = distX > 0 ? 1 : -1;
    this.sprite.setFlipX(this.facing < 0);

    const now = this.scene.time.now;

    // Check Berserk Phase trigger (<= 50% HP)
    if (!this.isEnraged && this.hp <= this.maxHp * 0.5) {
      this.triggerEnrage();
      return;
    }

    // Ground Pound Leap Attack
    if (now - this.lastSmashTime > this.smashCooldown && absX > 70 && absX < 280) {
      this.performGroundSmash(player);
      return;
    }

    // Standard Boss Attack or Movement
    const canAttack = now - this.lastAttackTime > this.attackCooldown;
    if (absX <= this.attackRangeX && absY <= this.attackRangeY) {
      if (canAttack) {
        this.performMorningstarSwing(player);
      } else {
        this.state = 'IDLE';
        this.playAnim('boss_idle');
      }
      return;
    }

    // 2.5D tracking
    let moveX = 0;
    let moveY = 0;
    if (absY > this.attackRangeY - 4) moveY = Math.sign(distY);
    if (absX > this.attackRangeX - 8) moveX = Math.sign(distX);

    if (moveX !== 0 || moveY !== 0) {
      this.state = 'APPROACH';
      this.playAnim('boss_walk');
      const dt = delta / 1000;
      this.x += moveX * this.speedX * dt;
      this.groundY += moveY * this.speedY * dt;
      this.groundY = Phaser.Math.Clamp(this.groundY, 160, 265);
    }
  }

  performMorningstarSwing(player) {
    this.state = 'ATTACK';
    this.lastAttackTime = this.scene.time.now;
    this.playAnim('boss_swing');

    // Morningstar impact timing
    this.scene.time.delayedCall(360, () => {
      if (this.state === 'ATTACK' && this.isAlive()) {
        const absX = Math.abs(player.x - this.x);
        const absY = Math.abs(player.groundY - this.groundY);

        if (absX <= this.attackRangeX + 20 && absY <= this.attackRangeY + 8) {
          player.takeDamage(this.damage, this.x, true);
          this.scene.cameras.main.shake(180, 0.01);
        }
      }
    });

    this.scene.time.delayedCall(700, () => {
      if (this.state === 'ATTACK') {
        this.state = 'APPROACH';
      }
    });
  }

  performGroundSmash(player) {
    this.state = 'ATTACK';
    this.lastSmashTime = this.scene.time.now;
    this.playAnim('boss_smash');

    // Leap airborne
    this.scene.tweens.add({
      targets: this,
      jumpZ: 40,
      duration: 350,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.jumpZ = 0;
        if (!this.isAlive()) return;

        // Ground Slam Impact!
        window.SoundEngine.playBossSmash();
        this.scene.cameras.main.shake(350, 0.016);

        // Spawn Ground Shockwave Ripples (Left and Right)
        this.spawnShockwave(this.x - 24, this.groundY, -1);
        this.spawnShockwave(this.x + 24, this.groundY, 1);

        // Direct hit damage if player is close
        const absX = Math.abs(player.x - this.x);
        const absY = Math.abs(player.groundY - this.groundY);
        if (absX < 55 && absY < 24) {
          player.takeDamage(24, this.x, true);
        }

        this.scene.time.delayedCall(450, () => {
          if (this.state === 'ATTACK') {
            this.state = 'APPROACH';
          }
        });
      }
    });
  }

  spawnShockwave(startX, groundY, dir) {
    const sw = this.scene.add.image(startX, groundY, 'shockwave');
    sw.setOrigin(0.5, 0.5);
    sw.depth = groundY;

    this.scene.tweens.add({
      targets: sw,
      x: startX + dir * 140,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.2,
      duration: 500,
      onUpdate: () => {
        // Shockwave damage check
        const player = this.scene.player;
        if (player && player.state !== 'DEAD') {
          const dx = Math.abs(player.x - sw.x);
          const dy = Math.abs(player.groundY - sw.y);
          if (dx < 20 && dy < 18 && !player.isJumping) {
            player.takeDamage(12, sw.x, true);
          }
        }
      },
      onComplete: () => sw.destroy()
    });
  }

  triggerEnrage() {
    this.isEnraged = true;
    this.speedX = 105;
    this.speedY = 75;
    this.attackCooldown = 950;
    this.smashCooldown = 3200;
    this.sprite.setTint(0xff5555); // Crimson rage glow

    window.SoundEngine.playBossRoar();
    this.scene.cameras.main.shake(600, 0.018);
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 45, "BERSERK RAGE!", "#ff1744");

    // Summon minion backup
    this.scene.spawnEnrageMinions();
  }

  takeDamage(damage, attackerX, isKnockdown = false) {
    if (this.state === 'DEAD') return;

    this.hp -= damage;
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 25, `-${damage}`, "#ffd54f");

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return;
    }

    // Boss super armor: only flinches if hit by heavy attack or magic
    if (isKnockdown && !this.isEnraged) {
      this.state = 'HURT';
      this.flinchTimer = 250;
      this.pushbackVx = (attackerX < this.x ? 1 : -1) * 45;
      this.playAnim('boss_hurt');
      window.SoundEngine.playOrcHurt();
    }
  }

  die() {
    this.state = 'DEAD';
    this.playAnim('boss_die');
    window.SoundEngine.playBossRoar();

    // Slow motion dramatic victory sequence
    this.scene.time.timeScale = 0.5;
    this.scene.cameras.main.flash(500, 255, 255, 255);
    this.scene.cameras.main.shake(800, 0.02);

    // Multi-explosions on boss
    for (let i = 0; i < 6; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        const ox = this.x + Phaser.Math.Between(-25, 25);
        const oy = this.groundY - Phaser.Math.Between(10, 45);
        this.scene.player.spawnHitSpark(ox, oy);
        window.SoundEngine.playHit(true);
      });
    }

    // Shower of gold and jewels
    this.scene.time.delayedCall(900, () => {
      this.scene.time.timeScale = 1.0;
      this.dropTreasureBurst();
      this.scene.handleBossDefeated();
    });

    this.scene.tweens.add({
      targets: [this.sprite, this.shadow],
      alpha: 0,
      duration: 1200,
      delay: 1000,
      onComplete: () => this.destroy()
    });
  }

  dropTreasureBurst() {
    // 6 Gold Coins
    for (let i = 0; i < 6; i++) {
      const rx = this.x + Phaser.Math.Between(-50, 50);
      const ry = this.groundY + Phaser.Math.Between(-20, 20);
      this.scene.spawnPickup(rx, ry, 'coin', 50);
    }
    // 3 Blue Gems
    for (let i = 0; i < 3; i++) {
      const rx = this.x + Phaser.Math.Between(-40, 40);
      const ry = this.groundY + Phaser.Math.Between(-15, 15);
      this.scene.spawnPickup(rx, ry, 'gem_blue', 100);
    }
    // 2 Red Rubies
    for (let i = 0; i < 2; i++) {
      const rx = this.x + Phaser.Math.Between(-30, 30);
      const ry = this.groundY + Phaser.Math.Between(-10, 10);
      this.scene.spawnPickup(rx, ry, 'gem_red', 150);
    }
    // Roast Meat
    this.scene.spawnPickup(this.x, this.groundY, 'meat', 50);
  }
}

window.Boss = Boss;
