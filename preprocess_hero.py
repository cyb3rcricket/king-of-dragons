#!/usr/bin/env python3
"""
Preprocess elf spritesheet and reference still:
1. Load 2.jpg (1792 x 1008).
2. Pad canvas with white to 1792 x 1010 (2px at the bottom only). Do not scale character.
3. Key near-white (RGB >= 245) to alpha with smooth ramp & defringing for clean hair/cape edges.
4. Save to public/assets/hero/elf-hero-sheet.png (1792 x 1010).
5. Save 1.jpg to public/assets/hero/elf-hero-ref.png as reference still.
"""

import os
import numpy as np
from PIL import Image

def preprocess():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, 'public', 'assets', 'hero')
    os.makedirs(output_dir, exist_ok=True)

    # 1. Reference still: 1.jpg -> elf-hero-ref.png
    ref_src = os.path.join(base_dir, '1.jpg')
    ref_dst = os.path.join(output_dir, 'elf-hero-ref.png')
    ref_im = Image.open(ref_src)
    ref_im.save(ref_dst, 'PNG')
    print(f"Saved reference still to {ref_dst} ({ref_im.size[0]}x{ref_im.size[1]})")

    # 2. Spritesheet: 2.jpg (1792 x 1008)
    sheet_src = os.path.join(base_dir, '2.jpg')
    sheet_dst = os.path.join(output_dir, 'elf-hero-sheet.png')
    im = Image.open(sheet_src).convert('RGB')
    arr = np.array(im)
    assert arr.shape == (1008, 1792, 3), f"Unexpected source sheet shape: {arr.shape}"

    # Pad with white to 1792 x 1010 (2px on the bottom only)
    padded = np.full((1010, 1792, 3), 255, dtype=np.uint8)
    padded[:1008, :, :] = arr

    # Key near-white to alpha (RGB >= 245 -> alpha = 0) with smooth ramp between 237 and 245
    # and defringing to ensure soft, clean hair and cape edges against any background.
    rgb_f = padded.astype(float)
    min_c = np.min(rgb_f, axis=2)

    t_low = 237.0
    t_high = 245.0

    alpha_f = np.clip((t_high - min_c) / (t_high - t_low), 0.0, 1.0)

    # Unmultiply / defringe RGB for transition pixels so white doesn't bleed
    defringed_rgb = np.zeros_like(rgb_f)
    for c in range(3):
        c_val = rgb_f[:, :, c]
        c_clean = np.where(alpha_f > 0, (c_val - (1.0 - alpha_f) * 255.0) / np.maximum(alpha_f, 0.001), 0.0)
        defringed_rgb[:, :, c] = np.clip(c_clean, 0, 255)

    rgba = np.zeros((1010, 1792, 4), dtype=np.uint8)
    rgba[:, :, :3] = defringed_rgb.astype(np.uint8)
    rgba[:, :, 3] = (alpha_f * 255.0).astype(np.uint8)

    out_sheet = Image.fromarray(rgba)
    out_sheet.save(sheet_dst, 'PNG')
    print(f"Saved spritesheet to {sheet_dst} ({out_sheet.size[0]}x{out_sheet.size[1]})")

if __name__ == '__main__':
    preprocess()
