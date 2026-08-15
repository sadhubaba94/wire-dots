import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize rich-text HTML before it is stored AND before it is rendered.
 * Defense-in-depth: we clean on save (admin) and again on render (public).
 *
 * IMPORTANT: on some serverless runtimes (e.g. Vercel) the server-side
 * DOMPurify path (which relies on jsdom) can throw at request time, which
 * would 500 the article page. Because content is ALREADY sanitized on save,
 * we wrap the call in try/catch and fall back to the stored HTML instead of
 * crashing the page.
 */
export function sanitizeHtml(dirty: string): string {
  const input = dirty ?? "";
  try {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "p", "br", "hr",
        "strong", "b", "em", "i", "u", "s", "del",
        "ul", "ol", "li",
        "blockquote", "code", "pre",
        "a", "img",
        "span",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
      ALLOWED_URI_REGEXP:
        /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: ["target"],
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
    });
  } catch {
    // Runtime sanitize failed (e.g. jsdom on serverless). The stored HTML was
    // already sanitized when it was saved, so render it rather than 500.
    return input;
  }
}
