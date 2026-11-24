import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react'
import {
  DEFAULT_SUGGESTIONS,
  SHELL_COMMANDS,
  executeLocalCommand,
  parseAnsi,
  resolveWorldId,
  type SuggestionItem,
} from '../lib/etherShell'
import {
  EtherFieldRenderer,
  MODE_ORDER,
  PALETTE_ORDER,
  WORLD_BY_ID,
  WORLD_CATALOG,
  getWorldHud,
  type PaletteId,
  type RenderMode,
  type WorldCamera,
  type WorldId,
} from '../lib/etherWorlds'

type ConnectionState = 'connecting' | 'live' | 'fallback'
type DockTab = 'explore' | 'ask' | 'worlds'

type Telemetry = {
  node?: string
  arch?: string
  cpu_temp_c?: number | null
  active_sessions?: number
  max_sessions?: number
  model?: string
}

type TerminalBlock = {
  id: number
  kind: 'command' | 'output'
  text: string
  promptHost?: string
}

const DEFAULT_PROD_WS = 'wss://raspberrypi.taila980b4.ts.net/spatel-terminal'
const WS_STORAGE_KEY = 'spatel_rpi5_ws_url'

function getInitialWsUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_PROD_WS
  const envUrl = (import.meta.env.VITE_TERMINAL_WS_URL as string | undefined)?.trim()
  const params = new URLSearchParams(window.location.search)
  const queryUrl = params.get('ws')?.trim()
  if (queryUrl && /^wss?:\/\//i.test(queryUrl)) return queryUrl
  if (envUrl && /^wss?:\/\//i.test(envUrl)) return envUrl
  try {
    const saved = window.localStorage.getItem(WS_STORAGE_KEY)?.trim()
    if (saved && /^wss?:\/\//i.test(saved)) return saved
  } catch {
    /* ignore storage errors */
  }
  return DEFAULT_PROD_WS
}

const EXPLORE_CHIPS: SuggestionItem[] = [
  { label: '5-stop tour', command: 'tour' },
  { label: 'research archive', command: 'research' },
  { label: 'psychohistory v2', command: 'psychohistory' },
  { label: 'kailas mandala', command: 'kailas' },
  { label: 'honest nulls', command: 'nulls' },
  { label: 'e-process compare', command: 'eprocess compare' },
  { label: 'qr nullspace', command: 'qrproj' },
  { label: 'essays', command: 'essays' },
  { label: 'scale timeline', command: 'timeline' },
]

const ASK_CHIPS: SuggestionItem[] = [
  {
    label: 'what connects your work?',
    command: 'What connects your work across AI safety, markets, and Kailas?',
  },
  {
    label: 'formal containment',
    command: 'How do you keep untrusted agent proposers from executing unsafe actions?',
  },
  {
    label: 'holdout certificates',
    command: 'How do you keep RSI loops from overfitting their judge?',
  },
  {
    label: 'why track 4 failed → track 5',
    command: 'Why did ARC Membrane Track 4 fail and how did Track 5 QR-SFT fix it?',
  },
  {
    label: 'kailas double dissociation',
    command: 'How did the Kailas two-clock null become a spatial mandala finding?',
  },
  {
    label: 'public goods stack',
    command: 'How do you think about durable public goods funding?',
  },
]

const WELCOME_BANNER =
  '\x1b[1m\x1b[38;2;223;208;178m╭─ SPATEL // ETHER HARNESS\x1b[0m  ' +
  '\x1b[38;2;138;134;126m(personal model · verified research · multidimensional ASCII worlds)\x1b[0m\n' +
  '\x1b[38;2;138;134;126m╰─\x1b[0m \x1b[38;2;220;216;206mAsk anything directly, click `\x1b[38;2;223;208;178mtour\x1b[38;2;220;216;206m` for a 5-stop walkthrough, ' +
  'run `\x1b[38;2;223;208;178meprocess compare\x1b[38;2;220;216;206m` or `\x1b[38;2;132;204;224mworlds\x1b[38;2;220;216;206m`.\x1b[0m\n'

function stripAnsi(text: string): string {
  const esc = String.fromCharCode(27)
  return text.replace(new RegExp(`${esc}\\[[0-9;]*m`, 'g'), '')
}

function AnsiRichText({
  text,
  onRunCommand,
}: {
  text: string
  onRunCommand: (cmd: string) => void
}) {
  const spans = useMemo(() => parseAnsi(text), [text])
  return (
    <>
      {spans.map((span, idx) =>
        span.command ? (
          <button
            key={idx}
            type="button"
            className="ether-inline-cmd"
            onClick={(e) => {
              e.stopPropagation()
              onRunCommand(span.command!)
            }}
            title={`Run: ${span.command}`}
          >
            {span.text}
          </button>
        ) : (
          <span
            key={idx}
            style={{
              color: span.color,
              fontWeight: span.bold ? 600 : undefined,
              opacity: span.dim ? 0.68 : undefined,
            }}
          >
            {span.text}
          </span>
        ),
      )}
    </>
  )
}

export function EtherTerminal() {
  const [wsUrl, setWsUrl] = useState<string>(getInitialWsUrl)
  const [endpointDraft, setEndpointDraft] = useState<string>(getInitialWsUrl)
  const [showEndpointBar, setShowEndpointBar] = useState(false)
  const [connState, setConnState] = useState<ConnectionState>('fallback')
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [busyLabel, setBusyLabel] = useState<string | null>(null)
  const [dockTab, setDockTab] = useState<DockTab>('explore')
  const [expanded, setExpanded] = useState(false)
  const [copiedBlockId, setCopiedBlockId] = useState<number | null>(null)

  const [blocks, setBlocks] = useState<TerminalBlock[]>([
    { id: 1, kind: 'output', text: WELCOME_BANNER },
  ])
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(DEFAULT_SUGGESTIONS)
  const [inputValue, setInputValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState<number>(-1)

  // High-resolution multidimensional ASCII world portal state
  const [activeWorld, setActiveWorld] = useState<WorldId | null>(null)
  const [renderMode, setRenderMode] = useState<RenderMode>('braille')
  const [palette, setPalette] = useState<PaletteId>('obsidian')
  const [paused, setPaused] = useState(false)
  const [showHud, setShowHud] = useState(true)
  const [worldResLabel, setWorldResLabel] = useState('BRAILLE')
  const [hudText, setHudText] = useState(() =>
    getWorldHud('universal', { yaw: 0, pitch: 0, zoom: 1, time: 0 }),
  )

  const wsRef = useRef<WebSocket | null>(null)
  const connectRef = useRef<((url: string, silent?: boolean) => void) | null>(null)
  const manualDisconnectRef = useRef(false)
  const reconnectTimerRef = useRef<number | null>(null)
  const nextIdRef = useRef(2)
  const streamBlockIdRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const stickToBottomRef = useRef(true)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<EtherFieldRenderer | null>(null)
  const camRef = useRef<WorldCamera>({ yaw: 0, pitch: 0.12, zoom: 1, time: 0 })
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  })

  // Inline ghost autocomplete hint
  const ghostHint = useMemo(() => {
    const trimmed = inputValue.trimStart()
    if (!trimmed) return ''
    const lower = trimmed.toLowerCase()
    const hit = SHELL_COMMANDS.find((c) => c.startsWith(lower) && c.length > lower.length)
    return hit ? hit.slice(lower.length) : ''
  }, [inputValue])

  const appendBlock = useCallback(
    (kind: 'command' | 'output', text: string, promptHost?: string) => {
      const id = nextIdRef.current++
      streamBlockIdRef.current = kind === 'output' ? id : null
      stickToBottomRef.current = true
      setBlocks((prev) => [...prev.slice(-90), { id, kind, text, promptHost }])
    },
    [],
  )

  const appendStreamChunk = useCallback((chunk: string) => {
    setBlocks((prev) => {
      const targetId = streamBlockIdRef.current
      if (targetId !== null && prev.length > 0 && prev[prev.length - 1].id === targetId) {
        const updated = prev.slice()
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: updated[updated.length - 1].text + chunk,
        }
        return updated
      }
      const id = nextIdRef.current++
      streamBlockIdRef.current = id
      return [...prev.slice(-90), { id, kind: 'output', text: chunk }]
    })
  }, [])

  const openWorld = useCallback((worldId: WorldId) => {
    const meta = WORLD_BY_ID[worldId]
    setActiveWorld(worldId)
    setPalette(meta.defaultPalette)
    setPaused(false)
    setDockTab('worlds')
    camRef.current = { yaw: 0, pitch: 0.12, zoom: 1, time: 0 }
  }, [])

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const disconnectSocket = useCallback(() => {
    clearReconnectTimer()
    const ws = wsRef.current
    if (ws) {
      ws.onopen = null
      ws.onmessage = null
      ws.onerror = null
      ws.onclose = null
      try {
        ws.close()
      } catch {
        /* ignore */
      }
      wsRef.current = null
    }
    setBusyLabel(null)
    setConnState('fallback')
    setTelemetry(null)
  }, [clearReconnectTimer])

  const connectToEndpoint = useCallback(
    (targetUrl: string, silent = false) => {
      manualDisconnectRef.current = false
      disconnectSocket()
      if (!/^wss?:\/\//i.test(targetUrl)) {
        if (!silent) {
          appendBlock(
            'output',
            `\x1b[38;2;232;180;104mInvalid WebSocket URL:\x1b[0m expected ws:// or wss:// (got "${targetUrl}")\n`,
          )
        }
        return
      }

      setWsUrl(targetUrl)
      setEndpointDraft(targetUrl)
      try {
        window.localStorage.setItem(WS_STORAGE_KEY, targetUrl)
      } catch {
        /* ignore */
      }

      setConnState('connecting')
      let settled = false
      let wasLive = false
      let ws: WebSocket
      try {
        ws = new WebSocket(targetUrl)
      } catch {
        setConnState('fallback')
        return
      }
      wsRef.current = ws

      const timeoutId = window.setTimeout(() => {
        if (!settled && ws.readyState !== WebSocket.OPEN) {
          settled = true
          try {
            ws.close()
          } catch {
            /* ignore */
          }
          setConnState('fallback')
          if (!silent) {
            appendBlock(
              'output',
              `\x1b[38;2;138;134;126mRPi5 endpoint unreachable (${targetUrl}) — instant local sandbox active.\x1b[0m\n`,
            )
          }
        }
      }, 2800)

      ws.onopen = () => {
        settled = true
        wasLive = true
        window.clearTimeout(timeoutId)
        setConnState('live')
        streamBlockIdRef.current = null
        ws.send(JSON.stringify({ type: 'resize', cols: 96, rows: 28 }))
      }

      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') return
        try {
          const msg = JSON.parse(event.data) as {
            type?: string
            data?: unknown
            world?: string
            active?: boolean
            label?: string
            items?: SuggestionItem[]
          }
          if (msg.type === 'ansi' && typeof msg.data === 'string') {
            appendStreamChunk(msg.data)
          } else if (msg.type === 'clear') {
            streamBlockIdRef.current = null
            setBlocks([])
          } else if (msg.type === 'busy') {
            setBusyLabel(msg.active ? msg.label || 'streaming from raspberrypi-5…' : null)
          } else if (msg.type === 'suggestions' && Array.isArray(msg.items)) {
            setSuggestions(msg.items.slice(0, 5))
          } else if (msg.type === 'telemetry' && msg.data && typeof msg.data === 'object') {
            setTelemetry(msg.data as Telemetry)
          } else if (msg.type === 'portal' && typeof msg.world === 'string') {
            const wid = resolveWorldId(msg.world)
            if (wid) openWorld(wid)
          }
        } catch {
          appendStreamChunk(event.data)
        }
      }

      ws.onerror = () => {
        if (!settled) {
          settled = true
          window.clearTimeout(timeoutId)
          setConnState('fallback')
        }
      }

      ws.onclose = () => {
        window.clearTimeout(timeoutId)
        if (wsRef.current === ws) {
          wsRef.current = null
          setBusyLabel(null)
          setConnState('fallback')
          setTelemetry(null)
          if (wasLive && !manualDisconnectRef.current) {
            reconnectTimerRef.current = window.setTimeout(() => {
              connectRef.current?.(targetUrl, true)
            }, 3500)
          }
        }
      }
    },
    [appendBlock, appendStreamChunk, disconnectSocket, openWorld],
  )

  useEffect(() => {
    connectRef.current = connectToEndpoint
  }, [connectToEndpoint])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      connectToEndpoint(getInitialWsUrl(), true)
    }, 0)
    return () => {
      window.clearTimeout(timerId)
      manualDisconnectRef.current = true
      disconnectSocket()
    }
  }, [connectToEndpoint, disconnectSocket])

  // Smart autoscroll: only scroll when pinned near bottom
  useEffect(() => {
    const el = scrollRef.current
    if (el && !activeWorld && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [blocks, activeWorld, busyLabel])

  useEffect(() => {
    if (!expanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [expanded])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distanceFromBottom < 48
  }

  const handleInterrupt = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }))
    }
    setBusyLabel(null)
    appendBlock('output', '\x1b[38;2;138;134;126m^C interrupted\x1b[0m\n')
  }, [appendBlock])

  const runLine = useCallback(
    (rawLine: string) => {
      const line = rawLine.trim()
      if (!line) return

      setActiveWorld(null)
      setHistory((prev) => [line, ...prev.filter((item) => item !== line)].slice(0, 60))
      setHistoryIdx(-1)

      const promptHost = connState === 'live' ? telemetry?.node || 'rpi5' : 'ether'
      appendBlock('command', line, promptHost)
      streamBlockIdRef.current = null

      const lower = line.toLowerCase()
      if (lower === 'connect' || lower.startsWith('connect ')) {
        const target = line.slice(7).trim() || wsUrl
        appendBlock(
          'output',
          `\x1b[38;2;132;204;224mDialing RPi5 sandbox -> \x1b[38;2;223;208;178m${target}\x1b[0m ...\n`,
        )
        connectToEndpoint(target, false)
        return
      }
      if (lower === 'disconnect') {
        manualDisconnectRef.current = true
        disconnectSocket()
        appendBlock(
          'output',
          '\x1b[38;2;138;134;126mDisconnected from RPi5 socket. Local grounded sandbox active.\x1b[0m\n',
        )
        return
      }

      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', line }))
        return
      }

      const res = executeLocalCommand(line, wsUrl)
      if (res.clear) {
        setBlocks([])
        setSuggestions(DEFAULT_SUGGESTIONS)
        return
      }
      if (res.ansi) {
        appendBlock('output', res.ansi)
      }
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions)
      }
      if (res.portal) {
        openWorld(res.portal)
      }
    },
    [
      appendBlock,
      connState,
      connectToEndpoint,
      disconnectSocket,
      openWorld,
      telemetry?.node,
      wsUrl,
    ],
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const value = inputValue
    setInputValue('')
    runLine(value)
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = Math.min(history.length - 1, historyIdx + 1)
      setHistoryIdx(next)
      setInputValue(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx <= 0) {
        setHistoryIdx(-1)
        setInputValue('')
      } else {
        const next = historyIdx - 1
        setHistoryIdx(next)
        setInputValue(history[next])
      }
    } else if (e.key === 'Tab' || (e.key === 'ArrowRight' && ghostHint && e.currentTarget.selectionStart === inputValue.length)) {
      if (ghostHint) {
        e.preventDefault()
        setInputValue((prev) => prev + ghostHint)
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setBlocks([])
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      handleInterrupt()
    }
  }

  const copyBlock = async (block: TerminalBlock) => {
    try {
      await navigator.clipboard.writeText(stripAnsi(block.text).trim())
      setCopiedBlockId(block.id)
      window.setTimeout(() => setCopiedBlockId((cur) => (cur === block.id ? null : cur)), 1400)
    } catch {
      /* ignore */
    }
  }

  // Keyboard shortcuts when inside a high-res world portal
  useEffect(() => {
    if (!activeWorld) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault()
        setActiveWorld(null)
        window.setTimeout(() => inputRef.current?.focus(), 30)
      } else if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      } else if (e.key === 'm' || e.key === 'M') {
        setRenderMode((cur) => MODE_ORDER[(MODE_ORDER.indexOf(cur) + 1) % MODE_ORDER.length])
      } else if (e.key === 'p' || e.key === 'P') {
        setPalette((cur) => PALETTE_ORDER[(PALETTE_ORDER.indexOf(cur) + 1) % PALETTE_ORDER.length])
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHud((v) => !v)
      } else if (e.key === 'f' || e.key === 'F') {
        setExpanded((v) => !v)
      } else if (e.key === 'i' || e.key === 'I') {
        const meta = WORLD_BY_ID[activeWorld]
        runLine(`Explain the science and philosophy behind ${meta.name} (${meta.span}).`)
      } else if (e.key === '+' || e.key === '=') {
        camRef.current.zoom = Math.min(2.8, camRef.current.zoom * 1.12)
      } else if (e.key === '-' || e.key === '_') {
        camRef.current.zoom = Math.max(0.45, camRef.current.zoom / 1.12)
      } else if (e.key >= '1' && e.key <= '8') {
        const w = WORLD_CATALOG[Number(e.key) - 1]
        if (w) openWorld(w.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeWorld, openWorld, runLine])

  // High-FPS high-resolution ASCII / Braille world animation loop
  useEffect(() => {
    if (!activeWorld) return
    const canvas = canvasRef.current
    const viewport = viewportRef.current
    if (!canvas || !viewport) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!rendererRef.current) {
      rendererRef.current = new EtherFieldRenderer()
    }
    const renderer = rendererRef.current

    let widthPx = 640
    let heightPx = 360

    const syncSize = () => {
      const rect = viewport.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      widthPx = Math.max(300, Math.floor(rect.width))
      heightPx = Math.max(240, Math.floor(rect.height))
      canvas.width = Math.floor(widthPx * dpr)
      canvas.height = Math.floor(heightPx * dpr)
      canvas.style.width = `${widthPx}px`
      canvas.style.height = `${heightPx}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const fontSize = widthPx >= 820 ? 12 : widthPx >= 560 ? 11 : 10
      const cols = Math.max(36, Math.floor(widthPx / Math.max(6, Math.round(fontSize * 0.62))))
      const rows = Math.max(16, Math.floor(heightPx / Math.max(11, Math.round(fontSize * 1.12))))
      const multX = renderMode === 'braille' ? 2 : 1
      const multY = renderMode === 'braille' ? 4 : renderMode === 'halfblock' ? 2 : 1
      setWorldResLabel(`${cols * multX}×${rows * multY} ${renderMode.toUpperCase()}`)
    }

    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(viewport)

    let rafId = 0
    let lastFrame = performance.now()
    let lastHudUpdate = 0

    const tick = (now: number) => {
      rafId = window.requestAnimationFrame(tick)
      const dt = Math.min(0.08, (now - lastFrame) / 1000)
      if (dt < 0.028) return
      lastFrame = now

      if (!paused) {
        camRef.current.time += dt
      }

      renderer.renderToCanvas(
        ctx,
        widthPx,
        heightPx,
        activeWorld,
        renderMode,
        palette,
        camRef.current,
      )

      if (now - lastHudUpdate > 180) {
        lastHudUpdate = now
        setHudText(getWorldHud(activeWorld, camRef.current))
      }
    }

    rafId = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [activeWorld, renderMode, palette, paused, expanded])

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { active: true, x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    dragRef.current.x = e.clientX
    dragRef.current.y = e.clientY
    camRef.current.yaw += dx * 0.0085
    camRef.current.pitch = Math.max(-1.1, Math.min(1.1, camRef.current.pitch + dy * 0.0065))
  }

  const handlePointerUp = () => {
    dragRef.current.active = false
  }

  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.92 : 1.08
    camRef.current.zoom = Math.max(0.45, Math.min(2.8, camRef.current.zoom * factor))
  }

  const activeWorldMeta = activeWorld ? WORLD_BY_ID[activeWorld] : null
  const promptPrefix =
    connState === 'live' ? `traveler@${telemetry?.node || 'rpi5'} ~$` : 'traveler@ether ~$'

  const statusBadge =
    connState === 'live'
      ? `● live · ${telemetry?.node || 'rpi5'}${telemetry?.cpu_temp_c != null ? ` · ${telemetry.cpu_temp_c}°C` : ''}`
      : connState === 'connecting'
        ? '◐ dialing rpi5…'
        : '○ local sandbox · click to dial'

  return (
    <div
      className={`ether-terminal${expanded ? ' is-expanded' : ''}`}
      aria-label="Live sandboxed RPi5 personal model terminal and multidimensional ASCII worlds"
    >
      {/* Top Bar */}
      <div className="ether-terminal__head">
        <div className="ether-terminal__brand">
          <span className="ether-terminal__title">spatel — ether harness</span>
          <button
            type="button"
            className={`ether-status-pill is-${connState}`}
            onClick={() => setShowEndpointBar((v) => !v)}
            title="Configure or reconnect Raspberry Pi 5 WebSocket tunnel"
          >
            {statusBadge}
          </button>
        </div>

        <div className="ether-terminal__actions">
          {activeWorld ? (
            <button
              type="button"
              className="ether-head-btn is-accent"
              onClick={() => {
                setActiveWorld(null)
                window.setTimeout(() => inputRef.current?.focus(), 30)
              }}
            >
              ← prompt
            </button>
          ) : (
            <button
              type="button"
              className="ether-head-btn"
              onClick={() => runLine('clear')}
              title="Clear terminal scrollback (Ctrl+L)"
            >
              clear
            </button>
          )}
          <button
            type="button"
            className="ether-head-btn"
            onClick={() => setExpanded((v) => !v)}
            title="Toggle fullscreen theater mode"
          >
            {expanded ? '⤡ exit' : '⤢ expand'}
          </button>
        </div>
      </div>

      {/* Collapsible RPi5 Tunnel Endpoint Bar */}
      {showEndpointBar ? (
        <form
          className="ether-endpoint-bar"
          onSubmit={(e) => {
            e.preventDefault()
            connectToEndpoint(endpointDraft.trim(), false)
            setShowEndpointBar(false)
          }}
        >
          <label htmlFor="ether-ws-input">rpi5 ws</label>
          <input
            id="ether-ws-input"
            type="text"
            value={endpointDraft}
            onChange={(e) => setEndpointDraft(e.target.value)}
            placeholder="wss://raspberrypi.taila980b4.ts.net/spatel-terminal"
            spellCheck={false}
          />
          <button type="submit" className="ether-head-btn is-accent">
            connect
          </button>
          {connState === 'live' ? (
            <button
              type="button"
              className="ether-head-btn"
              onClick={() => {
                manualDisconnectRef.current = true
                disconnectSocket()
                setShowEndpointBar(false)
              }}
            >
              disconnect
            </button>
          ) : null}
        </form>
      ) : null}

      {/* Clean Tabbed Explorer Dock: Explore · Ask Model · 8 ASCII Worlds */}
      <div className="ether-dock">
        <div className="ether-dock__tabs" role="tablist" aria-label="Terminal exploration modes">
          <button
            type="button"
            role="tab"
            aria-selected={dockTab === 'explore'}
            className={`ether-dock__tab${dockTab === 'explore' ? ' is-active' : ''}`}
            onClick={() => setDockTab('explore')}
          >
            Explore
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={dockTab === 'ask'}
            className={`ether-dock__tab${dockTab === 'ask' ? ' is-active' : ''}`}
            onClick={() => setDockTab('ask')}
          >
            Ask Model
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={dockTab === 'worlds'}
            className={`ether-dock__tab ether-dock__tab--worlds${dockTab === 'worlds' ? ' is-active' : ''}`}
            onClick={() => setDockTab('worlds')}
          >
            ✦ Worlds (8)
          </button>
        </div>

        <div className="ether-chips__row">
          {dockTab === 'explore'
            ? EXPLORE_CHIPS.map((item) => (
                <button
                  key={item.command}
                  type="button"
                  className="terminal-prompt-chip"
                  onClick={() => runLine(item.command)}
                >
                  {item.label}
                </button>
              ))
            : null}
          {dockTab === 'ask'
            ? ASK_CHIPS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="terminal-prompt-chip"
                  onClick={() => runLine(item.command)}
                >
                  {item.label}
                </button>
              ))
            : null}
          {dockTab === 'worlds'
            ? WORLD_CATALOG.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`terminal-prompt-chip terminal-prompt-chip--world${activeWorld === w.id ? ' is-active' : ''}`}
                  onClick={() => openWorld(w.id)}
                  title={`${w.name} — ${w.span}`}
                >
                  ✦ {w.shortLabel}
                </button>
              ))
            : null}
        </div>
      </div>

      {/* Main Viewport: High-Res World Portal OR Interactive Rich ANSI Shell */}
      {activeWorld && activeWorldMeta ? (
        <div className="ether-portal" ref={viewportRef}>
          <canvas
            ref={canvasRef}
            className="ether-portal__canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          />

          {showHud ? (
            <>
              <div className="ether-portal__hud ether-portal__hud--top">
                <div>
                  <span className="ether-portal__kicker">
                    WORLD 0{activeWorldMeta.index} / 08 · {worldResLabel}
                  </span>
                  <strong>{activeWorldMeta.name}</strong>
                </div>
                <div className="ether-portal__telemetry">
                  <span>{hudText.epoch}</span>
                  <span>{hudText.coords}</span>
                </div>
              </div>

              <div className="ether-portal__hud ether-portal__hud--bottom">
                <span className="ether-portal__caption">{activeWorldMeta.caption}</span>
                <div className="ether-portal__controls">
                  <button
                    type="button"
                    className="ether-hud-btn is-ask"
                    onClick={() =>
                      runLine(
                        `Explain the science and meaning behind ${activeWorldMeta.name} (${activeWorldMeta.span}).`,
                      )
                    }
                    title="Ask shaanpatel-cv-pico about this world"
                  >
                    [i] ask model
                  </button>
                  <button
                    type="button"
                    className="ether-hud-btn"
                    onClick={() =>
                      setRenderMode(
                        (cur) => MODE_ORDER[(MODE_ORDER.indexOf(cur) + 1) % MODE_ORDER.length],
                      )
                    }
                  >
                    [m] {renderMode}
                  </button>
                  <button
                    type="button"
                    className="ether-hud-btn"
                    onClick={() =>
                      setPalette(
                        (cur) =>
                          PALETTE_ORDER[(PALETTE_ORDER.indexOf(cur) + 1) % PALETTE_ORDER.length],
                      )
                    }
                  >
                    [p] {palette}
                  </button>
                  <button
                    type="button"
                    className="ether-hud-btn"
                    onClick={() => setPaused((p) => !p)}
                  >
                    {paused ? '[space] play' : '[space] pause'}
                  </button>
                  <button
                    type="button"
                    className="ether-hud-btn"
                    onClick={() => setActiveWorld(null)}
                  >
                    [q] prompt
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="ether-portal__hud-restore"
              onClick={() => setShowHud(true)}
            >
              [h] show hud
            </button>
          )}
        </div>
      ) : (
        <div
          className="ether-scroll"
          ref={scrollRef}
          onScroll={handleScroll}
          onClick={() => {
            if (!window.getSelection()?.toString()) {
              inputRef.current?.focus()
            }
          }}
        >
          {blocks.map((block) =>
            block.kind === 'command' ? (
              <div key={block.id} className="ether-line ether-line--cmd">
                <span className="ether-prompt-tag">
                  traveler@{block.promptHost || 'ether'} ~$
                </span>{' '}
                <span>{block.text}</span>
              </div>
            ) : (
              <div key={block.id} className="ether-block-wrap">
                <pre className="ether-line ether-line--out">
                  <AnsiRichText text={block.text} onRunCommand={runLine} />
                </pre>
                <button
                  type="button"
                  className="ether-copy-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    void copyBlock(block)
                  }}
                  title="Copy plain text"
                >
                  {copiedBlockId === block.id ? 'copied' : 'copy'}
                </button>
              </div>
            ),
          )}

          {busyLabel ? (
            <div className="ether-busy-bar" role="status" aria-live="polite">
              <span className="ether-busy-dot" />
              <span>{busyLabel}</span>
              <button
                type="button"
                className="ether-head-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleInterrupt()
                }}
              >
                stop
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Dynamic Contextual Follow-Up Trail */}
      {!activeWorld && suggestions.length > 0 ? (
        <div className="ether-next-rail" aria-label="Suggested next commands">
          <span className="ether-next-rail__label">next →</span>
          <div className="ether-next-rail__items">
            {suggestions.map((item) => (
              <button
                key={`${item.label}:${item.command}`}
                type="button"
                className="ether-next-chip"
                onClick={() => runLine(item.command)}
                title={item.command}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Live Interactive Input Bar with Ghost Autocomplete */}
      <form className="ether-input-bar" onSubmit={handleSubmit}>
        <span className="ether-input-bar__prompt">{promptPrefix}</span>
        <div className="ether-input-wrap">
          {ghostHint ? (
            <div className="ether-input-ghost" aria-hidden="true">
              <span className="ether-input-ghost__typed">{inputValue}</span>
              <span className="ether-input-ghost__hint">{ghostHint}</span>
            </div>
          ) : null}
          <input
            ref={inputRef}
            type="text"
            className="ether-input-bar__field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="ask Shaan's model anything, or type `tour`, `research`, `eprocess compare`, `travel universal`..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Sandboxed terminal command or personal model prompt"
          />
        </div>
        <button type="submit" className="ether-input-bar__send">
          run ↵
        </button>
      </form>
    </div>
  )
}
