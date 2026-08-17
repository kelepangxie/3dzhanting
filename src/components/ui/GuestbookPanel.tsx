import { useEffect, useRef } from 'react'
import { X, MessageSquareHeart, Sprout } from 'lucide-react'
import useExhibitStore from '@/store/useExhibitStore'
import { GISCUS, GISCUS_READY } from '@/config/giscus'
import { SCHOOL } from '@/theme'

/**
 * 留言板侧滑面板：嵌入 giscus（GitHub Discussions）评论组件。
 * 未配置 giscus 时显示开通指引。
 */
export default function GuestbookPanel() {
  const { showGuestbook, setShowGuestbook } = useExhibitStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showGuestbook || !GISCUS_READY || !ref.current) return
    // giscus 已挂载过则不重复注入
    if (ref.current.querySelector('iframe')) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', GISCUS.repo)
    script.setAttribute('data-repo-id', GISCUS.repoId)
    script.setAttribute('data-category', GISCUS.category)
    script.setAttribute('data-category-id', GISCUS.categoryId)
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('data-loading', 'lazy')
    ref.current.appendChild(script)
  }, [showGuestbook])

  if (!showGuestbook) return null

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-field-dark/30 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowGuestbook(false)} />

      <div className="relative z-10 w-full max-w-lg h-full animate-slide-in flex flex-col bg-rice-light border-l border-wheat/40 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-field/15">
          <div className="flex items-center gap-2.5">
            <MessageSquareHeart className="w-5 h-5 text-wheat" />
            <div>
              <h2 className="font-serif text-field-dark text-lg leading-tight">留言板</h2>
              <p className="text-field/60 text-xs mt-0.5">留下你的观展感受，与耕耘者对话</p>
            </div>
          </div>
          <button
            onClick={() => setShowGuestbook(false)}
            className="w-9 h-9 rounded-full border border-field/25 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-field/50 hover:bg-field/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {GISCUS_READY ? (
            <div ref={ref} className="min-h-[300px]" />
          ) : (
            <div className="space-y-4">
              <div className="bg-rice border border-field/15 rounded-xl p-5 text-sm text-field-dark/80 leading-relaxed">
                <p className="font-serif text-field-dark text-base mb-2 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-wheat" />
                  留言功能即将开放
                </p>
                <p>
                  留言板基于 GitHub Discussions（giscus）。站长完成以下配置后即可开放评论，届时访客可用 GitHub
                  账号留言，无需注册新账号：
                </p>
                <ol className="list-decimal list-inside mt-3 space-y-1.5 text-field/75 text-[13px]">
                  <li>GitHub 仓库 Settings → 勾选 Discussions</li>
                  <li>安装 giscus App 并授权本仓库</li>
                  <li>在 giscus.app 获取 ID，填入项目 <code className="bg-wheat/15 text-wheat px-1 rounded">src/config/giscus.ts</code></li>
                </ol>
              </div>
              <div className="bg-wheat/10 border border-wheat/30 rounded-xl p-4 text-[13px] text-field-dark/70">
                校训 · {SCHOOL.mottoFull} —— 感谢你的到访，愿你像禾苗一样，天天向上。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
