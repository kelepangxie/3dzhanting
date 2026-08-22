import { useMemo, useState } from 'react'
import { Heart, Star, Send } from 'lucide-react'
import useExhibitStore from '@/store/useExhibitStore'
import { BASE_LIKES, SEEDED_REVIEWS, type ReviewItem } from '@/data/social'

/** 头像底色：按名字哈希挑一个田园色 */
const AVATAR_COLORS = ['#7FAE7A', '#C9A227', '#8A6A4F', '#4C7A4E', '#A98963', '#5E8C5A']

function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= value ? 'text-wheat' : 'text-field/20'}
          fill={i <= value ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}

function ReviewCard({ review, mine = false }: { review: ReviewItem; mine?: boolean }) {
  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-rice-light text-sm font-serif shrink-0 select-none"
        style={{ backgroundColor: avatarColor(review.name) }}
      >
        {review.name.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-serif text-field-dark">{review.name}</span>
          {mine && (
            <span className="text-[10px] px-1.5 py-px rounded-full border border-wheat/50 text-wheat bg-wheat/10">我</span>
          )}
          <Stars value={review.rating} />
          <span className="text-[11px] text-field/40">{review.time}</span>
        </div>
        <p className="text-[13px] leading-relaxed text-field-dark/75 mt-1 break-words">{review.text}</p>
        <div className="flex items-center gap-1 mt-1.5 text-field/40">
          <Heart className="w-3 h-3" fill="currentColor" />
          <span className="text-[11px]">{review.likes}</span>
        </div>
      </div>
    </div>
  )
}

/** 展品详情的点赞 + 游客点评区 */
export default function ReviewsSection({ exhibitId }: { exhibitId: string }) {
  const { likedExhibitIds, toggleLike, userReviews, addReview } = useExhibitStore()
  const [nickname, setNickname] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverStar, setHoverStar] = useState(0)

  const liked = likedExhibitIds.includes(exhibitId)
  const likeCount = (BASE_LIKES[exhibitId] ?? 0) + (liked ? 1 : 0)

  const merged = useMemo(() => {
    const mine = (userReviews[exhibitId] ?? []).map((r) => ({ ...r, likes: 0 } as ReviewItem))
    const seeded = SEEDED_REVIEWS[exhibitId] ?? []
    return { mine, seeded, all: [...mine, ...seeded] }
  }, [userReviews, exhibitId])

  const avgRating = useMemo(() => {
    if (!merged.all.length) return null
    const sum = merged.all.reduce((acc, r) => acc + r.rating, 0)
    return Math.round((sum / merged.all.length) * 10) / 10
  }, [merged.all])

  const canSubmit = text.trim().length > 0

  const submit = () => {
    if (!canSubmit) return
    addReview(exhibitId, nickname, rating, text)
    setText('')
    setRating(5)
  }

  return (
    <div className="space-y-4">
      {/* 点赞 + 评分概览 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleLike(exhibitId)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all active:scale-95 ${
            liked
              ? 'border-wheat bg-wheat/15 text-wheat'
              : 'border-field/20 bg-rice text-field/70 hover:border-wheat/60 hover:text-wheat'
          }`}
          title={liked ? '取消点赞' : '点赞这件作品'}
        >
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
          <span className="text-sm font-serif">{likeCount}</span>
        </button>

        {avgRating !== null && (
          <div className="flex items-center gap-1.5 text-field/60">
            <Stars value={Math.round(avgRating)} />
            <span className="text-xs font-serif">
              {avgRating} · {merged.all.length} 条点评
            </span>
          </div>
        )}
      </div>

      {/* 发表点评 */}
      <div className="bg-rice rounded-xl p-4 border border-field/10 space-y-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="昵称（可留空）"
            className="bg-rice-light border border-field/15 rounded-full px-3 py-1.5 text-xs text-field-dark placeholder-field/30 focus:border-wheat focus:outline-none transition-colors w-36 font-serif"
          />
          <div className="flex items-center gap-1" onMouseLeave={() => setHoverStar(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverStar(i)}
                className="p-0.5 transition-transform hover:scale-110"
                title={`${i} 星`}
              >
                <Star
                  style={{
                    width: 16,
                    height: 16,
                    color: (hoverStar || rating) >= i ? '#C9A227' : 'rgba(76, 122, 78, 0.25)',
                  }}
                  className="cursor-pointer"
                  fill={(hoverStar || rating) >= i ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
          }}
          rows={2}
          maxLength={200}
          placeholder="写下你的观展感受…（Ctrl+Enter 发送）"
          className="w-full bg-rice-light border border-field/15 rounded-lg px-3 py-2 text-[13px] text-field-dark placeholder-field/30 focus:border-wheat focus:outline-none transition-colors resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-field/35">{text.length}/200</span>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif transition-all ${
              canSubmit
                ? 'bg-field text-rice-light hover:bg-field-dark active:scale-95'
                : 'bg-field/10 text-field/30 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            发表点评
          </button>
        </div>
      </div>

      {/* 点评列表 */}
      <div className="space-y-4">
        {merged.mine.map((r) => (
          <ReviewCard key={r.id} review={r} mine />
        ))}
        {merged.seeded.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </div>
  )
}
