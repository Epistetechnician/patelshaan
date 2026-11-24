import { useState } from 'react'

type ManifestBundle = {
  sha256: string
  bytes: number
  sources?: { path: string; scope?: string; sha256: string }[]
}

const SLUG_TO_BUNDLE: Record<string, { file: string; label: string; ed25519?: string }> = {
  'arc-membrane': {
    file: 'arc-membrane.json',
    label: '400 sealed A100 MATH-500 rows + Track 4/5 manifests',
    ed25519: '37acf77cad8cdc1b',
  },
  'holdout-ledger': {
    file: 'holdout-eprocess.json',
    label: '238 Gemma-4 SWE trajectories + 59,200 confirmatory runs',
  },
  'mech-interp-unified': {
    file: 'mech-interp-audit.json',
    label: '16 real MPS/GPU claims (Qwen3-1.7B + Qwen2.5-0.5B) + 400 H100 J-space prompts',
  },
  'theseus-lab': {
    file: 'theseus-real.json',
    label: '27 adaptation-coverage cases (N=128/256/512) + V39 Jacobians',
  },
  'temporal-grid-safety': {
    file: 'temporal-grid-real.json',
    label: '18 per-seed curves across OLMo-2-7B, Qwen3-8B, Mistral-7B',
  },
  'sacred-geography-kailas': {
    file: 'kailas-two-clock.json',
    label: '48 Thubron kora episodes + Two-Clock MDL corpus receipts',
  },
  'hsi-lab': {
    file: 'hsi-real.json',
    label: '13 deterministic experiment receipts (E1–E10)',
  },
  caduceus: {
    file: 'caduceus-real.json',
    label: '40-cluster skill evaluation + containment ledger',
  },
  playbox: {
    file: 'playbox-real.json',
    label: 'H100 Qwen3-30B-FP8 KV-cache/RAG bench + E8 hub sweep',
  },
  formasec: {
    file: 'formasec-real.json',
    label: 'M1–M6 Py/Rs/Lean audit + 44 fuzz seeds + 450 kernel traces',
  },
  'security-alignment-os': {
    file: 'secalign-real.json',
    label: '279 real Rust tests grouped by adversarial module',
  },
  hyperintel: {
    file: 'hyperintel-real.json',
    label: '114 real Rust tests + V1–V4 offline evidence fixture digests',
  },
  'composed-zk-benchmark-os': {
    file: 'zkbench-real.json',
    label: '1,107 real Rust tests + adversarial mutation counts',
  },
  'aligned-holistic-continual-learning': {
    file: 'ahcl-real.json',
    label: 'Synthetic 4-target R², shuffled controls & prediction-lock digest',
  },
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const hashBuf = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function ReceiptVerifier({ slug }: { slug: string }) {
  const entry = SLUG_TO_BUNDLE[slug]
  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'running' }
    | { status: 'ok'; sha256: string; bytes: number; sourceCount: number; ms: number }
    | { status: 'error'; message: string }
  >({ status: 'idle' })

  if (!entry) return null

  const verify = async () => {
    setState({ status: 'running' })
    const t0 = performance.now()
    try {
      const [bundleRes, manifestRes] = await Promise.all([
        fetch(`/viz-data/${entry.file}`),
        fetch('/viz-data/viz-manifest.json'),
      ])
      if (!bundleRes.ok || !manifestRes.ok) {
        throw new Error('Could not fetch bundle or manifest')
      }
      const [buf, manifest] = await Promise.all([
        bundleRes.arrayBuffer(),
        manifestRes.json() as Promise<{ bundles: Record<string, ManifestBundle> }>,
      ])
      const actual = await sha256Hex(buf)
      const expected = manifest.bundles?.[entry.file]
      if (!expected) throw new Error(`Bundle ${entry.file} missing from viz-manifest.json`)
      if (actual !== expected.sha256) {
        throw new Error(`Digest mismatch: got ${actual.slice(0, 12)}, expected ${expected.sha256.slice(0, 12)}`)
      }
      setState({
        status: 'ok',
        sha256: actual,
        bytes: buf.byteLength,
        sourceCount: expected.sources?.length ?? 0,
        ms: Math.max(1, Math.round(performance.now() - t0)),
      })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'WebCrypto verification failed',
      })
    }
  }

  return (
    <div className="receipt-verifier">
      <div className="receipt-verifier__head">
        <div>
          <span className="demo-tag">webcrypto</span>
          <strong>Offline dataset integrity check</strong>
          <span className="receipt-verifier__sub"> — {entry.label}</span>
        </div>
        <button type="button" onClick={verify} disabled={state.status === 'running'}>
          {state.status === 'running' ? 'Hashing…' : state.status === 'ok' ? 'Re-verify SHA-256' : 'Verify SHA-256 in browser'}
        </button>
      </div>
      <div className="receipt-verifier__meta">
        <code>/viz-data/{entry.file}</code>
        {entry.ed25519 ? <code>ed25519:{entry.ed25519}…</code> : null}
        {state.status === 'ok' ? (
          <span className="receipt-verifier__ok">
            ✓ SHA-256 matched <code>{state.sha256.slice(0, 16)}…</code> ({state.bytes.toLocaleString()} B, {state.sourceCount} pinned source artifacts, {state.ms} ms)
          </span>
        ) : state.status === 'error' ? (
          <span className="receipt-verifier__err">✗ {state.message}</span>
        ) : (
          <span className="receipt-verifier__idle">
            Computes live <code>crypto.subtle.digest(&apos;SHA-256&apos;)</code> against <code>viz-manifest.json</code>.
          </span>
        )}
      </div>
    </div>
  )
}
