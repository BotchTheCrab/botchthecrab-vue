const {initializeApp} = require('firebase-admin/app');
const {getDatabaseWithUrl} = require('firebase-admin/database');
const {logger} = require('firebase-functions/logger');
const {onRequest} = require('firebase-functions/https');
const {createRssFeed} = require('./rss');

const app = initializeApp();
const database = getDatabaseWithUrl('https://botch-the-crab.firebaseio.com', app);
const postLimit = 8;

exports.rssFeed = onRequest({region: 'us-central1'}, async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.set('Allow', 'GET, HEAD').status(405).send('Method Not Allowed');
    return;
  }

  try {
    const snapshot = await database.ref('blog/postings')
      .orderByChild('posted')
      .limitToLast(postLimit)
      .once('value');
    const postings = [];

    snapshot.forEach((postingSnapshot) => {
      postings.push(postingSnapshot.val());
    });

    const xml = createRssFeed(postings.reverse());

    response
      .set('Content-Type', 'application/rss+xml; charset=utf-8')
      .set('Cache-Control', 'public, max-age=300')
      .status(200);

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
