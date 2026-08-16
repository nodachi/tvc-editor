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

// Otomatik Bilinen Kısaltma ve Kırpılma Düzeltme Sözlüğü
// (Sabit genişlik birleştirmesinden sonra hâlâ eksik kalan isimler + Türkçe karakter normalizasyonu)
const CLEAN_NAME_MAP = {
  'TGRT BEL': 'TGRT BELGESEL',
  'TGRT BELG': 'TGRT BELGESEL',
  'TRT SPO': 'TRT SPOR',
  'A HAB': 'A HABER',
  'TRT HAB': 'TRT HABER',
  'TRT COC': 'TRT ÇOCUK',
  'TRT COCU': 'TRT ÇOCUK',
  'BLOOMB': 'BLOOMBERG HT',
  'BLOOMBER': 'BLOOMBERG HT',
  'HABERTUR': 'HABERTÜRK',
  'HABERTÜRK': 'HABERTÜRK',
  'KARADENI': 'KARADENİZ FM',
  'KARADENIZ': 'KARADENİZ FM',
  'KARADENIZ FM': 'KARADENİZ FM',
  'SAHIL GU': 'SAHİL GÜVENLİK RADYO',
  'SAHIL GUVENLIK': 'SAHİL GÜVENLİK RADYO',
  'SAHIL GUVENLIK RADYO': 'SAHİL GÜVENLİK RADYO',
  'POLIS RA': 'POLİS RADYOSU',
  'POLIS RADYOSU': 'POLİS RADYOSU',
  'KUR AN R': 'KUR\'AN RADYO',
  'KUR AN RADYO': 'KUR\'AN RADYO',
  'DIYANET': 'DİYANET',
  'DIYANET TV': 'DİYANET TV',
  'DIYANET TV HD': 'DİYANET TV HD',
  'DIYANET RADYO': 'DİYANET RADYO',
  'BENGÜ TÜRK': 'BENGÜ TÜRK',
  'BENGÜ TÜ': 'BENGÜ TÜRK',
  'BENGÜ TÜRK HD': 'BENGÜ TÜRK HD',
  'ŞÖMİNE KEYFİ': 'ŞÖMİNE KEYFİ',
  'HABİTAT': 'HABİTAT TV',
  'HABİTAT TV HD': 'HABİTAT TV HD',
  'TİVİBU': 'TİVİBU',
  'TİVİBU TANITIM HD': 'TİVİBU TANITIM HD',
  'TİVİBU SPOR HD': 'TİVİBU SPOR HD',
  'LİDER HABER': 'LİDER HABER',
  'LİDER HABER HD': 'LİDER HABER HD',
  'YENİ KOCAELİ': 'YENİ KOCAELİ TV',
  'YENİ KOCAELİ TV': 'YENİ KOCAELİ TV',
  'RUMELİ TV': 'RUMELİ TV',
  'İLKE TV': 'İLKE TV',
  'İLKE T': 'İLKE TV',
}

// Kontrol karakterleri ve görünmeyen işaretleri temizle (kareler / � kaynakları)
function stripControlChars(str) {
  if (!str) return ''
    return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/\uFFFD/g, '')
}

// Yaygın ASCII → Türkçe karakter düzeltmeleri (dosyada karışık encoding olabilir)
function normalizeTurkish(str) {
  const wordMap = {
    'DIYANET': 'DİYANET',
    'POLIS': 'POLİS',
    'RADYOSU': 'RADYOSU',
    'KARADENIZ': 'KARADENİZ',
    'SAHIL': 'SAHİL',
    'GUVENLIK': 'GÜVENLİK',
    'GUVENLİK': 'GÜVENLİK',
    'HABERTURK': 'HABERTÜRK',
    'HABERTÜRK': 'HABERTÜRK',
    'COCUK': 'ÇOCUK',
    'BELGESEL': 'BELGESEL',
    'SOMIINE': 'ŞÖMİNE',
    'SOMINE': 'ŞÖMİNE',
    'KEYFI': 'KEYFİ',
    'HABITAT': 'HABİTAT',
    'TIVIBU': 'TİVİBU',
    'LIDER': 'LİDER',
    'YENI': 'YENİ',
    'KOCAELI': 'KOCAELİ',
    'RUMELI': 'RUMELİ',
    'ILKE': 'İLKE',
    'BENGU': 'BENGÜ',
    'TURK': 'TÜRK',
    'TURKIYE': 'TÜRKİYE',
  }
  return str.replace(/\b([A-ZÇĞİÖŞÜ]+)\b/gi, (word) => {
    const up = word.toLocaleUpperCase('tr-TR')
    return wordMap[up] || word
  })
}

// Akıllı Kanal İsmi Temizleme Fonksiyonu
function cleanChannelName(rawName) {
  if (!rawName) return ''

    let cleaned = stripControlChars(rawName)
    // Sadece satır sonuna yapışmış anlamsız PID/frekans kalıntılarını temizle
    // İsim içindeki "TV 5", "RD 2000", "TV 8.5" korunur.
    .replace(/(?<=[A-Za-zÇĞİÖŞÜçğıöşü])\d{4,5}[A-Za-z0-9]*$/, '')
    .replace(/[\-_+=|\\/]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()

    if (!cleaned) return ''

      cleaned = normalizeTurkish(cleaned)

      const upper = cleaned.toLocaleUpperCase('tr-TR')
      if (CLEAN_NAME_MAP[upper]) return CLEAN_NAME_MAP[upper]
        for (const [key, val] of Object.entries(CLEAN_NAME_MAP)) {
          if (upper === key) return val
        }
        return cleaned
}

// ---------- SDX ----------

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

const CODE_TOKENS = new Set([
  'TUR', 'ENG', 'GER', 'FRA', 'ARA', 'RUS', 'PG', 'HD', 'SD', 'FTA', 'TP',
  'RMPG', 'TMPG', 'SATCODX', 'TR'
])
const KNOWN_SUFFIX_WORDS = [
  'World', 'Radio', 'News', 'Sports', 'International', 'Channel', 'Music',
'Kids', 'Plus', 'Extra', 'Prime', 'Vision', 'Star', 'Family', 'Cinema',
'Movies', 'Documentary', 'Kanal', 'Haber', 'Spor', 'Muzik', 'Cocuk',
'Belgesel', 'Radyo', 'FM', 'TV', 'HD', 'SD'
]

/**
 * SATCODX sabit genişlik formatı (Turksat vb.)
 *
 * Tipik satır (127 karakter):
 *   [0..27]  SATCODX + uydu
 *   [28..42] TMPG/RMPG + 11 haneli kod  (15 karakter)
 *   [43..50] İsim parçası 1 (8 karakter, kısa isimler boşlukla pad)
 *   [51..]   dil/SID vb.
 *   [115..]  İsim parçası 2 (devam) — uzun isimler burada biter
 *
 * Örnek: "TGRT HAB" + "ER HD" → "TGRT HABER HD"
 *         "DIYANET " + "TV HD" → "DIYANET TV HD"  (pad boşluğu → kelime arası boşluk)
 */
function parseSatcodxLine(line, idx) {
  const len = line.length
  if (len < 50 || !line.trim() || /^[\x00\s]+$/.test(line)) {
    return null
  }

  const satMatch = line.match(/([A-Za-z][A-Za-z0-9\s]{1,20}?)\s*\((\d{1,3}\.\d[EW])\)/)
  const satellite = satMatch ? `${satMatch[1].trim()} (${satMatch[2]})` : null

  const freqMatch = line.match(/\b(\d{4,6})\b/)
  const frequency = freqMatch ? freqMatch[1] : null

  let type = 'TV'
  if (/\bRMPG/i.test(line) || /\bRADIO\b/i.test(line)) type = 'RADIO'

    // İsim başlangıcı: standart alanda (28-42) TMPG/RMPG+11 hane varsa 43
    let nameStart = 43
    const mpgField = len >= 43 ? line.slice(28, 43) : ''
    if (!/^(?:T|R)MPG\d{11}$/.test(mpgField)) {
      // Nadir sapmalar: MPG kodundan hemen sonra isim
      const m = line.match(/(?:T|R)MPG\d+/)
      if (m) nameStart = m.end()
    }

    let namePart1 = ''
    let namePart2 = ''
    if (len >= nameStart + 1) {
      namePart1 = line.slice(nameStart, nameStart + 8)
    }
    // Devam alanı sabit: 115. karakterden itibaren (127'lik satırlarda)
    if (len >= 116) {
      namePart2 = line.slice(115)
    }

    namePart1 = stripControlChars(namePart1)
    namePart2 = stripControlChars(namePart2)

    // Akıllı birleştirme:
    // - 8 karakterin tamamı dolu ve son karakter boşluk değilse → kelime ortası, boşluksuz birleştir
    // - Aksi halde (pad boşluğu var) → kelime bitmiş, araya boşluk koy
    const usedFullWidth = namePart1.length === 8 && namePart1[namePart1.length - 1] !== ' '
    const core1 = namePart1.replace(/\s+$/, '')
    const core2 = namePart2.replace(/^\s+|\s+$/g, '')
    let rawName
    if (!core1 && !core2) {
      rawName = ''
    } else if (usedFullWidth) {
      rawName = core1 + core2
    } else {
      rawName = [core1, core2].filter(Boolean).join(' ')
    }
    rawName = rawName.replace(/\s+/g, ' ').trim()

    if (!rawName || rawName.length < 2) {
      return parseFixedWidthLineHeuristic(line, idx)
    }

    const name = cleanChannelName(rawName) || `(İsimsiz Kanal ${idx})`

    const encrypted = /crypt|scrambl/i.test(line)
    ? true
    : (/\bfta\b/i.test(line) ? false : null)

    return {
      id: uid(),
      number: idx,
      name,
      type,
      frequency,
      satellite,
      encrypted,
      raw: line,
      _mode: 'satcodx',
      _uncertain: false,
      _nameParts: { part1: namePart1, part2: namePart2, nameStart },
    }
}

function parseFixedWidthLineHeuristic(line, idx) {
  const satMatch = line.match(/([A-Za-z][A-Za-z\s]{2,20}?)\s*\((\d{1,3}\.\d[EW])\)/)
  const satellite = satMatch ? `${satMatch[1].trim()} (${satMatch[2]})` : null

  let work = line.replace(/^SATCODX\d*/i, ' ')
  if (satMatch) work = work.replace(satMatch[0], ' ')

    const freqMatch = line.match(/\b(\d{4,6})\b/)
    let candidateText = work

    if (freqMatch) {
      const freqPos = work.indexOf(freqMatch[1])
      if (freqPos > 0) {
        candidateText = work.slice(0, freqPos)
      }
    }

    const fragRe = /[A-Za-zÇĞİÖŞÜçğıöşüÂâÊêÎîÔôÛû]+/g
    const rawFrags = []
    let m
    while ((m = fragRe.exec(candidateText))) rawFrags.push({ text: m[0] })

      const nameFrags = rawFrags.filter((f) => !CODE_TOKENS.has(f.text.toUpperCase()))

      let type = 'TV'
      let typeCut = -1
      nameFrags.forEach((f, i) => {
        if (typeCut === -1 && /^radio$/i.test(f.text)) {
          type = 'RADIO'
          typeCut = i
        }
      })

      let candidates = typeCut >= 0 ? nameFrags.slice(0, typeCut) : nameFrags

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

      const extractedName = candidates.map((f) => f.text).join(' ')
      const name = cleanChannelName(extractedName) || `(İsimsiz Kanal ${idx})`
      const encrypted = /crypt|scrambl/i.test(line)
      ? true
      : (/\bfta\b/i.test(line) ? false : null)

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

function mapDelimitedFields(rawFields, idx, line, delimiter) {
  const fields = rawFields.map((f) => f.trim())
  let type = 'TV'
  let typeIdx = -1
  fields.forEach((f, i) => {
    if (/^(radio|r)$/i.test(f)) {
      type = 'RADIO'
      typeIdx = i
    }
  })
  let satIdx = -1
  let satellite = null
  fields.forEach((f, i) => {
    if (/\d\.\d\s*[EW]/i.test(f)) {
      satellite = f
      satIdx = i
    }
  })
  let freqIdx = -1
  let frequency = null
  fields.forEach((f, i) => {
    if (freqIdx === -1 && /^\d{4,6}$/.test(f)) {
      frequency = f
      freqIdx = i
    }
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

  const rawParsedName = nameIdx >= 0 ? fields[nameIdx] : ''
  const name = cleanChannelName(rawParsedName) || `(İsimsiz Kanal ${idx})`

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
    const rawName = line.slice(start, end)
    const name = cleanChannelName(rawName) || `(İsimsiz Kanal ${idx})`
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
  return parseFixedWidthLineHeuristic(line, idx)
}

/**
 * İçeriği doğru encoding ile string'e çevir.
 * SATCODX dosyaları çoğunlukla Windows-1254 (Türkçe) kullanır.
 */
export function decodeSdxContent(raw) {
  if (typeof raw === 'string') {
    return raw
  }
  if (raw instanceof ArrayBuffer) raw = new Uint8Array(raw)
    if (raw && raw.buffer instanceof ArrayBuffer) {
      try {
        const dec = new TextDecoder('windows-1254')
        return dec.decode(raw)
      } catch (e) {
        try {
          const dec = new TextDecoder('iso-8859-9')
          return dec.decode(raw)
        } catch (e2) {
          return new TextDecoder('utf-8', { fatal: false }).decode(raw)
        }
      }
    }
    return String(raw)
}

export function parseSDX(content, options = {}) {
  if (typeof content !== 'string') {
    content = decodeSdxContent(content)
  }

  const lines = content.split(/\r?\n/)
  const delimiter = options.forceHeuristic ? null : detectDelimiter(lines)
  const channels = []
  let idx = 0
  let uncertainCount = 0
  let satcodxCount = 0

  for (const raw of lines) {
    if (!raw.trim() || /^[\x00\s]+$/.test(raw)) continue
      idx += 1
      let ch

      if (delimiter) {
        ch = mapDelimitedFields(raw.split(delimiter), idx, raw, delimiter)
      } else if (/^SATCODX/i.test(raw) || (raw.length >= 100 && raw.length <= 140)) {
        ch = parseSatcodxLine(raw, idx)
        if (ch) satcodxCount += 1
      } else {
        ch = parseFixedWidthLine(raw, idx, options.columnMap)
        if (ch && ch._uncertain) uncertainCount += 1
      }

      if (ch) channels.push(ch)
  }

  return {
    channels,
    meta: {
      format: 'sdx',
        delimiter,
        uncertainCount,
        satcodxCount,
        columnMap: options.columnMap || null,
    },
  }
}

export function exportSDX(channels, meta) {
  const lines = channels.map((ch) => {
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
    if ((ch._mode === 'heuristic' || ch._mode === 'satcodx') && ch._edited) {
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
    if (found.length) {
      nodes = Array.from(found)
      break
    }
  }
  if (!nodes.length) {
    const root = doc.documentElement
    if (root) nodes = Array.from(root.children)
  }

  const channels = nodes.map((el, i) => {
    const rawName = firstAttrOrChild(el, XML_NAME_KEYS) || el.textContent?.trim().slice(0, 60) || ''
    const name = cleanChannelName(rawName) || `(İsimsiz Kanal ${i + 1})`
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
  return String(s ?? '').replace(/[<>&'"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])
  )
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
    const rawName = pick(obj, JSON_NAME_KEYS) || ''
    return {
      id: uid(),
                            number: Number(pick(obj, JSON_NUM_KEYS)) || i + 1,
                            name: cleanChannelName(rawName) || `(İsimsiz Kanal ${i + 1})`,
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
