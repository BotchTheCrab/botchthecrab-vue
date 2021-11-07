var allPostings = null;

var allPostingsSnapshot;
var allCategoriesSnapshot;
var allTagsSnapshot;
var allRepliesSnapshot;

module.exports = {
  getAllPostings: getAllPostings,
  getAllCategories: getAllCategories,
  getAllTags: getAllTags,
  getAllReplies: getAllReplies,
  setPostingBlurbs: setPostingBlurbs,
  createPostReply: createPostReply
};

////////////

function getAllPostings(refresh) {
  var deferred = $.Deferred();

  if (allPostingsSnapshot && !refresh) {
    deferred.resolve(allPostingsSnapshot);
  } else {

    firebase.database().ref('blog/postings').once('value').then(function(snapshot) {
      allPostingsSnapshot = snapshot;
      deferred.resolve(allPostingsSnapshot);
    });

  }

  return deferred.promise();
}

function getAllCategories() {
  var deferred = $.Deferred();

  if (allCategoriesSnapshot) {
    deferred.resolve(allCategoriesSnapshot);
  } else {

    firebase.database().ref('blog/categories').once('value').then(function(snapshot) {
      allCategoriesSnapshot = snapshot;
      deferred.resolve(allCategoriesSnapshot);
    });

  }

  return deferred.promise();
}

function getAllTags() {
  var deferred = $.Deferred();

  if (allTagsSnapshot) {
    deferred.resolve(allTagsSnapshot);
  } else {

    firebase.database().ref('blog/tags').once('value').then(function(snapshot) {
      allTagsSnapshot = snapshot;
      deferred.resolve(allTagsSnapshot);
    });

  }

  return deferred.promise();
}

function getAllReplies(refresh) {
  var deferred = $.Deferred();

  if (allRepliesSnapshot && !refresh) {
    deferred.resolve(allRepliesSnapshot);
  } else {

    firebase.database().ref('blog/replies').once('value').then(function(snapshot) {
      allRepliesSnapshot = snapshot;
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

  var getCurrentReplies = getAllReplies(true).then(function(response) {
    return response.val();
  });

  var getTrace = $.get('https://www.cloudflare.com/cdn-cgi/trace').then(function(response) {
    var ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
    return response.match(ipRegex)[0];
  });

  return $.when(getCurrentReplies, getTrace).done(function(repliesStore, ipAddress) {

    var newReplyIndex = repliesStore.length;

    var newReply = {
      replyId: newReplyIndex + 1,
      postingId: posting.postingId,
      posted: getNewPostTime(),
      poster: replyData.poster,
      content: replyData.content,
      address: ipAddress,
      notify: replyData.notify || false
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

      // get list of every commenter who requested reply notifications
      var notificationRecipients = _.chain(repliesStore)
        .where({ postingId: posting.postingId, notify: true })
        .filter(function(reply) {
          var email = reply.email.toLowerCase();
          return email !== 'botch@botchthecrab.com' && email !== replyData.email;
        })
        .map(function(reply) {
          return reply.email.toLowerCase();
        })
        .unique()
        .value();
      notificationRecipients.unshift('botch@botchthecrab.com');

      var notificationEmailRequests = [];

      _.each(notificationRecipients, function(recipient) {

        var newMailDocument = {
          to: recipient,
          message: {
            subject: 'New Comment for "' + posting.title +  '" [BotchTheCrab.com]',
            html: '<p>' +
                    '<b>' + replyData.poster + '</b> ' +
                    (replyData.website ? '[<a href="' + replyData.website + '">' + replyData.website + '</a>] ' : '') +
                    'wrote the following on ' + newReply.posted + ':<br />' +
                  '</p>' +
                  '<p>' + newReply.content.replace(/\n/g, '<br/>') + '</p>' +
                  '<hr style="margin: 2em 0 1em" />' +
                  '<p>' +
                    '<i>To unsubscribe to comments from this post, reply back with the word "Unsubscribe" and Botch will adjust your notification settings.</i>' +
                  '</p>'
          },
          fromBTC: true
        };

        var newMailRequest = firebase.firestore().collection('mail').add(newMailDocument)
          .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);

            // delete this document
            /*
            window.setTimeout(function() {

              firebase.firestore().collection('mail').doc(docRef.id).delete().then(function(response) {
                console.log("Document " + docRef.id + " deleted");
              })
              .catch(function(error) {
                console.log("Could not delete new document");
              });

            }, 2000);
            */

            return newReply;
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
            return error;
          });

        notificationEmailRequests.push(newMailRequest);
      });

      return $.when(notificationEmailRequests);

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
