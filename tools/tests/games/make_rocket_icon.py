"""Make Rocket Lander's icon.svg from the game's own rocket (D-120 shortcut 5). Version 1.0.

The launcher's icons are one-colour shapes in a 48 x 48 box, drawn in currentColor (as
games/wrapper-check/icon.svg and P-020's icons.js). This draws the game's Classic rocket that way, from
the numbers in games/_common/rocket/scene.js (bodyPath, the fins and the nozzle in drawRocket): the body,
fins and nozzle filled, the window cut out, and Bip's head as a dot in it. Same output every run.

Usage, from the repo root:
    python3 -B tools/tests/games/make_rocket_icon.py [--out games/rocket-lander/icon.svg]
"""
import argparse

H = 44.0          # the rocket's height unit (scene.js's h)
CX, CY = 24.0, 25.6  # where its middle goes in the 48 x 48 box (it spans -0.5h to 0.415h)


def p(x, y):
    return f'{CX + x * H:.1f} {CY + y * H:.1f}'


def body():
    # scene.js bodyPath
    return (f'M{p(0, -0.5)}C{p(0.17, -0.44)} {p(0.27, -0.24)} {p(0.265, 0)}'
            f'C{p(0.26, 0.17)} {p(0.235, 0.29)} {p(0.18, 0.35)}L{p(-0.18, 0.35)}'
            f'C{p(-0.235, 0.29)} {p(-0.26, 0.17)} {p(-0.265, 0)}C{p(-0.27, -0.24)} {p(-0.17, -0.44)} {p(0, -0.5)}Z')


def fin(s):
    # drawRocket's fins
    return f'M{p(s * 0.2, 0)}Q{p(s * 0.42, 0.14)} {p(s * 0.39, 0.41)}Q{p(s * 0.3, 0.37)} {p(s * 0.15, 0.33)}Z'


def nozzle():
    return f'M{p(-0.1, 0.33)}L{p(0.1, 0.33)}L{p(0.135, 0.415)}L{p(-0.135, 0.415)}Z'


def circle(cx, cy, r):
    """A circle as a path, drawn the other way round from the body so it cuts a hole (nonzero rule)."""
    x, y = CX + cx * H, CY + cy * H
    return f'M{x + r:.1f} {y:.1f}A{r:.1f} {r:.1f} 0 1 0 {x - r:.1f} {y:.1f}A{r:.1f} {r:.1f} 0 1 0 {x + r:.1f} {y:.1f}Z'


def svg():
    wy, wr = -0.045, 0.135 * H  # the window (drawRocket)
    hole = circle(0, wy, wr * 1.05)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor">'
            f'<path fill-rule="evenodd" d="{body()}{hole}"/>'
            f'<path d="{fin(-1)}{fin(1)}{nozzle()}"/>'
            f'<circle cx="{CX:.1f}" cy="{CY + (wy + 0.03) * H:.1f}" r="{wr * 0.6:.1f}"/>'
            '</svg>\n')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--out', default='games/rocket-lander/icon.svg')
    a = ap.parse_args()
    with open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(svg())
    print(a.out)
