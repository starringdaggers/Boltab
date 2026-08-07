import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/forgot-password"],
        disallow: ["/admin", "/teacher", "/student", "/api"],
      },
    ],
    sitemap: "https://boltab.vercel.app/sitemap.xml",
  };
}
