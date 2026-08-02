# 我的博客

一个使用 Hugo 构建的现代化静态博客，采用 FixIt 主题，部署在 Vercel 上，并内置一个每日自动生成的 **Hacker News 中文日报（HN Daily Digest）**。

## 技术栈

- **Hugo** v0.156.0 Extended - 快速的静态网站生成器
- **FixIt 主题** - 功能丰富的 Hugo 主题（已 vendor 进仓库，版本对应 `@hugo-fixit/core` 0.4.x）
- **Vercel** - 全球 CDN 部署平台（`hugo --gc --minify` 构建 + 自动部署）
- **GitHub Actions** - 每日定时生成 HN 日报并自动提交
- **DeepSeek API** - 日报摘要的 AI 生成后端（模型 `deepseek-v4-flash`）

## 项目特点

- ⚡ 极速构建和页面加载（纯静态、无图、资源 SRI 指纹 + immutable 缓存）
- 📝 Markdown 驱动的内容管理
- 📰 每日自动生成 Hacker News 中文日报（见下文"HN Daily Digest 定时任务"）
- 🌐 SEO 友好，自动生成 sitemap 和 RSS
- 📱 完全响应式设计
- 🌙 支持亮色/暗色主题切换
- 🔒 默认关闭 Markdown 原始 HTML，资源带 SRI 校验，全站安全响应头

## 目录结构

```
├── content/posts/            # Markdown 博客文章（含每日自动生成的 HN 日报）
├── themes/FixIt/             # FixIt 主题（已 vendor 进仓库，非 submodule）
├── hugo.toml                 # Hugo 站点配置
├── vercel.json               # Vercel 构建与响应头配置
├── static/                   # 静态资源
│   └── lib/mermaid/          # 自托管的 mermaid@11.16.0（避免运行时依赖 CDN）
├── .github/
│   ├── workflows/hn-daily-digest.yml   # 日报定时任务
│   └── scripts/generate-improved.js    # 日报生成脚本
└── public/                   # 构建输出（git ignored）
```

## 快速开始

### 前置要求

- Hugo Extended v0.156.0 或更高版本（与 [vercel.json](vercel.json) 中锁定的 `HUGO_VERSION` 一致）
- 运行日报脚本需要 Node.js 22+

### 本地开发

1. 克隆仓库（主题已入库，无需 submodule）：
```bash
git clone https://github.com/cloudzun/clean-vercel-blog.git
cd clean-vercel-blog
```

2. 启动 Hugo 开发服务器：
```bash
hugo server -D
```

3. 在浏览器中打开 [http://localhost:1313](http://localhost:1313) 查看效果。

## 创建新文章

```bash
hugo new posts/my-new-post.md
```

## 构建

```bash
hugo --gc --minify
```

生成的静态文件位于 `public/` 目录。

## 部署

项目已配置为自动部署到 Vercel：

1. 推送到 `master` 分支自动触发部署
2. Vercel 自动执行 `hugo --gc --minify` 构建（[vercel.json](vercel.json) 指定 Hugo 0.156.0）
3. 部署 `public/` 目录的静态文件

[vercel.json](vercel.json) 同时配置了：

- `/js/*`、`/css/*` 等带 SRI 指纹的资源：`Cache-Control: public, max-age=31536000, immutable`
- 全站安全响应头：`X-Content-Type-Options: nosniff`、`X-Frame-Options: SAMEORIGIN`、`Referrer-Policy: strict-origin-when-cross-origin`

## HN Daily Digest 定时任务

仓库内置了一个每天自动生成 Hacker News 中文日报的流水线，产出文件为 `content/posts/YYYY-MM-DD-hn-daily-digest.md`。

### 触发方式

1. **定时触发**：`cron: '14 22 * * *'`，即每天 UTC 22:14（北京时间次日 06:14）运行；
2. **手动触发**：在 GitHub 的 Actions 页面点击 "Run workflow"，或执行：
   ```bash
   gh workflow run hn-daily-digest.yml --repo cloudzun/clean-vercel-blog
   ```

### 运行环境

- GitHub Actions `ubuntu-latest`，任务超时上限 20 分钟（`timeout-minutes: 20`）
- Node.js 22（`actions/setup-node`）
- `actions/checkout` 与 `actions/setup-node` 固定到提交 SHA，避免供应链变动
- 需要仓库配置一个 Actions secret：**`DEEPSEEK_API_KEY`**（在 Settings → Secrets and variables → Actions 中设置）

### 生成流程（`.github/scripts/generate-improved.js`）

脚本共分 7 步：

1. **获取 HN 热门故事**：调用 Hacker News 官方 API（`hacker-news.firebaseio.com/v0/topstories.json`）取前 30 个故事 ID，失败自动重试 3 次（间隔 5s/10s/15s）；
2. **获取故事详情**：逐个请求 `/v0/item/{id}.json`，取前 20 篇有标题和链接的有效文章；
3. **生成宏观趋势摘要（今日看点）**：把 Top 10 故事的标题、热度、讨论数发给 DeepSeek，生成 3-5 句的趋势总结；
4. **生成 Top 10 详细摘要**：先抓取每篇文章正文（超时 8s、响应体上限 1MB、重定向最多 3 次、拒绝内网/云元数据地址），再以 4 并发调用 DeepSeek 生成 300-500 字的三段式摘要；
5. **生成 11-20 一句话简介**：同样 4 并发调用 DeepSeek，输出不超过 50 个汉字的一句话简介；
6. **组装 Markdown 报告**：按北京时间日期命名文件，包含 frontmatter（标题/日期/标签）、今日看点、Top 10 详细摘要、11-20 简介和统计信息；
7. **发布检查与提交**：若详细摘要 + 简介的总成功率低于 50%，**放弃发布并以非零码退出**（Actions 会显示失败）；通过则 `git add`、`git commit`、`git push` 到 `master`，触发 Vercel 自动部署。

### AI 配置与提示词

- 接口：DeepSeek `https://api.deepseek.com/v1/chat/completions`（OpenAI 兼容格式）
- 模型：`deepseek-v4-flash`（推理模型），`max_tokens: 4000`
- 所有请求共用一条**系统提示**：只用简体中文、直接输出结果、禁止 Markdown 标题/HTML、原文缺失时保守概括且不得编造具体数字/日期/人名、避免空话套话
- 三个任务提示词：宏观趋势（基于 Top 10 标题归纳）、详细摘要（300-500 字、3 段、要点加粗）、一句话简介（≤50 汉字、直接输出）

### 稳定性与安全防护

- HN API 和 DeepSeek API 均带指数退避重试（HN 失败按 5s/10s/15s 等待；DeepSeek 429 限流按 15s/25s 等待）；
- 抓取外部文章时：8s 超时、1MB 响应体上限、重定向深度 ≤3、SSRF 防护（拒绝回环/内网/保留地址/云元数据）；
- 响应拼接使用 `setEncoding("utf8")` 并剔除 U+FFFD，避免多字节字符跨分片乱码；
- API 具体错误信息会打印到 Actions 日志，同时写入 `.github/hn-digest.log`（已加入 .gitignore）；
- 摘要成功率过低时不发布，避免把大量"生成中"的占位内容推上博客；
- 内容侧：Hugo 关闭了 raw HTML（`unsafe = false`），提示词禁止输出 HTML，降低 AI 生成内容被恶意页面注入的风险。

### 手动在本地跑一次

```bash
export DEEPSEEK_API_KEY=你的key
node .github/scripts/generate-improved.js
```

本地运行时不会执行 `git push`（仅在 GitHub Actions 环境中发布），生成的日报会写到当前目录。

### 故障排查

- 查看 Actions 运行日志（成功率、API 错误、耗时）；
- 若任务显示失败，通常是 AI 摘要成功率低于 50%：检查 `DEEPSEEK_API_KEY` 是否有效、额度是否耗尽；
- 日报里出现占位文本（"生成中..."）说明发布阈值未拦截到的异常，重点看该次运行日志里的 `API 错误` 行；
- 历史日报缺漏可用 `C:\tmp\backfill\backfill.js`（本地维护工具）按原格式回填。

## 配置

编辑 `hugo.toml` 可自定义：

- 站点标题、`baseURL`、菜单导航
- 主题颜色与样式、社交链接（GitHub / LinkedIn / Telegram / Email）
- Mermaid 图表（自托管于 `static/lib/mermaid`，通过 `[params.mermaid] cdn` 指向本地）
- 资源 SRI 指纹（`[params] fingerprint = "sha256"`）
- 更多 FixIt 主题选项

详见 [FixIt 主题文档](https://fixit.lruihao.cn/)

## 项目历程

本项目经历了从 Next.js 到 Hugo 的技术栈迁移。详情请阅读：
- [博客文章：从 Next.js 到 Hugo - 一次技术选型的反思](/posts/2026-02-06-nextjs-to-hugo-migration-reflection/)

## License

MIT
