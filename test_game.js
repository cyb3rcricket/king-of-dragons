/**
 * The King of Dragons - Verification & Smoke Test Script
 * Runs in Node.js to validate file structure, JS syntax, script dependencies,
 * texture/animation asset integrity, and real runtime asset generation.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("\x1b[36m=====================================================");
console.log(" THE KING OF DRAGONS - AUTOMATED VERIFICATION SUITE");
console.log("=====================================================\x1b[0m\n");

const baseDir = path.resolve(__dirname);
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(` \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passedTests++;
  } else {
    console.error(` \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failedTests++;
  }
}

// 1. Verify File Structure
console.log("\x1b[33m--- [Test Suite 1: File Structure Verification] ---\x1b[0m");

const requiredFiles = [
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/audio.js',
  'js/asset_generator.js',
  'js/scenes/BootScene.js',
  'js/scenes/TitleScene.js',
  'js/scenes/GameScene.js',
  'js/scenes/GameOverScene.js',
  'js/scenes/VictoryScene.js',
  'js/entities/Player.js',
  'js/entities/Enemy.js',
  'js/entities/Goblin.js',
  'js/entities/Orc.js',
  'js/entities/Boss.js',
  'js/ui/HUD.js',
  'js/ui/VirtualPad.js'
];

requiredFiles.forEach(relPath => {
  const fullPath = path.join(baseDir, relPath);
  const exists = fs.existsSync(fullPath);
  assert(exists, `File exists: ${relPath}`);
});

// 2. Verify JavaScript Syntax of All JS Files
console.log("\n\x1b[33m--- [Test Suite 2: JavaScript Syntax & Compilation] ---\x1b[0m");

const jsFiles = requiredFiles.filter(f => f.endsWith('.js'));

jsFiles.forEach(relPath => {
  const fullPath = path.join(baseDir, relPath);
  try {
    const code = fs.readFileSync(fullPath, 'utf8');
    new vm.Script(code, { filename: relPath });
    assert(true, `JS Syntax valid: ${relPath}`);
  } catch (err) {
    assert(false, `JS Syntax error in ${relPath}: ${err.message}`);
  }
});

// 3. Verify HTML and Script Order
console.log("\n\x1b[33m--- [Test Suite 3: HTML Markup & Script Ordering] ---\x1b[0m");

const htmlPath = path.join(baseDir, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert(htmlContent.includes('phaser@3.80.1/dist/phaser.min.js'), 'index.html includes Phaser 3 CDN');
assert(htmlContent.includes('id="game-wrapper"'), 'index.html includes game-wrapper viewport');
assert(htmlContent.includes('id="crt-overlay"'), 'index.html includes CRT overlay element');

// Verify script tags order
const expectedScripts = [
  'js/audio.js',
  'js/asset_generator.js',
  'js/entities/Player.js',
  'js/entities/Enemy.js',
  'js/entities/Goblin.js',
  'js/entities/Orc.js',
  'js/entities/Boss.js',
  'js/ui/HUD.js',
  'js/ui/VirtualPad.js',
  'js/scenes/BootScene.js',
  'js/scenes/TitleScene.js',
  'js/scenes/GameScene.js',
  'js/scenes/GameOverScene.js',
  'js/scenes/VictoryScene.js',
  'js/main.js'
];

let lastIndex = -1;
let orderValid = true;
expectedScripts.forEach(scriptPath => {
  const currentIndex = htmlContent.indexOf(scriptPath);
  if (currentIndex === -1) {
    orderValid = false;
    assert(false, `Script tag missing in index.html: ${scriptPath}`);
  } else if (currentIndex < lastIndex) {
    orderValid = false;
    assert(false, `Script loaded out of order: ${scriptPath}`);
  }
  lastIndex = currentIndex;
});
if (orderValid) {
  assert(true, 'All 15 game scripts are loaded in strict dependency order in index.html');
}

// 4. Verify Asset Generator & Animation Keys
console.log("\n\x1b[33m--- [Test Suite 4: Static Asset & Animation Declarations] ---\x1b[0m");

const assetGenCode = fs.readFileSync(path.join(baseDir, 'js/asset_generator.js'), 'utf8');
const bootSceneCode = fs.readFileSync(path.join(baseDir, 'js/scenes/BootScene.js'), 'utf8');

const textures = ['elf', 'goblin', 'orc', 'boss', 'barrel', 'pickups', 'bg_sky', 'bg_forest', 'bg_ground', 'hud_portrait_elf', 'hud_arrow_go'];
textures.forEach(tex => {
  assert(assetGenCode.includes(tex), `Asset generator declares texture/spritesheet: '${tex}'`);
});

const elfAnimConfigs = [
  { key: 'elf_idle', start: 0, end: 3 },
  { key: 'elf_walk', start: 4, end: 9 },
  { key: 'elf_attack1', start: 10, end: 12 },
  { key: 'elf_attack2', start: 13, end: 15 },
  { key: 'elf_attack3', start: 16, end: 19 },
  { key: 'elf_jump', start: 20, end: 21 },
  { key: 'elf_jump_attack', start: 22, end: 23 },
  { key: 'elf_guard', start: 24, end: 25 },
  { key: 'elf_magic', start: 26, end: 29 },
  { key: 'elf_hurt', start: 30, end: 31 },
  { key: 'elf_die', start: 32, end: 35 }
];

elfAnimConfigs.forEach(anim => {
  assert(bootSceneCode.includes(`key: '${anim.key}'`), `BootScene registers Elf animation: '${anim.key}'`);
  assert(bootSceneCode.includes(`start: ${anim.start}, end: ${anim.end}`), `${anim.key} maps to procedural frames ${anim.start}–${anim.end}`);
});

// 5. Real Runtime Execution Test for AssetGenerator
console.log("\n\x1b[33m--- [Test Suite 5: Runtime Canvas & Texture Execution Test] ---\x1b[0m");

function createMockCtx() {
  const gradient = { addColorStop: () => {} };
  return {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    rect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    stroke: () => {},
    fill: () => {},
    clearRect: () => {},
    drawImage: () => {},
    fillText: () => {},
    measureText: () => ({ width: 10 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    shadowColor: '#000000',
    shadowBlur: 0,
    font: '10px monospace',
    textAlign: 'left',
    textBaseline: 'top',
    globalAlpha: 1.0,
    imageSmoothingEnabled: false
  };
}

function createMockCanvas(width, height) {
  const ctx = createMockCtx();
  return {
    width: width || 300,
    height: height || 150,
    getContext: (type) => (type === '2d' ? ctx : null)
  };
}

const registeredTextures = new Map();
const registeredSpritesheets = new Map();

const mockScene = {
  textures: {
    exists: (key) => registeredTextures.has(key) || registeredSpritesheets.has(key),
    remove: (key) => {
      registeredTextures.delete(key);
      registeredSpritesheets.delete(key);
    },
    addCanvas: (key, canvas) => {
      registeredTextures.set(key, canvas);
    },
    addSpriteSheet: (key, canvas, config) => {
      registeredSpritesheets.set(key, { canvas, config });
    }
  }
};

const mockSandbox = {
  console: console,
  Math: Math,
  document: {
    createElement: (tag) => {
      if (tag === 'canvas') return createMockCanvas();
      return {};
    }
  },
  window: {}
};

try {
  vm.createContext(mockSandbox);
  vm.runInContext(assetGenCode, mockSandbox);

  const GeneratorClass = mockSandbox.AssetGenerator || mockSandbox.window.AssetGenerator;
  assert(typeof GeneratorClass === 'function', 'AssetGenerator class loaded into runtime environment');

  const genInstance = new GeneratorClass(mockScene);
  let runError = null;

  try {
    genInstance.generateAll();
  } catch (err) {
    runError = err;
  }

  assert(!runError, `AssetGenerator.generateAll() executed with ZERO runtime errors (Error: ${runError ? runError.message : 'none'})`);

  // Verify all expected textures & spritesheets were registered in the texture manager
  const expectedRegisteredTextures = [
    'slash_fx_1', 'slash_fx_2', 'slash_fx_3',
    'lightning', 'magic_circle', 'shockwave', 'shadow',
    'bg_sky', 'bg_forest', 'bg_ground',
    'hud_portrait_elf', 'hud_orb', 'hud_orb_empty', 'hud_arrow_go',
    'pad_dpad', 'pad_btn_attack', 'pad_btn_jump', 'pad_btn_guard', 'pad_btn_magic'
  ];

  const expectedRegisteredSpritesheets = [
    'elf', 'goblin', 'orc', 'boss', 'barrel', 'pickups',
    'hit_spark', 'guard_spark', 'dust_puff'
  ];

  expectedRegisteredTextures.forEach(tex => {
    assert(registeredTextures.has(tex), `Texture successfully registered in Phaser TextureManager: '${tex}'`);
  });

  expectedRegisteredSpritesheets.forEach(ss => {
    assert(registeredSpritesheets.has(ss), `Spritesheet successfully registered in Phaser TextureManager: '${ss}'`);
  });

} catch (e) {
  assert(false, `Runtime test suite failed: ${e.message}\n${e.stack}`);
}

// 6. Verify Warcraft Kit Asset Integration
console.log("\n\x1b[33m--- [Test Suite 6: Warcraft Kit & Graphics Upgrade Verification] ---\x1b[0m");

const expectedKitAssets = [
  'prop_barrel.png', 'prop_crate.png', 'prop_chest.png',
  'prop_chair.png', 'prop_table.png', 'prop_lantern.png', 'prop_plant.png',
  'icon_gold_coin.png', 'icon_health_potion.png', 'icon_mana_potion.png',
  'icon_sword.png', 'icon_shield.png', 'icon_scroll.png',
  'icon_wood_logs.png', 'icon_iron_ore.png',
  'panel_dialog.png', 'bar_frame.png', 'bar_fill.png',
  'button_normal.png', 'button_hover.png', 'button_pressed.png'
];

expectedKitAssets.forEach(fileName => {
  const fullP = path.join(baseDir, 'warcraft_kit', fileName);
  assert(fs.existsSync(fullP), `Kit Asset exists: warcraft_kit/${fileName}`);
});

const bootCode = fs.readFileSync(path.join(baseDir, 'js/scenes/BootScene.js'), 'utf8');
assert(bootCode.includes('warcraft_kit/prop_barrel.png') && bootCode.includes('warcraft_kit/bar_frame.png'), 'BootScene.preload registers warcraft_kit assets');

const gameSceneCode = fs.readFileSync(path.join(baseDir, 'js/scenes/GameScene.js'), 'utf8');
assert(gameSceneCode.includes('prop_chest') && gameSceneCode.includes('prop_crate') && gameSceneCode.includes('prop_barrel'), 'GameScene includes chest, crate, and barrel breakables');
assert(gameSceneCode.includes('prop_lantern') && gameSceneCode.includes('prop_plant') && gameSceneCode.includes('prop_table'), 'GameScene includes atmospheric lanterns, planters, and tables');
assert(gameSceneCode.includes('icon_sword') && gameSceneCode.includes('icon_shield') && gameSceneCode.includes('icon_scroll'), 'GameScene supports weapon, armor, and scroll equipment pickups');

const hudCode = fs.readFileSync(path.join(baseDir, 'js/ui/HUD.js'), 'utf8');
assert(hudCode.includes('bar_frame') && hudCode.includes('bar_fill'), 'HUD supports HD bar_frame and bar_fill status bars');
assert(hudCode.includes('icon_gold_coin'), 'HUD displays golden coin icon');

// 7. Verify Original Procedural Elf Hero & Sound Engine Integration
console.log("\n\x1b[33m--- [Test Suite 7: Procedural Elf Hero & Sound Engine Integration] ---\x1b[0m");

// Verify BootScene does NOT load external elf spritesheet
assert(!bootCode.includes('public/assets/hero/elf-hero-sheet.png'), 'BootScene does NOT load external elf spritesheet PNG');

// Verify AssetGenerator procedural elf spritesheet configuration
assert(assetGenCode.includes('createElfSpritesheet'), 'AssetGenerator declares createElfSpritesheet()');
assert(assetGenCode.includes('totalFrames = 36'), 'Procedural Elf spritesheet generates 36 linear frames');

// Verify Player.js restored properties
const playerCode = fs.readFileSync(path.join(baseDir, 'js/entities/Player.js'), 'utf8');
assert(!playerCode.includes('this.sprite.setScale(0.27)'), 'Player sprite scaling removed (restored to 1.0 default)');
assert(playerCode.includes("this.sprite = scene.add.sprite(this.x, this.groundY, 'elf', 0);"), 'Player sprite initialized with procedural elf texture');
assert(playerCode.includes('this.sprite.setOrigin(0.5, 0.85)'), 'Player sprite origin restored to (0.5, 0.85)');
assert(playerCode.includes('getHurtbox()'), 'Player defines getHurtbox() for 2.5D collisions');
assert(playerCode.includes('getAttackHitbox('), 'Player defines getAttackHitbox() for melee hit detection');

// Verify TitleScene showcase elf restored properties
const titleCode = fs.readFileSync(path.join(baseDir, 'js/scenes/TitleScene.js'), 'utf8');
assert(titleCode.includes("this.showcaseElf = this.add.sprite(240, 170, 'elf')"), 'TitleScene showcaseElf placed at (240, 170)');
assert(titleCode.includes('this.showcaseElf.setScale(1.3)'), 'TitleScene showcaseElf scaled to 1.3 for 64px sprite');
assert(titleCode.includes('this.showcaseElf.setOrigin(0.5, 0.85)'), 'TitleScene showcaseElf origin set to (0.5, 0.85)');

// Verify VictoryScene elf restored properties
const victoryCode = fs.readFileSync(path.join(baseDir, 'js/scenes/VictoryScene.js'), 'utf8');
assert(victoryCode.includes("const elf = this.add.sprite(100, 162, 'elf')"), 'VictoryScene elf placed at (100, 162)');
assert(victoryCode.includes('elf.setScale(1.4)'), 'VictoryScene elf scaled to 1.4 for 64px sprite');
assert(victoryCode.includes('elf.setOrigin(0.5, 0.85)'), 'VictoryScene elf origin set to (0.5, 0.85)');

// Verify SoundEngine playGameOver implementation
const audioCode = fs.readFileSync(path.join(baseDir, 'js/audio.js'), 'utf8');
assert(audioCode.includes('playGameOver()'), 'SoundEngine implements playGameOver() for clean game over transitions');

// Final Summary
console.log("\n\x1b[36m=====================================================");
console.log(` TEST RESULTS: ${passedTests}/${totalTests} Passed (${failedTests} Failures)`);
console.log("=====================================================\x1b[0m");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("\x1b[32m✔ ALL CHECKS PASSED SUCCESSFULLY!\x1b[0m\n");
  process.exit(0);
}
