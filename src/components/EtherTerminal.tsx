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
  WORLD_DEFAULT_NOTES,
  getWorldEpochPhase,
  getWorldHud,
  getWorldScrubberSpec,
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
  uptime_s?: number
  active_sessions?: number
  max_sessions?: number
  model?: string
  fts_chunks?: number
  manifests_mounted?: boolean
}

const PENDING_CMD_STORAGE_KEY = 'spatel_pending_cmd'
const HEALTH_POLL_URL = 'https://term.shaan4d.xyz/health'

type TerminalBlock = {
  id: number
  kind: 'command' | 'output'
  text: string
  promptHost?: string
}

type NarrationState = {
  text: string
  epoch: string
  model: string
  streaming: boolean
}

const DEFAULT_PROD_WS = 'wss://term.shaan4d.xyz/ws'
const BACKUP_PROD_WS = 'wss://raspberrypi.taila980b4.ts.net/spatel-terminal'
const WS_STORAGE_KEY = 'spatel_rpi5_ws_url_v2'

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
  { label: 'verify receipts', command: 'verify' },
  { label: 'search corpus', command: 'search QR nullspace replay KL' },
  { label: '5-stop tour', command: 'tour' },
  { label: 'research archive', command: 'research' },
  { label: 'psychohistory v2', command: 'psychohistory' },
  { label: 'kailas mandala', command: 'kailas' },
  { label: 'honest nulls', command: 'nulls' },
  { label: 'e-process compare', command: 'eprocess compare' },
  { label: 'qr nullspace', command: 'qrproj' },
  { label: 'essays', command: 'essays' },
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
  const [scrubberPhase, setScrubberPhase] = useState<number | null>(null)
  const [worldPresence, setWorldPresence] = useState<Record<string, number>>({})
  const [narration, setNarration] = useState<NarrationState>({
    text: WORLD_DEFAULT_NOTES.universal,
    epoch: '',
    model: 'field note',
    streaming: false,
  })
  const [hudText, setHudText] = useState(() =>
    getWorldHud('universal', { yaw: 0, pitch: 0, zoom: 1, time: 0 }),
  )

  const wsRef = useRef<WebSocket | null>(null)
  const connectRef = useRef<((url: string, silent?: boolean, allowBackup?: boolean) => void) | null>(null)
  const manualDisconnectRef = useRef(false)
  const reconnectTimerRef = useRef<number | null>(null)
  const narrateTimerRef = useRef<number | null>(null)
  const lastNarratedKeyRef = useRef<string>('')
  const activeWorldRef = useRef<WorldId | null>(null)
  const nextIdRef = useRef(2)
  const streamBlockIdRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const stickToBottomRef = useRef(true)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<EtherFieldRenderer | null>(null)
  const camRef = useRef<WorldCamera>({ yaw: 0, pitch: 0.12, zoom: 1, time: 0, epochPhase: null })
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
    setScrubberPhase(null)
    lastNarratedKeyRef.current = ''
    camRef.current = { yaw: 0, pitch: 0.12, zoom: 1, time: 0, epochPhase: null }
    setHudText(getWorldHud(worldId, camRef.current))
    setNarration({
      text: WORLD_DEFAULT_NOTES[worldId],
      epoch: meta.span,
      model: 'field note',
      streaming: false,
    })
  }, [])

  const requestNarration = useCallback(
    (worldId: WorldId, epoch: string, coords: string, force = false) => {
      const key = `${worldId}|${epoch}`
      if (!force && lastNarratedKeyRef.current === key) return
      lastNarratedKeyRef.current = key

      const scrubber = getWorldScrubberSpec(worldId)
      let offlineNote = WORLD_DEFAULT_NOTES[worldId]
      if (scrubber) {
        const epMatch = scrubber.epochs.find((e) => epoch.includes(e.label))
        if (epMatch) offlineNote = epMatch.note
      }

      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'narrate', world: worldId, epoch, coords }))
      } else {
        setNarration({
          text: offlineNote,
          epoch,
          model: 'field note',
          streaming: false,
        })
      }
    },
    [],
  )

  const handleScrubPhase = useCallback((phase: number | null) => {
    setScrubberPhase(phase)
    camRef.current.epochPhase = phase
    if (activeWorldRef.current) {
      setHudText(getWorldHud(activeWorldRef.current, camRef.current))
    }
  }, [])

  const stepScrubEpoch = useCallback(
    (delta: number) => {
      const worldId = activeWorldRef.current
      if (!worldId) return
      const spec = getWorldScrubberSpec(worldId)
      if (!spec) return
      const curPhase = getWorldEpochPhase(worldId, camRef.current)
      const curIdx = Math.min(spec.epochs.length - 1, Math.floor(curPhase * spec.epochs.length))
      const nextIdx = Math.max(0, Math.min(spec.epochs.length - 1, curIdx + delta))
      const targetPhase = (nextIdx + 0.5) / spec.epochs.length
      handleScrubPhase(targetPhase)
    },
    [handleScrubPhase],
  )

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
    setWorldPresence({})
  }, [clearReconnectTimer])

  const connectToEndpoint = useCallback(
    (targetUrl: string, silent = false, allowBackup = false) => {
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
        if (allowBackup && targetUrl !== BACKUP_PROD_WS) {
          connectRef.current?.(BACKUP_PROD_WS, silent, false)
          return
        }
        setConnState('fallback')
        return
      }
      wsRef.current = ws

      const failoverOrFallback = () => {
        if (allowBackup && targetUrl !== BACKUP_PROD_WS && !manualDisconnectRef.current) {
          connectRef.current?.(BACKUP_PROD_WS, silent, false)
          return
        }
        setConnState('fallback')
        if (!silent) {
          appendBlock(
            'output',
            `\x1b[38;2;138;134;126mRPi5 endpoint unreachable (${targetUrl}); instant local sandbox active.\x1b[0m\n`,
          )
        }
      }

      const timeoutId = window.setTimeout(() => {
        if (!settled && ws.readyState !== WebSocket.OPEN) {
          settled = true
          try {
            ws.close()
          } catch {
            /* ignore */
          }
          failoverOrFallback()
        }
      }, 2600)

      ws.onopen = () => {
        settled = true
        wasLive = true
        window.clearTimeout(timeoutId)
        setConnState('live')
        streamBlockIdRef.current = null
        ws.send(JSON.stringify({ type: 'resize', cols: 96, rows: 28 }))
        if (activeWorldRef.current) {
          ws.send(JSON.stringify({ type: 'world_presence', world: activeWorldRef.current }))
        }
      }

      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') return
        try {
          const msg = JSON.parse(event.data) as {
            type?: string
            data?: unknown
            world?: string
            epoch?: string
            model?: string
            worlds?: Record<string, number>
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
          } else if (msg.type === 'presence' && msg.worlds && typeof msg.worlds === 'object') {
            setWorldPresence(msg.worlds)
          } else if (msg.type === 'narration_start') {
            if (!msg.world || msg.world === activeWorldRef.current) {
              setNarration({
                text: '',
                epoch: msg.epoch || '',
                model: msg.model || 'shaanpatel-cv-pico',
                streaming: true,
              })
            }
          } else if (msg.type === 'narration_chunk' && typeof msg.data === 'string') {
            if (!msg.world || msg.world === activeWorldRef.current) {
              setNarration((prev) => ({
                ...prev,
                text: prev.text + msg.data,
                streaming: true,
              }))
            }
          } else if (msg.type === 'narration_end') {
            if (!msg.world || msg.world === activeWorldRef.current) {
              setNarration((prev) => ({ ...prev, streaming: false }))
            }
          }
        } catch {
          appendStreamChunk(event.data)
        }
      }

      ws.onerror = () => {
        if (!settled) {
          settled = true
          window.clearTimeout(timeoutId)
          failoverOrFallback()
        }
      }

      ws.onclose = () => {
        window.clearTimeout(timeoutId)
        if (wsRef.current === ws) {
          wsRef.current = null
          setBusyLabel(null)
          setConnState('fallback')
          setTelemetry(null)
          setWorldPresence({})
          if (wasLive && !manualDisconnectRef.current) {
            reconnectTimerRef.current = window.setTimeout(() => {
              connectRef.current?.(targetUrl, true, true)
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
    const initial = getInitialWsUrl()
    const timerId = window.setTimeout(() => {
      connectToEndpoint(initial, true, initial === DEFAULT_PROD_WS)
    }, 0)
    return () => {
      window.clearTimeout(timerId)
      manualDisconnectRef.current = true
      disconnectSocket()
    }
  }, [connectToEndpoint, disconnectSocket])

  // Poll /health on mount & every 60s so Pi 5 temp, FTS chunk count, and manifest badge stay live
  useEffect(() => {
    let cancelled = false
    const pollHealth = async () => {
      try {
        const res = await fetch(HEALTH_POLL_URL, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as Telemetry
        if (!cancelled && data && typeof data === 'object') {
          setTelemetry((prev) => ({ ...(prev ?? {}), ...data }))
        }
      } catch {
        /* ignore offline/CORS errors */
      }
    }
    void pollHealth()
    const iv = window.setInterval(() => void pollHealth(), 60000)
    return () => {
      cancelled = true
      window.clearInterval(iv)
    }
  }, [])

  // Auto-execute queued deep-link command (e.g. from ResearchPage "Verify live on Pi 5" or ?run=...)
  const pendingCmdRef = useRef<string | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    let cmd: string | null = null
    try {
      cmd = window.sessionStorage.getItem(PENDING_CMD_STORAGE_KEY)
      if (cmd) window.sessionStorage.removeItem(PENDING_CMD_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    if (!cmd) {
      const q = new URLSearchParams(window.location.search).get('run')?.trim()
      if (q) cmd = q
    }
    if (cmd) {
      pendingCmdRef.current = cmd
      window.setTimeout(() => {
        document.getElementById('install')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
    }
  }, [])

  // Sync anonymous world traveler presence with RPi5 whenever entering/switching/exiting a world
  useEffect(() => {
    activeWorldRef.current = activeWorld
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'world_presence', world: activeWorld }))
    }
  }, [activeWorld])

  // Debounced live narration stream from shaanpatel-cv-pico as you enter or scrub epochs
  useEffect(() => {
    if (narrateTimerRef.current !== null) {
      window.clearTimeout(narrateTimerRef.current)
      narrateTimerRef.current = null
    }
    if (!activeWorld) return
    const epoch = hudText.epoch
    const coords = hudText.coords
    const delayMs = lastNarratedKeyRef.current === '' ? 160 : 480
    narrateTimerRef.current = window.setTimeout(() => {
      requestNarration(activeWorld, epoch, coords)
    }, delayMs)
    return () => {
      if (narrateTimerRef.current !== null) {
        window.clearTimeout(narrateTimerRef.current)
        narrateTimerRef.current = null
      }
    }
  }, [activeWorld, hudText.epoch, hudText.coords, connState, requestNarration])

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

  useEffect(() => {
    const pending = pendingCmdRef.current
    if (!pending) return
    if (connState === 'live') {
      pendingCmdRef.current = null
      const t = window.setTimeout(() => runLine(pending), 120)
      return () => window.clearTimeout(t)
    }
    if (connState === 'fallback') {
      const t = window.setTimeout(() => {
        if (pendingCmdRef.current) {
          const c = pendingCmdRef.current
          pendingCmdRef.current = null
          runLine(c)
        }
      }, 1400)
      return () => window.clearTimeout(t)
    }
  }, [connState, runLine])

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
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        const hud = getWorldHud(activeWorld, camRef.current)
        requestNarration(activeWorld, hud.epoch, hud.coords, true)
      } else if (e.key === '[' || e.key === 'ArrowLeft') {
        if (getWorldScrubberSpec(activeWorld)) {
          e.preventDefault()
          stepScrubEpoch(-1)
        }
      } else if (e.key === ']' || e.key === 'ArrowRight') {
        if (getWorldScrubberSpec(activeWorld)) {
          e.preventDefault()
          stepScrubEpoch(1)
        }
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
  }, [activeWorld, openWorld, requestNarration, runLine, stepScrubEpoch])

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

  const healthSummary = useMemo(() => {
    if (!telemetry) return null
    const parts: string[] = []
    if (telemetry.manifests_mounted) parts.push('6/6 receipts')
    if (typeof telemetry.fts_chunks === 'number' && telemetry.fts_chunks > 0) {
      parts.push(`${telemetry.fts_chunks.toLocaleString()} FTS`)
    }
    return parts.length > 0 ? parts.join(' · ') : null
  }, [telemetry])

  const healthTitle = useMemo(() => {
    if (!telemetry) return 'Live Raspberry Pi 5 telemetry'
    const upMin = typeof telemetry.uptime_s === 'number' ? Math.floor(telemetry.uptime_s / 60) : null
    const sess =
      typeof telemetry.active_sessions === 'number' && typeof telemetry.max_sessions === 'number'
        ? `${telemetry.active_sessions}/${telemetry.max_sessions} sessions`
        : null
    return [
      telemetry.model || 'shaanpatel-cv-pico',
      upMin != null ? `up ${upMin}m` : null,
      sess,
    ]
      .filter(Boolean)
      .join(' · ')
  }, [telemetry])

  return (
    <div
      className={`ether-terminal${expanded ? ' is-expanded' : ''}`}
      aria-label="Live sandboxed RPi5 personal model terminal and multidimensional ASCII worlds"
    >
      {/* Top Bar */}
      <div className="ether-terminal__head">
        <div className="ether-terminal__brand">
          <span className="ether-terminal__title">spatel · ether harness</span>
          <button
            type="button"
            className={`ether-status-pill is-${connState}`}
            onClick={() => setShowEndpointBar((v) => !v)}
            title="Configure or reconnect Raspberry Pi 5 WebSocket tunnel"
          >
            {statusBadge}
          </button>
          {healthSummary ? (
            <button
              type="button"
              className="ether-head-btn"
              onClick={() => runLine('verify')}
              title={`${healthTitle} — click to run live receipt verification`}
            >
              {healthSummary}
            </button>
          ) : null}
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
            placeholder="wss://term.shaan4d.xyz/ws"
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
            ? WORLD_CATALOG.map((w) => {
                const count = worldPresence[w.id] || 0
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`terminal-prompt-chip terminal-prompt-chip--world${activeWorld === w.id ? ' is-active' : ''}`}
                    onClick={() => openWorld(w.id)}
                    title={`${w.name} (${w.span})`}
                  >
                    ✦ {w.shortLabel}
                    {count > 0 ? <span className="ether-world-count">· {count}</span> : null}
                  </button>
                )
              })
            : null}
        </div>
      </div>

      {/* Main Viewport: High-Res World Portal OR Interactive Rich ANSI Shell */}
      {activeWorld && activeWorldMeta ? (() => {
        const scrubber = getWorldScrubberSpec(activeWorld)
        const activePhase = scrubber
          ? (scrubberPhase ?? hudText.epochPhase ?? 0)
          : 0
        const activeEpochIdx = scrubber
          ? Math.min(scrubber.epochs.length - 1, Math.floor(activePhase * scrubber.epochs.length))
          : 0
        const travelersHere = worldPresence[activeWorld] || (connState === 'live' ? 1 : 0)
        return (
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
                    {travelersHere > 0 ? (
                      <span className="ether-portal__presence">
                        {' '}· ● {travelersHere} {travelersHere === 1 ? 'traveler' : 'travelers'} in {activeWorldMeta.id}
                      </span>
                    ) : null}
                  </span>
                  <strong>{activeWorldMeta.name}</strong>
                </div>
                <div className="ether-portal__telemetry">
                  <span>{hudText.epoch}</span>
                  <span>{hudText.coords}</span>
                </div>
              </div>

              <div className="ether-portal__bottom-stack">
                {/* Interactive Epoch Scrubber for Universal History & Psychohistory */}
                {scrubber ? (
                  <div className="ether-portal__scrubber" role="group" aria-label="Epoch scrubber">
                    <span className="ether-scrubber__edge">{scrubber.minLabel}</span>
                    <input
                      type="range"
                      min={0}
                      max={999}
                      value={Math.round(activePhase * 999)}
                      onChange={(e) => handleScrubPhase(Number(e.target.value) / 999)}
                      className="ether-scrubber__range"
                      aria-label={`Scrub ${activeWorldMeta.name} epochs`}
                    />
                    <span className="ether-scrubber__edge">{scrubber.maxLabel}</span>
                    <div className="ether-scrubber__ticks">
                      {scrubber.epochs.map((ep, idx) => (
                        <button
                          key={ep.label}
                          type="button"
                          className={`ether-scrubber__tick${idx === activeEpochIdx ? ' is-active' : ''}`}
                          onClick={() => handleScrubPhase((idx + 0.5) / scrubber.epochs.length)}
                          title={`${ep.label} (${ep.time})`}
                        >
                          {ep.shortLabel}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={`ether-hud-btn${scrubberPhase === null ? ' is-ask' : ''}`}
                      onClick={() => handleScrubPhase(scrubberPhase === null ? activePhase : null)}
                      title="Toggle automatic epoch drift vs locked scrub coordinate"
                    >
                      {scrubberPhase === null ? 'auto' : 'locked'}
                    </button>
                  </div>
                ) : null}

                {/* Split Live Narration Ticker + World Controls */}
                <div className="ether-portal__hud ether-portal__hud--bottom">
                  <div className="ether-portal__ticker" aria-live="polite">
                    <span className={`ether-ticker__tag${narration.streaming ? ' is-streaming' : ''}`}>
                      <span className="ether-ticker__dot" />
                      {narration.model}
                    </span>
                    <span className="ether-ticker__text">
                      {narration.text || activeWorldMeta.caption}
                    </span>
                    <button
                      type="button"
                      className="ether-ticker__refresh"
                      onClick={() =>
                        requestNarration(activeWorld, hudText.epoch, hudText.coords, true)
                      }
                      title="Stream fresh field note from shaanpatel-cv-pico ([n])"
                    >
                      [n]
                    </button>
                  </div>

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
                      [i] ask
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
        )
      })() : (
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
