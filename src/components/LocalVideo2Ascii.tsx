import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

const CHAR_WIDTH_RATIO = 0.6
const OUTPUT_DPR_LIMIT = 2
const COMPACT_OUTPUT_DPR_LIMIT = 1
const SAMPLE_SCALE = 2
const CONTRAST_BOOST = 1.08
const COMPACT_TARGET_FPS = 10
const COMPACT_MAX_COLUMNS = 42
const COMPACT_MIN_CHARACTER_WIDTH = 9

type VideoFrameCallback = (now: number, metadata: unknown) => void

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: VideoFrameCallback) => number
  cancelVideoFrameCallback?: (handle: number) => void
}

export const ASCII_CHARSETS = {
  standard: { name: 'Standard', chars: ' .:-=+*#%@' },
  blocks: { name: 'Blocks', chars: ' ░▒▓█' },
  minimal: { name: 'Minimal', chars: ' .oO@' },
  binary: { name: 'Binary', chars: ' █' },
  detailed: {
    name: 'Detailed',
    chars: ` .'` + String.raw`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$`,
  },
  dots: { name: 'Dots', chars: ' ·•●' },
  arrows: { name: 'Arrows', chars: ' ←↙↓↘→↗↑↖' },
  emoji: { name: 'Emoji', chars: '  ░▒▓🌑🌒🌓🌔🌕' },
} as const

export type CharsetKey = keyof typeof ASCII_CHARSETS

export type VideoToAsciiProps = {
  src: string
  numColumns?: number
  colored?: boolean
  blend?: number
  highlight?: number
  brightness?: number
  charset?: CharsetKey
  enableMouse?: boolean
  trailLength?: number
  enableRipple?: boolean
  rippleSpeed?: number
  audioEffect?: number
  audioRange?: number
  isPlaying?: boolean
  autoPlay?: boolean
  enableSpacebarToggle?: boolean
  showStats?: boolean
  className?: string
  priority?: boolean
  playOnlyWhenVisible?: boolean
  loopStart?: number
  loopEnd?: number
  playSegments?: Array<{
    start: number
    end: number
  }>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCoverSourceRect(
  containerWidth: number,
  containerHeight: number,
  sourceWidth: number,
  sourceHeight: number,
) {
  const containerAspect = containerWidth / containerHeight
  const sourceAspect = sourceWidth / sourceHeight

  if (sourceAspect > containerAspect) {
    const cropWidth = sourceHeight * containerAspect

    return {
      sx: (sourceWidth - cropWidth) / 2,
      sy: 0,
      sw: cropWidth,
      sh: sourceHeight,
    }
  }

  const cropHeight = sourceWidth / containerAspect

  return {
    sx: 0,
    sy: (sourceHeight - cropHeight) / 2,
    sw: sourceWidth,
    sh: cropHeight,
  }
}

function normalizeSegments(
  playSegments: VideoToAsciiProps['playSegments'],
  loopStart: number,
  loopEnd?: number,
) {
  if (playSegments && playSegments.length > 0) {
    return playSegments
      .filter((segment) => segment.end > segment.start)
      .sort((left, right) => left.start - right.start)
  }

  if (loopEnd !== undefined && loopEnd > loopStart) {
    return [{ start: loopStart, end: loopEnd }]
  }

  return []
}

export default function LocalVideo2Ascii({
  src,
  numColumns,
  colored = true,
  blend = 0,
  highlight = 0,
  brightness = 1,
  charset = 'standard',
  isPlaying = true,
  autoPlay = true,
  enableSpacebarToggle = false,
  showStats = false,
  className = '',
  priority = false,
  playOnlyWhenVisible = true,
  loopStart = 0,
  loopEnd,
  playSegments,
}: VideoToAsciiProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const videoFrameCallbackRef = useRef<number | null>(null)
  const lastVideoTimeRef = useRef(-1)
  const lastDrawTimestampRef = useRef(0)
  const hasRenderedFrameRef = useRef(false)
  const fpsWindowRef = useRef({ lastTimestamp: 0, frames: 0 })
  const [isReady, setIsReady] = useState(false)
  const [fps, setFps] = useState(0)
  const [localPlaying, setLocalPlaying] = useState(isPlaying)
  const [isVisible, setIsVisible] = useState(priority)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(priority)
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false)

  const chars = useMemo(() => [...ASCII_CHARSETS[charset].chars], [charset])
  const shouldPlay = localPlaying && (!playOnlyWhenVisible || isVisible)
  const segments = useMemo(
    () => normalizeSegments(playSegments, loopStart, loopEnd),
    [loopEnd, loopStart, playSegments],
  )
  const usesLoopWindow = segments.length > 0

  useEffect(() => {
    setLocalPlaying(isPlaying)
  }, [isPlaying])

  useEffect(() => {
    setIsReady(false)
    setFps(0)
    setIsVisible(priority)
    setShouldLoadVideo(priority)
    setHasRenderedFrame(false)
    lastVideoTimeRef.current = -1
    lastDrawTimestampRef.current = 0
    hasRenderedFrameRef.current = false
    fpsWindowRef.current = { lastTimestamp: 0, frames: 0 }

    const video = videoRef.current
    if (!video) return
    video.pause()
    if (priority) {
      video.load()
    }
  }, [priority, src])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    if (!playOnlyWhenVisible) {
      setShouldLoadVideo(true)
      setIsVisible(true)
      return
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true)
        }
      },
      {
        rootMargin: '30% 0px',
        threshold: 0.01,
      },
    )

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= 0.18)
      },
      {
        threshold: [0, 0.18, 0.35, 0.6],
      },
    )

    loadObserver.observe(container)
    visibilityObserver.observe(container)

    return () => {
      loadObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [playOnlyWhenVisible, priority])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoadVideo) {
      return
    }

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', 'true')
    video.load()
  }, [shouldLoadVideo, src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !usesLoopWindow) {
      return
    }

    const firstSegment = segments[0]
    if (!firstSegment) {
      return
    }

    const syncToAllowedSegment = () => {
      const currentTime = video.currentTime

      for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index]
        if (!segment) {
          continue
        }

        if (currentTime < segment.start) {
          video.currentTime = segment.start
          return
        }

        if (currentTime >= segment.start && currentTime < segment.end) {
          return
        }

        const nextSegment = segments[index + 1]
        if (currentTime >= segment.end && currentTime < (nextSegment?.start ?? Infinity)) {
          video.currentTime = nextSegment?.start ?? firstSegment.start
          return
        }
      }

      video.currentTime = firstSegment.start
    }

    const handleLoadedMetadata = () => {
      syncToAllowedSegment()
    }

    const handleTimeUpdate = () => {
      syncToAllowedSegment()
      if (shouldPlay) {
        void video.play().catch(() => undefined)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [segments, shouldPlay, usesLoopWindow])

  const drawFrame = useCallback((timestamp = performance.now()) => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!container || !canvas || !video || !isReady) {
      return false
    }

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return false
    }

    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    const isCompactViewport = width <= 768
    const compactFrameInterval = 1000 / COMPACT_TARGET_FPS

    if (
      isCompactViewport &&
      hasRenderedFrameRef.current &&
      timestamp - lastDrawTimestampRef.current < compactFrameInterval
    ) {
      return false
    }

    if (video.currentTime === lastVideoTimeRef.current && hasRenderedFrameRef.current) {
      return false
    }

    lastVideoTimeRef.current = video.currentTime
    lastDrawTimestampRef.current = timestamp

    const sourceRect = getCoverSourceRect(width, height, video.videoWidth, video.videoHeight)
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      isCompactViewport ? COMPACT_OUTPUT_DPR_LIMIT : OUTPUT_DPR_LIMIT,
    )

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = true

    if (blend > 0) {
      ctx.save()
      ctx.globalAlpha = clamp(blend / 100, 0, 1)
      ctx.drawImage(
        video,
        sourceRect.sx,
        sourceRect.sy,
        sourceRect.sw,
        sourceRect.sh,
        0,
        0,
        width,
        height,
      )
      ctx.restore()
    } else {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)
    }

    const minCharacterWidth = isCompactViewport ? COMPACT_MIN_CHARACTER_WIDTH : 4.8
    const maxColumnsForViewport = Math.max(24, Math.floor(width / minCharacterWidth))
    const cols = clamp(
      numColumns ?? maxColumnsForViewport,
      24,
      isCompactViewport ? Math.min(maxColumnsForViewport, COMPACT_MAX_COLUMNS) : maxColumnsForViewport,
    )
    const estimatedFontSize = width / (cols * CHAR_WIDTH_RATIO)
    const rows = Math.max(1, Math.ceil(height / estimatedFontSize))
    const charWidth = width / cols
    const cellHeight = height / rows
    const fontSize = cellHeight

    if (!sampleCanvasRef.current) {
      sampleCanvasRef.current = document.createElement('canvas')
    }
    const sampleCanvas = sampleCanvasRef.current
    const sampleScale = isCompactViewport ? 1 : SAMPLE_SCALE
    const sampleCols = cols * sampleScale
    const sampleRows = rows * sampleScale
    sampleCanvas.width = sampleCols
    sampleCanvas.height = sampleRows

    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
    if (!sampleCtx) {
      return false
    }

    sampleCtx.clearRect(0, 0, sampleCols, sampleRows)
    sampleCtx.imageSmoothingEnabled = true
    sampleCtx.drawImage(
      video,
      sourceRect.sx,
      sourceRect.sy,
      sourceRect.sw,
      sourceRect.sh,
      0,
      0,
      sampleCols,
      sampleRows,
    )
    const imageData = sampleCtx.getImageData(0, 0, sampleCols, sampleRows).data

    ctx.font = `${fontSize * 0.94}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    const highlightStrength = clamp(highlight / 100, 0, 1)

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        let rTotal = 0
        let gTotal = 0
        let bTotal = 0

        for (let sy = 0; sy < sampleScale; sy += 1) {
          for (let sx = 0; sx < sampleScale; sx += 1) {
            const sampleX = x * sampleScale + sx
            const sampleY = y * sampleScale + sy
            const index = (sampleY * sampleCols + sampleX) * 4
            rTotal += imageData[index] ?? 0
            gTotal += imageData[index + 1] ?? 0
            bTotal += imageData[index + 2] ?? 0
          }
        }

        const sampleCount = sampleScale * sampleScale
        const r = Math.round(rTotal / sampleCount)
        const g = Math.round(gTotal / sampleCount)
        const b = Math.round(bTotal / sampleCount)

        const rawLuminance = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * brightness
        const contrasted = (rawLuminance - 0.5) * CONTRAST_BOOST + 0.5
        const luminance = clamp(contrasted, 0, 1)

        const charIndex = Math.min(chars.length - 1, Math.floor(luminance * (chars.length - 1)))
        const char = chars[charIndex] || ' '
        const drawX = x * charWidth
        const drawY = y * cellHeight

        if (highlightStrength > 0) {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${highlightStrength * 0.45})`
          ctx.fillRect(drawX, drawY, charWidth + 0.4, cellHeight + 0.4)
        }

        ctx.fillStyle = colored ? `rgb(${r}, ${g}, ${b})` : 'rgb(163, 255, 163)'
        ctx.fillText(char, drawX, drawY)
      }
    }

    if (!hasRenderedFrameRef.current) {
      hasRenderedFrameRef.current = true
      setHasRenderedFrame(true)
    }

    return true
  }, [blend, brightness, chars, colored, highlight, isReady, numColumns])

  useEffect(() => {
    const video = videoRef.current as VideoWithFrameCallback | null
    if (!video || !shouldPlay) return

    const updateFps = (timestamp: number) => {
      const state = fpsWindowRef.current
      if (state.lastTimestamp === 0) {
        state.lastTimestamp = timestamp
      }
      state.frames += 1
      const elapsed = timestamp - state.lastTimestamp
      if (elapsed >= 500) {
        setFps(Math.round((state.frames * 1000) / elapsed))
        state.lastTimestamp = timestamp
        state.frames = 0
      }
    }

    const tick = (timestamp: number) => {
      if (drawFrame(timestamp)) {
        updateFps(timestamp)
      }
      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    const tickVideoFrame: VideoFrameCallback = (now) => {
      if (drawFrame(now)) {
        updateFps(now)
      }
      if (video.requestVideoFrameCallback) {
        videoFrameCallbackRef.current = video.requestVideoFrameCallback(tickVideoFrame)
      }
    }

    if (video.requestVideoFrameCallback) {
      videoFrameCallbackRef.current = video.requestVideoFrameCallback(tickVideoFrame)
    } else {
      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (video.cancelVideoFrameCallback && videoFrameCallbackRef.current !== null) {
        video.cancelVideoFrameCallback(videoFrameCallbackRef.current)
        videoFrameCallbackRef.current = null
      }
    }
  }, [drawFrame, shouldPlay])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const attemptPlay = () => {
      if (!shouldLoadVideo || !shouldPlay) {
        return
      }

      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      video.setAttribute('muted', '')
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', 'true')
      void video.play().catch(() => undefined)
    }

    const handleReady = () => {
      setIsReady(true)
      if (autoPlay || shouldPlay) {
        attemptPlay()
      }
    }

    const handleWaiting = () => {
      setIsReady(false)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        attemptPlay()
      }
    }

    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('loadedmetadata', handleReady)
    video.addEventListener('canplay', handleReady)
    video.addEventListener('canplaythrough', handleReady)
    video.addEventListener('waiting', handleWaiting)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', attemptPlay)

    return () => {
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('loadedmetadata', handleReady)
      video.removeEventListener('canplay', handleReady)
      video.removeEventListener('canplaythrough', handleReady)
      video.removeEventListener('waiting', handleWaiting)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pageshow', attemptPlay)
    }
  }, [autoPlay, shouldPlay, shouldLoadVideo])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!shouldLoadVideo) {
      video.pause()
      return
    }

    if (shouldPlay) {
      void video.play().catch(() => undefined)
    } else {
      video.pause()
    }
  }, [shouldLoadVideo, shouldPlay])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      lastVideoTimeRef.current = -1
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!enableSpacebarToggle) return
      if (event.code !== 'Space') return
      event.preventDefault()
      setLocalPlaying((current) => !current)
    },
    [enableSpacebarToggle],
  )

  return (
    <div
      className={`video-to-ascii ${className}`.trim()}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          background: '#000',
          userSelect: 'none',
          cursor: enableSpacebarToggle ? 'pointer' : 'default',
        }}
        tabIndex={enableSpacebarToggle ? 0 : -1}
        onKeyDown={handleKeyDown}
      >
        <video
          ref={videoRef}
          src={shouldLoadVideo ? src : undefined}
          autoPlay={autoPlay || shouldPlay}
          muted
          loop={!usesLoopWindow}
          preload={priority ? 'auto' : shouldPlay ? 'auto' : shouldLoadVideo ? 'metadata' : 'none'}
          playsInline
          crossOrigin="anonymous"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: hasRenderedFrame ? 0 : 1,
            pointerEvents: 'none',
            transition: 'opacity 160ms ease',
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
        {showStats ? (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              padding: '4px 6px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
              fontSize: 12,
              background: 'rgba(0,0,0,0.72)',
              color: '#9cff9c',
            }}
          >
            {fps} FPS
          </div>
        ) : null}
      </div>
    </div>
  )
}
