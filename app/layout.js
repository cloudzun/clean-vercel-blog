import './globals.css'
import { Inter } from 'next/font/google'
import ThemeToggle from './lib/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '我的博客',
  description: '欢迎来到我的个人博客',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className="not-ready lg:text-base" style={{'--bg': '#faf8f1'}}>
      <head>
        <meta name="theme-color" content="#faf8f1" />
      </head>
      <body className={`${inter.className} bg-[--bg] text-black antialiased duration-200 ease-out [-webkit-tap-highlight-color:transparent] dark:text-white`}>
        <ThemeToggle />
        <Header />
        <main className="prose prose-neutral dark:prose-invert relative mx-auto min-h-[calc(100vh-9rem)] max-w-[var(--w)] px-8 pt-14 pb-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

function Header() {
  return (
    <header className="mx-auto flex h-[4.5rem] max-w-[var(--w)] px-8 whitespace-nowrap lg:justify-center">
      <div className="relative z-50 flex items-center ltr:mr-auto rtl:ml-auto">
        <a
          className="-translate-y-[1px] text-2xl font-medium text-heading-text"
          href="/"
        >
          我的博客
        </a>
        <div
          className="btn-dark text-[0px] ltr:ml-4 rtl:mr-4 h-6 w-6 shrink-0 cursor-pointer [background:url('/theme.svg')_left_center/cover_no-repeat] dark:invert"
          role="button"
          aria-label="Dark"
        ></div>
      </div>

      <div
        className="btn-menu relative z-50 flex h-[4.5rem] w-[5rem] shrink-0 cursor-pointer flex-col items-center justify-center gap-2.5 lg:hidden ltr:-mr-8 rtl:-ml-8"
        role="button"
        aria-label="Menu"
      ></div>

      <div
        className="nav-wrapper fixed inset-x-0 top-full z-40 flex h-full flex-col justify-center bg-[--bg] pb-16 duration-200 select-none lg:static lg:h-auto lg:flex-row lg:bg-transparent! lg:pb-0 lg:transition-none"
      >
        <nav
          className="lg:ml-12 lg:flex lg:flex-row lg:items-center lg:space-x-10 rtl:space-x-reverse"
        >
          <a
            className="block text-center text-xl leading-[5rem] lg:text-base lg:font-normal text-heading-text hover:underline no-underline"
            href="/"
          >
            首页
          </a>
          <a
            className="block text-center text-xl leading-[5rem] lg:text-base lg:font-normal text-heading-text hover:underline no-underline"
            href="/blog"
          >
            文章
          </a>
          <a
            className="block text-center text-xl leading-[5rem] lg:text-base lg:font-normal text-heading-text hover:underline no-underline"
            href="/about"
          >
            关于
          </a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="py-1 text-center text-xs opacity-60 ltr:ml-auto rtl:mr-auto">
      <p>© {new Date().getFullYear()} 我的博客</p>
    </footer>
  )
}