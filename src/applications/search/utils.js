export function formatResponseString(string, stripAll = false) {
  const decodedString = (string ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  if (stripAll) {
    return decodedString.replace(/[\ue000\ue001]/g, '');
  }

  return decodedString
    .replace(/\ue000/g, '<strong>')
    .replace(/\ue001/g, '</strong>');
}

export function truncateResponseString(string, maxLength) {
  if (string == null) {
    return '';
  }
  if (string.length <= maxLength) {
    return string;
  }
  return `${string.slice(0, maxLength)}...`;
}

export function removeDoubleBars(string) {
  return string.replace(' | Veterans Affairs', '');
}

const ALLCAPS = /^[A-Z0-9]+([.'’-][A-Z0-9]+)*$/;
const PRESERVE_ALLCAPS_TOKENS = new Set([
  // Known brand/terms we want to preserve even if all-caps
  'MYHEALTHEVET',
]);

const PRESERVE_ACRONYMS = new Set(['VA', 'BVA', 'VBA', 'VHA', 'PTSD', 'GI']);

function stripEdgePunctuation(token) {
  return token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
}

function isAcronymLike(token) {
  const core = stripEdgePunctuation(token);
  if (!core) return false;
  if (PRESERVE_ALLCAPS_TOKENS.has(core)) return true;
  if (core.includes('.')) return true; // e.g. U.S.
  if (!ALLCAPS.test(core)) return false;
  return PRESERVE_ACRONYMS.has(core);
}

function hasIntentionalCaps(token) {
  // Preserve mixed-case words (e.g., "VA.gov", "eBenefits", "MyHealtheVet")
  return /[a-z][A-Z]/.test(token) || /\.[A-Za-z]/.test(token);
}

export function toSentenceCase(input = '') {
  if (!input) return '';

  const parts = String(input).split(/(\s+)/);
  const transformed = parts
    .map(part => {
      if (/^\s+$/.test(part)) return part;

      if (isAcronymLike(part) || hasIntentionalCaps(part)) return part;

      return part.toLowerCase();
    })
    .join('');

  // Uppercase first alphabetical character
  return transformed.replace(/[A-Za-z]/, match => match.toUpperCase());
}
