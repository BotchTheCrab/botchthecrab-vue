const assert = require('node:assert/strict');
const test = require('node:test');
const {createRssFeed, getOrFetchRssFeed, matchesIfNoneMatch} = require('../rss');

test('coalesces concurrent feed fetches and caches successful results', async () => {
  await assert.rejects(
    getOrFetchRssFeed(() => Promise.reject(new Error('database unavailable'))),
    /database unavailable/
  );

  let fetchCount = 0;
  let resolveFetch;
  const fetchFeed = () => {
    fetchCount++;
    return new Promise((resolve) => {
      resolveFetch = resolve;
    });
  };
  const firstRequest = getOrFetchRssFeed(fetchFeed);
  const secondRequest = getOrFetchRssFeed(fetchFeed);

  await Promise.resolve();
  resolveFetch('<rss />');

  const results = await Promise.all([firstRequest, secondRequest]);

  assert.deepEqual(results.map((result) => result.xml), ['<rss />', '<rss />']);
  assert.equal(results[0].etag, results[1].etag);
  assert.match(results[0].etag, /^"[a-f0-9]{64}"$/);
  assert.equal(fetchCount, 1);
  assert.deepEqual(await getOrFetchRssFeed(() => {
    throw new Error('should use the cache');
  }), results[0]);
});

test('matches strong, weak, and wildcard If-None-Match values', () => {
  const etag = '"abc123"';

  assert.equal(matchesIfNoneMatch(etag, etag), true);
  assert.equal(matchesIfNoneMatch(`"other", W/${etag}`, etag), true);
  assert.equal(matchesIfNoneMatch('*', etag), true);
  assert.equal(matchesIfNoneMatch('"other"', etag), false);
  assert.equal(matchesIfNoneMatch(undefined, etag), false);
});

test('creates RSS 2.0 items with escaped titles, excerpts, links, and dates', () => {
  const xml = createRssFeed([{
    postingId: 42,
    posted: '2026-10-24 14:09:21',
    title: 'A & <Test>',
    content: '<p>Hello <a href="/post">world</a> &amp; <b>friends</b> <strong>all</strong><em> along</em><span style="font-size: 11pt;"> today</span><img src="/post_images/photo.jpg?size=small&amp;format=webp"></p><p>Second paragraph</p>'
  }]);

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?><rss version="2\.0"[^>]*xmlns:media="http:\/\/search\.yahoo\.com\/mrss\/">/);
  assert.match(xml, /<title>A &amp; &lt;Test&gt;<\/title>/);
  assert.match(xml, /<description><!\[CDATA\[Hello world &amp; friends all along today\]\]><\/description>/);
  assert.match(xml, /<link>https:\/\/botchthecrab\.com\/posting\/42<\/link>/);
  assert.match(xml, /<guid isPermaLink="true">https:\/\/botchthecrab\.com\/posting\/42<\/guid>/);
  assert.match(xml, /<pubDate>Sat, 24 Oct 2026 14:09:21 GMT<\/pubDate>/);
  assert.match(xml, /<media:thumbnail url="https:\/\/botchthecrab\.com\/post_images\/photo\.jpg\?size=small&amp;format=webp" \/>/);
  assert.doesNotMatch(xml, /Second paragraph/);
});

test('splits CDATA terminators so descriptions remain well-formed XML', () => {
  const xml = createRssFeed([{
    postingId: 1,
    posted: '2026-01-01 00:00:00',
    title: 'CDATA',
    content: '<p>before ]]> after</p>'
  }]);

  assert.match(xml, /before \]\]\]\]><!\[CDATA\[> after/);
  assert.doesNotMatch(xml, /<media:thumbnail/);
});

test('rejects malformed posting dates', () => {
  assert.throws(() => createRssFeed([{
    postingId: 1,
    posted: '2026-02-30 00:00:00',
    title: 'Invalid date',
    content: '<p>content</p>'
  }]), /Invalid posting date/);
});
