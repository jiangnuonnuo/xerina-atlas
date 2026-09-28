---
title: 吃白饭的大肥鱼-interview
type: project
category: platform
categoryLabel: AI 平台工程
visual: api
icon: workflow
cardImage: /media/projects/dsh-harness-plugin/interview-dsh-cover.webp
year: 2026
order: 35
featured: true
status: completed
summary: 记录 interview-dsh 如何作为插件接入 DeepSeek Harness，覆盖 Host、Client、Cordis、远程契约、网页插槽与一次面试请求的完整流转。
role: 插件架构设计｜DeepSeek Harness 接入、前端插槽与 Host/Client 协作
stack:
  - DeepSeek Harness
  - Cordis
  - TypeScript
  - React
  - Typert
tags:
  - DSH 插件
  - Host / Client
  - Cordis
  - 前端插槽
  - 远程调用
  - Agent 会话
nav: true
sidebar: true
layout: project-doc
---

## 项目定位

`interview-dsh` 是运行在 DeepSeek Harness（DSH）宿主中的插件。DSH 负责运行时、会话、Agent、模型、工作区和网页布局；插件交付 Host 与 Client 两半，并通过 DSH 的服务注入、远程桥和界面插槽接入现有系统。

这组文章只描述 DSH 宿主与插件的组织方式，以及一次插件调用如何从页面进入 Host、再回到宿主会话。插件内部的业务实现不另起一套 Harness，也不自建聊天表面。

## 阅读顺序

1. [20 插件化机制](./20-plugin-mechanism)：看安装包、Host、Client、构建产物和 DSH 加载顺序。
2. [21 宿主与插件架构流转](./21-architecture-flow)：看初始化、插槽接入、Client API、远程调用和面试运行链路。
3. [架构流转可视化图](./21-architecture-flow)：页面内直接加载可缩放、可拖拽和可导出的交互图。
