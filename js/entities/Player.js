/**
 * Untitled Dragon Brawler - Player Entity: Female Elf Warrior
 * Handles 2.5D belt-scroll movement, 3-hit melee combo, jump attacks,
 * shield guarding, magic storm, RPG leveling, and sprite depth sorting.
 */

class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // 2.5D Spatial Coordinates
    this.x = x;
    this.groundY = y;
    this.jumpZ = 0;
    this.vz = 0;
    this.isJumping = false;
    this.speedX = 175;
    this.speedY = 110;
    this.facing = 1; // 1 = right, -1 = left

    // Ground playable bounds
    this.minY = 160;
    this.maxY = 265;

    // RPG Stats & Progression
    this.level = 1;
    this.exp = 0;
    this.expNext = 150;
    this.hp = 100;
    this.maxHp = 100;
    this.magicOrbs = 3;
    this.maxMagicOrbs = 3;
    this.baseDamage = 12;
    this.score = 0;
    this.gold = 0;

    // Combat & State Machine
    this.state = 'IDLE'; // IDLE, WALK, ATTACK1, ATTACK2, ATTACK3, JUMP, JUMP_ATTACK, GUARD, MAGIC, HURT, DEAD
    this.comboStep = 0;
    this.comboResetTimer = 0;
    this.attackBuffer = false;
    this.invulnerableTimer = 0;
    this.isGuarding = false;
    this.isAttacking = false;

    // Temporary Equipment Buffs
    this.swordBuffTimer = 0;
    this.shieldBuffTimer = 0;
    this.swordBonusDamage = 0;
    this.auraTimer = 0;

    // Create Ground Shadow Sprite
    this.shadow = scene.add.image(this.x, this.groundY, 'shadow');
    this.shadow.setOrigin(0.5, 0.5);
    this.shadow.setAlpha(0.5);

    // Create Main Character Sprite
    this.sprite = scene.add.sprite(this.x, this.groundY, 'elf', 0);
    this.sprite.setOrigin(0.5, 0.85);

    // Dust particles emitter or sprite
    this.dustTimer = 0;
  }

  update(delta, input) {
    if (this.state === 'DEAD') return;

    // Decrement timers
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      this.sprite.setAlpha((Math.floor(this.scene.time.now / 60) % 2 === 0) ? 0.3 : 1.0);
      if (this.invulnerableTimer <= 0) {
        this.sprite.setAlpha(1.0);
      }
    }

    // Equipment Buff Timers & Visual Aura
    if (this.swordBuffTimer > 0) {
      this.swordBuffTimer -= delta;
      if (this.swordBuffTimer <= 0) {
        this.swordBonusDamage = 0;
      }
    }
    if (this.shieldBuffTimer > 0) {
      this.shieldBuffTimer -= delta;
    }

    if (this.swordBuffTimer > 0 || this.shieldBuffTimer > 0) {
      this.auraTimer += delta;
      if (this.auraTimer > 180) {
        this.auraTimer = 0;
        if (this.swordBuffTimer > 0) {
          const spk = this.scene.add.image(this.x + Phaser.Math.Between(-10, 10), this.groundY - 18, 'hit_spark', 0);
          spk.depth = this.groundY + 1;
          spk.setScale(0.6);
          spk.setTint(0xff9900);
          this.scene.tweens.add({ targets: spk, y: spk.y - 14, alpha: 0, duration: 250, onComplete: () => spk.destroy() });
        }
        if (this.shieldBuffTimer > 0) {
          const shd = this.scene.add.image(this.x + Phaser.Math.Between(-10, 10), this.groundY - 18, 'guard_spark', 0);
          shd.depth = this.groundY + 1;
          shd.setScale(0.6);
          shd.setTint(0x00e5ff);
          this.scene.tweens.add({ targets: shd, alpha: 0, duration: 250, onComplete: () => shd.destroy() });
        }
      }
    }

    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= delta;
      if (this.comboResetTimer <= 0) {
        this.comboStep = 0;
      }
    }

    // Process Jump Physics (Z-axis elevation)
    if (this.isJumping) {
      this.jumpZ += this.vz * (delta / 1000);
      this.vz -= 850 * (delta / 1000); // Gravity

      if (this.jumpZ <= 0) {
        this.jumpZ = 0;
        this.vz = 0;
        this.isJumping = false;
        if (this.state === 'JUMP' || this.state === 'JUMP_ATTACK') {
          this.state = 'IDLE';
          this.playAnim('elf_idle');
          this.createDustPuff();
        }
      }
    }

    // Handle Input & States
    if (this.state !== 'HURT' && this.state !== 'MAGIC' && !this.isAttacking) {
      this.handleMovementAndActions(delta, input);
    }

    // Sync Sprite and Shadow Positions
    this.sprite.x = this.x;
    this.sprite.y = this.groundY - this.jumpZ;
    this.sprite.depth = this.groundY + 1; // 2.5D depth sorting

    this.shadow.x = this.x;
    this.shadow.y = this.groundY;
    this.shadow.depth = this.groundY - 1;
    // Scale shadow with jump height
    const shadowScale = Math.max(0.3, 1.0 - this.jumpZ / 120);
    this.shadow.setScale(shadowScale);
    this.shadow.setAlpha(shadowScale * 0.5);

    // Clamp within level camera bounds
    this.clampToBounds();
  }

  handleMovementAndActions(delta, input) {
    // 1. Guard Check (Hold Space / Shift)
    if (input.guard && !this.isJumping) {
      this.state = 'GUARD';
      this.isGuarding = true;
      this.playAnim('elf_guard');
      return;
    } else if (this.state === 'GUARD') {
      this.isGuarding = false;
      this.state = 'IDLE';
    }

    // 2. Magic Special Check (Press L / C)
    if (input.magicJustPressed) {
      this.castMagic();
      return;
    }

    // 3. Attack Check (Press J / Z)
    if (input.attackJustPressed) {
      if (this.isJumping) {
        this.performJumpAttack();
        return;
      } else {
        this.performComboAttack();
        return;
      }
    }

    // 4. Jump Check (Press K / X)
    if (input.jumpJustPressed && !this.isJumping) {
      this.isJumping = true;
      this.vz = 360;
      this.state = 'JUMP';
      this.playAnim('elf_jump');
      this.createDustPuff();
      return;
    }

    // 5. 8-Directional Belt-Scroll Movement
    let dx = 0;
    let dy = 0;

    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      // Normalize diagonal speed
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (dx !== 0 || dy !== 0) {
      this.x += dx * this.speedX * (delta / 1000);
      this.groundY += dy * this.speedY * (delta / 1000);

      // Clamp groundY
      this.groundY = Phaser.Math.Clamp(this.groundY, this.minY, this.maxY);

      if (dx !== 0) {
        this.facing = dx > 0 ? 1 : -1;
        this.sprite.setFlipX(this.facing < 0);
      }

      if (!this.isJumping) {
        this.state = 'WALK';
        this.playAnim('elf_walk');
        // Spawn footstep dust occasionally
        this.dustTimer += delta;
        if (this.dustTimer > 280) {
          this.dustTimer = 0;
          this.createDustPuff();
        }
      }
    } else if (!this.isJumping) {
      this.state = 'IDLE';
      this.playAnim('elf_idle');
    }
  }

  // 3-Hit Melee Combo Chain
  performComboAttack() {
    this.isAttacking = true;
    this.comboStep = (this.comboStep % 3) + 1;
    this.comboResetTimer = 550; // combo window

    if (this.comboStep === 1) {
      this.state = 'ATTACK1';
      this.playAnim('elf_attack1');
      window.SoundEngine.playSwordSwing(1);
      this.spawnSlashVFX(1);
      this.checkMeleeHits(this.baseDamage, false, 48);
    } else if (this.comboStep === 2) {
      this.state = 'ATTACK2';
      this.playAnim('elf_attack2');
      window.SoundEngine.playSwordSwing(2);
      this.spawnSlashVFX(2);
      this.checkMeleeHits(Math.round(this.baseDamage * 1.3), false, 54);
    } else if (this.comboStep === 3) {
      this.state = 'ATTACK3';
      this.playAnim('elf_attack3');
      window.SoundEngine.playSwordSwing(3);
      this.spawnSlashVFX(3);
      this.checkMeleeHits(Math.round(this.baseDamage * 2.2), true, 68); // Knockdown hit!
      this.scene.cameras.main.shake(120, 0.006);
    }

    // Attack cooldown / recovery
    const animDur = this.comboStep === 3 ? 380 : 250;
    this.scene.time.delayedCall(animDur, () => {
      this.isAttacking = false;
      if (this.state.startsWith('ATTACK')) {
        this.state = 'IDLE';
        this.playAnim('elf_idle');
      }
    });
  }

  // Jump dive attack
  performJumpAttack() {
    this.isAttacking = true;
    this.state = 'JUMP_ATTACK';
    this.playAnim('elf_jump_attack');
    window.SoundEngine.playSwordSwing(2);
    this.spawnSlashVFX(2);
    this.checkMeleeHits(Math.round(this.baseDamage * 1.6), true, 55);

    this.scene.time.delayedCall(300, () => {
      this.isAttacking = false;
    });
  }

  // Magic Special: Elven Elemental Storm
  castMagic() {
    // Check orbs or sacrifice HP
    if (this.magicOrbs <= 0) {
      if (this.hp > 15) {
        this.hp -= 15;
        this.scene.hud.showFloatingText(this.x, this.sprite.y - 30, "-15 HP CAST", "#ff5252");
      } else {
        return; // Not enough magic or health
      }
    } else {
      this.magicOrbs--;
    }

    this.state = 'MAGIC';
    this.isAttacking = true;
    this.invulnerableTimer = 2200; // Invulnerable during cast
    this.playAnim('elf_magic');

    window.SoundEngine.playMagicStorm();

    // Visual: Arcane Magic Circle under player
    const circle = this.scene.add.image(this.x, this.groundY, 'magic_circle');
    circle.setOrigin(0.5, 0.5);
    circle.depth = this.groundY - 1;
    circle.setScale(0.2);

    this.scene.tweens.add({
      targets: circle,
      scale: 1.2,
      angle: 360,
      alpha: { from: 1, to: 0 },
      duration: 1800,
      onComplete: () => circle.destroy()
    });

    // Screen Flash & Camera Shake
    this.scene.cameras.main.flash(400, 255, 255, 255);
    this.scene.cameras.main.shake(600, 0.015);

    // Lightning Strikes on all active enemies
    this.scene.time.delayedCall(320, () => {
      this.scene.enemies.forEach(enemy => {
        if (enemy && enemy.isAlive()) {
          // Lightning bolt visual
          const bolt = this.scene.add.image(enemy.x, enemy.groundY - 110, 'lightning');
          bolt.setOrigin(0.5, 0.5);
          bolt.depth = 999;
          this.scene.tweens.add({
            targets: bolt,
            alpha: 0,
            duration: 350,
            onComplete: () => bolt.destroy()
          });

          // Massive damage & knockdown
          enemy.takeDamage(45 + this.level * 8, this.x, true);
        }
      });

      // Also damage breakable barrels
      this.scene.barrels.forEach(barrel => {
        if (barrel && !barrel.broken) {
          barrel.breakBarrel();
        }
      });
    });

    this.scene.time.delayedCall(1200, () => {
      this.state = 'IDLE';
      this.isAttacking = false;
      this.playAnim('elf_idle');
    });
  }

  // 2.5D Hurtbox
  getHurtbox() {
    const width = 24;
    const height = 48;
    return {
      x: this.x - width / 2,
      y: this.groundY - height,
      width: width,
      height: height,
      zDepthTolerance: 20
    };
  }

  // 2.5D Melee Attack Hitbox
  getAttackHitbox(reachX = 48) {
    const height = 48;
    return {
      x: this.facing > 0 ? this.x : this.x - reachX,
      y: this.groundY - height,
      width: reachX,
      height: height,
      zDepthTolerance: 24
    };
  }

  // Hit Detection for Melee Attacks
  checkMeleeHits(damage, isKnockdown, reachX) {
    const hitbox = this.getAttackHitbox(reachX);

    // Check hit against all alive enemies
    this.scene.enemies.forEach(enemy => {
      if (!enemy || !enemy.isAlive()) return;

      // 2.5D Depth test: characters must be roughly on same horizontal plane
      const depthDiff = Math.abs(this.groundY - enemy.groundY);
      if (depthDiff > hitbox.zDepthTolerance) return;

      // Horizontal reach check
      const horizontalDist = (enemy.x - this.x) * this.facing;
      if (horizontalDist > 0 && horizontalDist <= reachX + 16) {
        // Hit connected!
        const actualDamage = damage + this.swordBonusDamage + Phaser.Math.Between(0, 4);
        enemy.takeDamage(actualDamage, this.x, isKnockdown);

        // Hit spark visual
        this.spawnHitSpark(enemy.x, enemy.sprite.y - 12);
        if (this.swordBonusDamage > 0) {
          // Extra golden critical sparks on weapon surge!
          const critSpark = this.scene.add.image(enemy.x, enemy.sprite.y - 12, 'hit_spark', 0);
          critSpark.depth = 1000;
          critSpark.setScale(1.3);
          critSpark.setTint(0xff9800);
          this.scene.tweens.add({ targets: critSpark, alpha: 0, scale: 1.7, duration: 200, onComplete: () => critSpark.destroy() });
        }
        // Hitstop sensation (classic arcade-style freeze)
        this.scene.triggerHitstop(50);
        // Sound
        window.SoundEngine.playHit(isKnockdown);
      }
    });

    // Check hit against barrels
    this.scene.barrels.forEach(barrel => {
      if (!barrel || barrel.broken) return;
      const depthDiff = Math.abs(this.groundY - barrel.groundY);
      if (depthDiff > 24) return;
      const dist = (barrel.x - this.x) * this.facing;
      if (dist > 0 && dist <= reachX + 10) {
        barrel.hitBarrel();
        this.spawnHitSpark(barrel.x, barrel.groundY - 14);
        window.SoundEngine.playHit(false);
      }
    });
  }

  // Damage handling when struck by enemy
  takeDamage(damage, attackerX, isHeavy = false) {
    if (this.state === 'DEAD' || this.invulnerableTimer > 0) return;

    // Check Guard / Block
    const attackerFacingPlayer = (attackerX < this.x && this.facing < 0) || (attackerX > this.x && this.facing > 0);
    if (this.isGuarding && attackerFacingPlayer) {
      // Block successful!
      window.SoundEngine.playGuard();
      this.spawnGuardSpark(this.x + this.facing * 14, this.groundY - 18);
      this.scene.hud.showFloatingText(this.x, this.sprite.y - 25, "GUARD!", "#4dd0e1");
      // Tiny pushback
      this.x -= this.facing * 6;
      return;
    }

    // Check Active Aegis Shield Buff
    if (this.shieldBuffTimer > 0) {
      damage = Math.max(1, Math.round(damage * 0.45));
      this.spawnGuardSpark(this.x, this.groundY - 18);
      this.scene.hud.showFloatingText(this.x, this.sprite.y - 35, "SHIELD ABSORB", "#00e5ff");
      window.SoundEngine.playGuard();
    }

    // Take Damage
    this.hp -= damage;
    this.invulnerableTimer = 1100;
    window.SoundEngine.playPlayerHurt();

    this.scene.hud.showFloatingText(this.x, this.sprite.y - 25, `-${damage}`, "#ff3d00");
    this.scene.cameras.main.shake(160, isHeavy ? 0.012 : 0.006);

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return;
    }

    // Flinch state
    this.state = 'HURT';
    this.playAnim('elf_hurt');
    this.x += (attackerX < this.x ? 12 : -12); // Pushback

    this.scene.time.delayedCall(300, () => {
      if (this.state === 'HURT') {
        this.state = 'IDLE';
        this.playAnim('elf_idle');
      }
    });
  }

  die() {
    this.state = 'DEAD';
    this.playAnim('elf_die');
    this.scene.handleGameOver();
  }

  // RPG Progression: Gain EXP & Level Up
  gainEXP(amount) {
    this.exp += amount;
    this.score += amount * 10;

    if (this.exp >= this.expNext && this.level < 4) {
      this.levelUp();
    }
  }

  gainGold(amount) {
    this.gold += amount;
    this.score += amount * 5;
    window.SoundEngine.playItemPickup('coin');
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 25, `+${amount}G`, "#ffd700");
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    window.SoundEngine.playItemPickup('meat');
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 25, `+${amount} HP`, "#69f0ae");
  }

  restoreMagic(amount = 1) {
    this.magicOrbs = Math.min(this.maxMagicOrbs, this.magicOrbs + amount);
    window.SoundEngine.playItemPickup('potion');
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 25, "+MAGIC", "#40c4ff");
  }

  gainSwordBuff(duration = 15000, bonusAtk = 8) {
    this.swordBuffTimer = duration;
    this.swordBonusDamage = bonusAtk;
    window.SoundEngine.playLevelUp();
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 30, "+ATK SURGE!", "#ff9800");

    // Golden gleam burst
    for (let i = 0; i < 6; i++) {
      const spk = this.scene.add.image(this.x + Phaser.Math.Between(-15, 15), this.groundY - 20, 'hit_spark', 0);
      spk.depth = 999;
      spk.setTint(0xffa726);
      this.scene.tweens.add({
        targets: spk,
        y: spk.y - 25,
        alpha: 0,
        duration: 350 + i * 40,
        onComplete: () => spk.destroy()
      });
    }
  }

  gainShieldBuff(duration = 15000) {
    this.shieldBuffTimer = duration;
    window.SoundEngine.playLevelUp();
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 30, "+AEGIS SHIELD!", "#00e5ff");

    // Cyan shield shimmer
    for (let i = 0; i < 6; i++) {
      const spk = this.scene.add.image(this.x + Phaser.Math.Between(-15, 15), this.groundY - 20, 'guard_spark', 0);
      spk.depth = 999;
      spk.setTint(0x00e5ff);
      this.scene.tweens.add({
        targets: spk,
        y: spk.y - 25,
        alpha: 0,
        duration: 350 + i * 40,
        onComplete: () => spk.destroy()
      });
    }
  }

  levelUp() {
    this.level++;
    this.maxHp += 35;
    this.hp = this.maxHp; // Full heal on level up
    this.baseDamage += 5;
    this.maxMagicOrbs++;
    this.magicOrbs = this.maxMagicOrbs;

    if (this.level === 2) this.expNext = 400;
    else if (this.level === 3) this.expNext = 800;

    window.SoundEngine.playLevelUp();
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 40, `LEVEL UP! LV.${this.level}`, "#ffd700");

    // Golden Level Up Radiance Particles
    for (let i = 0; i < 8; i++) {
      const spark = this.scene.add.image(this.x + Phaser.Math.Between(-20, 20), this.groundY - 20, 'hit_spark', 0);
      spark.depth = 999;
      this.scene.tweens.add({
        targets: spark,
        y: spark.y - 45,
        alpha: 0,
        duration: 800 + i * 50,
        onComplete: () => spark.destroy()
      });
    }
  }

  // Visual Effects Helpers
  spawnSlashVFX(comboNum) {
    const texture = comboNum === 3 ? 'slash_fx_3' : (comboNum === 2 ? 'slash_fx_2' : 'slash_fx_1');
    const slash = this.scene.add.image(this.x + this.facing * 28, this.groundY - 18 - (this.jumpZ), texture);
    slash.setOrigin(0.5, 0.5);
    slash.setFlipX(this.facing < 0);
    slash.depth = this.groundY + 3;

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 180,
      onComplete: () => slash.destroy()
    });
  }

  spawnHitSpark(x, y) {
    const spark = this.scene.add.sprite(x, y, 'hit_spark', 0);
    spark.depth = 999;
    spark.play('anim_hit_spark');
    spark.once('animationcomplete', () => spark.destroy());
  }

  spawnGuardSpark(x, y) {
    const spark = this.scene.add.sprite(x, y, 'guard_spark', 0);
    spark.depth = 999;
    spark.play('anim_guard_spark');
    spark.once('animationcomplete', () => spark.destroy());
  }

  createDustPuff() {
    const dust = this.scene.add.sprite(this.x - this.facing * 10, this.groundY - 2, 'dust_puff', 0);
    dust.depth = this.groundY - 1;
    dust.play('anim_dust_puff');
    dust.once('animationcomplete', () => dust.destroy());
  }

  playAnim(animKey) {
    if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === animKey && this.sprite.anims.isPlaying) {
      return;
    }
    this.sprite.play(animKey, true);
  }

  clampToBounds() {
    // Keep within current section camera bounds
    const cam = this.scene.cameras.main;
    const minX = cam.scrollX + 16;
    const maxX = cam.scrollX + cam.width - 16;
    this.x = Phaser.Math.Clamp(this.x, minX, maxX);
  }
}

window.Player = Player;
