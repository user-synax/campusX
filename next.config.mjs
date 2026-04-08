import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() { 
    return [ 
      { 
        source: '/(.*)', 
        headers: [ 
          // Prevent clickjacking 
          { key: 'X-Frame-Options', value: 'DENY' }, 
          // Prevent MIME sniffing 
          { key: 'X-Content-Type-Options', value: 'nosniff' }, 
          // Force HTTPS 
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }, 
          // Prevent XSS 
          { key: 'X-XSS-Protection', value: '1; mode=block' }, 
          // Control referrer info 
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, 
          // Permissions policy 
          { 
            key: 'Permissions-Policy', 
            value: 'camera=(), microphone=(), geolocation=()' 
          }, 
          // Content Security Policy 
          { 
            key: 'Content-Security-Policy', 
            value: [ 
              "default-src 'self'", 
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://cdn.jsdelivr.net https://cdn.tldraw.com",  // Next.js needs unsafe-eval, Monaco, tldraw
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tldraw.com", 
              "img-src 'self' data: https: http: blob: https://utfs.io https://*.uploadthing.com https://*.ufs.sh",  // allow all external images
              "connect-src 'self' https://api.anthropic.com wss://*.pusher.com https://*.pusher.com https://www.googleapis.com https://*.uploadthing.com https://*.ingest.uploadthing.com https://cdn.jsdelivr.net https://cdn.tldraw.com https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1", 
              "font-src 'self' https://cdn.jsdelivr.net https://cdn.tldraw.com data:", 
              "frame-src 'self' https://www.youtube.com", 
              "worker-src 'self' blob:", 
            ].join('; ') 
          } 
        ] 
      } 
    ] 
  } 
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
