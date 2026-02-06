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
    date: data.date ? new Date(data.date).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : '',
    contentHtml,
    tags: data.tags || []
  }
}

export default async function Post({ params }) {
  const post = await getPost(params.slug)
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article className="prose-standard text-post-text leading-article" style={{ fontSize: '1.125rem' }}>
        <header className="mb-14">
          <h1 className="my-0! pb-2.5 text-heading-text text-3xl md:text-4xl font-semibold">{post.title}</h1>
          
          {post.date && (
            <div className="text-xs antialiased opacity-60 mt-2">
              <time>{post.date}</time>
            </div>
          )}
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
              <div 
                key={index}
                className="mb-1.5 rounded-lg bg-black/[3%] px-5 py-1 no-underline hover:bg-black/[6%] ltr:mr-1.5 rtl:ml-1.5 dark:bg-white/[8%] dark:hover:bg-white/[12%]"
              >
                {tag}
              </div>
            ))}
          </footer>
        )}
      </article>
    </div>
  )
}