# The King of Dragons (16-Bit SNES Classic Beat 'Em Up)

A complete, fully playable MVP recreation of Capcom's classic arcade/SNES fantasy beat 'em up **The King of Dragons**, built with **Phaser 3** and modern HTML5 Web Audio.

---

## 🎮 Game Features

- **Player Hero**: Female Elf Warrior featuring blonde hair, silver tiara circlet, pointed ears, emerald tunic, silver breastplate, and dual glowing blades.
- **2.5D Belt-Scroll Depth Mechanics**:
  - Full 8-directional movement in the playable vertical ground band ($Y \in [160, 265]$).
  - Dynamic depth sorting (`depth = groundY`) for realistic sprite overlap.
  - Z-axis jumping physics with real-time shadow scaling.
  - True 2.5D hit detection with horizontal reach, facing direction, and Z-depth tolerance.
- **Combat Mechanics**:
  - **3-Hit Melee Combo Chain**: Rapid horizontal rapier slash $\rightarrow$ upward cross slash $\rightarrow$ 360° spinning crescent finisher (deals massive knockdown damage).
  - **Jump Attack**: Downward aerial diving thrust.
  - **Shield Guard / Block**: Hold Guard to block incoming frontal attacks with 0 damage, deflection sparks, metallic ringing audio, and attacker recoil.
  - **Hitstop Impact Freeze**: Capcom-style 50ms freeze frame on heavy impacts.
  - **Screen Shakes & Sparks**: Heavy impacts, boss smashes, and crits trigger authentic retro screen shake.
  - **Elven Elemental Storm (Magic Special)**: Summons arcane runes under the hero, white screen flash, rolling thunder, and screen-wide lightning strikes knocking down all active foes. Consumes 1 Magic Orb, or sacrifices 15 HP if orbs are depleted!
- **RPG Progression & Level Up System**:
  - Defeating enemies grants **EXP** and drops **Gold**.
  - Level Up thresholds (LV. 1 $\rightarrow$ LV. 2 $\rightarrow$ LV. 3 $\rightarrow$ LV. 4) increase max HP, provide a full heal, increase base attack damage, and upgrade magic capacity.
  - Triumphant level-up fanfare and golden radiance particles.
- **Enemies & Stage 1 Boss**:
  - **Goblin Minions**: Fast, agile swarming foes with spear/dagger thrusts.
  - **Heavy Orcs**: Spiked iron mace swings, high health, and long-range shoulder bash charges.
  - **Stage 1 Boss: Orc Warlord Gorgok**:
    - Dual morningstars on heavy chains.
    - Ground Pound Leap with horizontal traveling ground shockwaves.
    - **Berserk Rage Phase (<= 50% HP)**: Roars, screen shakes, fiery crimson aura, increased speed, and summons minion reinforcements!
    - Dramatic defeat sequence with multi-explosions and a massive shower of treasure coins, gems, and roasted meat.
- **Level 1 Progression**:
  - Parallax background layers (twilight mountain sky, ancient forest canopy & ruin pillars, 2.5D cobblestone roadway).
  - Breakable wooden barrels containing roast meat (heals 50 HP), magic potions, gold coins, and gems.
  - Wave 1 $\rightarrow$ Wave 2 $\rightarrow$ Wave 3 $\rightarrow$ Boss Warning Siren $\rightarrow$ Boss Battle.
  - Classic arcade flashing **"GO -->"** scrolling indicator when wave sections are cleared.
- **100% Self-Contained 16-Bit Audio Engine (`js/audio.js`)**:
  - Procedural Web Audio API synthesizer for all retro sound effects (sword whooshes, hit punches, metallic shield clangs, monster roars, thunderclaps, level up chimes).
  - Multi-channel 16-bit chiptune BGM sequencer (Square lead with vibrato, triangle bassline, noise percussion) with dynamic tracks for Title, Stage 1, Boss Battle, and Victory fanfare.
  - Zero external `.mp3` or `.wav` dependencies!
- **100% Self-Contained Pixel Art Generator (`js/asset_generator.js`)**:
  - Procedural HTML5 Canvas pixel artist drawing authentic SNES spritesheets and textures directly into Phaser's TextureManager.
  - Zero external `.png` or `.jpg` dependencies — zero CORS errors!
- **Presentation & Controls**:
  - CRT scanlines overlay toggle (`T` key or top button).
  - Top SNES HUD: Elf portrait, segmented HP bar, EXP bar, Magic orbs, Score, Gold, and Boss HP bar.
  - Virtual on-screen touch D-Pad and action buttons for mobile or mouse play.
  - Stage Clear Victory screen with ranking grade (S / A / B / C) and Game Over continue screen.

---

## 🕹️ Controls Guide

| Action | Keyboard | Touch / Mouse Pad |
|---|---|---|
| **Move (8-Way 2.5D)** | `W` `A` `S` `D` or `Arrow Keys` | Virtual D-Pad (Bottom-Left) |
| **Attack Combo** | `J` or `Z` | `ATK` Button (Red) |
| **Jump / Jump Dive** | `K` or `X` | `JMP` Button (Green) |
| **Shield Guard / Block** | `Space` or `Shift` (Hold) | `GRD` Button (Blue) |
| **Magic Storm** | `L` or `C` | `MAG` Button (Purple) |
| **Toggle CRT Scanlines** | `T` | `CRT: ON/OFF` Header Button |
| **Toggle Sound / Mute** | `M` | `AUDIO: ON/OFF` Header Button |
| **Toggle Virtual Controls** | Header Button | `PAD: AUTO / ON / OFF` |

---

## 🚀 How to Run the Game

### Quick Start (Python Server)
Open terminal in the project directory:
```bash
cd king-of-dragons
python3 serve.py
```
This will automatically launch `http://localhost:8000/` in your default browser!

### Alternative Start
You can also run any standard static server:
```bash
# Python built-in module
python3 -m http.server 8000

# Or Node npx serve (if npm is configured)
npx serve .
```
Then navigate to: `http://localhost:8000/`

---

## 🧪 Verification & Testing

To run the automated smoke test suite:
```bash
node test_game.js
```
This tests:
1. File structure integrity for all 17 required files.
2. JavaScript syntax and execution compilation of all `.js` files via Node's `vm` module.
3. HTML script tag dependencies and execution order in `index.html`.
4. Texture registration and animation key validation across `AssetGenerator` and `BootScene`.
