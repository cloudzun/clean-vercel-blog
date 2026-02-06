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
    <div className="container mx-auto px-4 py-8 max-w-[var(--w)]">
      {posts.length === 0 ? (
        <p className="text-post-text">No blog posts available yet.</p>
      ) : (
        <div>
          {posts.map((post) => (
            <section key={post.id} className="blog-post-item relative my-10 first-of-type:mt-0 last-of-type:mb-0">
              <h2 className="blog-post-title my-0! text-xl font-semibold text-heading-text">
                <a 
                  href={`/posts/${post.id}`} 
                  className="hover:underline no-underline text-heading-text"
                >
                  {post.title}
                </a>
              </h2>
              <time className="blog-post-date text-xs antialiased opacity-60">
                {new Date(post.date).toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
              <a className="absolute inset-0 text-[0px] no-underline" href={`/posts/${post.id}`}>
                {post.title}
              </a>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}