module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'post-text': '#364153', // Hugo Paper主题的文章文本颜色
        'heading-text': '#101828', // Hugo Paper主题的标题颜色
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Enhanced color palette for blog
        'blog-gray': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        'blog-blue': {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        'blog-purple': {
          500: '#7c3aed',
          600: '#6d28d9'
        }
      },
      maxWidth: {
        'prose-standard': '65ch', // Hugo Paper主题的文章最大宽度
        'blog-container': 'calc(680px + 32px * 2)', // Hugo Paper container width
      },
      lineHeight: {
        'article': '1.7', // 优化后的文章行高
        'article-relaxed': '1.8',
      },
      fontSize: {
        'article': ['1.125rem', '1.7'],
        'article-sm': ['1rem', '1.7'],
        'article-lg': ['1.25rem', '1.7'],
      },
      spacing: {
        'article': '1.5rem', // Standard article spacing
        'article-lg': '2rem',
        'article-xl': '3rem',
      },
      fontFamily: {
        'article': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      borderRadius: {
        'article': '8px',
      },
      boxShadow: {
        'article': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'article-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}