# 我的博客

一个使用 Hugo 构建的现代化静态博客，采用 FixIt 主题，部署在 Vercel 上。

## 技术栈

- **Hugo** v0.147.7 Extended - 快速的静态网站生成器
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
├── themes/FixIt/       # FixIt 主题 (git submodule)
├── hugo.toml          # Hugo 配置文件
├── static/            # 静态资源
├── layouts/           # 自定义布局模板
├── data/              # 数据文件
└── public/            # 构建输出 (git ignored)
```

## 快速开始

### 前置要求

- Hugo Extended v0.147.7 或更高版本

### 本地开发

1. 克隆仓库（包含 submodules）：
```bash
git clone --recurse-submodules https://github.com/cloudzun/clean-vercel-blog.git
cd clean-vercel-blog
```

2. 如果已经克隆，初始化 submodule：
```bash
git submodule update --init --recursive
```

3. 启动 Hugo 开发服务器：
```bash
hugo server -D
```

4. 在浏览器中打开 [http://localhost:1313](http://localhost:1313) 查看效果。

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