import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// 获取content/posts目录下的所有.md文件并解析Front Matter
async function getPosts() {
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
      // 从文件名提取ID（去掉.md扩展名）
      const id = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents) // 解析Front Matter获取元数据
      
      return {
        id,
        title: data.title || id, // 如果没有标题，则使用文件名
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

export default async function BlogPage() {
  const posts = await getPosts()
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-heading-text">Blog Posts</h1>
      
      {posts.length === 0 ? (
        <p className="text-post-text">No blog posts available yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-gray-200 pb-8 mb-8">
              <h2 className="text-xl font-semibold mb-2">
                <a 
                  href={`/posts/${post.id}`} 
                  className="text-heading-text hover:underline no-underline"
                >
                  {post.title}
                </a>
              </h2>
              
              {post.date && (
                <div className="text-xs antialiased opacity-60 mb-3">
                  <time>
                    {new Date(post.date).toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}