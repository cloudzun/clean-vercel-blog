import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-heading-text">My Blog</h1>
      
      <p className="mb-6 text-post-text">Welcome to my personal blog. Here I share my thoughts and experiences.</p>
      
      <div className="mb-6">
        <Link href="/blog" className="text-heading-text hover:underline no-underline font-medium">
          View Blog Posts
        </Link>
      </div>
      
      <div className="prose prose-standard text-post-text max-w-none">
        <h2 className="text-heading-text">About this blog</h2>
        <p>This blog is designed to be simple and efficient, with fast loading times and a clean interface.</p>
      </div>
    </div>
  )
}