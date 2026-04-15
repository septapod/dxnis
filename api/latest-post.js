export default async function handler(req, res) {
  try {
    const rssRes = await fetch('https://rss.beehiiv.com/feeds/R3iSBAQYmq.xml');
    if (!rssRes.ok) throw new Error('Failed to fetch RSS');
    const rssXml = await rssRes.text();

    // Extract first <item> (most recent post)
    const itemMatch = rssXml.match(/<item>([\s\S]*?)<\/item>/);
    if (!itemMatch) {
      return res.status(404).json({ error: 'No posts found in RSS' });
    }

    const item = itemMatch[1];

    // Title
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]>/s) || item.match(/<title>(.*?)<\/title>/s);
    const title = titleMatch ? titleMatch[1].trim() : 'Latest Issue';

    // Link
    const linkMatch = item.match(/<link>(.*?)<\/link>/s);
    const url = linkMatch ? linkMatch[1].trim() : 'https://ai4fis.beehiiv.com';

    // Image: check enclosure, media:content, or extract first img from description
    let image = null;
    const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/);
    const mediaMatch = item.match(/<media:content[^>]+url="([^"]+)"/);
    if (enclosureMatch) {
      image = enclosureMatch[1];
    } else if (mediaMatch) {
      image = mediaMatch[1];
    } else {
      // Try to find first img src in description CDATA
      const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/);
      if (descMatch) {
        const imgMatch = descMatch[1].match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch) image = imgMatch[1];
      }
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ title, url, image });
  } catch (err) {
    console.error('latest-post error:', err);
    return res.status(500).json({ error: 'Failed to fetch latest post' });
  }
}
