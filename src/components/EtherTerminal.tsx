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
  SHELL_COMMANDS,
  executeLocalCommand,
  parseAnsi,
  resolveWorldId,
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

const QUICK_PROMPTS: { id: string; label: string; command: string }[] = [
  {
    id: 'containment',
    label: 'formal containment',
    command: 'How do you keep untrusted agent proposers from executing unsafe actions?',
  },
  {
    id: 'holdout',
    label: 'holdout certificates',
    command: 'How do you keep RSI loops from overfitting their judge?',
  },
  {
    id: 'nulls',
    label: 'honest nulls',
    command: 'nulls',
  },
  {
    id: 'psychohistory-data',
    label: 'psychohistory v2',
    command: 'psychohistory',
  },
  {
    id: 'eprocess',
    label: 'e-process sim',
    command: 'eprocess signal',
  },
  {
    id: 'qrproj',
    label: 'qr nullspace',
    command: 'qrproj',
  },
]

const WELCOME_BANNER =
  '\x1b[1m\x1b[38;2;223;208;178mSPATEL // ETHER SANDBOX\x1b[0m  ' +
  '\x1b[38;2;138;134;126m(personal model · research archive · multidimensional ASCII portals)\x1b[0m\n' +
  '\x1b[38;2;220;216;206mAsk any question directly in real time, run \x1b[38;2;223;208;178mhelp\x1b[38;2;220;216;206m / \x1b[38;2;223;208;178mresearch\x1b[38;2;220;216;206m / \x1b[38;2;223;208;178meprocess\x1b[38;2;220;216;206m,\n' +
  'or step into a high-res world with \x1b[38;2;132;204;224mtravel universal\x1b[38;2;220;216;206m or any \x1b[38;2;126;214;168m✦ portal\x1b[38;2;220;216;206m chip above.\x1b[0m\n'

function AnsiText({ text }: { text: string }) {
  const spans = useMemo(() => parseAnsi(text), [text])
  return (
    <>
      {spans.map((span, idx) => (
        <span
          key={idx}
          style={{
            color: span.color,
            fontWeight: span.bold ? 600 : undefined,
            opacity: span.dim ? 0.65 : undefined,
          }}
        >
          {span.text}
        </span>
      ))}
    </>
  )
}

export function EtherTerminal() {
  const [wsUrl, setWsUrl] = useState<string>(getInitialWsUrl)
  const [endpointDraft, setEndpointDraft] = useState<string>(getInitialWsUrl)
  const [showEndpointBar, setShowEndpointBar] = useState(false)
  const [connState, setConnState] = useState<ConnectionState>('fallback')
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [expanded, setExpanded] = useState(false)

  const [blocks, setBlocks] = useState<TerminalBlock[]>([
    { id: 1, kind: 'output', text: WELCOME_BANNER },
  ])
  const [inputValue, setInputValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState<number>(-1)

  // High-resolution multidimensional ASCII world portal state
  const [activeWorld, setActiveWorld] = useState<WorldId | null>(null)
  const [renderMode, setRenderMode] = useState<RenderMode>('braille')
  const [palette, setPalette] = useState<PaletteId>('obsidian')
  const [paused, setPaused] = useState(false)
  const [showHud, setShowHud] = useState(true)
  const [hudText, setHudText] = useState(() =>
    getWorldHud('universal', { yaw: 0, pitch: 0, zoom: 1, time: 0 }),
  )

  const wsRef = useRef<WebSocket | null>(null)
  const nextIdRef = useRef(2)
  const streamBlockIdRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
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

  const appendBlock = useCallback(
    (kind: 'command' | 'output', text: string, promptHost?: string) => {
      const id = nextIdRef.current++
      streamBlockIdRef.current = kind === 'output' ? id : null
      setBlocks((prev) => [...prev.slice(-80), { id, kind, text, promptHost }])
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
      return [...prev.slice(-80), { id, kind: 'output', text: chunk }]
    })
  }, [])

  const openWorld = useCallback((worldId: WorldId) => {
    const meta = WORLD_BY_ID[worldId]
    setActiveWorld(worldId)
    setPalette(meta.defaultPalette)
    setPaused(false)
    camRef.current = { yaw: 0, pitch: 0.12, zoom: 1, time: 0 }
  }, [])

  const disconnectSocket = useCallback(() => {
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
    setConnState('fallback')
    setTelemetry(null)
  }, [])

  const connectToEndpoint = useCallback(
    (targetUrl: string, silent = false) => {
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
              `\x1b[38;2;138;134;126mRPi5 endpoint unreachable (${targetUrl}) — running in instant local sandbox mode.\x1b[0m\n`,
            )
          }
        }
      }, 2200)

      ws.onopen = () => {
        settled = true
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
          }
          if (msg.type === 'ansi' && typeof msg.data === 'string') {
            appendStreamChunk(msg.data)
          } else if (msg.type === 'clear') {
            streamBlockIdRef.current = null
            setBlocks([])
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
          setConnState('fallback')
          setTelemetry(null)
        }
      }
    },
    [appendBlock, appendStreamChunk, disconnectSocket, openWorld],
  )

  // Auto-dial RPi5 on mount (silent fast fallback to local sandbox if offline)
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      connectToEndpoint(getInitialWsUrl(), true)
    }, 0)
    return () => {
      window.clearTimeout(timerId)
      disconnectSocket()
    }
  }, [connectToEndpoint, disconnectSocket])

  // Auto-scroll transcript to bottom on new output
  useEffect(() => {
    const el = scrollRef.current
    if (el && !activeWorld) {
      el.scrollTop = el.scrollHeight
    }
  }, [blocks, activeWorld])

  // Lock body scroll when fullscreen theater mode is active
  useEffect(() => {
    if (!expanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [expanded])

  const runLine = useCallback(
    (rawLine: string) => {
      const line = rawLine.trim()
      if (!line) return

      setActiveWorld(null)
      setHistory((prev) => [line, ...prev.filter((item) => item !== line)].slice(0, 60))
      setHistoryIdx(-1)

      const promptHost = connState === 'live' ? telemetry?.node || 'rpi5' : 'sandbox'
      appendBlock('command', line, promptHost)
      streamBlockIdRef.current = null

      // Client-local connection commands always run locally
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
        disconnectSocket()
        appendBlock(
          'output',
          '\x1b[38;2;138;134;126mDisconnected from RPi5 socket. Local grounded sandbox active.\x1b[0m\n',
        )
        return
      }

      // Live RPi5 path over WebSocket
      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', line }))
        return
      }

      // Seamless in-browser grounded sandbox fallback
      const res = executeLocalCommand(line, wsUrl)
      if (res.clear) {
        setBlocks([])
        return
      }
      if (res.ansi) {
        appendBlock('output', res.ansi)
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
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const cur = inputValue.trim().toLowerCase()
      if (!cur) return
      const parts = cur.split(/\s+/)
      if (parts.length === 1) {
        const hit = SHELL_COMMANDS.find((c) => c.startsWith(parts[0]))
        if (hit) setInputValue(hit === 'travel' || hit === 'ask' ? `${hit} ` : hit)
      } else if (parts[0] === 'travel' || parts[0] === 'enter' || parts[0] === 'portal') {
        const hit = WORLD_CATALOG.find((w) => w.id.startsWith(parts[1]))
        if (hit) setInputValue(`${parts[0]} ${hit.id}`)
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setBlocks([])
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'interrupt' }))
      }
      appendBlock('output', '\x1b[38;2;138;134;126m^C\x1b[0m\n')
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
  }, [activeWorld, openWorld])

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
      if (dt < 0.028) return // ~33fps crisp cadence
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
      ? `● live · ${telemetry?.node || 'rpi5'}${telemetry?.cpu_temp_c != null ? ` ${telemetry.cpu_temp_c}°C` : ''}`
      : connState === 'connecting'
        ? '◐ dialing rpi5…'
        : '○ local sandbox · rpi5 ready'

  return (
    <div
      className={`ether-terminal${expanded ? ' is-expanded' : ''}`}
      aria-label="Live sandboxed RPi5 personal model terminal and multidimensional ASCII worlds"
    >
      {/* Top Bar */}
      <div className="ether-terminal__head">
        <div className="ether-terminal__brand">
          <span className="ether-terminal__title">spatel — sandboxed ether terminal</span>
          <button
            type="button"
            className={`ether-status-pill is-${connState}`}
            onClick={() => setShowEndpointBar((v) => !v)}
            title="Click to configure or reconnect Raspberry Pi 5 WebSocket tunnel"
          >
            {statusBadge}
          </button>
        </div>

        <div className="ether-terminal__actions">
          {activeWorld ? (
            <button
              type="button"
              className="ether-head-btn"
              onClick={() => {
                setActiveWorld(null)
                window.setTimeout(() => inputRef.current?.focus(), 30)
              }}
            >
              ← prompt
            </button>
          ) : null}
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
                disconnectSocket()
                setShowEndpointBar(false)
              }}
            >
              disconnect
            </button>
          ) : null}
        </form>
      ) : null}

      {/* Quick-Launch Chips: Personal Model + Research + High-Res ASCII Worlds */}
      <div className="ether-chips" role="toolbar" aria-label="Personal model prompts and ASCII worlds">
        <div className="ether-chips__row">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="terminal-prompt-chip"
              onClick={() => runLine(item.command)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="ether-chips__row ether-chips__row--worlds">
          {WORLD_CATALOG.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`terminal-prompt-chip terminal-prompt-chip--world${activeWorld === w.id ? ' is-active' : ''}`}
              onClick={() => openWorld(w.id)}
              title={`${w.name} — ${w.span}`}
            >
              ✦ {w.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport: Either High-Res ASCII World Portal OR Interactive Shell */}
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
                    WORLD 0{activeWorldMeta.index} / 08 · {renderMode.toUpperCase()}
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
          onClick={() => inputRef.current?.focus()}
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
              <pre key={block.id} className="ether-line ether-line--out">
                <AnsiText text={block.text} />
              </pre>
            ),
          )}
        </div>
      )}

      {/* Live Interactive Input Bar */}
      <form className="ether-input-bar" onSubmit={handleSubmit}>
        <span className="ether-input-bar__prompt">{promptPrefix}</span>
        <input
          ref={inputRef}
          type="text"
          className="ether-input-bar__field"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="ask Shaan's model anything, or type `worlds`, `travel universal`, `eprocess`, `help`..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Sandboxed terminal command or personal model prompt"
        />
        <button type="submit" className="ether-input-bar__send">
          run ↵
        </button>
      </form>
    </div>
  )
}
