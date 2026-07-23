export async function searchWeb(query) {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { headers: { 'User-Agent': 'LearnMosaic/1.0' } }
    )
    const data = await res.json()
    const results = (data.RelatedTopics || [])
      .filter(t => t.Text && t.FirstURL)
      .slice(0, 5)
      .map(t => ({ title: t.Text.split(' - ')[0], snippet: t.Text, url: t.FirstURL }))
    return {
      abstract: data.AbstractText || '',
      source: data.AbstractSource || '',
      sourceUrl: data.AbstractURL || '',
      results
    }
  } catch (e) {
    return { abstract: '', results: [] }
  }
}

export async function searchImages(query) {
  try {
    // Search Wikipedia for articles matching the query
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=8&origin=*`,
      { headers: { 'User-Agent': 'LearnMosaic/1.0' } }
    )
    const searchData = await searchRes.json()
    const titles = (searchData.query?.search || []).map(s => s.title).filter(Boolean)
    if (titles.length === 0) return []

    // Batch-fetch page images for all found articles
    const pageRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${titles.map(t => encodeURIComponent(t)).join('%7C')}&prop=pageimages&format=json&pithumbsize=400&origin=*`,
      { headers: { 'User-Agent': 'LearnMosaic/1.0' } }
    )
    const pageData = await pageRes.json()
    const pages = Object.values(pageData.query?.pages || {})

    return pages
      .filter(p => p.thumbnail?.source)
      .slice(0, 6)
      .map(p => ({ url: p.thumbnail.source, title: p.title }))
  } catch {
    return []
  }
}
