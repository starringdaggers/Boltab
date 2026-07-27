/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    const securityHeaders = [
      // Prevents the site from being embedded in an <iframe> elsewhere —
      // blocks clickjacking attacks.
      { key: "X-Frame-Options", value: "DENY" },
      // Stops browsers from "sniffing" a file's content-type and running
      // it as something other than what the server declared (e.g. treating
      // an uploaded receipt as executable HTML).
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Limits how much referrer info leaks to other sites when someone
      // clicks a link out of the app.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Disables access to sensitive browser APIs this app never needs.
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
    ];

    if (isProd) {
      securityHeaders.push(
        // Forces HTTPS for a year, including subdomains — Vercel already
        // terminates TLS, this tells browsers to never even try plain HTTP.
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        // Content-Security-Policy: the main defense against XSS. Frames are
        // locked to 'self' with no exceptions. Both scripts and styles allow
        // 'unsafe-inline' because Next.js's App Router injects small inline
        // <script> tags to hydrate every page (attach click handlers, etc.)
        // — without this, the browser silently blocks those scripts and the
        // page renders but never becomes interactive (exactly what happened
        // here: forms visible, but buttons did nothing). A stricter nonce-
        // based CSP is possible via middleware and is a reasonable follow-up
        // hardening step, but isn't safe to land blind without being able
        // to fully verify it end-to-end first.
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        }
      );
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
