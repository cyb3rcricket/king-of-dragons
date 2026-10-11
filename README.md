# Untitled Dragon Brawler (16-Bit Beat 'Em Up)

*Working title. A real name is coming.*

A little side-scrolling brawler in the browser. You're an elf warrior with a sword, a shield, and a lightning spell, punching your way through goblins and orcs to an orc warlord boss. I'm Cricket ([@Cyb3rCricket](https://x.com/Cyb3rCricket)), and I made this because 90s arcade brawlers are joy in game form.

## Play it

```bash
git clone https://github.com/cyb3rcricket/king-of-dragons.git
cd king-of-dragons
python3 serve.py
```

This opens http://127.0.0.1:8000/ in your browser. Any static server works too, for example `python3 -m http.server 8000`. You need an internet connection, because Phaser loads from a CDN.

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | WASD or arrows | D-pad |
| Attack (3-hit combo) | J or Z | ATK |
| Jump (attack mid-air to dive) | K or X | JMP |
| Block (hold) | Space or Shift | GRD |
| Lightning storm | L or C | MAG |
| CRT scanlines / mute | T / M | header buttons |

## How it works

- **Engine:** [Phaser 3](https://phaser.io), plain JavaScript, no build step. Each scene (title, game, game over, victory) and each enemy type has its own file in `js/`.
- **Fake depth:** you walk up and down a street as well as left and right. Sprites are drawn in order of how far "down" they are, and a jump is a separate height value with a shadow under you.
- **Characters are drawn by code:** `js/asset_generator.js` paints the elf, the goblins, the orcs, the boss, barrels, and pickups onto canvases at startup.
- **Props and UI are PNGs:** `js/scenes/BootScene.js` loads 21 images from `ui_kit/`. That covers crates, barrels, a chest, a lantern, potion and coin icons, panels, buttons, and the health bar. The game checks whether each one loaded and falls back to simpler drawn shapes if it didn't.
- **Sound is synthesized:** `js/audio.js` makes every sound effect and the chiptune music with Web Audio. There are no audio files.
- **Progress:** enemies drop gold and give EXP. You level up through level 4, and the boss gets angrier below half health.

## Tests

```bash
node test_game.js
```

These are static checks: the files exist, the JavaScript parses, the scripts load in the right order, and the texture and animation names line up. They don't play the game.

## The honest catch

- It's one stage, not a full game: a love letter to 90s arcade brawlers, not a remake of any of them.
- The prop and UI art in `ui_kit/` is AI-generated, and so are the raw source images in `imagine_images/`. Those images make the repo heavy (about 130 MB).
- Balance is "felt right to me," not tuned.
