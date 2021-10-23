<style lang="scss">

  .replies {
  	text-align: left;
  	margin: 50px auto;
  	max-width: 600px;

    .reply-header {
    	font-family: Audiowide, Arial, Verdana, sans-serif;
    	font-size: 2.5em;
    	letter-spacing: 1px;
    	font-variant: small-caps;
    	color: WHITE;

    	border-bottom: 1px solid #666;
    	padding-bottom: 2px;
    	margin-bottom: 20px;
    	clear: both;
    }

    .reply {
    	margin-bottom: 30px;

      .reply-body {
      	font-size: 1.0em;
      	line-height: 1.5em;
      }

      &.reply-wrapper-botch {
      	background-image: url(/images/webmaster.png);
      	background-repeat: no-repeat;

        .reply-body {
          padding-left: 60px;
        }
      }

      .reply-footer {
      	text-align: right;
      	font-variant: small-caps;

        & > span {
          white-space: nowrap;
        }

        .reply-time {
        	font-size: 0.9em;
        	// letter-spacing: -1px;
        	margin-right: 3px;
        }
      }

      .reply-divider {
      	border-bottom: 1px dashed #666;
      	margin: 25px 0px;
      }

    }
  }

  .new-reply {
    text-align: left;
  	margin: 50px auto;
  	max-width: 600px;

    .new-reply-header {
      font-family: Audiowide, Arial, Verdana, sans-serif;
    	font-size: 2.5em;
    	letter-spacing: 1px;
    	font-variant: small-caps;
    	color: white;
    	border-bottom: 1px solid #666;
    	padding-bottom: 2px;
    	margin-bottom: 20px;
    	clear: both;
    }

    $inputWidth: 225px;
    $labelWidth: 70px;
    $labelRightMargin: 5px;
    $inputRightMargin: 15px;
    $fieldPaddingBottom: 15px;

    .new-reply-field {
      padding: 0 0 $fieldPaddingBottom 0;
      text-align: center;

      &.secret {
        padding: 0;
        width: 0;
        height: 0;
        overflow: hidden;
      }

      label {
        width: $labelWidth;
        text-align: right;
        margin-right: $labelRightMargin;
        color: #ddd;
      }

      textarea {
        width: 100%;
      }

      input[type="text"],
      input[type="email"] {
        width: $inputWidth;
        font-size: 12px;
        margin-right: $inputRightMargin;
      }

    }

    .new-reply-notify {
      width: $inputWidth + $labelWidth + $labelRightMargin;
      margin: 0 auto;
      padding-left: $labelWidth + $labelRightMargin + 2px;
      padding-bottom: $fieldPaddingBottom;

      label {
        margin: 0;
        vertical-align: text-top;
        font-weight: normal;
        font-size: 10px;
      }
    }

    .new-reply-submit {
      text-align: center;

      button {
        width: $inputWidth;
        margin-left: $labelWidth + $labelRightMargin;
        margin-right: $inputRightMargin;
      }
    }

  }

  .replies-closed {
  	margin-top: 30px;
  	margin-bottom: 20px;
  	margin-left: 10%;
  	margin-right: 10%;
  	padding: 5px;
  	background-color: #333;
  	border: 1px solid #222;
  	text-align: center;
  	font-weight: bold;
  	font-size: 10px;
  }

</style>

<template>

  <div class="container-fluid center-content" v-if="posting.title">

    <botch-watermark></botch-watermark>

    <div class="post-title">{{ posting.title }}</div>

    <div class="post-body-full" v-html="posting.content"></div>

    <div class="post-footer" v-if="posting.content.length">

    	<div class="post-footer-item">
        <label>Tags:</label>
        <template v-for="(tag, index) in tags">
          <router-link v-bind:to="{ name: 'postings', query: { tagId: tag.tagId } }">{{ tag.text }}</router-link>
          <template v-if="index < tags.length - 1"> &#0149; </template>
        </template>
      </div>

      <div class="post-footer-item">
        Posted: <span>{{ formatPosted(posting.posted) }}</span>
  		</div>

	  </div>

    <div class="adjacent-posts">
      <span v-if="previousPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: previousPosting.postingId } }">&#x25C4; <span>Older</span></router-link>
      </span>
      <span>
        <a v-on:click="scrollTop">&#x25B2; Top</a>
      </span>
      <span v-if="nextPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: nextPosting.postingId } }"><span>Newer</span> &#x25BA;</router-link>
      </span>
    </div>

    <div class="replies" v-if="replies.length">
  		<div class="reply-header">Comments</div>

      <div v-bind:id="'replyId' + reply.replyId" class="reply" v-bind:class="reply.isWebmaster ? 'reply-wrapper-botch' : ''" v-for="(reply, index) in replies">
        <div class="reply-body" v-html="reply.content"></div>
        <div class="reply-footer">
          <span>
            &raquo; Posted
            <span class="reply-time">{{ formatPosted(reply.posted) }}</span>
          </span>
          <span>
            by <b>{{ reply.poster }}</b>
            <span v-if="reply.isWebmaster"> - WEBMASTER</span>
            <span v-if="!reply.isWebmaster && reply.website">[<a v-bind:href="reply.website" target="_blank">website</a>]</span>
          </span>
        </div>

        <div class="reply-divider" v-if="index < replies.length - 1"></div>
      </div>

    </div>

    <div class="replies-closed" v-if="!posting.allowReplies">Comments are {{ replies.length ? "closed" : "disabled" }} for this post.</div>

    <div class="new-reply" v-if="posting.allowReplies">
      <div class="new-reply-header">Leave a Comment</div>

      <div class="new-reply-field">
        <textarea name="content" rows="4" cols="10" v-model="reply.content" v-bind:disabled="savingReply" placeholder="Enter your comments here"></textarea>
      </div>

      <div class="new-reply-field">
        <label>Name:</label>
        <input type="text" name="poster" v-model="reply.poster" v-bind:disabled="savingReply" />
      </div>

      <div class="new-reply-field">
        <label>Website:</label>
        <input type="text" name="website" v-model="reply.website" v-bind:disabled="savingReply" />
      </div>

      <!-- honeypot -->
      <div class="new-reply-field secret">
        <label>URL:</label>
        <input type="text" name="url" v-model="reply.honeypot" v-bind:disabled="savingReply" tabindex="-1" />
      </div>

      <div class="new-reply-field">
        <label>Email:</label>
        <input type="email" name="email" v-model="reply.email" v-bind:disabled="savingReply" placeholder="Email will not be displayed/shared" />
      </div>

      <div class="new-reply-notify" v-show="reply.email">
        <input type="checkbox" id="new-reply-notify" name="notify" v-model="reply.notify" v-bind:disabled="savingReply" /> <label for="new-reply-notify">Notify me of new comments</label>
      </div>

      <div class="new-reply-submit">
        <button v-on:click="handleNewReply" v-bind:disabled="savingReply">{{ savingReply ? "Submitting ..." : "Submit" }}</button>
      </div>

    </div>

    <div class="adjacent-posts" v-if="replies.length">
      <span v-if="previousPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: previousPosting.postingId } }">&#x25C4; <span>Older</span></router-link>
      </span>
      <span>
        <a v-on:click="scrollTop">&#x25B2; Top</a>
      </span>
      <span v-if="nextPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: nextPosting.postingId } }"><span>Newer</span> &#x25BA;</router-link>
      </span>
    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');
  var cookiesService = require('services/cookies_service');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');

  var vm;
  var postingsStore = null;
  var tagsStore = null;
  var repliesStore = null;

  window.tf = archiveService.tf;

  const $openGraphMetaTag = $('meta[property="og:image"]');

  module.exports = {

    data () {
      return {

        posting: {},

        tags: [],

        replies: [],

        previousPosting: null,
        nextPosting: null,

        reply: {
          content: '',
          poster: '',
          email: '',
          website: '',
          honeypot: '',
          notify: false
        },

        savingReply: false
      }
    },

    beforeMount() {
      vm = this;
      this.updatePosting();
    },

    beforeDestroy() {
      vm.clearOpenGraphImageMetaTag();
    },

    watch: {
      $route(to, from) {
        this.updatePosting();
      }
    },

    methods: {

      updatePosting: function() {
        var postingId = Number(this.$route.params.postingId);

        blogService.getAllPostings().then(function(response) {
          postingsStore = _.sortBy(response.val(), 'posted');

          vm.posting = _.findWhere(postingsStore, { postingId: postingId });

          vm.updateTitle();
          vm.updateOpenGraphImageMetaTag();

          var postingIndex = _.indexOf(postingsStore, vm.posting);

          vm.previousPosting = postingIndex > 0 ? postingsStore[postingIndex - 1] : null;
          vm.nextPosting = postingIndex < postingsStore.length - 1 ? postingsStore[postingIndex + 1] : null;

          vm.updateTags();
          vm.updateReplies();

          var userInfo = cookiesService.readCookie('userInfo');
          if (userInfo) {
            try {
              userInfo = JSON.parse(userInfo);
              _.each(['poster', 'email', 'website', 'notify'], function(userProperty) {
                if (userInfo[userProperty]) {
                  vm.reply[userProperty] = userInfo[userProperty];
                }
              });
            } catch(error) {
              console.error(error);
            }
          }
        });

      },

      updateTags: function() {
        blogService.getAllTags().then(function(response) {
          tagsStore = response.val();

          vm.tags = _.map(vm.posting.tagIds, function(tagId) {
            return _.findWhere(tagsStore, { tagId: tagId });
          });
        });
      },

      updateReplies: function(refresh) {
        refresh = refresh || false;

        return blogService.getAllReplies(refresh).then(function(response) {
          repliesStore = response.val();
          vm.replies = _.chain(repliesStore)
            .where({ postingId: vm.posting.postingId })
            .each(function(reply) {
              reply.content = reply.content.replace(/\n/g, '<br/>');
              reply.isWebmaster = (reply.email && reply.email.toLowerCase() === 'botch@botchthecrab.com');
            })
            .sortBy('posted')
            .value();
        });
      },

      updateTitle: function() {
        globalService.setOfficeDocumentTitle(this.posting.title);
      },

      updateOpenGraphImageMetaTag: function() {
        if (!$openGraphMetaTag.length) { return; }

        const postingContent = vm.posting.content;
        const imageRegExp = /<img .+?src="(.+?)".*?>/gi;
        const postingImages = vm.posting.content.match(imageRegExp);

        if (postingImages && postingImages.length && postingImages[0]) {
          let imageUrl = postingImages[0].replace(imageRegExp, '$1');
          if (imageUrl.charAt(0) === '/') {
            imageUrl = imageUrl.replace(/Z_(.+?)\.gif/, '$1.jpg');
            imageUrl = location.protocol + '//' + location.host + imageUrl;
          }
          $openGraphMetaTag.attr('content', imageUrl);
        } else {
          vm.clearOpenGraphImageMetaTag();
        }
      },

      clearOpenGraphImageMetaTag: function() {
        $openGraphMetaTag.attr('content', '');
      },

      formatPosted: function(posted) {
        return globalService.formatPosted(posted);
      },

      scrollTop: function() {
        globalService.scrollTop();
      },

      handleNewReply: function() {
        if (vm.reply.honeypot) {
          return;
        }

        vm.reply.content = vm.reply.content.trim();
        vm.reply.poster = vm.reply.poster.trim();

        if (vm.reply.website) {
          if (vm.reply.website.indexOf('http') === -1) {
            vm.reply.website = 'https://' + vm.reply.website;
          }
        }

        if (vm.reply.content && vm.reply.poster) {
          vm.savingReply = true;

          blogService.createPostReply(vm.posting, vm.reply).then(function(replyData) {
            vm.reply.content = "";

            vm.updateReplies(true).then(function() {

              window.setTimeout(function() {
                var $newReply = $('#replyId' + replyData.replyId);
                if ($newReply.length) {
                  $('html, body').animate({
                    scrollTop: $newReply.offset().top
                  }, 100);
                }
              }, 250);

            });

            vm.saveUserDetails(vm.reply);
            vm.savingReply = false;
          }, function(error) {
            vm.savingReply = false;
          });
        }
      },

      saveUserDetails: function(replyData) {
        var userInfo = _.pick(replyData, 'poster', 'email', 'website', 'notify');
        cookiesService.setCookie('userInfo', JSON.stringify(userInfo));
      }

    }

  };

</script>
