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
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`,
      { headers: { 'User-Agent': 'LearnMosaic/1.0' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.docs.slice(0, 5).map(d => ({
      title: d.title,
      url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null
    })).filter(i => i.url)
  } catch {
    return await searchDuckDuckGoImages(query)
  }
}

async function searchDuckDuckGoImages(query) {
  try {
    const res = await fetch(
      `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'LearnMosaic/1.0' } }
    )
    const html = await res.text()
    const urls = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g)]
      .map(m => m[1])
      .filter(u => u.startsWith('http'))
      .slice(0, 5)
    return urls.map(u => ({ url: u }))
  } catch {
    return []
  }
}
