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
      { threshold: 0.25 },
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

  const cycleRate = () => {
    const next = rate === 1 ? 0.5 : rate === 0.5 ? 1.5 : 1
    setRate(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }

  const onSeek = (val: number) => {
    const v = videoRef.current
    if (!v || !duration) return
    v.currentTime = (val / 100) * duration
    setProgress(val)
  }

  return (
    <figure className="post-film">
      <div className="post-film__frame" style={{ aspectRatio: film.aspect ?? '16 / 9' }}>
        <video
          key={activeSrc}
          ref={videoRef}
          src={activeSrc}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
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
      <div className="post-anim-bar">
        <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause animation' : 'Play animation'}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={progress}
          aria-label="Seek animation timeline"
          onChange={(e) => onSeek(Number(e.target.value))}
        />
        <button type="button" onClick={cycleRate} aria-label="Change playback speed">
          {rate}×
        </button>
        {film.scriptPath ? <span className="post-anim-src">{film.scriptPath}</span> : null}
      </div>
      <figcaption>
        <RichText text={film.caption} />
      </figcaption>
    </figure>
  )
}
