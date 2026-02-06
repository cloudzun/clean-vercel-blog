import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to My New Blog</h1>
      
      <p className="mb-6">This is a simple blog built with Next.js and deployed on Vercel.</p>
      
      <div className="mb-6">
        <Link href="/blog" className="text-blue-600 hover:underline">
          View Blog Posts
        </Link>
      </div>
      
      <div className="prose max-w-none">
        <h2>About this blog</h2>
        <p>This blog is designed to be simple and efficient, with fast loading times and a clean interface.</p>
      </div>
    </div>
  )
}