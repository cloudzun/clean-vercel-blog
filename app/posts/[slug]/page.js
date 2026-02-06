import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypePrism from 'rehype-prism-plus'
import rehypeStringify from 'rehype-stringify'

async function getPost(id) {
  const fullPath = path.join(process.cwd(), 'content', 'posts', `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  
  // 使用gray-matter解析Front Matter
  const { data, content } = matter(fileContents)
  
  // 使用remark处理Markdown内容
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrism, { ignoreMissing: true })
    .use(rehypeStringify)
    .process(content)
  
  const contentHtml = processedContent.toString()
  
  return {
    id,
    title: data.title || 'Untitled',
    date: data.date,
    author: data.author || 'Abraham Cheng',
    contentHtml,
    tags: data.tags || []
  }
}

// 获取所有文章列表用于导航
async function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), 'content', 'posts')
  let fileNames = []
  
  try {
    fileNames = fs.readdirSync(postsDirectory)
  } catch (error) {
    console.log('Posts directory does not exist yet:', error.message)
    return []
  }

  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const id = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      return {
        id,
        title: data.title || id,
        date: data.date,
        filePath: fullPath
      }
    })
    .sort((a, b) => {
      // 按日期降序排列（最新的在前）
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date)
      } else {
        return 0
      }
    })
  
  return allPostsData
}

export default async function Post({ params }) {
  const post = await getPost(params.slug)
  const allPosts = await getAllPosts()
  
  // 找到当前文章在排序后的列表中的索引
  // 列表是按日期降序排列的（最新的在前），所以：
  // - prevPost 是更新的文章（索引更小）
  // - nextPost 是更旧的文章（索引更大）
  const currentIndex = allPosts.findIndex(p => p.id === params.slug)
  const newerPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const olderPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  
  return (
    <div className="container-narrow py-12">
      <article className="prose prose-lg mx-auto">
        <header className="not-prose article-header">
          <h1 className="article-title">{post.title}</h1>
          
          <div className="article-meta">
            {post.date && (
              <time className="text-gray-600">
                {new Date(post.date).toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
            )}
            {post.author && post.date && <span>·</span>}
            {post.author && <span>{post.author}</span>}
          </div>
        </header>
        
        {/* 文章内容 */}
        <section 
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        />
        
        {/* 文章标签 */}
        {post.tags && post.tags.length > 0 && (
          <footer className="not-prose mt-12">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <a 
                  key={index}
                  className="post-tag"
                  href={`/tags/${tag}`}
                >
                  #{tag}
                </a>
              ))}
            </div>
          </footer>
        )}
      </article>
      
      {/* 文章导航 */}
      {(olderPost || newerPost) && (
        <nav className="post-nav not-prose">
          {olderPost && (
            <a className="post-nav-item" href={`/posts/${olderPost.id}`}>
              <div className="post-nav-label">← 上一篇</div>
              <div className="post-nav-title">{olderPost.title}</div>
            </a>
          )}
          {newerPost && (
            <a 
              className={`post-nav-item text-right ${!olderPost ? 'md:col-start-2' : ''}`}
              href={`/posts/${newerPost.id}`}
            >
              <div className="post-nav-label">下一篇 →</div>
              <div className="post-nav-title">{newerPost.title}</div>
            </a>
          )}
        </nav>
      )}
    </div>
  )
}