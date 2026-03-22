import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'media*.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js needs unsafe-eval 
              "style-src 'self' 'unsafe-inline'", 
              "img-src 'self' data: https: blob: res.cloudinary.com *.giphy.com i.ytimg.com *.googleusercontent.com",  // allow external images (avatars, OG) 
              "connect-src 'self' https://api.anthropic.com wss://*.pusher.com https://*.pusher.com", 
              "font-src 'self'", 
              "frame-src 'none'", 
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
