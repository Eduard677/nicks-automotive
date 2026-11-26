# Hero clip: the workshop starts dark and the fluorescent tubes flicker on, ending exactly
# on the still. Nothing in the picture moves, so the number plates cannot change.
# Needs Python 3 with numpy and Pillow, and ffmpeg.
#
# Settings live in tools/hero-lights.json, in the same shape the "Hero lights" playground
# copies (Copy settings). Render both clips from it:
#
#   python3 tools/hero-lights-on.py tools/hero-lights.json laptop media/hero-cars-on.mp4
#   python3 tools/hero-lights-on.py tools/hero-lights.json phone media/hero-cars-portrait-on.mp4
#
# Each run also writes <name>-dark.jpg (the first frame), the poster shown while the clip
# loads; rename it to media/hero-cars-dark.jpg or media/hero-cars-portrait-dark.jpg.
# Light boxes are x0,x1,y0,y1 in the still's own pixels.
import sys, json, subprocess, numpy as np
from PIL import Image

ROOM = dict(lightsOff=.11, coldBlue=1, spreadSideways=.27, reachDown=.75, reachUp=.18, roomGlow=.07, softEdgesPx=0, grain=3)
cfg = json.load(open(sys.argv[1]))[sys.argv[2]]
out = sys.argv[3]
src, (W, H), DUR = cfg['still'], cfg['size'], float(cfg.get('length', 4.5))
room = {**ROOM, **cfg.get('room', {})}
lights = [(l['box'], float(l['start']), float(l.get('brightness', 1)), l.get('comesOn', 'tube')) for l in cfg['lights']]
FPS = 24

im = Image.open(src).convert('RGB')
sx, sy = W / im.width, H / im.height
lit = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

m, f = 14.0, max(float(room['softEdgesPx']), 0.5)   # box margin and edge softness, in output pixels
weights = []
for (x0, x1, y0, y1), *_ in lights:
    X0, X1, Y0, Y1 = x0 * sx, x1 * sx, y0 * sy, y1 * sy
    cx, cy = (X0 + X1) / 2, (Y0 + Y1) / 2
    dx = (xx - cx) / (room['spreadSideways'] * W)
    dy = (yy - cy) / np.where(yy > cy, room['reachDown'] * H, room['reachUp'] * H)   # light falls mostly downwards
    w = np.exp(-(dx ** 2 + dy ** 2))
    # the tube itself belongs to its own switch
    inside = sstep(X0 - m - f, X0 - m + f, xx) * (1 - sstep(X1 + m - f, X1 + m + f, xx)) \
           * sstep(Y0 - m - f, Y0 - m + f, yy) * (1 - sstep(Y1 + m - f, Y1 + m + f, yy))
    weights.append(w + 60 * inside)
amb_w = float(room['roomGlow'])
total = sum(weights) + amb_w
weights = [w / total for w in weights]
amb = amb_w / total
k = float(room['coldBlue'])
tint = np.array([1 - .18 * k, 1 - .08 * k, 1 + .18 * k], np.float32)
dark = np.clip(lit * float(room['lightsOff']) * tint + 1.5, 0, 255)

def tube(s):
    """A fluorescent tube starting: two short blinks, then on with a slight shiver."""
    if s < 0: return 0.0
    if s < 0.05: return 0.75
    if s < 0.17: return 0.0
    if s < 0.21: return 0.45
    if s < 0.38: return 0.0
    if s < 0.42: return 0.9
    if s < 0.5: return 0.25
    if s < 0.8: return min(1.0, 0.82 + 0.18 * (s - 0.5) / 0.3) * (1 - 0.05 * np.sin(s * 90))
    return 1.0

def hsh(n):
    x = np.sin(n * 127.1 + 311.7) * 43758.5453
    return x - np.floor(x)

PATTERNS = {
    'tube': tube,
    'instant': lambda s: 0.0 if s < 0 else 1.0,
    'warm': lambda s: 0.0 if s < 0 else 1.0 if s >= 1.6 else (lambda q: q * q * (3 - 2 * q))(s / 1.6) * (0.93 + 0.07 * np.sin(s * 47)),
    'faulty': lambda s: tube(s) if s < 0.8 else (0.06 + 0.3 * hsh(np.floor(s * 14) + 99) if hsh(np.floor(s * 14)) < 0.16 else 1 - 0.04 * np.sin(s * 90)),
}

rng = np.random.default_rng(7)
n = int(round(FPS * DUR))
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out],
                      stdin=subprocess.PIPE)
first = None
for i in range(n):
    t = i / FPS
    ls = [PATTERNS[p](t - start) * gain for _, start, gain, p in lights]
    on = sum(w * l for w, l in zip(weights, ls)) + amb * (sum(ls) / len(ls))
    frame = dark + (lit - dark) * on[..., None]
    lv = float(np.mean(on))
    if lv < 0.999:   # low-light sensor noise, gone once every tube is on
        frame += rng.normal(0, float(room['grain']) * (1 - lv), frame.shape[:2])[..., None]
    f8 = np.clip(np.rint(frame), 0, 255).astype(np.uint8)
    if i == 0: first = f8
    ff.stdin.write(f8.tobytes())
ff.stdin.close(); ff.wait()
Image.fromarray(first).save(out.replace('.mp4', '-dark.jpg'), quality=82)
print('done', out, f'{n} frames')
