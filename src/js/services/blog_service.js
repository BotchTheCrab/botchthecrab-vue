var allPostings = null;

var allPostingsSnapshot;
var allCategoriesSnapshot;
var allTagsSnapshot;
var allRepliesSnapshot;

module.exports = {
  getAllPostings: getAllPostings,
  getAllTags: getAllTags,
  getAllReplies: getAllReplies,
  setPostingBlurbs: setPostingBlurbs
};

////////////

function getAllPostings() {
  var deferred = $.Deferred();

  if (allPostingsSnapshot) {
    // console.info('return allPostingsSnapshot from CACHE');
    deferred.resolve(allPostingsSnapshot);
  } else {

    firebase.database().ref('blog/postings').once('value').then(function(snapshot) {
      allPostingsSnapshot = snapshot;
      // console.info('return allPostingsSnapshot from FETCH');
      deferred.resolve(allPostingsSnapshot);
    });

  }

  return deferred.promise();
}

function getAllTags() {
  var deferred = $.Deferred();

  if (allTagsSnapshot) {
    // console.info('return allTagsSnapshot from CACHE');
    deferred.resolve(allTagsSnapshot);
  } else {

    firebase.database().ref('blog/tags').once('value').then(function(snapshot) {
      allTagsSnapshot = snapshot;
      // console.info('return allTagsSnapshot from FETCH');
      deferred.resolve(allTagsSnapshot);
    });

  }

  return deferred.promise();
}

function getAllReplies() {
  var deferred = $.Deferred();

  if (allRepliesSnapshot) {
    // console.info('return allRepliesSnapshot from CACHE');
    deferred.resolve(allRepliesSnapshot);
  } else {

    firebase.database().ref('blog/replies').once('value').then(function(snapshot) {
      allRepliesSnapshot = snapshot;
      // console.info('return allRepliesSnapshot from FETCH');
      deferred.resolve(allRepliesSnapshot);
    });

  }

  return deferred.promise();
}

function setPostingBlurbs(postings) {
  var pattern = /<p(.|\n|\r)+?<\/p>/gi;

  _.each(postings, function(posting) {
    var matches = posting.content.match(pattern);

    if (matches && matches.length > 2) {
      posting.blurb = matches[0] + matches[1];
    } else {
      posting.blurb = posting.content;
    }

    if (!matches) {
      console.info({
        title: posting.title,
        content: posting.content,
        blurb: posting.blurb,
        matches: matches
      });
    }
  });

  return postings;
}
