---
title: RAG 与 Agent 模板
type: project-chapter
project: nexus-flow-ai
group: 智能体工程化
order: 40
description: 介绍业务知识检索增强和 Step、Loop、ReAct 等 Agent 模板的工程化思路。
sidebar: true
layout: project-doc
---

## RAG 知识库

针对业务知识问答和内容生成场景，设计“metadata 精准过滤 + 多路召回 + rerank 重排”的检索增强方案。metadata 过滤用于缩小知识范围，多路召回用于覆盖不同检索路径，rerank 用于进一步调整候选结果顺序。

目标是降低无关召回与跨账号数据污染，提升大模型回答的相关性和知识命中能力。

## Agent 模板

项目设计了 Step、Loop、ReAct 等多类型 Agent 模板，支持 LLM 辅助生成 Agent 执行链路、节点角色和 Prompt 初稿。

模板的价值是把重复的搭建过程结构化，让用户可以用一句话生成不同类型智能体的初始配置，再继续人工修改和验证。

## 结果

Agent 搭建耗时从 5+ 分钟降低到 1 分钟内。后续文章应进一步记录不同模板的适用边界、失败案例和评测方法。
