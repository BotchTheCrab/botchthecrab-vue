var allPostings = null;
var allCategories = null;
var allTags = null;
var allReplies = null;

const firebaseStoragePostImagesPath = 'https://firebasestorage.googleapis.com/v0/b/botch-the-crab.appspot.com/o/post_images%2F';
const firebaseStoragePostImagesParams = '?alt=media';

module.exports = {
  getAllPostings,
  parsePostingImageUrlsIntoFirebaseUrls,
  parseFirebaseUrlsIntoPostingImageUrls,
  getAllCategories,
  getAllTags,
  getAllReplies,
  setPostingBlurbs,
  initAuthorization,
  initContentEditor,
  createPostReply,
};

////////////

function getAllPostings(refresh) {
  var deferred = $.Deferred();

  if (allPostings && !refresh) {
    deferred.resolve(allPostings);
  } else {

    firebase.database().ref('blog/postings').once('value').then(function(snapshot) {
      allPostings = _.values(snapshot.val());
      deferred.resolve(allPostings);
    });

  }

  return deferred.promise();
}

function parsePostingImageUrlsIntoFirebaseUrls(postingContent) {
  return postingContent.replace(/(http:\/\/botchthecrab.com)*(\/post_images\/)([^"]+)/g, firebaseStoragePostImagesPath + '$3' + firebaseStoragePostImagesParams);
}

function parseFirebaseUrlsIntoPostingImageUrls(postingContent) {
  const firebaseImagesPathRegExp = new RegExp(firebaseStoragePostImagesPath, 'g');
  const firebaseImagesParamsRegExp = new RegExp('\\' + firebaseStoragePostImagesParams, 'g');
  return postingContent.replace(firebaseImagesPathRegExp, '/post_images/').replace(firebaseImagesParamsRegExp, '');
}

function getAllCategories(refresh) {
  var deferred = $.Deferred();

  if (allCategories && !refresh) {
    deferred.resolve(allCategories);
  } else {

    firebase.database().ref('blog/categories').once('value').then(function(snapshot) {
      allCategories = _.values(snapshot.val());
      deferred.resolve(allCategories);
    });

  }

  return deferred.promise();
}

function getAllTags(refresh) {
  var deferred = $.Deferred();

  if (allTags && !refresh) {
    deferred.resolve(allTags);
  } else {

    firebase.database().ref('blog/tags').once('value').then(function(snapshot) {
      allTags = _.values(snapshot.val());
      deferred.resolve(allTags);
    });

  }

  return deferred.promise();
}

function getAllReplies(refresh) {
  var deferred = $.Deferred();

  if (allReplies && !refresh) {
    deferred.resolve(allReplies);
  } else {

    firebase.database().ref('blog/replies').once('value').then(function(snapshot) {
      allReplies = _.values(snapshot.val());
      deferred.resolve(allReplies);
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

    posting.blurb = parsePostingImageUrlsIntoFirebaseUrls(posting.blurb);
  });

  return postings;
}

function initAuthorization(vm) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('SIGNED IN!');
      vm.init();
    } else {
      console.log('NOT SIGNED IN!');
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    }
  });
}

function initContentEditor(vm) {
  let s = document.createElement('script');
  const tinymceApiKey = "casdhqgylieh1y3j27nsdxsrpn4f1qtupm3zddbpqzvref26";
  s.src = "https://cdn.tiny.cloud/1/" + tinymceApiKey + "/tinymce/5/tinymce.min.js";
  s.type = "text/javascript";
  s.referrerPolicy = "origin";
  s.onload = function() {
    vm.tinymce = tinymce;

    let tinymceOptions = {
      selector: '#create-posting-content',
      plugins: 'image code lists charmap fullscreen media link',

      allow_script_urls: true,
      convert_urls: false,
      allow_unsafe_link_target: true,
      browser_spellcheck: true,
      extended_valid_elements: 'a[href|target|onclick|class|style]',

      toolbar1: 'bold italic underline strikethrough | aligncenter | outdent indent | numlist bullist',
      toolbar2: 'charmap | fullscreen | image media link | code',

      skin: 'oxide-dark',
      content_css: 'dark, /css/cassette.css',
      content_style: 'body { text-align: left; margin: 10px; }',

      image_class_list: [
        {title: 'none', value: ''},
        {title: 'float left', value: 'post-image-left'},
        {title: 'float right', value: 'post-image-right'},
      ],

      // image upload properties
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback: function (success, value, meta) {

        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');

        input.onchange = function () {
          let fileData = this.files[0];
          uploadPostingImage(fileData).then(function(fileInfo) {
            success(fileInfo.url, { title: fileInfo.name });
          });
        };

        input.click();
      }
    };

    tinymce.init(tinymceOptions);

    vm.editorLoaded = true;
  };

  const $head = document.getElementsByTagName('head')[0];
  $head.appendChild(s);
}

function uploadPostingImage(fileData) {
  const storageRef = firebase.storage().ref('post_images/' + fileData.name);
  return storageRef.put(fileData).then(function(snapshot) {
    if (!snapshot.state === 'success') {
      window.alert("There was an error attempting to upload your image.");
      return;
    }
    return {
      url: parsePostingImageUrlsIntoFirebaseUrls('/' + snapshot.metadata.fullPath),
      name: fileData.name
    };
  });
}

function createPostReply(posting, replyData) {

  var getCurrentReplies = getAllReplies(true).then(function(response) {
    return response.val();
  });

  var getTrace = $.get('https://www.cloudflare.com/cdn-cgi/trace').then(function(response) {
    var ipRegex = /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/
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
                  '<p>' +
                    '<a href="https://botchthecrab.com/posting/' + posting.postingId + '">View posting</a>' +
                  '</p>' +
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
