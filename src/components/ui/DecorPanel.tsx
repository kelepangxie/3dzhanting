import useExhibitStore from '@/store/useExhibitStore'
import { X, Settings, Eye, EyeOff } from 'lucide-react'

const TOGGLE_ITEMS = [
  { key: 'showPedestals' as const, label: '四季展台', desc: '春耕·夏耘·秋收·冬藏' },
  { key: 'showBenches' as const, label: '原木长椅', desc: '休息座椅' },
  { key: 'showPriceTags' as const, label: '价签', desc: '展品价格标签' },
  { key: 'showRopeBarriers' as const, label: '麻绳护栏', desc: '隔离护栏' },
  { key: 'showPlants' as const, label: '绿植竹丛', desc: '田园盆栽' },
  { key: 'showInfoStands' as const, label: '导览牌', desc: '木质指示牌' },
]

const WALL_COLORS = [
  { color: '#F6F2E7', label: '宣纸白' },
  { color: '#EFE7D4', label: '暖米' },
  { color: '#E4ECD9', label: '淡竹绿' },
  { color: '#E9DCC2', label: '浅麦' },
  { color: '#D9C7A9', label: '暖木' },
  { color: '#DDE1D9', label: '青灰' },
  { color: '#4C7A4E', label: '稻田绿' },
  { color: '#2F5233', label: '墨绿' },
]

const FLOOR_STYLES = [
  { value: 'wood' as const, label: '原木竹板' },
  { value: 'stone' as const, label: '青石板' },
  { value: 'rammed' as const, label: '夯土' },
]

export default function DecorPanel() {
  const { showDecorPanel, setShowDecorPanel, decorations, updateDecoration } = useExhibitStore()

  if (!showDecorPanel) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-start pointer-events-none">
      <div data-ui className="pointer-events-auto w-full max-w-sm h-full animate-slide-in-left">
        <div className="h-full bg-rice-light backdrop-blur-xl border-r border-wheat/40 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-field/15">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-wheat" />
              <span className="text-field-dark text-sm font-medium tracking-wider font-serif">展厅装饰</span>
            </div>
            <button
              onClick={() => setShowDecorPanel(false)}
              className="w-8 h-8 rounded-full border border-field/25 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-field/50 hover:bg-wheat/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <section>
              <h3 className="text-field/70 text-xs tracking-widest mb-3 font-serif">装饰物开关</h3>
              <div className="space-y-2">
                {TOGGLE_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => updateDecoration(item.key, !decorations[item.key])}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                      decorations[item.key]
                        ? 'border-wheat/60 bg-wheat/10'
                        : 'border-field/10 bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {decorations[item.key] ? (
                        <Eye className="w-4 h-4 text-wheat" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-field/30" />
                      )}
                      <div className="text-left">
                        <div className={`text-sm font-serif ${decorations[item.key] ? 'text-field-dark' : 'text-field/40'}`}>
                          {item.label}
                        </div>
                        <div className="text-xs text-field/35">{item.desc}</div>
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-all duration-200 relative ${
                      decorations[item.key] ? 'bg-wheat/50' : 'bg-field/10'
                    }`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
                        decorations[item.key]
                          ? 'left-4 bg-wheat'
                          : 'left-0.5 bg-field/30'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-field/70 text-xs tracking-widest mb-3 font-serif">墙面颜色</h3>
              <div className="grid grid-cols-4 gap-2">
                {WALL_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => updateDecoration('wallColor', item.color)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-200 ${
                      decorations.wallColor === item.color
                        ? 'border-wheat bg-wheat/15'
                        : 'border-field/10 hover:border-field/30'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-md border border-field/15"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] text-field/60">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-field/70 text-xs tracking-widest mb-3 font-serif">地板风格</h3>
              <div className="grid grid-cols-3 gap-2">
                {FLOOR_STYLES.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => updateDecoration('floorStyle', item.value)}
                    className={`px-2 py-2.5 rounded-lg border text-sm transition-all duration-200 font-serif ${
                      decorations.floorStyle === item.value
                        ? 'border-wheat bg-wheat/15 text-field-dark'
                        : 'border-field/10 text-field/50 hover:border-field/30'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-field/70 text-xs tracking-widest mb-3 font-serif">入口牌匾文字（每行一条）</h3>
              <textarea
                value={decorations.entranceText}
                onChange={(e) => updateDecoration('entranceText', e.target.value)}
                rows={2}
                className="w-full bg-rice border border-field/20 rounded-lg px-3 py-2 text-sm text-field-dark placeholder-field/25 focus:border-wheat focus:outline-none transition-colors resize-none font-serif"
                placeholder="输入入口牌匾文字"
              />
            </section>

            <section className="bg-rice rounded-lg p-4 border border-field/10">
              <h3 className="text-wheat text-xs tracking-widest mb-2 font-serif">自定义替换说明</h3>
              <div className="space-y-1.5 text-xs text-field/55 leading-relaxed">
                <p>1. 真实作品图片/视频：放到 <code className="text-wheat bg-wheat/10 px-1 rounded">public/placeholders/</code>，与 <code className="text-wheat bg-wheat/10 px-1 rounded">exhibits.ts</code> 中 mediaUrl 同名即自动显示</p>
                <p>2. 展品信息（标题/作者/描述/门类）：编辑 <code className="text-wheat bg-wheat/10 px-1 rounded">src/data/exhibits.ts</code></p>
                <p>3. 墙面颜色/地板风格：在此面板实时切换</p>
                <p>4. 价签：在展品数据中设置 <code className="text-wheat bg-wheat/10 px-1 rounded">price</code> 字段并打开价签开关</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
