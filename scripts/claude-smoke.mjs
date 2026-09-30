// Smoke test for the Claude (Anthropic) migration.
//
//   Direct API check only:   node --env-file=.env.local scripts/claude-smoke.mjs
//   Plus the real routes:    npm run dev   (other terminal)
//                            node --env-file=.env.local scripts/claude-smoke.mjs http://localhost:3000
//   Against production:      node --env-file=.env.local scripts/claude-smoke.mjs https://hiringphilippines.careers
//
// Only routes without side effects are called (no DB writes, no Telegram messages).
//
// Needs Node 22.18+ (imports lib/claude.ts through Node's built-in type stripping; on 22.6-22.17
// add --experimental-strip-types). Do not add an "engines" field to package.json for this: the site
// deploys on Vercel, which reads it to pick the production runtime.

let claude
try {
  claude = await import('../lib/claude.ts')
} catch (error) {
  if (error?.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
    console.log(`  FAIL  Node ${process.version} cannot import lib/claude.ts; use Node 22.18+ (or --experimental-strip-types on 22.6-22.17)`)
    process.exit(1)
  }
  throw error
}
const {
  CLAUDE_API_URL,
  CLAUDE_API_VERSION,
  CLAUDE_CHAT_SETTINGS,
  CLAUDE_FALLBACK_MODEL,
  CLAUDE_GRADING_SETTINGS,
  CLAUDE_MODEL,
  claudeStopInfo,
  claudeText,
} = claude

const API_KEY = process.env.CLAUDE_API_KEY
const BASE_URL = process.argv[2]?.replace(/\/$/, '')
const TIMEOUT_MS = 240_000
let failures = 0

function ok(label, detail = '') {
  console.log(`  PASS  ${label}${detail ? `  (${detail})` : ''}`)
}
function fail(label, detail = '') {
  failures += 1
  console.log(`  FAIL  ${label}${detail ? `  (${detail})` : ''}`)
}

async function postJson(url, body, headers = {}) {
  const started = Date.now()
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const text = await response.text()
  let data = null
  try { data = JSON.parse(text) } catch { data = { raw: text.slice(0, 300) } }
  return { status: response.status, data, ms: Date.now() - started }
}

async function directApiCheck() {
  console.log(`\n== Direct Anthropic API check (model ${CLAUDE_MODEL}) ==`)
  if (!API_KEY) {
    fail('CLAUDE_API_KEY missing', 'run with --env-file=.env.local')
    return
  }
  const headers = { 'x-api-key': API_KEY, 'anthropic-version': CLAUDE_API_VERSION }
  const presets = [
    { name: `chat preset ${JSON.stringify(CLAUDE_CHAT_SETTINGS)}`, model: CLAUDE_MODEL, settings: CLAUDE_CHAT_SETTINGS, max_tokens: 120 },
    { name: `grading preset ${JSON.stringify(CLAUDE_GRADING_SETTINGS)}`, model: CLAUDE_MODEL, settings: CLAUDE_GRADING_SETTINGS, max_tokens: 2000 },
    { name: `fallback grader ${CLAUDE_FALLBACK_MODEL} ${JSON.stringify(CLAUDE_GRADING_SETTINGS)}`, model: CLAUDE_FALLBACK_MODEL, settings: CLAUDE_GRADING_SETTINGS, max_tokens: 2000 },
  ]
  for (const preset of presets) {
    try {
      const { status, data, ms } = await postJson(CLAUDE_API_URL, {
        model: preset.model,
        ...preset.settings,
        max_tokens: preset.max_tokens,
        system: 'Reply with exactly one word.',
        messages: [{ role: 'user', content: 'Say pong.' }],
      }, headers)
      if (status !== 200) {
        const message = data?.error?.message || JSON.stringify(data).slice(0, 200)
        fail(preset.name, `HTTP ${status}: ${message}`)
        if (/credit balance/i.test(message)) console.log('  -> Top up Anthropic credit, then rerun this script.')
        continue
      }
      const text = claudeText(data).trim()
      const modelOk = typeof data.model === 'string' && data.model.startsWith(preset.model)
      const detail = `served by ${data.model}, stop=${claudeStopInfo(data)}, out=${data.usage?.output_tokens} tokens, ${ms}ms, text="${text}"`
      if (modelOk && text) ok(preset.name, detail)
      else fail(preset.name, detail)
    } catch (error) {
      const cause = error?.cause?.message ? ` (${error.cause.message})` : ''
      fail(preset.name, (error instanceof Error ? error.message : String(error)) + cause)
    }
  }
}

// The subscriber stays silent; the creator opens with the location hook.
const chatHistory = [
  { role: 'creator', content: 'heyy wait are u living close to me??' },
  { role: 'subscriber', content: 'lol idk where u at' },
  { role: 'creator', content: "I'm from dallas and u?" },
  { role: 'subscriber', content: 'damn im from houston' },
  { role: 'creator', content: 'omg i love to visit there!! my auntie lives there' },
  { role: 'creator', content: 'btw how old are u and what do u do for work?' },
  { role: 'subscriber', content: '42, electrician' },
  { role: 'creator', content: 'so u fix things with ur hands all day?? honestly thats so attractive lol. most guys cant even change a tire lol' },
]

const sextingHistory = [
  { role: 'subscriber', content: 'cant stop thinking about u tonight' },
  { role: 'creator', content: 'mmm is that so mike... what exactly are u thinking about 😏' },
  { role: 'subscriber', content: 'everything. wish i was there' },
  { role: 'creator', content: 'i just filmed something for u... its me in the shower, u would lose ur mind 🥵' },
  { role: 'creator', content: '', contentType: 'video', price: 15, unlocked: true },
  { role: 'subscriber', content: 'holy shit. that was incredible' },
  { role: 'creator', content: 'good boy 😘 i have the full version too if u want to see what happens next' },
]

const aftercareHistory = [
  { role: 'subscriber', content: 'i finished lol' },
  { role: 'creator', content: 'mike... wow. im still catching my breath from that honestly' },
  { role: 'subscriber', content: 'yeah that was crazy' },
  { role: 'creator', content: 'u really know how to get to me. how is duke doing, still stealing ur spot on the couch?' },
  { role: 'subscriber', content: 'haha yeah he is probably wondering where i am' },
  { role: 'creator', content: 'go give him a cuddle for me ok? and promise u will hmu tomorrow' },
]

// chattingsimulation4 pre-renders PPV entries as text before sending them to /api/evaluate-combined.
const combinedHistory = [
  ...chatHistory.map((m) => ({ role: m.role, content: m.content, stage: 'relationship' })),
  ...sextingHistory.map((m) => ({
    role: m.role,
    stage: 'sexting',
    content: m.contentType === 'video' && m.price
      ? `[PPV VIDEO - $${m.price}]${m.unlocked ? ' [UNLOCKED]' : ' [NOT PURCHASED]'}`
      : m.content,
  })),
  ...aftercareHistory.map((m) => ({ role: m.role, content: m.content, stage: 'aftercare' })),
]

const ROUTE_CHECKS = [
  {
    path: '/api/chat',
    body: { messages: [chatHistory[0]], subscriberProfile: 'Mike, 42, electrician from Houston, Texas, divorced, has a dog named Duke, loves bass fishing' },
    check: (d) => typeof d.reply === 'string' && d.reply.trim().length > 0,
    show: (d) => `reply="${d.reply}"`,
  },
  {
    path: '/api/chat',
    body: { messages: chatHistory, subscriberProfile: 'Mike, 42, electrician from Houston, Texas, divorced, has a dog named Duke, loves bass fishing' },
    check: (d) => typeof d.reply === 'string' && d.reply.trim().length > 0,
    show: (d) => `reply="${d.reply}"`,
  },
  {
    path: '/api/chat-aftercare',
    body: {
      messages: [],
      subscriberProfile: 'Mike, 42, electrician from Texas, has a dog named Duke',
      scenarioContext: 'He just bought and watched a $15 PPV video.',
      scenarioOpener: 'i finished lol',
    },
    check: (d) => typeof d.reply === 'string' && d.reply.trim().length > 0,
    show: (d) => `reply="${d.reply}"`,
  },
  {
    path: '/api/evaluate-chat',
    body: { messages: chatHistory, notes: 'Mike, 42, electrician, Texas' },
    check: (d) => Array.isArray(d.evaluation?.categories) && d.evaluation.categories.length > 0,
    show: (d) => `${d.evaluation?.categories?.length} categories`,
  },
  {
    path: '/api/evaluate-sexting',
    body: { messages: sextingHistory },
    check: (d) => Array.isArray(d.evaluation?.categories) && d.evaluation.categories.length > 0,
    show: (d) => `${d.evaluation?.categories?.length} categories`,
  },
  {
    path: '/api/evaluate-aftercare',
    body: { messages: aftercareHistory, notes: 'Mike, 42, electrician, dog named Duke', scenarioLabel: 'Physical completion' },
    check: (d) => Array.isArray(d.evaluation?.categories) && d.evaluation.categories.length > 0,
    show: (d) => `${d.evaluation?.categories?.length} categories`,
  },
  {
    path: '/api/evaluate-combined',
    body: { messages: combinedHistory, notes: 'Mike, 42, electrician, Texas, dog Duke' },
    check: (d) => Array.isArray(d.evaluation?.categories) && d.evaluation.categories.length > 0,
    show: (d) => `${d.evaluation?.categories?.length} categories`,
  },
  {
    path: '/api/evaluate-creativity',
    body: {
      object: 'paperclip',
      pictureUse: 'a phone stand',
      alternateUses: ['holding a phone up as a stand', 'a zipper pull replacement'],
      product: 'insulated water bottle',
      productDescription: 'keeps drinks cold for 24 hours',
      captions: ['ice cold at 5pm like it was at 7am', 'your gym bag is missing something', 'summer heat, meet your match'],
    },
    check: (d) => typeof d.validUses === 'number' && typeof d.passed === 'boolean',
    show: (d) => `validUses=${d.validUses} validCaptions=${d.validCaptions} passed=${d.passed}`,
  },
]

async function routeChecks() {
  if (!BASE_URL) {
    console.log('\n== Route checks skipped (pass a base URL such as http://localhost:3000 to run them) ==')
    return
  }
  console.log(`\n== Route checks against ${BASE_URL} ==`)
  for (const route of ROUTE_CHECKS) {
    try {
      const { status, data, ms } = await postJson(`${BASE_URL}${route.path}`, route.body)
      if (status === 200 && route.check(data)) ok(route.path, `${route.show(data)}, ${ms}ms`)
      else fail(route.path, `HTTP ${status}, ${ms}ms, ${JSON.stringify(data).slice(0, 200)}`)
    } catch (error) {
      fail(route.path, error instanceof Error ? error.message : String(error))
    }
  }
}

await directApiCheck()
await routeChecks()
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
