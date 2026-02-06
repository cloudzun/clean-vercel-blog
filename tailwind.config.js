module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'post-text': '#364153', // Hugo Paper主题的文章文本颜色
        'heading-text': '#101828', // Hugo Paper主题的标题颜色
      },
      maxWidth: {
        ' prose-standard': '65ch', // Hugo Paper主题的文章最大宽度
      },
      lineHeight: {
        'article': '1.8', // Hugo Paper主题的文章行高
      }
    },
  },
  plugins: [],
}