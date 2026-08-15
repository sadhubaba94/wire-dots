import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize rich-text HTML before it is stored AND before it is rendered.
 * Defense-in-depth: we clean on save (admin) and again on render (public),
 * so a malicious row in the DB can never inject script into a visitor's page.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty ?? "", {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "p", "br", "hr",
      "strong", "b", "em", "i", "u", "s", "del",
      "ul", "ol", "li",
      "blockquote", "code", "pre",
      "a", "img",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
    // Only allow safe URL schemes; blocks javascript: and data: (except images handled below)
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
}
