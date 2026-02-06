import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import html from 'remark-html'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

// 获取content/posts目录下的所有.md文件
async function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'content', 'posts')
  let fileNames = []
  
  try {
    fileNames = fs.readdirSync(postsDirectory)
  } catch (error) {
    console.log('Posts directory does not exist yet:', error.message)
    return []
  }

  const allPostsData = fileNames.filter(fileName => fileName.endsWith('.md')).map(fileName => {
    // 这里我们简单地从文件名提取ID（去掉.md扩展名）
    const id = fileName.replace(/\.md$/, '')
    
    return {
      id,
      fileName
    }
  })
  
  return allPostsData
}

export default async function BlogPage() {
  const posts = await getPosts()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      
      {posts.length === 0 ? (
        <p>No blog posts available yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
                {post.id}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}