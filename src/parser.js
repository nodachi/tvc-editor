// Channel shape:
// { id, number, name, type: 'TV'|'RADIO'|'UNKNOWN', frequency, satellite, encrypted, raw, meta }

let uidCounter = 0
function uid() {
  uidCounter += 1
  return `c${Date.now().toString(36)}${uidCounter}`
}

export function detectFormat(fileName, content) {
  const lower = (fileName || '').toLowerCase()
  if (lower.endsWith('.xml')) return 'xml'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.sdx')) return 'sdx'
  const trimmed = content.trim()
  if (trimmed.startsWith('<')) return 'xml'
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json'
  return 'sdx'
}

// ---------- SDX ----------

import { stripControlChars } from './encoding.js'

// Calibrated against a real SatcoDX103 export (Turksat 42.0E receiver dump).
// Fixed-width, ~127 chars/record. Layout (0-indexed):
//   0-10   "SATCODXnnn"           format/version header
//   10-28  satellite name+pos     e.g. "Turksat (42.0E)  "
//   28     'T' or 'R'             TV / Radio
//   29-43  internal service code  (transponder/PMT bookkeeping, opaque)
//   43-51  NAME part 1 (8 chars)
//   51-58  "ppppLLL"              audio PID + 3-letter language code
//   58-115 padding/opaque fields  (symbol rate, service ids - undocumented)
//   115-127(end) NAME part 2 (12 chars, overflow of long names)
// Full name = (part1 + part2).trim(); names longer than 20 chars are
// truncated by the format itself, not by this parser.
const SATCODX_NAME1_START = 43
const SATCODX_NAME1_END = 51
const SATCODX_NAME2_LEN = 12
const SATCODX_TYPE_COL = 28
const SATCODX_SAT_START = 10
const SATCODX_SAT_END = 28

function looksLikeSatcodxFixed(lines) {
  const sample = lines.filter((l) => l.trim()).slice(0, 10)
  if (sample.length < 3) return false
  return sample.every((l) => /^SATCODX\d{3}/.test(l) && l.length >= 100)
}

function parseSatcodxFixedLine(line, idx) {
  const type = line[SATCODX_TYPE_COL] === 'R' ? 'RADIO' : 'TV'
  const satellite = stripControlChars(line.slice(SATCODX_SAT_START, SATCODX_SAT_END)).trim() || null
  const name1 = stripControlChars(line.slice(SATCODX_NAME1_START, SATCODX_NAME1_END))
  const name2 = stripControlChars(line.slice(Math.max(SATCODX_NAME1_END, line.length - SATCODX_NAME2_LEN)))
  const name = (name1 + name2).trim() || `(İsimsiz Kanal ${idx})`
  return {
    id: uid(),
    number: idx,
    name,
    type,
    frequency: null,
    satellite,
    encrypted: null,
    raw: line,
    _mode: 'satcodx103',
    _uncertain: false,
  }
}

function exportSatcodxFixedLine(ch) {
  if (!ch._edited) return ch.raw
  const raw = ch.raw
  const width = (SATCODX_NAME1_END - SATCODX_NAME1_START) + SATCODX_NAME2_LEN // 20
  const padded = ch.name.length > width ? ch.name.slice(0, width) : ch.name.padEnd(width, ' ')
  const n1 = padded.slice(0, SATCODX_NAME1_END - SATCODX_NAME1_START)
  const n2 = padded.slice(SATCODX_NAME1_END - SATCODX_NAME1_START)
  const tailStart = raw.length - SATCODX_NAME2_LEN
  return raw.slice(0, SATCODX_NAME1_START) + n1 + raw.slice(SATCODX_NAME1_END, tailStart) + n2
}

const DELIMS = ['|', ';', '\t', ',']

function detectDelimiter(lines) {
  const sample = lines.filter((l) => l.trim()).slice(0, 30)
  if (sample.length < 3) return null
  for (const d of DELIMS) {
    const counts = sample.map((l) => l.split(d).length)
    const mode = counts.sort((a, b) =>
      counts.filter((v) => v === a).length - counts.filter((v) => v === b).length
    ).pop()
    if (mode < 3) continue
    const consistent = counts.filter((c) => c === mode).length / counts.length
    if (consistent > 0.75) return d
  }
  return null
}

const CODE_TOKENS = new Set(['TUR', 'ENG', 'GER', 'FRA', 'ARA', 'RUS', 'PG', 'HD', 'SD', 'FTA', 'TP', 'RMPG', 'SATCODX'])
const KNOWN_SUFFIX_WORDS = [
  'World', 'Radio', 'News', 'Sports', 'International', 'Channel', 'Music',
  'Kids', 'Plus', 'Extra', 'Prime', 'Vision', 'Star', 'Family', 'Cinema',
  'Movies', 'Documentary', 'Kanal', 'Haber', 'Spor', 'Muzik', 'Cocuk', 'Belgesel'
]

function mapDelimitedFields(rawFields, idx, line, delimiter) {
  const fields = rawFields.map((f) => f.trim())
  let type = 'TV'
  let typeIdx = -1
  fields.forEach((f, i) => {
    if (/^(radio|r)$/i.test(f)) { type = 'RADIO'; typeIdx = i }
  })
  let satIdx = -1
  let satellite = null
  fields.forEach((f, i) => {
    if (/\d\.\d\s*[EW]/i.test(f)) { satellite = f; satIdx = i }
  })
  let freqIdx = -1
  let frequency = null
  fields.forEach((f, i) => {
    if (freqIdx === -1 && /^\d{4,6}$/.test(f)) { frequency = f; freqIdx = i }
  })
  let encrypted = null
  fields.forEach((f) => {
    if (/crypt|scrambl/i.test(f)) encrypted = true
    if (/^fta$/i.test(f)) encrypted = false
  })
  const excluded = new Set([typeIdx, satIdx, freqIdx])
  let nameIdx = -1
  let nameLen = -1
  fields.forEach((f, i) => {
    if (!excluded.has(i) && /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(f) && f.length > nameLen) {
      nameLen = f.length
      nameIdx = i
    }
  })
  const name = nameIdx >= 0 ? fields[nameIdx] : `(İsimsiz Kanal ${idx})`
  let number = idx
  let numberIdx = -1
  fields.forEach((f, i) => {
    if (numberIdx === -1 && i !== nameIdx && i !== freqIdx && /^\d{1,4}$/.test(f)) {
      number = parseInt(f, 10)
      numberIdx = i
    }
  })
  return {
    id: uid(),
    number,
    name,
    type,
    frequency,
    satellite,
    encrypted,
    raw: line,
    _mode: 'delim',
    _delimiter: delimiter,
    _fields: fields,
    _idx: { typeIdx, satIdx, freqIdx, nameIdx, numberIdx },
  }
}

function parseFixedWidthLine(line, idx, columnMap) {
  if (columnMap && Number.isFinite(columnMap.start) && Number.isFinite(columnMap.end)) {
    const start = Math.max(0, columnMap.start)
    const end = Math.max(start, columnMap.end)
    const name = line.slice(start, end).trim() || `(İsimsiz Kanal ${idx})`
    return {
      id: uid(),
      number: idx,
      name,
      type: /radio/i.test(line) ? 'RADIO' : 'TV',
      frequency: (line.match(/\b(\d{4,6})\b/) || [])[1] || null,
      satellite: (line.match(/([A-Za-z][A-Za-z\s]{2,20}?\(\d{1,3}\.\d[EW]\))/) || [])[1] || null,
      encrypted: /crypt|scrambl/i.test(line) ? true : (/\bfta\b/i.test(line) ? false : null),
      raw: line,
      _mode: 'fixed',
      _columnMap: { start, end },
    }
  }

  // heuristic mode: no explicit column map
  const satMatch = line.match(/([A-Za-z][A-Za-z\s]{2,20}?)\s*\((\d{1,3}\.\d[EW])\)/)
  const satellite = satMatch ? `${satMatch[1].trim()} (${satMatch[2]})` : null

  let work = line.replace(/^SATCODX\d*/i, ' ')
  if (satMatch) work = work.replace(satMatch[0], ' ')

  const fragRe = /[A-Za-zÇĞİÖŞÜçğıöşü]+/g
  const rawFrags = []
  let m
  while ((m = fragRe.exec(work))) rawFrags.push({ text: m[0] })

  const nameFrags = rawFrags.filter((f) => !CODE_TOKENS.has(f.text.toUpperCase()))

  let type = 'TV'
  let typeCut = -1
  nameFrags.forEach((f, i) => {
    if (typeCut === -1 && /^radio$/i.test(f.text)) { type = 'RADIO'; typeCut = i }
  })

  let candidates = typeCut >= 0 ? nameFrags.slice(0, typeCut) : nameFrags

  // repair fragments split by embedded digit/code blocks, e.g. "Worl" + "d" -> "World"
  for (let i = 1; i < candidates.length; i++) {
    const prev = candidates[i - 1].text
    const cur = candidates[i].text
    if (cur.length <= 3) {
      const merged = prev + cur
      if (KNOWN_SUFFIX_WORDS.some((w) => w.toLowerCase() === merged.toLowerCase())) {
        candidates[i - 1] = { text: merged }
        candidates.splice(i, 1)
        i -= 1
      }
    }
  }

  const name = candidates.map((f) => f.text).join(' ').trim() || `(İsimsiz Kanal ${idx})`

  const freqMatch = line.match(/\b(\d{4,5})\b/)
  const encrypted = /crypt|scrambl/i.test(line) ? true : (/\bfta\b/i.test(line) ? false : null)

  return {
    id: uid(),
    number: idx,
    name,
    type,
    frequency: freqMatch ? freqMatch[1] : null,
    satellite,
    encrypted,
    raw: line,
    _mode: 'heuristic',
    _uncertain: true,
  }
}

export function parseSDX(content, options = {}) {
  const lines = content.split(/\r?\n/)
  const nonEmpty = lines.filter((l) => l.trim())

  // Calibrated exact match for SatcoDX fixed-width exports (see constants above).
  if (!options.forceHeuristic && !options.columnMap && looksLikeSatcodxFixed(nonEmpty)) {
    const channels = nonEmpty.map((l, i) => parseSatcodxFixedLine(l, i + 1))
    return { channels, meta: { format: 'sdx', mode: 'satcodx103', delimiter: null, uncertainCount: 0, columnMap: null } }
  }

  const delimiter = options.forceHeuristic ? null : detectDelimiter(lines)
  const channels = []
  let idx = 0
  let uncertainCount = 0
  for (const raw of lines) {
    if (!raw.trim()) continue
    idx += 1
    let ch
    if (delimiter) {
      ch = mapDelimitedFields(raw.split(delimiter), idx, raw, delimiter)
    } else {
      ch = parseFixedWidthLine(raw, idx, options.columnMap)
      if (ch._uncertain) uncertainCount += 1
    }
    channels.push(ch)
  }
  return { channels, meta: { format: 'sdx', delimiter, uncertainCount, columnMap: options.columnMap || null } }
}

export function exportSDX(channels, meta) {
  const lines = channels.map((ch) => {
    if (ch._mode === 'satcodx103') {
      return exportSatcodxFixedLine(ch)
    }
    if (ch._mode === 'delim' && ch._fields) {
      const fields = [...ch._fields]
      if (ch._idx.nameIdx >= 0) fields[ch._idx.nameIdx] = ch.name
      else fields.push(ch.name)
      return fields.join(ch._delimiter || meta.delimiter || '|')
    }
    if (ch._mode === 'fixed' && ch._columnMap && ch._edited) {
      const { start, end } = ch._columnMap
      const width = end - start
      const padded = ch.name.length >= width ? ch.name.slice(0, width) : ch.name.padEnd(width, ' ')
      return ch.raw.slice(0, start) + padded + ch.raw.slice(end)
    }
    if (ch._mode === 'heuristic' && ch._edited) {
      // best-effort: append corrected name as a readable line while keeping raw for reference
      return `${ch.raw}  # NAME_FIX:${ch.name}`
    }
    return ch.raw
  })
  return lines.join('\n')
}

// ---------- XML ----------

const XML_NAME_KEYS = ['name', 'Name', 'ChannelName', 'channel_name', 'service_name', 'title', 'Title']
const XML_NUM_KEYS = ['number', 'Number', 'index', 'Index', 'id', 'ID', 'channel_number']
const XML_TYPE_KEYS = ['type', 'Type', 'service_type', 'ServiceType']
const XML_FREQ_KEYS = ['frequency', 'Frequency', 'freq']
const XML_SAT_KEYS = ['satellite', 'Satellite', 'transponder', 'tp']
const XML_ENC_KEYS = ['encrypted', 'Encrypted', 'scrambled', 'Scrambled', 'ca']

function firstAttrOrChild(el, keys) {
  for (const k of keys) {
    if (el.getAttribute && el.hasAttribute(k)) return el.getAttribute(k)
    const child = el.getElementsByTagName ? el.getElementsByTagName(k)[0] : null
    if (child && child.textContent) return child.textContent
  }
  return null
}

export function parseXML(content) {
  const doc = new DOMParser().parseFromString(content, 'application/xml')
  const err = doc.querySelector('parsererror')
  if (err) return { channels: [], meta: { format: 'xml', error: 'parse_error' } }

  const candidateTags = ['channel', 'Channel', 'service', 'Service', 'tv_channel', 'item']
  let nodes = []
  for (const tag of candidateTags) {
    const found = doc.getElementsByTagName(tag)
    if (found.length) { nodes = Array.from(found); break }
  }
  if (!nodes.length) {
    // fallback: any leaf-ish repeated element under root
    const root = doc.documentElement
    if (root) nodes = Array.from(root.children)
  }

  const channels = nodes.map((el, i) => {
    const name = firstAttrOrChild(el, XML_NAME_KEYS) || el.textContent?.trim().slice(0, 60) || `(İsimsiz Kanal ${i + 1})`
    const numRaw = firstAttrOrChild(el, XML_NUM_KEYS)
    const typeRaw = (firstAttrOrChild(el, XML_TYPE_KEYS) || '').toLowerCase()
    const encRaw = firstAttrOrChild(el, XML_ENC_KEYS)
    return {
      id: uid(),
      number: numRaw ? parseInt(numRaw, 10) || i + 1 : i + 1,
      name,
      type: typeRaw.includes('radio') ? 'RADIO' : 'TV',
      frequency: firstAttrOrChild(el, XML_FREQ_KEYS),
      satellite: firstAttrOrChild(el, XML_SAT_KEYS),
      encrypted: encRaw == null ? null : /1|true|yes|encrypted/i.test(encRaw),
      raw: el.outerHTML,
      _mode: 'xml',
      _tag: el.tagName,
    }
  })

  return { channels, meta: { format: 'xml' } }
}

export function exportXML(channels) {
  const items = channels.map((ch) => {
    return `  <channel number="${ch.number}" name="${escapeXml(ch.name)}" type="${ch.type}"${ch.frequency ? ` frequency="${escapeXml(ch.frequency)}"` : ''}${ch.satellite ? ` satellite="${escapeXml(ch.satellite)}"` : ''}${ch.encrypted != null ? ` encrypted="${ch.encrypted}"` : ''} />`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<channels>\n${items.join('\n')}\n</channels>\n`
}

function escapeXml(s) {
  return String(s ?? '').replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]))
}

// ---------- JSON ----------

const JSON_NAME_KEYS = ['name', 'Name', 'channelName', 'title']
const JSON_NUM_KEYS = ['number', 'Number', 'index', 'id']
const JSON_TYPE_KEYS = ['type', 'Type']
const JSON_FREQ_KEYS = ['frequency', 'freq']
const JSON_SAT_KEYS = ['satellite', 'transponder', 'tp']
const JSON_ENC_KEYS = ['encrypted', 'scrambled']

function pick(obj, keys) {
  for (const k of keys) if (obj[k] !== undefined) return obj[k]
  return null
}

export function parseJSON(content) {
  let data
  try {
    data = JSON.parse(content)
  } catch (e) {
    return { channels: [], meta: { format: 'json', error: 'parse_error' } }
  }
  const list = Array.isArray(data) ? data : (data.channels || data.Channels || [])
  const channels = list.map((obj, i) => {
    const typeRaw = String(pick(obj, JSON_TYPE_KEYS) || '').toLowerCase()
    const encRaw = pick(obj, JSON_ENC_KEYS)
    return {
      id: uid(),
      number: Number(pick(obj, JSON_NUM_KEYS)) || i + 1,
      name: pick(obj, JSON_NAME_KEYS) || `(İsimsiz Kanal ${i + 1})`,
      type: typeRaw.includes('radio') ? 'RADIO' : 'TV',
      frequency: pick(obj, JSON_FREQ_KEYS),
      satellite: pick(obj, JSON_SAT_KEYS),
      encrypted: encRaw == null ? null : Boolean(encRaw),
      raw: JSON.stringify(obj),
      _mode: 'json',
      _original: obj,
    }
  })
  return { channels, meta: { format: 'json' } }
}

export function exportJSON(channels) {
  const list = channels.map((ch) => ({
    ...(ch._original || {}),
    number: ch.number,
    name: ch.name,
    type: ch.type,
    frequency: ch.frequency,
    satellite: ch.satellite,
    encrypted: ch.encrypted,
  }))
  return JSON.stringify({ channels: list }, null, 2)
}

export function parseFile(fileName, content) {
  const format = detectFormat(fileName, content)
  if (format === 'xml') return { ...parseXML(content), format }
  if (format === 'json') return { ...parseJSON(content), format }
  return { ...parseSDX(content), format: 'sdx' }
}

export function exportFile(format, channels, meta) {
  if (format === 'xml') return exportXML(channels)
  if (format === 'json') return exportJSON(channels)
  return exportSDX(channels, meta)
}

export function renumberSequential(channels) {
  return channels.map((ch, i) => ({ ...ch, number: i + 1 }))
}
