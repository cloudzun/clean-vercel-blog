import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import html from 'remark-html'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

async function getPost(id) {
  const fullPath = path.join(process.cwd(), 'content', 'posts', `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  
  // 简单地按行分割来提取标题（第一行）
  const lines = fileContents.split('\n')
  let title = 'Untitled'
  let content = fileContents
  
  if (lines[0].startsWith('# ')) {
    title = lines[0].substring(2)  // 去掉 '# ' 前缀
    content = lines.slice(1).join('\n').trim()
  }
  
  // 使用remark处理Markdown内容
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content)
  
  const contentHtml = processedContent.toString()
  
  return {
    id,
    title,
    contentHtml
  }
}

export default async function Post({ params }) {
  const post = await getPost(params.slug)
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        </header>
        
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        />
      </article>
    </div>
  )
}