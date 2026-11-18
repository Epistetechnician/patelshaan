import type { Essay } from './essays'
import type { ThreadId } from './humanities'

/*
 * A field strand is computational humanities and cultural inquiry: open-license
 * corpora, pre-registered coding protocols, and scholar handoff instruments
 * subject to the same claim-ceiling rules as the software repositories.
 */

export type FieldStrand = {
  slug: string
  kind: 'field'
  name: string
  tagline: string
  status: string
  question: string
  headline: string
  notShown: string
  results: { value: string; label: string }[]
  limits: string[]
  threads: ThreadId[]
  shelf: string[]
  epigraph?: { text: string; by: string }
  people: string
  essay: Essay
  sources: { label: string; url: string; why: string }[]
}

export const kailas: FieldStrand = {
  slug: 'sacred-geography-kailas',
  kind: 'field',
  name: 'Sacred Geography as Multi-Temporal Structure',
  tagline: 'A mountain walked round by four traditions, a 15-language corpus null, and a 20-account pilgrimage test showing where two-clock notation actually fits.',
  status: 'Concluded on open data (Nov 2026); open-license code, statistics, and blinded Tibetan/Bon & Sanskrit scholar handoff packs live in Epistetechnician/kailas-corpus.',
  question:
    'Do texts about Mount Kailas discuss multi-temporal ideas more than comparable sacred texts, and do pilgrim narratives contain decoupled temporal structure that complex-time (`kime`) notation captures where plain `(lap, progress)` fails?',
  headline:
    'Both pre-registered tests returned nulls on Kailas: across 2,362 blind-labeled passages, Kailas texts discuss multi-temporal ideas no more (and in English and Chinese, less) than religion controls; across 195 coded pilgrim episodes (α = 0.82), only 5.6% decouple interpretive time from route progress (below the 10% bar), concentrated in Hajj and Holy Land ritual-calendar accounts (14.7%) rather than Kailas (1.3%).',
  notShown:
    'Nothing about what the Tibetan, Bon, or Sanskrit traditions hold in full. Open Tibetan texts rarely name Kailas (46 passages), core Bon canons remain in un-OCRed scans, copyrighted modern accounts (Thubron, Govinda) are excluded, and current labels are model-rated pending our blinded scholar handoff.',
  results: [
    { value: '2,362', label: 'blind-labeled passages across 15+ languages (574 Sanskrit: null −3.4)' },
    { value: '195 (α = 0.82)', label: 'coded pilgrim-account episodes across 20 books, reproducible dual-coder agreement' },
    { value: '5.6% vs 10%', label: 'pooled decoupled episodes (7 / 124), missing the pre-registered kime threshold' },
    { value: '14.7% vs 1.3%', label: 'decoupled ritual-calendar share in Hajj/Holy Land comparison vs Kailas accounts' },
  ],
  limits: [
    'Raters and episode coders are models; high inter-coder agreement (α = 0.82) shows rubric reproducibility, not cultural validity.',
    'Open Tibetan/Bon coverage is thin (46 Kailas passages across 206 CC0 texts; ~11 occurrences of Gangs Ti se), and core Bon texts (Zhang Zhung Nyan Gyud, Gzer mig) exist mostly as scans.',
    'Source and genre mix differ between Kailas travel/history books and scriptural religion controls.',
    '`clock = independent` in the coding study is a discrete proxy for φ ≠ 2πr rather than a continuous phase measurement.',
    'Modern first-person Kailas accounts (Thubron, Govinda, Thurman & Wise) are under copyright and excluded from the public coding sample.',
  ],
  threads: ['sacred', 'failure', 'measure'],
  shelf: ['eliadeSacred', 'eliadeReturn', 'turner', 'tuan', 'geertz', 'kawaguchi', 'burton', 'thubron', 'thurmanWise', 'govinda', 'mckay', 'spacekime'],
  people:
    'The pilgrims whose accounts became data, and the readers of Tibetan, Bon, Sanskrit, and comparative liturgy who can check what model coders missed. Blinded handoff sheets (115 Tibetan/Bon rows, 233 Sanskrit rows, and a 40-episode human double-coding pack) are built and ready to send.',
  essay: {
    callout:
      'A mathematical notation can look profound without earning its degrees of freedom. This study pre-registered two ways for complex time (`kime`) to fail on Kailas—both failed—and in failing pointed to where two-clock structure actually lives: calendar-bound liturgy.',
    sections: [
      {
        title: 'The mountain, and who it is sacred to',
        body: [
          'Mount Kailas stands in western Tibet, a little over 6,600 meters high, and is held sacred by Hindus, Buddhists, Jains and followers of Bon. It is almost never climbed. It is walked round: a circuit of about 52 kilometers, the kora in Tibetan, usually taken over three days, clockwise by Hindus and Buddhists and anticlockwise by Bon practitioners. The highest point of the walk is the Drolma La pass, at roughly 5,600 meters.',
          'Hindu tradition places Shiva’s home there. Tibetan Buddhists call the mountain Kang Rinpoche, the precious jewel of snow, and associate it with Chakrasamvara. Jains identify it with Ashtapada, where Rishabhanatha reached liberation. In Bon accounts it is the sacred center of Zhang Zhung. One landscape, four stories.',
        ],
        aside:
          'Tradition holds that a single circuit lifts the weight of a lifetime’s wrongdoing and that 108 lead to liberation. Counted, repeated and cumulative: that is why the walk invites questions about cyclic and layered time.',
      },
      {
        title: 'The borrowed mathematics, stated so it could fail',
        body: [
          'Ivo Dinov and colleagues study ultrahyperbolic wave equations in “spacekime,” where time is a complex quantity carrying a magnitude and a phase. The tempting analogy for pilgrimage is clean: route progress around the mountain is a magnitude, while the pilgrim’s interpretive or ritual frame is an independent phase.',
          'Rather than treating a poetic analogy as a finding, the proposal committed to two empirical gates: first, whether Kailas passages in open multilingual corpora invoke multi-temporal ideas more often than comparable sacred subjects; second, whether at least 10% of coded experience episodes in pilgrim accounts exhibit an interpretive clock independent of `(lap, progress)`.',
        ],
      },
      {
        title: 'Study 1: 2,362 blind-labeled passages across 15+ languages',
        body: [
          'We assembled an open-license corpus across 15+ languages, including 206 CC0 Tibetan texts (151 Bon Kangyur, 55 Derge Kangyur/Tengyur), 1,459 Sanskrit texts, and 51 pre-1928 accounts. Sixty-token windows around matched terms were de-duplicated, stripped of OCR tables and personal-name collisions (“Kailash Kher”), and rated blind (κ = 0.64 on overlaps) against religion-topic controls and Meru.',
          'In English and Chinese, Kailas passages discussed multi-temporal concepts significantly less often than religion controls. Sanskrit—the best-powered primary language with 574 Kailas passages—was a clean null (−3.4 per 100, CI −12.0 to +4.5). Tibetan/Bon (+6.1, N = 46) was underpowered because open canonical texts rarely name the peak directly.',
        ],
        figures: [
          {
            kind: 'table',
            title: 'On-concept passages per 100 (blind model labels, document-clustered 95% CI)',
            head: ['Language', 'Kailas', 'Religion topics', 'Meru', 'Kailas minus religion (95% CI)'],
            rows: [
              ['English', '3.0 (N = 1,046)', '9.2', '32.5', '−6.3 (−11.8, −2.4)'],
              ['Chinese', '12.2 (N = 41)', '30.7', '47.5', '−18.5 (−33.4, −3.1)'],
              ['Tibetan / Bon', '19.6 (N = 46)', '13.5', '29.8', '+6.1 (−7.8, +21.2)'],
              ['Sanskrit', '10.7 (N = 574)', '14.1', '14.8', '−3.4 (−12.0, +4.5)'],
              ['Hindi', '18.8 (N = 32)', '35.0', '58.1', '−16.3 (−35.6, +2.9)'],
            ],
            caption:
              'Meru is biased upward because the rubric counts the cosmic world-mountain as on-concept; religion topics are the primary control.',
          },
        ],
      },
      {
        title: 'Catching our own first-pass embedding illusion',
        body: [
          'Before passage blinding, an embedding comparison (`multilingual-e5`) showed English Kailas windows closer to `axis mundi` and multi-time seeds than neutral controls (mountains, weather, taxation). Blind human-rubric re-labeling of 264 windows killed that result: only 6 windows (~2%, top-window precision 3%) were genuinely on-concept. Any mythic travelogue sits closer to cosmological prose than a tax code does.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Method progression, in order run',
            rows: [
              { label: 'Exact-lexicon co-occurrence', status: 'stop', note: 'too sparse after multiple-testing correction' },
              { label: 'Embedding distance vs neutral controls', status: 'fail', note: 'retracted: 3% precision on top hits (measured genre, not time)' },
              { label: 'Blind passage comparison vs religion controls', status: 'pass', note: 'sound instrument; establishes the corpus null above' },
              { label: 'Dual-coder pilgrim-account episode test', status: 'pass', note: 'α = 0.82 across 195 windows; 5.6% decoupled (< 10% bar)' },
              { label: 'Tibetan, Bon & Sanskrit scholar handoff', status: 'open', note: 'seeded blind CSVs (115 + 233 rows) & scorer ready' },
            ],
            caption: '“Pass” marks instrument validity, not confirmation of the kime hypothesis.',
          },
        ],
      },
      {
        title: 'Study 2: 195 pilgrim-account episodes, and an unexpected redirect',
        body: [
          'Next we ran the notation test itself (`coding/RESULTS_CODING.md`): 195 windows (1,700 characters each) across 20 public-domain pilgrimage books (9 Kailas-region—Kawaguchi, Sven Hedin, Strachey, Rawling, Landor, Wilson, Moorcroft—and 11 comparison pilgrimages across Mecca, Jerusalem, Canterbury, and alpine shrines), coded independently by two blind coders under a frozen codebook.',
          'Inter-coder agreement met every pre-registered bar (Krippendorff α = 0.82 on the decoupled indicator, 0.83 on `clock`, 0.94 on episode `kind`). Yet only 7 of 124 experience episodes (5.6%, loose 8.1%) exhibited an independent interpretive clock with multiple frames—missing the 10% threshold. For 117 of 124 episodes, plain `(lap, progress)` suffices. Restricting strictly to the 33 windows that explicitly name Kailas, Tise, Kang Rinpoche, or the kora gave the same answer: 1 of 33 (3%, Kawaguchi on circuit counts).',
          'Where did decoupled two-clock episodes actually cluster? Not at Kailas (mean 1.3%), but in the comparison group (mean 14.7%, permutation p = 0.129): specifically Richard Burton’s and Hadji Khan’s Hajj accounts and Holy Land narratives, where a fixed liturgical calendar (Day of Arafat, Ramadan dates, canonical Mass hours) runs orthogonal to spatial progress along the road.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Decoupled two-clock share of experience episodes',
            max: 0.2,
            rows: [
              { label: 'Comparison pilgrimages (Hajj / Holy Land)', value: 0.147, note: 'mean across 8 accounts', tone: 'good' },
              { label: 'Pre-registered kime threshold', value: 0.1, note: 'decision bar', tone: 'warn' },
              { label: 'Pooled sample (7 / 124 episodes)', value: 0.056, note: 'α = 0.82; hypothesis not met', tone: 'bad' },
              { label: 'Kailas-named kora cut (1 / 33)', value: 0.03, note: 'Kawaguchi circuit passage', tone: 'bad' },
              { label: 'Kailas-region accounts (8 books)', value: 0.013, note: 'mostly route & altitude logistics', tone: 'bad' },
            ],
            caption: 'Falsifying Kailas-specific kime isolated the real phenomenon: ritual-calendar time vs route time.',
          },
        ],
      },
      {
        title: 'Where this goes: scholar handoff and liturgical calendars',
        body: [
          'To replace model raters where philology matters most, `scholar-handoff/` generates seeded, group-blinded sheets—115 Tibetan/Bon rows (all 46 Kailas passages, controls, and 8 test-retest repeats) and 233 Sanskrit rows—plus `human_pack.py` for 40-episode human double-coding, scored automatically with quadratic-weighted κ and document-clustered bootstrap CIs.',
          'Meanwhile, the mathematical vocabulary now has a sharper, testable home: modeling the interaction of liturgical calendar phase and spatial route progress in Hajj and Jerusalem pilgrimage accounts, where the corpus showed the two clocks genuinely pull apart.',
        ],
        figures: [
          {
            kind: 'roadmap',
            title: 'Where this stands',
            done: [
              'Open-license corpus across 15+ languages & 2,362 blind-labeled passages',
              'First-pass embedding false positive caught (3% precision) and retracted',
              '195-episode pilgrim-account coding completed (α = 0.82; 5.6% decoupled)',
              'Blinded Tibetan/Bon (115-row) & Sanskrit (233-row) scholar handoff packs + scorers built',
            ],
            next: [
              'Collect labels from two native-reading scholars per language via `scholar-handoff/`',
              'Run human double-coding on the 40-episode `human_pack.csv` subsample',
              'Reframe and test two-clock `(route, liturgical-calendar)` notation on Hajj & Holy Land corpora',
            ],
            blocked: [
              'Un-OCRed Bon canonical scans (Zhang Zhung Nyan Gyud, Gzer mig) and Puranic Kailasa editions under restrictive licenses',
              'Any claim about lived pilgrimage experience from written text alone',
            ],
            caption: 'Code, manifests, coding results, and handoff builders are public at `Epistetechnician/kailas-corpus`.',
          },
        ],
      },
    ],
  },
  sources: [
    {
      label: 'Epistetechnician/kailas-corpus (GitHub repository)',
      url: 'https://github.com/Epistetechnician/kailas-corpus',
      why: 'Open-license manifests, lexicon, passage analysis, 195-episode coding results, and scholar-handoff scripts.',
    },
    {
      label: 'Wang, Shen, Deng & Dinov (2022), Determinism, well-posedness, and applications of the ultrahyperbolic wave equation in spacekime',
      url: 'https://doi.org/10.1016/j.padiff.2022.100280',
      why: 'The complex-time (kime) formalism tested and bounded by the two studies above.',
    },
    {
      label: 'Open-access copy on PubMed Central (PMC9494226)',
      url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9494226/',
      why: 'Full text of the mathematical source.',
    },
  ],
}

export const fieldStrands: FieldStrand[] = [kailas]
export const getField = (slug: string) => fieldStrands.find((f) => f.slug === slug)
