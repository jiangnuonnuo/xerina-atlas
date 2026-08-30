from pathlib import Path

lines = []
lines.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 760" width="960" height="760" data-generator="fireworks-tech-graph" data-diagram-type="sequence">')
lines.append('<style>text{font-family:Helvetica Neue,Helvetica,Arial,PingFang SC,Microsoft YaHei,sans-serif} .title{font-size:26px;font-weight:700;fill:#111827}.sub{font-size:13px;fill:#6b7280}.actor{font-size:14px;font-weight:600;fill:#111827}.msg{font-size:12px;fill:#374151}.note{font-size:12px;fill:#6b7280}</style>')
lines.append('<defs><marker id="arrow-control" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><path d="M0,0 L10,3.5 L0,7 Z" fill="#2563eb"/></marker><marker id="arrow-async" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><path d="M0,0 L10,3.5 L0,7 Z" fill="#6b7280"/></marker></defs>')
lines.append('<rect width="960" height="760" fill="#ffffff"/>')
lines.append('<text x="48" y="46" class="title">Streamable HTTP · 会话与恢复</text>')
lines.append('<text x="48" y="70" class="sub">initialize 建会话，GET 监听，POST 处理，Last-Event-ID 负责恢复</text>')
xs = [120, 350, 570, 800]
names = ['MCP 客户端','网关接入','会话服务','Redis 状态']
for x, name in zip(xs, names):
    lines.append(f'<g data-graph-role="participant"><rect x="{x-72}" y="100" width="144" height="42" rx="8" fill="#eff6ff" stroke="#93c5fd"/><text x="{x}" y="126" text-anchor="middle" class="actor">{name}</text><path d="M{x} 142 V690" stroke="#cbd5e1" stroke-width="1.4" stroke-dasharray="5 5"/></g>')
for x, y in [(350,210),(570,260),(350,310),(120,360),(350,410),(570,460),(350,510),(120,560),(350,610),(120,660)]:
    lines.append(f'<rect x="{x-5}" y="{y-10}" width="10" height="30" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1"/>')
messages = [
    (120,350,190,'POST initialize','control'),
    (350,570,240,'校验网关与凭证','control'),
    (570,800,290,'创建会话租约','control'),
    (800,570,340,'返回 session-id','control'),
    (570,350,390,'初始化响应','control'),
    (120,350,440,'GET + Mcp-Session-Id','control'),
    (350,570,490,'建立监听流','async'),
    (120,350,540,'POST tools/call','control'),
    (350,570,590,'发布结果事件','async'),
    (570,350,640,'SSE 结果流','async'),
    (120,350,690,'重连 + Last-Event-ID','control'),
]
for index, (src, dst, y, label, kind) in enumerate(messages, 1):
    color = '#2563eb' if kind == 'control' else '#6b7280'
    marker = 'arrow-control' if kind == 'control' else 'arrow-async'
    dash = '' if kind == 'control' else ' stroke-dasharray="5 4"'
    lines.append(f'<path id="message-{index}" data-graph-role="edge" d="M{src} {y} H{dst}" fill="none" stroke="{color}" stroke-width="1.8"{dash} marker-end="url(#{marker})"/>')
    lines.append(f'<rect x="{(src+dst)/2-64}" y="{y-24}" width="128" height="18" rx="4" fill="#ffffff" opacity=".94"/><text x="{(src+dst)/2}" y="{y-11}" text-anchor="middle" class="msg">{label}</text>')
lines.append('<rect x="62" y="174" width="836" height="558" rx="10" fill="none" stroke="#dbe5f1" stroke-dasharray="6 5"/>')
lines.append('<text x="78" y="196" class="note">同步请求与异步事件共用会话作用域；恢复依赖事件 id，不依赖客户端自行重放业务请求</text>')
lines.append('<line x1="64" y1="724" x2="94" y2="724" stroke="#2563eb" stroke-width="1.8" marker-end="url(#arrow-control)"/><text x="102" y="728" class="note">同步请求</text><line x1="202" y1="724" x2="232" y2="724" stroke="#6b7280" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#arrow-async)"/><text x="240" y="728" class="note">事件 / 流</text>')
lines.append('</svg>')
Path('/Users/jiang/Item/Java/xerina-atlas/docs/projects/ai-mcp-gateway/assets/session-sequence.svg').write_text('\n'.join(lines), encoding='utf-8')
