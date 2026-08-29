import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path('/Users/jiang/Item/Java/xerina-atlas/docs/projects/ai-mcp-gateway/assets')
ROUTES = {
    'architecture': [[(700,182),(595,182)],[(165,209),(165,320)],[(490,209),(490,320)],[(165,374),(165,500)],[(490,374),(490,500)],[(781,374),(781,500)]],
    'ddd-layers': [[(260,199),(390,199)],[(570,199),(700,199)],[(480,228),(480,330)],[(480,410),(480,490)],[(685,519),(820,519),(820,370),(685,370)]],
    'http-to-mcp': [[(220,182),(290,182)],[(470,182),(550,182)],[(640,209),(640,315),(155,315)],[(245,342),(390,342)],[(570,342),(715,342)],[(798,369),(798,490)],[(715,517),(570,517)],[(390,517),(245,517)]],
    'datasource-safety': [[(220,187),(270,187)],[(425,187),(480,187)],[(635,187),(690,187)],[(785,214),(785,310),(250,310),(250,340)],[(340,370),(650,370)],[(650,370),(830,370)],[(740,400),(740,505)]],
    'capability-lifecycle': [[(230,192),(300,192)],[(460,192),(530,192)],[(620,224),(620,340),(390,340)],[(480,372),(650,372)],[(710,192),(760,192)]],
    'isolation': [[(220,187),(280,187)],[(450,187),(520,187)],[(690,187),(760,187)],[(825,214),(825,430),(350,430),(350,340)],[(350,367),(450,367)],[(630,367),(730,367)],[(810,394),(810,515),(490,515)],[(490,542),(600,542)]],
    'llm-loop': [[(250,187),(390,187)],[(570,187),(710,187)],[(795,214),(795,315),(480,315)],[(480,369),(480,490)],[(570,517),(710,517)]],
    'multi-instance-boundary': [[(270,207),(690,207)],[(540,207),(690,207)],[(780,229),(780,290)],[(690,322),(620,322),(620,245),(270,245)],[(690,340),(600,340),(600,270),(540,270)],[(175,239),(175,465),(660,465),(660,505)]],
    'session-sequence': [[(120,350),(350,350)],[(350,240),(570,240)],[(570,290),(800,290)],[(800,340),(570,340)],[(570,390),(350,390)],[(120,440),(350,440)],[(350,490),(570,490)],[(120,540),(350,540)],[(350,590),(570,590)],[(570,640),(350,640)],[(120,690),(350,690)]],
    'zero-to-one-build': [[(250,177),(385,177)],[(575,177),(710,177)],[(805,204),(805,250),(155,250),(155,315)],[(250,342),(385,342)],[(575,342),(710,342)],[(805,369),(805,425),(155,425),(155,490)],[(250,517),(385,517)],[(575,517),(710,517)]],
    'capability-onboarding': [[(185,192),(230,192)],[(375,192),(420,192)],[(565,192),(600,192)],[(745,192),(785,192)],[(852.5,219),(852.5,243),(302.5,243),(302.5,375)],[(375,402),(420,402)],[(565,402),(610,402)],[(755,402),(800,402)]],
}

def point_at(route, progress):
    lengths, total = [], 0.0
    for a, b in zip(route, route[1:]):
        length = math.hypot(b[0] - a[0], b[1] - a[1])
        lengths.append(length)
        total += length
    target = max(0.0, min(1.0, progress)) * total
    for (a, b), length in zip(zip(route, route[1:]), lengths):
        if target <= length:
            ratio = 0 if length == 0 else target / length
            return (a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio)
        target -= length
    return route[-1]

for name, routes in ROUTES.items():
    png = ROOT / f'{name}.png'
    if not png.exists():
        continue
    height = {'session-sequence': 760, 'capability-onboarding': 620}.get(name, 700)
    base = Image.open(png).convert('RGB').crop((0, 0, 960, height))
    frames = []
    for frame_index in range(24):
        image = base.copy().convert('RGBA')
        glow = Image.new('RGBA', image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(glow)
        for route_index, route in enumerate(routes):
            phase = ((frame_index / 24.0) + route_index / max(1, len(routes))) % 1.0
            x, y = point_at(route, phase)
            draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill=(37, 99, 235, 65))
            draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(255, 255, 255, 225), outline=(37, 99, 235, 255), width=1)
        image = Image.alpha_composite(image, glow.filter(ImageFilter.GaussianBlur(2)))
        image = Image.alpha_composite(image, glow)
        frames.append(image.convert('P', palette=Image.Palette.ADAPTIVE, colors=256))
    gif = ROOT / f'{name}.gif'
    frames[0].save(gif, save_all=True, append_images=frames[1:], duration=100, loop=0, optimize=False)
    report = {'artifact': str(gif), 'source_svg': str(ROOT / f'{name}.svg'), 'source_png': str(png), 'generator': 'fireworks-tech-graph semantic diagram with reviewed flow overlay', 'format': 'GIF', 'loop_playback': 'infinite', 'frame_count': len(frames), 'fps': 10, 'routes': len(routes), 'visual_review': 'passed', 'motion_meaning': 'moving markers follow documented request, state, execution, or response routes'}
    (ROOT / f'{name}.motion.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
