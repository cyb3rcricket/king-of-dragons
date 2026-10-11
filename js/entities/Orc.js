/**
 * Untitled Dragon Brawler - Heavy Orc Entity
 * Tough enemy with high HP, overhead spiked mace smash, and shoulder rush charge.
 */

class Orc extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'orc');

    this.hp = 80;
    this.maxHp = 80;
    this.speedX = 70;
    this.speedY = 50;
    this.damage = 14;
    this.expValue = 75;
    this.goldValue = 50;
    this.attackRangeX = 46;
    this.attackRangeY = 18;
    this.attackCooldown = 1400;

    this.isCharging = false;
    this.lastChargeTime = 0;
  }

  runAI(delta, player) {
    const distX = player.x - this.x;
    const distY = player.groundY - this.groundY;
    const absX = Math.abs(distX);
    const absY = Math.abs(distY);

    this.facing = distX > 0 ? 1 : -1;
    this.sprite.setFlipX(this.facing < 0);

    const now = this.scene.time.now;

    // Check Charge Attack trigger (if far away on X and aligned on Y)
    if (absX > 110 && absX < 240 && absY < 18 && now - this.lastChargeTime > 3500) {
      this.performChargeAttack(player);
      return;
    }

    super.runAI(delta, player);
  }

  performChargeAttack(player) {
    this.isCharging = true;
    this.state = 'ATTACK';
    this.lastChargeTime = this.scene.time.now;
    this.playAnim('orc_charge');

    const chargeDir = this.facing;
    const chargeDuration = 650;
    const chargeSpeed = 190;

    const chargeTimer = this.scene.time.addEvent({
      delay: 16,
      repeat: Math.floor(chargeDuration / 16),
      callback: () => {
        if (!this.isAlive() || this.isKnockedDown) {
          chargeTimer.remove();
          return;
        }
        this.x += chargeDir * chargeSpeed * 0.016;

        // Check impact with player
        const absX = Math.abs(player.x - this.x);
        const absY = Math.abs(player.groundY - this.groundY);
        if (absX < 36 && absY < 20) {
          player.takeDamage(16, this.x, true);
          this.scene.cameras.main.shake(120, 0.008);
          chargeTimer.remove();
          this.state = 'APPROACH';
          this.isCharging = false;
        }
      }
    });

    this.scene.time.delayedCall(chargeDuration + 100, () => {
      this.isCharging = false;
      if (this.isAlive() && this.state === 'ATTACK') {
        this.state = 'APPROACH';
      }
    });
  }

  performAttack(player) {
    this.state = 'ATTACK';
    this.lastAttackTime = this.scene.time.now;
    this.playAnim('orc_attack');

    // Heavy mace impact on frame 3
    this.scene.time.delayedCall(340, () => {
      if (this.state === 'ATTACK' && this.isAlive()) {
        const absX = Math.abs(player.x - this.x);
        const absY = Math.abs(player.groundY - this.groundY);

        if (absX <= this.attackRangeX + 16 && absY <= this.attackRangeY + 6) {
          player.takeDamage(this.damage, this.x, true);
          this.scene.cameras.main.shake(140, 0.007);
        }
      }
    });

    this.scene.time.delayedCall(700, () => {
      if (this.state === 'ATTACK') {
        this.state = 'APPROACH';
      }
    });
  }

  playHurtSound() {
    window.SoundEngine.playOrcHurt();
  }

  playDeathSound() {
    window.SoundEngine.playOrcDie();
  }

  dropLoot() {
    // Orc drops healing meat frequently!
    const roll = Math.random();
    if (roll < 0.45) {
      this.scene.spawnPickup(this.x, this.groundY, 'meat', 50);
    } else if (roll < 0.75) {
      this.scene.spawnPickup(this.x, this.groundY, 'potion', 1);
    } else {
      this.scene.spawnPickup(this.x, this.groundY, 'gem_red', 80);
    }
  }
}

window.Orc = Orc;
