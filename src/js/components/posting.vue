<style lang="scss">

  .replies {
  	text-align: left;
  	margin: 75px auto;
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

        .reply-time {
        	font-size: 0.9em;
        	letter-spacing: -1px;
        	margin-right: 3px;
        }
      }

      .reply-divider {
      	border-bottom: 1px dashed #666;
      	margin: 25px 0px;
      }

    }
  }


  /* .replies-closed {
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
  } */



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
  			Posted: <span>{{ posting.posted }}</span>
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

      <div class="reply" v-bind:class="reply.isWebmaster ? 'reply-wrapper-botch' : ''" v-for="(reply, index) in replies">
        <div class="reply-body" v-html="reply.content"></div>
        <div class="reply-footer">
          &raquo; Posted
          <span class="reply-time">{{ reply.posted }}</span>
          by <b>{{ reply.poster }}</b>
          <span v-if="reply.isWebmaster"> - WEBMASTER</span>
          <span v-if="!reply.isWebmaster && reply.website">[<a v-bind:href="reply.website" target="_blank">website</a>]</span>
        </div>

        <div class="reply-divider" v-if="index < replies.length - 1"></div>
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
        nextPosting: null

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
          postingsStore = response.val();

          vm.posting = _.findWhere(postingsStore, { postingId: postingId });

          vm.updateTitle();
          vm.updateOpenGraphImageMetaTag();

          var postingIndex = _.indexOf(postingsStore, vm.posting);
          postingsStore = _.sortBy(response.val(), 'posted');
          vm.previousPosting = postingIndex > 0 ? postingsStore[postingIndex - 1] : null;
          vm.nextPosting = postingIndex < postingsStore.length - 1 ? postingsStore[postingIndex + 1] : null;

          blogService.getAllTags().then(function(response) {
            tagsStore = response.val();

            vm.tags = _.map(vm.posting.tagIds, function(tagId) {
              return _.findWhere(tagsStore, { tagId: tagId });
            });
          });

          blogService.getAllReplies().then(function(response) {
            repliesStore = response.val();
            vm.replies = _.chain(repliesStore)
              .where({ postingId: vm.posting.postingId })
              .each(function(reply) {
                reply.isWebmaster = reply.email === 'Botch@BotchTheCrab.com';
              })
              .sortBy('posted')
              .value();
          });

        });

      },

      updateTitle: function() {
        globalService.setOfficeDocumentTitle(this.posting.title);
      },

      updateOpenGraphImageMetaTag() {
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

      scrollTop: function() {
        globalService.scrollTop();
      }

    }

  };

</script>
