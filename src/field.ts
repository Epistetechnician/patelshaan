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
    'A 2,626-passage multilingual double dissociation, 1,084-passage cipher & pramāṇa MDL audit, 446 dual-coded pilgrimage windows, and a Lean-verified cellular sheaf (`MandalaSheaf`) connecting Kailash’s 52-km kora (φ = f(r)) to epistemic Dutch books and LLM world-model coherence.',
  status:
    'Corpus v3, Full-Circuit Kora Coding v2, Sanskrit/Tibetan Cipher & Pramāṇa MDL Audit, and Lean 4.28 `MandalaSheaf` kernel complete (Nov 2026); 5 SHA-256 receipts and blinded Tibetan/Bon (115 + 128 v3 rows) & IAST-normalized Sanskrit (233 rows) scholar handoff packs live in Epistetechnician/kailas-corpus and patelshaan-lab/primitives.',
  question:
    'Do texts about Mount Kailas (Kang Rinpoche / Tise / Kailāsa) and its Bon counterpart (Yungdrung Gutsek) encode spatial mandala cosmology (`cat e`) or multi-temporal cosmology (`cats a,b,d,f`) more than comparable sacred texts—and in lived pilgrimage accounts, when does complex-time (`kime`) phase act as a route-locked spatial mandala (φ = f(r)) versus an independent liturgical calendar clock (φ ≠ f(r))?',
  headline:
    'Decomposing 2,362 blind-labeled v2 passages and recovering 264 classical Tibetan `ཏི་སེ` (N = 173, 113 works) & Bon Kangyur `གཡུང་དྲུང་དགུ་བརྩེགས` (N = 109, 32 works; overlap κ = 0.90) passages resolves the pooled Sanskrit and Tibetan nulls into a double dissociation: Kailas/Tise/Yungdrung Gutsek is significantly enriched in spatial axis/mandala structure (`cat e`: English +1.22, Sanskrit +3.38, Tibetan `ཏི་སེ` +21.1, full-text Kangyur/Bon +42.0, Bon Yungdrung Gutsek +44.1 plus +15.7 on `cat c` coexisting realms), while significantly depleted or tightly null on multi-temporal concepts across every language (`cats a,b,d,f`: English −6.37, Sanskrit −8.43, Hindi −23.33, Chinese −4.97, Tibetan v3 +1.2 and +1.5). Across 446 dual-coded pilgrimage windows (368 public-domain + 48 locator-only Colin Thubron + 30 Kawaguchi/Hedin full-circuit kora episodes), calendar-decoupled time (`clock = independent`) concentrates in Hajj & Holy Land liturgy (16.7% vs 3.0% Kailas explorers, p = 0.0022), whereas tracking the 52-km Kailas kora circuit sequentially along r ∈ [0, 1] reveals 96.9% (62/64) multi-frame braiding, 20.0% strict (34.3% loose) route-aligned mandala phase (`clock = aligned`, 9× higher than surveyor logs, p = 0.0017) in Thubron, and 0.0% (0/24) calendar decoupling across the mountain circuit proper (Stages 2–5, r ∈ [0.14, 0.84]) once past the Stage 1 Saga Dawa flagpole gathering.',
  notShown:
    'All passage raters and episode coders so far are models (with measured inter-rater agreement: κ = 0.90 on Tibetan v3 overlaps, α = 0.86 on public-domain episodes, α = 0.83 on Thubron kora episodes). Core Bon Dzogchen manuscripts (Zhang Zhung Nyan Gyud, Gzer mig) that exist only as un-OCRed scans remain outside machine-readable corpora, and native-reading human scholar scoring of our blinded handoff sheets (`115 + 68` Tibetan/Bon rows, `233` Sanskrit rows, and `40`-episode `human_pack.csv`) is the next external verification step.',
  results: [
    {
      value: '+3.38 / +21.1 / +44.1',
      label:
        'Spatial Axis/Mandala (`cat e`) lift per 100 over religion controls in Sanskrit (N=574), Tibetan `ཏི་སེ` v3 (N=173), and Bon `གཡུང་དྲུང་དགུ་བརྩེགས` (N=109)',
    },
    {
      value: '−6.37 / −8.43 / +1.2',
      label:
        'Multi-Temporal (`cats a,b,d,f`) difference per 100 in English (N=1,046), Sanskrit (N=574), and Tibetan `ཏི་སེ` v3 (N=173: tight null)',
    },
    {
      value: '16.7% vs 3.0%',
      label:
        'Calendar-decoupled (`clock=independent`) share in Hajj/Holy Land (16/96) vs Kailas explorers (4/134), p = 0.0022 (α = 0.86)',
    },
    {
      value: '20.0% (0% Stg 2–5)',
      label:
        'Route-aligned mandala phase (`clock=aligned`, 34.3% loose) on Thubron’s full kora circuit (r ∈ [0, 1]), with 0/24 calendar decoupling on Stages 2–5',
    },
  ],
  limits: [
    'Raters and episode coders are models; high inter-rater reliability (κ = 0.90 on Tibetan v3 overlaps; α = 0.86 on episodes) demonstrates rubric reproducibility, not human philological authority.',
    'Core Bon Dzogchen and biography texts (Zhang Zhung Nyan Gyud, Gzer mig) remain mostly in un-OCRed scans on BDRC; our 282 Tibetan/Bon passages come from CC0 openpecha/BoCorpus (Bon Kangyur + Derge Kangyur/Tengyur) and open BDRC etext chunks.',
    'In multi-circuit pilgrimage descriptions (e.g., Hedin’s ethnographic notes on 13-circuit inner-kora rules or pebble-counted prostrations), coders split on whether cumulative lap counts are `independent` or `aligned` (κ drops to 0.47 on ethnographic third-person summaries vs α = 0.71–0.87 on first-person walks).',
    'Copyrighted modern text (Colin Thubron’s *To a Mountain in Tibet*) is analyzed strictly by EPUB chapter/paragraph locator, character offset, route coordinate r ∈ [0, 1], and 12-char SHA-1 hash (`coding/thubron_kora_codings.csv`), with zero copyrighted source text committed.',
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
    'The pilgrims whose accounts became data, and the readers of Tibetan, Bon, Sanskrit, and comparative liturgy who can check what model coders missed. Blinded handoff sheets (115 Tibetan/Bon v2 rows, 68 Tibetan/Bon v3 canonical supplement rows, 233 Sanskrit rows, and a 40-episode human double-coding pack) are built and ready to score.',
  essay: {
    callout:
      'A pooled null can hide two opposite truths. Separating spatial mandala cosmology (`cat e`) from multi-temporal cosmology (`cats a,b,d,f`) across 2,626 passages—and tracking the 52-km kora circuit sequentially along r ∈ [0, 1] across 446 coded windows—shows that Kailas is a route-locked spatial mandala (φ = f(r)), whereas independent two-clock time (φ ≠ f(r)) belongs to calendar-bound liturgy (Hajj and Holy Land) and asynchronous institutional finality (`Statebook`).',
    sections: [
      {
        title: 'The mountain, and the two competing hypotheses',
        body: [
          'Mount Kailas stands in western Tibet, a little over 6,600 meters high, and is held sacred by Hindus, Buddhists, Jains, and followers of Bon. It is almost never climbed. It is walked round: a 52-kilometer circuit (the kora or parikrama), clockwise for Hindus and Buddhists and anticlockwise for Bon practitioners, cresting the 5,600-meter Drolma La pass (`r ≈ 0.52`).',
          'Two distinct claims had been blended together in our initial proposal (`PROPOSAL.md`). The first, following Piasecki’s “A Mountain as Multiverse,” is a **spatial-mandala hypothesis**: Kailas acts as a shared cosmic axis (`axis mundi` / mandala center) onto which coexisting devotional, cosmological, and biographical worlds are projected as a function of where the pilgrim stands along the circuit (`φ = f(r)`). The second, borrowing Ivo Dinov’s complex-time (`spacekime`, `κ = r · e^{iφ}`) formalism, is a **multi-temporal / two-clock hypothesis**: Kailas texts and narratives encode an independent temporal dimension (`φ ≠ f(r)`) that decouples from physical route progress.',
        ],
        aside:
          'When an instrument bundles two orthogonal hypotheses into one binary score, opposite effects cancel. Unbundling them turned an ambiguous null into a sharp double dissociation.',
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
                  'Bon `གཡུང་དྲུང་དགུ་བརྩེགས` (*Yungdrung Gutsek*) nine stepped terraces (`45.0%` architectural tier rate, `+53.79` bits MDL).',
              },
              {
                label: 'II · Four-Gated Bhūpura',
                detail:
                  'Square mandala palace (`གྲུ་བཞི་སྒོ་བཞི`) & four river headwaters (Indus, Sutlej, Brahmaputra, Karnali) radiating from the axis.',
              },
              {
                label: 'III · Pramāṇa Triangulation',
                detail:
                  'Sanskrit metrological survey verses (`योजन` *yojana*, `उच्छ्राय/विस्तार`: `49.5%` in Kailas passages, `+11.12` bits).',
              },
              {
                label: 'IV · 52-km S¹ Kora Loop',
                detail:
                  'Dotted pilgrim circuit cresting the 5,630 m Drolma La pass (`r = 0.52`, `0.00` phase defect across Stages 2–5).',
              },
            ],
            caption:
              'Archival copperplate reconstruction synthesizing the geometric primitives empirically enriched across our 2,626-passage Sanskrit, Classical Tibetan, and Bon corpus.',
          },
        ],
      },
      {
        title: 'Study 1A: Self-caught aggregation cancellation across 2,362 blind-labeled passages',
        body: [
          'In Corpus v2 (`RESULTS.md`), we collected open-license texts across 15+ languages (`206` CC0 Tibetan/Bon texts, `1,459` Sanskrit texts, `51` pre-1928 accounts), caught and retracted a first-pass `multilingual-e5` embedding false positive (`3%` top-window precision driven by genre and name collisions), and had blind raters score `2,362` deduplicated 120-token passages (`0/1/2`) plus category codes `(a)` cyclic cosmic time, `(b)` rebirth cycles, `(c)` coexisting worlds, `(d)` time deities, `(e)` spatial axis mundi / mandala, and `(f)` bardo / non-linear time.',
          'Our v2 analysis script (`analyze2.py`) pooled all six categories `(a..f)` into a single binary indicator (`label >= 1`) and discarded the rater-assigned `cats` column—producing an opaque null in Sanskrit (`−3.39 [−11.35, +4.80]`, `N = 574`) and an underpowered positive in Tibetan (`+6.11 [−7.18, +20.35]`, `N = 46`). Decomposing the exact same 2,362 blind labels by spatial (`cat e`) versus multi-temporal (`cats a,b,d,f`) categories with 2,000-draw document-clustered bootstrap CIs (`analyze_v3.py`, `RESULTS_V3.md`) exposed a classic aggregation cancellation: in English, Sanskrit, and Tibetan, Kailas is **significantly higher** than religion controls on **spatial axis/mandala cosmology (`only e`)** and **significantly lower** than religion controls on **multi-temporal cosmology (`cats a,b,d,f`)**.',
        ],
        figures: [
          {
            kind: 'table',
            title:
              'Spatial-Mandala (`cat e`) vs. Multi-Temporal (`cats a,b,d,f`) Double Dissociation (2,362 v2 passages, Kailas minus Religion Controls per 100 [95% CI])',
            head: [
              'Language (Kailas N)',
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
              'In Sanskrit and Tibetan, positive spatial-mandala enrichment (+3.38, +14.74) and negative multi-temporal depletion (−8.43, −4.59) cancelled when summed in v2.',
          },
        ],
      },
      {
        title: 'Study 1B: Classical Tibetan & Bon canonical recovery (42 → 282 target passages)',
        body: [
          'Why did Corpus v2 find only 46 Tibetan Kailas passages (only 5 in the 206 full-text CC0 `bocorpus` Derge Kangyur and Bon Kangyur works, 3 of which were modern publisher colophon mentions `<<གངས་ཏི་སེའི་བོན་གཞུང་རིག་མཛོད་>>`), while finding 4,888 Tibetan Mount Meru passages? Auditing `passages.py` and `lexicon_verified.json` uncovered a philological blind spot: `passages.py` manually patched classical Tibetan Meru names (`རི་རབ`, `ལྷུན་པོ`) on line 19, whereas `lexicon_verified.json` stored `"Tise"` only in **Latin** script (`script: "Latn"`) and matched only modern colloquial `གངས་ཏི་སེ` and `གངས་རིན་པོ་ཆེ` in Tibetan script.',
          'In classical Tibetan sutra/tantra verse (`Derge Kangyur`) and Bon texts (`Bon Kangyur`), Mount Kailas/Tise is written with reversed compound order (`ཏི་སེའི་གངས`, `ཏི་སེ་གངས`), an intervening epithet (`གངས་དཀར་ཏི་སེ` “White Snow Tise”, `རི་བོ་གངས་ཅན་ཏི་སེ`, `རི་བོ་ཏི་སེ`), standalone `ཏི་སེ`, Sanskrit loan `ཀཻ་ལཱ་ས`, or under its canonical Bon cosmological name `གཡུང་དྲུང་དགུ་བརྩེགས` (*Yungdrung Gutsek*, the Nine-Stacked Swastika Mountain at the center of Olmo Lungring—which `collect/nl_bdrc.py` had explicitly queried on line 10!).',
          'Recovering and blind-rating 264 new classical Tibetan/Bon passages (`make_bo_v3.py`, `n = 88` dual-rater overlap agreement `0.95`, `κ = 0.90`; spatial-`e` `κ = 0.87`) expanded the labeled Tibetan/Bon target corpus from 42 clean v2 passages to **282 passages across 145 canonical works** (`173` classical `ཏི་སེ`/`ཀཻ་ལཱ་ས` passages across `113` works + `109` Bon Kangyur `གཡུང་དྲུང་དགུ་བརྩེགས` passages across `32` works). The double dissociation held with massive power: classical `ཏི་སེ` is enriched by **+21.1 [+11.6, +31.4]** per 100 on spatial axis/mandala `cat e` (**+42.0 [+23.6, +57.1]** in full-text Derge/Bon Kangyur), Bon *Yungdrung Gutsek* is enriched by **+44.1 [+33.3, +58.7]** on `cat e` and **+15.7 [+7.0, +24.8]** on `cat c` (Olmo Lungring as a coexisting realm), and both show a **tight null on multi-temporal concepts (`+1.2 [−7.2, +10.8]` and `+1.5 [−5.3, +8.2]`)** relative to Tibetan religion controls.',
        ],
        figures: [
          {
            kind: 'table',
            title:
              'Classical Tibetan & Bon Corpus v3 (`N = 282` target passages vs `220` religion & `100` Meru controls, document-clustered 95% CIs)',
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
              'Recovering classical ཏི་སེ epithets and Bon གཡུང་དྲུང་དགུ་བརྩེགས increased canonical Tibetan/Bon coverage 6.7× (dual-rater overlap κ = 0.90).',
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
                note: 'caught Simpson cancellation: positive spatial (e) cancelled negative temporal (a,b,d,f)',
              },
              {
                label: 'v3: Category-decomposed + Classical Tibetan/Bon recovery',
                status: 'pass',
                note: '2,626 passages (κ = 0.90): proves spatial-mandala lift (+3.38 to +44.1) & temporal null/depletion',
              },
              {
                label: 'v2 Coding: 446 dual-coded windows + Full-Circuit Kora (r ∈ [0, 1])',
                status: 'pass',
                note: 'separates Hajj calendar liturgy (16.7%, p = 0.0022) from Kailas route-aligned mandala (20.0%, p = 0.0017)',
              },
            ],
            caption:
              'Every methodological upgrade came from auditing a confound or blind spot in the prior pass.',
          },
        ],
      },
      {
        title:
          'Study 2: 446 dual-coded pilgrimage windows—Hajj liturgical calendars vs. the 52-km Kailas kora mandala',
        body: [
          'In our initial 195-window coding pass (`coding/RESULTS_CODING.md`, 124 experience episodes across 20 books, α = 0.82), calendar-decoupled episodes (`clock = independent`, `|F| >= 2`) appeared at 14.7% in Hajj and Holy Land accounts versus 1.3% in Kailas-region accounts, but the 20-account permutation test was underpowered (`p = 0.129`) and the Hajj/Holy Land sample (`n = 37`) sat below Rissanen’s Two-Clock MDL parameter-penalty breakeven (`n* ≈ 95`). Worse, 19th-century Victorian/Edwardian explorers in the Kailas group (`Strachey`, `Rawling`, `Landor`, `Wilson`, `Moorcroft`) were mapping topography rather than walking the contemplative kora circuit.',
          'To test both regimes at full power (`coding/RESULTS_CODING_V2.md`), we (1) expanded the public-domain sample to **368 dual-coded windows (`254` consensus experience episodes: `134` Kailas-region, `96` Hajj/Holy Land liturgical, `24` other comparisons; Krippendorff `α = 0.94` `kind`, `0.87` `clock`, `0.86` `decoupled`)**, and (2) performed the first **full-circuit sequential coding along `r ∈ [0.00, 1.00]`** across **66 kora circuit episodes** from three traditions: **Colin Thubron’s** *To a Mountain in Tibet* (`36` circuit + `12` approach episodes coded strictly by EPUB locator and 12-char SHA-1 hash, `α = 0.83`), **Ekai Kawaguchi’s** 1900 Buddhist monk circuit (`12` episodes), and **Sven Hedin’s** 1907 ethnographic circuit (`18` episodes).',
          'The expanded public-domain study confirmed that **calendar-decoupled ritual time (`clock = independent`)** is a statistically significant signature of **Hajj & Holy Land liturgy (`16.7%` strict, `16/96`, `19.8%` loose)** versus **Kailas-region explorer accounts (`3.0%` strict, `4/134`)** and **non-liturgical comparisons (`0.0%`, `0/24`; account-level permutation difference `−15.6 pp`, `p = 0.0022`)**. Yet prospectively running the leak-free Rissanen Two-Clock MDL test (`primitives/multi_clock.py`) at `n = 96` (`> n* ≈ 95`) showed that conditioning narrative frame shifts (`shift != none`) on `clock = independent` gains `< 0.02` bits/episode (`−1.40` bits on Hajj/Holy Land; `+2.03` bits on Kailas), whereas separating `venue` and `oracle` finality clocks in **`Statebook` financial settlement (`n = 240`)** saves **`+51.62` bits (`+0.215` bits/event)**.',
          'Meanwhile, tracking **Colin Thubron’s full 52-km kora circuit (`r ∈ [0.00, 1.00]`, Chapters 13–15)** revealed why 19th-century surveyor snippets missed the ritual architecture of Kailas: across all 64 consensus experience episodes on the three full kora circuits (Thubron `35/35`, Kawaguchi `12/12`, Hedin `15/17`), **96.9% (`62/64`) braid two or more simultaneous interpretive frames** and **75.0% (`48/64`) exhibit frame or observer shifts** (vs `47.0%` and `18.7%` in off-circuit explorer windows). Along Thubron’s circuit, **route-aligned spatial mandala phase (`clock = aligned`, `φ = f(r)`) reaches `20.0%` strict (`7/35`, `34.3%` loose)—`9×` higher than in 19th-century surveyor logs (`2.2%`, `p = 0.0017`)—peaking at `50.0%` strict (`62.5%` loose) in Stage 5 (`r ∈ [0.58, 0.84]`, post-Drolma La descent & Zutulpuk Milarepa/Bon cave)**. Crucially, **calendar-decoupled time (`11.4%` strict on circuit) is `75%` (`3/4`) confined to Stage 1 (`r ∈ [0.00, 0.14]`, Tarboche flagpole)** where Thubron arrives during the **Saga Dawa full-moon festival**, and drops to **`0.0%` (`0/24` strict)** across the entire mountain circuit proper (**Stages 2–5, `r ∈ [0.14, 0.84]`**: Lha-chu, Choku, Dirapuk North Face, Shiva-tsal *Bardo*, **Drolma La pass at `r = 0.52`**, Gauri Kund, and Zutulpuk).',
        ],
        figures: [
          {
            kind: 'bars',
            title:
              'Route-Aligned Mandala (`clock = aligned`) vs. Calendar-Decoupled (`clock = independent`) Share Across Regimes',
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
                note: '16/96 strict (19.8% loose); p = 0.0022 vs Kailas explorers',
                tone: 'warn',
              },
              {
                label: 'Kailas 19th-c. Explorer Sample (n = 134): Calendar-Decoupled',
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
              'On the Kailas circuit, interpretive phase is a function of spatial topology r (φ = f(r)); in Hajj and Holy Land accounts, an external liturgical calendar runs orthogonal to the road (φ ≠ f(r)).',
          },
          {
            kind: 'demo',
            id: 'kora',
          },
        ],
      },
      {
        title: 'Study 3: Ancient ciphers vs. architectural pramāṇa blueprints across 1,084 passages',
        body: [
          'Classical Indic and Himalayan traditions developed four distinct encoding families: phonetic consonant-to-digit hashing (*Kaṭapayādi*, `अङ्कस्य वामा गतिः`), object-numeral chronograms (*Bhūtasaṃkhyā*), Pingala’s binary `laghu/guru` (`0/1`) prosodic meter (*Chandaḥśāstra*), and polysemic *Sāṃdhyābhāṣā* (“Twilight Language”) pairing subtle-body anatomy (`चक्र/नाडी`, `རྩ་/རླུང་/ཐིག་ལེ`) with mandala geometry. Because every Sanskrit consonant maps to a digit `0–9`, unconstrained *Kaṭapayādi* searches over sacred texts notoriously fabricate spurious constants unless gated by information-theoretic controls.',
          'Auditing `482` blind-labeled Sanskrit passages (`89` recovered from romanized ISO-15919/IAST in `dcs:*` and `sarit:*` via lossless phonological normalization) and `602` disjoint Classical Tibetan/Bon passages (`analysis/ciphers.py`, `analysis/pramana_colophons.py`) establishes a clean separation between numerological apophenia and genuine ancient encoding. Unconstrained *Kaṭapayādi* hits for sacred/astronomical prefixes (`108`, `432`, `1008`, `31415`) occur at **`77.4%` in Kailas vs `79.7%` in controls and `82.5% ± 1.7%` across 200 shuffled-akṣara permutations (`ΔMDL = −3.16 bits`)**. By contrast, explicit **cosmographic *pramāṇa* metrology** (`योजन` *yojana*, elevation/breadth axes: `49.5%` in Kailas vs `27.2%` in religion controls, **`+11.12 bits`**), *Bhūtasaṃkhyā* density (**`+3.74 bits`**), and **Tibetan/Bon architectural-mandala & subtle-body registers** (`100%` presence and `45.0%` multi-tier architecture in Bon *Yungdrung Gutsek* vs `1.4%` in controls, **`+53.79 bits`**; **`+110.98 bits` pooled across `sa + bo`**) genuinely compress blind-rated spatial cosmology (`cat e`).',
        ],
        aside:
          'Unconstrained consonant numerology loses bits against shuffled syllables (−3.16 bits); surveyed architectural geometry and subtle-body mandala registers save +110.98 bits.',
        figures: [
          {
            kind: 'table',
            title:
              'Anti-Apophenia Cipher & Pramāṇa MDL Audit (`N = 1,084`: 482 Normalized Sanskrit + 602 Disjoint Classical Tibetan/Bon Passages)',
            head: [
              'Encoding Channel / Hypothesis',
              'Target Rate',
              'Control / Null Rate',
              'Rissanen ΔMDL',
              'Verdict',
            ],
            rows: [
              [
                'Unconstrained Sanskrit Kaṭapayādi (`108/432/1008/31415`)',
                '77.4% (Kailas)',
                '82.5% ± 1.7% (shuffled)',
                '−3.16 bits',
                'Falsified (apophenia)',
              ],
              [
                'Sanskrit Pingala Chandas Binary Prosody (`10,657` anuṣṭubh pādas)',
                '0.972 bits/syl',
                '0.971 bits/syl (rel.)',
                '0.00 bits',
                'Metric carrier (checksum)',
              ],
              [
                'Sanskrit Bhūtasaṃkhyā Density (`≥ 3` distinct object-numerals)',
                '15.5% cosmology',
                '5.7% low-density',
                '+3.74 bits',
                'Backed (chronograms)',
              ],
              [
                'Sanskrit Pramāṇa Metrology (`yojana` + geometric axes)',
                '49.5% Kailas / 44.8% Meru',
                '27.2% religion',
                '+11.12 bits',
                'Backed (3D blueprint)',
              ],
              [
                'Tibetan/Bon Architectural Mandala + Dpag-tshad Tiers (`N = 602`)',
                '45.0% Bon (`≥ 2` tiers)',
                '1.4% religion',
                '+53.79 bits',
                'Backed (`cat e` predictor)',
              ],
              [
                'Pooled Cross-Linguistic Mandala × Subtle-Body Register (`N = 1,084`)',
                '36.3%–47.7% `cat e`',
                '9.7% unflagged',
                '+110.98 bits',
                'Backed (+0.102 b/passage)',
              ],
            ],
            caption:
              'All Rissanen/BIC `ΔMDL` scores (`L_null − L_model`) pay explicit `(k/2) log₂ n` parameter penalties (`results_ciphers.json`, `results_pramana_colophons.json`).',
          },
        ],
      },
      {
        title: 'Study 4: From Twilight Language to a Lean-verified cellular sheaf across physics & AI',
        body: [
          'Why did four rival traditions (Hindu, Buddhist, Bon, Jain) converge on one unclimbed mountain without erasing each other’s cosmology? Kailas operates as a physical **cellular sheaf** (`primitives/mandala_sheaf.py`, machine-checked with zero `sorry` in `primitives/lean_sheaf/MandalaSheaf.lean`): the 52-km kora loop `S¹` serves as a shared base manifold `r ∈ [0, 1]`, while `6` pairwise-orthogonal *Sāṃdhyābhāṣā* registers (`P_jᵀ P_k = 0`, max crosstalk `4.44 × 10⁻¹⁶`) carry simultaneous physical, cosmological, devotional, and historical states over every landmark (`+82.20 bits` cross-coder fiber agreement). Across all `24` mountain episodes (Stages 2–5, `r ∈ [0.14, 0.84]`), spatial phase transport `φ(r) = 2πr` has **`0.000000` (`4.58 × 10⁻¹⁶`) coboundary defect**, whereas **`0.6109` mean defect** concentrates strictly at the Stage 1 Saga Dawa lunar-festival flagpole and Stage 6 plain exit.',
          'Once formalized in Lean 4.28 (`[propext, Quot.sound]`), the exact same sheaf coboundary invariant (`dim H⁰`, Laplacian frustration `λ_min(L_F)`, and closed-loop holonomy) bridges three domains across this research portfolio: (1) **Causal spacetime diamonds** (`A → {B, C} → D`), where loop holonomy recovers Riemann curvature deficit angles to `2.22 × 10⁻¹⁶` rad (`+142.64 bits` MDL in flat Minkowski); (2) **Abramsky–Brandenburger quantum contextuality** (`primitives/empirical_contextuality.py`), where strong LP duality (`gap < 10⁻¹⁰`) proves that Tsirelson Bell non-locality (`CF = √2 − 1 = 0.414214`) and state-independent Mermin–Peres `3 × 3` Magic Square contextuality (`CF = 1.000000` on both Bell `|Φ⁺⟩` and product `|00⟩` states) equal an exact cross-context **`Statebook` epistemic Dutch-book arbitrage edge**; and (3) **Live LLM world-model probing** (`primitives/llm_sheaf_probe.py`), where `64` GPU forward passes on `Qwen3-1.7B-Base` across `direct`, `equivalence`, Pauli-X `negation`, and `sycophancy` frames expose a **`−31.2 pp` (`87.5% → 56.2%`) sycophancy collapse** and separate a **`100.0%` (`8/8`) multi-frame error rate** from `50.0%` in the low-frustration half using **zero ground-truth labels (`+2.33 bits` MDL)**.',
        ],
        figures: [
          {
            kind: 'plate',
            title:
              'Plate II — Multi-Channel Symbolic Superlanguage: From Yantra & Chandas Prosody to Cellular Sheaves & Holonomy',
            src: '/illustrations/samdhyabhasa-sheaf-plate.jpg',
            alt: 'Copperplate triptych showing a Sri-yantra ringed by binary prosodic dashes and dots on the left, an S1 circle lifting into three orthogonal fiber planes in the center, and a causal diamond beside a twisted Mobius holonomy ribbon on the right',
            legend: [
              {
                label: 'Left · Yantra + Chandas Parity',
                detail:
                  'Prefix-free Elias-gamma syntax (`∑ 2^{−K} ≤ 1`) paired with Pingala `laghu/guru` syllabic parity + CRC-8 *mudrā* seal (`100%` 1-symbol mutation catch).',
              },
              {
                label: 'Center · S¹ Orthogonal Fiber Bundle',
                detail:
                  'Lean-proved zero-crosstalk *Sāṃdhyābhāṣā* register projection (`dot u (a•u + b•v) = a`) over kora coordinate `r ∈ [0, 1]`.',
              },
              {
                label: 'Right · Causal Diamond & Möbius H¹',
                detail:
                  'Local 2-observer consistency (`dim H⁰ = 2`, `0.0` signaling TV) coexisting with global loop obstruction (`dim H⁰ = 0`, `CF = √2 − 1` or `1.0`).',
              },
            ],
            caption:
              'Visual grammar of `MandalaSheaf`: ancient multi-channel compression upgraded into linear/sheaf invariants verified in Lean 4.28 and Python.',
          },
          {
            kind: 'demo',
            id: 'sheaf',
          },
        ],
      },
      {
        title: 'Where this stands: scholar handoff packs and cross-tradition kora maps',
        body: [
          'To replace model raters with specialist philologists on the primary languages, `scholar-handoff/` now provides group-blinded packets with 8 embedded test-retest repeats each—including `sheets/sanskrit_v2_normalized.csv` (`233` rows with `51` previously romanized IAST passages normalized to Devanagari) and `sheets/tibetan_bon_v3.csv` (`128` rows spanning classical `ཏི་སེ` and Bon `གཡུང་དྲུང་དགུ་བརྩེགས`), alongside `sheets/tibetan_bon.csv` (`115` v2 rows) and the 40-episode `coding/work/human_pack.csv` double-coding sheet.',
        ],
        figures: [
          {
            kind: 'roadmap',
            title: 'Research ledger status',
            done: [
              'Spatial-Mandala (`cat e`) vs. Multi-Temporal (`cats a,b,d,f`) double dissociation proved across 2,362 v2 + 282 Tibetan/Bon v3 passages (κ = 0.90)',
              'Anti-apophenia cipher & pramāṇa MDL audit across 1,084 passages: Kaṭapayādi numerology falsified (−3.16b); pramāṇa (+11.1b) & mandala registers (+111.0b) backed',
              'Full-circuit S¹ kora sheaf (`0.00` defect on Stages 2–5 vs `0.61` boundary; `+82.2b` coder fiber MDL) & Lean 4.28 zero-sorry soundness kernel (`MandalaSheaf.lean`)',
              'Exact LP equivalence of quantum contextuality (`CF = 0.414 / 1.0`) with Statebook Dutch books, plus live 64-pass Qwen3-1.7B sheaf probe (`−31.2 pp` sycophancy drop)',
            ],
            next: [
              'Collect specialist human ratings on `sanskrit_v2_normalized.csv` (233 rows), `tibetan_bon_v3.csv` (128 rows), and `human_pack.csv` (40 episodes)',
              'Train an unsupervised sheaf-Dirichlet anti-sycophancy `OrthoDelta` adapter on Qwen3-1.7B-Base minimizing 4-frame `x^T L_F x` with zero WikiText drift',
              'Extract landmark-level topological graphs across Hindu Purāṇas, Tibetan *Ti se’i dkar chag*, and Bon *Olmo Lungring* maps',
            ],
            blocked: [
              'Un-OCRed Bon canonical manuscript scans (Zhang Zhung Nyan Gyud, Gzer mig) and BDRC sealed lineage-restricted texts (excluded by ethics policy)',
              'Any claim about unmediated lived consciousness from textual or neural representations alone',
            ],
            caption:
              'All code, manifests, Lean 4 proofs, 5 SHA-256 receipts, locator-only kora codings, and scholar handoff sheets live in `Epistetechnician/kailas-corpus` and `patelshaan-lab/primitives`.',
          },
        ],
      },
    ],
  },
  sources: [
    {
      label: 'Epistetechnician/kailas-corpus & patelshaan-lab/primitives (GitHub)',
      url: 'https://github.com/Epistetechnician/kailas-corpus',
      why: 'Open-license manifests, Corpus v3 (`RESULTS_V3.md`), cipher & pramāṇa MDL receipts (`analysis/ciphers.py`, `pramana_colophons.py`), Lean 4 `MandalaSheaf.lean`, contextuality LP, Qwen3-1.7B probe, and scholar-handoff v2 packets.',
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
