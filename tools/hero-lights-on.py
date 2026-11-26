# Hero clip: the workshop starts dark and the fluorescent tubes flicker on, one at a
# time from the back to the front, ending exactly on the still. Nothing in the picture
# moves, so the number plates cannot change. Needs Python 3 with numpy and Pillow, and ffmpeg.
#
# Re-run it whenever the hero stills change. Tube boxes are x0,x1,y0,y1 in the still's own
# pixels, then the second it starts, listed back to front; find them by eye or as the
# brightest long shapes near the top of the still.
#
#   python3 tools/hero-lights-on.py still-landscape.png media/hero-cars-on.mp4 1920 1080 \
#     "1091,1188,181,201,0.55;159,316,211,228,1.25;636,780,104,134,1.95"
#   python3 tools/hero-lights-on.py still-portrait.png media/hero-cars-portrait-on.mp4 1080 1920 \
#     "614,693,380,385,0.55;297,369,231,261,1.25;72,178,122,172,1.95"
#
# It also writes <name>-dark.jpg (the first frame), the poster shown while the clip loads;
# rename it to media/hero-cars-dark.jpg or media/hero-cars-portrait-dark.jpg.
import sys, subprocess, numpy as np
from PIL import Image
src, out, W, H, tubes_arg = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
FPS, DUR = 24, 4.5
im = Image.open(src).convert('RGB')
sx, sy = W / im.width, H / im.height
lit = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32)
# tubes: x0,x1,y0,y1,start ; listed back to front
tubes = [tuple(float(v) for v in t.split(',')) for t in tubes_arg.split(';')]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
weights = []
for x0, x1, y0, y1, _ in tubes:
    cx, cy = (x0 + x1) / 2 * sx, (y0 + y1) / 2 * sy
    dx = (xx - cx) / (0.27 * W)
    dy = (yy - cy) / np.where(yy > cy, 0.75 * H, 0.18 * H)   # light falls mostly downwards
    w = np.exp(-(dx ** 2 + dy ** 2))
    # the tube itself belongs to its own switch
    inside = ((xx > x0 * sx - 14) & (xx < x1 * sx + 14) & (yy > y0 * sy - 14) & (yy < y1 * sy + 14)).astype(np.float32)
    weights.append(w + 60 * inside)
ambient = 0.07
total = sum(weights) + ambient
weights = [w / total for w in weights]
amb = ambient / total
tint = np.array([0.82, 0.92, 1.18], np.float32)
dark = np.clip(lit * 0.11 * tint + 1.5, 0, 255)

def level(t, t0):
    """A fluorescent tube starting: two short blinks, then on with a slight shiver."""
    s = t - t0
    if s < 0: return 0.0
    if s < 0.05: return 0.75
    if s < 0.17: return 0.0
    if s < 0.21: return 0.45
    if s < 0.38: return 0.0
    if s < 0.42: return 0.9
    if s < 0.5: return 0.25
    if s < 0.8: return min(1.0, 0.82 + 0.18 * (s - 0.5) / 0.3) * (1 - 0.05 * np.sin(s * 90))
    return 1.0

rng = np.random.default_rng(7)
n = int(FPS * DUR)
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out],
                      stdin=subprocess.PIPE)
first = None
for k in range(n):
    t = k / FPS
    ls = [level(t, tb[4]) for tb in tubes]
    on = sum(w * l for w, l in zip(weights, ls)) + amb * (sum(ls) / len(ls))
    frame = dark + (lit - dark) * on[..., None]
    lv = float(np.mean(on))
    if lv < 0.999:   # low-light sensor noise, gone once every tube is on
        frame += rng.normal(0, 3.0 * (1 - lv), frame.shape[:2])[..., None]
    f8 = np.clip(frame, 0, 255).astype(np.uint8)
    if k == 0: first = f8
    ff.stdin.write(f8.tobytes())
ff.stdin.close(); ff.wait()
Image.fromarray(first).save(out.replace('.mp4', '-dark.jpg'), quality=82)
print('done', out)
