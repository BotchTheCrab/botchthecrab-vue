const siteUrl = 'https://botchthecrab.com';
const channelDescription = 'Botch the Crab babbles about Transformers and life in New York City. He\'s very funny and kind of mean.';

module.exports = {
  createRssFeed
};

function createRssFeed(postings) {
  const items = postings.map((posting) => {
    const postingId = encodeURIComponent(posting.postingId);
    const postingUrl = `${siteUrl}/posting/${postingId}`;
    const description = getFirstParagraph(posting.content);

    return [
      '<item>',
      `<title>${escapeXml(posting.title)}</title>`,
      `<description><![CDATA[${escapeCdata(description)}]]></description>`,
      `<link>${postingUrl}</link>`,
      `<guid isPermaLink="true">${postingUrl}</guid>`,
      `<pubDate>${formatPubDate(posting.posted)}</pubDate>`,
      '</item>'
    ].join('');
  }).join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"><channel>',
    `<title>${escapeXml('Botch the Crab')}</title>`,
    `<description>${escapeXml(channelDescription)}</description>`,
    `<link>${siteUrl}</link>`,
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
    .replace(/<\/?b\b[^>]*>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, '');
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
