# 我的博客

一个简洁、高效的博客，使用 Next.js 构建并部署在 Vercel 上。

## 特性

- Next.js 14 与 App Router
- 基于 Markdown 的内容管理
- 响应式设计，使用 Tailwind CSS
- 静态生成以获得最佳性能
- 与 Hugo Paper 主题一致的设计风格

## 目录结构

- `app/` - Next.js 14 App Router 页面
- `content/posts/` - Markdown 博客文章
- `components/` - React 组件
- `lib/` - 工具函数

## 快速开始

启动开发服务器：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 部署

该项目设计用于部署到 Vercel。只需将 GitHub 仓库连接到 Vercel，它将自动构建和部署。