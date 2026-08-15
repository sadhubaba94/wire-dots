/**
 * Dependency-free HTML sanitizer (safe on ANY runtime incl. Vercel serverless).
 *
 * Why not DOMPurify here?  `isomorphic-dompurify` loads `jsdom`, which fails to
 * initialise on Vercel's serverless runtime and crashes the route at IMPORT time
 * (a try/catch around the call can't help). This module has zero dependencies,
 * so it can never crash the server render.
 *
 * Defense-in-depth: the admin editor already sanitizes with real browser
 * DOMPurify on SAVE (see sanitizeClient.ts). This function scrubs again on
 * RENDER, stripping the standard XSS vectors.
 */
export function sanitizeHtml(dirty: string): string {
  let html = dirty ?? "";
  if (!html) return "";

  // 1) Remove dangerous elements AND their contents.
  const blockTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "noscript",
    "template",
    "svg",
    "math",
    "link",
    "meta",
    "base",
  ];
  for (const tag of blockTags) {
    // <tag ...>...</tag>
    html = html.replace(
      new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"),
      ""
    );
    // self-closing / unclosed <tag ...>
    html = html.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"), "");
  }

  // 2) Strip HTML comments (can hide conditional-comment scripting).
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  // 3) Remove inline event handlers:  onclick="...", onerror='...', onload=...
  html = html.replace(
    /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    ""
  );

  // 4) Neutralise dangerous URI schemes in href/src/xlink:href.
  //    Allows http, https, mailto, tel, relative paths, and data:image/* only.
  html = html.replace(
    /\b(href|src|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (match, attr, dq, sq, uq) => {
      const raw = (dq ?? sq ?? uq ?? "").trim();
      const value = raw
        .replace(/[\u0000-\u001f]/g, "") // strip control chars used to obfuscate
        .toLowerCase();

      const isSafe =
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("mailto:") ||
        value.startsWith("tel:") ||
        value.startsWith("/") ||
        value.startsWith("#") ||
        value.startsWith("./") ||
        value.startsWith("../") ||
        // permit inline images but not other data: payloads
        value.startsWith("data:image/") ||
        // relative filename with no scheme (no colon before first slash)
        (!/^[a-z][a-z0-9+.-]*:/.test(value));

      return isSafe ? `${attr}="${raw}"` : "";
    }
  );

  // 5) Remove `style="..."` attributes (can smuggle expression()/url(javascript:)).
  html = html.replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 6) Belt-and-suspenders: kill any leftover "javascript:" / "vbscript:" text
  //    inside attributes that slipped through obfuscation.
  html = html.replace(/(?:javascript|vbscript)\s*:/gi, "");

  return html;
}
