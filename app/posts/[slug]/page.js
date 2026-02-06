import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
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
  const currentIndex = allPosts.findIndex(p => p.id === params.slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-[var(--w)]">
      <article className="prose-standard text-post-text leading-article" style={{ fontSize: '1.125rem' }}>
        <header className="mb-14">
          <h1 className="my-0! pb-2.5 text-heading-text text-2xl font-semibold">{post.title}</h1>
          
          <div className="text-xs antialiased opacity-60 mt-2">
            {post.date && (
              <time>
                {new Date(post.date).toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
            )}
            {post.author && post.date && <span className="mx-1">&middot;</span>}
            {post.author && <span>{post.author}</span>}
          </div>
        </header>
        
        {/* 文章内容 */}
        <section 
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        />
        
        {/* 文章标签 */}
        {post.tags && post.tags.length > 0 && (
          <footer className="mt-12 flex flex-wrap">
            {post.tags.map((tag, index) => (
              <a 
                key={index}
                className="post-tag text-heading-text no-underline"
                href={`/tags/${tag}`}
              >
                {tag}
              </a>
            ))}
          </footer>
        )}
      </article>
      
      {/* 文章导航 */}
      {(prevPost || nextPost) && (
        <nav className="mt-24! flex overflow-hidden rounded-xl bg-black/[3%] text-lg leading-[1.2]! *:flex *:w-1/2 *:items-center *:p-5 *:font-medium *:no-underline dark:bg-white/[8%] [&>*:hover]:bg-black/[2%] dark:[&>*:hover]:bg-white/[3%]">
          {prevPost && (
            <a className="ltr:pr-3 rtl:pl-3 text-heading-text" href={`/posts/${prevPost.id}`}>
              <span className="ltr:mr-1.5 rtl:ml-1.5">←</span>
              <span>{prevPost.title}</span>
            </a>
          )}
          {nextPost && (
            <a 
              className="justify-end pl-3 ltr:ml-auto rtl:mr-auto text-heading-text" 
              href={`/posts/${nextPost.id}`}
            >
              <span>{nextPost.title}</span>
              <span className="ltr:ml-1.5 rtl:mr-1.5">→</span>
            </a>
          )}
        </nav>
      )}
    </div>
  )
}