import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from 'react'

const CHAR_WIDTH_RATIO = 0.6
const ATLAS_CELL_W = 32
const ATLAS_CELL_H = 56
const OUTPUT_DPR_LIMIT = 2
const CONTRAST_BOOST = 1.08
const MAX_TRAIL_LENGTH = 16
const MAX_RIPPLES = 6

function isCrossOriginSrc(src: string): boolean {
  if (typeof window === 'undefined') return false
  if (!/^https?:\/\//i.test(src)) return false
  try {
    return new URL(src, window.location.href).origin !== window.location.origin
  } catch {
    return false
  }
}

export const ASCII_CHARSETS = {
  standard: { name: 'Standard', chars: ' .:-=+*#%@' },
  blocks: { name: 'Blocks', chars: ' ░▒▓█' },
  minimal: { name: 'Minimal', chars: ' .oO@' },
  binary: { name: 'Binary', chars: ' █' },
  detailed: {
    name: 'Detailed',
    chars: ` .'` + String.raw`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@`,
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
  fitMode?: 'cover' | 'ambient'
  focalY?: number
  posterTime?: number
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_video;
uniform sampler2D u_asciiAtlas;

uniform vec2 u_gridSize;
uniform float u_numChars;
uniform vec2 u_uvOffset;
uniform vec2 u_uvScale;
uniform float u_featherY;

uniform int u_colored;
uniform float u_blend;
uniform float u_highlight;
uniform float u_brightness;
uniform float u_contrast;

uniform vec2 u_mouse;
uniform vec2 u_trail[16];
uniform int u_trailLength;

uniform vec4 u_ripples[6];
uniform float u_time;
uniform float u_rippleEnabled;
uniform float u_rippleSpeed;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec2 cellCoord = floor(v_texCoord * u_gridSize);
  vec2 cellCenter = (cellCoord + 0.5) / u_gridSize;
  vec2 videoUV = u_uvOffset + cellCenter * u_uvScale;

  bool inBounds = videoUV.x >= 0.0 && videoUV.x <= 1.0 && videoUV.y >= 0.0 && videoUV.y <= 1.0;
  vec3 videoRgb = vec3(0.0);

  if (inBounds) {
    videoRgb = texture(u_video, clamp(videoUV, 0.001, 0.999)).rgb;
    if (u_featherY > 0.0) {
      float fadeTop = smoothstep(0.0, u_featherY, videoUV.y);
      float fadeBottom = smoothstep(0.0, u_featherY, 1.0 - videoUV.y);
      float fadeSide = smoothstep(0.0, 0.04, videoUV.x) * smoothstep(0.0, 0.04, 1.0 - videoUV.x);
      videoRgb *= fadeTop * fadeBottom * fadeSide;
    }
  }

  // Interactive pointer & trail glow
  float cursorGlow = 0.0;
  float cursorRadius = 5.5;
  if (u_mouse.x >= 0.0) {
    vec2 mouseCell = floor(u_mouse * u_gridSize);
    float dist = length(cellCoord - mouseCell);
    if (dist <= cursorRadius) {
      cursorGlow += (1.0 - dist / cursorRadius) * 0.65;
    }
  }

  for (int i = 0; i < 16; i++) {
    if (i >= u_trailLength) break;
    vec2 tp = u_trail[i];
    if (tp.x < 0.0) continue;
    vec2 tCell = floor(tp * u_gridSize);
    float tDist = length(cellCoord - tCell);
    float tRadius = cursorRadius * 0.78;
    if (tDist <= tRadius) {
      float fade = 1.0 - float(i) / float(max(u_trailLength, 1));
      cursorGlow += (1.0 - tDist / tRadius) * 0.35 * fade;
    }
  }
  cursorGlow = min(cursorGlow, 0.85);

  // Expanding click / tap ripples
  float rippleGlow = 0.0;
  if (u_rippleEnabled > 0.5) {
    for (int i = 0; i < 6; i++) {
      vec4 rp = u_ripples[i];
      if (rp.w < 0.5) continue;
      float age = u_time - rp.z;
      if (age < 0.0) continue;
      vec2 rCell = floor(rp.xy * u_gridSize);
      float dist = length(cellCoord - rCell);
      float ringPos = age * u_rippleSpeed;
      float ringWidth = 3.2;
      float band = 1.0 - clamp(abs(dist - ringPos) / ringWidth, 0.0, 1.0);
      float lifeFade = clamp(1.0 - age / 1.35, 0.0, 1.0);
      rippleGlow += band * band * lifeFade * 0.55;
    }
    rippleGlow = min(rippleGlow, 0.9);
  }

  float rawLum = dot(videoRgb, vec3(0.2126, 0.7152, 0.0722)) * u_brightness;
  // Filmic shoulder roll-off prevents bright highlights from clipping into flat glyph walls
  float tonedLum = (rawLum / (1.0 + 0.22 * rawLum)) * 1.22;
  float contrasted = (tonedLum - 0.5) * u_contrast + 0.5;
  float interactiveLift = (cursorGlow * 0.22 + rippleGlow * 0.28) * step(0.005, rawLum + 0.04);
  float lum = clamp(contrasted + interactiveLift, 0.0, 1.0);

  float charIndex = inBounds ? floor(lum * (u_numChars - 0.001)) : 0.0;
  vec2 cellPos = fract(v_texCoord * u_gridSize);
  // Half-texel inset prevents horizontal bleeding between adjacent atlas glyphs
  float safeX = clamp(cellPos.x, 0.5 / ${ATLAS_CELL_W}.0, 1.0 - 0.5 / ${ATLAS_CELL_W}.0);
  float safeY = clamp(cellPos.y, 0.5 / ${ATLAS_CELL_H}.0, 1.0 - 0.5 / ${ATLAS_CELL_H}.0);
  vec2 atlasUV = vec2((charIndex + safeX) / u_numChars, safeY);
  float glyphAlpha = texture(u_asciiAtlas, atlasUV).r;

  vec3 tintColor = u_colored == 1 ? videoRgb : vec3(0.639, 1.0, 0.639);
  vec3 accentBoost = mix(tintColor, max(tintColor, vec3(0.55, 0.92, 0.84)), (cursorGlow + rippleGlow) * 0.45);

  // Exact match with Canvas2D: background blend + optional highlight cell rect + glyph fill
  vec3 baseBg = videoRgb * u_blend;
  float highlightAlpha = u_highlight * 0.45;
  vec3 cellBg = mix(baseBg, videoRgb, highlightAlpha);
  vec3 finalRgb = mix(cellBg, accentBoost, glyphAlpha);
  finalRgb += (cursorGlow * 0.14 + rippleGlow * 0.2) * accentBoost;

  fragColor = vec4(finalRgb, 1.0);
}
`

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function resolveColumns(width: number, numColumns?: number) {
  const densityScale = numColumns ? clamp(numColumns / 120, 0.72, 1.48) : 1
  if (width >= 1100 && numColumns) {
    return clamp(numColumns, 32, Math.floor(width / 3.8))
  }
  const baseCellPx = width <= 640 ? 4.75 : 5.15
  const targetCellPx = clamp(baseCellPx / Math.sqrt(densityScale), 3.9, 5.5)
  const idealCols = Math.round(width / targetCellPx)
  const maxCols = numColumns ? Math.max(numColumns, 76) : 164
  return clamp(idealCols, 44, maxCols)
}

function computeUvTransform(
  containerWidth: number,
  containerHeight: number,
  sourceWidth: number,
  sourceHeight: number,
  fitMode: 'cover' | 'ambient',
  focalY: number,
) {
  const containerAspect = containerWidth / containerHeight
  const sourceAspect = sourceWidth / sourceHeight

  if (fitMode === 'ambient' && containerAspect < sourceAspect * 0.72) {
    const scaleX = Math.max(containerAspect / sourceAspect, 0.8)
    const scaleY = scaleX * (sourceAspect / containerAspect)
    const offsetX = (1 - scaleX) * 0.5
    const offsetY = 0.5 - focalY * scaleY
    return {
      offsetX,
      offsetY,
      scaleX,
      scaleY,
      featherY: 0.16,
    }
  }

  if (sourceAspect > containerAspect) {
    const scaleX = containerAspect / sourceAspect
    return {
      offsetX: (1 - scaleX) * 0.5,
      offsetY: 0,
      scaleX,
      scaleY: 1,
      featherY: 0,
    }
  }

  const scaleY = sourceAspect / containerAspect
  return {
    offsetX: 0,
    offsetY: (1 - scaleY) * focalY,
    scaleX: 1,
    scaleY,
    featherY: 0,
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

type GlResources = {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  vao: WebGLVertexArrayObject | null
  posBuffer: WebGLBuffer | null
  texBuffer: WebGLBuffer | null
  videoTex: WebGLTexture
  atlasTex: WebGLTexture
  atlasCharsetKey: string
  uniforms: {
    u_video: WebGLUniformLocation | null
    u_asciiAtlas: WebGLUniformLocation | null
    u_gridSize: WebGLUniformLocation | null
    u_numChars: WebGLUniformLocation | null
    u_uvOffset: WebGLUniformLocation | null
    u_uvScale: WebGLUniformLocation | null
    u_featherY: WebGLUniformLocation | null
    u_colored: WebGLUniformLocation | null
    u_blend: WebGLUniformLocation | null
    u_highlight: WebGLUniformLocation | null
    u_brightness: WebGLUniformLocation | null
    u_contrast: WebGLUniformLocation | null
    u_mouse: WebGLUniformLocation | null
    u_trailLength: WebGLUniformLocation | null
    u_trail: Array<WebGLUniformLocation | null>
    u_ripples: Array<WebGLUniformLocation | null>
    u_time: WebGLUniformLocation | null
    u_rippleEnabled: WebGLUniformLocation | null
    u_rippleSpeed: WebGLUniformLocation | null
  }
}

function compileGlShader(gl: WebGL2RenderingContext, source: string, type: number) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function buildAtlasTexture(gl: WebGL2RenderingContext, chars: string[]) {
  const atlasCanvas = document.createElement('canvas')
  atlasCanvas.width = ATLAS_CELL_W * chars.length
  atlasCanvas.height = ATLAS_CELL_H
  const ctx = atlasCanvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = `500 ${Math.round(ATLAS_CELL_H * 0.88)}px "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i] ?? ' '
    if (ch !== ' ') {
      ctx.fillText(ch, i * ATLAS_CELL_W + ATLAS_CELL_W * 0.5, ATLAS_CELL_H * 0.53)
    }
  }

  const tex = gl.createTexture()
  if (!tex) return null
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return tex
}

function createGlResources(
  canvas: HTMLCanvasElement,
  chars: string[],
  charsetKey: string,
): GlResources | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'default',
    preserveDrawingBuffer: false,
  })
  if (!gl) return null

  const vs = compileGlShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER)
  const fs = compileGlShader(gl, FRAGMENT_SHADER, gl.FRAGMENT_SHADER)
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    return null
  }

  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return null
  }

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  gl.useProgram(program)

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
  const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0])

  const posBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  const posLoc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  const texBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
  const texLoc = gl.getAttribLocation(program, 'a_texCoord')
  gl.enableVertexAttribArray(texLoc)
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0)

  const videoTex = gl.createTexture()
  const atlasTex = buildAtlasTexture(gl, chars)
  if (!videoTex || !atlasTex) {
    if (videoTex) gl.deleteTexture(videoTex)
    if (atlasTex) gl.deleteTexture(atlasTex)
    gl.deleteProgram(program)
    return null
  }

  gl.bindTexture(gl.TEXTURE_2D, videoTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const get = (name: string) => gl.getUniformLocation(program, name)

  const uniforms: GlResources['uniforms'] = {
    u_video: get('u_video'),
    u_asciiAtlas: get('u_asciiAtlas'),
    u_gridSize: get('u_gridSize'),
    u_numChars: get('u_numChars'),
    u_uvOffset: get('u_uvOffset'),
    u_uvScale: get('u_uvScale'),
    u_featherY: get('u_featherY'),
    u_colored: get('u_colored'),
    u_blend: get('u_blend'),
    u_highlight: get('u_highlight'),
    u_brightness: get('u_brightness'),
    u_contrast: get('u_contrast'),
    u_mouse: get('u_mouse'),
    u_trailLength: get('u_trailLength'),
    u_trail: Array.from({ length: MAX_TRAIL_LENGTH }, (_, i) => get(`u_trail[${i}]`)),
    u_ripples: Array.from({ length: MAX_RIPPLES }, (_, i) => get(`u_ripples[${i}]`)),
    u_time: get('u_time'),
    u_rippleEnabled: get('u_rippleEnabled'),
    u_rippleSpeed: get('u_rippleSpeed'),
  }

  gl.uniform1i(uniforms.u_video, 0)
  gl.uniform1i(uniforms.u_asciiAtlas, 1)

  return {
    gl,
    program,
    vao,
    posBuffer,
    texBuffer,
    videoTex,
    atlasTex,
    atlasCharsetKey: charsetKey,
    uniforms,
  }
}

function disposeGlResources(res: GlResources | null) {
  if (!res) return
  const { gl } = res
  if (gl.isContextLost()) return
  gl.deleteTexture(res.videoTex)
  gl.deleteTexture(res.atlasTex)
  if (res.posBuffer) gl.deleteBuffer(res.posBuffer)
  if (res.texBuffer) gl.deleteBuffer(res.texBuffer)
  if (res.vao) gl.deleteVertexArray(res.vao)
  gl.deleteProgram(res.program)
}

export default function LocalVideo2Ascii({
  src,
  numColumns,
  colored = true,
  blend = 0,
  highlight = 0,
  brightness = 1,
  charset = 'standard',
  enableMouse = false,
  trailLength = 10,
  enableRipple = false,
  rippleSpeed = 36,
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
  fitMode = 'cover',
  focalY = 0.5,
  posterTime = 0.2,
}: VideoToAsciiProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const glResRef = useRef<GlResources | null>(null)
  const fallback2dRef = useRef(false)

  const animationFrameRef = useRef<number | null>(null)
  const lastUploadedVideoTimeRef = useRef(-1)
  const hasUploadedTextureRef = useRef(false)
  const forceRedrawRef = useRef(true)
  const hasRenderedFrameRef = useRef(false)
  const loadedSrcRef = useRef<string | null>(null)
  const inFlightPlayRef = useRef(false)
  const pauseRecoveryCountRef = useRef(0)
  const fpsWindowRef = useRef({ lastTimestamp: 0, frames: 0 })

  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 })
  const trailRef = useRef<Array<{ x: number; y: number }>>([])
  const ripplesRef = useRef<Array<{ x: number; y: number; start: number; active: number }>>([])
  const interactionActiveUntilRef = useRef(0)

  const [prevSrc, setPrevSrc] = useState(src)
  const [prevIsPlaying, setPrevIsPlaying] = useState(isPlaying)
  const [fps, setFps] = useState(0)
  const [localPlaying, setLocalPlaying] = useState(isPlaying)
  const [isVisible, setIsVisible] = useState(
    () => priority || !playOnlyWhenVisible || typeof IntersectionObserver === 'undefined',
  )
  const [shouldLoadVideo, setShouldLoadVideo] = useState(
    () => priority || !playOnlyWhenVisible || typeof IntersectionObserver === 'undefined',
  )
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  if (prevIsPlaying !== isPlaying) {
    setPrevIsPlaying(isPlaying)
    setLocalPlaying(isPlaying)
  }

  if (prevSrc !== src) {
    setPrevSrc(src)
    setFps(0)
    setIsVisible(priority)
    setShouldLoadVideo(priority)
    setHasRenderedFrame(false)
  }

  const chars = useMemo(() => [...ASCII_CHARSETS[charset].chars], [charset])
  const shouldPlay =
    localPlaying && !prefersReducedMotion && (!playOnlyWhenVisible || isVisible)
  const segments = useMemo(
    () => normalizeSegments(playSegments, loopStart, loopEnd),
    [loopEnd, loopStart, playSegments],
  )
  const usesLoopWindow = segments.length > 0

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    lastUploadedVideoTimeRef.current = -1
    hasUploadedTextureRef.current = false
    forceRedrawRef.current = true
    hasRenderedFrameRef.current = false
    loadedSrcRef.current = null
    inFlightPlayRef.current = false
    pauseRecoveryCountRef.current = 0
    fpsWindowRef.current = { lastTimestamp: 0, frames: 0 }
  }, [src])

  useEffect(() => {
    return () => {
      disposeGlResources(glResRef.current)
      glResRef.current = null
    }
  }, [])

  // Handle WebGL context loss/restoration on mobile browsers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onContextLost = (event: Event) => {
      event.preventDefault()
      glResRef.current = null
      hasUploadedTextureRef.current = false
      forceRedrawRef.current = true
    }

    const onContextRestored = () => {
      glResRef.current = null
      hasUploadedTextureRef.current = false
      forceRedrawRef.current = true
    }

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (!playOnlyWhenVisible || typeof IntersectionObserver === 'undefined') {
      return
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadVideo(true)
        }
      },
      {
        rootMargin: '55% 0px',
        threshold: 0.01,
      },
    )

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry && entry.isIntersecting)
        setIsVisible(visible)
        if (visible) {
          setShouldLoadVideo(true)
          forceRedrawRef.current = true
        }
      },
      {
        rootMargin: '40px 0px',
        threshold: 0.01,
      },
    )

    loadObserver.observe(container)
    visibilityObserver.observe(container)

    return () => {
      loadObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [playOnlyWhenVisible, priority])

  const syncToSegment = useCallback(
    (video: HTMLVideoElement) => {
      if (!usesLoopWindow) return
      const firstSegment = segments[0]
      if (!firstSegment) return

      const currentTime = video.currentTime
      for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index]
        if (!segment) continue
        if (currentTime < segment.start) {
          video.currentTime = segment.start
          return
        }
        if (currentTime >= segment.start && currentTime < segment.end - 0.02) {
          return
        }
        const nextSegment = segments[index + 1]
        if (currentTime >= segment.end - 0.02 && currentTime < (nextSegment?.start ?? Infinity)) {
          video.currentTime = nextSegment?.start ?? firstSegment.start
          return
        }
      }
      video.currentTime = firstSegment.start
    },
    [segments, usesLoopWindow],
  )

  const drawCanvas2DFallback = useCallback(
    (
      canvas: HTMLCanvasElement,
      video: HTMLVideoElement,
      width: number,
      height: number,
      dpr: number,
      cols: number,
      rows: number,
    ) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return false

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      const uv = computeUvTransform(
        width,
        height,
        video.videoWidth,
        video.videoHeight,
        fitMode,
        focalY,
      )

      if (!sampleCanvasRef.current) {
        sampleCanvasRef.current = document.createElement('canvas')
      }
      const sampleCanvas = sampleCanvasRef.current
      sampleCanvas.width = cols
      sampleCanvas.height = rows
      const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
      if (!sampleCtx) return false

      sampleCtx.fillStyle = '#000'
      sampleCtx.fillRect(0, 0, cols, rows)

      const sx = clamp(uv.offsetX, 0, 1) * video.videoWidth
      const sy = clamp(uv.offsetY, 0, 1) * video.videoHeight
      const sw = clamp(uv.scaleX, 0.01, 1) * video.videoWidth
      const sh = clamp(uv.scaleY, 0.01, 1) * video.videoHeight
      const dy = uv.offsetY < 0 ? (-uv.offsetY / uv.scaleY) * rows : 0
      const dh = Math.min(rows - dy, rows / Math.max(uv.scaleY, 1))

      sampleCtx.drawImage(video, sx, sy, sw, sh, 0, dy, cols, dh)
      const imageData = sampleCtx.getImageData(0, 0, cols, rows).data

      const charWidth = width / cols
      const cellHeight = height / rows
      ctx.font = `500 ${cellHeight * 0.94}px "SFMono-Regular", ui-monospace, Menlo, Monaco, monospace`
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'

      const highlightStrength = clamp(highlight / 100, 0, 1)

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const idx = (y * cols + x) * 4
          const r = imageData[idx] ?? 0
          const g = imageData[idx + 1] ?? 0
          const b = imageData[idx + 2] ?? 0

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

          if (char !== ' ') {
            ctx.fillStyle = colored ? `rgb(${r}, ${g}, ${b})` : 'rgb(163, 255, 163)'
            ctx.fillText(char, drawX, drawY)
          }
        }
      }

      return true
    },
    [brightness, chars, colored, fitMode, focalY, highlight],
  )

  const drawFrame = useCallback(
    (timestamp = performance.now()) => {
      const container = containerRef.current
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!container || !canvas || !video) {
        return false
      }

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return false
      }

      if (usesLoopWindow && !video.paused) {
        syncToSegment(video)
      }

      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, OUTPUT_DPR_LIMIT)
      const targetPixelW = Math.max(1, Math.floor(width * dpr))
      const targetPixelH = Math.max(1, Math.floor(height * dpr))

      const sizeChanged = canvas.width !== targetPixelW || canvas.height !== targetPixelH
      if (sizeChanged) {
        canvas.width = targetPixelW
        canvas.height = targetPixelH
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        forceRedrawRef.current = true
      }

      const hasActiveInteraction = timestamp < interactionActiveUntilRef.current
      const videoAdvanced = video.currentTime !== lastUploadedVideoTimeRef.current

      if (
        !videoAdvanced &&
        !forceRedrawRef.current &&
        !hasActiveInteraction &&
        hasRenderedFrameRef.current
      ) {
        return false
      }

      const cols = resolveColumns(width, numColumns)
      const estimatedFontSize = width / (cols * CHAR_WIDTH_RATIO)
      const rows = Math.max(1, Math.ceil(height / estimatedFontSize))

      let drew = false

      if (!fallback2dRef.current) {
        let res = glResRef.current
        if (!res || res.gl.isContextLost()) {
          res = createGlResources(canvas, chars, charset)
          glResRef.current = res
          hasUploadedTextureRef.current = false
        } else if (res.atlasCharsetKey !== charset) {
          const nextAtlas = buildAtlasTexture(res.gl, chars)
          if (nextAtlas) {
            res.gl.deleteTexture(res.atlasTex)
            res.atlasTex = nextAtlas
            res.atlasCharsetKey = charset
          }
        }

        if (!res) {
          fallback2dRef.current = true
        } else {
          const { gl, uniforms } = res
          gl.useProgram(res.program)
          gl.bindVertexArray(res.vao)
          gl.viewport(0, 0, targetPixelW, targetPixelH)

          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, res.videoTex)
          if (videoAdvanced || !hasUploadedTextureRef.current) {
            try {
              gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
              lastUploadedVideoTimeRef.current = video.currentTime
              hasUploadedTextureRef.current = true
            } catch {
              return false
            }
          }

          gl.activeTexture(gl.TEXTURE1)
          gl.bindTexture(gl.TEXTURE_2D, res.atlasTex)

          const uv = computeUvTransform(
            width,
            height,
            video.videoWidth,
            video.videoHeight,
            fitMode,
            focalY,
          )

          gl.uniform2f(uniforms.u_gridSize, cols, rows)
          gl.uniform1f(uniforms.u_numChars, chars.length)
          gl.uniform2f(uniforms.u_uvOffset, uv.offsetX, uv.offsetY)
          gl.uniform2f(uniforms.u_uvScale, uv.scaleX, uv.scaleY)
          gl.uniform1f(uniforms.u_featherY, uv.featherY)

          gl.uniform1i(uniforms.u_colored, colored ? 1 : 0)
          gl.uniform1f(uniforms.u_blend, clamp(blend / 100, 0, 1))
          gl.uniform1f(uniforms.u_highlight, clamp(highlight / 100, 0, 1))
          gl.uniform1f(uniforms.u_brightness, brightness)
          gl.uniform1f(uniforms.u_contrast, CONTRAST_BOOST)

          const mp = enableMouse ? mousePosRef.current : { x: -1, y: -1 }
          gl.uniform2f(uniforms.u_mouse, mp.x, mp.y)

          const activeTrail = enableMouse
            ? Math.min(trailRef.current.length, clamp(trailLength, 0, MAX_TRAIL_LENGTH))
            : 0
          gl.uniform1i(uniforms.u_trailLength, activeTrail)
          for (let i = 0; i < activeTrail; i += 1) {
            const pt = trailRef.current[i]
            const loc = uniforms.u_trail[i]
            if (pt && loc) {
              gl.uniform2f(loc, pt.x, pt.y)
            }
          }

          const nowSec = timestamp / 1000
          gl.uniform1f(uniforms.u_time, nowSec)
          gl.uniform1f(uniforms.u_rippleEnabled, enableRipple ? 1 : 0)
          gl.uniform1f(uniforms.u_rippleSpeed, rippleSpeed)

          if (enableRipple) {
            for (let i = 0; i < MAX_RIPPLES; i += 1) {
              const rp = ripplesRef.current[i]
              const loc = uniforms.u_ripples[i]
              if (!loc) continue
              if (rp && rp.active > 0.5 && nowSec - rp.start < 1.5) {
                gl.uniform4f(loc, rp.x, rp.y, rp.start, 1)
              } else {
                if (rp) rp.active = 0
                gl.uniform4f(loc, 0, 0, 0, 0)
              }
            }
          }

          gl.drawArrays(gl.TRIANGLES, 0, 6)
          drew = true
        }
      }

      if (fallback2dRef.current) {
        lastUploadedVideoTimeRef.current = video.currentTime
        drew = drawCanvas2DFallback(canvas, video, width, height, dpr, cols, rows)
      }

      if (drew) {
        forceRedrawRef.current = false
        if (!hasRenderedFrameRef.current) {
          hasRenderedFrameRef.current = true
          setHasRenderedFrame(true)
        }
      }

      return drew
    },
    [
      blend,
      brightness,
      chars,
      charset,
      colored,
      drawCanvas2DFallback,
      enableMouse,
      enableRipple,
      fitMode,
      focalY,
      highlight,
      numColumns,
      rippleSpeed,
      syncToSegment,
      trailLength,
      usesLoopWindow,
    ],
  )

  const drawFrameRef = useRef(drawFrame)
  useEffect(() => {
    drawFrameRef.current = drawFrame
  }, [drawFrame])

  const shouldPlayRef = useRef(shouldPlay)
  const prefersReducedMotionRef = useRef(prefersReducedMotion)
  useEffect(() => {
    shouldPlayRef.current = shouldPlay
    prefersReducedMotionRef.current = prefersReducedMotion
  }, [prefersReducedMotion, shouldPlay])

  useEffect(() => {
    forceRedrawRef.current = true
    if (!shouldPlay || prefersReducedMotion) {
      const id = window.requestAnimationFrame((ts) => {
        drawFrameRef.current(ts)
      })
      return () => window.cancelAnimationFrame(id)
    }
  }, [drawFrame, prefersReducedMotion, shouldPlay])

  // Main render loop (always rAF when visible/interactive — avoids iOS Safari rVFC stalls on loop/resume)
  useEffect(() => {
    if (!shouldLoadVideo) return
    const hasInteractiveFeatures = enableMouse || enableRipple
    if (!shouldPlay && !hasInteractiveFeatures) return

    let cancelled = false

    const updateFps = (timestamp: number) => {
      if (!showStats) return
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
      if (cancelled) return
      if (shouldPlay || timestamp < interactionActiveUntilRef.current || forceRedrawRef.current) {
        if (drawFrameRef.current(timestamp)) {
          updateFps(timestamp)
        }
      }
      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [enableMouse, enableRipple, shouldLoadVideo, shouldPlay, showStats])

  // Unified video loading, playback, looping, and iOS Safari / Low Power Mode recovery
  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoadVideo) return

    let cancelled = false
    let pauseRecoveryTimer: number | null = null
    let removeGestureFallback: (() => void) | null = null

    const clearGestureFallback = () => {
      removeGestureFallback?.()
      removeGestureFallback = null
    }

    const configureInlineMuted = () => {
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      video.setAttribute('muted', '')
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', 'true')
    }

    const seekForStaticFrame = () => {
      const target = segments[0]?.start ?? posterTime
      if (video.duration && Number.isFinite(video.duration)) {
        const clampedTarget = clamp(target, 0, Math.max(0, video.duration - 0.05))
        if (Math.abs(video.currentTime - clampedTarget) > 0.05) {
          try {
            video.currentTime = clampedTarget
          } catch {
            /* ignore seek before ready */
          }
        }
      }
      lastUploadedVideoTimeRef.current = -1
      forceRedrawRef.current = true
      window.requestAnimationFrame((ts) => {
        if (!cancelled) drawFrameRef.current(ts)
      })
    }

    const attachGestureFallback = () => {
      if (removeGestureFallback) return
      const onGesture = () => {
        if (cancelled || prefersReducedMotionRef.current) {
          clearGestureFallback()
          return
        }
        if (!shouldPlayRef.current) return
        configureInlineMuted()
        const p = video.play()
        if (p !== undefined) {
          p.then(() => {
            clearGestureFallback()
          }).catch(() => {
            /* keep listener until a user gesture actually unlocks playback */
          })
        } else {
          clearGestureFallback()
        }
      }
      window.addEventListener('touchstart', onGesture, { passive: true })
      window.addEventListener('pointerdown', onGesture, { passive: true })
      window.addEventListener('click', onGesture, { passive: true })
      removeGestureFallback = () => {
        window.removeEventListener('touchstart', onGesture)
        window.removeEventListener('pointerdown', onGesture)
        window.removeEventListener('click', onGesture)
      }
    }

    const attemptPlay = () => {
      if (cancelled) return

      if (prefersReducedMotionRef.current || (!autoPlay && !shouldPlayRef.current)) {
        video.pause()
        seekForStaticFrame()
        return
      }

      if (!shouldPlayRef.current) return

      configureInlineMuted()

      if (!video.paused && !video.ended) {
        return
      }

      if (inFlightPlayRef.current) return
      inFlightPlayRef.current = true

      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            inFlightPlayRef.current = false
            pauseRecoveryCountRef.current = 0
            clearGestureFallback()
          })
          .catch((error: unknown) => {
            inFlightPlayRef.current = false
            const name = error instanceof Error ? error.name : ''
            // Do not seek/interrupt on AbortError (e.g. concurrent load or visibility toggle)
            if (name === 'AbortError') return
            // iOS Low Power Mode or autoplay gate: show static frame and wait for gesture
            if (!hasRenderedFrameRef.current) {
              seekForStaticFrame()
            }
            attachGestureFallback()
          })
      } else {
        inFlightPlayRef.current = false
      }
    }

    configureInlineMuted()
    if (loadedSrcRef.current !== src) {
      loadedSrcRef.current = src
      video.load()
    }

    const handleLoadedMetadata = () => {
      if (usesLoopWindow) {
        syncToSegment(video)
      } else if (prefersReducedMotionRef.current) {
        seekForStaticFrame()
      }
    }

    const handleReady = () => {
      lastUploadedVideoTimeRef.current = -1
      forceRedrawRef.current = true
      window.requestAnimationFrame((ts) => {
        if (!cancelled) drawFrameRef.current(ts)
      })
      attemptPlay()
    }

    const handlePlaying = () => {
      pauseRecoveryCountRef.current = 0
      clearGestureFallback()
      lastUploadedVideoTimeRef.current = -1
      forceRedrawRef.current = true
      window.requestAnimationFrame((ts) => {
        if (!cancelled) drawFrameRef.current(ts)
      })
    }

    const handleTimeUpdate = () => {
      if (!hasRenderedFrameRef.current) {
        forceRedrawRef.current = true
        window.requestAnimationFrame((ts) => {
          if (!cancelled) drawFrameRef.current(ts)
        })
      }
    }

    const handleSeeked = () => {
      lastUploadedVideoTimeRef.current = -1
      forceRedrawRef.current = true
      window.requestAnimationFrame((ts) => {
        if (!cancelled) drawFrameRef.current(ts)
      })
    }

    const handleEnded = () => {
      if (!shouldPlayRef.current || prefersReducedMotionRef.current) return
      try {
        video.currentTime = usesLoopWindow ? (segments[0]?.start ?? 0) : 0
      } catch {
        /* ignore */
      }
      lastUploadedVideoTimeRef.current = -1
      forceRedrawRef.current = true
      attemptPlay()
    }

    const handleStalledOrSuspend = () => {
      if (shouldPlayRef.current && video.paused && video.readyState >= 2) {
        attemptPlay()
      }
    }

    const handlePause = () => {
      if (
        cancelled ||
        !shouldPlayRef.current ||
        prefersReducedMotionRef.current ||
        document.visibilityState !== 'visible' ||
        video.ended ||
        video.readyState < 2
      ) {
        return
      }
      // Recover from unexpected mobile Safari background/scroll pauses (bounded)
      if (pauseRecoveryCountRef.current >= 4) return
      pauseRecoveryCountRef.current += 1
      if (pauseRecoveryTimer !== null) {
        window.clearTimeout(pauseRecoveryTimer)
      }
      pauseRecoveryTimer = window.setTimeout(() => {
        pauseRecoveryTimer = null
        if (!cancelled && shouldPlayRef.current && video.paused) {
          attemptPlay()
        }
      }, 220)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pauseRecoveryCountRef.current = 0
        lastUploadedVideoTimeRef.current = -1
        forceRedrawRef.current = true
        attemptPlay()
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('canplay', handleReady)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('stalled', handleStalledOrSuspend)
    video.addEventListener('suspend', handleStalledOrSuspend)
    video.addEventListener('pause', handlePause)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', handleVisibility)

    if (video.readyState >= 2) {
      handleReady()
    } else if (shouldPlayRef.current) {
      attemptPlay()
    }

    return () => {
      cancelled = true
      if (pauseRecoveryTimer !== null) {
        window.clearTimeout(pauseRecoveryTimer)
      }
      clearGestureFallback()
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('canplay', handleReady)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('stalled', handleStalledOrSuspend)
      video.removeEventListener('suspend', handleStalledOrSuspend)
      video.removeEventListener('pause', handlePause)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pageshow', handleVisibility)
    }
  }, [
    autoPlay,
    posterTime,
    segments,
    shouldLoadVideo,
    src,
    syncToSegment,
    usesLoopWindow,
  ])

  // Play / pause sync on visibility or reduced-motion toggle
  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoadVideo) return

    if (shouldPlay) {
      if (video.paused && !inFlightPlayRef.current) {
        inFlightPlayRef.current = true
        const p = video.play()
        if (p !== undefined) {
          p.then(() => {
            inFlightPlayRef.current = false
          }).catch(() => {
            inFlightPlayRef.current = false
          })
        } else {
          inFlightPlayRef.current = false
        }
      }
    } else if (!video.paused) {
      video.pause()
    }
  }, [shouldLoadVideo, shouldPlay])

  // Container resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const triggerResizeRedraw = () => {
      forceRedrawRef.current = true
      window.requestAnimationFrame((ts) => drawFrame(ts))
    }

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', triggerResizeRedraw)
      return () => window.removeEventListener('resize', triggerResizeRedraw)
    }

    const observer = new ResizeObserver(triggerResizeRedraw)
    observer.observe(container)
    return () => observer.disconnect()
  }, [drawFrame])

  const updatePointerNorm = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current
      if (!container) return null
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return null
      const nx = clamp((clientX - rect.left) / rect.width, 0, 1)
      const ny = clamp((clientY - rect.top) / rect.height, 0, 1)

      if (enableMouse) {
        const prev = mousePosRef.current
        mousePosRef.current = { x: nx, y: ny }
        if (Math.hypot(nx - prev.x, ny - prev.y) > 0.012) {
          trailRef.current = [{ x: nx, y: ny }, ...trailRef.current.slice(0, MAX_TRAIL_LENGTH - 1)]
        }
        interactionActiveUntilRef.current = performance.now() + 450
      }

      return { x: nx, y: ny }
    },
    [enableMouse],
  )

  const spawnRipple = useCallback(
    (nx: number, ny: number) => {
      if (!enableRipple) return
      const nowSec = performance.now() / 1000
      const list = ripplesRef.current
      const next = { x: nx, y: ny, start: nowSec, active: 1 }
      const freeIdx = list.findIndex((item) => item.active < 0.5 || nowSec - item.start >= 1.5)
      if (freeIdx >= 0) {
        list[freeIdx] = next
      } else if (list.length < MAX_RIPPLES) {
        list.push(next)
      } else {
        list[0] = next
      }
      interactionActiveUntilRef.current = performance.now() + 1550
    },
    [enableRipple],
  )

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!enableMouse) return
      updatePointerNorm(event.clientX, event.clientY)
    },
    [enableMouse, updatePointerNorm],
  )

  const handleMouseLeave = useCallback(() => {
    if (!enableMouse) return
    mousePosRef.current = { x: -1, y: -1 }
    trailRef.current = []
    forceRedrawRef.current = true
  }, [enableMouse])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!enableRipple) return
      const pt = updatePointerNorm(event.clientX, event.clientY)
      if (pt) spawnRipple(pt.x, pt.y)
    },
    [enableRipple, spawnRipple, updatePointerNorm],
  )

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!enableMouse && !enableRipple) return
      const touch = event.touches[0]
      if (!touch) return
      const pt = updatePointerNorm(touch.clientX, touch.clientY)
      if (pt && enableRipple) {
        spawnRipple(pt.x, pt.y)
      }
    },
    [enableMouse, enableRipple, spawnRipple, updatePointerNorm],
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!enableMouse) return
      const touch = event.touches[0]
      if (!touch) return
      updatePointerNorm(touch.clientX, touch.clientY)
    },
    [enableMouse, updatePointerNorm],
  )

  const handleTouchEnd = useCallback(() => {
    if (!enableMouse) return
    mousePosRef.current = { x: -1, y: -1 }
    trailRef.current = []
    interactionActiveUntilRef.current = Math.max(
      interactionActiveUntilRef.current,
      performance.now() + 200,
    )
  }, [enableMouse])

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
          background: '#08090a',
          userSelect: 'none',
          cursor: enableSpacebarToggle || enableRipple ? 'pointer' : 'default',
        }}
        tabIndex={enableSpacebarToggle ? 0 : -1}
        onKeyDown={handleKeyDown}
        onMouseMove={enableMouse ? handleMouseMove : undefined}
        onMouseLeave={enableMouse ? handleMouseLeave : undefined}
        onClick={enableRipple ? handleClick : undefined}
        onTouchStart={enableMouse || enableRipple ? handleTouchStart : undefined}
        onTouchMove={enableMouse ? handleTouchMove : undefined}
        onTouchEnd={enableMouse ? handleTouchEnd : undefined}
      >
        <video
          ref={videoRef}
          src={shouldLoadVideo ? src : undefined}
          autoPlay={(autoPlay || shouldPlay) && !prefersReducedMotion}
          muted
          loop={!usesLoopWindow}
          preload={priority ? 'auto' : shouldLoadVideo ? 'auto' : 'none'}
          playsInline
          crossOrigin={isCrossOriginSrc(src) ? 'anonymous' : undefined}
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 2,
            height: 2,
            opacity: 0.01,
            zIndex: 0,
            pointerEvents: 'none',
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
            opacity: hasRenderedFrame ? 1 : 0,
            transition: 'opacity 260ms ease',
          }}
        />
        {showStats ? (
          <div
            style={{
              position: 'absolute',
              zIndex: 2,
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
