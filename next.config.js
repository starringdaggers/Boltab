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
        // Content-Security-Policy: the main defense against XSS. Scripts
        // and frames are locked to 'self' with no exceptions. Styles allow
        // 'unsafe-inline' because this app uses inline <style> tags for a
        // couple of small CSS animations — a real but much lower-severity
        // trade-off than allowing inline scripts.
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self'",
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
