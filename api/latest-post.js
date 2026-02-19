export default async function handler(req, res) {
  try {
    // Fetch sitemap to find most recent post URL
    const sitemapRes = await fetch('https://ai4fis.beehiiv.com/sitemap.xml');
    if (!sitemapRes.ok) throw new Error('Failed to fetch sitemap');
    const sitemapXml = await sitemapRes.text();

    // Parse sitemap for /p/ URLs with lastmod dates
    const urlPattern = /<url>\s*<loc>(https:\/\/ai4fis\.beehiiv\.com\/p\/[^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
    let latest = null;
    let match;

    while ((match = urlPattern.exec(sitemapXml)) !== null) {
      const entry = { url: match[1], date: match[2] };
      if (!latest || entry.date > latest.date) {
        latest = entry;
      }
    }

    if (!latest) {
      return res.status(404).json({ error: 'No posts found' });
    }

    // Fetch the post page to extract the title
    const postRes = await fetch(latest.url);
    if (!postRes.ok) throw new Error('Failed to fetch post');
    const postHtml = await postRes.text();

    // Extract title from og:title meta tag (most reliable)
    const ogTitleMatch = postHtml.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
    // Fallback to <title> tag
    const titleMatch = postHtml.match(/<title>([^<]+)<\/title>/);

    const title = ogTitleMatch
      ? ogTitleMatch[1]
      : titleMatch
        ? titleMatch[1].replace(/\s*[|\-–—].*$/, '') // Strip site suffix
        : 'Latest Issue';

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ title, url: latest.url });
  } catch (err) {
    console.error('latest-post error:', err);
    return res.status(500).json({ error: 'Failed to fetch latest post' });
  }
}
