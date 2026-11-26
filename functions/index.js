const {initializeApp} = require('firebase-admin/app');
const {getDatabaseWithUrl} = require('firebase-admin/database');
const {logger} = require('firebase-functions/logger');
const {onRequest} = require('firebase-functions/https');
const {createRssFeed, getOrFetchRssFeed, matchesIfNoneMatch} = require('./rss');

const app = initializeApp();
const database = getDatabaseWithUrl('https://botch-the-crab.firebaseio.com', app);
const postLimit = 8;

exports.rssFeed = onRequest({region: 'us-central1'}, async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.set('Allow', 'GET, HEAD').status(405).send('Method Not Allowed');
    return;
  }

  try {
    const {xml, etag} = await getOrFetchRssFeed(async () => {
      const snapshot = await database.ref('blog/postings')
        .orderByChild('posted')
        .limitToLast(postLimit)
        .once('value');
      const postings = [];

      snapshot.forEach((postingSnapshot) => {
        postings.push(postingSnapshot.val());
      });

      return createRssFeed(postings.reverse());
    });

    response
      .set('Content-Type', 'application/rss+xml; charset=utf-8')
      .set('Cache-Control', 'public, max-age=43200, s-maxage=259200')
      .set('ETag', etag);

    if (matchesIfNoneMatch(request.headers['if-none-match'], etag)) {
      response.status(304).end();
      return;
    }

    response.status(200);

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    response.send(xml);
  } catch (error) {
    logger.error('Failed to generate RSS feed', error);
    response.status(500).send('Unable to generate RSS feed');
  }
});
