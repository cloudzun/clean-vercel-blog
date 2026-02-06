import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-[var(--w)]">
      <div className="-mt-2 mb-12 flex items-center">
        <div>
          <div className="mt-3 mb-1 text-2xl font-medium text-black dark:text-white">
            Abraham Cheng
          </div>
          <div className="break-words">
            A personal blog
          </div>
        </div>
      </div>
      
      <div className="prose prose-standard text-post-text max-w-none">
        <h2 className="text-heading-text">About this blog</h2>
        <p>This blog is designed to be simple and efficient, with fast loading times and a clean interface.</p>
      </div>
      
      <div className="mt-14 flex">
        <Link href="/blog" className="pagination-btn">
          View Blog Posts
        </Link>
      </div>
    </div>
  )
}