var allPostings = null;

var allPostingsSnapshot;
var allCategoriesSnapshot;
var allTagsSnapshot;
var allRepliesSnapshot;

module.exports = {
  getAllPostings: getAllPostings,
  getAllTags: getAllTags,
  getAllReplies: getAllReplies,
  setPostingBlurbs: setPostingBlurbs,
  createPostReply: createPostReply
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

function getAllReplies(refresh) {
  var deferred = $.Deferred();

  if (allRepliesSnapshot && !refresh) {
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
  });

  return postings;
}

function createPostReply(posting, replyData) {

  var getCurrentReplyIndex = getAllReplies(true).then(function(response) {
    var repliesStore = response.val();
    return repliesStore.length;
  });

  var getTrace = $.get('https://www.cloudflare.com/cdn-cgi/trace').then(function(response) {
    var ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
    return response.match(ipRegex)[0];
  });

  return $.when(getCurrentReplyIndex, getTrace).done(function(newReplyIndex, ipAddress) {

    var newReply = {
      replyId: newReplyIndex + 1,
      postingId: posting.postingId,
      posted: getNewPostTime(),
      poster: replyData.poster,
      content: replyData.content,
      address: ipAddress,
      notify: false
    };
    if (replyData.email) {
      newReply.email = replyData.email;
    }
    if (replyData.website) {
      newReply.website = replyData.website;
    }

    var replyUpdate = {};
    replyUpdate['blog/replies/' + newReplyIndex] = newReply;

    return firebase.database().ref().update(replyUpdate).then(function(response) {
      return newReply;
    }, function(error) {
      console.error(error);
      window.alert("There was an error attempting to submit your reply.");
      return error;
    });
  });

}

function getNewPostTime() {
  var now = new Date();
  var postYear = now.getFullYear();
  var postMonth = zeroPad(now.getMonth() + 1);
  var postDate = zeroPad(now.getDate());
  var postHour = zeroPad(now.getHours());
  var postMinutes = zeroPad(now.getMinutes());
  var postSeconds = zeroPad(now.getSeconds());
  return postYear + '-' + postMonth + '-' + postDate + ' ' + postHour + ':' + postMinutes + ':' + postSeconds;
}

function zeroPad(n) {
  return (n < 10) ? '0' + n : n;
}
