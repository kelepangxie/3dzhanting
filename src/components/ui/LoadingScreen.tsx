import { useEffect, useState } from 'react'
import useExhibitStore from '@/store/useExhibitStore'
import { SCHOOL, EXHIBITION } from '@/theme'

export default function LoadingScreen() {
  const { isLoading, loadedCount, totalCount } = useExhibitStore()
  const [show, setShow] = useState(true)
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShow(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[100] bg-rice flex flex-col items-center justify-center transition-opacity duration-700 ${
        !isLoading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-field-dark tracking-widest mb-2 font-serif">
          {EXHIBITION.title}
        </h1>
        <p className="text-wheat text-sm tracking-[0.35em] text-center font-serif">
          {EXHIBITION.subtitle}
        </p>
        <p className="text-field/50 text-xs tracking-wider mt-2 font-serif">
          {EXHIBITION.school}
        </p>
      </div>

      <div className="w-64 relative">
        <div className="h-px bg-field/10 w-full" />
        <div
          className="h-[3px] -mt-px rounded-full bg-gradient-to-r from-transparent via-wheat to-transparent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-field/40 text-xs tracking-wider">
        {isLoading ? `布展中 ${Math.round(progress)}%` : '展厅已就绪'}
      </p>
    </div>
  )
}
