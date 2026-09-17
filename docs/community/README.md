# 社区指南 / Community guide

新贡献者从这里开始：先搞清在哪里提问，再花五分钟把项目跑起来。

New contributors start here: learn where to ask, then get a local copy running in about five minutes.

源码仓库 / Source: [github.com/XYAIStudio/openXYOS](https://github.com/XYAIStudio/openXYOS)

---

## 中文

### 在哪里提问

| 你想做什么 | 去哪里 | 不要这样做 |
| --- | --- | --- |
| 安装、模块、智能体定制等使用问题 | [Discussions Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a)，可先看 [新手问答帖](https://github.com/XYAIStudio/openXYOS/discussions/2) | 不要为求助开 Issue |
| 打招呼、了解项目 | [欢迎帖](https://github.com/XYAIStudio/openXYOS/discussions/1) | — |
| 路线图与产品想法 | [Discussions Ideas](https://github.com/XYAIStudio/openXYOS/discussions/new?category=ideas)，可先看 [路线图讨论](https://github.com/XYAIStudio/openXYOS/discussions/3) | 不要把尚未讨论清楚的想法直接开成功能 Issue |
| 展示你做的模块、Fork 或集成 | [Show and tell](https://github.com/XYAIStudio/openXYOS/discussions/new?category=show-and-tell) | 不要贴密钥、客户数据或生产地址 |
| 可复现的缺陷 | [Bug issue](https://github.com/XYAIStudio/openXYOS/issues/new?template=bug_report.yml) | 不要在公开帖里写漏洞利用细节 |
| 已讨论清楚、可独立评审的改进 | [Feature issue](https://github.com/XYAIStudio/openXYOS/issues/new?template=feature_request.yml) | 不要把多个无关改动塞进同一个 Issue |
| 安全漏洞 | [私密漏洞报告](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/privately-reporting-a-security-vulnerability) 与 [SECURITY.md](../../SECURITY.md) | 不要在 Issue、Discussion 或 PR 中公开 |

提问前请先搜索已有 Discussions 和 Issues。Issue 模板已关闭空白工单，提问入口会引导到 Discussions。

### 五分钟快速开始

需要 Node.js 20.19 或更高版本。

```bash
git clone https://github.com/XYAIStudio/openXYOS.git
cd openXYOS
npm ci
cp .env.example .env
npm run dev
```

Windows PowerShell 使用 `Copy-Item .env.example .env`。启动前替换 `.env` 中的 `JWT_SECRET` 和 `COOKIE_SECRET`，不要提交该文件。浏览器打开 `http://localhost:5174`；API 默认在 `http://localhost:3000/api`。

演示数据默认关闭。仅本地评估时设置 `SEED_DEMO_DATA=true`，并提供至少 12 位的自定义密码。公开仓库不内置管理员密码。不要把密钥、Cookie 或客户资料贴进 Issue、截图或源码。

更完整的安装说明见[多语言简介与安装指南](../i18n/README.md)。

### 操作指南

本地跑起来后，按界面实际标签阅读：

- [中文操作指南](../guides/operation-guide.zh-CN.md)
- [English operation guide](../guides/operation-guide.en.md)

界面可能比文档更新；屏幕上的按钮、权限提示和校验错误优先于指南中的旧措辞。

### 适合新人的贡献路径

维护者没有预先编造缺陷工单。下列路径真实、小、且不碰敏感运行时目录。欢迎在 [Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a) 确认范围后再开 PR。

1. **文档错别字与中英对齐**  
   对照 [README.md](../../README.md) 与 [README.en.md](../../README.en.md)、两份操作指南，以及 [docs/i18n](../i18n/README.md) 下的安装指南。只修正表述、断链和明显过时的步骤，不要改写未核实的产品承诺。

2. **界面文案遗漏排查（i18n）**  
   工作区支持 `zh-CN` 和 `en`。系统文案应使用 `frontend/src/locales/system.ts` 的稳定 key，或组件里成对的 `t(中文, English)`，见 [本地化政策](../i18n/POLICY.md) 和 [双语发布约定](../i18n/BILINGUAL_RELEASE.md)。  
   建议步骤：运行 `npm run i18n:check`；在 `frontend/src` 搜索没有英文配对的中文 `alert(` / 硬编码提示。只报告真实看到的文件路径和复现步骤，不要虚构“缺失 key”。发现后用同一 PR 补上中英两份文案。

3. **操作指南与实机标签对照**  
   按上一节启动项目，把指南章节和当前界面标签、空状态、权限提示对照。文档漂移用文档 PR 修复即可，不要顺手改模块目录或运行时契约。

4. **贡献流程文档**  
   改善本目录、[CONTRIBUTING.md](../../CONTRIBUTING.md) 或 Wiki 指针的可发现性。权威文档在仓库 `docs/` 内，见 [WIKI.md](WIKI.md)。

请勿在新人 PR 中修改产品运行时模块目录（`backend/open-module-catalog.ts`、`frontend/src/open-modules.ts`），也不要提交数据库、上传文件、密钥或构建产物。

提交前至少运行：

```bash
npm run lint
npm run i18n:check
npm run typecheck
```

完整检查清单见 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

### 行为准则

参与前阅读 [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md)。保持尊重、欢迎善意提问、批评针对代码和想法。骚扰、歧视、威胁和人肉搜索不可接受。行为问题请私下联系维护者，不要在公开帖里扩散。

### 贡献许可（CLA）与 DCO

摘自 [CONTRIBUTING.md](../../CONTRIBUTING.md)：

- 每个 commit 需要 `Signed-off-by: Your Name <email>`（`git commit --signoff`）。
- 合并前，贡献者须完成项目 ICLA 或适用的 CCLA，并由维护者打上 `cla-signed` 标签。协议仅在法务审核后公布；在此之前，外部贡献可以讨论，但不会合并。
- 除非另有签署的贡献协议，故意提交到本仓库的贡献按 Apache License 2.0 提供。品牌权利见 [TRADEMARKS.md](../../TRADEMARKS.md)。

---

## English

### Where to ask

| You want to | Use | Do not |
| --- | --- | --- |
| Ask about install, modules, or Agent Studio | [Discussions Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a); start from the [newbie thread](https://github.com/XYAIStudio/openXYOS/discussions/2) | Do not open an Issue for support |
| Say hello | [Welcome thread](https://github.com/XYAIStudio/openXYOS/discussions/1) | — |
| Share roadmap or product ideas | [Discussions Ideas](https://github.com/XYAIStudio/openXYOS/discussions/new?category=ideas); see [roadmap input](https://github.com/XYAIStudio/openXYOS/discussions/3) | Do not file a feature Issue before the idea is scoped |
| Show a module, fork, or integration | [Show and tell](https://github.com/XYAIStudio/openXYOS/discussions/new?category=show-and-tell) | Do not paste secrets, customer data, or production hosts |
| Report a reproducible defect | [Bug issue](https://github.com/XYAIStudio/openXYOS/issues/new?template=bug_report.yml) | Do not publish exploit details |
| Propose a focused, reviewable change | [Feature issue](https://github.com/XYAIStudio/openXYOS/issues/new?template=feature_request.yml) | Do not mix unrelated outcomes |
| Report a vulnerability | [Private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/privately-reporting-a-security-vulnerability) and [SECURITY.md](../../SECURITY.md) | Do not disclose in Issues, Discussions, or PRs |

Search existing Discussions and Issues first. Blank issues are disabled; the issue chooser sends questions to Discussions.

### Five-minute quickstart

Node.js 20.19 or later is required.

```bash
git clone https://github.com/XYAIStudio/openXYOS.git
cd openXYOS
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env`. Replace `JWT_SECRET` and `COOKIE_SECRET` in `.env` before startup. Never commit that file. Open `http://localhost:5174`; the API defaults to `http://localhost:3000/api`.

Demo data is off by default. For local evaluation only, set `SEED_DEMO_DATA=true` and a custom password of at least 12 characters. The public repository does not ship an administrator password. Never paste keys, cookies, or customer material into issues, screenshots, or source files.

See the [language index](../i18n/README.md) for fuller install notes.

### Operation guide

After the app is running, follow the live UI labels:

- [中文操作指南](../guides/operation-guide.zh-CN.md)
- [English operation guide](../guides/operation-guide.en.md)

The UI can move faster than the guide. On-screen buttons, permission messages, and validation errors win when they differ from older wording.

### Good first contribution paths

Maintainers are not inventing placeholder bug tickets. These paths are real, small, and avoid sensitive runtime catalogs. Confirm scope in [Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a) before opening a pull request.

1. **Docs typo and bilingual alignment**  
   Compare [README.md](../../README.md) with [README.en.md](../../README.en.md), the two operation guides, and the [docs/i18n](../i18n/README.md) install editions. Fix wording, broken links, and stale steps. Do not rewrite unverified product claims.

2. **i18n leftover hunt**  
   The workspace supports `zh-CN` and `en`. System copy should use stable keys in `frontend/src/locales/system.ts` or paired `t(zh, en)` calls. See the [localization policy](../i18n/POLICY.md) and [bilingual release contract](../i18n/BILINGUAL_RELEASE.md).  
   Suggested steps: run `npm run i18n:check`; search `frontend/src` for Chinese-only `alert(` strings or UI copy without an English pair. Report only files you actually found. Add both languages in the same pull request.

3. **Operation guide vs live labels**  
   Start the app as above and compare guide sections with current labels, empty states, and permission text. Fix drift with a docs-only PR. Do not change module catalogs or runtime contracts while doing this.

4. **Contributor-facing docs**  
   Improve this folder, [CONTRIBUTING.md](../../CONTRIBUTING.md), or the Wiki pointer. Authoritative docs live in-repo under `docs/`; see [WIKI.md](WIKI.md).

Do not change product runtime module catalogs (`backend/open-module-catalog.ts`, `frontend/src/open-modules.ts`) in a first contribution. Do not commit databases, uploads, secrets, or build artifacts.

Before you push, run at least:

```bash
npm run lint
npm run i18n:check
npm run typecheck
```

The full checklist is in [CONTRIBUTING.md](../../CONTRIBUTING.md).

### Code of conduct

Read [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md) before participating. Communicate professionally, welcome good-faith questions, and keep criticism on ideas and code. Harassment, discrimination, threats, and doxxing are not acceptable. Report conduct concerns privately to maintainers.

### CLA and DCO

From [CONTRIBUTING.md](../../CONTRIBUTING.md):

- Add `Signed-off-by: Your Name <email>` to every commit (`git commit --signoff`).
- Before a pull request can be merged, the contributor must have completed the project ICLA or an applicable CCLA and received the `cla-signed` label from a maintainer. The agreement is published only after legal review; until then, external contributions are discussed but not merged.
- Unless a separately executed contributor agreement states otherwise, contributions intentionally submitted to this repository are provided under the Apache License 2.0. Brand rights are governed by [TRADEMARKS.md](../../TRADEMARKS.md).
