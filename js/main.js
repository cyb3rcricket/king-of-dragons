/**
 * Untitled Dragon Brawler - Main Phaser 3 Initialization & Configuration
 * 16-Bit SNES Arcade Beat 'Em Up Engine
 */

window.addEventListener('DOMContentLoaded', () => {
  // Phaser Game Configuration
  const config = {
    type: Phaser.AUTO,
    parent: 'game-wrapper',
    width: 480,
    height: 270,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#000000',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: false // Handled with custom 2.5D belt-scroll depth logic
    },
    scene: [
      BootScene,
      TitleScene,
      GameScene,
      GameOverScene,
      VictoryScene
    ]
  };

  // Launch Phaser Game
  const game = new Phaser.Game(config);

  // Setup HTML Button Listeners
  setupInterfaceControls(game);

  // Audio activation on first user gesture (ensures Web Audio plays without warning)
  const unlockAudio = () => {
    window.SoundEngine.init();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
});

function setupInterfaceControls(game) {
  // 1. CRT Scanlines Toggle Button
  const btnCrt = document.getElementById('btn-crt');
  const crtOverlay = document.getElementById('crt-overlay');
  if (btnCrt && crtOverlay) {
    btnCrt.addEventListener('click', () => {
      crtOverlay.classList.toggle('crt-on');
      const isOn = crtOverlay.classList.contains('crt-on');
      btnCrt.textContent = isOn ? 'CRT: ON' : 'CRT: OFF';
      btnCrt.classList.toggle('active', isOn);
    });
  }

  // 2. Audio Mute Toggle Button
  const btnAudio = document.getElementById('btn-audio');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      window.SoundEngine.toggleMute();
    });
  }

  // 3. Virtual Controls Toggle Button
  const btnPad = document.getElementById('btn-pad');
  if (btnPad) {
    btnPad.addEventListener('click', () => {
      const gameScene = game.scene.getScene('GameScene');
      if (gameScene && gameScene.virtualPad) {
        gameScene.virtualPad.toggleMode();
      } else {
        // Fallback toggle if on title or boot scene
        const modes = ['AUTO', 'ON', 'OFF'];
        let cur = btnPad.textContent.replace('PAD: ', '');
        let nextIdx = (modes.indexOf(cur) + 1) % modes.length;
        btnPad.textContent = `PAD: ${modes[nextIdx]}`;
      }
    });
  }

  // 4. Fullscreen Button
  const btnFs = document.getElementById('btn-fullscreen');
  if (btnFs) {
    btnFs.addEventListener('click', () => {
      const container = document.getElementById('arcade-container');
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }
}
