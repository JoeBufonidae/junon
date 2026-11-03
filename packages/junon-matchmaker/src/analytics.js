const fs = require("fs")
const os = require("os")
const path = require("path")

const FILE = process.env.ANALYTICS_FILE || path.join(os.homedir(), "analytics", "events.jsonl")
const ALLOWED = new Set(["visit", "new_colony", "boot_sector", "join_minigame", "login_completed", "sign_in_failed"])
const ID_PATTERN = /^[0-9a-f-]{36}$/
const MAX_PER_MINUTE = 60

try { fs.mkdirSync(path.dirname(FILE), { recursive: true }) } catch (e) {}

let counts = {}
setInterval(() => { counts = {} }, 60 * 1000).unref()

// Records one anonymous event. Never throws, never stores IPs, tokens, names or emails.
function track(event, data) {
  try {
    if (!ALLOWED.has(event)) return
    data = data || {}
    let anon = (typeof data.anonId === "string" && ID_PATTERN.test(data.anonId)) ? data.anonId : null
    if (!anon) return
    counts[anon] = (counts[anon] || 0) + 1
    if (counts[anon] > MAX_PER_MINUTE) return
    let row = { t: new Date().toISOString(), e: event, a: anon, m: !!data.idToken }
    if (data.isTutorial) row.tut = true
    if (typeof data.region === "string") row.r = data.region.slice(0, 16)
    fs.appendFile(FILE, JSON.stringify(row) + "\n", () => {})
  } catch (e) {}
}

module.exports = { track }
