# 我的博客

一个使用 Hugo 构建的现代化静态博客，采用 FixIt 主题，部署在 Vercel 上。

## 技术栈

- **Hugo** v0.156.0 Extended - 快速的静态网站生成器
- **FixIt 主题** - 功能丰富的 Hugo 主题
- **Vercel** - 全球 CDN 部署平台

## 项目特点

- ⚡ 极速构建和页面加载
- 📝 Markdown 驱动的内容管理
- 🎨 精美的 FixIt 主题，开箱即用
- 🌐 SEO 友好，自动生成 sitemap 和 RSS
- 📱 完全响应式设计
- 🌙 支持亮色/暗色主题切换
- 📊 内置阅读时间、字数统计

## 目录结构

```
├── content/posts/      # Markdown 博客文章
├── themes/FixIt/       # FixIt 主题（已 vendor 进仓库，非 submodule）
├── hugo.toml          # Hugo 配置文件
├── static/            # 静态资源
├── .github/           # GitHub Actions 定时任务（HN 日报）
└── public/            # 构建输出 (git ignored)
```

## 快速开始

### 前置要求

- Hugo Extended v0.156.0 或更高版本

### 本地开发

1. 克隆仓库：
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

生成的静态文件将位于 `public/` 目录。

## 部署

项目已配置为自动部署到 Vercel：

1. 推送到 `master` 分支自动触发部署
2. Vercel 自动执行 `hugo --gc --minify` 构建
3. 部署 `public/` 目录的静态文件

另外，仓库中的 [HN Daily Digest 定时任务](.github/workflows/hn-daily-digest.yml) 每天 06:14（北京时间）自动抓取 Hacker News 热门文章，调用 DeepSeek API 生成摘要并提交日报。

## 配置

编辑 `hugo.toml` 文件来自定义：

- 站点标题和描述
- 菜单导航
- 主题颜色和样式
- 社交媒体链接
- 评论系统
- 更多 FixIt 主题选项

详见 [FixIt 主题文档](https://fixit.lruihao.cn/)

## 项目历程

本项目经历了从 Next.js 到 Hugo 的技术栈迁移。详情请阅读：
- [博客文章：从 Next.js 到 Hugo - 一次技术选型的反思](/posts/2026-02-06-nextjs-to-hugo-migration-reflection/)

## License

MIT
