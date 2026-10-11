/**
 * Elfblade Road - Base Enemy Entity
 * Handles 2.5D AI positioning, state transitions, hit reactions,
 * knockdowns, loot drops, and death animations.
 */

class Enemy {
  constructor(scene, x, y, spriteKey) {
    this.scene = scene;
    this.x = x;
    this.groundY = y;
    this.spriteKey = spriteKey;
    this.facing = -1; // Face left towards player initially

    // Base Stats (overridden by subclasses)
    this.hp = 30;
    this.maxHp = 30;
    this.speedX = 90;
    this.speedY = 65;
    this.damage = 8;
    this.expValue = 25;
    this.goldValue = 15;
    this.attackRangeX = 36;
    this.attackRangeY = 16;
    this.attackCooldown = 1200;
    this.lastAttackTime = 0;

    // Knockdown & Jump Physics
    this.jumpZ = 0;
    this.vz = 0;
    this.isKnockedDown = false;
    this.knockdownTimer = 0;
    this.pushbackVx = 0;

    // State: IDLE, APPROACH, PREPARE_ATTACK, ATTACK, HURT, KNOCKED_DOWN, RECOVER, DEAD
    this.state = 'APPROACH';

    // Visuals
    this.shadow = scene.add.image(this.x, this.groundY, 'shadow');
    this.shadow.setOrigin(0.5, 0.5);
    this.shadow.setAlpha(0.45);

    this.sprite = scene.add.sprite(this.x, this.groundY, spriteKey, 0);
    this.sprite.setOrigin(0.5, 0.85);

    this.flinchTimer = 0;
  }

  isAlive() {
    return this.state !== 'DEAD';
  }

  update(delta, player) {
    if (this.state === 'DEAD') return;

    // Handle Knockdown physics
    if (this.isKnockedDown) {
      this.jumpZ += this.vz * (delta / 1000);
      this.vz -= 750 * (delta / 1000);
      this.x += this.pushbackVx * (delta / 1000);

      if (this.jumpZ <= 0) {
        this.jumpZ = 0;
        this.vz = 0;
        this.pushbackVx = 0;

        if (this.hp <= 0) {
          this.die();
          return;
        }

        // On ground, waiting to recover
        if (this.state !== 'KNOCKED_DOWN') {
          this.state = 'KNOCKED_DOWN';
          this.knockdownTimer = 900;
        }
      }

      if (this.state === 'KNOCKED_DOWN') {
        this.knockdownTimer -= delta;
        if (this.knockdownTimer <= 0) {
          this.isKnockedDown = false;
          this.state = 'RECOVER';
          this.scene.time.delayedCall(250, () => {
            if (this.isAlive()) {
              this.state = 'APPROACH';
            }
          });
        }
      }

      this.syncPosition();
      return;
    }

    // Handle Hurt flinch recovery
    if (this.state === 'HURT') {
      this.flinchTimer -= delta;
      this.x += this.pushbackVx * (delta / 1000);
      this.pushbackVx *= 0.88;
      if (this.flinchTimer <= 0) {
        this.state = 'APPROACH';
      }
      this.syncPosition();
      return;
    }

    if (this.state === 'ATTACK') {
      this.syncPosition();
      return;
    }

    // AI Routine
    if (player && player.state !== 'DEAD') {
      this.runAI(delta, player);
    } else {
      this.playAnim(this.spriteKey + '_idle');
    }

    this.syncPosition();
  }

  runAI(delta, player) {
    const distX = player.x - this.x;
    const distY = player.groundY - this.groundY;
    const absX = Math.abs(distX);
    const absY = Math.abs(distY);

    // Face player
    this.facing = distX > 0 ? 1 : -1;
    this.sprite.setFlipX(this.facing < 0);

    const now = this.scene.time.now;
    const canAttack = now - this.lastAttackTime > this.attackCooldown;

    // Check if in strike range (both X and 2.5D depth plane Y)
    if (absX <= this.attackRangeX && absY <= this.attackRangeY) {
      if (canAttack) {
        this.performAttack(player);
      } else {
        // Shuffling/guarding stance
        this.state = 'IDLE';
        this.playAnim(this.spriteKey + '_idle');
      }
      return;
    }

    // Belt-scroll 2.5D tracking: align with player on Y depth plane, then close in on X
    let moveX = 0;
    let moveY = 0;

    if (absY > this.attackRangeY - 4) {
      moveY = Math.sign(distY);
    }

    if (absX > this.attackRangeX - 6) {
      moveX = Math.sign(distX);
    }

    if (moveX !== 0 || moveY !== 0) {
      this.state = 'APPROACH';
      this.playAnim(this.spriteKey + '_walk');

      const dt = delta / 1000;
      this.x += moveX * this.speedX * dt;
      this.groundY += moveY * this.speedY * dt;

      // Clamp to ground bounds
      this.groundY = Phaser.Math.Clamp(this.groundY, 160, 265);
    }
  }

  performAttack(player) {
    this.state = 'ATTACK';
    this.lastAttackTime = this.scene.time.now;
    this.playAnim(this.spriteKey + '_attack');

    // Strike at frame impact
    this.scene.time.delayedCall(220, () => {
      if (this.state === 'ATTACK' && this.isAlive()) {
        const absX = Math.abs(player.x - this.x);
        const absY = Math.abs(player.groundY - this.groundY);

        if (absX <= this.attackRangeX + 12 && absY <= this.attackRangeY + 6) {
          player.takeDamage(this.damage, this.x, false);
        }
      }
    });

    // Reset back to approach
    this.scene.time.delayedCall(500, () => {
      if (this.state === 'ATTACK') {
        this.state = 'APPROACH';
      }
    });
  }

  takeDamage(damage, attackerX, isKnockdown = false) {
    if (this.state === 'DEAD') return;

    this.hp -= damage;
    this.scene.hud.showFloatingText(this.x, this.sprite.y - 20, `-${damage}`, "#ffffff");

    if (this.hp <= 0) {
      this.hp = 0;
      if (isKnockdown) {
        this.knockdown(attackerX, 260, 180);
      } else {
        this.die();
      }
      return;
    }

    if (isKnockdown) {
      this.knockdown(attackerX, 240, 160);
    } else {
      // Normal flinch
      this.state = 'HURT';
      this.flinchTimer = 220;
      this.pushbackVx = (attackerX < this.x ? 1 : -1) * 80;
      this.playAnim(this.spriteKey + '_hurt');
      this.playHurtSound();
    }
  }

  knockdown(attackerX, vz = 240, vx = 160) {
    this.state = 'KNOCKED_DOWN';
    this.isKnockedDown = true;
    this.vz = vz;
    this.pushbackVx = (attackerX < this.x ? 1 : -1) * vx;
    this.playAnim(this.spriteKey + '_die');
    this.playHurtSound();
  }

  playHurtSound() {
    // Overridden by subclasses
  }

  playDeathSound() {
    // Overridden by subclasses
  }

  die() {
    this.state = 'DEAD';
    this.playAnim(this.spriteKey + '_die');
    this.playDeathSound();

    // Reward player EXP
    if (this.scene.player) {
      this.scene.player.gainEXP(this.expValue);
    }

    // Drop Loot items
    this.dropLoot();

    // Disintegration flash & fade out
    this.scene.tweens.add({
      targets: [this.sprite, this.shadow],
      alpha: 0,
      duration: 700,
      delay: 350,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  dropLoot() {
    // Drop gold coin or jewel or meat
    const roll = Math.random();
    if (roll < 0.6) {
      this.scene.spawnPickup(this.x, this.groundY, 'coin', this.goldValue);
    } else if (roll < 0.8) {
      this.scene.spawnPickup(this.x, this.groundY, 'gem_blue', this.goldValue * 2);
    } else if (roll < 0.92) {
      this.scene.spawnPickup(this.x, this.groundY, 'potion', 1);
    } else {
      this.scene.spawnPickup(this.x, this.groundY, 'meat', 50);
    }
  }

  syncPosition() {
    this.sprite.x = this.x;
    this.sprite.y = this.groundY - this.jumpZ;
    this.sprite.depth = this.groundY;

    this.shadow.x = this.x;
    this.shadow.y = this.groundY;
    this.shadow.depth = this.groundY - 1;
    const shadowScale = Math.max(0.3, 1.0 - this.jumpZ / 100);
    this.shadow.setScale(shadowScale);
  }

  playAnim(animKey) {
    if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === animKey && this.sprite.anims.isPlaying) {
      return;
    }
    this.sprite.play(animKey, true);
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.shadow) this.shadow.destroy();
  }
}

window.Enemy = Enemy;
