/**
 * Elfblade Road - Goblin Minion Entity
 * Fast, agile swarming enemy with spear thrusts and high gold drop rates.
 */

class Goblin extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'goblin');

    this.hp = 32;
    this.maxHp = 32;
    this.speedX = 115;
    this.speedY = 75;
    this.damage = 6;
    this.expValue = 30;
    this.goldValue = 25;
    this.attackRangeX = 42;
    this.attackRangeY = 16;
    this.attackCooldown = 900;
  }

  playHurtSound() {
    window.SoundEngine.playGoblinHurt();
  }

  playDeathSound() {
    window.SoundEngine.playGoblinDie();
  }
}

window.Goblin = Goblin;
