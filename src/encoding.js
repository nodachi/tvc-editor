// Many real-world .sdx files (Turkish satellite receivers) are encoded in
// Windows-1254 / ISO-8859-9 (Turkish), not UTF-8. Reading them as UTF-8
// corrupts İ/Ğ/Ş/ı/ğ/ş and can even inject stray control bytes.
// Strategy: try strict UTF-8 first; if it's invalid, fall back to cp1254.

export async function decodeFileSmart(file) {
  const buf = await file.arrayBuffer()
  try {
    const strict = new TextDecoder('utf-8', { fatal: true })
    return { text: strict.decode(buf), encoding: 'utf-8' }
  } catch (e) {
    try {
      const legacy = new TextDecoder('windows-1254')
      return { text: legacy.decode(buf), encoding: 'windows-1254' }
    } catch (e2) {
      const loose = new TextDecoder('utf-8', { fatal: false })
      return { text: loose.decode(buf), encoding: 'utf-8' }
    }
  }
}

// Windows-1254 differs from Latin-1 only at these Turkish-letter code points.
// Everything below 0x100 that isn't listed here maps 1:1 to its byte value.
const CP1254_SPECIAL = {
  '\u011E': 0xD0, // Ğ
  '\u011F': 0xF0, // ğ
  '\u0130': 0xDD, // İ
  '\u0131': 0xFD, // ı
  '\u015E': 0xDE, // Ş
  '\u015F': 0xFE, // ş
  '\u20AC': 0x80, // €
  '\u0160': 0x8A, '\u0161': 0x9A,
  '\u0152': 0x8C, '\u0153': 0x9C,
  '\u0178': 0x9F,
}

export function encodeCP1254(str) {
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    const code = ch.codePointAt(0)
    if (CP1254_SPECIAL[ch] !== undefined) bytes[i] = CP1254_SPECIAL[ch]
    else if (code < 256) bytes[i] = code
    else bytes[i] = 0x3f // '?' fallback for unsupported characters
  }
  return bytes
}

export function stripControlChars(s) {
  return s.replace(/[\x00-\x1f]/g, '')
}
