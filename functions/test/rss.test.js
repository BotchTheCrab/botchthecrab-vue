const assert = require('node:assert/strict');
const test = require('node:test');
const {createRssFeed} = require('../rss');

test('creates RSS 2.0 items with escaped titles, excerpts, links, and dates', () => {
  const xml = createRssFeed([{
    postingId: 42,
    posted: '2026-10-24 14:09:21',
    title: 'A & <Test>',
    content: '<p>Hello <a href="/post">world</a> &amp; <b>friends</b> <strong>all</strong><em> along</em><span style="font-size: 11pt;"> today</span><img src="x"></p><p>Second paragraph</p>'
  }]);

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?><rss version="2\.0">/);
  assert.match(xml, /<title>A &amp; &lt;Test&gt;<\/title>/);
  assert.match(xml, /<description><!\[CDATA\[Hello world &amp; friends all along today\]\]><\/description>/);
  assert.match(xml, /<link>https:\/\/botchthecrab\.com\/posting\/42<\/link>/);
  assert.match(xml, /<guid isPermaLink="true">https:\/\/botchthecrab\.com\/posting\/42<\/guid>/);
  assert.match(xml, /<pubDate>Sat, 24 Oct 2026 14:09:21 GMT<\/pubDate>/);
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
});

test('rejects malformed posting dates', () => {
  assert.throws(() => createRssFeed([{
    postingId: 1,
    posted: '2026-02-30 00:00:00',
    title: 'Invalid date',
    content: '<p>content</p>'
  }]), /Invalid posting date/);
});
