import fs from 'fs'
import path from 'path'

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content', 'posts')
  let fileNames = []
  
  try {
    fileNames = fs.readdirSync(postsDirectory)
  } catch (error) {
    console.log('Posts directory does not exist yet:', error.message)
    return []
  }

  return fileNames.map(fileName => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    }
  })
}