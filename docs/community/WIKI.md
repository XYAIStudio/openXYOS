# GitHub Wiki 与仓库文档

GitHub Wiki 页面很难通过 Pull Request 审阅，也容易和仓库脱节。**权威文档在本仓库的 `docs/` 目录**（以及根目录的 README、CONTRIBUTING、SECURITY、CODE_OF_CONDUCT）。Wiki 只应作为入口指针，把访客送回可评审的源文件和 Discussions。

The GitHub Wiki is hard to review in a pull request and drifts easily. **Authoritative documentation lives in this repository under `docs/`** (plus the root README, CONTRIBUTING, SECURITY, and CODE_OF_CONDUCT files). Treat Wiki pages as pointers back to reviewable sources and Discussions.

## 仓库内关键文档 / Key in-repo docs

| 主题 / Topic | 文档 / Document |
| --- | --- |
| 社区入口 | [docs/community/README.md](README.md) |
| 项目总览 | [README.md](../../README.md) · [README.en.md](../../README.en.md) |
| 安装语言索引 | [docs/i18n/README.md](../i18n/README.md) |
| 操作指南 | [中文](../guides/operation-guide.zh-CN.md) · [English](../guides/operation-guide.en.md) |
| 架构 | [docs/architecture.md](../architecture.md) |
| 模块二次开发 | [docs/module-development.md](../module-development.md) |
| 开源范围 | [docs/open-source-scope.md](../open-source-scope.md) |
| 本地化政策 | [docs/i18n/POLICY.md](../i18n/POLICY.md) |
| 贡献 | [CONTRIBUTING.md](../../CONTRIBUTING.md) |
| 行为准则 | [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md) |
| 安全 | [SECURITY.md](../../SECURITY.md) |
| 治理与发布闸门 | [docs/governance](../governance) |

若要新增 Wiki 子页，只放标题加指向上述文件的链接；不要在 Wiki 里复制整章，以免出现第二份无法评审的正文。

If you add Wiki subpages, use a title plus links to the files above. Do not copy whole chapters into the Wiki.

## 维护者操作：粘贴 Wiki Home

Wiki 无法随本 PR 自动更新。仓库设置中启用 Wiki 后，维护者打开  
`https://github.com/XYAIStudio/openXYOS/wiki` → **Home** → **Edit**，将下面代码块中的 Markdown **原样粘贴**并保存。之后若社区入口变更，先改本文件和 `docs/community/README.md`，再同步 Wiki Home。

The Wiki cannot be updated by this pull request. After the repository Wiki is enabled, a maintainer should open  
`https://github.com/XYAIStudio/openXYOS/wiki`, edit **Home**, and paste the Markdown in the following fence **verbatim**. When community entry points change, update this file and `docs/community/README.md` first, then refresh Wiki Home.

### Paste-ready GitHub Wiki Home

```markdown
# openXYOS Wiki

This Wiki is a **pointer**, not the source of truth.

Authoritative documentation is reviewed in git under [`docs/`](https://github.com/XYAIStudio/openXYOS/tree/main/docs). Please read and send corrections there.

本 Wiki 只是入口。权威文档在仓库 [`docs/`](https://github.com/XYAIStudio/openXYOS/tree/main/docs) 中，请在那里阅读和提交修正。

## Start here / 从这里开始

- [README (简体中文)](https://github.com/XYAIStudio/openXYOS/blob/main/README.md)
- [README (English)](https://github.com/XYAIStudio/openXYOS/blob/main/README.en.md)
- [Community guide / 社区指南](https://github.com/XYAIStudio/openXYOS/blob/main/docs/community/README.md)
- [Contributing](https://github.com/XYAIStudio/openXYOS/blob/main/CONTRIBUTING.md)
- [Code of conduct](https://github.com/XYAIStudio/openXYOS/blob/main/CODE_OF_CONDUCT.md)
- [Security policy](https://github.com/XYAIStudio/openXYOS/blob/main/SECURITY.md)

## Ask the community / 向社区提问

Do not use Issues for install or how-to questions.

安装与使用问题请走 Discussions，不要开 Issue。

- [Welcome / 欢迎](https://github.com/XYAIStudio/openXYOS/discussions/1)
- [Newbie Q&A / 新手问答](https://github.com/XYAIStudio/openXYOS/discussions/2)
- [Roadmap ideas / 路线图](https://github.com/XYAIStudio/openXYOS/discussions/3)
- [Start a Q&A thread](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a)
- [Share an idea](https://github.com/XYAIStudio/openXYOS/discussions/new?category=ideas)
- [Show and tell](https://github.com/XYAIStudio/openXYOS/discussions/new?category=show-and-tell)

Report vulnerabilities through [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/privately-reporting-a-security-vulnerability).

## Key docs / 关键文档

- [Install language index](https://github.com/XYAIStudio/openXYOS/blob/main/docs/i18n/README.md)
- [Operation guide (zh-CN)](https://github.com/XYAIStudio/openXYOS/blob/main/docs/guides/operation-guide.zh-CN.md)
- [Operation guide (en)](https://github.com/XYAIStudio/openXYOS/blob/main/docs/guides/operation-guide.en.md)
- [Architecture](https://github.com/XYAIStudio/openXYOS/blob/main/docs/architecture.md)
- [Module development](https://github.com/XYAIStudio/openXYOS/blob/main/docs/module-development.md)
- [Open-source scope](https://github.com/XYAIStudio/openXYOS/blob/main/docs/open-source-scope.md)
- [Localization policy](https://github.com/XYAIStudio/openXYOS/blob/main/docs/i18n/POLICY.md)
- [Governance](https://github.com/XYAIStudio/openXYOS/tree/main/docs/governance)
```
