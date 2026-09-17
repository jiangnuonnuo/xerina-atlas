


### openspec 技能是什么？为什么存在这个技能？
1，openspec skills 的定义，sdd 开发流程，他带来的思想
2，openspec skills 的github 开源地址，star 星数，star 涨幅


### openspec 的架构设计

1，大体目录设计
openspec/
├── config.yaml                      # 项目级配置（schema: spec-driven）
├── specs/                           # ★基线规范库（事实来源，frozen）
│   └── <capability>/               #   一个"能力"一个文件夹
│       └── spec.md                 #     只有 Requirements + Scenarios，无 delta 关键字
│
├── changes/                        # ★变更工作区（活跃草稿）
│   ├── <active-change>/            #   正在开发的变更
│   │   ├── proposal.md             #     提案：Why / What / Impact / Non-Goals
│   │   ├── design.md               #     设计：数据模型、流程、边界、风险
│   │   ├── tasks.md                #     任务清单：- [ ] 勾选框（TDD 步骤）
│   │   ├── .openspec.yaml          #     变更元数据（命名/状态/跳过标记）
│   │   ├── specs/                  #     ★增量规范（delta）
│   │   │   └── <capability>/
│   │   │       └── spec.md         #     用 ADDED/MODIFIED/REMOVED/RENAMED 描述差异
│   │   └── evidence/               #     证据：ER图、决策记录、验收SQL、截图
│   │
│   └── archive/                    # ★已完结变更的坟墓（审计轨迹）
│       └── YYYY-MM-DD-<change>/    #   原样保留 proposal/design/tasks/specs/evidence
│
└── schemas/                        # （可选）自定义 spec 模板/模式


1.2:配上完整的流转图，他们之间的结构流转方向，如归档后存放在 archive/ 等等，整个架构的流转，一张图完整的节点解释清楚

2，展开分别介绍
2.1:config.yaml 是什么文件，可以约束什么？

2.2:

