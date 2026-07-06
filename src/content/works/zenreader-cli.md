---
title: ZenReader CLI
description: 用 Rust 编写的命令行极简阅读工具，一键提取 clean-markdown。
date: 2026-02-15
status: 已完成
tags:
  - 开源
  - Rust
featured: false
githubUrl: https://github.com/example/zenreader-cli
---

在这个随时随地被各种网页侧边栏广告、弹窗订阅和花哨样式轰炸的时代，我们只想好好地阅读一篇深度好文。

**ZenReader CLI** 诞生于这个极简主义的愿望。它是一款运行在终端（Terminal）中的阅读代理工具。

### 功能特色：
- **纯粹的文字提取**：利用 Readability 算法的 Rust 实现，过滤一切 HTML 垃圾节点，只保留干净的标题、正文和代码。
- **终端排版美学**：针对终端进行了高品质的行宽限制与段落留白渲染，即使在黑底白字的命令行中，也能读出纸质书的舒畅感。
- **离线归档**：支持将文章一键另存为带有清晰元数据（Metadata）的 Markdown 本地文本，便于建立个人知识沉淀库。
