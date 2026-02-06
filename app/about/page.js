// app/about/page.js
import Link from 'next/link';

export default function About() {
  return (
    <div className="container mx-auto px-5 max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-5">关于这个博客</h1>
      
      <div>
        <p className="mb-3">欢迎来到我的技术博客！</p>
        
        <p className="mb-3">这里分享我在技术领域的学习心得、实践经验以及思考总结。</p>
        
        <h2 className="text-xl font-semibold mt-5 mb-3">主要涉及领域：</h2>
        <ul className="list-disc pl-5">
          <li>Web开发</li>
          <li>AI与机器学习</li>
          <li>DevOps与云原生</li>
          <li>开源项目实践</li>
        </ul>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← 返回首页</Link>
        </div>
      </div>
    </div>
  );
}