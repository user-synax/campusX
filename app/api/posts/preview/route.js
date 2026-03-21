import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ message: 'URL is required' }, { status: 400 })
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CampusX Bot/1.0 (Student Social Media)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Use lightweight regex instead of JSDOM for production stability
    const getMeta = (html, property) => {
      const regex = new RegExp(`<meta\\s+(?:property|name)=["']${property}["']\\s+content=["']([^"']*)["']`, 'i')
      const match = html.match(regex)
      return match ? match[1] : null
    }

    const getTitle = (html) => {
      const match = html.match(/<title>([^<]*)<\/title>/i)
      return match ? match[1] : ''
    }

    const metadata = {
      title: getMeta(html, 'og:title') || getTitle(html) || '',
      description: getMeta(html, 'og:description') || getMeta(html, 'description') || '',
      image: getMeta(html, 'og:image') || '',
      url: getMeta(html, 'og:url') || url,
      siteName: getMeta(html, 'og:site_name') || parsedUrl.hostname
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('OG Scraping error:', error)
    return NextResponse.json({ message: 'Failed to scrape metadata' }, { status: 500 })
  }
}
