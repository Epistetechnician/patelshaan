/*
 * The humanistic layer: the reading behind the research, the questions it keeps
 * returning to, and which essay sits beside which inquiry.
 * Every title, author and year here was chosen to be checkable.
 */

export type Work = {
  id: string
  by: string
  title: string
  year: string
  /** one sentence: why it sits on this shelf */
  note: string
  url?: string
}

export const works: Record<string, Work> = {
  plutarch: {
    id: 'plutarch',
    by: 'Plutarch',
    title: 'Life of Theseus',
    year: 'c. 100 CE',
    note: 'The origin of the puzzle: an Athenian ship kept for centuries by replacing each plank as it rotted, and the philosophers who argued over whether it was still the same ship.',
  },
  hobbes: {
    id: 'hobbes',
    by: 'Thomas Hobbes',
    title: 'De Corpore',
    year: '1655',
    note: 'Adds the sharper twist: collect the discarded planks, rebuild the ship from them, and now two vessels claim one name.',
  },
  parfit: {
    id: 'parfit',
    by: 'Derek Parfit',
    title: 'Reasons and Persons',
    year: '1984',
    note: 'Asks what matters in survival once identity gives out, and answers with continuity of connection, not sameness of stuff. A better question for a model that keeps learning than “is it the same model?”',
  },
  quine: {
    id: 'quine',
    by: 'W. V. Quine',
    title: 'Word and Object',
    year: '1960',
    note: 'Argues that all the behavior in the world can fail to fix a single translation. Any claim about what a network “means”, drawn from its outputs alone, inherits the same underdetermination.',
  },
  borges: {
    id: 'borges',
    by: 'Jorge Luis Borges',
    title: '“Funes el memorioso”',
    year: '1942',
    note: 'A man who forgets nothing and so cannot think. A short proof, in fiction, that forgetting belongs to intelligence and is not only its failure.',
  },
  luria: {
    id: 'luria',
    by: 'A. R. Luria',
    title: 'The Mind of a Mnemonist',
    year: '1968',
    note: 'A clinical, sympathetic case study of a man whose memory had no apparent limit and who struggled to hold a thought together.',
  },
  arendt: {
    id: 'arendt',
    by: 'Hannah Arendt',
    title: 'The Human Condition',
    year: '1958',
    note: 'Names promising as the remedy for an unpredictable future. A monitor with a locked prediction is a promise written before the change, with all of a promise’s fragility.',
  },
  lind: {
    id: 'lind',
    by: 'James Lind',
    title: 'A Treatise of the Scurvy',
    year: '1753',
    note: 'Reports the 1747 comparison on a single ship: pairs of sick sailors, different remedies, otherwise equal conditions. Matched-progress testing is that idea carried into machine learning.',
  },
  hill: {
    id: 'hill',
    by: 'A. Bradford Hill',
    title: '“The Environment and Disease: Association or Causation?”',
    year: '1965',
    note: 'Nine considerations for moving from a correlation toward a cause, offered as viewpoints and not as a checklist. Humility, turned into a method.',
  },
  rosenthal: {
    id: 'rosenthal',
    by: 'Robert Rosenthal',
    title: '“The File Drawer Problem and Tolerance for Null Results”',
    year: '1979',
    note: 'Named the bias of the unpublished null. A record that keeps its negative results is a small act against it.',
  },
  mccloskey: {
    id: 'mccloskey',
    by: 'Michael McCloskey & Neal Cohen',
    title: '“Catastrophic Interference in Connectionist Networks”',
    year: '1989',
    note: 'The paper that gave machine learning its word for new learning overwriting old.',
  },
  saltzer: {
    id: 'saltzer',
    by: 'Jerome Saltzer & Michael Schroeder',
    title: '“The Protection of Information in Computer Systems”',
    year: '1975',
    note: 'Least privilege, fail-safe defaults, complete mediation. Fifty years on, the principles read like constitutional law for software.',
  },
  hardy: {
    id: 'hardy',
    by: 'Norm Hardy',
    title: '“The Confused Deputy”',
    year: '1988',
    note: 'A program with real authority is tricked into spending it on someone else’s behalf. The story that made capability systems make sense.',
  },
  miller: {
    id: 'miller',
    by: 'Mark S. Miller',
    title: 'Robust Composition: Towards a Unified Approach to Access Control and Concurrency Control',
    year: '2006',
    note: 'Shows how object-capabilities let mutually suspicious principals compose work safely without ambient authority, the architectural ancestor of Playbox grants and FormaSec kernels.',
  },
  elster: {
    id: 'elster',
    by: 'Jon Elster',
    title: 'Ulysses and the Sirens',
    year: '1979',
    note: 'On binding oneself in advance, with the sailor tied to the mast as the figure. A single-use capability is a rope tied while the one tying it was still in their right mind.',
  },
  madison: {
    id: 'madison',
    by: 'James Madison',
    title: 'The Federalist No. 51',
    year: '1788',
    note: 'The argument for dividing power so that no part has to be trusted to restrain itself.',
  },
  montesquieu: {
    id: 'montesquieu',
    by: 'Montesquieu',
    title: 'De l’esprit des lois',
    year: '1748',
    note: 'Source of the idea that power should check power, which a broker kept apart from the thing it brokers puts into practice at small scale.',
  },
  lakatos: {
    id: 'lakatos',
    by: 'Imre Lakatos',
    title: 'Proofs and Refutations',
    year: '1976',
    note: 'A classroom dialogue in which a proof improves by being attacked with counterexamples. Adversarial mutation is the same method run by machine.',
  },
  porter: {
    id: 'porter',
    by: 'Theodore M. Porter',
    title: 'Trust in Numbers',
    year: '1995',
    note: 'Shows that quantification is often how institutions become trustworthy to strangers, more than a route to truth. Worth reading before designing any benchmark.',
  },
  strathern: {
    id: 'strathern',
    by: 'Marilyn Strathern',
    title: '“‘Improving Ratings’: Audit in the British University System”',
    year: '1997',
    note: 'The source of the usual wording of Goodhart’s law: when a measure becomes a target, it ceases to be a good measure.',
  },
  dwork: {
    id: 'dwork',
    by: 'Cynthia Dwork, Vitaly Feldman, Moritz Hardt, Toniann Pitassi, Omer Reingold & Aaron Roth',
    title: '“The Reusable Holdout: Preserving Validity in Adaptive Data Analysis”',
    year: '2015',
    note: 'Proved that adaptive analysts overfit a static holdout even without seeing its rows, and framed holdout reuse as an information-budget problem.',
    url: 'https://www.science.org/doi/10.1126/science.aaa9375',
  },
  rissanen: {
    id: 'rissanen',
    by: 'Jorma Rissanen',
    title: '“Modeling by Shortest Data Description”',
    year: '1978',
    note: 'Introduced Minimum Description Length: learning is compression, and an explanation that takes as many bits as the data explains nothing.',
  },
  dijkstra: {
    id: 'dijkstra',
    by: 'Edsger W. Dijkstra',
    title: 'Notes on Structured Programming',
    year: '1970',
    note: 'Testing can show the presence of bugs and never their absence. Every passing suite on this site should be read with that sentence beside it.',
  },
  gmr: {
    id: 'gmr',
    by: 'Shafi Goldwasser, Silvio Micali & Charles Rackoff',
    title: '“The Knowledge Complexity of Interactive Proof Systems”',
    year: '1985',
    note: 'The paper that made it possible to convince someone you know a thing without telling them the thing.',
  },
  quisquater: {
    id: 'quisquater',
    by: 'Jean-Jacques Quisquater and colleagues',
    title: '“How to Explain Zero-Knowledge Protocols to Your Children”',
    year: '1989',
    note: 'The cave with a magic door, and the first explanation of zero knowledge a child could follow.',
  },
  shapin: {
    id: 'shapin',
    by: 'Steven Shapin',
    title: 'A Social History of Truth',
    year: '1994',
    note: 'How seventeenth-century English gentlemen came to be believed, and why knowledge has always rested on whom we are willing to take at their word.',
  },
  shapinSchaffer: {
    id: 'shapinSchaffer',
    by: 'Steven Shapin & Simon Schaffer',
    title: 'Leviathan and the Air-Pump',
    year: '1985',
    note: 'The dispute over Boyle’s experiments, and how a witnessed experiment became evidence. Offline verification is a distant descendant of the witness.',
  },
  poovey: {
    id: 'poovey',
    by: 'Mary Poovey',
    title: 'A History of the Modern Fact',
    year: '1998',
    note: 'On double-entry bookkeeping as an early engine of the idea that a fact is something recorded, checkable and numerical.',
  },
  pacioli: {
    id: 'pacioli',
    by: 'Luca Pacioli',
    title: 'Summa de arithmetica, geometria, proportioni et proportionalita',
    year: '1494',
    note: 'The first printed account of double-entry bookkeeping, tucked inside a book mostly about mathematics.',
  },
  schmandt: {
    id: 'schmandt',
    by: 'Denise Schmandt-Besserat',
    title: 'Before Writing',
    year: '1992',
    note: 'Argues that sealed clay tokens, the receipts of the ancient Near East, were a step toward writing itself. Disputed in parts, and still a good account of why evidence has to travel.',
  },
  ostrom: {
    id: 'ostrom',
    by: 'Elinor Ostrom',
    title: 'Governing the Commons',
    year: '1990',
    note: 'Shows that communities govern shared resources by rules they can see and enforce, and that the story of inevitable ruin is not the whole of the record.',
  },
  mauss: {
    id: 'mauss',
    by: 'Marcel Mauss',
    title: 'The Gift',
    year: '1925',
    note: 'On how gifts bind people in obligation, and why exchange has never been only about the thing exchanged.',
  },
  eisenstein: {
    id: 'eisenstein',
    by: 'Charles Eisenstein',
    title: 'Sacred Economics',
    year: '2011',
    note: 'The book behind the essay of the same name on this site: money shapes the kinds of relation we can have with one another.',
    url: 'https://sacred-economics.com/',
  },
  graeber: {
    id: 'graeber',
    by: 'David Graeber',
    title: 'Debt: The First 5,000 Years',
    year: '2011',
    note: 'A long argument that debt is older than coin, and that credit is a moral idea before it is a financial one.',
  },
  hayek: {
    id: 'hayek',
    by: 'Friedrich A. Hayek',
    title: '“The Use of Knowledge in Society”',
    year: '1945',
    note: 'The case that knowledge is dispersed and prices carry it. A limit on any design that assumes one party can see everything.',
  },
  akerlof: {
    id: 'akerlof',
    by: 'George A. Akerlof',
    title: '“The Market for ‘Lemons’”',
    year: '1970',
    note: 'What happens to a market when buyers cannot tell good from bad. The economic form of the provenance problem.',
  },
  feynman: {
    id: 'feynman',
    by: 'Richard P. Feynman',
    title: '“Cargo Cult Science”',
    year: '1974',
    note: 'The first principle is that you must not fool yourself, and you are the easiest person to fool.',
  },
  merton: {
    id: 'merton',
    by: 'Robert K. Merton',
    title: '“The Normative Structure of Science”',
    year: '1942',
    note: 'Lists organized skepticism and communalism among the norms that make a community of inquirers worth trusting.',
  },
  eliadeReturn: {
    id: 'eliadeReturn',
    by: 'Mircea Eliade',
    title: 'The Myth of the Eternal Return',
    year: '1949',
    note: 'On archaic ritual as the repetition of sacred time, and cyclic time as a structure of meaning.',
  },
  eliadeSacred: {
    id: 'eliadeSacred',
    by: 'Mircea Eliade',
    title: 'The Sacred and the Profane',
    year: '1957',
    note: 'Source of the axis mundi: the sacred place as the center where levels of the world meet.',
  },
  turner: {
    id: 'turner',
    by: 'Victor Turner',
    title: 'The Ritual Process',
    year: '1969',
    note: 'Gave anthropology its vocabulary of liminality and communitas, the idiom pilgrimage scholars still borrow.',
  },
  tuan: {
    id: 'tuan',
    by: 'Yi-Fu Tuan',
    title: 'Space and Place',
    year: '1977',
    note: 'How undifferentiated space becomes place through experience. A reminder that a coordinate is not a pilgrimage.',
  },
  geertz: {
    id: 'geertz',
    by: 'Clifford Geertz',
    title: 'The Interpretation of Cultures',
    year: '1973',
    note: 'Thick description: an act means what it means inside a web of significance. The caution every coded account of belief should carry.',
  },
  kawaguchi: {
    id: 'kawaguchi',
    by: 'Ekai Kawaguchi',
    title: 'Three Years in Tibet',
    year: '1909',
    note: 'A Japanese Zen monk’s firsthand circuit of Kailas, one of the nine public-domain Kailas accounts coded in the pilgrimage episode study.',
  },
  burton: {
    id: 'burton',
    by: 'Richard F. Burton',
    title: 'Personal Narrative of a Pilgrimage to Al-Madinah and Meccah',
    year: '1855',
    note: 'One of the comparison pilgrimage narratives where the coding study found genuine two-clock decoupling between liturgical calendar dates and route progress.',
  },
  thubron: {
    id: 'thubron',
    by: 'Colin Thubron',
    title: 'To a Mountain in Tibet',
    year: '2011',
    note: 'A travel writer’s journey on foot to Kailas; excluded from the public-domain coding release for copyright, kept on the reading shelf.',
  },
  govinda: {
    id: 'govinda',
    by: 'Lama Anagarika Govinda',
    title: 'The Way of the White Clouds',
    year: '1966',
    note: 'A Buddhist pilgrim’s own account of travel in Tibet, on the Kailas study’s reading shelf.',
  },
  thurmanWise: {
    id: 'thurmanWise',
    by: 'Robert Thurman & Tad Wise',
    title: 'Circling the Sacred Mountain',
    year: '1999',
    note: 'A pilgrimage around Kailas told with a scholar’s eye for the Buddhist context.',
  },
  mckay: {
    id: 'mckay',
    by: 'Alex McKay',
    title: 'Kailas Histories: Renunciate Traditions and the Construction of Himalayan Sacred Geography',
    year: '2015',
    note: 'A historian’s account of how the mountain came to be what it is, including how recent some of the settled-seeming claims are.',
  },
  spacekime: {
    id: 'spacekime',
    by: 'Yuxin Wang, Yueyang Shen, Daxuan Deng & Ivo D. Dinov',
    title: '“Determinism, well-posedness, and applications of the ultrahyperbolic wave equation in spacekime”',
    year: '2022',
    note: 'The mathematics of complex time, kime, that the Kailas study tested as a notation. Partial Differential Equations in Applied Mathematics 5, 100280.',
    url: 'https://doi.org/10.1016/j.padiff.2022.100280',
  },
}

export type ThreadId = 'memory' | 'trust' | 'power' | 'measure' | 'commons' | 'sacred' | 'failure'

export type Thread = {
  id: ThreadId
  title: string
  question: string
  /** research page slugs this thread runs through */
  inquiries: string[]
  essay: string[]
  works: string[]
}

export const threads: Thread[] = [
  {
    id: 'memory',
    title: 'Memory and sameness',
    question: 'What does it mean for something that keeps changing to remain itself?',
    inquiries: [
      'temporal-grid-safety',
      'hsi-lab',
      'theseus-lab',
      'aligned-holistic-continual-learning',
    ],
    essay: [
      'Every system that learns is a ship being repaired at sea. The Athenians kept the galley of Theseus for centuries, replacing each plank as it rotted, and philosophers kept asking whether it was still his ship. At Ise in Japan the question is answered by ritual and not by argument: the main shrine is rebuilt beside itself every twenty years, and has been, with some long interruptions, since the late seventh century. The building is the same because the practice of rebuilding it is the same.',
      'A model that keeps learning forces both answers at once. We want it to stay the thing we tested, keeping its refusals through fine-tuning (`temporal-grid-safety`) and its prior facts across tasks (`hsi-lab` / `cl7b`),and we want it to change. Borges imagined the cost of the extreme case in Funes, who remembers everything and therefore cannot think; to think, his narrator says, is to forget differences.',
    ],
    works: ['plutarch', 'hobbes', 'parfit', 'quine', 'borges', 'luria', 'mccloskey'],
  },
  {
    id: 'trust',
    title: 'Testimony and trust',
    question: 'Who gets believed, and what lets a stranger check?',
    inquiries: ['hyperintel', 'playbox', 'caduceus', 'security-alignment-os', 'formasec'],
    essay: [
      'A receipt is a small act of trust made portable. The English Exchequer split wooden tally sticks lengthwise so that creditor and treasury each kept half. The halves matched or they did not, and nobody had to be present to find out. In the seventeenth century the Royal Society took as its motto Nullius in verba, take nobody’s word for it, and then spent decades working out whose witness could stand in for everyone’s. Shapin’s history of that effort is a reminder that evidence is social before it is technical: we check what we can and trust for the rest.',
      'Verification software: hash-chained room histories in `playbox`, RFC 9162 Merkle skill ledgers in `caduceus`, byte-exact admission receipts in `formasec`, and caller-rooted bundles in `hyperintel`; moves trust from the person who made a claim to a small rule a stranger can run offline.',
    ],
    works: ['shapin', 'shapinSchaffer', 'poovey', 'pacioli', 'schmandt', 'akerlof'],
  },
  {
    id: 'power',
    title: 'Power and its limits',
    question: 'How do you give something the means to act while keeping the means to stop it?',
    inquiries: ['formasec', 'security-alignment-os', 'caduceus', 'playbox'],
    essay: [
      'Political thought has long held that power is safest when it cannot act alone. Montesquieu argued that power must check power; Madison, defending the American constitution, put it more bluntly: ambition must be made to counteract ambition. Odysseus had himself bound to the mast before the sirens sang, because he knew that the self who heard them would not be a reliable judge.',
      'Software security found the same shapes by another road: Saltzer and Schroeder’s complete mediation, Hardy’s confused deputy, and Miller’s object-capabilities. Whether it is a pure Rust/Lean admission kernel (`formasec`), a single-use brokered capability (`security-alignment-os`), or an attenuated Biscuit room grant (`playbox`), the engineering question is how to hand an untrusted proposer the power to help without handing over the keys.',
    ],
    works: ['montesquieu', 'madison', 'elster', 'saltzer', 'hardy', 'miller', 'arendt'],
  },
  {
    id: 'measure',
    title: 'Measure and its distortions',
    question: 'What happens to a number once people, or self-improving loops,optimize against it?',
    inquiries: [
      'holdout-ledger',
      'mech-interp-unified',
      'composed-zk-benchmark-os',
      'aligned-holistic-continual-learning',
    ],
    essay: [
      'When a measure becomes a target, it ceases to be a good measure. Strathern’s wording of Goodhart’s law is the shortest account of why benchmarks age, and Dwork and Roth’s reusable-holdout theorem is its mathematical form for adaptive loops that query a test set a thousand times. Porter adds that numbers earn authority because strangers can agree on a rule even when they do not trust one another’s judgment.',
      'Across this portfolio, pricing holdout queries by description length (`holdout-ledger`), planting 8 flaw classes into interpretability gates (`mech-interp-unified`), and mutating ZK traces adversarially (`composed-zk-benchmark-os`) are three instances of Lakatos’s rule: let the counterexamples into the room first.',
    ],
    works: ['dwork', 'rissanen', 'strathern', 'porter', 'lakatos', 'dijkstra', 'lind', 'hill', 'gmr', 'quisquater'],
  },
  {
    id: 'commons',
    title: 'Commons, gift and value',
    question: 'What keeps a shared thing alive, and what does money do to the people sharing it?',
    inquiries: ['playbox', 'hyperintel'],
    essay: [
      'Elinor Ostrom’s field research overturned the story that shared resources are doomed to ruin: communities from Swiss alpine meadows to Philippine irrigation systems governed them well, by rules visible to the people living under them. Mauss had shown earlier that gifts are never free and that obligation is the thread holding a society together; Eisenstein and Graeber ask what happens to that thread when money reduces every relation to static collateral.',
      'Seen this way, the architecture papers on `Statebook` coherence, cash-flow unsecured credit, DAO capital velocity, and on-chain climate MRV belong to the exact same inquiry as multi-owner `playbox` rooms and buyer-controlled `hyperintel` markets: what institutional grammar lets strangers build and transact together without extraction?',
    ],
    works: ['ostrom', 'mauss', 'eisenstein', 'graeber', 'hayek', 'akerlof', 'miller'],
  },
  {
    id: 'sacred',
    title: 'Sacred geography and time',
    question: 'How does one landscape hold several worlds at once?',
    inquiries: ['sacred-geography-kailas'],
    essay: [
      'Mount Kailas is walked round, not climbed. Hindus, Buddhists, Jains and followers of Bon all hold it sacred, and each circles it by its own rule. Eliade called such a place an axis mundi; Turner gave anthropology the vocabulary of liminality; Geertz warned that meaning lives in a thick web of significance that surface counts can easily misread.',
      'Testing complex-time (`kime`) notation across 2,362 passages and 195 coded pilgrimage episodes returned a clean null for Kailas while uncovering where ritual-calendar time and spatial route progress genuinely decouple: Hajj and Holy Land accounts. The study now moves from model raters to blinded Tibetan, Bon, and Sanskrit scholar sheets.',
    ],
    works: ['eliadeSacred', 'eliadeReturn', 'turner', 'tuan', 'geertz', 'kawaguchi', 'burton', 'thubron', 'thurmanWise', 'govinda', 'mckay', 'spacekime'],
  },
  {
    id: 'failure',
    title: 'How to be wrong in public',
    question: 'What does an honest record of failure look like, and who is it for?',
    inquiries: [
      'mech-interp-unified',
      'temporal-grid-safety',
      'hsi-lab',
      'theseus-lab',
      'aligned-holistic-continual-learning',
      'composed-zk-benchmark-os',
    ],
    essay: [
      'Michelson and Morley set out in 1887 to measure the Earth’s motion through the aether and found nothing, and that null result reshaped physics. Rosenthal named the opposite habit, the file drawer where nulls go to disappear. Feynman’s rule against that fate was short: you must not fool yourself, and you are the easiest person to fool.',
      'Catching our own v16 attacker-rate confound (`temporal-grid-safety`), retracting our first-pass Kailas embedding positive (3% precision), showing J-space ties norm-matched PCA (`jspace-pilot`), and keeping Caduceus’s failed 41% false-hold tripwire on the record are the sharpest things on this site, because each one cleared away a mirage and pointed at a real mechanism.',
    ],
    works: ['feynman', 'merton', 'rosenthal', 'lakatos', 'hill', 'dwork'],
  },
]

export const threadById = (id: ThreadId) => threads.find((t) => t.id === id)!

export type EssayNote = {
  threads: ThreadId[]
  inquiries?: string[]
  reading: string[]
}

/** which threads, inquiries and books sit beside each essay */
export const essayNotes: Record<string, EssayNote> = {
  'approaching-breakthroughs-across-systems': {
    threads: ['measure', 'power', 'commons', 'sacred', 'failure'],
    inquiries: [
      'holdout-ledger',
      'formasec',
      'caduceus',
      'playbox',
      'mech-interp-unified',
      'temporal-grid-safety',
      'hsi-lab',
      'sacred-geography-kailas',
    ],
    reading: ['dwork', 'rissanen', 'saltzer', 'miller', 'ostrom', 'feynman', 'geertz'],
  },
  'evidence-bounded-intelligence': {
    threads: ['failure', 'trust', 'power', 'measure'],
    inquiries: [
      'holdout-ledger',
      'formasec',
      'mech-interp-unified',
      'temporal-grid-safety',
      'theseus-lab',
      'security-alignment-os',
      'composed-zk-benchmark-os',
      'hyperintel',
    ],
    reading: ['feynman', 'merton', 'dwork', 'shapin', 'arendt'],
  },
  'ai-research-map-evolution-intelligence-safety-security': {
    threads: ['failure', 'memory', 'measure'],
    inquiries: [
      'holdout-ledger',
      'caduceus',
      'hsi-lab',
      'mech-interp-unified',
      'temporal-grid-safety',
      'formasec',
    ],
    reading: ['feynman', 'rosenthal', 'merton', 'dwork'],
  },
  'continual-learning-and-alignment-benchmarks': {
    threads: ['memory', 'measure'],
    inquiries: ['temporal-grid-safety', 'aligned-holistic-continual-learning', 'hsi-lab'],
    reading: ['mccloskey', 'lind', 'borges', 'strathern'],
  },
  'hybrid-synthetic-data-and-evaluation': {
    threads: ['trust', 'measure'],
    inquiries: ['hsi-lab', 'holdout-ledger'],
    reading: ['porter', 'dwork', 'shapin', 'akerlof'],
  },
  'mechanistic-interpretability-negative-results': {
    threads: ['memory', 'failure', 'measure'],
    inquiries: ['mech-interp-unified', 'theseus-lab'],
    reading: ['quine', 'rosenthal', 'plutarch', 'lakatos'],
  },
  'verifiable-ai-agents': {
    threads: ['power', 'trust'],
    inquiries: ['formasec', 'caduceus', 'playbox', 'security-alignment-os'],
    reading: ['saltzer', 'hardy', 'miller', 'elster', 'madison'],
  },
  'zero-knowledge-mpc-and-post-quantum-security': {
    threads: ['trust', 'measure'],
    inquiries: ['composed-zk-benchmark-os', 'formasec'],
    reading: ['gmr', 'quisquater', 'dijkstra'],
  },
  'decentralized-compute-and-data-provenance': {
    threads: ['trust', 'commons'],
    inquiries: ['hyperintel', 'playbox'],
    reading: ['shapinSchaffer', 'poovey', 'akerlof', 'schmandt'],
  },
  'statebooks-convergence-with-coherence': {
    threads: ['trust', 'measure', 'commons'],
    inquiries: ['hyperintel', 'composed-zk-benchmark-os'],
    reading: ['poovey', 'pacioli', 'porter', 'graeber'],
  },
  'architecture-unsecured-credit': {
    threads: ['commons', 'trust'],
    reading: ['graeber', 'mauss', 'poovey'],
  },
  'sacred-economics-crypto': {
    threads: ['commons'],
    reading: ['eisenstein', 'mauss', 'graeber'],
  },
  'dao-capital-flows': {
    threads: ['commons'],
    reading: ['ostrom', 'hayek'],
  },
  'mrv-onchain': {
    threads: ['trust', 'commons'],
    reading: ['porter', 'ostrom', 'shapin'],
  },
  'p2p-humanitarian': {
    threads: ['commons', 'trust'],
    reading: ['ostrom', 'mauss', 'hayek'],
  },
  'gitcoin-grants': {
    threads: ['commons'],
    reading: ['ostrom', 'hayek', 'mauss'],
  },
  'civic-innovation-genz': {
    threads: ['commons'],
    reading: ['ostrom', 'mauss'],
  },
}
