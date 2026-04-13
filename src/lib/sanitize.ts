/**
 * Sanitize a string that may originate from the API before interpolating it
 * into user-facing templates or sending it to the LLM.
 *
 * - Strips ASCII control chars (0x00–0x1F, 0x7F)
 * - Strips zero-width joiners / bidi controls commonly used for spoofing
 * - Collapses all internal whitespace to single spaces
 * - Caps length (defaults to 80 chars)
 */
// eslint-disable-next-line no-control-regex
const CTRL_RE = /[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

export function sanitizeText(value: unknown, maxLen = 80): string {
  if (value == null) return "";
  const str = String(value);
  return str.replace(CTRL_RE, "").replace(/\s+/g, " ").trim().slice(0, maxLen);
}

/** Used for longer free-form strings (e.g. subtexts). */
export function sanitizeLongText(value: unknown, maxLen = 200): string {
  return sanitizeText(value, maxLen);
}
