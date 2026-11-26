const crypto = require('node:crypto');

const siteUrl = 'https://botchthecrab.com';
const rssFeedUrl = `${siteUrl}/feed.xml`;
const channelDescription = 'Botch the Crab babbles about Transformers and life in general. He\'s sometimes funny and sometimes kind of mean.';
const cacheTtlMs = 10 * 60 * 1000;

let cachedFeed = null;
let cacheExpiresAt = 0;
let pendingFetch = null;

module.exports = {
  createRssFeed,
  getOrFetchRssFeed,
  matchesIfNoneMatch
};

function getOrFetchRssFeed(fetchFeed) {
  const now = Date.now();

  if (cachedFeed !== null && now < cacheExpiresAt) {
    return Promise.resolve(cachedFeed);
  }

  if (pendingFetch) {
    return pendingFetch;
  }

  pendingFetch = Promise.resolve()
    .then(fetchFeed)
    .then((feedXml) => {
      const etag = `"${crypto.createHash('sha256').update(feedXml).digest('hex')}"`;
      cachedFeed = {xml: feedXml, etag};
      cacheExpiresAt = Date.now() + cacheTtlMs;
      return cachedFeed;
    })
    .finally(() => {
      pendingFetch = null;
    });

  return pendingFetch;
}

function matchesIfNoneMatch(ifNoneMatch, etag) {
  if (typeof ifNoneMatch !== 'string') {
    return false;
  }

  const currentTag = etag.replace(/^W\//, '');
  const requestTags = ifNoneMatch.match(/(?:W\/)?"[^"]*"|\*/g) || [];

  return requestTags.some((requestTag) =>
    requestTag === '*' || requestTag.replace(/^W\//, '') === currentTag
  );
}

function createRssFeed(postings) {
  const items = postings.map((posting) => {
    const postingId = encodeURIComponent(posting.postingId);
    const postingUrl = `${siteUrl}/posting/${postingId}`;
    const description = getFirstParagraph(posting.content);
    const imageUrl = getFirstImage(posting.content);

    return [
      '<item>',
      `<title>${escapeXml(posting.title)}</title>`,
      `<description><![CDATA[${escapeCdata(description)}]]></description>`,
      `<link>${postingUrl}</link>`,
      `<guid isPermaLink="true">${postingUrl}</guid>`,
      `<pubDate>${formatPubDate(posting.posted)}</pubDate>`,
      (imageUrl ? `<media:thumbnail url="${escapeXml(imageUrl)}" />` : ''),
      '</item>'
    ].join('');
  }).join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">',
    '<channel>',
    `<title>${escapeXml('Botch the Crab')}</title>`,
    `<description>${escapeXml(channelDescription)}</description>`,
    `<link>${siteUrl}</link>`,
    `<atom:link href="${rssFeedUrl}" rel="self" type="application/rss+xml" />`,
    items,
    '</channel></rss>'
  ].join('');
}

function getFirstParagraph(content) {
  const match = content.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);

  if (!match) {
    return '';
  }

  return match[1]
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<\/?(?:b|strong|em|span)\b[^>]*>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, '');
}

function getFirstImage(content) {
  const imageTags = content.match(/<img\b[^>]*>/gi) || [];

  for (const imageTag of imageTags) {
    const srcMatch = imageTag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);

    if (!srcMatch) {
      continue;
    }

    const src = (srcMatch[1] || srcMatch[2] || srcMatch[3])
      .replace(/&(?:amp|#0*38|#x0*26);/gi, '&');

    try {
      const imageUrl = new URL(src, siteUrl);

      if (imageUrl.protocol === 'http:' || imageUrl.protocol === 'https:') {
        return imageUrl.href;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

function formatPubDate(posted) {
  const match = posted.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);

  if (!match) {
    throw new Error(`Invalid posting date: ${posted}`);
  }

  const [, year, month, day, hour, minute, second] = match;
  // Stored post times have no timezone; preserve the legacy feed's GMT interpretation.
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  if (Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day) ||
    date.getUTCHours() !== Number(hour) ||
    date.getUTCMinutes() !== Number(minute) ||
    date.getUTCSeconds() !== Number(second)) {
    throw new Error(`Invalid posting date: ${posted}`);
  }

  return date.toUTCString();
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCdata(value) {
  return value.replace(/\]\]>/g, ']]]]><![CDATA[>');
}
