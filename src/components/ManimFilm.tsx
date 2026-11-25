import { useEffect, useRef, useState } from 'react'
import { RichText } from './RichText'

export type ManimFilmSpec = {
  title: string
  src: string
  caption: string
  scriptPath?: string
  aspect?: string
}

function useIsDarkTheme(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' ? !document.documentElement.classList.contains('light-mode') : true,
  )
  useEffect(() => {
    const update = () => setDark(!document.documentElement.classList.contains('light-mode'))
    update()
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])
  return dark
}

function themedSrc(src: string, dark: boolean): string {
  if (!dark) return src
  if (src.endsWith('-dark.mp4')) return src
  if (src.endsWith('.mp4')) return src.replace(/\.mp4$/, '-dark.mp4')
  return src
}

export function ManimFilm({ film }: { film: ManimFilmSpec }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const dark = useIsDarkTheme()
  const activeSrc = themedSrc(film.src, dark)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        } else {
          v.pause()
          setPlaying(false)
        }
      },
      { threshold: 0.2 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [activeSrc])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const replay = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    void v.play()
    setPlaying(true)
  }

  const cycleRate = () => {
    const next = rate === 1 ? 0.5 : rate === 0.5 ? 1.5 : 1
    setRate(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }

  const seekByClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = frac * duration
    setProgress(frac * 100)
  }

  return (
    <figure className="post-film">
      <div className="post-film__stage">
        <div className="post-film__frame" style={{ aspectRatio: film.aspect ?? '16 / 9' }}>
          <video
            key={activeSrc}
            ref={videoRef}
            src={activeSrc}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration || 0)
              e.currentTarget.playbackRate = rate
            }}
            onTimeUpdate={(e) => {
              const d = e.currentTarget.duration || 1
              setProgress((e.currentTarget.currentTime / d) * 100)
            }}
            onClick={togglePlay}
          />
        </div>

        <div className="post-film__overlay" role="toolbar" aria-label={`${film.title} playback controls`}>
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause film' : 'Play film'} title={playing ? 'Pause' : 'Play'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <button type="button" onClick={replay} aria-label="Replay film" title="Replay">
            ↻
          </button>
          <button type="button" onClick={cycleRate} aria-label="Change playback speed" title="Playback speed">
            {rate}×
          </button>
        </div>

        <div
          className="post-film__scrubber"
          role="slider"
          aria-label="Film progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          tabIndex={0}
          onClick={seekByClick}
        >
          <div className="post-film__scrubber-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <figcaption className="post-film__caption">
        <span>
          <RichText text={film.caption} />
        </span>
        {film.scriptPath ? <span className="post-film__src">{film.scriptPath}</span> : null}
      </figcaption>
    </figure>
  )
}
