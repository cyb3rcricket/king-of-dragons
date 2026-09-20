/**
 * The King of Dragons - Virtual Controls & Mobile Touch Pad
 * Provides on-screen floating D-pad and Action Buttons for touch or mouse play.
 */

class VirtualPad {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.mode = 'auto'; // 'auto', 'on', 'off'

    // Virtual Input State
    this.state = {
      left: false,
      right: false,
      up: false,
      down: false,
      attack: false,
      attackJustPressed: false,
      jump: false,
      jumpJustPressed: false,
      guard: false,
      magic: false,
      magicJustPressed: false
    };

    // Track active pointer tracking
    this.dpadPointerId = null;

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.depth = 11000; // Above HUD

    this.setupControls();
    this.checkDeviceMode();
  }

  checkDeviceMode() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (this.mode === 'auto') {
      this.setVisible(isTouch);
    } else if (this.mode === 'on') {
      this.setVisible(true);
    } else {
      this.setVisible(false);
    }
  }

  toggleMode() {
    if (this.mode === 'auto') this.mode = 'on';
    else if (this.mode === 'on') this.mode = 'off';
    else this.mode = 'auto';

    const btn = document.getElementById('btn-pad');
    if (btn) {
      btn.textContent = `PAD: ${this.mode.toUpperCase()}`;
    }

    this.checkDeviceMode();
  }

  setVisible(visible) {
    this.visible = visible;
    this.container.setVisible(visible);
  }

  setupControls() {
    // 1. Virtual D-Pad (Bottom-Left)
    this.dpadX = 64;
    this.dpadY = 210;
    this.dpadRadius = 46;

    this.dpad = this.scene.add.image(this.dpadX, this.dpadY, 'pad_dpad');
    this.dpad.setAlpha(0.65);
    this.dpad.setInteractive();
    this.container.add(this.dpad);

    // D-Pad Touch interaction
    this.scene.input.on('pointerdown', pointer => {
      if (!this.visible) return;
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.dpadX, this.dpadY);
      if (dist <= this.dpadRadius * 1.3) {
        this.dpadPointerId = pointer.id;
        this.updateDpadFromPointer(pointer);
      }
    });

    this.scene.input.on('pointermove', pointer => {
      if (!this.visible) return;
      if (pointer.id === this.dpadPointerId) {
        this.updateDpadFromPointer(pointer);
      }
    });

    const clearDpad = pointer => {
      if (pointer.id === this.dpadPointerId) {
        this.dpadPointerId = null;
        this.state.left = false;
        this.state.right = false;
        this.state.up = false;
        this.state.down = false;
      }
    };
    this.scene.input.on('pointerup', clearDpad);
    this.scene.input.on('pointerupoutside', clearDpad);

    // 2. Action Buttons (Bottom-Right)
    // Attack (Red), Jump (Green), Guard (Blue), Magic (Purple)
    const btnConfigs = [
      { key: 'pad_btn_attack', x: 440, y: 220, name: 'attack' },
      { key: 'pad_btn_jump',   x: 395, y: 236, name: 'jump' },
      { key: 'pad_btn_guard',  x: 440, y: 172, name: 'guard' },
      { key: 'pad_btn_magic',  x: 395, y: 188, name: 'magic' }
    ];

    btnConfigs.forEach(cfg => {
      const btn = this.scene.add.image(cfg.x, cfg.y, cfg.key);
      btn.setAlpha(0.7);
      btn.setInteractive();
      this.container.add(btn);

      btn.on('pointerdown', () => {
        if (!this.visible) return;
        btn.setAlpha(1.0);
        btn.setScale(0.92);
        this.state[cfg.name] = true;
        if (cfg.name === 'attack') this.state.attackJustPressed = true;
        if (cfg.name === 'jump') this.state.jumpJustPressed = true;
        if (cfg.name === 'magic') this.state.magicJustPressed = true;
      });

      const releaseBtn = () => {
        btn.setAlpha(0.7);
        btn.setScale(1.0);
        this.state[cfg.name] = false;
      };

      btn.on('pointerup', releaseBtn);
      btn.on('pointerout', releaseBtn);
    });
  }

  updateDpadFromPointer(pointer) {
    const dx = pointer.x - this.dpadX;
    const dy = pointer.y - this.dpadY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const deadzone = 10;

    if (dist < deadzone) {
      this.state.left = false;
      this.state.right = false;
      this.state.up = false;
      this.state.down = false;
      return;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180

    // 8-directional sectors
    this.state.right = (angle >= -67.5 && angle <= 67.5);
    this.state.left  = (angle >= 112.5 || angle <= -112.5);
    this.state.down  = (angle >= 22.5 && angle <= 157.5);
    this.state.up    = (angle >= -157.5 && angle <= -22.5);
  }

  resetJustPressed() {
    this.state.attackJustPressed = false;
    this.state.jumpJustPressed = false;
    this.state.magicJustPressed = false;
  }
}

window.VirtualPad = VirtualPad;
