export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article className="prose-standard text-post-text leading-article" style={{ fontSize: '1.125rem' }}>
        <header className="article-header">
          <h1 className="article-title text-heading-text">关于</h1>
        </header>
        
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <p>欢迎来到我的个人博客。</p>
          
          <p>在这里，我会分享各种技术心得、生活感悟以及一些有趣的想法。</p>
          
          <h2>联系我</h2>
          <p>如果您有任何问题或建议，欢迎通过邮件或社交媒体与我联系。</p>
        </section>
      </article>
    </div>
  )
}