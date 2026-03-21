import { NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'

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
    const dom = new JSDOM(html)
    const doc = dom.window.document

    const getMeta = (property) => {
      const element = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`)
      return element ? element.getAttribute('content') : null
    }

    const metadata = {
      title: getMeta('og:title') || doc.title || '',
      description: getMeta('og:description') || getMeta('description') || '',
      image: getMeta('og:image') || '',
      url: getMeta('og:url') || url,
      siteName: getMeta('og:site_name') || parsedUrl.hostname
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('OG Scraping error:', error)
    return NextResponse.json({ message: 'Failed to scrape metadata' }, { status: 500 })
  }
}
