import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mdLinkAttributes from 'markdown-it-link-attributes'
import { full as emoji } from 'markdown-it-emoji'
// import 'highlight.js/styles/github.css'
// 使用 atom-one-dark 主题
import 'highlight.js/styles/atom-one-dark.css'
import copyIcon from '@/assets/photo/复制.png'
import darkIcon from '@/assets/photo/暗黑模式.png'
import lightIcon from '@/assets/photo/明亮模式.png'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true, // 启用 HTML 标签
  breaks: true, // 转换换行符为 <br>
  linkify: true, // 自动转换 URL 为链接
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        return `<div class="code-block"><div class="code-header"><span class="code-lang">${lang}</span><div class="code-actions"><button class="code-action-btn" data-action="copy" data-tooltip="复制"><img src="${copyIcon}" alt="copy" /></button><button class="code-action-btn" data-action="theme" data-tooltip="切换主题"><img src="${darkIcon}" alt="theme" data-light-icon="${lightIcon}" data-dark-icon="${darkIcon}" /></button></div></div><pre class="hljs"><code>${highlighted}</code></pre></div>`
        // eslint-disable-next-line no-unused-vars, no-empty
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

// 配置链接在新标签页打开
md.use(mdLinkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noopener',
  },
})

// 启用 emoji 支持
md.use(emoji)

// 导出渲染函数
export const renderMarkdown = (content) => {
  if (!content) return ''
  return md.render(content)
}

// 导出 markdown-it 实例，以便需要时进行更多配置
export { md }
