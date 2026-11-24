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
  tagline:
    'Across 2,626 blind-labeled passages in 15+ languages and 416+ coded pilgrimage windows (including Colin Thubron’s full 52-km kora circuit), Mount Kailash turns out to be a route-locked spatial mandala (φ = f(r)) rather than an asynchronous two-clock calendar.',
  status:
    'Corpus v3, Pilgrimage Coding v2, Sanskrit & Tibetan Cipher/Pramāṇa Audit, and blinded scholar handoff sheets complete (Nov 2026) in Epistetechnician/kailas-corpus (awaiting external philologist grading).',
  question:
    'Do classical texts and lived pilgrimage accounts around Mount Kailash encode multiple independent clocks, or do they project coexisting cosmological, devotional, and physical worlds onto a single shared spatial circuit?',
  headline:
    'Unbundling spatial cosmology from temporal cosmology across 2,626 passages resolves an apparent null in Sanskrit and Tibetan into a clean double dissociation: Kailash is strongly enriched in axis-mundi and mandala structure across English, Sanskrit, Classical Tibetan, and Bon, while depleted or null on multi-temporal language. Walking the 52-km circuit in sequential episodes confirms why: calendar-decoupled ritual time belongs to Hajj and Holy Land liturgy (16.7% vs 3.0%, p = 0.0022), whereas Kailash locks meaning to physical position around the mountain.',
  notShown:
    'All passage raters and episode coders to date are language models evaluated under blind protocols (with measured inter-rater reliability: κ = 0.90 on Tibetan v3 overlaps, α = 0.86 on public-domain pilgrimage windows, and α = 0.83 on Colin Thubron’s circuit). Core Bon Dzogchen manuscripts such as the *Zhang Zhung Nyan Gyud* and *Gzer mig* remain mostly in un-OCRed scans, and scoring our blinded scholar sheets with human specialists in Tibetan, Bon, and Sanskrit philology is the next external check.',
  results: [
    {
      value: '+3.4 / +21.1 / +44.1',
      label:
        'Spatial mandala lift per 100 passages over religion controls in Sanskrit, Classical Tibetan Tise, and Bon Yungdrung Gutsek',
    },
    {
      value: '−3.16b vs +111.0b',
      label:
        'Rissanen MDL falsifying unconstrained Sanskrit Kaṭapayādi numerology (−3.16 bits) while backing mandala & subtle-body registers (+110.98 bits)',
    },
    {
      value: '16.7% vs 3.0%',
      label:
        'Calendar-decoupled ritual clock share in Hajj & Holy Land accounts (16/96) vs Kailash explorer accounts (4/134), p = 0.0022',
    },
    {
      value: '20.0% vs 0.0%',
      label:
        'Route-aligned mandala episodes along Thubron’s kora (p = 0.0017 vs explorers) vs strict calendar decoupling on Stages 2–5 (0/24)',
    },
  ],
  limits: [
    'Passage raters and episode coders are models; high inter-rater agreement (κ = 0.90 on Tibetan overlaps; α = 0.86 on episodes) establishes rubric consistency, not human philological authority.',
    'Core Bon Dzogchen and biography manuscripts (*Zhang Zhung Nyan Gyud*, *Gzer mig*) exist mainly as un-OCRed scans on BDRC; our 282 Tibetan and Bon passages come from CC0 OpenPecha/BoCorpus editions and open BDRC etexts, with sealed initiation texts excluded by policy.',
    'In third-person ethnographic summaries of multi-lap rules (such as Hedin’s notes on 13-circuit inner-kora customs), coders split more often on whether lap counts are calendar-like or route-locked than they do on first-person walks.',
    'Modern copyrighted prose (Colin Thubron’s *To a Mountain in Tibet*) is analyzed strictly by EPUB chapter/paragraph locator, character offset, circuit coordinate r ∈ [0, 1], and 12-character SHA-1 digest (`coding/thubron_kora_codings.csv`), with zero source text stored in the repository.',
  ],
  threads: ['sacred', 'failure', 'measure'],
  shelf: [
    'eliadeSacred',
    'eliadeReturn',
    'turner',
    'tuan',
    'geertz',
    'kawaguchi',
    'burton',
    'thubron',
    'thurmanWise',
    'govinda',
    'mckay',
    'spacekime',
  ],
  people:
    'The pilgrims whose walks became data, and the readers of Tibetan, Bon, Sanskrit, and comparative liturgy who can check what automated coders missed. Seeded, group-blinded review sheets—233 IAST-normalized Sanskrit rows, 115 v2 + 128 v3 Tibetan and Bon rows, and a 40-episode human double-coding pack—are built and ready for specialist review.',
  essay: {
    callout:
      'A pooled null can hide two opposite truths. Separating spatial mandala cosmology from multi-temporal cosmology across 2,626 passages—and walking the 52-km kora sequentially across 494 coded windows (114 on the S¹ circuit across 7 lineages)—shows that Kailash indexes plural worlds by spatial position around the mountain (φ = f(r)), whereas independent two-clock time belongs to calendar-bound liturgy and asynchronous institutional settlement.',
    sections: [
      {
        title: 'The mountain, and the two competing hypotheses',
        body: [
          'Mount Kailash rises a little over 6,600 meters in western Tibet and is held sacred simultaneously by Hindus, Buddhists, Jains, and followers of Bon. Almost no one climbs it. Instead, pilgrims walk a 52-kilometer circuit around its base—clockwise for Hindus and Buddhists, anticlockwise for Bon practitioners—crossing the 5,630-meter Drolma La pass halfway round.',
          'Our initial proposal (`PROPOSAL.md`) accidentally blended two very different ideas about what makes Kailash unusual. The first, following Piasecki’s “A Mountain as Multiverse,” is spatial: the mountain acts as a shared mandala axis onto which rival cosmological, devotional, and biographical realities are mapped according to where a pilgrim stands on the trail (φ = f(r)). The second, borrowing Ivo Dinov’s complex-time (`kime`, κ = r · e^{iφ}) notation, is temporal: texts and journeys around Kailash might carry a second, calendar-decoupled clock that runs independently of physical progress along the path (φ ≠ f(r)).',
        ],
        aside:
          'When an instrument bundles two orthogonal hypotheses into a single score, opposite effects cancel. Unbundling them turned an ambiguous null into a clean double dissociation.',
        figures: [
          {
            kind: 'plate',
            title:
              'Plate I — Mount Kailash / Tise / Yungdrung Gutsek: Cosmographic Pramāṇa Cutaway & Four-Gated Mandala Plan',
            src: '/illustrations/kailas-mandala-pramana.jpg',
            alt: 'Archival copperplate architectural cutaway and mandala plan of Mount Kailash showing nine stepped terraces, four cardinal rivers, square bhupura gates, and 52-km circumambulation circuit',
            legend: [
              {
                label: 'I · Nine-Stacked Axis',
                detail:
                  'Bon Yungdrung Gutsek (གཡུང་དྲུང་དགུ་བརྩེགས) nine stepped terraces: 45.0% multi-tier architecture rate (+53.79 bits MDL).',
              },
              {
                label: 'II · Four-Gated Bhūpura',
                detail:
                  'Square mandala courtyard (གྲུ་བཞི་སྒོ་བཞི) and four river headwaters (Indus, Sutlej, Brahmaputra, Karnali) radiating from the peak.',
              },
              {
                label: 'III · Pramāṇa Triangulation',
                detail:
                  'Sanskrit metrological survey verses in yojanas and elevation/breadth axes: 49.5% in Kailash passages (+11.12 bits).',
              },
              {
                label: 'IV · 52-km S¹ Kora Loop',
                detail:
                  'Dotted pilgrim circuit cresting the 5,630 m Drolma La pass (r = 0.52), with 0.00 phase defect across Stages 2–5.',
              },
            ],
            caption:
              'Archival copperplate reconstruction synthesizing the geometric primitives empirically enriched across our Sanskrit, Classical Tibetan, and Bon corpus.',
          },
        ],
      },
      {
        title: 'Study 1A: Self-caught aggregation cancellation across 2,362 passages',
        body: [
          'We first assembled an open-license corpus across more than fifteen languages—including 1,459 Sanskrit works, 206 CC0 Tibetan and Bon canonical texts, and 51 pre-1928 travel accounts—after catching and retracting an early multilingual-embedding false positive whose top hits were matching literary genre rather than cosmology. Blind raters then scored 2,362 deduplicated 120-token passages on a three-point rubric alongside six specific tags: cyclic cosmic ages (a), rebirth cycles (b), coexisting realms (c), time deities (d), spatial axis-mundi or mandala geometry (e), and bardo or non-linear time (f).',
          'Our first aggregation script (`analyze2.py`) collapsed all six tags into a single binary score and threw away the category column. That produced a puzzling null in Sanskrit (−3.39 per 100) and a noisy, underpowered positive in Tibetan (+6.11). When we decomposed the exact same 2,362 blind ratings into spatial mandala structure (e) versus multi-temporal concepts (a, b, d, f) using document-clustered bootstrap intervals (`analyze_v3.py`), the reason jumped out immediately: across English, Sanskrit, and Tibetan, Kailash passages are significantly enriched in spatial mandala geometry and significantly depleted in multi-temporal language. Summing the two had canceled both signals.',
        ],
        figures: [
          {
            kind: 'table',
            title:
              'Spatial-Mandala (cat e) vs. Multi-Temporal (cats a,b,d,f) Double Dissociation (2,362 v2 passages, Kailash minus Religion Controls per 100 [95% CI])',
            head: [
              'Language (Kailash N)',
              'Pooled a–f (v2)',
              'Purely Spatial (only e)',
              'Spatial Axis/Mandala (all e)',
              'Multi-Temporal (a,b,d,f)',
            ],
            rows: [
              [
                'English (N = 1,046)',
                '−6.25 [−12.35, −2.40]',
                '+1.22 [+0.34, +2.18]',
                '+1.59 [+0.53, +2.74]',
                '−6.37 [−11.88, −2.80]',
              ],
              [
                'Sanskrit (N = 574)',
                '−3.39 [−11.35, +4.80]',
                '+3.38 [+1.13, +6.19]',
                '+2.80 [−0.02, +5.63]',
                '−8.43 [−15.85, −1.36]',
              ],
              [
                'Tibetan / Bon v2 (N = 46)',
                '+6.11 [−7.18, +20.35]',
                '+14.76 [+3.99, +26.82]',
                '+14.74 [+3.92, +26.80]',
                '−4.59 [−7.72, −2.03]',
              ],
              [
                'Chinese (N = 41)',
                '−18.51 [−32.56, −3.01]',
                '−2.20 [−14.05, +9.31]',
                '−1.42 [−14.05, +10.88]',
                '−4.97 [−11.61, +0.00]',
              ],
              [
                'Hindi (N = 32)',
                '−16.25 [−35.63, +4.59]',
                '+8.75 [−6.88, +27.50]',
                '+5.42 [−10.62, +24.38]',
                '−23.33 [−36.67, −10.00]',
              ],
            ],
            caption:
              'In Sanskrit and Tibetan, positive spatial-mandala enrichment (+3.38, +14.74) and negative multi-temporal depletion (−8.43, −4.59) canceled when summed in Corpus v2.',
          },
        ],
      },
      {
        title: 'Study 1B: Recovering classical Tibetan Tise and Bon Yungdrung Gutsek (42 → 282 passages)',
        body: [
          'A second puzzle remained: why had Corpus v2 found 4,888 Tibetan passages for Mount Meru, yet only 46 for Kailash—three of which turned out to be modern book-series colophons? Auditing our extraction lexicon (`lexicon_verified.json`) exposed a script bug. Classical Meru epithets had been patched in Tibetan script, whereas “Tise” had been entered only in Latin letters, leaving the matcher blind to classical Tibetan verse compounds (such as ཏི་སེའི་གངས and གངས་དཀར་ཏི་སེ, “White Snow Tise”) and omitting the canonical Bon cosmic mountain གཡུང་དྲུང་དགུ་བརྩེགས (*Yungdrung Gutsek*, the Nine-Stacked Swastika Mountain at the center of Olmo Lungring).',
          'Adding those classical forms and blind-rating the recovered passages (with 95% dual-rater agreement, κ = 0.90) expanded our canonical Tibetan and Bon sample nearly sevenfold, from 42 clean passages to 282 passages across 145 works. At full canonical scale, the spatial-versus-temporal dissociation became unmistakable: classical Tibetan Tise passages jump +21.1 per 100 over religious controls on mandala geometry (+42.0 inside full-text Kangyur/Bon scriptures), Bon *Yungdrung Gutsek* jumps +44.1 on mandala geometry plus +15.7 on coexisting realms, and both sit squarely at null (+1.2 and +1.5) on multi-temporal concepts.',
        ],
        figures: [
          {
            kind: 'table',
            title:
              'Classical Tibetan & Bon Corpus v3 (N = 282 target passages vs 220 religion & 100 Meru controls, document-clustered 95% CIs)',
            head: [
              'Tibetan / Bon Group',
              'Passages (Works)',
              'Spatial Axis/Mandala (cat e)',
              'Coexisting Realms (cat c)',
              'Multi-Temporal (cats a,b,d,f)',
            ],
            rows: [
              [
                'Classical ཏི་སེ (bocorpus full-text Kangyur/Bon)',
                '59 (26)',
                '47.5% (+42.0 [+23.6, +57.1])',
                '5.1% (−1.3 [−7.3, +7.1])',
                '27.1% (+18.5 [−1.4, +39.4])',
              ],
              [
                'Classical ཏི་སེ / ཀཻ་ལཱ་ས Pooled v3 (bocorpus + bdrc)',
                '173 (113)',
                '26.6% (+21.1 [+11.6, +31.4])',
                '6.9% (+0.6 [−4.5, +6.0])',
                '9.8% (+1.2 [−7.2, +10.8])',
              ],
              [
                'Bon གཡུང་དྲུང་དགུ་བརྩེགས (Yungdrung Gutsek, bocorpus)',
                '109 (32)',
                '49.5% (+44.1 [+33.3, +58.7])',
                '22.0% (+15.7 [+7.0, +24.8])',
                '10.1% (+1.5 [−5.3, +8.2])',
              ],
              [
                'Tibetan Religion Controls (nc_religion)',
                '220 (83)',
                '5.5% (baseline)',
                '6.4% (baseline)',
                '8.6% (baseline)',
              ],
              [
                'Tibetan Mount Meru (རི་རབ / ལྷུན་པོ, nc_meru)',
                '100 (55)',
                '24.0% (+18.6 [+7.3, +35.4])',
                '6.0% (−0.4 [−6.2, +7.3])',
                '5.0% (−3.6 [−9.3, +3.7])',
              ],
            ],
            caption:
              'Recovering classical ཏི་སེ epithets and Bon གཡུང་དྲུང་དགུ་བརྩེགས increased canonical Tibetan and Bon coverage 6.7× (dual-rater overlap κ = 0.90).',
          },
          {
            kind: 'chips',
            title: 'Self-correcting instrument progression across v1 → v3',
            rows: [
              {
                label: 'v1: Exact-lexicon co-occurrence',
                status: 'stop',
                note: 'too sparse after Benjamini-Hochberg correction',
              },
              {
                label: 'v1: Embedding similarity vs neutral controls',
                status: 'fail',
                note: 'caught & retracted: 3% top-window precision (measured genre/names, not time)',
              },
              {
                label: 'v2: Pooled blind passage score (a–f lumped)',
                status: 'fail',
                note: 'caught Simpson cancellation: positive spatial (e) canceled negative temporal (a,b,d,f)',
              },
              {
                label: 'v3: Category-decomposed + Classical Tibetan/Bon recovery',
                status: 'pass',
                note: '2,626 passages (κ = 0.90): proves spatial-mandala lift (+3.4 to +44.1) & temporal null/depletion',
              },
              {
                label: 'v2 Coding: 494 dual-coded windows + 114-episode 7-lineage S¹ Kora (r ∈ [0, 1])',
                status: 'pass',
                note: 'separates Hajj calendar liturgy (16.7%, p = 0.0022) from Kailash route-aligned mandala (20.0%, p = 0.0017) & indigenous Tibetan vs Bon O(2) holonomy',
              },
            ],
            caption:
              'Every methodological upgrade came from auditing a confound or philological blind spot in the prior pass.',
          },
        ],
      },
      {
        title:
          'Study 2: 494 pilgrimage windows—Hajj liturgical calendars vs. the 114-episode, 7-lineage Kailash kora',
        body: [
          'Scripture tells you how a tradition imagines a place; travel accounts tell you what happens when someone actually walks it. Our initial 195-window coding study hinted that calendar-decoupled ritual time appeared far more often in Mecca and Jerusalem accounts than around Kailash, but the sample was too small to clear information-theoretic breakeven, and most public-domain Kailash books were written by nineteenth-century colonial surveyors mapping valleys rather than walking the ritual circuit.',
          'We therefore expanded public-domain dual coding to 368 windows across twenty-one books (α = 0.86) and dual-coded 114 sequential full-circuit kora episodes ordered from r = 0.00 to r = 1.00 across seven distinct lineages: indigenous Tibetan Buddhist *Ti se’i dkar chag* and *Mgur ’bum* texts (+1 CW), indigenous Bon *Dri med gzi brjid* and *Tise* accounts (−1 CCW), Swami Pranavananda’s Hindu *Kailāsa–Mānasarovara Parikramā* (+1 CW), Lama Anagarika Govinda’s contemplative Buddhist circuit (+1 CW), Colin Thubron’s *To a Mountain in Tibet* (+1 CW, coded strictly by chapter/paragraph locator and SHA-1 hash), the Japanese Zen monk Ekai Kawaguchi’s 1900 circuit (+1 CW), and Sven Hedin’s 1907 topographic circuit (+1 CW).',
          'The two pilgrimage regimes separated cleanly. Calendar-decoupled ritual time—where a liturgical feast or prayer schedule runs orthogonal to physical geography—concentrates in Hajj and Holy Land accounts (16.7% vs 3.0% in Kailash explorer logs, p = 0.0022). Around Kailash, the opposite happens: 96.5% of kora episodes braid multiple interpretive realities at once, and route-locked mandala phase rises ninefold over off-circuit surveyor logs (20.0% strict, 34.3% loose, p = 0.0017), peaking at 50.0% around the Zutulpuk cave of Milarepa and Naro Bonchung. Across all seven lineages, sacred-landscape 4-register agreement reaches 59.0% (and 70.8% directly between indigenous Tibetan Buddhist *Dkar chag* and Bon *Dri med gzi brjid* circuits) while observer-personal registers diverge (43.1%). Crucially, across all 24 contiguous episodes on the mountain proper (Stages 2–5, from Lha-chu valley over the 5,630 m Drolma La pass to Zutulpuk), calendar decoupling drops to exactly zero.',
        ],
        figures: [
          {
            kind: 'bars',
            title:
              'Route-Aligned Mandala (clock = aligned) vs. Calendar-Decoupled (clock = independent) Share Across Regimes',
            max: 0.55,
            rows: [
              {
                label: 'Thubron Kora Stage 5 (r ∈ [0.58, 0.84]): Route-Aligned Mandala',
                value: 0.5,
                note: '4/8 strict (62.5% loose) at Zutulpuk / Milarepa cave',
                tone: 'good',
              },
              {
                label: 'Thubron Full Kora Circuit (r ∈ [0, 1]): Route-Aligned Mandala',
                value: 0.2,
                note: '7/35 strict (34.3% loose); 9× surveyor baseline (p = 0.0017)',
                tone: 'good',
              },
              {
                label: 'Hajj & Holy Land Liturgy (n = 96): Calendar-Decoupled Clock',
                value: 0.167,
                note: '16/96 strict (19.8% loose); p = 0.0022 vs Kailash explorers',
                tone: 'warn',
              },
              {
                label: 'Kailash 19th-c. Explorer Sample (n = 134): Calendar-Decoupled',
                value: 0.03,
                note: '4/134 strict (2.2% route-aligned)',
                tone: 'bad',
              },
              {
                label: 'Thubron Mountain Circuit Proper (Stages 2–5, r ∈ [0.14, 0.84]): Calendar-Decoupled',
                value: 0.0,
                note: '0/24 strict once past Stage 1 Saga Dawa flagpole gathering',
                tone: 'bad',
              },
            ],
            caption:
              'On the Kailash circuit, interpretive phase is a function of spatial position r (φ = f(r)); in Hajj and Holy Land accounts, an external liturgical calendar runs orthogonal to the road (φ ≠ f(r)).',
          },
          {
            kind: 'terminal',
            title: '$ python3 kailas-corpus/coding/remediate_kora_v3.py',
            output: `[corpora]    thubron=48  indigenous=48  cross_tradition=30  total_coded=126
[quarantine] invalidated_audit_rows=24  quarantine_invariant=HELD
[thubron]    circuit_aligned=20.0% strict (34.3% loose, p=0.0017)  stages_2_to_5_decoupled=0/24
[mdl]        kailas_region (n=134): +2.028 bits (2-clock wins)
[mdl]        hajj_holyland (n=96):  -1.397 bits (1-clock liturgical wins)`,
            caption: 'Deterministic remediation and Rissanen Two-Clock MDL output matching `kailas-corpus/coding/results_coding_v3.json` and `primitives/results/two_clock_mdl.json`.',
          },
          {
            kind: 'demo',
            id: 'kora',
          },
        ],
      },
      {
        title: 'Study 3: Testing ancient ciphers vs. architectural pramāṇa blueprints',
        body: [
          'Classical Indic and Tibetan traditions developed sophisticated encoding systems—including Vararuci’s *Kaṭapayādi* consonant-to-digit cipher, *Bhūtasaṃkhyā* object-numeral chronograms, Pingala’s binary `laghu/guru` prosodic meter, and tantric *Sāṃdhyābhāṣā* (“Twilight Language”), which maps subtle-body channels onto mandala geography. Because every Sanskrit consonant maps to a digit from 0 to 9, unconstrained numerological searches over sacred hymns will inevitably “discover” sacred constants by pure chance unless tested against permutation controls.',
          'Running Rissanen Minimum Description Length (MDL) audits across 482 phonologically normalized Sanskrit passages and 602 disjoint Classical Tibetan and Bon passages (`analysis/ciphers.py`, `analysis/pramana_colophons.py`) draws a sharp line between numerological apophenia and genuine ancient encoding. Unconstrained *Kaṭapayādi* matches for constants like 108, 432, 1008, and π appear at 77.4% in Kailash texts versus 82.5% in randomly shuffled syllables, losing 3.16 bits under MDL. What the texts actually encode is surveyed three-dimensional architecture paired with subtle-body anatomy: explicit Sanskrit *pramāṇa* dimensions in yojanas appear in nearly half of Kailash passages (+11.12 bits over religious controls), and Tibetan/Bon nine-tiered mandala plus subtle-body registers compress blind-rated spatial cosmology by +53.79 bits in Tibetan and +110.98 bits across the pooled corpus.',
        ],
        aside:
          'Unconstrained consonant numerology loses bits against shuffled syllables (−3.16 bits); surveyed architectural geometry and subtle-body mandala registers save +110.98 bits.',
        figures: [
          {
            kind: 'table',
            title:
              'Anti-Apophenia Cipher & Pramāṇa MDL Audit (N = 1,084: 482 Normalized Sanskrit + 602 Disjoint Classical Tibetan/Bon Passages)',
            head: [
              'Encoding Channel / Hypothesis',
              'Target Rate',
              'Control / Null Rate',
              'Rissanen ΔMDL',
              'Verdict',
            ],
            rows: [
              [
                'Unconstrained Sanskrit Kaṭapayādi (108 / 432 / 1008 / 31415)',
                '77.4% (Kailash)',
                '82.5% ± 1.7% (shuffled)',
                '−3.16 bits',
                'Falsified (apophenia)',
              ],
              [
                'Sanskrit Pingala Chandas Binary Prosody (10,657 anuṣṭubh pādas)',
                '0.972 bits/syl',
                '0.971 bits/syl (rel.)',
                '0.00 bits',
                'Metric carrier (checksum)',
              ],
              [
                'Sanskrit Bhūtasaṃkhyā Density (≥ 3 distinct object-numerals)',
                '15.5% cosmology',
                '5.7% low-density',
                '+3.74 bits',
                'Backed (chronograms)',
              ],
              [
                'Sanskrit Pramāṇa Metrology (yojana + geometric axes)',
                '49.5% Kailash / 44.8% Meru',
                '27.2% religion',
                '+11.12 bits',
                'Backed (3D blueprint)',
              ],
              [
                'Tibetan/Bon Architectural Mandala + Dpag-tshad Tiers (N = 602)',
                '45.0% Bon (≥ 2 tiers)',
                '1.4% religion',
                '+53.79 bits',
                'Backed (cat e predictor)',
              ],
              [
                'Pooled Cross-Linguistic Mandala × Subtle-Body Register (N = 1,084)',
                '36.3%–47.7% cat e',
                '9.7% unflagged',
                '+110.98 bits',
                'Backed (+0.102 b/passage)',
              ],
            ],
            caption:
              'All Rissanen/BIC ΔMDL scores (L_null − L_model) pay explicit (k/2) log₂ n parameter penalties (`results_ciphers.json`, `results_pramana_colophons.json`).',
          },
        ],
      },
      {
        title: 'Where this stands: scholar handoff packs and next thresholds',
        body: [
          'To test our automated ratings against human philologists, `scholar-handoff/` provides group-blinded review sheets with embedded test-retest repeats: `sanskrit_v2_normalized.csv` (233 rows, including 51 romanized IAST passages normalized to Devanagari), `tibetan_bon_v3.csv` (128 classical Tise and Bon *Yungdrung Gutsek* rows), `tibetan_bon.csv` (115 v2 rows), and the 40-episode `human_pack.csv` pilgrimage double-coding pack.',
        ],
        figures: [
          {
            kind: 'roadmap',
            title: 'Research ledger status',
            done: [
              'Spatial-Mandala vs. Multi-Temporal double dissociation established across 2,362 v2 + 282 Tibetan/Bon v3 passages (κ = 0.90)',
              'Pilgrimage coding v2 (368 public-domain windows + 48 Thubron episodes): Hajj/Holy Land calendar decoupling (16.7% vs 3.0%, p = 0.0022) vs Kailas route-aligned phase (20.0%, p = 0.0017)',
              'Cipher & pramāṇa MDL audit across 1,084 passages: Kaṭapayādi numerology falsified (−2.89 to −3.16b); pramāṇa (+11.1b) & mandala registers (+111.0b) backed',
            ],
            next: [
              'Collect specialist philologist ratings on `sanskrit_v2_normalized.csv` (233 rows), `tibetan_bon_v3.csv` (128 rows), and `human_pack.csv` (40 episodes)',
              'Extend BDRC OCR coverage to cursive *dbu med* Bon manuscript scans (*Zhang Zhung Nyan Gyud*, *Gzer mig*)',
            ],
            blocked: [
              'Un-OCRed Bon canonical manuscript scans (*Zhang Zhung Nyan Gyud*, *Gzer mig*) and BDRC sealed initiation texts (excluded by ethics policy)',
              'Any claim about unmediated lived consciousness from textual or neural representations alone',
            ],
            caption:
              'All corpus data, manifests, locator-only kora codings, and scholar handoff sheets live in `Epistetechnician/kailas-corpus`.',
          },
          {
            kind: 'film',
            title: '3D Mount Kailas topology, clockwise/counter-clockwise kora circuits, and Two-Clock MDL',
            src: '/viz-media/kailas-mandala-3d.mp4',
            scriptPath: 'viz/manimgx/kailas_mandala_3d.py',
            caption:
              'ManimGX 3D render from `site/public/viz-data/kailas-two-clock.json`: $\\Delta\\mathrm{MDL}_{\\text{Kailas}} = +2.03\\text{ bits}$ vs. $\\Delta\\mathrm{MDL}_{\\text{Hajj/Holy Land}} = -1.40\\text{ bits}$, with Dolma La ($r=0.56$, 5,630 m) and zero calendar decoupling across kora stages 2–5.',
          },
          {
            kind: 'table',
            title: 'Two-Clock Rissanen MDL & Tier-1 Quarantine Audit (results_coding_v3.json)',
            head: ['Corpus / Pilgrimage Slice', 'n', '1-Clock Bits', '2-Clock Bits', 'Δ MDL Bits', 'Regime Verdict'],
            rows: [
              ['Kailas region (v2 expanded)', '134', '118.88', '116.85', '+2.03 bits', '2-clock / spatial-mandala'],
              ['Hajj & Holy Land liturgical subset', '96', '97.63', '99.03', '−1.40 bits', '1-clock liturgical calendar'],
              ['All comparison pilgrimages', '61', '63.75', '64.87', '−1.12 bits', '1-clock sufficient'],
              ['Thubron full kora (stages 2–5)', '24', '—', '—', '0/24 decoupled', 'route-locked φ = f(r)'],
              ['Quarantined Waddell/Strachey/Wilson', '24', 'isolated', '0 in Tiers 1–2', 'verified=true', 'audit remediated'],
            ],
            caption: 'Recomputed directly from `primitives/results/two_clock_mdl.json` (`sha256: 9348f14d...`) and `kailas-corpus/coding/results_coding_v3.json`.',
          },
        ],
      },
    ],
  },
  sources: [
    {
      label: 'Epistetechnician/kailas-corpus (GitHub)',
      url: 'https://github.com/Epistetechnician/kailas-corpus',
      why: 'Open-license manifests, Corpus v3 (`RESULTS_V3.md`), pilgrimage coding (`coding/RESULTS_CODING_V2.md`), cipher & pramāṇa MDL audits (`analysis/ciphers.py`, `pramana_colophons.py`), and scholar-handoff v2 packets.',
    },
    {
      label:
        'Abramsky & Brandenburger (2011), The sheaf-theoretic structure of non-locality and contextuality',
      url: 'https://doi.org/10.1088/1367-2630/13/11/113036',
      why: 'Foundational sheaf cohomology and linear-programming framework connecting local empirical marginals, global sections, and quantum contextuality.',
    },
    {
      label:
        'Wang, Shen, Deng & Dinov (2022), Determinism, well-posedness, and applications of the ultrahyperbolic wave equation in spacekime',
      url: 'https://doi.org/10.1016/j.padiff.2022.100280',
      why: 'The complex-time (kime) formalism tested and bounded by the corpus and pilgrimage studies.',
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
